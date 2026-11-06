import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVoiceTranscript: (transcript: string) => void;
  lastAssistantText?: string;
}

export const VoiceModeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onVoiceTranscript,
  lastAssistantText,
}) => {
  const [status, setStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    // Initialize Web Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        // If final result, send
        const isFinal = event.results[event.results.length - 1].isFinal;
        if (isFinal && currentTranscript.trim()) {
          setStatus('thinking');
          onVoiceTranscript(currentTranscript.trim());
          setTranscript('');
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition status:', e.error);
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    } else {
      setStatus('listening');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen, onVoiceTranscript]);

  // When assistant response arrives, speak it out loud
  useEffect(() => {
    if (isOpen && lastAssistantText && status === 'thinking') {
      setStatus('speaking');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Clean markdown symbols from spoken text
        const cleanText = lastAssistantText
          .replace(/[#*`_~]/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .slice(0, 300);

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setStatus('listening');
        };
        utterance.onerror = () => {
          setStatus('listening');
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setStatus('listening'), 3000);
      }
    }
  }, [isOpen, lastAssistantText, status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950 text-white p-6 select-none animate-fadeIn">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between max-w-2xl">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 flex items-center gap-1.5">
            <Sparkles size={12} className="text-emerald-400" />
            GPT-4o Voice
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Exit voice mode"
          aria-label="Exit voice mode"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Animated Pulsing Voice Orb */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto">
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className={`absolute w-72 h-72 rounded-full blur-3xl transition-all duration-700 ${
              status === 'speaking'
                ? 'bg-sky-500/25 scale-125'
                : status === 'thinking'
                ? 'bg-violet-500/25 scale-110'
                : 'bg-emerald-500/20 scale-100'
            }`}
          />

          {/* Central Animated Fluid Morphing Orb */}
          <div
            className={`w-44 h-44 sm:w-56 sm:h-56 bg-gradient-to-br from-white via-zinc-200 to-zinc-400 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500 rounded-full shadow-2xl animate-voice-orb transition-transform duration-500 flex items-center justify-center ${
              status === 'speaking' ? 'scale-110' : status === 'thinking' ? 'scale-95' : 'scale-100'
            }`}
          >
            {/* Subtle inner reflection */}
            <div className="w-24 h-24 rounded-full bg-white/40 blur-md pointer-events-none" />
          </div>
        </div>

        {/* Status text */}
        <div className="mt-12 text-center">
          <div className="text-lg font-medium text-zinc-200 capitalize tracking-wide">
            {status === 'listening'
              ? 'Listening...'
              : status === 'thinking'
              ? 'Thinking...'
              : 'Speaking...'}
          </div>
          {transcript && (
            <div className="text-xs text-zinc-400 max-w-md mx-auto mt-2 italic px-4">
              "{transcript}"
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex items-center justify-center gap-6 max-w-md pb-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${
            isMuted
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-label="Toggle mute"
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        <button
          onClick={onClose}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95"
          title="End voice session"
          aria-label="End conversation"
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
};
