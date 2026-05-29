import { useLayoutEffect, useRef } from 'react';
import { enhanceSceneMaterials } from '../../three/pbr-materials.js';

/** Applies env-map boost + shadow flags to robot subtree after mount / design change */
export default function RobotMaterialEnhancer({ children, designKey }) {
  const ref = useRef();

  useLayoutEffect(() => {
    if (ref.current) enhanceSceneMaterials(ref.current, { envBoost: 0.18 });
  }, [designKey]);

  return (
    <group ref={ref}>
      {children}
    </group>
  );
}
