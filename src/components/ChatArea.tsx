import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Globe,
  Code2,
  Mic,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Pencil,
  X,
  Square,
  Sparkles,
  Image as ImageIcon,
  BookOpen,
  Lightbulb,
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  UploadCloud,
} from 'lucide-react';
import { Message, ModelId, Attachment } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { OpenAILogo } from './OpenAILogo';

interface Props {
  messages: Message[];
  currentModel: ModelId;
  isLoading: boolean;
  onSendMessage: (
    content: string,
    options: {
      attachments?: Attachment[];
      enableWebSearch: boolean;
    }
  ) => void;
  onStopGeneration?: () => void;
  onRegenerateMessage?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onOpenCanvas?: (code: string, language: string) => void;
  onOpenVoiceMode: () => void;
}

export const ChatArea: React.FC<Props> = ({
  messages,
  currentModel,
  isLoading,
  onSendMessage,
  onStopGeneration,
  onRegenerateMessage,
  onEditMessage,
  onOpenCanvas,
  onOpenVoiceMode,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editMsgContent, setEditMsgContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputValue.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage(inputValue.trim(), {
      attachments,
      enableWebSearch,
    });

    setInputValue('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (fileList: File[]) => {
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = reader.result as string;
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let mime = file.type || 'application/octet-stream';
        if (!file.type) {
          if (ext === 'docx') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          else if (ext === 'doc') mime = 'application/msword';
          else if (ext === 'xlsx') mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          else if (ext === 'xls') mime = 'application/vnd.ms-excel';
          else if (ext === 'csv') mime = 'text/csv';
          else if (ext === 'pdf') mime = 'application/pdf';
        }
        setAttachments((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            mimeType: mime,
            data,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addFiles(Array.from(files));
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const renderAttachmentIcon = (name: string, mime: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'docx' || ext === 'doc' || mime.includes('word')) {
      return (
        <div className="w-5 h-5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[9px] shrink-0">
          DOC
        </div>
      );
    }
    if (['xlsx', 'xls', 'csv', 'tsv'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) {
      return (
        <div className="w-5 h-5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[9px] shrink-0">
          XLS
        </div>
      );
    }
    if (ext === 'pdf' || mime.includes('pdf')) {
      return (
        <div className="w-5 h-5 rounded bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[9px] shrink-0">
          PDF
        </div>
      );
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FileArchive size={14} className="text-amber-500 shrink-0" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'sql'].includes(ext)) {
      return <FileCode size={14} className="text-violet-500 shrink-0" />;
    }
    return <FileText size={14} className="text-zinc-500 shrink-0" />;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (messageId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(messageId);
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMsgId(msg.id);
    setEditMsgContent(msg.content);
  };

  const handleSaveEdit = (id: string) => {
    if (onEditMessage && editMsgContent.trim()) {
      onEditMessage(id, editMsgContent.trim());
    }
    setEditingMsgId(null);
  };

  const promptSuggestions = [
    {
      title: 'Create image',
      desc: 'a cozy cyberpunk coffee shop at sunset',
      icon: <ImageIcon size={18} className="text-emerald-500" />,
      prompt: 'Generate a vibrant detailed image concept of a cozy cyberpunk coffee shop with neon lights and rain on the window.',
    },
    {
      title: 'Analyze code',
      desc: 'find edge cases in an async queue',
      icon: <Code2 size={18} className="text-violet-500" />,
      prompt: 'Review and optimize this TypeScript concurrency throttle queue implementation with edge cases for errors and timeouts.',
    },
    {
      title: 'Summarize text',
      desc: 'key insights and bullet takeaways',
      icon: <BookOpen size={18} className="text-amber-500" />,
      prompt: 'Summarize the foundational principles of quantum computing and explain superposition simply.',
    },
    {
      title: 'Brainstorm ideas',
      desc: 'innovative AI tool names & hooks',
      icon: <Lightbulb size={18} className="text-sky-500" />,
      prompt: 'Brainstorm 5 innovative startup concepts combining real-time canvas collaboration with AI agents.',
    },
  ];

  return (
    <div
      className="flex-1 flex flex-col h-full bg-white dark:bg-[#212121] overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & drop visual dropzone overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-emerald-500/10 dark:bg-emerald-500/20 backdrop-blur-xs border-2 border-dashed border-emerald-500 rounded-3xl m-3 flex flex-col items-center justify-center pointer-events-none transition-all">
          <UploadCloud size={48} className="text-emerald-500 animate-bounce mb-3" />
          <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Drop files to attach
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Word documents (.docx), Excel spreadsheets (.xlsx, .csv), PDFs, Code, & any file
          </div>
        </div>
      )}

      {/* Messages area or Empty Greeting */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center px-4 -mt-10">
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-800 dark:text-zinc-100 mb-8 tracking-tight">
              What can I help with?
            </h1>

            {/* Prompt suggestions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
              {promptSuggestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(item.prompt, { enableWebSearch })}
                  className="flex items-start gap-3 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#2a2a2a]/60 hover:bg-zinc-100 dark:hover:bg-[#303030] text-left transition-all hover:scale-[1.01] group shadow-xs"
                >
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-4">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const isSourcesOpen = expandedSources[message.id] ?? false;
              const isEditing = editingMsgId === message.id;

              return (
                <div
                  key={message.id}
                  className={`flex flex-col group ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {isUser ? (
                    // User Message Bubble
                    <div className="max-w-[85%] flex flex-col items-end">
                      {/* Attachments preview */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {message.attachments.map((att) => (
                            <div
                              key={att.id}
                              className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/90 shadow-xs"
                            >
                              {att.mimeType.startsWith('image/') ? (
                                <img
                                  src={att.data}
                                  alt={att.name}
                                  className="object-cover max-w-[240px] max-h-[180px] rounded-2xl"
                                />
                              ) : (
                                <div className="flex items-center gap-2.5 p-2.5 px-3.5 max-w-[280px]">
                                  {renderAttachmentIcon(att.name, att.mimeType)}
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                      {att.name}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                      {att.size ? `${(att.size / 1024).toFixed(0)} KB` : 'Document'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content or Edit Form */}
                      {isEditing ? (
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 p-3 rounded-2xl border border-emerald-500">
                          <textarea
                            value={editMsgContent}
                            onChange={(e) => setEditMsgContent(e.target.value)}
                            className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setEditingMsgId(null)}
                              className="px-3 py-1 text-xs rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(message.id)}
                              className="px-3 py-1 text-xs rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700"
                            >
                              Save & Resend
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group/msg">
                          <div className="bg-[#f4f4f4] dark:bg-[#303030] text-zinc-900 dark:text-zinc-100 rounded-3xl px-5 py-3 text-[15px] leading-relaxed shadow-xs break-words">
                            {message.content}
                          </div>

                          {/* User action button: Edit */}
                          <button
                            onClick={() => handleStartEdit(message)}
                            className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 opacity-0 group-hover/msg:opacity-100 transition-opacity"
                            title="Edit message"
                            aria-label="Edit message"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Assistant Message
                    <div className="w-full flex gap-3 sm:gap-4 items-start">
                      {/* Avatar with solid white background */}
                      <div className="w-8 h-8 rounded-full border border-zinc-200 bg-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 p-1 overflow-hidden">
                        <img
                          src="/assets/aistudio/Bold_Interlocking_Knot_Emblem_1928f362.png"
                          alt="ChaatGPT"
                          className="w-full h-full object-contain select-none pointer-events-none"
                        />
                      </div>

                      {/* Content block */}
                      <div className="flex-1 min-w-0">

                        {/* Web search sources citations pill */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mb-3">
                            <button
                              onClick={() =>
                                setExpandedSources((prev) => ({
                                  ...prev,
                                  [message.id]: !isSourcesOpen,
                                }))
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 hover:bg-sky-100 transition-colors"
                            >
                              <Globe size={12} />
                              <span>Searched {message.sources.length} sources</span>
                              {isSourcesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>

                            {isSourcesOpen && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {message.sources.map((source, idx) => (
                                  <a
                                    key={idx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-zinc-200 dark:border-zinc-700"
                                  >
                                    <span className="truncate max-w-[160px]">{source.title}</span>
                                    <ExternalLink size={10} className="shrink-0" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Main Response Markdown */}
                        {message.content ? (
                          <MarkdownRenderer
                            content={message.content}
                            onOpenCanvas={onOpenCanvas}
                          />
                        ) : (
                          message.isStreaming && (
                            <div className="flex items-center gap-2 text-zinc-400 text-sm py-1">
                              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping" />
                              <span>Generating...</span>
                            </div>
                          )
                        )}

                        {/* Error message if any */}
                        {message.error && (
                          <div className="mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg p-2.5">
                            {message.error}
                          </div>
                        )}

                        {/* Action buttons toolbar under response */}
                        {!message.isStreaming && message.content && (
                          <div className="flex items-center gap-1 mt-3 pt-1 text-zinc-400 dark:text-zinc-500">
                            <button
                              onClick={() => handleCopy(message.id, message.content)}
                              className="p-1.5 rounded-md hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Copy response"
                              aria-label="Copy response"
                            >
                              {copiedId === message.id ? (
                                <Check size={15} className="text-emerald-500" />
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleSpeak(message.id, message.content)
                              }
                              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                                speakingMessageId === message.id
                                  ? 'text-emerald-500'
                                  : 'hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                              title={
                                speakingMessageId === message.id
                                  ? 'Stop speaking'
                                  : 'Read aloud'
                              }
                              aria-label="Read response aloud"
                            >
                              {speakingMessageId === message.id ? (
                                <VolumeX size={15} />
                              ) : (
                                <Volume2 size={15} />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                setFeedbackState((prev) => ({
                                  ...prev,
                                  [message.id]: prev[message.id] === 'up' ? undefined! : 'up',
                                }))
                              }
                              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                                feedbackState[message.id] === 'up'
                                  ? 'text-emerald-500'
                                  : 'hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                              title="Good response"
                              aria-label="Mark as good response"
                            >
                              <ThumbsUp size={15} />
                            </button>

                            <button
                              onClick={() =>
                                setFeedbackState((prev) => ({
                                  ...prev,
                                  [message.id]: prev[message.id] === 'down' ? undefined! : 'down',
                                }))
                              }
                              className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                                feedbackState[message.id] === 'down'
                                  ? 'text-red-500'
                                  : 'hover:text-zinc-800 dark:hover:text-zinc-200'
                              }`}
                              title="Bad response"
                              aria-label="Mark as bad response"
                            >
                              <ThumbsDown size={15} />
                            </button>

                            {onRegenerateMessage && (
                              <button
                                onClick={() => onRegenerateMessage(message.id)}
                                className="p-1.5 rounded-md hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1"
                                title="Regenerate response"
                                aria-label="Regenerate response"
                              >
                                <RotateCcw size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Omnibox / Prompt Input Bar */}
      <div className="p-3 md:p-4 bg-transparent max-w-3xl mx-auto w-full z-10">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#2f2f2f] shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-500 focus-within:shadow-md transition-all p-2.5 md:p-3">
          {/* Attachments chips if uploaded */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pb-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <img
                      src={att.data}
                      alt={att.name}
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : (
                    renderAttachmentIcon(att.name, att.mimeType)
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="truncate max-w-[130px] font-medium leading-tight">{att.name}</span>
                    {att.size && (
                      <span className="text-[10px] text-zinc-400 leading-tight">
                        {(att.size / 1024).toFixed(0)} KB
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                    }
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ml-1"
                    aria-label="Remove attachment"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            className="w-full bg-transparent px-2.5 py-1 text-[15px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none resize-none max-h-52 leading-relaxed"
          />

          {/* Input tools & action row */}
          <div className="flex items-center justify-between pt-2 border-t border-transparent">
            {/* Left buttons: Attach + tool pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* File upload hidden input - accepts ANY file format */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Attach photos and documents"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>

              {/* Web Search Tool Pill */}
              <button
                type="button"
                onClick={() => setEnableWebSearch(!enableWebSearch)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  enableWebSearch
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                }`}
                title="Search the live web"
                aria-pressed={enableWebSearch}
              >
                <Globe size={13} />
                <span>Search</span>
              </button>

              </div>

            {/* Right buttons: Voice mode + Send / Stop button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenVoiceMode}
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Voice mode"
                aria-label="Start voice mode"
              >
                <Mic size={18} />
              </button>

              {isLoading ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center hover:opacity-85 transition-opacity"
                  title="Stop generating"
                  aria-label="Stop generation"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={!inputValue.trim() && attachments.length === 0}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    inputValue.trim() || attachments.length > 0
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-85'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                  }`}
                  title="Send message"
                  aria-label="Send message"
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ChaatGPT disclaimer */}
        <div className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
          ChaatGPT can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
};
