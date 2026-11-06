import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Laptop,
  Sliders,
  Volume2,
  Database,
  Trash2,
  Download,
  Check,
  Cpu,
  KeyRound,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { UserPreferences, TokenUsageStats } from '../types/chat';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => void;
  onClearAllChats: () => void;
  onExportChats: () => void;
  tokenStats?: TokenUsageStats;
  onResetSessionTokens?: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  onClearAllChats,
  onExportChats,
  tokenStats,
  onResetSessionTokens,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'usage' | 'personalization' | 'speech' | 'data'>('general');
  const [theme, setTheme] = useState(preferences.theme);
  const [voice, setVoice] = useState(preferences.voice);
  const [aboutUser, setAboutUser] = useState(preferences.customInstructions.aboutUser);
  const [responseStyle, setResponseStyle] = useState(preferences.customInstructions.responseStyle);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePreferences({
      theme,
      voice,
      customInstructions: {
        aboutUser,
        responseStyle,
      },
    });
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 600);
  };

  const totalCapacity = tokenStats?.totalContextWindow || 1048576;
  const activeTokens = tokenStats?.activeChatTokens || 0;
  const sessionTokens = tokenStats?.sessionTokensUsed || 0;
  const tokensRemaining = Math.max(0, totalCapacity - activeTokens);
  const percentUsed = Math.min(100, Math.max(0.01, (activeTokens / totalCapacity) * 100));

  const voices = [
    { id: 'alloy', name: 'Alloy', desc: 'Neutral and balanced' },
    { id: 'echo', name: 'Echo', desc: 'Warm and conversational' },
    { id: 'fable', name: 'Fable', desc: 'Expressive and engaging' },
    { id: 'onyx', name: 'Onyx', desc: 'Deep and authoritative' },
    { id: 'nova', name: 'Nova', desc: 'Energetic and bright' },
    { id: 'shimmer', name: 'Shimmer', desc: 'Clear and pleasant' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#282828] border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body with Sidebar Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs */}
          <div className="w-full md:w-52 p-2 border-r border-zinc-200 dark:border-zinc-700/80 flex md:flex-col gap-1 overflow-x-auto text-sm shrink-0">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-zinc-100 dark:bg-zinc-700/60 font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50'
              }`}
            >
              <Moon size={16} />
              <span>General</span>
            </button>

            {/* Tokens & Usage Tab */}
            <button
              onClick={() => setActiveTab('usage')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'usage'
                  ? 'bg-zinc-100 dark:bg-zinc-700/60 font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50'
              }`}
            >
              <Cpu size={16} className="text-emerald-500" />
              <span>Tokens & Limits</span>
            </button>

            <button
              onClick={() => setActiveTab('personalization')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'personalization'
                  ? 'bg-zinc-100 dark:bg-zinc-700/60 font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50'
              }`}
            >
              <Sliders size={16} />
              <span>Personalization</span>
            </button>

            <button
              onClick={() => setActiveTab('speech')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'speech'
                  ? 'bg-zinc-100 dark:bg-zinc-700/60 font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50'
              }`}
            >
              <Volume2 size={16} />
              <span>Speech</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-zinc-100 dark:bg-zinc-700/60 font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50'
              }`}
            >
              <Database size={16} />
              <span>Data controls</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-sm text-zinc-800 dark:text-zinc-200">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1.5 text-zinc-900 dark:text-zinc-100">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'dark', label: 'Dark', icon: <Moon size={15} /> },
                      { id: 'light', label: 'Light', icon: <Sun size={15} /> },
                      { id: 'system', label: 'System', icon: <Laptop size={15} /> },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTheme(opt.id as any)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          theme === opt.id
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tokens & Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-1 flex items-center gap-2">
                    <Cpu size={18} className="text-emerald-500" />
                    <span>Context Window & Token Budget</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Your current model runs with the highest token limit context window available in the industry.
                  </p>
                </div>

                {/* Main Token Gauge Card */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Tokens Remaining
                      </div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                        {tokensRemaining.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-zinc-500">
                          / {totalCapacity.toLocaleString()} tokens
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {(100 - percentUsed).toFixed(2)}% Available
                    </span>
                  </div>

                  {/* Progress meter */}
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(1, percentUsed)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-700/60 text-xs">
                    <div>
                      <span className="text-zinc-500">Active Chat Tokens:</span>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                        {activeTokens.toLocaleString()} tokens
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500">Session Total Generated:</span>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                        {sessionTokens.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Keys & Automatic Failover System */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound size={16} className="text-sky-500" />
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                        Dual API Key Failover Status
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                      <ShieldCheck size={13} /> Automatic Failover Active
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                      <div>
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          Primary Key
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          •••••••••••••••• (Secure Env)
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {tokenStats?.activeKeyStatus === 'fallback' ? 'Standby' : 'Active (Primary)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                      <div>
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">
                          Fallback Key
                        </div>
                        <div className="text-[11px] font-mono text-zinc-400">
                          •••••••••••••••• (Secure Env)
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        {tokenStats?.activeKeyStatus === 'fallback' ? 'Active (In Use)' : 'Ready on 429/503'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Model Specs */}
                <div className="p-3.5 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-700/40 text-xs space-y-1.5 text-zinc-500 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Engine:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      Gemini 3.1 Flash-Lite (Highest Token Limit)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maximum Context:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      1,048,576 tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multimodal Features:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      Text, Canvas Code, AI Images, Reasoning
                    </span>
                  </div>
                </div>

                {/* Reset token counter button */}
                {onResetSessionTokens && (
                  <button
                    onClick={onResetSessionTokens}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Session Token Counter</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'personalization' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">
                    What would you like ChaatGPT to know about you to provide better responses?
                  </label>
                  <textarea
                    rows={4}
                    value={aboutUser}
                    onChange={(e) => setAboutUser(e.target.value)}
                    placeholder="e.g. Where are you based? What do you do for work? What are your hobbies and interests?"
                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs leading-relaxed outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">
                    How would you like ChaatGPT to respond?
                  </label>
                  <textarea
                    rows={4}
                    value={responseStyle}
                    onChange={(e) => setResponseStyle(e.target.value)}
                    placeholder="e.g. How formal or casual should ChaatGPT be? How long or short should responses generally be? How should ChaatGPT address you?"
                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs leading-relaxed outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'speech' && (
              <div className="space-y-3">
                <label className="block font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                  Voice Selection
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {voices.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVoice(v.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        voice === v.id
                          ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {v.name}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {v.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700/60">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      Download Full Source Code (ZIP)
                    </div>
                    <div className="text-xs text-zinc-500">
                      Export the complete project bundle with Git repository ready to push to GitHub.
                    </div>
                  </div>
                  <a
                    href="/api/download-zip"
                    download="chatgpt-clone.zip"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
                  >
                    <Download size={14} />
                    <span>Download ZIP</span>
                  </a>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700/60">
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      Export chat history
                    </div>
                    <div className="text-xs text-zinc-500">
                      Download a JSON file containing all your conversations.
                    </div>
                  </div>
                  <button
                    onClick={onExportChats}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Export</span>
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-red-600 dark:text-red-400">
                      Delete all chats
                    </div>
                    <div className="text-xs text-zinc-500">
                      Permanently remove all conversations from local storage.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete all conversations?')) {
                        onClearAllChats();
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-medium cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Delete all</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-800/40">
          <div>
            {showSavedToast && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check size={14} /> Saved!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
