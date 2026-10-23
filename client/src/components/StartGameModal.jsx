import React from "react";
import { Play, AlertCircle, X } from "lucide-react";

export default function StartGameModal({ isOpen, onConfirm, onCancel, activeTeamsCount = 0 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="max-w-md w-full glass-panel-glow rounded-3xl p-6 sm:p-8 relative border border-cyan-500/60 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg shadow-cyan-500/30">
          <Play className="w-8 h-8 text-cyan-300 fill-current ml-1" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-center text-slate-900 dark:text-white mb-2">
          CONFIRM EVENT ACTIVATION
        </h3>

        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center my-4 font-mono text-xs text-cyan-200 leading-relaxed">
          "Are you ready to start LOOP? This will activate Level 1 for the participating teams."
        </div>

        <p className="text-xs text-slate-500 dark:text-gray-400 font-mono text-center mb-6">
          Currently <strong className="text-cyan-400">{activeTeamsCount}</strong> eligible team(s) waiting in the lobby.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-gray-700 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 font-mono text-xs uppercase font-bold hover:bg-slate-200 dark:hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black font-mono text-xs uppercase font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Confirm Start</span>
          </button>
        </div>
      </div>
    </div>
  );
}
