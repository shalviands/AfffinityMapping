import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, UploadCloud, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useSessionStore } from '../../store/useSessionStore';
import { useProjectStore } from '../../store/useProjectStore';

export default function SessionCreate() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const setSession = useSessionStore(s => s.setSession);
  const formData = useSessionStore(s => s.formData);
  const updateFormData = useSessionStore(s => s.updateFormData);
  const step = useSessionStore(s => s.currentStep);
  const setStep = useSessionStore(s => s.setStep);
  const isReplacement = useSessionStore(s => s.isReplacement);
  const replacementData = useSessionStore(s => s.replacementData);
  const currentSession = useSessionStore(s => s.session);
  
  const getProject = useProjectStore(s => s.getProject);
  const addStakeholder = useProjectStore(s => s.addStakeholder);

  const project = getProject(projectId);

  useEffect(() => {
    if (project && !formData.researchQuestion && !isReplacement) {
        updateFormData({ researchQuestion: project.researchQuestion });
    }
    if (project && isReplacement && currentSession) {
        // Sync project question to the replacement session object
        useSessionStore.getState().updateFormData({ researchQuestion: project.researchQuestion });
    }
  }, [project, isReplacement]);

  const handleChange = (e) => updateFormData({ [e.target.name]: e.target.value });
  const handleCheck = (e) => updateFormData({ [e.target.name]: e.target.checked });

  const activeInputMode = isReplacement ? currentSession?.inputMode : formData.inputMode;

  const submitSession = () => {
    if (isReplacement) {
        // Ensure ID is matched to the stakeholder
        const baseUrl = `/project/${projectId}/session/${currentSession.id}`;
        if (currentSession.inputMode === 'record') navigate(`${baseUrl}/record`);
        else if (currentSession.inputMode === 'upload') navigate(`${baseUrl}/upload`);
        else navigate(`${baseUrl}/paste`);
        return;
    }

    // Generate mock ID for NEW stakeholder
    const sessionId = "sess-" + Date.now();
    const sessionData = { id: sessionId, ...formData, status: 'created', createdAt: new Date() };
    setSession(sessionData);
    
    addStakeholder(projectId, {
        name: formData.stakeholderName,
        role: formData.stakeholderRole,
        date: formData.interviewDate,
        sessionId: sessionId
    });
    
    const baseUrl = `/project/${projectId}/session/${sessionId}`;
    if (formData.inputMode === 'record') navigate(`${baseUrl}/record`);
    else if (formData.inputMode === 'upload') navigate(`${baseUrl}/upload`);
    else navigate(`${baseUrl}/paste`);
  };

  const nextStep = () => setStep(Math.min(step + 1, 4));
  const prevStep = () => {
    if (step === 1) navigate(`/project/${projectId}/board`);
    else setStep(Math.max(step - 1, 1));
  };

  const cancelReplacement = () => {
      useSessionStore.getState().resetSession();
      navigate(`/project/${projectId}/board`);
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-[560px] w-full p-8 flex flex-col pt-10">
        
        {/* Progress Pill */}
        {!isReplacement && (
            <div className="flex justify-center mb-8">
                <div className="bg-brand-50 px-3 py-1 rounded-full text-brand-600 text-xs font-semibold uppercase tracking-wide flex items-center justify-center">
                    Step {step} of 4
                </div>
            </div>
        )}

        {isReplacement && (
             <div className="flex justify-center mb-8">
                <div className="bg-teal-50 px-3 py-1 rounded-full text-teal-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center border border-teal-100">
                    Replacement Mode
                </div>
            </div>
        )}

        {step === 1 && (
            <div className="animate-fadeSlideIn">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 uppercase">NEW STAKEHOLDER</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Session Name *</label>
                        <input name="sessionName" value={formData.sessionName} onChange={handleChange} placeholder="Round 2 — Priya Sharma" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 text-sm"/>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stakeholder Name *</label>
                        <input name="stakeholderName" value={formData.stakeholderName} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 text-sm"/>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Role / Occupation</label>
                        <input name="stakeholderRole" value={formData.stakeholderRole} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 text-sm"/>
                     </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sector</label>
                        <select name="sector" value={formData.sector} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 text-sm">
                            <option>Fintech</option><option>Agritech</option><option>Edtech</option><option>Healthtech</option><option>SaaS</option><option>Other</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
                        <select name="stage" value={formData.stage} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 text-sm">
                            <option>Idea</option><option>MVP</option><option>Early traction</option><option>Growth</option>
                        </select>
                     </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => navigate(`/project/${projectId}/board`)} 
                      className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium w-1/3">
                      Cancel
                    </button>
                    <button 
                      disabled={!formData.sessionName || !formData.stakeholderName}
                      onClick={nextStep} 
                      className="w-2/3 bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3 font-medium hover:bg-brand-600 active:scale-95 transition-all">
                      Continue
                    </button>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="animate-fadeSlideIn">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Research Question <span className="text-red-500">*</span></h2>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
                    <p className="text-xs text-blue-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4"/>
                        This question stays pinned on your board to keep analysis focused.
                    </p>
                </div>
                <textarea 
                    name="researchQuestion" 
                    value={formData.researchQuestion} 
                    onChange={handleChange} 
                    placeholder="What stops first-time users from completing their UPI transaction?" 
                    className="w-full h-32 rounded-xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-brand-400 text-sm resize-none"
                />
                
                <div className="mt-4 flex flex-col gap-2">
                    {["Why do users drop off during KYC?", "What is the primary friction point in daily active use?"].map((q, i) => (
                        <button key={i} onClick={() => updateFormData({ researchQuestion: q })} className="text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                            "{q}"
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={prevStep} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium w-1/3">Back</button>
                    <button disabled={!formData.researchQuestion} onClick={nextStep} className="w-2/3 bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3 font-medium hover:bg-brand-600 active:scale-95 transition-all">Continue</button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="animate-fadeSlideIn">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Consent & Compliance</h2>
                <div className="space-y-4">
                     <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" name="consentAudio" checked={formData.consentAudio} onChange={handleCheck} className="mt-1 w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500" />
                        <span className="text-sm text-gray-700">I confirm this stakeholder verbally consented to being recorded.</span>
                     </label>
                     <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" name="consentAI" checked={formData.consentAI} onChange={handleCheck} className="mt-1 w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500" />
                        <span className="text-sm text-gray-700">I confirm this stakeholder is aware their responses will be analysed by AI algorithms.</span>
                     </label>
                </div>

                <div className="mt-8">
                     <label className="block text-xs font-medium text-gray-700 mb-1">Optional: Send consent link</label>
                     <input name="consentLink" placeholder="Phone or email" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-400 text-sm"/>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={prevStep} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium w-1/3">Back</button>
                    <button disabled={!formData.consentAudio || !formData.consentAI} onClick={nextStep} className="w-2/3 bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3 font-medium hover:bg-brand-600 active:scale-95 transition-all">Continue</button>
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="animate-fadeSlideIn">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 uppercase">
                    {isReplacement ? `Replace Recording: ${currentSession?.stakeholderName}` : "Input Mode"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {!isReplacement && (
                        <button onClick={() => updateFormData({ inputMode: 'record' })} className={clsx("flex flex-col items-center text-center p-4 border-2 rounded-xl transition-all h-full", activeInputMode === 'record' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/50')}>
                            <Mic className={clsx("w-6 h-6 mb-2", activeInputMode === 'record' ? 'text-teal-600' : 'text-gray-400')} />
                            <span className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Record Live</span>
                            <span className="text-[10px] text-gray-500 mt-1 uppercase">Directly in INCUBX</span>
                        </button>
                    )}
                    <button onClick={() => updateFormData({ inputMode: 'upload' })} className={clsx("flex flex-col items-center text-center p-4 border-2 rounded-xl transition-all h-full", activeInputMode === 'upload' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50')}>
                        <UploadCloud className={clsx("w-6 h-6 mb-2", activeInputMode === 'upload' ? 'text-violet-600' : 'text-gray-400')} />
                        <span className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Upload File</span>
                        <span className="text-[10px] text-gray-500 mt-1 uppercase">Audio or video</span>
                    </button>
                    <button onClick={() => updateFormData({ inputMode: 'paste' })} className={clsx("flex flex-col items-center text-center p-4 border-2 rounded-xl transition-all h-full", activeInputMode === 'paste' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50')}>
                        <FileText className={clsx("w-6 h-6 mb-2", activeInputMode === 'paste' ? 'text-amber-600' : 'text-gray-400')} />
                        <span className="text-sm font-semibold text-gray-900 uppercase tracking-tight">Paste Text</span>
                        <span className="text-[10px] text-gray-500 mt-1 uppercase">Transcript/notes</span>
                    </button>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={isReplacement ? cancelReplacement : prevStep} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium w-1/3 text-sm">
                        {isReplacement ? "Cancel" : "Back"}
                    </button>
                    <button disabled={!activeInputMode} onClick={submitSession} className="w-2/3 bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3 font-medium hover:bg-brand-600 active:scale-95 transition-all">Start Session</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
