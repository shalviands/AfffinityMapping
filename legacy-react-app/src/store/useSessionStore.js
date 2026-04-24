import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSessionStore = create(
  persist(
    (set) => ({
      session: null,
      processing: false,
      processingLog: [],
      transcript: '',
      audioBlob: null,
      audioUrl: null,
      cards: [],
      reviewedCards: [],
      
      // Persistent Form State for SessionCreate
      isReplacement: false,
      currentStep: 1,
      formData: {
        sessionName: '', stakeholderName: '', stakeholderRole: '',
        interviewDate: new Date().toISOString().split('T')[0], interviewMethod: 'In-person',
        sector: 'Fintech', stage: 'Idea', roundNumber: 1,
        researchQuestion: '',
        consentAudio: false, consentAI: false, consentLink: '',
        consentTimestamp: null,
        inputMode: '', sortingMode: 'AI-First', guidedMode: true
      },
      replacementData: null,

      setSession: (session) => set({ session }),
      setTranscript: (transcript) => set({ transcript }),
      setCards: (cards) => set({ cards }),
      confirmCards: (cards) => set({ reviewedCards: cards }),
      setProcessing: (processing) => set({ processing }),
      setStep: (step) => set({ currentStep: step }),

      updateFormData: (data) => set(state => {
          let updatedData = { ...data };
          if ((data.consentAudio === true || data.consentAI === true) && !state.formData.consentTimestamp) {
              updatedData.consentTimestamp = new Date().toISOString();
          }

          if (state.isReplacement) {
              return { session: { ...state.session, ...updatedData } };
          }
          return { formData: { ...state.formData, ...updatedData } };
      }),

      // Helpers to switch flows
      startNewStakeholderFlow: () => set(state => ({ 
          isReplacement: false, 
          currentStep: 1,
          formData: {
            sessionName: '', stakeholderName: '', stakeholderRole: '',
            interviewDate: new Date().toISOString().split('T')[0], interviewMethod: 'In-person',
            sector: 'Fintech', stage: 'Idea', roundNumber: 1,
            researchQuestion: state.formData.researchQuestion,
            consentAudio: false, consentAI: false, consentLink: '',
            inputMode: '', sortingMode: 'AI-First', guidedMode: true
          }
      })),

      setupReplacementFlow: (stakeholder) => set({
          isReplacement: true,
          currentStep: 4, 
          replacementData: stakeholder,
          session: {
              id: stakeholder.sessionId || `rep-${Date.now()}`,
              stakeholderName: stakeholder.name,
              stakeholderRole: stakeholder.role,
              researchQuestion: '', // Will be updated in component
          }
      }),
      
      resetSession: () => set({ 
        session: null, 
        processing: false, 
        processingLog: [], 
        transcript: '', 
        cards: [], 
        reviewedCards: [],
        currentStep: 1,
        isReplacement: false,
        formData: {
          sessionName: '', stakeholderName: '', stakeholderRole: '',
          interviewDate: new Date().toISOString().split('T')[0], interviewMethod: 'In-person',
          sector: 'Fintech', stage: 'Idea', roundNumber: 1,
          researchQuestion: '',
          consentAudio: false, consentAI: false, consentLink: '',
          inputMode: '', sortingMode: 'AI-First', guidedMode: true
        }
      }),
    }),
    {
      name: 'incubx-session-state',
      // Manual partialization to ignore binary blobs or large transient UI state
      partialize: (state) => ({ 
          formData: state.formData,
          session: state.session,
          cards: state.cards,
          currentStep: state.currentStep,
          isReplacement: state.isReplacement
      }),
    }
  )
);
