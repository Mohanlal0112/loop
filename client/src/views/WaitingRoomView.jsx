import React from "react";
import { Clock, Shield, Sparkles, CheckCircle2, Flame, LogOut } from "lucide-react";

export default function WaitingRoomView({ team, onLogout }) {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 py-8">
      <div className="max-w-3xl w-full">
        {/* Animated Radar */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-transparent border-2 border-cyan-500/40 flex items-center justify-center mx-auto animate-pulse shadow-2xl shadow-cyan-500/20">
              <Clock className="w-14 h-14 text-cyan-400 animate-spin-slow" />
            </div>
            <div className="absolute -bottom-1 right-3 w-6 h-6 rounded-full bg-green-500 border-2 border-black flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white mb-2">
            WAITING FOR ORGANIZER
          </h1>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-300 dark:border-cyan-500/50 text-cyan-800 dark:text-cyan-300 font-mono text-sm shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Waiting for the organizer to start <strong>LOOP</strong></span>
          </div>

          <p className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-3 max-w-md mx-auto">
            The tournament will commence simultaneously for all teams as soon as the organizer activates the game signal.
          </p>
        </div>

        {/* Team Identity Card */}
        <div className="glass-panel rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-cyan-500/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-400 flex items-center justify-center text-3xl shadow-lg">
              {team?.avatar || "⚡"}
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white font-mono">{team?.team_name}</div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400 font-mono">
                ID: {team?.team_id} • {team?.department}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-green-100 dark:bg-green-950/80 border border-green-400 text-green-800 dark:text-green-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>AUTHENTICATED</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-xl border border-slate-300 dark:border-gray-700 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Rules Briefing Card */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-purple-500/30">
          <h3 className="text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>CRITICAL TOURNAMENT PROTOCOLS</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-temporal-border">
              <div className="text-cyan-400 font-bold uppercase mb-1">01. 6 QUESTIONS PER LEVEL</div>
              <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-sans">
                Each attempt contains 6 questions selected across Mathematics, Logic, Aptitude, Python, Debugging, and DSA.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 dark:bg-black/40 border border-purple-200 dark:border-purple-900/40">
              <div className="text-purple-400 font-bold uppercase mb-1">02. 3 TOKENS & 15 MIN</div>
              <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-sans">
                Solve all 6 questions within the 15-minute countdown. Timeout costs 1 token. Lose all 3 tokens = elimination.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-black/40 border border-emerald-200 dark:border-emerald-900/40">
              <div className="text-emerald-400 font-bold uppercase mb-1">03. WRONG ANSWER REPLACEMENT</div>
              <p className="text-slate-600 dark:text-gray-300 leading-relaxed font-sans">
                Incorrect answers do NOT deduct tokens; they replace the anomaly with another question in the same category.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
