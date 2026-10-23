import React, { useState, useEffect, useRef } from "react";
import CircularTimer from "../components/CircularTimer";
import GlowingTokens from "../components/GlowingTokens";
import QuestionCard from "../components/QuestionCard";
import TimelineSaveAnimation from "../components/TimelineSaveAnimation";
import AntiCheatShield from "../components/AntiCheatShield";
import { sounds } from "../audio/soundEngine";
import { Sparkles, AlertTriangle, Trophy, Award } from "lucide-react";

export default function GamePlayView({
  team,
  currentQuestion,
  onSubmitAnswer,
  onTimeout,
  isSubmitting = false
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [maxSeconds, setMaxSeconds] = useState(15 * 60);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [showSaveBanner, setShowSaveBanner] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState("");

  const timerRef = useRef(null);

  // Sync remaining seconds with backend state
  useEffect(() => {
    if (!currentQuestion) return;

    const remaining = currentQuestion.remaining_seconds !== undefined
      ? currentQuestion.remaining_seconds
      : 15 * 60;

    setSecondsRemaining(remaining);
    setMaxSeconds(15 * 60);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (next >= 1 && next <= 10) {
          sounds.playTick(next, 10);
        }
        if (next <= 0) {
          clearInterval(timerRef.current);
          sounds.playGlitchBuzz();
          onTimeout();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion?.id, currentQuestion?.question_number]);

  const handleAnswerWrapper = async (answer) => {
    try {
      const res = await onSubmitAnswer(answer);
      if (res?.correct) {
        sounds.playLevelCleared();
        setSaveSuccessMsg(res.message || "You saved the timeline by solving this question!");
        setShowSaveBanner(true);
      } else {
        sounds.playGlitchBuzz();
        setFeedbackToast(res?.message || "Anomaly detected. Question replaced.");
        setTimeout(() => setFeedbackToast(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 relative">
      {/* Anti-cheat background guard */}
      <AntiCheatShield player={team} isActive={true} />

      {/* Timeline Saved Prompt Animation */}
      <TimelineSaveAnimation
        show={showSaveBanner}
        message={saveSuccessMsg}
        onComplete={() => setShowSaveBanner(false)}
      />

      {/* Replacement Notice Toast */}
      {feedbackToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-purple-600 text-white font-mono text-xs font-bold uppercase shadow-2xl flex items-center gap-2 animate-bounce border border-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Header: Level Progress & Team Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-temporal-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/90 border border-cyan-400 dark:border-cyan-500 flex items-center justify-center font-mono font-black text-xl text-cyan-700 dark:text-cyan-300 shadow-lg shadow-cyan-500/20 shrink-0">
            L{team?.current_level || 1}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
                LEVEL {team?.current_level || 1} OF 4
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                15 MIN ATTEMPT
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-0.5">
              Question {currentQuestion?.question_number || 1} of 6 • Team: <strong className="text-cyan-400">{team?.team_name}</strong>
            </p>
          </div>
        </div>

        {/* 4-Level Progress Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {[1, 2, 3, 4].map((lvl) => {
            const isCompleted = lvl < (team?.current_level || 1);
            const isCurrent = lvl === (team?.current_level || 1);

            return (
              <div
                key={lvl}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-mono transition-all ${
                  isCompleted
                    ? "bg-green-100 dark:bg-green-950/60 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300 font-bold"
                    : isCurrent
                    ? "bg-cyan-100 dark:bg-cyan-950 border-cyan-500 text-cyan-800 dark:text-cyan-300 ring-2 ring-cyan-500/30 font-bold scale-105"
                    : "bg-slate-100 dark:bg-temporal-card/40 border-slate-200 dark:border-gray-800 text-slate-400 dark:text-gray-500 opacity-60"
                }`}
              >
                <span>{isCompleted ? `✓ L${lvl}` : `LVL ${lvl}`}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left HUD (Timer + Tokens + Stats), Right Question */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Side: Circular Timer & Glowing Tokens */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center gap-6 border border-cyan-500/30">
          <CircularTimer
            secondsRemaining={secondsRemaining}
            maxSeconds={maxSeconds}
            attemptNumber={currentQuestion?.question_number || 1}
            level={team?.current_level || 1}
          />

          <div className="w-full pt-4 border-t border-slate-200 dark:border-temporal-border flex justify-center">
            <GlowingTokens
              tokensRemaining={team?.tokens_remaining !== undefined ? team.tokens_remaining : 3}
              maxTokens={3}
            />
          </div>

          <div className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-temporal-border text-center text-xs font-mono text-slate-600 dark:text-gray-400">
            <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1">SCORE TELEMETRY</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
              {team?.total_score || 0} <span className="text-xs text-purple-400 font-normal">PTS</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Question Card */}
        <div className="lg:col-span-8">
          <QuestionCard
            question={currentQuestion}
            onSubmitAnswer={handleAnswerWrapper}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
