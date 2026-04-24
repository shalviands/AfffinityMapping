import React, { useState } from 'react';
import { X, Trash2, FileText, RefreshCw, User, Calendar, Trash, Edit2 } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useBoardStore } from '../../store/useBoardStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function StakeholderManager({ projectId, onClose }) {
  const navigate = useNavigate();
  const getProject = useProjectStore(s => s.getProject);
  const deleteStakeholder = useProjectStore(s => s.deleteStakeholder);
  const purgeStakeholderCards = useBoardStore(s => s.purgeStakeholderCards);
  const updateFormData = useSessionStore(s => s.updateFormData);
  const setStep = useSessionStore(s => s.setStep);
  
  const project = getProject(projectId);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', sector: '', stage: '', date: '' });

  const startEdit = (sh) => {
      setEditingId(sh.id);
      setEditForm({ 
          name: sh.name, 
          role: sh.role, 
          sector: sh.sector || 'Fintech', 
          stage: sh.stage || 'Idea',
          date: sh.date 
      });
  };

  const handleUpdate = (shId) => {
      useProjectStore.getState().updateStakeholder(projectId, shId, editForm);
      setEditingId(null);
  };

  const handleDelete = (sh) => {
      const confirmPurge = window.confirm(`Delete ${sh.name}? \n\nClick OK to also remove all their cards from the board. \nClick Cancel to keep their cards but remove the stakeholder entry.`);
      
      if (confirmPurge) {
          purgeStakeholderCards(sh.sessionId, sh.name);
      }
      deleteStakeholder(projectId, sh.id);
  };

  const handleReplace = (sh) => {
      const confirmReplace = window.confirm(`This will remove all existing cards for ${sh.name} and start a new feedback session for them. Proceed?`);
      if (!confirmReplace) return;

      // 1. Purge old signals
      purgeStakeholderCards(sh.sessionId, sh.name);

      // 2. Setup isolated replacement flow
      useSessionStore.getState().setupReplacementFlow(sh);
      
      onClose();
      navigate(`/project/${projectId}/add-feedback`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Slide-over */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
            <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight uppercase">MANAGE PROJECT VISITS</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Research Archive & Profiles</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {project?.stakeholders?.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-100 rounded-2xl">
                    <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm italic">No stakeholders added to this project yet.</p>
                </div>
            ) : (
                project?.stakeholders?.map((sh) => (
                    <div key={sh.id} className={clsx("bg-white border rounded-2xl p-4 transition-all group", editingId === sh.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-gray-100 hover:border-brand-200 shadow-sm')}>
                         
                         {editingId === sh.id ? (
                             <div className="space-y-3">
                                 <div>
                                     <label className="text-[xs] font-bold text-gray-400 uppercase tracking-widest mb-1 block scale-75 origin-left">Name</label>
                                     <input 
                                        value={editForm.name} 
                                        onChange={(e) => setEditForm(p => ({...p, name: e.target.value}))} 
                                        className="w-full text-sm font-bold border-b border-gray-200 focus:border-brand-500 outline-none pb-1"
                                     />
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                     <div>
                                         <label className="text-[xs] font-bold text-gray-400 uppercase tracking-widest mb-1 block scale-75 origin-left">Role</label>
                                         <input 
                                            value={editForm.role} 
                                            onChange={(e) => setEditForm(p => ({...p, role: e.target.value}))} 
                                            className="w-full text-xs text-gray-700 border-b border-gray-100 focus:border-brand-500 outline-none pb-1"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-[xs] font-bold text-gray-400 uppercase tracking-widest mb-1 block scale-75 origin-left">Sector</label>
                                         <select 
                                            value={editForm.sector} 
                                            onChange={(e) => setEditForm(p => ({...p, sector: e.target.value}))} 
                                            className="w-full text-xs text-gray-500 border-b border-gray-100 focus:border-brand-500 outline-none pb-1 bg-transparent"
                                         >
                                             <option>Fintech</option><option>Agritech</option><option>Edtech</option><option>Healthtech</option><option>SaaS</option><option>Other</option>
                                         </select>
                                     </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                     <div>
                                         <label className="text-[xs] font-bold text-gray-400 uppercase tracking-widest mb-1 block scale-75 origin-left">Stage</label>
                                         <select 
                                            value={editForm.stage} 
                                            onChange={(e) => setEditForm(p => ({...p, stage: e.target.value}))} 
                                            className="w-full text-xs text-gray-500 border-b border-gray-100 focus:border-brand-500 outline-none pb-1 bg-transparent"
                                         >
                                             <option>Idea</option><option>MVP</option><option>Early traction</option><option>Growth</option>
                                         </select>
                                     </div>
                                     <div>
                                         <label className="text-[xs] font-bold text-gray-400 uppercase tracking-widest mb-1 block scale-75 origin-left">Date</label>
                                         <input 
                                            type="date"
                                            value={editForm.date} 
                                            onChange={(e) => setEditForm(p => ({...p, date: e.target.value}))} 
                                            className="w-full text-xs text-gray-500 border-b border-gray-100 focus:border-brand-500 outline-none pb-1"
                                         />
                                     </div>
                                 </div>
                                 <div className="flex gap-2 pt-2">
                                     <button onClick={() => handleUpdate(sh.id)} className="flex-1 bg-brand-500 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-brand-600 uppercase tracking-widest shadow-sm">Save Profile</button>
                                     <button onClick={() => setEditingId(null)} className="px-3 bg-gray-100 text-gray-600 text-[10px] font-bold py-2 rounded-lg hover:bg-gray-200 uppercase tracking-widest">Cancel</button>
                                 </div>
                             </div>
                         ) : (
                             <>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
                                            {sh.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                {sh.name}
                                                <button onClick={() => startEdit(sh)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all">
                                                    <Edit2 className="w-3 h-3 text-gray-400" />
                                                </button>
                                            </h4>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{sh.role || 'Stakeholder'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDelete(sh)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Stakeholder">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                 <div className="flex flex-wrap items-center gap-2 mb-4 ml-1">
                                     <div className="flex items-center gap-1 font-bold text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">
                                         <Calendar className="w-2.5 h-2.5" /> {sh.date}
                                     </div>
                                     {sh.sector && (
                                         <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 text-[9px] font-bold uppercase tracking-tighter">
                                             {sh.sector}
                                         </div>
                                     )}
                                     {sh.stage && (
                                         <div className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded border border-teal-100 text-[9px] font-bold uppercase tracking-tighter">
                                             {sh.stage}
                                         </div>
                                     )}
                                 </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => setSelectedTranscript(sh)}
                                        disabled={!sh.transcript}
                                        className="flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 disabled:opacity-40 transition-colors border border-slate-100 shadow-sm"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> View Reader
                                    </button>
                                    <button 
                                        onClick={() => handleReplace(sh)}
                                        className="flex items-center justify-center gap-2 py-2 bg-teal-50 text-teal-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-teal-100 transition-colors border border-teal-100 shadow-sm"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Replace
                                    </button>
                                </div>
                             </>
                         )}
                    </div>
                ))
            )}
        </div>

        {/* Transcript Preview Overlay */}
        {selectedTranscript && (
            <div className="absolute inset-0 bg-white z-20 flex flex-col animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedTranscript(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                        <h3 className="font-bold text-gray-900 text-lg">Transcript: {selectedTranscript.name}</h3>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedTranscript.transcript || "No transcript archived for this stakeholder."}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={() => setSelectedTranscript(null)} className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
                        Close Reader
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
