import React from 'react';
import { X, Search, Sparkles, Code, Palette, LineChart, BookOpen, Calculator, Bot } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectGPT: (name: string, initialPrompt: string) => void;
}

export const ExploreGPTsModal: React.FC<Props> = ({ isOpen, onClose, onSelectGPT }) => {
  if (!isOpen) return null;

  const gpts = [
    {
      title: 'Code Copilot',
      category: 'Programming',
      author: 'By ChaatGPT',
      desc: 'Expert coding mentor for architecture, algorithms, debugging, and clean code in any language.',
      icon: <Code size={20} className="text-emerald-500" />,
      starter: 'Help me design a clean, modular React hook architecture with caching and optimistic updates.',
    },
    {
      title: 'DALL-E Concept Artist',
      category: 'Image & Design',
      author: 'By OpenAI',
      desc: 'Transforms rough ideas into photorealistic art, UX mockups, and surreal 3D illustrations.',
      icon: <Palette size={20} className="text-pink-500" />,
      starter: 'Generate a detailed visual prompt for a futuristic glass greenhouse on Mars at blue hour.',
    },
    {
      title: 'Data Analyst & Visualizer',
      category: 'Analytics',
      author: 'By ChaatGPT',
      desc: 'Analyzes datasets, crafts Python pandas pipelines, and identifies key strategic business metrics.',
      icon: <LineChart size={20} className="text-sky-500" />,
      starter: 'How do I analyze customer cohort retention curves and calculate LTV/CAC ratios effectively?',
    },
    {
      title: 'Writing Coach',
      category: 'Productivity',
      author: 'By ChaatGPT',
      desc: 'Polishes essays, executive memos, and blog posts with crisp diction and persuasive rhythm.',
      icon: <BookOpen size={20} className="text-amber-500" />,
      starter: 'Review my announcement post and tighten the tone to sound authoritative yet approachable.',
    },
    {
      title: 'Math & Physics Tutor',
      category: 'Education',
      author: 'By ChaatGPT',
      desc: 'Step-by-step mathematical reasoning with LaTeX formulas and intuitive real-world proofs.',
      icon: <Calculator size={20} className="text-violet-500" />,
      starter: 'Derive the Euler-Lagrange equations from the principle of least action with an intuitive breakdown.',
    },
    {
      title: 'Prompt Engineer',
      category: 'Research',
      author: 'By ChaatGPT',
      desc: 'Refines system instructions, few-shot examples, and chain-of-thought prompts for LLMs.',
      icon: <Bot size={20} className="text-teal-500" />,
      starter: 'Optimize this prompt to extract structured JSON entities with strict type validation.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#282828] border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Explore GPTs
              </h2>
              <p className="text-xs text-zinc-500">
                Discover and use specialized versions of ChaatGPT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close Explore GPTs"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gpts.map((gpt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectGPT(gpt.title, gpt.starter);
                  onClose();
                }}
                className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left transition-all hover:scale-[1.01] group"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-700 shadow-xs shrink-0">
                  {gpt.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                      {gpt.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      {gpt.category}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {gpt.desc}
                  </p>
                  <div className="text-[10px] text-zinc-400 mt-2 font-medium">
                    {gpt.author}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
