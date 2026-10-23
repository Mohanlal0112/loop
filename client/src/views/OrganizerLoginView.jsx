import React, { useState } from "react";
import { KeyRound, ShieldAlert, ArrowRight, Lock, Terminal } from "lucide-react";
import { api } from "../services/api";

export default function OrganizerLoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await api.organizerLogin(username, password);
      localStorage.setItem("loop_token", res.token);
      localStorage.setItem("loop_role", "organizer");
      onLoginSuccess(res.organizer, "organizer");
    } catch (err) {
      setErrorMsg(err.message || "Invalid organizer credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel-glow rounded-3xl p-6 sm:p-8 relative border border-purple-500/50 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-400 flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg shadow-purple-500/30">
          <KeyRound className="w-8 h-8 text-purple-300" />
        </div>

        <h2 className="text-2xl font-black font-mono tracking-tight text-center text-slate-900 dark:text-white mb-1">
          ORGANIZER COMMAND
        </h2>

        <p className="text-xs text-purple-600 dark:text-purple-300 font-mono text-center mb-6">
          AUTHORIZED PERSONNEL RESTRICTED ACCESS
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 font-mono text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Organizer Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/60 border border-slate-300 dark:border-temporal-border focus:border-purple-500 text-slate-900 dark:text-white font-mono text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Organizer Password / Passcode
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-black/60 border border-slate-300 dark:border-temporal-border focus:border-purple-500 text-slate-900 dark:text-white font-mono text-sm outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono text-xs uppercase font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
          >
            <span>UNLOCK COMMAND CENTER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-temporal-border text-center">
          <a href="#/login" className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline">
            ← Return to Team Player Login
          </a>
        </div>
      </div>
    </div>
  );
}
