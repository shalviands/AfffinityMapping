import { Download, LayoutGrid, ToggleLeft, ToggleRight, Info, Home, RotateCcw, Plus, Sparkles, RefreshCw, Check, X, Users, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import StakeholderManager from './StakeholderManager';
import { useBoardStore } from '../../store/useBoardStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useSessionStore } from '../../store/useSessionStore';
import ModelSettings from '../../components/shared/ModelSettings';
import { AI_CONFIG } from '../../config/ai.config';

export default function BoardHeader({ onManageOpen }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // 1. Properly select values via hooks (Top-level only)
  const clusters = useBoardStore(s => s.clusters);
  const clusteringError = useBoardStore(s => s.clusteringError);
  const isClustering = useBoardStore(s => s.isClustering);
  const history = useBoardStore(s => s.history);
  const guidedModeOpen = useBoardStore(s => s.guidedModeOpen);
  
  // 2. Properly select actions via hooks
  const clusterBoard = useBoardStore(s => s.clusterBoard);
  const undo = useBoardStore(s => s.undo);
  
  const getProject = useProjectStore(s => s.getProject);
  const updateProject = useProjectStore(s => s.updateProject);
  const startNewStakeholderFlow = useSessionStore(s => s.startNewStakeholderFlow);

  // 3. Local State
  const [managerOpen, setManagerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [undoToast, setUndoToast] = useState(false);

  const project = getProject(projectId);
  const clusteredCount = clusters.filter(c => !c.isUnc).reduce((acc, c) => acc + c.cards.length, 0);
  const unclusteredCount = clusters.find(c => c.isUnc || c.id === 'unclustered')?.cards?.length || 0;

  // 4. Handlers (Sanitized - no .getState() during render)
  const handleAutoCluster = () => {
      clusterBoard(projectId, project?.researchQuestion);
  };

  const startEditing = () => {
      setEditedQuestion(project?.researchQuestion || "");
      setIsEditing(true);
  };

  const saveQuestion = () => {
      updateProject(projectId, { researchQuestion: editedQuestion });
      setIsEditing(false);
  };

  const handleUndo = () => {
      undo();
      setUndoToast(true);
      setTimeout(() => setUndoToast(false), 3000);
  };

  const setGuidedModeOpen = (val) => useBoardStore.setState({ guidedModeOpen: val });

  return (
    <>
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 relative z-20">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          title="Return to Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold tracking-tight text-sm">
                IX
            </div>
            {isRenamingProject ? (
                <input
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onBlur={() => {
                        if (projectName.trim()) {
                            updateProject(projectId, { name: projectName.trim() });
                        }
                        setIsRenamingProject(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (projectName.trim()) {
                                updateProject(projectId, { name: projectName.trim() });
                            }
                            setIsRenamingProject(false);
                        }
                        if (e.key === 'Escape') setIsRenamingProject(false);
                    }}
                    className="font-semibold text-gray-900 tracking-tight uppercase text-xs bg-brand-50 border border-brand-300 rounded-md px-2 py-1 outline-none w-[180px]"
                />
            ) : (
                <span
                    onClick={() => { setProjectName(project?.name || ''); setIsRenamingProject(true); }}
                    className="font-semibold text-gray-900 tracking-tight hidden lg:block uppercase text-xs cursor-pointer hover:text-brand-600 hover:bg-brand-50 px-2 py-1 rounded-md transition-colors"
                    title="Click to rename project"
                >
                    {project?.name || 'Research Project'}
                </span>
            )}
        </div>
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        <button 
          onClick={() => {
              startNewStakeholderFlow();
              navigate(`/project/${projectId}/add-feedback`);
          }}
          className="bg-brand-500 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-brand-600 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
            <Plus className="w-3.5 h-3.5" /> ADD NEW STAKEHOLDER
        </button>
      </div>

      {/* Center - Pinned Question (Editable) */}
      <div className="flex-1 flex justify-center px-4 overflow-hidden">
         {isEditing ? (
             <div className="flex items-center gap-2 bg-white shadow-xl border border-brand-200 rounded-full pl-4 pr-1.5 py-1 animate-fadeIn">
                 <input 
                    autoFocus
                    value={editedQuestion}
                    onChange={(e) => setEditedQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveQuestion()}
                    className="text-xs italic text-gray-900 bg-transparent outline-none w-[300px]"
                    placeholder="Enter your problem statement..."
                 />
                 <div className="flex gap-1">
                    <button onClick={saveQuestion} className="p-1 px-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors flex items-center gap-1 text-[10px] font-bold uppercase">
                        <Check className="w-3 h-3" /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-1 px-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-3 h-3" />
                    </button>
                 </div>
             </div>
         ) : (
             <div 
                onClick={startEditing}
                className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 max-w-[400px] hover:border-brand-300 transition-colors cursor-text group"
             >
                <Info className="w-4 h-4 text-gray-400 group-hover:text-brand-500" />
                <span className="text-xs italic text-gray-600 truncate">
                   {project?.researchQuestion || 'Enter problem statement...'}
                </span>
                <span className="text-[9px] text-gray-300 font-bold uppercase ml-2 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
             </div>
          )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden xl:flex items-center gap-6 px-4 py-1 border-r border-gray-100">
              <div className="flex flex-col items-center">
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">Clustered</span>
                  <span className="text-xs font-bold text-teal-600">
                      {clusteredCount}
                  </span>
              </div>
              <div className="flex flex-col items-center">
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">Unclustered</span>
                  <span className="text-xs font-bold text-amber-500">
                      {unclusteredCount}
                  </span>
              </div>
          </div>

          {undoToast && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-2xl animate-fadeSlideIn z-50 flex items-center gap-2">
                  <RotateCcw className="w-3 h-3 text-amber-500" /> Action Reverted
              </div>
          )}
          <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
             <button 
                onClick={handleUndo}
                disabled={history.length === 0}
                className={clsx(
                    "flex items-center gap-1.5 p-2 rounded-lg transition-all",
                    history.length > 0 ? "text-amber-600 hover:bg-amber-50" : "text-gray-300 cursor-not-allowed opacity-40"
                 )}
                title="Undo last action"
             >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Undo</span>
             </button>

             <button 
                onClick={() => setGuidedModeOpen(!guidedModeOpen)}
                className="flex items-center gap-1.5 text-xs text-gray-600 font-medium hover:text-gray-900"
              >
                 {guidedModeOpen ? <ToggleRight className="w-5 h-5 text-indigo-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                 <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Guided Mode</span>
              </button>
          </div>

          <button 
            onClick={handleAutoCluster}
            disabled={isClustering}
            className={clsx(
                "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm",
                isClustering ? "bg-teal-50 border-teal-200 text-teal-600 cursor-wait" : 
                clusteringError ? "border-red-200 text-red-700 bg-red-50 hover:bg-red-100" :
                "border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100"
            )}
            title={clusteringError || ''}
          >
            {isClustering ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className={clsx("w-4 h-4", clusteringError && "text-red-500")} />}
            {isClustering ? "Analysing..." : clusteringError ? "Retry" : "Auto-Cluster"}
          </button>

          <button 
            onClick={() => navigate(`/project/${projectId}/priority`)} 
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-gray-50"
          >
            <LayoutGrid className="w-4 h-4" />
            Prioritise
          </button>
          
          <button 
            onClick={() => navigate(`/project/${projectId}/export`)} 
            className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-600 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

         <div className="w-px h-6 bg-gray-200" />

         <button 
            onClick={() => { setManagerOpen(true); }}
            className="p-2 px-3 text-brand-600 bg-brand-50 border border-brand-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-100 transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" /> Manage
          </button>

          <div className="w-px h-6 bg-gray-200" />
          
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">AI Processing</span>
                <span className="text-[10px] font-semibold text-brand-600 truncate max-w-[80px]">
                   {AI_CONFIG.models.clustering.split('/')[1]?.split(':')[0] || 'Gemma'}
                </span>
             </div>
             <button 
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-200"
                title="AI Model Settings"
             >
                <Settings className="w-4 h-4" />
             </button>
          </div>
      </div>
    </div>

      {managerOpen && <StakeholderManager projectId={projectId} onClose={() => setManagerOpen(false)} />}
      <ModelSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
