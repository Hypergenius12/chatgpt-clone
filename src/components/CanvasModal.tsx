import React, { useState } from 'react';
import {
  X,
  Play,
  Code2,
  Copy,
  Check,
  Download,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { CanvasState } from '../types/chat';

interface Props {
  canvas: CanvasState;
  onClose: () => void;
  onUpdateCode: (newCode: string) => void;
  onAskCanvasEdit?: (prompt: string) => void;
}

export const CanvasModal: React.FC<Props> = ({
  canvas,
  onClose,
  onUpdateCode,
  onAskCanvasEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [copied, setCopied] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!canvas.isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(canvas.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([canvas.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas-export.${canvas.language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || !onAskCanvasEdit) return;
    onAskCanvasEdit(editPrompt.trim());
    setEditPrompt('');
  };

  const isExecutable = ['html', 'javascript', 'js', 'css', 'svg'].includes(
    canvas.language.toLowerCase()
  );

  return (
    <div
      className={`bg-white dark:bg-[#1e1e1e] border-l border-zinc-200 dark:border-zinc-800 shadow-xl transition-all duration-300 flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-full h-full'
          : 'fixed md:relative inset-y-0 right-0 z-30 md:z-10 w-full md:w-[48%] lg:w-[45%] h-full shrink-0'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Code2 size={16} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {canvas.title || 'Canvas'}
            </h2>
            <div className="text-[11px] text-zinc-500 font-mono lowercase">
              {canvas.language}
            </div>
          </div>
        </div>

        {/* Tab switchers if executable */}
        {isExecutable && (
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Code2 size={13} />
              <span>Code</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Play size={13} />
              <span>Preview</span>
            </button>
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1 text-zinc-500">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            title="Copy all code"
            aria-label="Copy canvas code"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            title="Download file"
            aria-label="Download code file"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hidden sm:inline-flex"
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            aria-label="Toggle full screen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            title="Close Canvas"
            aria-label="Close Canvas"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Workspace: Code Editor or Sandbox Preview */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' || !isExecutable ? (
          <textarea
            value={canvas.code}
            onChange={(e) => onUpdateCode(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-4 font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 bg-white dark:bg-[#1e1e1e] outline-none resize-none selection:bg-emerald-500/20"
            placeholder="Type or paste code here..."
          />
        ) : (
          <iframe
            srcDoc={canvas.code}
            title="Canvas Live Preview"
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-white"
          />
        )}
      </div>

      {/* Canvas AI Quick Edit Bar */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
        <form onSubmit={handlePromptSubmit} className="relative flex items-center">
          <Sparkles
            size={15}
            className="absolute left-3 text-emerald-600 dark:text-emerald-400 pointer-events-none"
          />
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="Ask ChaatGPT to edit or improve this canvas..."
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-9 pr-20 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!editPrompt.trim()}
            className={`absolute right-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              editPrompt.trim()
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Edit
          </button>
        </form>
      </div>
    </div>
  );
};
