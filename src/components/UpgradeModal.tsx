import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
  currentPlan?: 'Free' | 'Plus' | 'Pro';
}

export const UpgradeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
  currentPlan = 'Free',
}) => {
  const [upgraded, setUpgraded] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setUpgraded(true);
    setTimeout(() => {
      onUpgradeSuccess();
      onClose();
    }, 1200);
  };

  const isPlus = currentPlan === 'Plus' || currentPlan === 'Pro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#282828] border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Upgrade your plan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            aria-label="Close upgrade dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {/* Free Plan */}
          <div
            className={`p-5 rounded-2xl border flex flex-col justify-between ${
              !isPlus
                ? 'border-emerald-500/80 bg-zinc-50/80 dark:bg-zinc-800/60 shadow-sm'
                : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Free
                </span>
                {!isPlus && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                    Your current plan
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-3">
                $0 <span className="text-xs font-normal text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                For everyday tasks and casual discovery.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-zinc-400 shrink-0" />
                  <span>Access to GPT-4o mini</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-zinc-400 shrink-0" />
                  <span>Standard response speed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-zinc-400 shrink-0" />
                  <span>Web Search & image upload</span>
                </li>
              </ul>
            </div>

            <button
              disabled
              className={`mt-6 w-full py-2.5 rounded-xl border text-xs font-medium cursor-default ${
                !isPlus
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
              }`}
            >
              {!isPlus ? 'Current Plan' : 'Free Tier'}
            </button>
          </div>

          {/* Plus Plan */}
          <div
            className={`p-5 rounded-2xl flex flex-col justify-between relative shadow-lg ${
              isPlus
                ? 'border-2 border-emerald-500 bg-emerald-50/15 dark:bg-emerald-950/30'
                : 'border-2 border-emerald-500/80 bg-emerald-50/10 dark:bg-emerald-950/20'
            }`}
          >
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-semibold tracking-wide uppercase shadow-xs">
              {isPlus ? 'Active Plan' : 'Popular'}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  Plus
                </span>
                <Sparkles size={14} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-3">
                $20 <span className="text-xs font-normal text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Supercharge productivity with all flagship models.
              </p>

              <ul className="mt-5 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-200 font-medium">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Full access to GPT-4o & o1 reasoning</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Interactive Canvas workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>Advanced Voice Mode with real-time speech</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  <span>5x more messages & priority compute</span>
                </li>
              </ul>
            </div>

            {isPlus ? (
              <button
                disabled
                className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/30 cursor-default"
              >
                Current Active Plan
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                className="mt-6 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                {upgraded ? 'Welcome to Plus!' : 'Upgrade to Plus'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
