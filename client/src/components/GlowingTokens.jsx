import React from "react";
import { Zap, Shield } from "lucide-react";

export default function GlowingTokens({ tokensRemaining = 3, maxTokens = 3 }) {
  const tokens = Array.from({ length: maxTokens }, (_, i) => i < tokensRemaining);

  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-cyan-400/80 mb-1 flex items-center gap-1">
        <Shield className="w-3 h-3 text-cyan-400" />
        <span>Timeline Tokens</span>
      </div>
      <div className="flex items-center gap-2.5">
        {tokens.map((isActive, idx) => (
          <div
            key={idx}
            className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${
              isActive
                ? "bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(0,240,255,0.7)] scale-105 border border-cyan-300"
                : "bg-slate-200 dark:bg-gray-800/60 border border-slate-300 dark:border-gray-700/50 opacity-40 grayscale scale-95"
            }`}
            title={isActive ? `Active Token #${idx + 1}` : `Spent Token #${idx + 1}`}
          >
            <Zap
              className={`w-4 h-4 ${
                isActive ? "text-white animate-pulse" : "text-gray-500"
              }`}
            />
            {isActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-300 animate-ping pointer-events-none" />
            )}
          </div>
        ))}
      </div>
      <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400 mt-1">
        {tokensRemaining} of {maxTokens} Remaining
      </span>
    </div>
  );
}
