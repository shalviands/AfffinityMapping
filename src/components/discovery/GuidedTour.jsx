import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Sparkles, LayoutGrid, Users, Mic, Download } from 'lucide-react';
import clsx from 'clsx';

const STEPS = [
  {
    title: "Welcome to INCUBX",
    description: "Your new studio for synthesizing research. Let's show you how to turn raw interviews into validated feedback patterns.",
    icon: Sparkles,
    color: "brand"
  },
  {
    title: "Aggregate Signals",
    description: "Add stakeholders and record interviews directly. Our AI 'Brain' extracts distinct signals from your transcripts automatically.",
    icon: Mic,
    color: "teal"
  },
  {
    title: "The Affinity Board",
    description: "Drag and drop signal cards to group them. Use 'Auto-Cluster' if you want the AI to suggest thematic pillars for you.",
    icon: LayoutGrid,
    color: "rose"
  },
  {
    title: "Manage Visists",
    description: "Keep track of every stakeholder profile and their archived transcripts in the 'Manage' tab at any time.",
    icon: Users,
    color: "amber"
  },
  {
    title: "Export & Share",
    description: "Generate executive PDFs, raw CSV datasets, or generative research summaries once your synthesis is complete.",
    icon: Download,
    color: "violet"
  }
];

export default function GuidedTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('incubx-tour-seen');
    if (!hasSeenTour) {
      setIsOpen(true);
    }
  }, []);

  const closeTour = () => {
    localStorage.setItem('incubx-tour-seen', 'true');
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTour();
    }
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scaleUp">
        
        {/* Progress Bar */}
        <div className="flex h-1.5 w-full bg-gray-100">
            {STEPS.map((_, i) => (
                <div 
                    key={i} 
                    className={clsx(
                        "flex-1 transition-all duration-500",
                        i <= currentStep ? "bg-brand-500" : "bg-transparent"
                    )} 
                />
            ))}
        </div>

        <div className="p-10 flex flex-col items-center text-center">
            <div className={clsx(
                "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-lg rotate-3",
                step.color === 'brand' ? 'bg-brand-500 text-white' :
                step.color === 'teal' ? 'bg-teal-500 text-white' :
                step.color === 'rose' ? 'bg-rose-500 text-white' :
                step.color === 'amber' ? 'bg-amber-500 text-white' :
                'bg-violet-500 text-white'
            )}>
                <Icon className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 uppercase tracking-tight">{step.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-10">
                {step.description}
            </p>

            <div className="w-full space-y-3">
                <button 
                    onClick={nextStep}
                    className="w-full bg-brand-500 text-white rounded-2xl py-4 font-bold text-sm uppercase tracking-widest hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20"
                >
                    {currentStep === STEPS.length - 1 ? "Get Started" : "Next Topic"}
                    <ArrowRight className="w-4 h-4" />
                </button>
                
                <button 
                    onClick={closeTour}
                    className="w-full py-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
                >
                    Skip Tour
                </button>
            </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
            <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                    <div key={i} className={clsx("w-1.5 h-1.5 rounded-full transition-all", i === currentStep ? "bg-brand-500 w-4" : "bg-gray-200")} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
