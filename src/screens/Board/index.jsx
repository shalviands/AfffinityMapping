import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBoardStore } from '../../store/useBoardStore';
import { useProjectStore } from '../../store/useProjectStore';
import Cluster from './Cluster';
import BoardHeader from './BoardHeader';
import GuidedSidebar from './GuidedSidebar';
import ConflictPanel from './ConflictPanel';

export default function Board() {
  const { projectId } = useParams();
  
  // 1. Properly select values via hooks (Top-level only)
  const clusters = useBoardStore(s => s.clusters);
  const conflictOpen = useBoardStore(s => s.conflictOpen);
  
  // 2. Properly select actions via hooks
  const setClusters = useBoardStore(s => s.setClusters);
  const setProjectId = useBoardStore(s => s.setProjectId);
  const addCluster = useBoardStore(s => s.addCluster);
  const getProject = useProjectStore(s => s.getProject);

  // 3. Sync from Project Store - Moved out of the render body
  useEffect(() => {
    if (!projectId) return;

    const currentBoardId = useBoardStore.getState().projectId;
    const project = getProject(projectId);

    if (currentBoardId !== projectId) {
        setProjectId(projectId);
        useBoardStore.setState({ history: [], clusteringError: null }); 
        
        if (project && project.board && project.board.clusters) {
            setClusters(project.board.clusters);
        } else {
            setClusters([]);
        }
    }
  }, [projectId, getProject, setProjectId, setClusters]);

  const closeConflictPanel = () => useBoardStore.setState({ conflictOpen: null });

  return (
    <div className="flex flex-col h-full bg-canvas overflow-hidden relative">
      <BoardHeader />
      
      {conflictOpen && (
        <ConflictPanel 
          cluster={clusters.find(c => c.id === conflictOpen)} 
          onClose={closeConflictPanel} 
        />
      )}
      
      <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start gap-4 scrollbar-hide">
             {clusters.map((cluster) => (
               <Cluster key={cluster.id} cluster={cluster} isUnclustered={cluster.isUnc || cluster.id === 'unclustered'} />
             ))}
             
             <button 
              onClick={() => addCluster()}
              className="flex flex-col w-[320px] min-w-[320px] h-24 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center text-gray-400 hover:bg-white hover:border-brand-400 hover:text-brand-500 transition-all cursor-pointer group shrink-0"
            >
              <span className="text-xl font-bold group-hover:scale-110 transition-transform tracking-tighter italic">+ Add Theme</span>
            </button>
          </div>
          
          <GuidedSidebar />
      </div>
    </div>
  );
}
