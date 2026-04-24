import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutTemplate, Clock, FolderOpen, ArrowRight, BarChart3, LineChart, Target, Users } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const projects = useProjectStore(s => s.projects);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Header Area */}
      <div className="bg-brand-600 px-8 pt-12 pb-24 border-b border-brand-700 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-brand-500 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <LayoutTemplate className="w-8 h-8 text-white opacity-80" />
                 <h1 className="text-2xl font-bold text-white tracking-tight">INCUBX Workspace</h1>
              </div>
              <p className="text-brand-100 text-lg max-w-xl leading-relaxed">
                  Manage cumulative research projects and synthesize multi-stakeholder insights.
              </p>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-8 -mt-16 relative z-20 pb-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
              {/* Primary Action Card */}
              <div 
                onClick={() => navigate('/project/new')}
                className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-md border border-gray-100 cursor-pointer group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Research Project</h2>
                  <p className="text-gray-500 mb-6 max-w-md">Initialize a new living affinity map to aggregate multi-stakeholder interviews for a specific research thesis.</p>
                  <div className="text-sm font-semibold text-teal-600 flex items-center gap-2">
                      Launch Project Container <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
              </div>

              {/* Stats Card */}
              <div className="bg-indigo-600 rounded-2xl p-6 shadow-md text-white flex flex-col justify-between">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="text-3xl font-bold mb-1">{projects.length}</h3>
                      <p className="text-xs text-indigo-100 font-medium uppercase tracking-wider">Active Projects</p>
                  </div>
              </div>
          </div>

          {/* Projects List */}
          <div>
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800">Research Projects</h3>
                 </div>
              </div>

              {projects.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                      <p className="text-gray-400 font-medium">No projects found. Create one to start mapping.</p>
                  </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(project => (
                        <div 
                          key={project.id}
                          onClick={() => navigate(`/project/${project.id}/board`)}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-brand-400 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{project.name}</h4>
                                <div className="flex items-center gap-2">
                                    <button 
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm('Are you sure you want to delete this project? Decisions are permanent.')) {
                                              useProjectStore.getState().deleteProject(project.id);
                                          }
                                      }}
                                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </button>
                                    <div className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-500 uppercase tracking-widest">Live</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-6 h-8">{project.researchQuestion}</p>
                            
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 rounded-lg">
                                       <Users className="w-3 h-3 text-teal-600" />
                                       <span className="text-xs font-bold text-teal-700">{project.stakeholders?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-50 rounded-lg">
                                       <Target className="w-3 h-3 text-violet-600" />
                                       <span className="text-xs font-bold text-violet-700">{project.board?.clusters?.length || 0}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
              )}
          </div>
          
      </div>
    </div>
  );
}
