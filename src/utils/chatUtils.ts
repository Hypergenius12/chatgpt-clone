/**
 * Utility functions for chat categorization, reasoning parsing,
 * canvas extraction, and date grouping.
 */

export interface BaseChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  isPinned?: boolean;
  isArchived?: boolean;
  messages?: any[];
}

export type ChatSession = BaseChatSession;

export interface DateGroupedChats<T extends BaseChatSession = BaseChatSession> {
  pinned: T[];
  today: T[];
  yesterday: T[];
  previous7Days: T[];
  previous30Days: T[];
  older: T[];
}

/**
 * Groups an array of chat sessions into chronological groups matching ChatGPT sidebar.
 */
export function groupChatsByDate<T extends BaseChatSession>(chats: T[], referenceTime = Date.now()): DateGroupedChats<T> {
  const result: DateGroupedChats<T> = {
    pinned: [],
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: [],
  };

  const oneDayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(referenceTime).setHours(0, 0, 0, 0);
  const startOfYesterday = startOfToday - oneDayMs;
  const startOf7Days = startOfToday - 7 * oneDayMs;
  const startOf30Days = startOfToday - 30 * oneDayMs;

  for (const chat of chats) {
    if (chat.isArchived) continue;
    if (chat.isPinned) {
      result.pinned.push(chat);
      continue;
    }

    const time = chat.updatedAt || chat.createdAt;
    if (time >= startOfToday) {
      result.today.push(chat);
    } else if (time >= startOfYesterday) {
      result.yesterday.push(chat);
    } else if (time >= startOf7Days) {
      result.previous7Days.push(chat);
    } else if (time >= startOf30Days) {
      result.previous30Days.push(chat);
    } else {
      result.older.push(chat);
    }
  }

  // Sort groups descending by updatedAt
  const sortFn = (a: T, b: T) => b.updatedAt - a.updatedAt;
  result.pinned.sort(sortFn);
  result.today.sort(sortFn);
  result.yesterday.sort(sortFn);
  result.previous7Days.sort(sortFn);
  result.previous30Days.sort(sortFn);
  result.older.sort(sortFn);

  return result;
}

/**
 * Intercepts raw dalle.text2im JSON output emitted by models emulating tool calling
 * and transforms it into rich Markdown image embeds with prompt details.
 */
export function transformDalleJson(text: string): string {
  if (!text || (!text.includes('dalle.text2im') && !text.includes('action_input'))) {
    return text;
  }
  try {
    let prompt = '';
    // 1. Try parsing full text or outer json block
    try {
      const jsonMatch = text.match(/\{[\s\S]*"action"\s*:\s*"dalle\.text2im"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.action_input) {
          if (typeof parsed.action_input === 'string') {
            try {
              const inner = JSON.parse(parsed.action_input);
              if (inner.prompt) prompt = inner.prompt;
            } catch {
              prompt = parsed.action_input;
            }
          } else if (parsed.action_input.prompt) {
            prompt = parsed.action_input.prompt;
          }
        }
      }
    } catch {}

    // 2. Regex fallback for escaped or unescaped prompt string
    if (!prompt) {
      const pMatch = text.match(/(?:\\"|"|”)prompt(?:\\"|"|”)\s*:\s*(?:\\"|"|”)(.*?)(?:\\"|"|”)(?:,|\s*})/s);
      if (pMatch) {
        prompt = pMatch[1].replace(/\\"/g, '"').trim();
      }
    }

    if (prompt) {
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      return `I've generated an image based on your request: **"${prompt}"**\n\n![${prompt}](${imageUrl})\n\n- **Prompt**: ${prompt}\n- **Resolution**: 1024 × 1024\n- Click **Download Image** to save this image file to your device.`;
    }
  } catch (err) {
    console.warn('Could not parse dalle json:', err);
  }
  return text;
}

/**
 * Ensures all assistant content is directly visible in the chat bubble.
 * Strips <thought>...</thought> wrappers and intercepts DALL-E JSON so answers are never hidden.
 */
export function extractThoughtAndContent(raw: string): { thought?: string; content: string } {
  if (!raw) return { content: '' };

  // 1. Transform any tool-call dalle JSON into real image embeds
  let text = transformDalleJson(raw);

  // 2. Strip any <thought> or </thought> tags so the full response is directly in content
  const cleaned = text.replace(/<\/?thought>/gi, '').trim();

  return { content: cleaned || text };
}

export interface ExtractedCodeBlock {
  language: string;
  code: string;
  title?: string;
  isExecutable: boolean;
}

/**
 * Detects code blocks in markdown that can be opened in ChatGPT Canvas.
 */
export function extractCanvasCodeBlock(text: string): ExtractedCodeBlock | null {
  if (!text) return null;

  const match = text.match(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
  if (!match) return null;

  const language = (match[1] || 'plaintext').toLowerCase();
  const code = match[2].trim();
  const isExecutable = ['html', 'javascript', 'js', 'css', 'jsx', 'tsx', 'svg'].includes(language);

  return {
    language,
    code,
    title: `${language.toUpperCase()} Snippet`,
    isExecutable,
  };
}

/**
 * Generates a clean fallback title from user query.
 */
export function generateChatTitleFallback(text: string): string {
  if (!text || !text.trim()) return 'New chat';
  const clean = text.replace(/[\n\r]+/g, ' ').trim();
  const words = clean.split(/\s+/);
  if (words.length <= 6) {
    return clean.slice(0, 40);
  }
  return words.slice(0, 6).join(' ') + '...';
}

/**
 * Formats a timestamp into a relative or short readable time.
 */
export function formatTimestamp(timeMs: number): string {
  const date = new Date(timeMs);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Simple token estimation for message budgets (approx 4 chars per token).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Extracts 1-2 uppercase initials from user name or email for avatar fallback.
 */
export function getUserInitials(nameOrEmail?: string): string {
  if (!nameOrEmail || !nameOrEmail.trim()) return 'U';
  const clean = nameOrEmail.trim();
  if (clean.includes('@')) {
    return clean.charAt(0).toUpperCase();
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Validates email format for optional sign-in.
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Returns standard file extension for a given code block language.
 */
export function getFileExtension(language: string): string {
  const lang = (language || '').toLowerCase().trim();
  const map: Record<string, string> = {
    python: 'py',
    py: 'py',
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    tsx: 'tsx',
    jsx: 'jsx',
    html: 'html',
    htm: 'html',
    css: 'css',
    json: 'json',
    csv: 'csv',
    sql: 'sql',
    markdown: 'md',
    md: 'md',
    bash: 'sh',
    sh: 'sh',
    shell: 'sh',
    rust: 'rs',
    rs: 'rs',
    go: 'go',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    kotlin: 'kt',
    swift: 'swift',
    php: 'php',
    ruby: 'rb',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    svg: 'svg',
    text: 'txt',
    txt: 'txt',
  };
  return map[lang] || 'txt';
}

/**
 * Initiates browser download of raw content with a clean filename.
 */
export function triggerFileDownload(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Calculates sum of tokens across all messages in a chat.
 */
export function calculateTotalChatTokens(messages: Array<{ content?: string; thought?: string }>): number {
  let total = 0;
  for (const m of messages) {
    if (m.content) total += estimateTokens(m.content);
    if (m.thought) total += estimateTokens(m.thought);
  }
  return total;
}
