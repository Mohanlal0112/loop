import React, { useState } from "react";
import { Trophy, Award, Sparkles, Send } from "lucide-react";
import confetti from "canvas-confetti";
import CertificateModal from "../components/CertificateModal";

export default function FinalStageView({ team, question, onSubmitAnswer, isSubmitting }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const [finalCleared, setFinalCleared] = useState(false);

  const handleSelect = async (opt) => {
    setSelectedOption(opt);
    const res = await onSubmitAnswer(opt);
    if (res?.correct) {
      setFinalCleared(true);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showCertificate && (
        <CertificateModal
          player={team}
          rankTitle={`FINALIST RANK #${team?.final_rank || 1}`}
          rankPosition={team?.final_rank || 1}
          onClose={() => setShowCertificate(false)}
        />
      )}

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400 text-amber-300 font-mono text-xs uppercase tracking-widest mb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>TOP 3 DIRECT FINALISTS // LEVEL 5</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white mb-2">
          THE GRAND FINAL
        </h1>

        <p className="text-sm text-gray-300 font-sans max-w-lg mx-auto">
          Congratulations, <strong className="text-cyan-400">{team?.team_name}</strong>! You have qualified as one of the Top 3 teams to compete in the final temporal stage.
        </p>
      </div>

      {finalCleared ? (
        <div className="glass-panel-glow rounded-3xl p-8 text-center border border-amber-400 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>

          <h2 className="text-3xl font-mono font-black text-amber-300 mb-2">
            TIMELINE CONQUERED!
          </h2>

          <p className="text-base text-gray-200 font-mono mb-6">
            Your team has completed Level 5. The loop anomaly is completely stabilized.
          </p>

          <button
            onClick={() => setShowCertificate(true)}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold font-mono text-sm inline-flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all"
          >
            <Award className="w-5 h-5" />
            <span>CLAIM OFFICIAL CERTIFICATE</span>
          </button>
        </div>
      ) : question ? (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 relative border border-purple-500/40">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-800">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              FINAL QUESTION • {question.category}
            </span>
            <span className="text-xs font-mono text-gray-400">
              ID: {question.custom_id}
            </span>
          </div>

          <div className="text-base sm:text-lg font-medium text-white mb-6">
            {question.question_text}
          </div>

          {question.code_snippet && (
            <div className="my-4 rounded-xl bg-black/80 border border-cyan-900/50 p-4 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto">
              <pre><code>{question.code_snippet}</code></pre>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
            {question.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={isSubmitting}
                className="p-4 rounded-2xl border border-gray-700 bg-black/40 hover:bg-cyan-950/60 hover:border-cyan-400 text-left text-sm font-medium transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gray-800 text-cyan-300 font-mono text-xs flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 text-center text-gray-400">
          <p className="font-mono text-sm">Awaiting Level 5 question dispatch...</p>
        </div>
      )}
    </div>
  );
}
