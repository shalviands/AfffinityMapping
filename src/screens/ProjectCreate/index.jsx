import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, BookOpen, Target, ArrowRight } from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';

export default function ProjectCreate() {
  const navigate = useNavigate();
  const addProject = useProjectStore(s => s.addProject);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    researchQuestion: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectId = addProject(formData);
    navigate(`/project/${projectId}/board`);
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12 px-4 bg-canvas">
       <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-xl w-full p-10">
          <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-8">
             <FolderPlus className="w-7 h-7" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Create Research Project</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">Projects act as long-term containers for cumulative affinity mapping across multiple stakeholders.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
             <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                   <BookOpen className="w-3.5 h-3.5" /> Project Name
                </label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                  placeholder="e.g. Organic Oysters Market Entry" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
             </div>
             
             <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                   <Target className="w-3.5 h-3.5" /> Primary Research Question
                </label>
                <textarea 
                  required
                  value={formData.researchQuestion}
                  onChange={e => setFormData(p => ({...p, researchQuestion: e.target.value}))}
                  placeholder="e.g. Why are organic oysters not widely available in the South Indian market?" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-32 resize-none focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                />
             </div>

             <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                   Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-brand-500 text-white rounded-xl px-6 py-3 font-bold hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-200 active:scale-95"
                >
                   Initialize Project <ArrowRight className="w-5 h-5" />
                </button>
             </div>
          </form>
       </div>
    </div>
  );
}
