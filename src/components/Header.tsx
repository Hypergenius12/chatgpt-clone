import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  PanelLeft,
  Share2,
  Sparkles,
  Zap,
  Brain,
  Cpu,
  Check,
  Code2,
  EyeOff,
  User,
  Sliders,
} from 'lucide-react';
import { ModelId, ModelOption, UserAccount } from '../types/chat';
import { getUserInitials } from '../utils/chatUtils';
import { OpenAILogo } from './OpenAILogo';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    tagline: 'Great for most tasks',
    badge: 'Plus',
    description: 'Our most intelligent and versatile flagship model for text, images, and creative work.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    tagline: 'Fastest for everyday tasks',
    badge: 'Free',
    description: 'Lightweight, rapid response model optimized for quick daily answers.',
  },
  {
    id: 'o1',
    name: 'o1',
    tagline: 'Deep reasoning',
    badge: 'Pro',
    description: 'Thinks systematically before responding to complex math, science, and coding problems.',
    reasoning: true,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    tagline: 'Fast reasoning',
    badge: 'Plus',
    description: 'High-speed reasoning model tailored for science, coding, and STEM.',
    reasoning: true,
  },
];

interface Props {
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isTemporaryChat: boolean;
  onToggleTemporaryChat: () => void;
  isCanvasOpen: boolean;
  onToggleCanvas: () => void;
  user: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onShare: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<Props> = ({
  selectedModel,
  onSelectModel,
  isSidebarOpen,
  onToggleSidebar,
  isTemporaryChat,
  onToggleTemporaryChat,
  isCanvasOpen,
  onToggleCanvas,
  user,
  onOpenAuth,
  onShare,
  onOpenSettings,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModelIcon = (id: ModelId) => {
    switch (id) {
      case 'gpt-4o':
        return <Sparkles size={16} className="text-emerald-500" />;
      case 'gpt-4o-mini':
        return <Zap size={16} className="text-amber-500" />;
      case 'o1':
        return <Brain size={16} className="text-violet-500" />;
      case 'o3-mini':
        return <Cpu size={16} className="text-sky-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-3 md:px-4 bg-white/90 dark:bg-[#212121]/90 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/60 select-none">
      {/* Left side: Sidebar toggle and Model Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar navigation"
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <PanelLeft size={19} />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-lg transition-colors group cursor-pointer"
            aria-label="Select model"
            aria-expanded={isDropdownOpen}
          >
            <OpenAILogo size={22} whiteBg />
            <span>ChaatGPT</span>
            <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
              {currentModel.name}
            </span>
            <ChevronDown
              size={16}
              className={`text-zinc-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-80 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-zinc-200 dark:border-zinc-700 shadow-xl py-2 z-50 text-sm">
              <div className="px-3 py-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                Model
              </div>
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors ${
                      isSelected ? 'bg-zinc-50 dark:bg-zinc-800/50' : ''
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {getModelIcon(model.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {model.name}
                        </span>
                        {model.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              model.badge === 'Pro'
                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                                : model.badge === 'Plus'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {model.tagline}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-emerald-500 mt-1 shrink-0" />
                    )}
                  </button>
                );
              })}

              <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
              <div className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                <span>Looking for custom instructions?</span>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenSettings();
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
                >
                  <Sliders size={12} />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Temporary chat indicator */}
        {isTemporaryChat && (
          <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800/40">
            <EyeOff size={12} />
            Temporary Chat
          </span>
        )}
      </div>

      {/* Right side actions: Temporary chat toggle, Canvas toggle, Share button, Settings */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          onClick={onToggleTemporaryChat}
          className={`p-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
            isTemporaryChat
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title={isTemporaryChat ? 'Turn off temporary chat' : 'Turn on temporary chat (history not saved)'}
          aria-label="Toggle temporary chat"
        >
          <EyeOff size={18} />
        </button>

        <button
          onClick={onToggleCanvas}
          className={`p-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
            isCanvasOpen
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title="Open Canvas"
          aria-label="Toggle Canvas split screen"
        >
          <Code2 size={18} />
        </button>

        {user ? (
          <>
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Share conversation"
              aria-label="Share chat"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* User avatar / profile button */}
            <button
              onClick={onOpenSettings}
              className="w-8 h-8 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center hover:opacity-90 transition-opacity ml-1 cursor-pointer"
              title={`${user.name} (${user.plan} Plan) - Settings`}
              aria-label="User profile and settings"
            >
              {getUserInitials(user.name)}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
              aria-label="Log in to account"
            >
              Log in
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Sign up for account"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
