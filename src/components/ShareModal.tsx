import React, { useState } from 'react';
import { X, Share2, Check, Copy, Link, Globe } from 'lucide-react';
import { ChatSession } from '../types/chat';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chat: ChatSession | null;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, chat }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !chat) return null;

  const shareUrl = `${window.location.origin}/share/${chat.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#282828] border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-zinc-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Share link to Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Messages you send after creating your link won't be shared. Anyone with the URL will be able to view this conversation.
          </p>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {chat.title}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {chat.messages.length} messages • Model: {chat.model}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 font-mono truncate border border-zinc-200 dark:border-zinc-700">
              <Link size={14} className="mr-2 text-zinc-400 shrink-0" />
              <span className="truncate">{shareUrl}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
