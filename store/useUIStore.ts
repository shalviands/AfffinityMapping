import { create } from 'zustand';

interface UIState {
  synOpen: Record<string, boolean>;
  addingTo: string | null;
  editingCol: string | null;
  priorityMatrixOpen: boolean;
  exportOpen: boolean;
  
  toggleSyn: (clusterId: string) => void;
  setAddingTo: (colId: string | null) => void;
  setEditingCol: (colId: string | null) => void;
  setPriorityMatrixOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  synOpen: {},
  addingTo: null,
  editingCol: null,
  priorityMatrixOpen: false,
  exportOpen: false,
  
  toggleSyn: (clusterId) => set((state) => ({ 
    synOpen: { ...state.synOpen, [clusterId]: !state.synOpen[clusterId] } 
  })),
  setAddingTo: (colId) => set({ addingTo: colId }),
  setEditingCol: (colId) => set({ editingCol: colId }),
  setPriorityMatrixOpen: (open) => set({ priorityMatrixOpen: open }),
  setExportOpen: (open) => set({ exportOpen: open })
}));
