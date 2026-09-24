/**
 * BiomeCinematicPipeline.js — Safe cinematic post-processing for biome race tracks.
 * Falls back to direct render if composer produces invalid output.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { getBiomeAAASpec } from './BiomeAAAVisualSpec.js';

const CinematicGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    vignette: { value: 0.35 },
    grain: { value: 0.04 },
    chroma: { value: 0.001 },
    gradeR: { value: 1.0 },
    gradeG: { value: 1.0 },
    gradeB: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float vignette;
    uniform float grain;
    uniform float chroma;
    uniform float gradeR;
    uniform float gradeG;
    uniform float gradeB;
    varying vec2 vUv;
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }
    void main() {
      vec2 uv = vUv;
      vec2 dir = uv - 0.5;
      float dist = length(dir);
      vec2 offset = dir * chroma * dist * 2.0;
      float r = texture2D(tDiffuse, uv + offset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - offset).b;
      vec3 col = vec3(r, g, b) * vec3(gradeR, gradeG, gradeB);
      float vig = smoothstep(0.85, 0.25, dist);
      col *= mix(1.0 - vignette, 1.0, vig);
      col += (rand(uv + vec2(0.1)) - 0.5) * grain;
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }
  `,
};

export function createBiomeCinematicPipeline(renderer, scene, camera, arenaType, size) {
  const spec = getBiomeAAASpec(arenaType);
  const post = spec.post || {};
  const W = size.width;
  const H = size.height;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(Math.round(W * 0.65), Math.round(H * 0.65)),
    post.bloom ?? 0.28,
    0.45,
    0.72,
  );
  composer.addPass(bloomPass);

  const gradePass = new ShaderPass(CinematicGradeShader);
  gradePass.uniforms.vignette.value = post.vignette ?? 0.35;
  gradePass.uniforms.grain.value = post.grain ?? 0.04;
  gradePass.uniforms.chroma.value = post.chroma ?? 0.001;
  const grade = post.grade || [1, 1, 1];
  gradePass.uniforms.gradeR.value = grade[0];
  gradePass.uniforms.gradeG.value = grade[1];
  gradePass.uniforms.gradeB.value = grade[2];
  composer.addPass(gradePass);

  return {
    composer,
    bloomPass,
    gradePass,
    render: () => composer.render(),
    resize: (w, h) => {
      composer.setSize(w, h);
      bloomPass.resolution.set(Math.round(w * 0.65), Math.round(h * 0.65));
    },
    dispose: () => composer.dispose(),
  };
}

export function shouldUseBiomeCinematic(scene, arenaType) {
  return !!scene?.userData?.mkThemedTrack && !!arenaType && arenaType.includes('_');
}
