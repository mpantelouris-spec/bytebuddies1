/**
 * Soft studio lighting — controlled contrast, no blow-out.
 */
import React from 'react';

export default function WorkshopSceneLighting() {
  return (
    <>
      <ambientLight intensity={0.42} color="#f8fafc" />
      <hemisphereLight intensity={0.55} color="#ffffff" groundColor="#c5d0dc" />
      <directionalLight
        position={[4, 9, 5]}
        intensity={1.05}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0002}
        color="#fffef8"
      />
      <directionalLight position={[-5, 5, -2]} intensity={0.32} color="#b8d4f0" />
      <directionalLight position={[0, 4, -6]} intensity={0.18} color="#e8f0f8" />
      <pointLight position={[2, 3, 3]} intensity={0.22} color="#00d9ff" distance={12} decay={2} />
    </>
  );
}
