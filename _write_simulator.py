import os, base64

TARGET = os.path.join(os.path.dirname(os.path.abspath(__file__)),
    'src/virtual-robot-designer/studio/SimulatorPage.jsx')

# Content encoded to avoid any shell/heredoc issues
CONTENT_B64 = """
LyoqCiAqIFNpbXVsYXRvclBhZ2UuanN4ICAtIEJ5dGVCdWRkaWVzIFJvYm90IFNpbXVsYXRv
cihDb21wbGV0ZSBSZWJ1aWxkKQogKiBObyBibG9ja2luZyBvdmVybGF5LiBSZWFsIHJvYm90
IGZyb20gYnVpbGRlci4gQnJpZ2h0IFNURUxhYiBhcmVuYS4KICogQ29kZSBibG9ja3MgZXhl
Y3V0ZSB0aGUgY2hpbGQncyBhY3R1YWwgcHJvZ3JhbS4KICovCmltcG9ydCBSZWFjdCwgeyBz
dGF0ZU5ldywgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3Qn
OwppbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7CmltcG9ydCB7IGJ1aWxkUm9ib3RN
b2RlbCB9IGZyb20gJy4uL3NlcnZpY2VzL3N0dWRpby1yb2JvdC1idWlsZGVyLmpzJzsK
"""

