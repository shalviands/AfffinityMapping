import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  name: string;
  sector: string;
  problem_statement?: string;
  created_at: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (name: string, sector: string, problemStatement: string) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ projects: data || [], loading: false });
    }
  },

  addProject: async (name: string, sector: string, problemStatement: string) => {
    const supabase = createClient();
    const { data, error } = await (supabase.from('projects') as any)
      .insert({ name, sector, problem_statement: problemStatement })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }

    set({ projects: [data, ...get().projects] });
    return data;
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    const supabase = createClient();
    const { error } = await (supabase.from('projects') as any)
      .update(data)
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return false;
    }

    set({
      projects: get().projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    });
    return true;
  },
}));
