export type ModelId = 'gpt-4o' | 'gpt-4o-mini' | 'o1' | 'o3-mini';

export interface ModelOption {
  id: ModelId;
  name: string;
  tagline: string;
  badge?: string;
  description: string;
  reasoning?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64 data URL
  size?: number;
}

export interface SearchSource {
  title: string;
  url: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  revisedPrompt?: string;
}

export interface GeneratedFile {
  name: string;
  content: string;
  language: string;
  sizeBytes?: number;
}

export interface TokenUsageStats {
  totalContextWindow: number; // 1,048,576
  sessionTokensUsed: number;
  activeChatTokens: number;
  tokensRemaining: number;
  activeKeyStatus: 'primary' | 'fallback';
  modelName: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thought?: string;
  thinkingDurationSec?: number;
  sources?: SearchSource[];
  attachments?: Attachment[];
  images?: GeneratedImage[];
  files?: GeneratedFile[];
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: ModelId;
  messages: Message[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface CanvasState {
  isOpen: boolean;
  title: string;
  language: string;
  code: string;
  messageId?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'Free' | 'Plus' | 'Pro';
}

export interface UserPreferences {
  theme: 'system' | 'dark' | 'light';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  customInstructions: {
    aboutUser: string;
    responseStyle: string;
  };
}