# Build the real content directly (no encoding trick needed — write via Python file)
content = '''\
/**
 * SimulatorPage.jsx  - ByteBuddies Robot Simulator (Complete Rebuild)
 * No blocking overlay. Real robot from builder. Bright STEM lab arena.
 * Code blocks execute the child's actual program.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { buildRobotModel } from '../services/studio-robot-builder.js';

const CHALLENGES = [
  { id:'obstacle', name:'Obstacle Course', icon:'\N{CHEQUERED FLAG}', desc:'Navigate obstacles to the finish!', color:'#22c55e', obstacles:10, totalDist:22, difficulty:'Easy' },
  { id:'speedrun',  name:'Speed Run',       icon:'\N{HIGH VOLTAGE SIGN}',    desc:'Beat the clock, full speed!',     color:'#f59e0b', obstacles:5,  totalDist:16, difficulty:'Medium' },
  { id:'maze',      name:'Maze Navigator',  icon:'\N{CYCLONE}', desc:'Find the exit through the maze.',  color:'#8b5cf6', obstacles:18, totalDist:30, difficulty:'Hard' },
  { id:'collect',   name:'Cargo Run',       icon:'\N{PACKAGE}', desc:'Pick up all the cargo boxes!',     color:'#0ea5e9', obstacles:6,  totalDist:20, difficulty:'Medium' },
];

const INIT_STATS = { time:0, dist:0, battery:100, avoided:0, progress:0 };

function getBlockDuration(block) {
  const p = block.paramValues || {};
  switch (block.id) {
    case 'move_forward':  return Math.max(0.4, (p.steps  || 2) * 0.75);
    case 'move_backward': return Math.max(0.4, (p.steps  || 1) * 0.75);
    case 'turn_left':
    case 'turn_right':    return Math.max(0.25, (p.degrees || 90) / 90 * 0.6);
    case 'spin':          return 1.0;
    case 'stop':          return 0.5;
    case 'wait':          return Math.max(0.2, p.seconds || 1);
    case 'fly_up':
    case 'fly_down':      return 0.9;
    case 'scan':          return 1.6;
    case 'if_obstacle':   return 0.7;
    case 'look':          return 1.3;
    case 'if_see_object': return 0.7;
    case 'grab':
    case 'release':       return 0.9;
    case 'drill':         return Math.max(0.5, p.seconds || 2);
    case 'fire_laser':    return 0.7;
    case 'lights_on':
    case 'lights_off':    return 0.3;
    case 'flash':         return Math.max(0.5, (p.times || 3) * 0.3);
    default:              return 0.4;
  }
}

function applyCodeBlock(block, rs, dt, movId) {
  const p = block.paramValues || {};
  const dur = rs.currentDur || 1;
  const spd = movId==='wheels'?1.0:movId==='tracks'?0.8:movId==='legs'?0.65:movId==='hover'?1.1:movId==='flying'?1.4:movId==='jets'?1.8:1.0;
  switch (block.id) {
    case 'move_forward': {
      const d = (p.steps||2)*1.9*spd;
      rs.x += Math.sin(rs.angle)*(d/dur)*dt;
      rs.z += Math.cos(rs.angle)*(d/dur)*dt;
      rs.totalDist += (d/dur)*dt;
      rs.bobPhase = (rs.bobPhase||0)+dt*8;
      break;
    }
    case 'move_backward': {
      const d = (p.steps||1)*1.9*spd;
      rs.x -= Math.sin(rs.angle)*(d/dur)*dt;
      rs.z -= Math.cos(rs.angle)*(d/dur)*dt;
      rs.totalDist += (d/dur)*dt*0.5;
      rs.bobPhase = (rs.bobPhase||0)+dt*6;
      break;
    }
    case 'turn_left':  { rs.angle += ((p.degrees||90)*Math.PI/180)/dur*dt; break; }
    case 'turn_right': { rs.angle -= ((p.degrees||90)*Math.PI/180)/dur*dt; break; }
    case 'spin':       { rs.angle += (Math.PI*2)/dur*dt; break; }
    case 'fly_up':   { rs.y = Math.min(4.5,(rs.y||0)+2.0/dur*dt); break; }
    case 'fly_down': { rs.y = Math.max(0,(rs.y||0)-2.0/dur*dt); break; }
    default: break;
  }
}

function getRobotGroundEffect(movId, bobPhase, t) {
  switch(movId) {
    case 'legs':   return { yOffset:Math.abs(Math.sin(bobPhase*2.5))*0.12, rollZ:0 };
    case 'hover':  return { yOffset:Math.sin(t*1.8)*0.15+0.25, rollZ:Math.sin(t*0.9)*0.04 };
    case 'flying':
    case 'jets':   return { yOffset:Math.sin(t*1.2)*0.1+0.3, rollZ:0 };
    case 'tracks': return { yOffset:0, rollZ:Math.sin(bobPhase*1.5)*0.012 };
    default:       return { yOffset:0, rollZ:Math.sin(bobPhase*1.5)*0.018 };
  }
}

function buildArena(scene, challenge) {
  const g = new THREE.Group();
  g.name = 'arena';

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40,65),
    new THREE.MeshStandardMaterial({ color:0xf0f4ff, roughness:0.3, metalness:0.15 })
  );
  floor.rotation.x = -Math.PI/2; floor.receiveShadow=true; g.add(floor);

  const lineMat = new THREE.LineBasicMaterial({ color:0xdde4ff });
  for (let i=-20;i<=20;i+=2) {
    const h=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-20,0.01,i*1.6),new THREE.Vector3(20,0.01,i*1.6)]);
    const v=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0.01,-32),new THREE.Vector3(i,0.01,22)]);
    g.add(new THREE.Line(h,lineMat)); g.add(new THREE.Line(v,lineMat));
  }

  const wallDefs=[
    {w:40,h:5,d:0.3,x:0,    z:-32,ry:0,          c:0x3b82f6},
    {w:40,h:5,d:0.3,x:0,    z: 22,ry:0,          c:0x10b981},
    {w:65,h:5,d:0.3,x:-20.2,z: -5,ry:Math.PI/2,  c:0x8b5cf6},
    {w:65,h:5,d:0.3,x: 20.2,z: -5,ry:Math.PI/2,  c:0xf59e0b},
  ];
  wallDefs.forEach(w=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w.w,w.h,w.d),
      new THREE.MeshStandardMaterial({color:w.c,roughness:0.45,metalness:0.3,emissive:new THREE.Color(w.c).multiplyScalar(0.07)}));
    m.position.set(w.x,w.h/2,w.z); m.rotation.y=w.ry; m.castShadow=true; m.receiveShadow=true; g.add(m);
  });

  const strMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.2});
  [-16,-10,-4,2,8,14].forEach(z=>{
    const s=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,0.7),strMat);
    s.position.set(-20.05,2.5,z); g.add(s);
    const s2=s.clone(); s2.position.set(20.05,2.5,z); g.add(s2);
  });

  const startM=new THREE.Mesh(new THREE.PlaneGeometry(6,2.5),
    new THREE.MeshStandardMaterial({color:0x22c55e,emissive:0x22c55e,emissiveIntensity:0.3,roughness:0.4}));
  startM.rotation.x=-Math.PI/2; startM.position.set(0,0.015,6); g.add(startM);

  const finM=new THREE.Mesh(new THREE.PlaneGeometry(7,2.5),
    new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:0.45}));
  finM.rotation.x=-Math.PI/2; finM.position.set(0,0.015,-24); g.add(finM);
  const archMat=new THREE.MeshStandardMaterial({color:0xfbbf24,emissive:0xfbbf24,emissiveIntensity:1.4});
  [-2.8,2.8].forEach(x=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,5.5,8),archMat);
    post.position.set(x,2.75,-24); post.castShadow=true; g.add(post);
  });
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,6,8),archMat);
  bar.rotation.z=Math.PI/2; bar.position.set(0,5.5,-24); g.add(bar);

  const oc=[0x3b82f6,0xef4444,0x8b5cf6,0x10b981,0xf59e0b,0xec4899];
  const oPos=[[-1.1,-3],[1.0,-5.5],[-0.6,-8],[1.4,-10.5],[-1.0,-13],[0.5,-15.5],[-1.3,-5],[1.1,-7.5],[-0.4,-11],[0.9,-14],[-0.7,-9],[1.2,-12]];
  oPos.slice(0,challenge?.obstacles||10).forEach(([x,z],i)=>{
    const h=0.55+(i%3)*0.38; const col=oc[i%oc.length];
    const geos=[new THREE.BoxGeometry(0.8,h,0.8),new THREE.CylinderGeometry(0.38,0.38,h,8),new THREE.ConeGeometry(0.42,h+0.5,8)];
    const m=new THREE.Mesh(geos[i%3],new THREE.MeshStandardMaterial({color:col,roughness:0.4,metalness:0.25,emissive:new THREE.Color(col).multiplyScalar(0.07)}));
    m.position.set(x,h/2,z); m.castShadow=true; m.receiveShadow=true; g.add(m);
  });

  [-6,-13,-20].forEach(z=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.09,8,32),
      new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00d9ff,emissiveIntensity:0.9,transparent:true,opacity:0.85}));
    ring.rotation.x=Math.PI/2; ring.position.set(0,0.5,z); ring.name='cp'+z; g.add(ring);
  });

  const labC=[0x1e40af,0x7e22ce,0x065f46,0x9a3412];
  [-14,-7,0,7].forEach((z,i)=>{
    [-18.5,18.5].forEach(x=>{
      const panel=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.9,0.2),
        new THREE.MeshStandardMaterial({color:labC[i%4],roughness:0.3,metalness:0.6,emissive:new THREE.Color(labC[i%4]).multiplyScalar(0.13)}));
      panel.position.set(x,2,z); panel.castShadow=true; g.add(panel);
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.15),
        new THREE.MeshStandardMaterial({color:0x00ff88,emissive:0x00cc66,emissiveIntensity:0.85}));
      screen.position.set(x<0?x+0.15:x-0.15,2,z);
      screen.rotation.y=x<0?Math.PI/2:-Math.PI/2; g.add(screen);
    });
    if(i%2===0) [-16,16].forEach(x=>{
      const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.45,1.1,10),
        new THREE.MeshStandardMaterial({color:0xff8800,roughness:0.6,metalness:0.4}));
      barrel.position.set(x,0.55,z); barrel.castShadow=true; g.add(barrel);
    });
  });

  const ramp=new THREE.Mesh(new THREE.BoxGeometry(4.5,0.18,3.5),
    new THREE.MeshStandardMaterial({color:0xbfdbfe,roughness:0.45,metalness:0.2}));
  ramp.position.set(3.8,0.35,-10); ramp.rotation.z=-0.19; ramp.castShadow=true; ramp.receiveShadow=true; g.add(ramp);

  scene.add(g);
}

function SimCanvas({ robotConfig, robotCode=[], running, onProgress, onFpsUpdate, challenge }) {
  const wrapRef = useRef(null);
  const rendRef = useRef(null);
  const rafRef  = useRef(null);
  const runRef  = useRef(false);
  const fpsRef  = useRef({ frames:0, last:0 });
  const rsRef   = useRef({ x:0,z:5,y:0,angle:Math.PI,step:0,stepTime:0,currentDur:0,totalDist:0,pass:0,maxPasses:1,done:false,t:0,bobPhase:0,battery:100 });

  useEffect(()=>{ runRef.current=running; },[running]);

  useEffect(()=>{
    const el=wrapRef.current;
    if(!el) return;
    const W=Math.max(el.clientWidth,1),H=Math.max(el.clientHeight,1);
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0xe8f0fe);
    scene.fog=new THREE.Fog(0xe8f0fe,32,58);
    const camera=new THREE.PerspectiveCamera(48,W/H,0.1,80);
    camera.position.set(0,4,10); camera.lookAt(0,0.5,0);
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(W,H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
    el.appendChild(renderer.domElement); rendRef.current=renderer;

    scene.add(new THREE.AmbientLight(0xddeeff,0.72));
    const sun=new THREE.DirectionalLight(0xfff8f0,1.6);
    sun.position.set(8,18,10); sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-26; sun.shadow.camera.right=26;
    sun.shadow.camera.top=32;   sun.shadow.camera.bottom=-32;
    sun.shadow.bias=-0.001; scene.add(sun);
    const f1=new THREE.PointLight(0x6699ff,0.8,36); f1.position.set(-10,6,0); scene.add(f1);
    const f2=new THREE.PointLight(0x99ffdd,0.65,30); f2.position.set(10,5,-10); scene.add(f2);

    buildArena(scene,challenge);

    const rs=rsRef.current;
    const robot=buildRobotModel(robotConfig);
    robot.position.set(rs.x,rs.y,rs.z); robot.rotation.y=rs.angle;
    robot.scale.setScalar(1.4);
    robot.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
    scene.add(robot);

    const sensors=robotConfig.sensors||[];
    const bColor={ultrasonic:0x00ffff,lidar:0xff6600,camera:0xffff00,gyro:0x00ff88,'line-sensor':0xff00ff};
    const bLen={ultrasonic:4.5,lidar:7,camera:3.5,gyro:2,'line-sensor':2};
    const beams=sensors.slice(0,4).map((s,i)=>{
      const pts=[new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-(bLen[s]||3.5))];
      const geo=new THREE.BufferGeometry().setFromPoints(pts);
      const mat=new THREE.LineBasicMaterial({color:bColor[s]||0xffffff,transparent:true,opacity:0.75});
      const line=new THREE.Line(geo,mat);
      line.position.set((i-1.5)*0.35,0.65,0); line.visible=false; robot.add(line); return line;
    });

    const code=robotCode;
    const repeatBlock=code.find(b=>b.id==='repeat');
    if(repeatBlock) rs.maxPasses=repeatBlock.paramValues?.times||3;
    const codeBlocks=code.filter(b=>b.id!=='repeat');
    const hasCode=codeBlocks.length>0;
    const movId=robotConfig.movementId||'wheels';

    const onResize=()=>{
      const w=Math.max(el.clientWidth,1),h=Math.max(el.clientHeight,1);
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
    };
    const ro=new ResizeObserver(onResize); ro.observe(el);
    window.addEventListener('resize',onResize);

    const camPos=new THREE.Vector3(0,4,10);
    const camLook=new THREE.Vector3(0,0.5,5);

    let prev=performance.now();
    const tick=(now)=>{
      rafRef.current=requestAnimationFrame(tick);
      const dt=Math.min((now-prev)/1000,0.05); prev=now;

      fpsRef.current.frames++;
      if(now-fpsRef.current.last>1000){
        onFpsUpdate?.(Math.round(fpsRef.current.frames*1000/(now-fpsRef.current.last)));
        fpsRef.current.frames=0; fpsRef.current.last=now;
      }

      if(runRef.current){
        rs.t+=dt; rs.battery=Math.max(0,100-rs.t*0.5);
        if(hasCode){
          if(!rs.done){
            const block=codeBlocks[rs.step];
            if(block){
              if(rs.stepTime===0) rs.currentDur=getBlockDuration(block);
              rs.stepTime+=dt;
              applyCodeBlock(block,rs,dt,movId);
              const sensing=['scan','if_obstacle','look','if_see_object'].includes(block.id);
              beams.forEach((b,i)=>{
                b.visible=sensing;
                if(sensing) b.material.opacity=0.45+Math.sin(rs.t*6+i)*0.3;
              });
              if(rs.stepTime>=rs.currentDur){ rs.step++; rs.stepTime=0; rs.currentDur=0; beams.forEach(b=>b.visible=false); }
            }
            if(rs.step>=codeBlocks.length){
              rs.pass++; if(rs.pass<rs.maxPasses) rs.step=0; else rs.done=true;
            }
          }
        } else {
          const speed=movId==='jets'?3.5:movId==='hover'?2.8:2.2;
          rs.angle=Math.PI+Math.sin(rs.totalDist*0.18)*0.28;
          rs.x+=Math.sin(rs.angle)*speed*dt; rs.z+=Math.cos(rs.angle)*speed*dt;
          rs.totalDist+=speed*dt; rs.bobPhase=(rs.bobPhase||0)+dt*8;
          if(rs.z<=-25) rs.done=true;
        }

        const {yOffset,rollZ}=getRobotGroundEffect(movId,rs.bobPhase||0,rs.t);
        robot.position.set(Math.max(-3.8,Math.min(3.8,rs.x)),yOffset+(rs.y||0),rs.z);
        robot.rotation.y=rs.angle; robot.rotation.z=rollZ;

        const progress=rs.done?100:Math.min(
          hasCode?(rs.pass*codeBlocks.length+rs.step)/(codeBlocks.length*rs.maxPasses)*100
                 :rs.totalDist/(challenge?.totalDist||22)*100, 99);

        onProgress?.({time:rs.t,dist:rs.totalDist,battery:rs.battery,
          avoided:Math.min(Math.floor(rs.totalDist/2.2),challenge?.obstacles||10),
          progress:rs.done?100:progress,done:rs.done,
          execBlock:codeBlocks[rs.step]?.label||null});
        if(rs.done) runRef.current=false;
      } else {
        rs.t+=dt*0.4;
        robot.rotation.y=Math.PI+Math.sin(rs.t*0.7)*0.08;
        const {yOffset}=getRobotGroundEffect(movId,rs.t*4,rs.t);
        robot.position.y=yOffset;
      }

      const rx=robot.position.x,rz=robot.position.z;
      const bx=rx+Math.sin(rs.angle+Math.PI)*7.5;
      const bz=rz+Math.cos(rs.angle+Math.PI)*7.5;
      camPos.lerp(new THREE.Vector3(Math.max(-18,Math.min(18,bx)),4.8,Math.max(-29,Math.min(19,bz))),0.045);
      camLook.lerp(new THREE.Vector3(rx,robot.position.y+0.7,rz),0.065);
      camera.position.copy(camPos); camera.lookAt(camLook);

      scene.traverse(c=>{
        if(c.name&&c.name.startsWith('cp')){
          c.rotation.z+=dt*0.9;
          if(c.material) c.material.emissiveIntensity=0.7+Math.sin(rs.t*3)*0.3;
        }
      });
      renderer.render(scene,camera);
    };
    rafRef.current=requestAnimationFrame(tick);

    return ()=>{
      cancelAnimationFrame(rafRef.current);
      ro.disconnect(); window.removeEventListener('resize',onResize);
      if(el&&renderer.domElement.parentNode===el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[robotConfig,challenge]);

  return <div ref={wrapRef} style={{width:'100%',height:'100%'}} />;
}

function ChallengePanel({ activeChallenge, onSelect, running, stats }) {
  return (
    <div style={{width:196,flexShrink:0,background:'#fff',borderRight:'1px solid #e2e8f0',display:'flex',flexDirection:'column',overflowY:'auto'}}>
      <div style={{padding:'11px 13px 7px',fontSize:10,fontWeight:800,color:'#64748b',textTransform:'uppercase',letterSpacing:0.5,borderBottom:'1px solid #f1f5f9'}}>
        Challenges
      </div>
      {CHALLENGES.map(ch=>{
        const active=ch.id===activeChallenge.id;
        return (
          <button key={ch.id} onClick={()=>!running&&onSelect(ch)} style={{
            display:'flex',flexDirection:'column',gap:2,padding:'9px 13px',
            border:'none',borderLeft:active?('4px solid '+ch.color):'4px solid transparent',
            background:active?(ch.color+'15'):'transparent',
            textAlign:'left',cursor:running&&!active?'default':'pointer',
            borderBottom:'1px solid #f1f5f9',opacity:running&&!active?0.35:1,transition:'all 0.15s',
          }}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:15}}>{ch.icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:'#1e293b'}}>{ch.name}</span>
            </div>
            <div style={{fontSize:10,color:'#94a3b8',marginLeft:21}}>{ch.desc}</div>
            <div style={{display:'flex',gap:5,marginLeft:21,marginTop:2}}>
              <span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:8,background:ch.color+'22',color:ch.color}}>{ch.difficulty}</span>
              {active&&stats.progress>0&&<span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:8,background:'#dbeafe',color:'#1d4ed8'}}>{Math.round(stats.progress)}%</span>}
            </div>
          </button>
        );
      })}
      {running&&(
        <div style={{padding:'9px 13px',marginTop:'auto',borderTop:'1px solid #f1f5f9'}}>
          <div style={{fontSize:9,fontWeight:700,color:'#64748b',marginBottom:3}}>RUNNING...</div>
          <div style={{height:5,background:'#e2e8f0',borderRadius:3,overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:3,background:activeChallenge.color,width:(stats.progress+'%'),transition:'width 0.3s'}} />
          </div>
          <div style={{fontSize:10,color:'#94a3b8',marginTop:3}}>{Math.round(stats.progress)}% complete</div>
        </div>
      )}
    </div>
  );
}

const sl={fontSize:9,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:0.5};
function cBtn(bg){return{flex:1,padding:'9px 0',borderRadius:8,border:'none',background:bg,color:'#fff',fontWeight:800,fontSize:12,cursor:'pointer'};}

function SBar({label,value,color,unit=''}){
  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
        <div style={sl}>{label}</div>
        <div style={{fontSize:11,fontWeight:800,color}}>{Math.round(value)}{unit}</div>
      </div>
      <div style={{height:5,background:'#f1f5f9',borderRadius:3,overflow:'hidden'}}>
        <div style={{height:'100%',borderRadius:3,background:color,width:(Math.max(0,Math.min(100,value))+'%'),transition:'width 0.4s'}} />
      </div>
    </div>
  );
}

function LivePanel({running,paused,stats,robotConfig,onStart,onPause,onStop,execBlock}){
  const movId=robotConfig.movementId||'wheels';
  const sensors=robotConfig.sensors||[];
  const tools=robotConfig.tools||[];
  const battColor=stats.battery>60?'#22c55e':stats.battery>30?'#f59e0b':'#ef4444';
  return(
    <div style={{width:218,flexShrink:0,background:'#fff',borderLeft:'1px solid #e2e8f0',display:'flex',flexDirection:'column',overflowY:'auto'}}>
      <div style={{padding:'11px 13px',borderBottom:'1px solid #f1f5f9',background:'linear-gradient(135deg,#f8faff,#f1f5f9)'}}>
        <div style={{fontSize:13,fontWeight:800,color:'#1e293b'}}>Robot {robotConfig.name||'My Robot'}</div>
        <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{robotConfig.chassisId} {movId}{sensors.length>0&&(' '+sensors.length+' sensors')}</div>
      </div>
      <div style={{padding:'9px 12px',borderBottom:'1px solid #f1f5f9',display:'flex',gap:5}}>
        {!running?(
          <button onClick={()=>onStart?.()} style={{flex:1,padding:'9px 0',borderRadius:8,border:'none',background:'linear-gradient(135deg,#22c55e,#15803d)',color:'#fff',fontWeight:800,fontSize:13,cursor:'pointer'}}>
            Launch
          </button>
        ):paused?(
          <button onClick={onPause} style={cBtn('#3b82f6')}>Resume</button>
        ):(
          <React.Fragment>
            <button onClick={onPause} style={cBtn('#f59e0b')}>Pause</button>
            <button onClick={onStop}  style={cBtn('#ef4444')}>Stop</button>
          </React.Fragment>
        )}
        {!running&&stats.progress>0&&<button onClick={onStop} style={cBtn('#64748b')}>Reset</button>}
      </div>
      <div style={{padding:'10px 13px',display:'flex',flexDirection:'column',gap:9}}>
        <SBar label="Battery" value={stats.battery} color={battColor} unit="%" />
        <div>
          <div style={sl}>Distance</div>
          <div style={{fontSize:17,fontWeight:800,color:'#1e293b'}}>{stats.dist.toFixed(1)}<span style={{fontSize:10,color:'#94a3b8',marginLeft:2}}>m</span></div>
        </div>
        <div>
          <div style={sl}>Time</div>
          <div style={{fontSize:17,fontWeight:800,color:'#1e293b'}}>
            {String(Math.floor(stats.time/60)).padStart(2,'0')}:{String(Math.floor(stats.time%60)).padStart(2,'0')}
          </div>
        </div>
        <div>
          <div style={sl}>Obstacles cleared</div>
          <div style={{fontSize:17,fontWeight:800,color:'#1e293b'}}>{stats.avoided}</div>
        </div>
      </div>
      {running&&execBlock&&(
        <div style={{margin:'0 12px 8px',padding:'6px 10px',borderRadius:8,background:'linear-gradient(135deg,#ede9fe,#ddd6fe)',border:'1px solid #c4b5fd'}}>
          <div style={{fontSize:9,fontWeight:800,color:'#7c3aed',textTransform:'uppercase',letterSpacing:0.5}}>Running</div>
          <div style={{fontSize:11,fontWeight:700,color:'#4c1d95',marginTop:2}}>{execBlock}</div>
        </div>
      )}
      {sensors.length>0&&(
        <div style={{padding:'8px 13px',borderTop:'1px solid #f1f5f9'}}>
          <div style={sl}>Sensors</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:4}}>
            {sensors.map(s=>(
              <span key={s} style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,background:running?'#dcfce7':'#f1f5f9',color:running?'#16a34a':'#64748b',border:'1px solid '+(running?'#86efac':'#e2e8f0')}}>
                {running&&'running '}{s}
              </span>
            ))}
          </div>
        </div>
      )}
      {tools.length>0&&(
        <div style={{padding:'8px 13px',borderTop:'1px solid #f1f5f9'}}>
          <div style={sl}>Tools</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:4}}>
            {tools.map(t=>(<span key={t} style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,background:'#f0f9ff',color:'#0369a1',border:'1px solid #bae6fd'}}>{t}</span>))}
          </div>
        </div>
      )}
      {!running&&stats.progress>=100&&(
        <div style={{margin:'8px 12px 12px',padding:'12px',borderRadius:10,background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',border:'1px solid #86efac',textAlign:'center'}}>
          <div style={{fontSize:26}}>Trophy</div>
          <div style={{fontSize:13,fontWeight:800,color:'#14532d',marginTop:3}}>Challenge Complete!</div>
          <div style={{fontSize:10,color:'#16a34a',marginTop:2}}>{stats.dist.toFixed(1)}m</div>
          <button onClick={()=>onStart?.()} style={{marginTop:8,width:'100%',padding:'7px 0',borderRadius:7,border:'none',background:'#22c55e',color:'#fff',fontWeight:800,fontSize:11,cursor:'pointer'}}>Play Again</button>
        </div>
      )}
    </div>
  );
}

function ActivityFeed({events}){
  const ref=useRef(null);
  useEffect(()=>{if(ref.current) ref.current.scrollLeft=ref.current.scrollWidth;},[events]);
  return(
    <div style={{height:34,background:'#0f172a',borderTop:'1px solid #1e293b',display:'flex',alignItems:'center',padding:'0 12px',gap:0,overflow:'hidden',flexShrink:0}}>
      <div style={{fontSize:9,fontWeight:700,color:'#475569',marginRight:8,whiteSpace:'nowrap'}}>ACTIVITY:</div>
      <div ref={ref} style={{display:'flex',gap:0,overflow:'hidden',flex:1}}>
        {events.slice(-14).map((ev,i)=>(
          <span key={i} style={{fontSize:10,color:i===events.slice(-14).length-1?'#00d9ff':'#475569',fontFamily:'monospace',whiteSpace:'nowrap',padding:'0 7px',borderRight:'1px solid #1e293b'}}>{ev}</span>
        ))}
      </div>
    </div>
  );
}

export default function SimulatorPage({robotConfig,robotCode=[],preflight,onFpsUpdate}){
  const [running,setRunning]=useState(false);
  const [paused,setPaused]=useState(false);
  const [stats,setStats]=useState(INIT_STATS);
  const [activeChallenge,setChallenge]=useState(CHALLENGES[0]);
  const [execBlock,setExecBlock]=useState(null);
  const [activity,setActivity]=useState(['Robot ready','Select a challenge and launch!']);
  const [fps,setFps]=useState(null);
  const simKeyRef=useRef(0);
  const [simKey,setSimKey]=useState(0);
  const prevProgRef=useRef(0);

  const handleFps=useCallback(f=>{setFps(f);onFpsUpdate?.(f);},[onFpsUpdate]);

  const handleProgress=useCallback((data)=>{
    setStats({time:data.time,dist:data.dist,battery:data.battery,avoided:data.avoided,progress:data.progress});
    if(data.execBlock&&data.execBlock!==execBlock){
      setExecBlock(data.execBlock);
      setActivity(a=>[...a,'Running: '+data.execBlock]);
    }
    const cp=Math.floor(data.progress/34);
    if(cp>Math.floor(prevProgRef.current/34)) setActivity(a=>[...a,'Checkpoint '+cp+' reached!']);
    prevProgRef.current=data.progress;
    if(data.done){
      setRunning(false);setPaused(false);setExecBlock(null);
      setActivity(a=>[...a,'Challenge complete!']);
    }
  },[execBlock]);

  const doStart=useCallback((ch)=>{
    const challenge=ch||activeChallenge;
    if(ch) setChallenge(ch);
    setStats(INIT_STATS); prevProgRef.current=0;
    simKeyRef.current++; setSimKey(simKeyRef.current);
    setRunning(true);setPaused(false);setExecBlock(null);
    const cc=robotCode.filter(b=>b.id!=='repeat').length;
    setActivity([
      (robotConfig.name||'Robot')+' launching...',
      'Movement: '+(robotConfig.movementId||'wheels'),
      'Challenge: '+challenge.name,
      cc>0?(cc+' code blocks'):'Auto-navigation mode',
    ]);
  },[activeChallenge,robotConfig,robotCode]);

  const handlePause=useCallback(()=>setPaused(p=>{setActivity(a=>[...a,!p?'Paused':'Resumed']);return !p;}),[]);

  const handleStop=useCallback(()=>{
    setRunning(false);setPaused(false);setStats(INIT_STATS);
    prevProgRef.current=0;simKeyRef.current++;setSimKey(simKeyRef.current);
    setExecBlock(null);setActivity(['Robot ready','Simulation stopped.']);
  },[]);

  const codeCount=robotCode.filter(b=>b.id!=='repeat').length;

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:'#f8faff',overflow:'hidden'}}>
      <div style={{height:42,background:'#fff',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',padding:'0 14px',gap:10,flexShrink:0}}>
        <span style={{fontSize:14,fontWeight:800,color:'#1e293b',flex:1}}>
          {activeChallenge.icon} {activeChallenge.name}
        </span>
        <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:20,
          background:running?(paused?'#fff3cd':'#dcfce7'):'#f1f5f9',
          border:'1px solid '+(running?(paused?'#fbbf24':'#86efac'):'#e2e8f0'),
          fontSize:11,fontWeight:700,color:running?(paused?'#92400e':'#15803d'):'#64748b'}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:running?(paused?'#fbbf24':'#22c55e'):'#94a3b8',display:'inline-block'}} />
          {running?(paused?'Paused':'Simulating'):'Ready'}
        </div>
        {fps!==null&&(
          <div style={{fontSize:10,fontFamily:'monospace',fontWeight:700,color:fps>=50?'#22c55e':fps>=30?'#f59e0b':'#ef4444',background:'#f1f5f9',padding:'3px 7px',borderRadius:6}}>
            {fps} FPS
          </div>
        )}
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden',minHeight:0}}>
        <ChallengePanel activeChallenge={activeChallenge} onSelect={setChallenge} running={running} stats={stats} />

        <div style={{flex:1,position:'relative',overflow:'hidden'}}>
          <SimCanvas
            key={simKey}
            robotConfig={robotConfig}
            robotCode={robotCode}
            running={running&&!paused}
            onProgress={handleProgress}
            onFpsUpdate={handleFps}
            challenge={activeChallenge}
          />
          {running&&(
            <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:'rgba(255,255,255,0.3)'}}>
              <div style={{height:'100%',background:activeChallenge.color,width:(stats.progress+'%'),transition:'width 0.4s',boxShadow:'0 0 8px '+activeChallenge.color}} />
            </div>
          )}
          {running&&!paused&&execBlock&&(
            <div style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',background:'rgba(15,23,42,0.85)',backdropFilter:'blur(8px)',color:'#fff',fontSize:12,fontWeight:700,padding:'6px 16px',borderRadius:20,border:'1px solid rgba(124,58,237,0.6)',pointerEvents:'none',display:'flex',alignItems:'center',gap:7}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#7c3aed',display:'inline-block'}} />
              {execBlock}
            </div>
          )}
          {!running&&stats.progress===0&&(
            <div style={{position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',background:'rgba(255,255,255,0.93)',backdropFilter:'blur(8px)',borderRadius:12,padding:'10px 18px',border:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',zIndex:2}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:'#1e293b'}}>{activeChallenge.icon} {activeChallenge.name}</div>
                <div style={{fontSize:11,color:'#64748b'}}>{codeCount>0?(codeCount+' code blocks ready'):'Auto-navigation will run'}</div>
              </div>
              <button onClick={()=>doStart()} style={{padding:'9px 22px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#22c55e,#15803d)',color:'#fff',fontWeight:900,fontSize:13,cursor:'pointer',whiteSpace:'nowrap',boxShadow:'0 2px 8px rgba(34,197,94,0.4)'}}>
                Launch!
              </button>
            </div>
          )}
        </div>

        <LivePanel running={running} paused={paused} stats={stats} robotConfig={robotConfig} onStart={doStart} onPause={handlePause} onStop={handleStop} execBlock={execBlock} />
      </div>

      <ActivityFeed events={activity} />
    </div>
  );
}
'''

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(content)
print('OK lines=' + str(content.count('\n')))
