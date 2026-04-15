import React, { useState } from 'react';
import { MoreVertical, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import InsightCard from './InsightCard';
import clsx from 'clsx';

export default function Cluster({ cluster, isUnclustered }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(cluster.name || '');

    //- [x] Clean up AppShell and global components
    //- [x] Stabilize useBoardStore (Remove circularity)
    //- [x] Level 2 Isolation: Board with sanitized store
    //- [x] Incrementally restore Header
    //- [x] Incrementally restore Clusters (Interactivity Restored)
    //- [ ] Restore DndContext (High Risk - Step 2.3)
    //- [ ] Re-enable GuidedTour (if stable)

    // 1. Select actions via hooks
    const deleteCluster = useBoardStore(s => s.deleteCluster);
    const renameCluster = useBoardStore(s => s.renameCluster);

    if (!cluster) return null;

    const handleRename = () => {
        renameCluster(cluster.id, tempName);
        setIsEditing(false);
    };

    return (
        <div
            className={clsx(
                "w-[320px] max-h-[calc(100vh-160px)] flex flex-col rounded-3xl border transition-all shrink-0",
                isUnclustered ? "bg-slate-50 border-slate-200 shadow-sm" : "bg-white border-gray-100 shadow-lg"
            )}
        >
            <div className={clsx("p-4 pb-3 flex items-start justify-between rounded-t-3xl", !isUnclustered && "border-b border-gray-50 bg-gray-50/50")}>
                <div className="flex-1 min-w-0 pr-2">
                    {isEditing ? (
                        <div className="flex items-center gap-1">
                            <input 
                                autoFocus
                                className="w-full text-base font-bold bg-white border border-brand-200 rounded px-1 focus:outline-none"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                            />
                            <button onClick={handleRename} className="p-1 text-green-600"><Check className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cluster.cards?.length || 0} Signals</span>
                            </div>
                            <h3 
                                onClick={() => !isUnclustered && setIsEditing(true)}
                                className="text-base font-bold text-gray-900 leading-tight truncate cursor-pointer hover:text-brand-600"
                            >
                                {cluster.name || (isUnclustered ? "Unsorted Feed" : "Untitled Theme")}
                            </h3>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-1">
                    {!isUnclustered && (
                        <button 
                            onClick={() => deleteCluster(cluster.id)}
                            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                    >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className={clsx("flex-1 overflow-y-auto p-3 space-y-3 min-h-[50px]", isCollapsed && "hidden")}>
                {cluster.cards?.map((card) => (
                    <InsightCard key={card.id} card={card} clusterId={cluster.id} />
                ))}
            </div>
        </div>
    );
}
