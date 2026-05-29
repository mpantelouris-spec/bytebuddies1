import { create } from 'zustand';

/** UI-only state: drag, hover, mode — robot config stays in robotStore */
export const useUiStore = create((set) => ({
  selectedPart: null,
  draggingPart: null,
  hoveredSocket: null,
  dragPointer: null,
  dragOverViewport: false,
  snapBurst: false,
  snapPulseSlot: null,

  setSelectedPart: (part) => set({ selectedPart: part }),
  setDraggingPart: (part) => set({ draggingPart: part }),
  setHoveredSocket: (socketId) => set({ hoveredSocket: socketId }),
  setDragPointer: (pointer) => set({ dragPointer: pointer }),
  setDragOverViewport: (on) => set({ dragOverViewport: on }),
  setSnapPulseSlot: (slotId) => set({ snapPulseSlot: slotId }),
  triggerSnapBurst: () => {
    set({ snapBurst: true });
    setTimeout(() => set({ snapBurst: false }), 650);
  },
  clearDragState: () => set({
    draggingPart: null,
    hoveredSocket: null,
    dragPointer: null,
    dragOverViewport: false,
  }),
}));
