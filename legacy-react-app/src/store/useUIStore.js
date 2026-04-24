import { create } from 'zustand';
export const useUIStore = create((set) => ({
  synOpen: {},
  addingTo: null,
  editingCol: null,
  priorityMatrixOpen: false,
  exportOpen: false,
  toggleSyn: (clusterId) => set((state) => ({ synOpen: { ...state.synOpen, [clusterId]: !state.synOpen[clusterId] } })),
  setAddingTo: (colId) => set({ addingTo: colId }),
  setEditingCol: (colId) => set({ editingCol: colId }),
  setPriorityMatrixOpen: (open) => set({ priorityMatrixOpen: open }),
  setExportOpen: (open) => set({ exportOpen: open })
}));
