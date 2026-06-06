import React, { useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  ArrowRight,
  Gauge, 
  Mic
} from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  currentTime: number;
  totalDuration: number;
  onSeek: (seconds: number) => void;
  playbackRate: number;
  onSpeedChange: (speed: number) => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
}

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  onReset,
  currentTime,
  totalDuration,
  onSeek,
  playbackRate,
  onSpeedChange,
  isAudioOn,
  onToggleAudio,
}: PlaybackControlsProps) {

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const skipTime = (amount: number) => {
    let next = currentTime + amount;
    if (next < 0) next = 0;
    if (next > totalDuration) next = totalDuration;
    onSeek(next);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4 text-white">
      
      {/* Slider Progress Bar */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-xs font-mono text-slate-400 w-10 text-right">
          {formatTime(currentTime)}
        </span>
        
        <input
          type="range"
          min="0"
          max={totalDuration}
          step="0.5"
          value={currentTime}
          onChange={handleSliderChange}
          className="flex-1 accent-pink-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer appearance-none transition-all focus:outline-none"
          id="playback-slider"
        />

        <span className="text-xs font-mono text-slate-400 w-10">
          {formatTime(totalDuration)}
        </span>
      </div>

      {/* Main Buttons bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Playback rate speed selector */}
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Tempo:</span>
          <div className="flex gap-1">
            {[1, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                  playbackRate === speed
                    ? "bg-pink-500 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
                id={`btn-speed-${speed}`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Play control buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => skipTime(-15)}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            title="Mundur 15 detik"
            id="btn-skip-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            onClick={onPlayPause}
            className={`p-4 rounded-full transition transform hover:scale-105 shadow-md flex items-center justify-center cursor-pointer ${
              isPlaying
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-900"
            }`}
            id="btn-play-pause"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 fill-slate-900 ml-0.5" />
            )}
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            title="Reset ulang"
            id="btn-playback-reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => skipTime(15)}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
            title="Maju 15 detik"
            id="btn-skip-forward"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* TTS Indonesian voice toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAudio}
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
              isAudioOn
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                : "bg-slate-800 text-slate-500 border border-slate-700/60"
            }`}
            id="btn-toggle-audio-synthesis"
          >
            {isAudioOn ? (
              <>
                <Volume2 className="h-4 w-4 text-emerald-400 animate-bounce" />
                <span>Voiceover Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span>Suara Mati</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Synthesis warning / explanation */}
      {isAudioOn && (
        <div className="text-[10px] text-emerald-400/80 bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10 text-center">
          🔊 <strong>Narasi Suara Diaktifkan:</strong> Kami merender dialog Andi, Sinta, Rina, dan Budi dengan aksen Indonesia menggunakan Web Speech API. Pengalaman suara terbaik terdengar pada browser modern.
        </div>
      )}
    </div>
  );
}
