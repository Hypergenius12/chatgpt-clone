import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Code2, Download, Maximize2, Sparkles, FileCode } from 'lucide-react';
import { getFileExtension, triggerFileDownload } from '../utils/chatUtils';

interface Props {
  content: string;
  onOpenCanvas?: (code: string, language: string) => void;
}

export const MarkdownRenderer: React.FC<Props> = ({ content, onOpenCanvas }) => {
  if (!content) return null;

  // Split into blocks: code blocks and standard text blocks
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push(
        <TextSection key={`text-${lastIndex}`} text={textBefore} />
      );
    }

    const language = match[1] || 'plaintext';
    const code = match[2];
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        code={code}
        language={language}
        onOpenCanvas={onOpenCanvas}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.substring(lastIndex);
  if (remaining.trim()) {
    parts.push(<TextSection key={`text-${lastIndex}`} text={remaining} />);
  }

  return <div className="space-y-3 leading-relaxed text-[15px]">{parts}</div>;
};

const TextSection: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (inList && listItems.length > 0) {
      if (inList === 'ul') {
        elements.push(
          <ul key={key} className="list-disc pl-5 my-2 space-y-1">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={key} className="list-decimal pl-5 my-2 space-y-1">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      inList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Image markdown: ![alt](url)
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      flushList(`flush-${i}`);
      elements.push(
        <GeneratedImageCard
          key={`img-${i}`}
          alt={imageMatch[1] || 'AI Generated Image'}
          src={imageMatch[2]}
        />
      );
      continue;
    }

    // Check for headings
    if (line.startsWith('### ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-lg font-semibold mt-4 mb-1 text-zinc-900 dark:text-zinc-100">
          {formatInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-xl font-bold mt-5 mb-2 text-zinc-900 dark:text-zinc-100">
          {formatInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-2xl font-bold mt-6 mb-2 text-zinc-900 dark:text-zinc-100">
          {formatInline(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Bullet lists
    if (line.match(/^[\*\-]\s+/)) {
      if (inList !== 'ul') {
        flushList(`flush-${i}`);
        inList = 'ul';
      }
      listItems.push(
        <li key={`li-${i}`}>{formatInline(line.replace(/^[\*\-]\s+/, ''))}</li>
      );
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\.\s+/)) {
      if (inList !== 'ol') {
        flushList(`flush-${i}`);
        inList = 'ol';
      }
      listItems.push(
        <li key={`li-${i}`}>{formatInline(line.replace(/^\d+\.\s+/, ''))}</li>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(`flush-${i}`);
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-zinc-300 dark:border-zinc-600 pl-4 py-1 italic text-zinc-600 dark:text-zinc-400 my-2"
        >
          {formatInline(line.replace(/^>\s*/, ''))}
        </blockquote>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^(\-{3,}|\*{3,}|_{3,})$/)) {
      flushList(`flush-${i}`);
      elements.push(
        <hr key={`hr-${i}`} className="border-t border-zinc-200 dark:border-zinc-800 my-4" />
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      flushList(`flush-${i}`);
      continue;
    }

    flushList(`flush-${i}`);
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-zinc-800 dark:text-zinc-200 leading-relaxed">
        {formatInline(line)}
      </p>
    );
  }

  flushList('flush-final');

  return <div>{elements}</div>;
};

// Formats inline markdown: bold, italic, inline code, links
function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`inline-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 text-[13px] font-mono border border-zinc-200 dark:border-zinc-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`em-${match.index}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];

        // Direct Download link handler
        if (linkUrl.startsWith('download:')) {
          const downloadFilename = linkUrl.replace(/^download:/, '');
          parts.push(
            <button
              key={`dl-${match.index}`}
              onClick={() => triggerFileDownload(downloadFilename, linkText)}
              className="inline-flex items-center gap-1.5 px-3 py-1 my-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono text-xs border border-zinc-700 shadow-xs cursor-pointer transition-colors"
            >
              <Download size={12} />
              <span>Download {downloadFilename}</span>
            </button>
          );
        } else {
          parts.push(
            <a
              key={`a-${match.index}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-1"
            >
              <span>{linkText}</span>
              <ExternalLink size={11} className="inline opacity-70" />
            </a>
          );
        }
      }
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts;
}

// Interactive Code Block with Canvas + Copy + Download
const CodeBlock: React.FC<{
  code: string;
  language: string;
  onOpenCanvas?: (code: string, language: string) => void;
}> = ({ code, language, onOpenCanvas }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ext = getFileExtension(language);
  const defaultFilename = `generated-code.${ext}`;

  const handleDownload = () => {
    triggerFileDownload(defaultFilename, code);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const isCanvasCompatible = Boolean(onOpenCanvas);

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 text-sm shadow-sm relative group">
      {/* Sticky Code header bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <FileCode size={13} className="text-zinc-500" />
          <span className="font-mono lowercase font-semibold text-zinc-300">{language}</span>
          <span className="text-[11px] text-zinc-500 font-mono">({defaultFilename})</span>
        </div>
        <div className="flex items-center space-x-2">
          {onOpenCanvas && isCanvasCompatible && (
            <button
              onClick={() => onOpenCanvas(code, language)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors font-medium cursor-pointer"
              title="Open in Canvas workspace"
              aria-label="Open in Canvas"
            >
              <Code2 size={13} className="text-emerald-400" />
              <span>Canvas</span>
            </button>
          )}

          {/* Download File Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title={`Download ${defaultFilename}`}
            aria-label="Download code file"
          >
            {downloaded ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Download</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Code body */}
      <div className="p-4 overflow-x-auto max-h-[420px] overflow-y-auto font-mono text-[13px] leading-relaxed text-zinc-200 selection:bg-zinc-700">
        <pre className="m-0 whitespace-pre">{code}</pre>
      </div>
    </div>
  );
};

// High-fidelity Generated Image Card (DALL-E style)
const GeneratedImageCard: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleDownloadImage = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${alt.slice(0, 30).replace(/[^a-zA-Z0-9_-]/g, '_') || 'generated_image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(src, '_blank');
    }
  };

  return (
    <div className="my-4 max-w-xl">
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-md group">
        {/* Loading placeholder skeleton */}
        {!loaded && (
          <div className="w-full h-72 sm:h-96 bg-zinc-800/60 animate-pulse flex items-center justify-center text-zinc-500 text-sm">
            <Sparkles size={20} className="animate-spin text-emerald-500 mr-2" />
            <span>Rendering high-resolution AI image...</span>
          </div>
        )}

        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full max-h-[480px] object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
        />

        {/* Hover overlay with Download and Fullscreen buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium cursor-pointer transition-colors"
            title="Download full resolution image"
          >
            <Download size={13} />
            <span>Download</span>
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
            title="Expand image"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Caption footer */}
        <div className="px-4 py-2.5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <Sparkles size={12} className="text-emerald-400 shrink-0" />
            <span className="truncate italic">"{alt}"</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 shrink-0">1024 × 1024</span>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreen && (
        <div
          onClick={() => setFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={src} alt={alt} className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <div className="mt-3 flex items-center justify-between text-white text-sm">
              <span className="italic">{alt}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer"
              >
                <Download size={14} />
                <span>Download Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
