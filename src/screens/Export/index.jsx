import React, { useState, useEffect } from 'react';
import { useBoardStore } from '../../store/useBoardStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useSessionStore } from '../../store/useSessionStore';
import { Download, FileText, Image as ImageIcon, Table, CheckCircle2, ArrowLeft, LayoutGrid, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHydrateProject } from '../../hooks/useHydrateProject';
import { callAI } from '../../services/ai';
import { AI_CONFIG } from '../../config/ai.config';
import { ANALYSIS_SYSTEM_PROMPT, buildHMWPrompt, buildJTBDPrompt, buildLeanCanvasPrompt } from '../../services/ai/prompts';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import clsx from 'clsx';

export default function Export() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // Fix the blank page bug by ensuring project data is loaded
  useHydrateProject(projectId);

  const clusters = useBoardStore(s => s.clusters);
  const getProject = useProjectStore(s => s.getProject);
  const project = getProject(projectId);
  
  const [format, setFormat] = useState('summary');
  const [subFormat, setSubFormat] = useState('hmw');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaries, setSummaries] = useState({}); // { [subFormat]: content }
  const [anonymize, setAnonymize] = useState(false);

  const allCards = clusters.flatMap(c => c.cards);

  // Effect to generate AI summaries when switching formats
  useEffect(() => {
      if (format !== 'summary' || !clusters.length) return;
      if (summaries[subFormat]) return; // Already generated

      async function generate() {
          setIsGenerating(true);
          try {
              let prompt;
              if (subFormat === 'hmw') {
                  // HMW is special: we generate it for the first cluster as a preview, 
                  // or we could map over all. For the preview, let's do all.
                  const results = await Promise.all(clusters.filter(c => !c.isUnc).map(async c => {
                       const hmwPrompt = buildHMWPrompt(c.name, c.synthesis, project?.researchQuestion, project?.sector);
                       const res = await callAI({
                           systemPrompt: ANALYSIS_SYSTEM_PROMPT,
                           userPrompt: hmwPrompt,
                           model: AI_CONFIG.models.synthesis,
                           jsonMode: false
                       });
                       return { clusterId: c.id, content: res.data };
                  }));
                  setSummaries(prev => ({ ...prev, hmw: results }));
              } else if (subFormat === 'jtbd') {
                  prompt = buildJTBDPrompt(clusters.filter(c => !c.isUnc), project?.sector);
                  const res = await callAI({ systemPrompt: ANALYSIS_SYSTEM_PROMPT, userPrompt: prompt, jsonMode: false });
                  setSummaries(prev => ({ ...prev, jtbd: res.data }));
              } else {
                  prompt = buildLeanCanvasPrompt(clusters.filter(c => !c.isUnc), project?.sector, project?.stage);
                  const res = await callAI({ systemPrompt: ANALYSIS_SYSTEM_PROMPT, userPrompt: prompt, jsonMode: false });
                  setSummaries(prev => ({ ...prev, lean: res.data }));
              }
          } catch (e) {
              console.error("Summary generation failed:", e);
          } finally {
              setIsGenerating(false);
          }
      }
      generate();
  }, [format, subFormat, clusters, project]);

  const handleDownload = () => {
      if (format === 'csv') {
          const data = allCards.map(c => {
               const cluster = clusters.find(cl => cl.cards.some(card => card.id === c.id));
               return {
                   id: c.id,
                   text: c.text,
                   quote: c.quote || '',
                   stakeholder: anonymize ? 'Anonymised' : (c.originalStakeholder || 'Unknown'),
                   speaker: anonymize ? 'Anonymised' : (c.speaker || 'Unknown'),
                   sentiment: c.sentiment || 'neutral',
                   confidence: c.confidence || 'high',
                   assertive: c.assertive ? 'Yes' : 'No',
                   frequency: c.frequency || 1,
                   cluster: cluster?.name || 'Unclustered'
               };
           });
          const csv = Papa.unparse(data);
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `INCUBX_${project?.name || 'Research'}_Insights.csv`;
          a.click();
      } else if (format === 'pdf') {
          const doc = new jsPDF();
          doc.setFontSize(20);
          doc.text(`Research Board: ${project?.name || 'Untitled'}`, 14, 22);
          doc.setFontSize(10);
          doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
          
          let y = 40;
          clusters.forEach((c) => {
              if (y > 250) { doc.addPage(); y = 20; }
              doc.setFontSize(14);
              doc.setTextColor(79, 70, 229); // brand-600
              doc.text(c.name || 'Untitled Cluster', 14, y);
              y += 7;
              doc.setFontSize(10);
              doc.setTextColor(100);
              const splitSynthesis = doc.splitTextToSize(c.synthesis || '', 180);
              doc.text(splitSynthesis, 14, y);
              y += (splitSynthesis.length * 5) + 5;
              
              const tableData = c.cards.map(card => [
                  anonymize ? 'Anonymised' : (card.speaker || 'Unknown'), 
                  card.text
              ]);
              doc.autoTable({
                  startY: y,
                  head: [['Speaker', 'Insight']],
                  body: tableData,
                  margin: { left: 14 },
                  theme: 'striped',
                  headStyles: { fillColor: [79, 70, 229] },
                  styles: { fontSize: 8 }
              });
              y = doc.lastAutoTable.finalY + 15;
          });
          doc.save(`INCUBX_${project?.name || 'Research'}_Board.pdf`);
      } else {
          // Summary download (text/markdown)
          const content = typeof summaries[subFormat] === 'string' 
               ? summaries[subFormat] 
               : (summaries.hmw || []).map(h => `## ${clusters.find(c => c.id === h.clusterId)?.name}\n${h.content}`).join('\n\n');
               
          // Issue #15: Strip JSON markers if AI misbehaves
          const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
               
          const blob = new Blob([cleanContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `INCUBX_${project?.name || 'Research'}_${subFormat.toUpperCase()}.txt`;
          a.click();
      }
  };

  return (
    <div className="flex flex-col h-screen bg-canvas overflow-hidden">
       {/* Header with Back Button */}
       <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-20">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(`/project/${projectId}/board`)}
                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Board
                </button>
                <div className="w-px h-6 bg-gray-200" />
                <h1 className="text-sm font-bold text-gray-900 uppercase tracking-tight">EXPORT FINDINGS — {project?.name}</h1>
            </div>
       </div>

       <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:w-[380px] bg-white border-r border-gray-200 p-8 flex flex-col overflow-y-auto">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6 uppercase">Select Export Format</h2>
            
            <div className="space-y-3 mb-8">
                {[
                    { id: 'pdf', icon: ImageIcon, title: 'Visual PDF Board', desc: 'Best for presentations. Includes board snapshot.' },
                    { id: 'csv', icon: Table, title: 'Raw Dataset CSV', desc: 'Best for Excel/Sheets programmatic ingestion.' },
                    { id: 'summary', icon: FileText, title: 'Research Summary', desc: 'Precise Lean/JTBD generative document.' }
                ].map(f => (
                    <button 
                        key={f.id}
                        onClick={() => setFormat(f.id)}
                        className={clsx(
                            "w-full flex items-start gap-3 p-4 border-2 rounded-2xl text-left transition-all",
                            format === f.id ? "border-brand-500 bg-brand-50 shadow-sm" : "border-gray-100 hover:border-brand-200"
                        )}
                    >
                        <f.icon className={clsx("w-5 h-5 flex-shrink-0 mt-0.5", format === f.id ? "text-brand-600" : "text-gray-400")} />
                        <div>
                            <p className="text-xs font-bold text-gray-900 mb-1 uppercase tracking-tight">{f.title}</p>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{f.desc}</p>
                        </div>
                        {format === f.id && <CheckCircle2 className="w-4 h-4 text-brand-500 ml-auto flex-shrink-0" />}
                    </button>
                ))}
            </div>

            {format === 'summary' && (
                <div className="animate-fadeSlideIn space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Synthesis Framework</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { id: 'hmw', label: 'How Might We' },
                            { id: 'jtbd', label: 'JTBD (Needs)' },
                            { id: 'lean', label: 'Lean Opportunities' }
                        ].map(sf => (
                            <button 
                                key={sf.id}
                                onClick={() => setSubFormat(sf.id)}
                                className={clsx(
                                    "text-[10px] font-bold px-4 py-2.5 border rounded-xl text-left transition-all uppercase tracking-wide",
                                    subFormat === sf.id ? "border-amber-500 bg-amber-50 text-amber-700 shadow-sm" : "border-gray-100 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                {sf.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Compliance Toggle (Issue #44) */}
            <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                    <div>
                        <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest leading-none mb-1">Anonymise Feedback</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-tight">DPDP Mumbai Compliance</p>
                    </div>
                    <button 
                        onClick={() => setAnonymize(!anonymize)}
                        className={clsx(
                            "w-10 h-5 rounded-full transition-all relative flex items-center px-1",
                            anonymize ? "bg-brand-500" : "bg-gray-200"
                        )}
                    >
                        <div className={clsx(
                            "w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                            anonymize ? "translate-x-5" : "translate-x-0"
                        )} />
                    </button>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                    onClick={handleDownload}
                    disabled={isGenerating || clusters.length === 0}
                    className="w-full bg-brand-500 disabled:opacity-50 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-widest hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isGenerating ? 'GENERATING...' : `Download ${format.toUpperCase()}`}
                </button>
            </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
            <div className="max-w-3xl mx-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Live Preview</p>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 min-h-[800px] p-12 animate-fadeSlideIn relative overflow-hidden">
                    
                    {/* Visual PDF Mock */}
                    {format === 'pdf' && (
                        <div>
                            <div className="flex items-center justify-between mb-8 border-b pb-6">
                                <div>
                                    <h1 className="text-2xl font-bold font-serif text-gray-900">Affinity Board Snapshot</h1>
                                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">{project?.name}</p>
                                </div>
                                <LayoutGrid className="w-8 h-8 text-brand-500 opacity-20" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                {clusters.map(c => (
                                    <div key={c.id} className="p-4 border border-gray-100 rounded-2xl shadow-sm bg-white">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
                                            {c.name || "Untitled Cluster"}
                                            <span className="bg-brand-50 text-brand-500 px-2 py-0.5 rounded-full text-[7px]">{c.cards.length} Signals</span>
                                        </h4>
                                        <p className="text-[10px] text-gray-400 leading-relaxed mb-4 italic line-clamp-2">"{c.synthesis}"</p>
                                        <div className="space-y-2">
                                            {c.cards.slice(0, 4).map(card => (
                                                <div key={card.id} className="text-[8px] bg-slate-50 p-2 rounded-xl border-l-2 border-brand-300 text-gray-600 leading-relaxed">
                                                    <span className="font-bold text-gray-400 mr-1">
                                                        {anonymize ? 'USER' : (card.speaker || 'UKN')}:
                                                    </span> 
                                                    {card.text}
                                                </div>
                                            ))}
                                            {c.cards.length > 4 && <p className="text-[8px] text-gray-300 font-bold tracking-widest text-center mt-2 uppercase">+ {c.cards.length - 4} more signals in full report</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CSV Table Mock */}
                    {format === 'csv' && (
                        <div className="font-mono text-[10px]">
                            <div className="flex items-center gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                                <div>
                                    <p className="font-bold text-gray-900 uppercase tracking-widest">raw_insights_export.csv</p>
                                    <p className="text-[9px] text-gray-500 px-1">{allCards.length} rows including stakeholder attribution</p>
                                </div>
                            </div>
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-400">
                                        <th className="border p-2 text-left uppercase">Insight ID</th>
                                        <th className="border p-2 text-left uppercase">Text Content</th>
                                        <th className="border p-2 text-left uppercase">Stakeholder</th>
                                        <th className="border p-2 text-left uppercase">Cluster</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allCards.slice(0, 15).map(card => (
                                        <tr key={card.id} className="text-gray-600">
                                            <td className="border p-2 truncate max-w-[80px]">{card.id}</td>
                                            <td className="border p-2 truncate">{card.text}</td>
                                            <td className="border p-2">{card.originalStakeholder || "Unknown"}</td>
                                            <td className="border p-2 text-brand-600">
                                                {clusters.find(c => c.cards.some(ca => ca.id === card.id))?.name || 'Unclustered'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {allCards.length > 15 && <div className="mt-4 text-center text-gray-400 italic">... {allCards.length - 15} rows hidden in preview ...</div>}
                        </div>
                    )}

                    {/* Research Summary View */}
                    {format === 'summary' && (
                        <div>
                            <div className="mb-12">
                                <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">Research Synthesis: {subFormat.toUpperCase()}</h1>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] border-b pb-4">Executive Generated Report • {new Date().toLocaleDateString()}</p>
                            </div>
                            
                            {isGenerating ? (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                                    <p className="text-sm text-gray-500 italic">AI is synthesizing clusters into {subFormat.toUpperCase()} framework...</p>
                                </div>
                            ) : (
                                <div className="space-y-10 animate-fadeSlideIn">
                                    {subFormat === 'hmw' ? (
                                        (summaries.hmw || []).map(h => (
                                            <div key={h.clusterId} className="border-l-4 border-brand-400 pl-6 pb-2">
                                                <h3 className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
                                                    {clusters.find(c => c.id === h.clusterId)?.name}
                                                </h3>
                                                <p className="text-lg font-medium text-gray-900 italic">"{h.content}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                            {summaries[subFormat] || "Click framework on the left to generate synthesis."}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {allCards.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center flex-col p-12 text-center">
                            <ImageIcon className="w-16 h-16 text-gray-100 mb-4" />
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Signals Detected</h3>
                            <p className="text-xs text-gray-300 mt-2 max-w-xs">Start by adding stakeholders and extracting insights onto the board to generate a preview.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
       </div>
    </div>
  );
}
