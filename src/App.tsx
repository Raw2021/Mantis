/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  HelpCircle, 
  BookOpen, 
  Compass, 
  Award, 
  Sliders, 
  Info, 
  Flower2, 
  ChevronRight, 
  Check, 
  AlertCircle,
  HelpCircle as QuestionIcon,
  Video as VideoIcon,
  FileText,
  Camera,
  Tv
} from "lucide-react";

import { PresenterId, ScriptLine } from "./types";
import { scriptLines, presentationTips } from "./data";
import LapbookVisualizer from "./components/LapbookVisualizer";
import PlaybackControls from "./components/PlaybackControls";
import PresenterAvatars from "./components/PresenterAvatars";
import InteractiveQA from "./components/InteractiveQA";
import PracticePanel from "./components/PracticePanel";

export default function App() {
  const [activeTab, setActiveTab] = useState<"playback" | "explore" | "qa" | "practice" | "techniques">("playback");
  
  // Timer & Playback States
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(true);

  // Video Studio Simulation States
  const [showCameraOverlay, setShowCameraOverlay] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [cameraStyle, setCameraStyle] = useState<"webcam" | "retro" | "neon">("webcam");
  const [subtitleStyle, setSubtitleStyle] = useState<"classic" | "yellow" | "banner">("classic");
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Keep track of the last spoken line to prevent duplicate SpeechSynthesis triggers
  const lastSpokenLineId = useRef<string>("");

  // Speech helper
  const speakLineText = (text: string) => {
    if (!window.speechSynthesis || !isAudioOn) return;
    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = text
      .replace(/[\.\.|\!|\?|\-]/g, " ")
      .replace(/WHUSH/gi, "wuss"); // pronounce onomatope beautifully

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "id-ID";

    // Attempt to pick a modern Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith("id") || v.lang.includes("ID"));
    if (idVoice) utterance.voice = idVoice;

    utterance.rate = playbackRate;
    window.speechSynthesis.speak(utterance);
  };

  // Manage clock loop for the timeline playback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          let next = prev + 0.5 * playbackRate;
          const maxDur = scriptLines[scriptLines.length - 1].endTimeInSeconds;
          if (next >= maxDur) {
            setIsPlaying(false);
            if (isRecording) {
              setIsRecording(false);
              setShowExportModal(true);
            }
            return maxDur;
          }
          return next;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackRate, isRecording]);

  // Synchronize vocal speech with active line changes
  const activeLineIndex = scriptLines.findIndex(
    (line) => currentTime >= line.timeInSeconds && currentTime < line.endTimeInSeconds
  );
  
  const activeLine: ScriptLine = activeLineIndex !== -1 
    ? scriptLines[activeLineIndex] 
    : scriptLines[0];

  useEffect(() => {
    if (isPlaying && activeLine && activeLine.id !== lastSpokenLineId.current) {
      lastSpokenLineId.current = activeLine.id;
      speakLineText(activeLine.speech);
    }
  }, [activeLine, isPlaying, isAudioOn]);

  // If user turns on audio mid-play, voice current line
  const handleToggleAudio = () => {
    const nextState = !isAudioOn;
    setIsAudioOn(nextState);
    if (nextState && isPlaying && activeLine) {
      speakLineText(activeLine.speech);
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  const handlePlayPause = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    if (!nextPlaying) {
      window.speechSynthesis?.cancel();
    } else if (activeLine) {
      speakLineText(activeLine.speech);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    lastSpokenLineId.current = "";
    window.speechSynthesis?.cancel();
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    const line = scriptLines.find(l => seconds >= l.timeInSeconds && seconds < l.endTimeInSeconds);
    if (line) {
      lastSpokenLineId.current = line.id;
      if (isPlaying) speakLineText(line.speech);
    }
  };

  const handleSelectLineByComponent = (componentId: string) => {
    // Scroll to the line associated with this component on tab shift or inside play
    const line = scriptLines.find(l => {
      if (componentId === "cover") return l.id === "p1-1";
      if (componentId === "banner") return l.id === "p1-2";
      if (componentId === "minibook") return l.id === "p2-1";
      if (componentId === "flap_color") return l.id === "p3-2";
      if (componentId === "windows_anatomy") return l.id === "p3-4";
      if (componentId === "accordion_hunt") return l.id === "p4-2";
      if (componentId === "wheel_prey") return l.id === "p4-3";
      if (componentId === "pocket_habitat") return l.id === "p4-4";
      if (componentId === "recap_summary") return l.id === "p5-2";
      return false;
    });

    if (line) {
      setCurrentTime(line.timeInSeconds);
      lastSpokenLineId.current = line.id;
      if (isPlaying) speakLineText(line.speech);
    }
  };

  const handleStartRecording = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    setIsRecording(true);
    window.speechSynthesis?.cancel();
    if (scriptLines[0] && isAudioOn) {
      speakLineText(scriptLines[0].speech);
    }
  };

  const generateSRT = () => {
    let srtContent = "";
    scriptLines.forEach((line, idx) => {
      const formatTimeForSRT = (seconds: number) => {
        const ms = Math.floor((seconds % 1) * 1000);
        const totalSecs = Math.floor(seconds);
        const s = totalSecs % 60;
        const m = Math.floor(totalSecs / 60) % 60;
        const h = Math.floor(totalSecs / 3600);
        
        const pad = (num: number, size: number) => {
          let sc = num.toString();
          while (sc.length < size) sc = "0" + sc;
          return sc;
        };
        
        return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)},${pad(ms, 3)}`;
      };

      const start = formatTimeForSRT(line.timeInSeconds);
      const end = formatTimeForSRT(line.endTimeInSeconds);

      // We remove brackets inside srt to keep it clean, but add speakers
      srtContent += `${idx + 1}\n${start} --> ${end}\n[${presentersData[line.speaker].name}]: ${line.speech}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subtitel_belalang_anggrek_kelompok3.srt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateTXT = () => {
    let txtContent = `=========================================================\n`;
    txtContent += `SKRIP DIALOG & VISUAL PRESENTASI LAPBOOK - KELOMPOK 3\n`;
    txtContent += `Topik: Observasi Belalang Anggrek (Hymenopus coronatus)\n`;
    txtContent += `Kelas: X-A SMAN 1 Jakarta\n`;
    txtContent += `=========================================================\n\n`;
    
    scriptLines.forEach((line) => {
      txtContent += `⏱ [Timecode: ${line.timeCode}] - Pembicara: ${presentersData[line.speaker].name.toUpperCase()}\n`;
      txtContent += `🎬 GESTUR & AKSI FISIK: ${line.action}\n`;
      txtContent += `🗣 DIALOG LISAN: "${line.speech}"\n`;
      txtContent += `🎯 TEKNIK RETORIKA: ${line.technique}\n`;
      txtContent += `---------------------------------------------------------\n\n`;
    });
    
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "skrip_belalang_anggrek_kelompok3.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentersData = {
    [PresenterId.ANDI]: { name: "Andi" },
    [PresenterId.SINTA]: { name: "Sinta" },
    [PresenterId.RINA]: { name: "Rina" },
    [PresenterId.BUDI]: { name: "Budi" }
  };

  const totalDuration = scriptLines[scriptLines.length - 1].endTimeInSeconds;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased pb-12 selection:bg-pink-500 selection:text-white relative">
      {/* Visual background paper texture overlay */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-stone-200/40 via-stone-100/10 to-transparent pointer-events-none" />

      {/* Global Page Header in Bento Style */}
      <header className="max-w-7xl mx-auto px-6 pt-10 pb-5 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 relative z-10 border-b-2 border-stone-950">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase leading-none text-stone-950 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-pink-500 flex items-center justify-center shadow-md">
              <Flower2 className="h-5 w-5 text-white animate-pulse" />
            </div>
            Orchid Mantis Presentation Workspace
          </h1>
          <p className="text-stone-500 font-semibold tracking-wide text-xs mt-2 uppercase italic">
            Project: Observation of Hymenopus coronatus — Interactive Media Script
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* Kelompok / Kelas Badging block */}
          <div className="flex items-center text-xs font-bold uppercase tracking-wider">
            <span className="bg-stone-900 text-white px-3 py-1.5 rounded-l-md border border-stone-900">Kelompok 3</span>
            <span className="bg-white text-stone-900 border-y border-r border-stone-900 px-3 py-1.5 rounded-r-md">Kelas X-A</span>
          </div>

          {/* Responsive primary tabs */}
          <nav className="flex bg-white border-2 border-stone-950 p-1 rounded-xl items-center justify-center shadow-sm">
            {[
              { id: "playback", label: "Skenario Putar" },
              { id: "explore", label: "Eksplorasi Lapbook" },
              { id: "qa", label: "Tanya Jawab (Q&A)" },
              { id: "practice", label: "Rehearsal Room" },
              { id: "techniques", label: "Analisis Teknik" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer transition-all ${
                  activeTab === t.id
                    ? "bg-stone-950 text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
                id={`tab-btn-${t.id}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto px-6 py-6 font-sans">
        
        <AnimatePresence mode="wait">
          
          {/* TAB 1: SKENARIO PUTAR (PLAYBACK TIMELINE & AUDIO VISUALIZER) */}
          {activeTab === "playback" && (
            <motion.div
              key="playback"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Left visual column (Lapbook model & Playback Panel) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <LapbookVisualizer 
                  currentTimeInSeconds={currentTime}
                  isPlaying={isPlaying}
                  activeLineId={activeLine?.id}
                  showCameraOverlay={showCameraOverlay}
                  isRecording={isRecording}
                  cameraStyle={cameraStyle}
                  subtitleStyle={subtitleStyle}
                  activeLineSpeech={activeLine?.speech}
                  activePresenter={activeLine?.speaker}
                />

                <PlaybackControls
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onReset={handleReset}
                  currentTime={currentTime}
                  totalDuration={totalDuration}
                  onSeek={handleSeek}
                  playbackRate={playbackRate}
                  onSpeedChange={setPlaybackRate}
                  isAudioOn={isAudioOn}
                  onToggleAudio={handleToggleAudio}
                />
              </div>

              {/* Right column: Avatars / Interactive Subtitles & Script logs */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                <PresenterAvatars
                  activePresenter={activeLine?.speaker || PresenterId.ANDI}
                  activeAction={activeLine?.action || ""}
                  activeSpeech={activeLine?.speech || ""}
                  activeTechnique={activeLine?.technique || ""}
                  playbackTime={currentTime}
                />

                {/* Vertical Script Highlights list */}
                <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-sm flex flex-col h-[280px]">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest border-b-2 border-stone-900 pb-2 mb-3">
                    📜 Buku Skenario Interaktif
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {scriptLines.map((line) => {
                      const isActive = line.id === activeLine?.id;
                      return (
                        <div
                          key={line.id}
                          onClick={() => handleSeek(line.timeInSeconds)}
                          className={`p-3 rounded-xl border text-[11px] cursor-pointer transition ${
                            isActive
                              ? "bg-pink-50 border-2 border-pink-500 text-stone-950 font-semibold shadow-sm"
                              : "bg-stone-50/50 border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono font-bold text-pink-600">
                              {line.timeCode} — {line.speaker.toUpperCase()}
                            </span>
                            {isActive && (
                              <span className="text-[9px] bg-pink-500 text-white rounded px-2 py-0.5 uppercase font-bold tracking-wide">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="line-clamp-2 leading-relaxed">
                            "{line.speech}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Video Studio Control Panel */}
                <div className="bg-white border-2 border-stone-950 rounded-3xl p-6 shadow-md flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b-2 border-stone-900 pb-2.5">
                    <h3 className="text-xs font-black text-stone-950 uppercase tracking-wider flex items-center gap-2">
                      <span className="p-1 rounded bg-rose-100 text-rose-600">
                        <VideoIcon className="h-3.5 w-3.5" />
                      </span>
                      📹 Studio Kamera & Eksportir Video
                    </h3>

                    <button 
                      onClick={() => setShowCameraOverlay(!showCameraOverlay)}
                      className={`text-[10px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                        showCameraOverlay 
                          ? "bg-rose-500 text-white" 
                          : "bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      {showCameraOverlay ? "Matikan Lampu REC" : "Aktifkan Lampu REC"}
                    </button>
                  </div>

                  {showCameraOverlay && (
                    <div className="grid grid-cols-2 gap-3.5 text-xs">
                      {/* Filter selection */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase">📺 Gaya Lensa / Filter</label>
                        <select 
                          value={cameraStyle} 
                          onChange={(e) => setCameraStyle(e.target.value as any)}
                          className="bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-pink-500"
                        >
                          <option value="webcam">Standard Clear</option>
                          <option value="retro">Camcorder VHS 📼</option>
                          <option value="neon">Cosmic Cyberpunk 🌸</option>
                        </select>
                      </div>

                      {/* Subtitle style selection */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-stone-500 font-extrabold uppercase">🗣 Gaya Subtitel</label>
                        <select 
                          value={subtitleStyle} 
                          onChange={(e) => setSubtitleStyle(e.target.value as any)}
                          className="bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-pink-500"
                        >
                          <option value="classic">Televisi Klasik 🏛</option>
                          <option value="yellow">CapCut Kuning 🌟</option>
                          <option value="banner">Solid Midnight 🎥</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Recorder actions */}
                  <div className="flex flex-col gap-2.5">
                    <button
                      onClick={isRecording ? () => { setIsPlaying(false); setIsRecording(false); setShowExportModal(true); } : handleStartRecording}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer border-2 ${
                        isRecording 
                          ? "bg-red-500 hover:bg-red-600 text-white border-red-700 animate-pulse" 
                          : "bg-stone-950 hover:bg-stone-900 border-stone-950 text-white hover:text-pink-100 shadow-sm"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? "bg-white animate-ping" : "bg-red-500"}`} />
                      {isRecording ? "Selesai & Ekspor Video Tugas..." : "Simulasi Rekam Video Tugas Baru"}
                    </button>

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={generateSRT}
                        className="py-2 px-2.5 rounded-lg border-2 border-stone-950 hover:bg-stone-50 font-bold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition text-stone-800 cursor-pointer"
                        title="Unduh file subtitel .SRT yang siap untuk drag-and-drop ke CapCut!"
                      >
                        <FileText className="h-3.5 w-3.5 text-pink-600" />
                        Unduh SRT CapCut
                      </button>

                      <button
                        onClick={generateTXT}
                        className="py-2 px-2.5 rounded-lg border-2 border-stone-950 hover:bg-stone-50 font-bold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition text-stone-800 cursor-pointer"
                        title="Unduh skrip naskah presentasi lengkap untuk dicetak"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                        Unduh Naskah TXT
                      </button>
                    </div>

                    <p className="text-[10px] text-stone-500 leading-normal text-center italic bg-stone-50 p-2.5 rounded-lg border border-stone-200 mt-1">
                      💡 <strong>Petunjuk Video:</strong> Ekspor file <strong>.srt (Subtitel)</strong> di atas untuk di-drag langsung ke <strong>CapCut / Premiere Pro</strong> agar video tugas presentasi kelompokmu langsung memiliki takarir otomatis yang presisi!
                    </p>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: EXPLORE MODE (FREE CLICK LAPBOOK ANALYSIS) */}
          {activeTab === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-6"
            >
              <div className="p-6 bg-pink-50 border-2 border-pink-200 rounded-3xl">
                <h2 className="text-xl font-serif italic text-pink-900">✂️ Bengkel Kerajinan Lapbook Kelompok 3</h2>
                <p className="text-xs text-pink-800 mt-2 leading-relaxed">
                  Karya seni visual lapbook Kelompok 3 didesain khusus agar audiens dari baris paling belakang pun tetap menangkap fokus. Gunakan panel di bawah ini untuk membuka dan menutup setiap katup visual murni buatan tangan Andi, Sinta, dan Rina!
                </p>
              </div>

              <LapbookVisualizer 
                currentTimeInSeconds={currentTime}
                isPlaying={false}
                onSelectLineByComponent={handleSelectLineByComponent}
              />
            </motion.div>
          )}

          {/* TAB 3: CHAT Q&A INTERACTION */}
          {activeTab === "qa" && (
            <motion.div
              key="qa"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <InteractiveQA />
            </motion.div>
          )}

          {/* TAB 4: REHEARSAL & PRACTICE */}
          {activeTab === "practice" && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <PracticePanel />
            </motion.div>
          )}

          {/* TAB 5: METHODOLOGY / TECH SHEET */}
          {activeTab === "techniques" && (
            <motion.div
              key="techniques"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-emerald-600" />
                  Ulasan Kritis Teknik Presentasi Skenario Video
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Skenario video Kelompok 3 memadukan teori retorika lisan modern dengan prinsip komunikasi visual taktil. Berikut adalah rekapitulasi poin-poin emas teknik komunikasi yang dipraktikkan:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                  {presentationTips.map((tip, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-400 transition-all duration-300 shadow-xs">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono font-bold text-pink-700 bg-pink-100 h-6 w-6 rounded-full flex items-center justify-center border border-pink-200">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900">{tip.title}</h4>
                      </div>
                      <p className="text-xs font-medium text-stone-800 leading-normal italic font-serif bg-white p-3 rounded-lg border border-stone-200">
                        "{tip.description}"
                      </p>
                      <p className="text-[11px] text-stone-600 mt-3 leading-relaxed">
                        <strong className="text-emerald-700 font-bold uppercase text-[9px] block mb-1">Mengapa ini Sangat Efektif:</strong>
                        {tip.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* EXPORT VIDEO SUCCESS MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border-4 border-stone-950 rounded-3xl p-6 max-w-lg w-full text-stone-900 shadow-2xl relative"
            >
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="text-stone-400 hover:text-stone-900 font-extrabold font-mono text-sm border border-stone-200 p-1.5 rounded-md hover:bg-stone-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                  🎞
                </div>
                <h3 className="text-xl font-serif font-black text-stone-950 uppercase">
                  Perekaman Simulasi Selesai!
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed px-2">
                  Selamat! Presentasi visual karya kelompok 3 telah selesai direkam secara virtual. Kamu sekarang memiliki semua bahan lengkap untuk merakit video tugas orisinalmu!
                </p>

                {/* Rendering Info Box */}
                <div className="bg-stone-50 border-2 border-stone-950 rounded-2xl p-4 text-left space-y-1.5 text-xs">
                  <p className="font-extrabold text-[10px] text-stone-500 uppercase">📊 METADATA REKAMAN:</p>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Durasi Presentasi:</span>
                    <strong className="font-mono text-stone-950">9 Menit 25 Detik</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Pembicara Lisan:</span>
                    <strong className="font-mono text-stone-950">Andi, Sinta, Rina, Budi</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Elemen Visual Lapbook:</span>
                    <strong className="font-mono text-stone-950">9 Interaksi Taktil Selesai</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Format Eksperimen:</span>
                    <strong className="font-mono text-pink-600 font-black">HD 1080p CapCut-Ready</strong>
                  </div>
                </div>

                {/* Action outputs */}
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => { generateSRT(); }}
                    className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 hover:opacity-90 transition font-black text-xs text-white uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-pink-700"
                  >
                    📥 Unduh Subtitel SRT (CapCut Autotrace)
                  </button>

                  <button
                    onClick={() => { generateTXT(); }}
                    className="w-full py-2.5 rounded-xl border-2 border-stone-950 hover:bg-stone-50 transition font-black text-xs text-stone-900 uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                  >
                    📄 Unduh Naskah Percakapan (.TXT)
                  </button>
                </div>

                <div className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-250 rounded-lg p-2.5">
                  ✓ File .srt dapat dimasukkan ke film CapCut, TikTok, atau Premiere untuk meletakkan teks otomatis pada video kamu sekejap mata!
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
