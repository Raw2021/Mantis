import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Speech, Sparkles, Smile, Compass, FlameKindling, Info } from "lucide-react";
import { PresenterId } from "../types";
import { presentersData } from "../data";

interface PresenterAvatarsProps {
  activePresenter: PresenterId;
  activeAction: string;
  activeSpeech: string;
  activeTechnique: string;
  playbackTime?: number;
}

export default function PresenterAvatars({
  activePresenter,
  activeAction,
  activeSpeech,
  activeTechnique,
  playbackTime = 0,
}: PresenterAvatarsProps) {
  
  // Custom cartoon illustration style based on Tailwind colors
  const renderPresenterIllustration = (id: PresenterId) => {
    switch (id) {
      case PresenterId.ANDI:
        return (
          <div className="relative w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-400 overflow-hidden shadow-inner">
            <span className="text-2xl">👦</span>
            <div className="absolute bottom-0 inset-x-0 h-4 bg-blue-500/30 flex items-center justify-center text-[7px] text-blue-900 font-bold uppercase">
              Presenter 1
            </div>
          </div>
        );
      case PresenterId.SINTA:
        return (
          <div className="relative w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center border-2 border-pink-400 overflow-hidden shadow-inner">
            <span className="text-2xl">👧</span>
            <div className="absolute bottom-0 inset-x-0 h-4 bg-pink-500/30 flex items-center justify-center text-[7px] text-pink-900 font-bold uppercase">
              Presenter 2
            </div>
          </div>
        );
      case PresenterId.RINA:
        return (
          <div className="relative w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-400 overflow-hidden shadow-inner">
            <span className="text-2xl">👩</span>
            <div className="absolute bottom-0 inset-x-0 h-4 bg-emerald-500/30 flex items-center justify-center text-[7px] text-emerald-900 font-bold uppercase">
              Presenter 3
            </div>
          </div>
        );
      case PresenterId.BUDI:
        return (
          <div className="relative w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-400 overflow-hidden shadow-inner">
            <span className="text-2xl">👨</span>
            <div className="absolute bottom-0 inset-x-0 h-4 bg-amber-500/30 flex items-center justify-center text-[7px] text-amber-900 font-bold uppercase">
              Moderator
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-5 bg-slate-900/40 p-1 rounded-3xl">
      {/* 4 Presenters Horizontal Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(presentersData) as PresenterId[]).map((key) => {
          const p = presentersData[key];
          const isActive = activePresenter === key;

          return (
            <motion.div
              key={key}
              animate={{
                scale: isActive ? 1.02 : 0.98,
                backgroundColor: isActive ? "rgba(30, 41, 59, 1)" : "rgba(15, 23, 42, 0.4)",
                borderColor: isActive ? "rgba(244, 114, 182, 0.6)" : "rgba(51, 65, 85, 0.4)"
              }}
              className={`p-4 rounded-2xl border transition-all duration-300 relative flex flex-col items-center ${
                isActive ? "shadow-lg shadow-pink-500/5 ring-1 ring-pink-500/10" : "opacity-70 grayscale-[30%]"
              }`}
            >
              {/* Active Soundwave or Mic Ring */}
              {isActive && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-pink-500/20 text-pink-300 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse border border-pink-500/30">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping inline-block" />
                  Bicara
                </div>
              )}

              {renderPresenterIllustration(p.id)}

              <h4 className="text-xs font-bold text-white mt-2.5 flex items-center gap-1 text-center">
                {p.name}
              </h4>
              <p className="text-[10px] text-slate-400 text-center font-medium leading-tight h-8 mt-1 flex items-center justify-center">
                {p.role}
              </p>

              {/* Decorative target summary */}
              <div className="w-full mt-2.5 pt-2 border-t border-slate-800 text-[9px] text-slate-400 text-center leading-snug">
                {p.focus.slice(0, 50)}...
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comic Speech bubble & Live subtitling section with high stylistic feedback */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSpeech}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative bg-slate-950 p-5 rounded-2xl border border-rose-500/20 flex flex-col gap-3.5 shadow-2xl mt-2 overflow-hidden"
          id="speech-subtitles-bubble"
        >
          {/* Floral ambient background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Presenter Name Tag */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                activePresenter === PresenterId.ANDI ? 'bg-blue-400' :
                activePresenter === PresenterId.SINTA ? 'bg-pink-400' :
                activePresenter === PresenterId.RINA ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs font-bold tracking-widest text-slate-100 uppercase">
                {presentersData[activePresenter]?.name} is speaking...
              </span>
            </div>
            
            {/* Timecode indicator */}
            {playbackTime > 0 && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Detik {Math.floor(playbackTime)}
              </span>
            )}
          </div>

          {/* Action indicator (Sikap/Aksi Presenter) */}
          {activeAction && (
            <div className="text-xs text-rose-300 bg-rose-950/25 border border-rose-500/10 px-3 py-2 rounded-xl flex items-start gap-2 italic leading-relaxed">
              <span className="text-base leading-none select-none">🎭</span>
              <div>
                <strong className="not-italic text-[10px] text-rose-200/80 uppercase font-bold block mb-0.5">Aksi / Gestur Fisik:</strong>
                <span>{activeAction}</span>
              </div>
            </div>
          )}

          {/* Speech transcription */}
          <div className="text-base text-slate-100 font-sans leading-relaxed pl-3 border-l-2 border-pink-500/80 py-0.5 select-all">
            "{activeSpeech}"
          </div>

          {/* Applied Speech/Educational technique */}
          {activeTechnique && (
            <div className="text-xs text-emerald-400 bg-emerald-950/25 border border-emerald-500/10 px-3 py-2 rounded-xl flex items-start gap-2 leading-relaxed">
              <span className="text-base leading-none select-none">🎯</span>
              <div>
                <strong className="text-[10px] text-emerald-200/80 uppercase font-bold block mb-0.5">Teknik yang Diterapkan:</strong>
                <span>{activeTechnique}</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
