import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { label: 'Open new chat', keys: ['Ctrl', 'Shift', 'O'] },
    { label: 'Toggle sidebar', keys: ['Ctrl', 'Shift', 'S'] },
    { label: 'Focus prompt input', keys: ['/'] },
    { label: 'Submit message', keys: ['Enter'] },
    { label: 'New line in prompt', keys: ['Shift', 'Enter'] },
    { label: 'Close dialog / modal', keys: ['Esc'] },
    { label: 'Toggle Voice Mode', keys: ['Ctrl', 'Shift', 'V'] },
    { label: 'Open Canvas workspace', keys: ['Ctrl', 'Shift', 'K'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#282828] border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-zinc-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Keyboard shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close shortcuts"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="p-6 divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
          {shortcuts.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <span className="text-zinc-700 dark:text-zinc-300 text-xs">
                {item.label}
              </span>
              <div className="flex items-center gap-1">
                {item.keys.map((k, kidx) => (
                  <kbd
                    key={kidx}
                    className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] border border-zinc-200 dark:border-zinc-700 shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
