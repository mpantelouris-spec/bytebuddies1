/** Per-frame updates for tagged robot parts and scene accents */
export function animatePreviewFrame(animatables, now, dt) {
  animatables.forEach(({ obj, type, phase = 0, base = 0.5, amp = 0.4, speed = 1 }) => {
    const t = now * 0.004 + phase;
    switch (type) {
      case 'pulse':
        if (obj.material?.emissiveIntensity !== undefined) {
          obj.material.emissiveIntensity = base + Math.sin(t * 2.2) * amp;
        }
        break;
      case 'shell-pulse':
        if (obj.material?.opacity !== undefined) {
          obj.material.opacity = base + Math.sin(t * 1.8) * amp;
        }
        break;
      case 'outline-flicker':
        if (obj.material?.opacity !== undefined) {
          obj.material.opacity = 0.55 + Math.sin(t * 3.5) * 0.35;
        }
        break;
      case 'chassis-breathe':
        if (obj.material?.emissiveIntensity !== undefined) {
          obj.material.emissiveIntensity = base + Math.sin(t * 1.4) * amp;
        }
        break;
      case 'spin-y':
        obj.rotation.y += dt * speed;
        break;
      case 'chaos-spin':
        obj.rotation.x += dt * 2.2;
        obj.rotation.y += dt * 3.1;
        obj.position.y += Math.sin(t * 2) * 0.002;
        break;
      case 'shield-pulse': {
        const s = 1 + Math.sin(t * 2) * 0.06;
        obj.scale.set(s, s, s);
        if (obj.material?.opacity !== undefined) {
          obj.material.opacity = 0.08 + Math.sin(t * 1.5) * 0.06;
        }
        break;
      }
      case 'spark-orbit': {
        const pos = obj.geometry?.attributes?.position;
        if (!pos) break;
        const { radius = 1, n = 24 } = obj.userData.vrdAnim;
        for (let i = 0; i < n; i += 1) {
          const a = (i / n) * Math.PI * 2 + t * 3;
          const y = Math.sin(a * 2 + phase) * 0.25;
          pos.setXYZ(i, Math.cos(a) * radius, y, Math.sin(a) * radius);
        }
        pos.needsUpdate = true;
        break;
      }
      default:
        break;
    }
  });
}
