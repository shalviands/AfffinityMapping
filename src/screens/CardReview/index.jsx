import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Scissors, EyeOff, Trash2, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { useBoardStore } from '../../store/useBoardStore';
import { useProjectStore } from '../../store/useProjectStore';
import SplitCardModal from './SplitCardModal';
import clsx from 'clsx';

export default function CardReview() {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const session = useSessionStore(s => s.session);
  const cards = useSessionStore(s => s.cards);
  const confirmCards = useSessionStore(s => s.confirmCards);
  const resetSession = useSessionStore(s => s.resetSession);
  
  const mergeSessionCards = useBoardStore(s => s.mergeSessionCards);
  const getProject = useProjectStore(s => s.getProject);
  const project = getProject(projectId);
  
  // Local active list to manage deletes/edits safely
  const [activeCards, setActiveCards] = useState([]);

  // Sync session store to local state
  React.useEffect(() => {
    setActiveCards([...cards]);
  }, [cards]);

  const [splitCard, setSplitCard] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const audioUrl = useSessionStore(s => s.audioUrl);
  const [speakerMap, setSpeakerMap] = useState({});
  const [showIdentify, setShowIdentify] = useState(false);

  // Pagination (Issue #11)
  const [page, setPage] = useState(0);
  const CARDS_PER_PAGE = 20;
  const totalPages = Math.ceil(activeCards.length / CARDS_PER_PAGE);
  const pageCards = activeCards.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  // Initialize speaker map from cards
  React.useEffect(() => {
     const uniqueSpeakers = [...new Set(activeCards.map(c => c.speaker))];
     const map = {};
     uniqueSpeakers.forEach(s => {
         map[s] = speakerMap[s] || s;
     });
     setSpeakerMap(map);
  }, [activeCards]);

  const removeCard = (cardId) => {
      setActiveCards(p => p.filter(c => c.id !== cardId));
  };

  const startEditing = (card) => {
      setEditingId(card.id);
      setEditText(card.text);
  };

  const saveEdit = (cardId) => {
      setActiveCards(p => p.map(c => c.id === cardId ? { ...c, text: editText } : c));
      setEditingId(null);
  };

  const updateSpeakerName = (oldName, newName) => {
      setSpeakerMap(prev => ({ ...prev, [oldName]: newName }));
  };

  const handleSplit = (parentId, newCards) => {
      setActiveCards(prev => {
          const index = prev.findIndex(c => c.id === parentId);
          if (index === -1) return prev;
          const updated = [...prev];
          updated.splice(index, 1, ...newCards);
          return updated;
      });
      setSplitCard(null);
  };

  const handleConfirm = () => {
      // Map speaker names in activeCards before saving
      const finalCards = activeCards.map(c => ({
          ...c,
          speaker: speakerMap[c.speaker] || c.speaker
      }));

      const currentTranscript = useSessionStore.getState().transcript;
      const stakeholder = project?.stakeholders?.find(s => s.sessionId === session?.id);
      
      if (stakeholder) {
          useProjectStore.getState().updateStakeholder(projectId, stakeholder.id, { 
              transcript: currentTranscript,
              name: speakerMap[session?.stakeholderName] || session?.stakeholderName 
          });
      }

      confirmCards(finalCards);
      mergeSessionCards(finalCards, speakerMap[session?.stakeholderName] || session?.stakeholderName || 'New Stakeholder', session?.id);
      resetSession();
      navigate(`/project/${projectId}/board`);
  };

  const playSample = () => {
      if (!audioUrl) return;
      const audio = new Audio(audioUrl);
      audio.currentTime = 0;
      audio.play();
      // Stop after 10 seconds
      setTimeout(() => audio.pause(), 10000);
  };

  return (
    <div className="flex flex-col h-full bg-canvas overflow-hidden">
      {splitCard && (
        <SplitCardModal 
            card={splitCard} 
            onClose={() => setSplitCard(null)} 
            onSplit={handleSplit} 
        />
      )}
      
      <div className="bg-brand-500 text-white p-6 shadow-sm z-10 flex-shrink-0 sticky top-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                  <div className="flex items-center gap-4">
                      <button 
                          onClick={() => navigate(-1)}
                          className="p-2 text-brand-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Back to Processing"
                      >
                          <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h1 className="text-lg font-bold tracking-tight mb-1">Pre-Clustering Review</h1>
                  </div>
                  <p className="text-brand-100 text-sm">
                      Research Question: <span className="italic font-medium text-white">{session?.researchQuestion || 'What stops first-time users from completing their UPI transaction?'}</span>
                  </p>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setShowIdentify(!showIdentify)}
                    className={clsx("px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-2", showIdentify ? "bg-white text-brand-600 border-white" : "text-white border-white/30 hover:bg-white/10")}
                 >
                    {showIdentify ? 'Close Identity Manager' : 'Identify Speakers'}
                 </button>
                 <span className="bg-brand-600 px-3 py-1 rounded-full text-xs font-semibold">{activeCards.length} cards extracted</span>
                 <button className="bg-white text-brand-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-50" onClick={() => navigate(`/project/${projectId}/board`)}>Skip Review</button>
              </div>
          </div>
      </div>

      {showIdentify && (
          <div className="bg-brand-600 border-t border-brand-400 p-4 animate-slideDown">
              <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Speaker Identity Manager</h3>
                    {audioUrl && (
                        <button onClick={playSample} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white font-bold flex items-center gap-2 uppercase">
                            ▶ Play Voice Sample
                        </button>
                    )}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.keys(speakerMap).map(s => (
                        <div key={s} className="bg-white/10 border border-white/20 p-2 rounded-lg flex flex-col gap-1">
                            <span className="text-[10px] text-brand-200 font-bold uppercase">{s}</span>
                            <input 
                                value={speakerMap[s]}
                                onChange={(e) => updateSpeakerName(s, e.target.value)}
                                className="bg-white/10 text-white text-xs p-1 rounded outline-none border border-transparent focus:border-white/40"
                                placeholder="Enter real name..."
                            />
                        </div>
                    ))}
                 </div>
              </div>
          </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-3 pb-8">
             {activeCards.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                   <p className="text-gray-500">No cards left to review. You might want to upload another transcript.</p>
                </div>
             ) : (
                <>
                    {pageCards.map((c) => (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between group hover:border-gray-300 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={clsx("w-2.5 h-2.5 rounded-full flex-shrink-0", c.sentiment === 'positive' ? 'bg-green-500' : c.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400')} />
                                <div className="flex-1">
                                    {editingId === c.id ? (
                                        <textarea 
                                            autoFocus
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            onBlur={() => saveEdit(c.id)}
                                            className="w-full text-sm font-medium text-gray-900 border-b border-brand-300 outline-none bg-brand-50/30 p-1 rounded resize-none"
                                            rows={2}
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-900">{c.text}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{speakerMap[c.speaker] || c.speaker}</span>
                                        {c.confidence === 'low' && <span className="text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">Low confidence</span>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {editingId === c.id ? (
                                    <button onClick={() => saveEdit(c.id)} className="p-2 text-brand-600 hover:bg-brand-50 rounded text-xs flex items-center gap-1 font-bold">
                                        <Check className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={() => startEditing(c)} className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded text-xs flex items-center gap-1">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button onClick={() => setSplitCard(c)} className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded text-xs flex items-center gap-1"><Scissors className="w-3.5 h-3.5" /></button>
                                <button onClick={() => removeCard(c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-6 pb-12">
                            <button 
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    )}
                </>
             )}
          </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4 z-20 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium tracking-tight">Review complete?</span>
              <button 
                  onClick={handleConfirm}
                  disabled={activeCards.length === 0}
                  className="bg-brand-500 disabled:opacity-50 text-white rounded-xl px-6 py-2.5 font-medium hover:bg-brand-600 active:scale-95 transition-all flex items-center gap-2"
              >
                 Confirm & Start Clustering <ArrowRight className="w-4 h-4" />
              </button>
          </div>
      </div>

    </div>
  );
}
