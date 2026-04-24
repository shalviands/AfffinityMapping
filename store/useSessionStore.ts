import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionData {
  id?: string;
  name: string;
  stakeholder_name: string;
  stakeholder_role?: string;
  interview_date: string;
  interview_method: string;
  sector: string;
  stage: string;
  round_number: number;
  research_question: string;
  sorting_mode: string;
  guided_mode: boolean;
  consent_timestamp?: string | null;
  status?: string;
  project_id?: string;
}

interface SessionState {
  session: SessionData | null;
  currentStep: number;
  formData: SessionData;
  processing: boolean;
  transcript: string;
  cards: any[];
  reviewedCards: any[];
  
  setSession: (session: SessionData | null) => void;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<SessionData>) => void;
  setProcessing: (processing: boolean) => void;
  setTranscript: (transcript: string) => void;
  setCards: (cards: any[]) => void;
  confirmCards: (cards: any[]) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      currentStep: 1,
      processing: false,
      transcript: '',
      cards: [],
      reviewedCards: [],
      formData: {
        name: '',
        stakeholder_name: '',
        stakeholder_role: '',
        interview_date: new Date().toISOString().split('T')[0],
        interview_method: 'In-person',
        sector: 'Fintech',
        stage: 'Idea',
        round_number: 1,
        research_question: '',
        sorting_mode: 'ai-first',
        guided_mode: true,
        consent_timestamp: null,
        project_id: '',
      },

      setSession: (session) => set({ session }),
      setStep: (step) => set({ currentStep: step }),
      setProcessing: (processing) => set({ processing }),
      setTranscript: (transcript) => set({ transcript }),
      setCards: (cards) => set({ cards }),
      confirmCards: (cards) => set({ reviewedCards: cards }),

      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),

      resetSession: () => set({
        session: null,
        currentStep: 1,
        processing: false,
        transcript: '',
        cards: [],
        reviewedCards: [],
        formData: {
          name: '',
          stakeholder_name: '',
          stakeholder_role: '',
          interview_date: new Date().toISOString().split('T')[0],
          interview_method: 'In-person',
          sector: 'Fintech',
          stage: 'Idea',
          round_number: 1,
          research_question: '',
          sorting_mode: 'ai-first',
          guided_mode: true,
          consent_timestamp: null,
          project_id: '',
        },
      }),
    }),
    {
      name: 'incubx-session-state',
      partialize: (state) => ({
        session: state.session,
        currentStep: state.currentStep,
        formData: state.formData,
      }),
    }
  )
);
