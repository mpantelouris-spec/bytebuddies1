/**
 * During palette drag — raycast sockets in screen space and update hover state.
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useUiStore } from '../../store/uiStore.js';
import { pickSocketAtScreen } from '../../utils/socket-screen-pick.js';

export default function SocketDropBridge({
  base,
  slots,
  visibleSlots,
  robotPosition,
  robotScale,
}) {
  const dragPointer = useUiStore((s) => s.dragPointer);
  const draggingPart = useUiStore((s) => s.draggingPart);
  const setHoveredSocket = useUiStore((s) => s.setHoveredSocket);
  const { camera, size } = useThree();

  useFrame(() => {
    if (!dragPointer || !draggingPart || draggingPart.category === 'chassis') {
      if (useUiStore.getState().hoveredSocket) setHoveredSocket(null);
      return;
    }

    const category = draggingPart.category;
    const picked = pickSocketAtScreen({
      pointer: { ...dragPointer, width: size.width, height: size.height },
      camera,
      robotPosition,
      robotScale,
      base,
      visibleSlots,
      dragCategory: category,
      slots,
    });
    const prev = useUiStore.getState().hoveredSocket;
    if (picked !== prev) setHoveredSocket(picked);
  });

  return null;
}
