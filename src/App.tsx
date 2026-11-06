import React, { useState, useEffect, useRef } from 'react';
import {
  ChatSession,
  Message,
  ModelId,
  Attachment,
  CanvasState,
  UserPreferences,
  UserAccount,
} from './types/chat';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { CanvasModal } from './components/CanvasModal';
import { VoiceModeModal } from './components/VoiceModeModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ExploreGPTsModal } from './components/ExploreGPTsModal';
import { ShareModal } from './components/ShareModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthModal } from './components/AuthModal';
import {
  extractThoughtAndContent,
  extractCanvasCodeBlock,
  generateChatTitleFallback,
  calculateTotalChatTokens,
  estimateTokens,
} from './utils/chatUtils';

const STORAGE_CHATS_KEY = 'chatgpt_clone_sessions_v1';
const STORAGE_PREFS_KEY = 'chatgpt_clone_preferences_v1';
const STORAGE_MODEL_KEY = 'chatgpt_clone_model_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  voice: 'alloy',
  customInstructions: {
    aboutUser: '',
    responseStyle: '',
  },
};

export default function App() {
  // Persistent state loading
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHATS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem('chatgpt_user_account_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.plan === 'Free' || parsed.plan === 'Plus' || parsed.plan === 'Pro')) {
          return parsed;
        }
      }
    } catch {}
    return {
      id: 'usr_free_default',
      name: 'Free Account',
      email: 'calebanne8@gmail.com',
      plan: 'Free',
    };
  });

  const [selectedModel, setSelectedModel] = useState<ModelId>(() => {
    try {
      const savedUser = localStorage.getItem('chatgpt_user_account_v1');
      const isPlus = savedUser ? JSON.parse(savedUser)?.plan === 'Plus' : false;
      const saved = localStorage.getItem(STORAGE_MODEL_KEY);
      if (saved && (isPlus || saved === 'gpt-4o-mini')) {
        return saved as ModelId;
      }
      return isPlus ? 'gpt-4o' : 'gpt-4o-mini';
    } catch {
      return 'gpt-4o-mini';
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({
    isOpen: false,
    mode: 'login',
  });

  // Modals state
  const [canvas, setCanvas] = useState<CanvasState>({
    isOpen: false,
    title: '',
    language: 'javascript',
    code: '',
  });

  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isExploreGPTsOpen, setIsExploreGPTsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const [sessionTokensUsed, setSessionTokensUsed] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('chatgpt_session_tokens_v1');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [activeKeyStatus, setActiveKeyStatus] = useState<'primary' | 'fallback'>('primary');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.activeKey) {
          setActiveKeyStatus(data.activeKey);
        }
      })
      .catch(() => {});
  }, [isLoading]);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync user account in localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('chatgpt_user_account_v1', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('chatgpt_user_account_v1');
      }
    } catch {}
  }, [currentUser]);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [preferences.theme]);

  // Save chats to localStorage (except temporary chats)
  useEffect(() => {
    if (!isTemporaryChat) {
      try {
        localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(chats));
      } catch (e) {
        console.warn('Could not save chats to localStorage', e);
      }
    }
  }, [chats, isTemporaryChat]);

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  // Save model
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MODEL_KEY, selectedModel);
    } catch {}
  }, [selectedModel]);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleNewChat();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCanvas((prev) => ({ ...prev, isOpen: !prev.isOpen }));
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setIsVoiceModeOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setIsExploreGPTsOpen(false);
        setIsShareOpen(false);
        setIsUpgradeOpen(false);
        if (canvas.isOpen) setCanvas((prev) => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canvas.isOpen]);

  const activeChat = chats.find((c) => c.id === currentChatId) || null;
  const currentMessages = activeChat ? activeChat.messages : [];

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentChatId(null);
  };

  const handleSelectChat = (id: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setCurrentChatId(id);
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleTogglePinChat = (id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  const handleArchiveChat = (id: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: true } : c))
    );
    if (currentChatId === id) {
      setCurrentChatId(null);
    }
  };

  const handleClearAllChats = () => {
    setChats([]);
    setCurrentChatId(null);
    localStorage.removeItem(STORAGE_CHATS_KEY);
  };

  const handleExportChats = () => {
    const data = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        preferences,
        chats,
      },
      null,
      2
    );
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatgpt-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send message and stream response from /api/chat
  const handleSendMessage = async (
    content: string,
    options: {
      attachments?: Attachment[];
      enableWebSearch: boolean;
    }
  ) => {
    if (!content.trim() && (!options.attachments || options.attachments.length === 0)) return;

    let chatId = currentChatId;
    let isNewChat = false;

    // If starting a fresh chat
    if (!chatId) {
      chatId = 'chat_' + Math.random().toString(36).substring(2, 11);
      isNewChat = true;
      const newSession: ChatSession = {
        id: chatId,
        title: generateChatTitleFallback(content),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
        messages: [],
      };

      if (!isTemporaryChat) {
        setChats((prev) => [newSession, ...prev]);
      }
      setCurrentChatId(chatId);
    }

    const userMessage: Message = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content,
      attachments: options.attachments,
      timestamp: Date.now(),
    };

    const assistantMessageId = 'msg_' + Math.random().toString(36).substring(2, 9);
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Update messages in chat
    const updatedMessages = [...(activeChat ? activeChat.messages : []), userMessage];

    setChats((prev) => {
      const existing = prev.find((c) => c.id === chatId);
      if (existing) {
        return prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...c.messages, userMessage, assistantMessage],
              }
            : c
        );
      } else {
        return [
          {
            id: chatId!,
            title: generateChatTitleFallback(content),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            model: selectedModel,
            messages: [userMessage, assistantMessage],
          },
          ...prev,
        ];
      }
    });

    setIsLoading(true);
    abortControllerRef.current = new AbortController();
    const startTime = Date.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          model: selectedModel,
          enableWebSearch: options.enableWebSearch,
          customInstructions: preferences.customInstructions,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let rawAccumulatedText = '';
      let searchSources: any[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]' || dataStr === '') continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === 'chunk' && parsed.text) {
                rawAccumulatedText += parsed.text;
                const { thought, content: cleanText } =
                  extractThoughtAndContent(rawAccumulatedText);

                setChats((prev) =>
                  prev.map((c) =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMessageId
                              ? {
                                  ...m,
                                  content: cleanText,
                                  thought,
                                  thinkingDurationSec: Math.max(
                                    1,
                                    Math.round((Date.now() - startTime) / 1000)
                                  ),
                                  isStreaming: true,
                                }
                              : m
                          ),
                        }
                      : c
                  )
                );
              } else if (parsed.type === 'sources' && parsed.sources) {
                searchSources = parsed.sources;
                setChats((prev) =>
                  prev.map((c) =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMessageId
                              ? { ...m, sources: searchSources }
                              : m
                          ),
                        }
                      : c
                  )
                );
              } else if (parsed.type === 'done') {
                // Done event
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error);
              }
            } catch (jsonErr) {
              // Ignore non-json lines
            }
          }
        }
      }

      // Finish streaming state
      const { thought, content: cleanText } = extractThoughtAndContent(rawAccumulatedText);
      const canvasCandidate = extractCanvasCodeBlock(cleanText);

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: cleanText,
                        thought,
                        sources: searchSources.length > 0 ? searchSources : undefined,
                        isStreaming: false,
                        thinkingDurationSec: Math.max(
                          1,
                          Math.round((Date.now() - startTime) / 1000)
                        ),
                      }
                    : m
                ),
              }
            : c
        )
      );

      // If user selected Canvas tool or response is a rich executable component, offer/open canvas
      if (canvasCandidate && canvasCandidate.isExecutable && canvas.isOpen) {
        setCanvas((prev) => ({
          ...prev,
          title: canvasCandidate.title || 'Canvas Snippet',
          language: canvasCandidate.language,
          code: canvasCandidate.code,
        }));
      }

      // Track session tokens
      const addedTokens = estimateTokens(cleanText) + (thought ? estimateTokens(thought) : 0);
      setSessionTokensUsed((prev) => {
        const nextVal = prev + addedTokens;
        try {
          localStorage.setItem('chatgpt_session_tokens_v1', String(nextVal));
        } catch {}
        return nextVal;
      });

      // Generate AI conversation title for new chats
      if (isNewChat && !isTemporaryChat) {
        fetch('/api/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: content }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.title) {
              handleRenameChat(chatId!, data.title);
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error generating response:', err);
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          error: err.message || 'Unable to connect to ChaatGPT server.',
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleRegenerateMessage = (_messageId: string) => {
    if (!activeChat || activeChat.messages.length === 0) return;
    // Find last user message
    const lastUserMsg = [...activeChat.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, {
        attachments: lastUserMsg.attachments,
        enableWebSearch: false,
      });
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!activeChat) return;
    const msgIndex = activeChat.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Truncate messages after this edit point
    const truncated = activeChat.messages.slice(0, msgIndex);
    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: truncated,
            }
          : c
      )
    );

    // Resend with edited content
    handleSendMessage(newContent, {
      enableWebSearch: false,
    });
  };

  const handleOpenCanvas = (code: string, language: string) => {
    setCanvas({
      isOpen: true,
      title: `${language.toUpperCase()} Snippet`,
      language,
      code,
    });
  };

  const handleAskCanvasEdit = (prompt: string) => {
    const editInstruction = `Here is the current code from my Canvas:\n\n\`\`\`${canvas.language}\n${canvas.code}\n\`\`\`\n\nPlease apply this edit: ${prompt}.\nReturn the updated complete code inside a triple backtick block.`;
    handleSendMessage(editInstruction, {
      enableWebSearch: false,
    });
  };

  const handleSelectModel = (model: ModelId) => {
    if (model !== 'gpt-4o-mini' && currentUser.plan === 'Free') {
      setIsUpgradeOpen(true);
      return;
    }
    setSelectedModel(model);
  };

  const lastAssistantMsg = [...currentMessages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#212121] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentChatId={currentChatId}
        chats={chats}
        user={currentUser}
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode: mode || 'login' })}
        onLogout={() => {
          const guestUser: UserAccount = {
            id: 'usr_free_guest',
            name: 'Free Account',
            email: 'calebanne8@gmail.com',
            plan: 'Free',
          };
          setCurrentUser(guestUser);
          setSelectedModel('gpt-4o-mini');
          try {
            localStorage.setItem('chatgpt_user_account_v1', JSON.stringify(guestUser));
          } catch {}
        }}
        onSelectChat={(id) => {
          handleSelectChat(id);
          setIsMobileSidebarOpen(false);
        }}
        onNewChat={() => {
          handleNewChat();
          setIsMobileSidebarOpen(false);
        }}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onArchiveChat={handleArchiveChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenExploreGPTs={() => setIsExploreGPTsOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              setIsMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarOpen((prev) => !prev);
            }
          }}
          isTemporaryChat={isTemporaryChat}
          onToggleTemporaryChat={() => setIsTemporaryChat((prev) => !prev)}
          isCanvasOpen={canvas.isOpen}
          onToggleCanvas={() => setCanvas((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
          user={currentUser}
          onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode: mode || 'login' })}
          onShare={() => setIsShareOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <div className="flex-1 flex flex-row h-[calc(100%-3.5rem)] overflow-hidden relative">
          <ChatArea
            messages={currentMessages}
            currentModel={selectedModel}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            onRegenerateMessage={handleRegenerateMessage}
            onEditMessage={handleEditMessage}
            onOpenCanvas={handleOpenCanvas}
            onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
          />

          {/* Canvas Split-Screen Panel */}
          <CanvasModal
            canvas={canvas}
            onClose={() => setCanvas((prev) => ({ ...prev, isOpen: false }))}
            onUpdateCode={(newCode) => setCanvas((prev) => ({ ...prev, code: newCode }))}
            onAskCanvasEdit={handleAskCanvasEdit}
          />
        </div>
      </div>

      {/* Full-Screen Voice Mode Simulation */}
      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        onVoiceTranscript={(transcript) => {
          handleSendMessage(transcript, {
            enableWebSearch: false,
          });
        }}
        lastAssistantText={lastAssistantMsg?.content}
      />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSavePreferences={setPreferences}
        onClearAllChats={handleClearAllChats}
        onExportChats={handleExportChats}
        tokenStats={{
          totalContextWindow: 1048576,
          sessionTokensUsed,
          activeChatTokens: calculateTotalChatTokens(currentMessages),
          tokensRemaining: Math.max(0, 1048576 - calculateTotalChatTokens(currentMessages)),
          activeKeyStatus,
          modelName: 'Gemini 3.1 Flash-Lite (1M Context)',
        }}
        onResetSessionTokens={() => {
          setSessionTokensUsed(0);
          try {
            localStorage.setItem('chatgpt_session_tokens_v1', '0');
          } catch {}
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ExploreGPTsModal
        isOpen={isExploreGPTsOpen}
        onClose={() => setIsExploreGPTsOpen(false)}
        onSelectGPT={(name, prompt) => {
          handleSendMessage(prompt, {
            enableWebSearch: false,
          });
        }}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        chat={activeChat}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentPlan={currentUser.plan}
        onUpgradeSuccess={() => {
          setCurrentUser((prev) => ({ ...prev, plan: 'Plus' }));
          setSelectedModel('gpt-4o');
        }}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={() => setAuthModalState((prev) => ({ ...prev, isOpen: false }))}
        onLogin={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
