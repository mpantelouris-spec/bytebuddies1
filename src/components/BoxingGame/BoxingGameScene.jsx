/**
 * BoxingGameScene — Three.js arena + skeletal Striker vs Training Dummy.
 */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
  buildFightingArena, alignFighterToRingSurface, RING_SURFACE_Y, PLAYER_X, ENEMY_X,
} from '../../virtual-robot-designer/studio/FightingArena.js';
import { setupCombatEnvironment } from '../../virtual-robot-designer/services/art-direction.js';
import { createStrikerCharacter, createDummyCharacter } from './BoxingGameCharacter.js';
import { resolveSkeletalAnim } from './BoxingGameAnimations.js';
import { BOXING_CHALLENGE } from './boxingGameConstants.js';
import { syncFromCombatState } from './boxingGameMechanics.js';
import { useBoxingGameStore } from './BoxingGameState.js';
import { useBoxingGameInput } from './BoxingGameInput.js';
import { spawnGameHitBurst, spawnBlockSpark, spawnKnockdownDust, flashViewport } from './BoxingGameEffects.js';
import { playCombatActionSound } from '../../virtual-robot-designer/studio/fighting-combat-audio.js';
import { BoxingGameUI } from './BoxingGameUI.jsx';

export default function BoxingGameScene({
  robotName = 'STRIKER', running = false, onStart, onReset,
}) {
  const mountRef = useRef(null);
  const combatRef = useRef(null);
  const playerCharRef = useRef(null);
  const enemyCharRef = useRef(null);
  const rafRef = useRef(0);
  const prevHpRef = useRef({ player: 1000, enemy: 1000 });
  const lastHitKeyRef = useRef('');
  const runningRef = useRef(running);
  runningRef.current = running;
  const store = useBoxingGameStore;

  useBoxingGameInput(combatRef, store, { enabled: () => runningRef.current });

  useEffect(() => {
    store.getState().setCombatBridge({
      current: {
        resetKnockdown: () => {
          const c = combatRef.current;
          const s = c?.getState?.();
          if (s) {
            s.knockdown = false;
            s.enemyKnockdownTimer = 0;
          }
          playerCharRef.current?.playAnimation('standUp');
        },
        clearOpponentKnockdown: () => {
          const c = combatRef.current;
          const s = c?.getState?.();
          if (s) {
            s.enemyKnockdown = false;
            s.enemyKnockdownTimer = 0;
          }
          store.getState().standUp('opponent');
          enemyCharRef.current?.playAnimation('standUp');
        },
      },
    });
  }, [store]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return undefined;

    const W = el.clientWidth || 800;
    const H = el.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'boxing-game-canvas';
    el.appendChild(renderer.domElement);

    const combat = buildFightingArena(scene, { ...BOXING_CHALLENGE }, 'striker');
    combatRef.current = combat;
    setupCombatEnvironment(scene);

    // Replace procedural meshes with skeletal rig fighters
    const oldEnemy = scene.userData.enemyMesh;
    if (oldEnemy) scene.remove(oldEnemy);

    const playerChar = createStrikerCharacter();
    const enemyChar = createDummyCharacter();
    playerCharRef.current = playerChar;
    enemyCharRef.current = enemyChar;

    const player = playerChar.getObject3D();
    const enemy = enemyChar.getObject3D();
    player.position.set(PLAYER_X, 0, 0);
    player.rotation.y = Math.PI / 2;
    enemy.position.set(ENEMY_X, 0, 0);
    enemy.rotation.y = -Math.PI / 2;
    alignFighterToRingSurface(player, RING_SURFACE_Y);
    alignFighterToRingSurface(enemy, RING_SURFACE_Y);
    enemy.userData.groundY = enemy.position.y;
    scene.add(player);
    scene.add(enemy);
    scene.userData.enemyMesh = enemy;
    combat.setPlayerMesh?.(player);
    combat.setEnemyMesh?.(enemy);

    const camPreset = scene.userData.combatCamPreset || {
      position: new THREE.Vector3(0, 3, -8),
      lookAt: new THREE.Vector3(0, 1, 0),
      fov: 60,
    };
    let shake = 0;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(W * 0.75, H * 0.75), 0.42, 0.5, 0.5));
    composer.addPass(new OutputPass());

    const clock = new THREE.Clock();
    let lastSync = {};

    function syncCharacterAnims(cState) {
      const pc = playerCharRef.current;
      const ec = enemyCharRef.current;
      if (!pc || !ec) return;
      const st = store.getState();

      if (cState.betweenRounds) {
        pc.playAnimation('idle');
        ec.playAnimation('idle');
        return;
      }

      if (!pc.isAnimLocked()) {
        if (st.isPlayerKnockedDown) pc.playAnimation('knockdown');
        else if (cState.blocking) pc.playAnimation('block');
        else if (cState.playerCurrentAction) pc.playAnimation(resolveSkeletalAnim(cState.playerCurrentAction));
        else if (pc.currentAnim !== 'idle') pc.playAnimation('idle');
      }

      if (!ec.isAnimLocked()) {
        if (st.isOpponentKnockedDown || cState.enemyKnockdown) ec.playAnimation('knockdown');
        else if (cState.enemyCurrentAction) ec.playAnimation(resolveSkeletalAnim(cState.enemyCurrentAction));
        else if (ec.currentAnim !== 'idle') ec.playAnimation('idle');
      }
    }

    function recordHitIfNew(cState, target) {
      const isPlayerHit = target === 'enemy';
      const hpKey = isPlayerHit ? 'enemy' : 'player';
      const action = isPlayerHit ? cState.playerCurrentAction : cState.enemyCurrentAction;
      if (!action) return;
      const hpNow = isPlayerHit ? cState.enemyHp : cState.playerHp;
      const hpPrev = prevHpRef.current[hpKey];
      if (hpNow >= hpPrev) return;
      const blocked = !isPlayerHit && !!cState.blocking;
      const hitKey = `${hpKey}:${hpNow}:${action}:${Math.floor(cState.t || 0)}`;
      if (lastHitKeyRef.current === hitKey) return;
      lastHitKeyRef.current = hitKey;

      store.getState().recordHit({
        actionId: action,
        blocked,
        attacker: isPlayerHit ? 'player' : 'opponent',
      });

      const hitX = isPlayerHit ? (cState.enemyX ?? 1.5) : (cState.playerMeshX ?? -1.5);
      const hitY = 1.25;

      if (blocked) {
        spawnBlockSpark(scene, hitX, hitY, 0);
        flashViewport(el, 0.03, '100,200,255');
        shake = Math.max(shake, 0.04);
      } else {
        const tier = spawnGameHitBurst(scene, hitX, hitY, 0, action, false);
        flashViewport(el, tier.flash);
        shake = Math.max(shake, tier.shake);
        playCombatActionSound(action);
        if (isPlayerHit) {
          enemyCharRef.current?.playAnimation('hit', { force: true });
        } else {
          playerCharRef.current?.playAnimation('hit', { force: true });
        }
      }
      prevHpRef.current[hpKey] = hpNow;
    }

    function tick() {
      rafRef.current = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      scene.userData.movers?.forEach((m) => m.update?.(t, dt));

      const cState = combat.getState?.() || {};
      const st = store.getState();

      const pc = playerCharRef.current;
      const ec = enemyCharRef.current;
      pc?.update(dt);
      ec?.update(dt);

      if (runningRef.current) {
        st.updateTime(dt);
        const snap = syncFromCombatState(cState, lastSync);
        if (snap) {
          st.syncCombat(snap, cState);
          lastSync = snap;
        }

        syncCharacterAnims(cState);

        recordHitIfNew(cState, 'enemy');
        recordHitIfNew(cState, 'player');

        const bs = store.getState();
        if (bs.isOpponentKnockedDown && bs.opponentKnockdownCount === 1) {
          spawnKnockdownDust(scene, cState.enemyX ?? 1.5, 0);
          shake = Math.max(shake, 0.3);
        }
        if (bs.isOpponentKnockedDown && bs.opponentKnockdownCount >= 6 && bs.opponentKnockdownCount < 10) {
          if (Math.random() < dt * 0.35) {
            bs._combatBridge?.current?.clearOpponentKnockdown?.();
          }
        }

        if (player && typeof cState.playerMeshX === 'number') {
          player.position.x += (cState.playerMeshX - player.position.x) * Math.min(1, dt * 4);
          player.position.z += ((cState.playerZ || 0) - player.position.z) * Math.min(1, dt * 3);
          player.rotation.y = cState.playerFaceAngle ?? Math.PI / 2;
        }
        if (enemy && typeof cState.enemyMeshX === 'number') {
          enemy.position.x += (cState.enemyMeshX - enemy.position.x) * Math.min(1, dt * 4);
          enemy.position.z += ((cState.enemyZ || 0) - enemy.position.z) * Math.min(1, dt * 3);
          enemy.rotation.y = cState.enemyFaceAngle ?? -Math.PI / 2;
        }

        if (st.screenShake > 0) shake = Math.max(shake, st.screenShake);
      }

      shake = Math.max(0, shake - dt * 2);
      camera.position.copy(camPreset.position);
      camera.position.x += (Math.random() - 0.5) * shake * 0.2;
      camera.position.y += (Math.random() - 0.5) * shake * 0.15;
      camera.lookAt(camPreset.lookAt);
      camera.fov = camPreset.fov ?? 50;
      camera.updateProjectionMatrix();

      composer.render();
    }
    tick();

    const onResize = () => {
      const w = el.clientWidth || 800;
      const h = el.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      combatRef.current = null;
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [store]);

  useEffect(() => {
    if (running) {
      combatRef.current?.reset?.();
      prevHpRef.current = { player: 1000, enemy: 1000 };
      lastHitKeyRef.current = '';
      store.getState().startMatch();
    }
  }, [running, store]);

  return (
    <div className="boxing-game-root">
      <div ref={mountRef} className="boxing-game-viewport" />
      <BoxingGameUI
        robotName={robotName}
        running={running}
        onStart={onStart}
        onReset={onReset}
      />
    </div>
  );
}

export { BoxingGameScene };
