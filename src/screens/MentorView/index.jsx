import React, { useState } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { Eye, MessageSquare, Plus, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHydrateProject } from '../../hooks/useHydrateProject';
import Cluster from '../Board/Cluster';

export default function MentorView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  useHydrateProject(projectId);
  const clusters = useBoardStore(s => s.clusters);
  const [commentOverlayCard, setCommentOverlayCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeClusterId, setActiveClusterId] = useState(null);

  React.useEffect(() => {
     if (!projectId) return;
     async function init() {
        const { boardSyncService } = await import('../../services/supabase/sync.service');
        const existing = await boardSyncService.loadComments(projectId);
        setComments(existing);

        boardSyncService.subscribeToComments(projectId, (comment) => {
            setComments(prev => [...prev, comment]);
        });
     }
     init();
  }, [projectId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    const { boardSyncService } = await import('../../services/supabase/sync.service');
    await boardSyncService.saveComment(projectId, activeClusterId, newComment);
    setNewComment("");
    setActiveClusterId(null);
  };

  return (
    <div className="flex flex-col h-full bg-canvas overflow-hidden relative">
      <div className="bg-indigo-600 text-white p-3 text-center text-sm font-semibold tracking-wide flex justify-between items-center px-6">
         <button onClick={() => navigate(`/project/${projectId}/board`)} className="hover:text-indigo-200 transition-colors flex items-center gap-2 text-xs">
            <ArrowLeft className="w-4 h-4" /> Board
         </button>
         <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" /> Mentor View — Multi-Stakeholder Feedback
         </div>
         <div className="w-10" />
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start gap-4 scrollbar-hide">
           {clusters.map((cluster) => (
             <div key={cluster.id} className="relative group/col">
                  <div className="pointer-events-none opacity-90 scale-[0.98] transition-all group-hover/col:opacity-100 group-hover/col:scale-100">
                      <Cluster 
                        cluster={cluster} 
                        isUnclustered={cluster.isUnc || cluster.id === 'unclustered'} 
                      />
                  </div>
                  
                  {/* Comments List for this cluster */}
                  <div className="mt-4 space-y-2 max-w-[320px]">
                      {comments.filter(c => c.cluster_id === cluster.id).map(c => (
                          <div key={c.id} className="bg-white border border-brand-100 shadow-sm p-3 rounded-xl animate-fadeSlideIn">
                              <div className="flex items-center gap-2 mb-1">
                                  <div className="w-4 h-4 rounded-full bg-brand-100 text-brand-600 text-[8px] font-bold flex items-center justify-center">M</div>
                                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{c.author}</span>
                              </div>
                              <p className="text-[11px] text-gray-700 leading-relaxed">{c.content}</p>
                          </div>
                      ))}
                  </div>

                  <button 
                    onClick={() => setActiveClusterId(cluster.id)}
                    className="absolute top-2 -right-2 w-8 h-8 bg-brand-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover/col:opacity-100 transition-opacity cursor-pointer z-50 shadow-lg border-4 border-white hover:scale-110 active:scale-90"
                  >
                      <Plus className="w-4 h-4" />
                  </button>
             </div>
           ))}
      </div>
      
      {/* Comment Modal */}
      {activeClusterId && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeScaleIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Add Mentor Guidance</h3>
                  <p className="text-gray-500 text-sm mb-6">Your feedback will be synced real-time to the founder's affinity board.</p>
                  
                  <textarea 
                    autoFocus
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-brand-500 transition-colors text-sm"
                    placeholder="E.g. This cluster shows a high intensity of pain points in UPI, but look at Card C12 - it contradicts the Delighted signal..."
                  />

                  <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => setActiveClusterId(null)}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handlePostComment}
                        className="flex-1 px-6 py-3 bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-600 shadow-lg shadow-brand-200 transition"
                      >
                          Sync Feedback
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Info */}
      <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-md shadow-xl border border-indigo-100 rounded-2xl p-4 w-72 z-50 animate-fadeSlideIn">
         <div className="flex items-start gap-3">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">?</div>
             <div>
                 <p className="text-sm font-bold text-gray-900">How to use</p>
                 <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Click the <Plus className="inline w-3 h-3"/> button on any cluster to leave a strategic comment for the founder.</p>
             </div>
         </div>
      </div>
    </div>
  );
}
