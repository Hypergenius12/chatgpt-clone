import React, { useState, useRef, useEffect } from 'react';
import {
  SquarePen,
  Search,
  Compass,
  Pin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  Sparkles,
  Settings,
  Keyboard,
  Sliders,
  LogOut,
  ChevronRight,
  X,
  MessageSquare,
  LogIn,
} from 'lucide-react';
import { ChatSession, UserAccount } from '../types/chat';
import { groupChatsByDate, getUserInitials } from '../utils/chatUtils';
import { OpenAILogo } from './OpenAILogo';

interface Props {
  isOpen: boolean;
  isMobileOpen?: boolean;
  onCloseMobile: () => void;
  currentChatId: string | null;
  chats: ChatSession[];
  user: UserAccount | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePinChat: (id: string) => void;
  onArchiveChat: (id: string) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenExploreGPTs: () => void;
  onOpenUpgrade: () => void;
}

export const Sidebar: React.FC<Props> = ({
  isOpen,
  isMobileOpen = false,
  onCloseMobile,
  currentChatId,
  chats,
  user,
  onOpenAuth,
  onLogout,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  onArchiveChat,
  onOpenSettings,
  onOpenShortcuts,
  onOpenExploreGPTs,
  onOpenUpgrade,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const filteredChats = searchQuery.trim()
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  const grouped = groupChatsByDate(filteredChats);

  const handleStartRename = (chat: ChatSession) => {
    setEditingId(chat.id);
    setEditingTitle(chat.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameChat(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const renderChatGroup = (title: string, groupList: ChatSession[]) => {
    if (!groupList || groupList.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 py-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {title}
        </div>
        <div className="space-y-0.5 mt-0.5">
          {groupList.map((chat) => {
            const isActive = chat.id === currentChatId;
            const isEditing = chat.id === editingId;

            return (
              <div
                key={chat.id}
                className={`group relative flex items-center h-9 px-3 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-zinc-200/80 dark:bg-[#2f2f2f] text-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-[#2a2a2a]'
                }`}
                onClick={() => {
                  if (!isEditing) onSelectChat(chat.id);
                }}
              >
                {/* Chat title / editing input */}
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleSaveRename(chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(chat.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white dark:bg-zinc-800 px-2 py-0.5 rounded text-sm text-zinc-900 dark:text-zinc-100 border border-emerald-500 outline-none"
                  />
                ) : (
                  <div className="flex-1 truncate pr-6 text-[13.5px]">
                    {chat.title}
                  </div>
                )}

                {/* Pin indicator */}
                {chat.isPinned && !isActive && (
                  <Pin
                    size={12}
                    className="absolute right-3 text-zinc-400 dark:text-zinc-500 group-hover:hidden"
                  />
                )}

                {/* More options button */}
                {!isEditing && (
                  <div className="absolute right-2 flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(
                          activeMenuId === chat.id ? null : chat.id
                        );
                      }}
                      className={`p-1 rounded-md text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-opacity ${
                        isActive || activeMenuId === chat.id
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label="Chat options"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {/* Chat Context Menu */}
                    {activeMenuId === chat.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-white dark:bg-[#2f2f2f] border border-zinc-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onTogglePinChat(chat.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                        >
                          <Pin size={13} />
                          <span>{chat.isPinned ? 'Unpin' : 'Pin chat'}</span>
                        </button>
                        <button
                          onClick={() => handleStartRename(chat)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                        >
                          <Pencil size={13} />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={() => {
                            onArchiveChat(chat.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                        >
                          <Archive size={13} />
                          <span>Archive</span>
                        </button>
                        <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                        <button
                          onClick={() => {
                            onDeleteChat(chat.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 size={13} />
                          <span>Delete chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#f9f9f9] dark:bg-[#171717] border-r border-zinc-200/80 dark:border-zinc-800 transition-all duration-300 select-none ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isOpen ? 'md:w-64' : 'md:w-0 md:border-r-0 md:overflow-hidden md:opacity-0'}`}
      >
        {/* Top brand header & action buttons */}
        <div className="flex items-center justify-between p-3 border-b border-transparent">
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors font-medium text-sm flex-1 mr-1"
            title="New chat"
            aria-label="Start a new chat"
          >
            <OpenAILogo size={18} whiteBg />
            <span>New chat</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
            title="Search chats"
            aria-label="Search past conversations"
          >
            <Search size={17} />
          </button>

          <button
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 md:hidden cursor-pointer"
            aria-label="Close mobile sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search input field if toggled */}
        {isSearchOpen && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Nav Shortcuts */}
        <div className="px-3 py-1 space-y-0.5">
          <button
            onClick={onOpenExploreGPTs}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            <Compass size={17} className="text-zinc-500" />
            <span className="text-[13.5px]">Explore GPTs</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            <>
              {renderChatGroup('Pinned', grouped.pinned)}
              {renderChatGroup('Today', grouped.today)}
              {renderChatGroup('Yesterday', grouped.yesterday)}
              {renderChatGroup('Previous 7 Days', grouped.previous7Days)}
              {renderChatGroup('Previous 30 Days', grouped.previous30Days)}
              {renderChatGroup('Older', grouped.older)}
            </>
          )}
        </div>

        {/* Upgrade Plan Promo Card */}
        <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/80">
          <button
            onClick={onOpenUpgrade}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-left transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Upgrade plan
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  More access to best models
                </div>
              </div>
            </div>
            <ChevronRight
              size={14}
              className="text-zinc-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>

        {/* User Profile Dock or Guest Auth Banner */}
        {user ? (
          <div className="relative p-3 pt-0" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors text-left cursor-pointer"
              aria-label="User account settings"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                  {getUserInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.plan} Plan
                  </div>
                </div>
              </div>
              <MoreHorizontal size={16} className="text-zinc-400" />
            </button>

            {/* Profile Menu Popup */}
            {isProfileMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-white dark:bg-[#2f2f2f] border border-zinc-200 dark:border-zinc-700 shadow-2xl py-1.5 z-50 text-sm">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
                >
                  <Sliders size={16} className="text-zinc-500" />
                  <span>Customize ChaatGPT</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
                >
                  <Settings size={16} className="text-zinc-500" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
                >
                  <Keyboard size={16} className="text-zinc-500" />
                  <span>Keyboard shortcuts</span>
                </button>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition-colors cursor-pointer"
                >
                  <LogOut size={16} className="text-zinc-500" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/80">
            <div className="p-3 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-left">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Sign up or log in
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Save your chat history, personalize your settings, and more.
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex-1 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity text-center cursor-pointer shadow-xs"
                >
                  Log in
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="flex-1 py-1.5 rounded-full text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors text-center cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </div>

            {/* Quick Guest Settings & Shortcuts Row */}
            <div className="flex items-center justify-between px-2 pt-2 text-zinc-400 text-xs">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings size={14} />
                <span className="text-[11.5px]">Settings</span>
              </button>
              <button
                onClick={onOpenShortcuts}
                className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                title="Shortcuts"
              >
                <Keyboard size={14} />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
