import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { OpenAILogo } from './OpenAILogo';
import { validateEmail } from '../utils/chatUtils';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'Free' | 'Plus' | 'Pro';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLogin,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const userName = name.trim() || email.split('@')[0];
    const user: UserAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: userName.charAt(0).toUpperCase() + userName.slice(1),
      email: email.trim(),
      plan: 'Plus',
    };

    onLogin(user);
    onClose();
  };

  const handleOAuthLogin = (provider: 'Google' | 'Microsoft' | 'Apple') => {
    const user: UserAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: 'Caleb Anne',
      email: 'calebanne8@gmail.com',
      plan: 'Plus',
    };
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#212121] border border-zinc-200 dark:border-zinc-700 shadow-2xl p-6 relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* ChaatGPT Knot Logo */}
        <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center mb-4 shadow-xs">
          <OpenAILogo size={26} whiteBg />
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-xs text-zinc-500 mt-1 mb-5 text-center">
          {mode === 'login'
            ? 'Sign in to access your saved chats and Plus features'
            : 'Sign up to sync your chat history across devices'}
        </p>

        {error && (
          <div className="w-full mb-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Caleb Anne"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="name@example.com"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer mt-1"
          >
            Continue
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center my-4">
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            OR
          </span>
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="w-full space-y-2">
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('Microsoft')}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            <span>Continue with Microsoft Account</span>
          </button>
        </div>

        {/* Switch mode */}
        <div className="mt-5 text-center text-xs text-zinc-500">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
