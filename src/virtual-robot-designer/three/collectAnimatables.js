/** Gather meshes tagged with userData.vrdAnim for the preview loop */
export function collectAnimatables(root) {
  const list = [];
  if (!root) return list;
  root.traverse((obj) => {
    if (obj.userData?.vrdAnim) {
      list.push({ obj, ...obj.userData.vrdAnim });
    }
  });
  return list;
}

export function tagAnim(mesh, type, extra = {}) {
  mesh.userData.vrdAnim = { type, phase: Math.random() * Math.PI * 2, ...extra };
  return mesh;
}
