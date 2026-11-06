import React from 'react';

interface Props {
  className?: string;
  size?: number;
  whiteBg?: boolean;
}

export const OpenAILogo: React.FC<Props> = ({ className = '', size = 24, whiteBg = false }) => {
  if (whiteBg) {
    return (
      <div
        className={`bg-white rounded-lg border border-zinc-200/90 shadow-xs flex items-center justify-center p-0.5 shrink-0 ${className}`}
        style={{ width: size + 6, height: size + 6 }}
      >
        <img
          src="/assets/aistudio/Bold_Interlocking_Knot_Emblem_1928f362.png"
          alt="ChaatGPT"
          width={size}
          height={size}
          className="object-contain select-none pointer-events-none"
          style={{ width: size, height: size }}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <img
      src="/assets/aistudio/Bold_Interlocking_Knot_Emblem_1928f362.png"
      alt="ChaatGPT"
      width={size}
      height={size}
      className={`inline-block object-contain select-none pointer-events-none dark:invert ${className}`}
      style={{ width: size, height: size }}
      loading="eager"
    />
  );
};

export const OpenAISparkleIcon: React.FC<Props> = ({ className = 'text-current', size = 20 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
};
