import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  RotateCw, 
  Layers, 
  MapPin, 
  Smile, 
  Eye, 
  Flower2, 
  Compass, 
  Info,
  ChevronRight,
  ChevronLeft,
  FlameKindling
} from "lucide-react";
import { PresenterId, LapbookComponent } from "../types";
import { lapbookComponents } from "../data";

interface LapbookVisualizerProps {
  currentTimeInSeconds: number;
  isPlaying: boolean;
  activeLineId?: string;
  onSelectLineByComponent?: (componentId: string) => void;
  // New props for Video Studio Simulation
  showCameraOverlay?: boolean;
  isRecording?: boolean;
  cameraStyle?: "webcam" | "retro" | "neon";
  subtitleStyle?: "classic" | "yellow" | "banner";
  activeLineSpeech?: string;
  activePresenter?: PresenterId;
}

export default function LapbookVisualizer({
  currentTimeInSeconds,
  isPlaying,
  activeLineId,
  onSelectLineByComponent,
  showCameraOverlay = false,
  isRecording = false,
  cameraStyle = "webcam",
  subtitleStyle = "classic",
  activeLineSpeech,
  activePresenter,
}: LapbookVisualizerProps) {
  // Mode selection: Explore (manually click things) vs Playback Sync (auto-highlight based on story)
  const [isExploreMode, setIsExploreMode] = useState<boolean>(false);
  const [selectedExploreComponent, setSelectedExploreComponent] = useState<LapbookComponent | null>(null);

  // Physical states for individual elements
  const [isCoverOpen, setIsCoverOpen] = useState<boolean>(false);
  const [miniBookPage, setMiniBookPage] = useState<number>(1);
  const [isColorFlapOpen, setIsColorFlapOpen] = useState<boolean>(false);
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    head: false,
    thorax: false,
    legs: false
  });
  const [accordionStage, setAccordionStage] = useState<number>(0); // 0 (hidden), 1, 2, 3
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [pocketActiveCard, setPocketActiveCard] = useState<number | null>(null); // null, 0, 1, 2
  const [isRecapOpen, setIsRecapOpen] = useState<boolean>(false);

  // Pre-calculate active component based on playback timing
  const [currentSyncComponentId, setCurrentSyncComponentId] = useState<string>("cover");

  // Reset or adjust folding based on playback timeline if NOT in explore mode
  useEffect(() => {
    if (isExploreMode) return;

    // Timing state matching Andi, Sinta, Rina, Budi's speech
    // 0s - 10s: Cover closed
    if (currentTimeInSeconds < 10) {
      setIsCoverOpen(false);
      setCurrentSyncComponentId("cover");
    } 
    // 10s - 55s: Banner / Intro
    else if (currentTimeInSeconds >= 10 && currentTimeInSeconds < 60) {
      setIsCoverOpen(true);
      setCurrentSyncComponentId("banner");
    }
    // 60s - 115s: Mini book classification
    else if (currentTimeInSeconds >= 60 && currentTimeInSeconds < 115) {
      setIsCoverOpen(true);
      setCurrentSyncComponentId("minibook");
      if (currentTimeInSeconds >= 85) {
        setMiniBookPage(2);
      } else {
        setMiniBookPage(1);
      }
    }
    // 115s - 160s: Flap Color
    else if (currentTimeInSeconds >= 115 && currentTimeInSeconds < 160) {
      setIsCoverOpen(true);
      setIsColorFlapOpen(true);
      setCurrentSyncComponentId("flap_color");
    }
    // 160s - 213s: Windows Anatomy
    else if (currentTimeInSeconds >= 160 && currentTimeInSeconds < 213) {
      setIsCoverOpen(true);
      setCurrentSyncComponentId("windows_anatomy");
      if (currentTimeInSeconds < 185) {
        setOpenWindows({ head: true, thorax: true, legs: false });
      } else {
        setOpenWindows({ head: true, thorax: true, legs: true });
      }
    }
    // 213s - 255s: Storytelling Accordion
    else if (currentTimeInSeconds >= 213 && currentTimeInSeconds < 255) {
      setIsCoverOpen(true);
      setCurrentSyncComponentId("accordion_hunt");
      // progress accordion
      if (currentTimeInSeconds < 235) {
        setAccordionStage(1);
      } else {
        setAccordionStage(3);
      }
    }
    // 255s - 280s: Prey Wheel
    else if (currentTimeInSeconds >= 255 && currentTimeInSeconds < 280) {
      setIsCoverOpen(true);
      setCurrentSyncComponentId("wheel_prey");
      // rotate wheel dynamically to simulate spin
      setWheelRotation((prev) => (isPlaying ? prev + 0.6 : prev));
    }
    // 280s - 318s: Pocket Habitat
    else if (currentTimeInSeconds >= 280 && currentTimeInSeconds < 318) {
      setIsCoverOpen(true);
      setCurrentSyncComponentId("pocket_habitat");
      if (currentTimeInSeconds < 292) {
        setPocketActiveCard(0);
      } else if (currentTimeInSeconds < 305) {
        setPocketActiveCard(1);
      } else {
        setPocketActiveCard(2);
      }
    }
    // 318s - 380s: Recap / Budi
    else if (currentTimeInSeconds >= 318 && currentTimeInSeconds < 380) {
      setIsCoverOpen(true);
      setIsRecapOpen(true);
      setCurrentSyncComponentId("recap_summary");
    }
    // Closing
    else {
      setIsCoverOpen(true);
      setCurrentSyncComponentId("banner");
    }
  }, [currentTimeInSeconds, isExploreMode, isPlaying]);

  const toggleCover = () => {
    setIsCoverOpen(!isCoverOpen);
    if (isExploreMode) {
      const comp = lapbookComponents.find(c => c.id === "cover");
      if (comp) setSelectedExploreComponent(comp);
    }
  };

  const handleComponentClick = (componentId: string) => {
    const component = lapbookComponents.find(c => c.id === componentId);
    if (!component) return;

    if (onSelectLineByComponent) {
      onSelectLineByComponent(componentId);
    }

    if (isExploreMode || !isPlaying) {
      // Allow rich modifications & select
      setSelectedExploreComponent(component);
      // Open corresponding visual elements
      if (componentId === "cover") setIsCoverOpen(!isCoverOpen);
      if (componentId === "flap_color") setIsColorFlapOpen(!isColorFlapOpen);
      if (componentId === "recap_summary") setIsRecapOpen(!isRecapOpen);
      if (componentId === "minibook") {
        setMiniBookPage(miniBookPage === 1 ? 2 : 1);
      }
      if (componentId === "windows_anatomy") {
        setOpenWindows(prev => ({
          head: !prev.head,
          thorax: !prev.thorax,
          legs: !prev.legs
        }));
      }
      if (componentId === "accordion_hunt") {
        setAccordionStage((prev) => (prev + 1) % 4);
      }
      if (componentId === "wheel_prey") {
        setWheelRotation(prev => prev + 45);
      }
      if (componentId === "pocket_habitat") {
        setPocketActiveCard(prev => (prev === null ? 0 : prev === 2 ? null : prev + 1));
      }
    }
  };

  const activeHighlightedId = isExploreMode && selectedExploreComponent 
    ? selectedExploreComponent.id 
    : currentSyncComponentId;

  return (
    <div className="flex flex-col h-full bg-white border-2 border-stone-950 rounded-3xl p-6 shadow-md relative overflow-hidden text-stone-900">
      {/* Decorative background paper-like patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-stone-900 z-10">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isExploreMode ? 'bg-amber-400' : 'bg-pink-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isExploreMode ? 'bg-amber-500' : 'bg-pink-500'}`}></span>
            </span>
            Simulasi Lapbook Kelompok 3
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {isExploreMode 
              ? "📋 Mode Eksplorasi: Bebas klik elemen lapbook untuk memicu penjelasan." 
              : "⏳ Mode Putar: Elemen terlipat bertahap sesuai menit presentasi."}
          </p>
        </div>

        <button
          onClick={() => {
            setIsExploreMode(!isExploreMode);
            setSelectedExploreComponent(null);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 border-2 ${
            isExploreMode 
              ? "bg-amber-100 text-amber-900 border-amber-500 shadow-sm" 
              : "bg-stone-100 text-stone-800 border-stone-300 hover:border-stone-400 hover:bg-stone-200"
          }`}
          id="btn-toggle-explore"
        >
          {isExploreMode ? "Kembali ke Auto-Sync" : "Klik Bebas (Explore)"}
        </button>
      </div>

      {/* Main Gatefold Lapbook */}
      <div className="flex-1 flex items-center justify-center min-h-[360px] relative">
        <div className="relative w-full max-w-4xl h-[460px] bg-stone-100 rounded-2xl border-4 border-stone-950 shadow-inner flex overflow-hidden">
          
          {/* ANCHOR: GATES CLOSED LAYER */}
          <AnimatePresence>
            {!isCoverOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-30 flex cursor-pointer"
                onClick={toggleCover}
                id="lapbook-gates-closed"
              >
                {/* Left gate */}
                <motion.div 
                  initial={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-1/2 h-full bg-emerald-900 border-r-2 border-stone-950 flex flex-col justify-between p-6 shadow-xl relative"
                >
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-24 bg-pink-400/20 rounded-l-full border-l border-y border-pink-400/30" />
                  <div className="flex items-center gap-2 text-pink-200 font-bold">
                    <Flower2 className="h-5 w-5" />
                    <span className="text-xs tracking-widest uppercase">KELOMPOK 3</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-300 font-mono font-bold">Presentasi Observasi</p>
                    <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-stone-100 to-emerald-200 tracking-tight">Belalang</p>
                  </div>
                  <p className="text-xs text-emerald-300/80 font-semibold">X-A SMAN 1 Jakarta</p>
                </motion.div>

                {/* Right gate */}
                <motion.div 
                  initial={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-1/2 h-full bg-emerald-900 flex flex-col justify-between p-6 shadow-xl relative"
                >
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 w-8 h-24 bg-pink-400/20 rounded-r-full border-r border-y border-pink-400/30 flex items-center justify-center">
                    <motion.div 
                      animate={{ x: [0, 3, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-pink-300"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <div className="text-xs text-emerald-300/80 font-mono font-bold text-right">SMA Negeri Kelas X</div>
                  <div className="text-left mt-10">
                    <p className="text-6xl font-black text-pink-300 tracking-tight">Anggrek</p>
                    <p className="italic text-sm text-pink-100 font-bold mt-1">Hymenopus coronatus</p>
                  </div>
                  <div className="text-xs text-stone-100 font-bold tracking-wide flex items-center gap-1.5 bg-rose-600/90 py-1.5 px-3 rounded-md border border-rose-500 w-fit">
                    <span className="w-2 h-2 bg-white rounded-full inline-block animate-pulse"></span>
                    BUKA LAPBOOK
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ANCHOR: LAPBOOK INNER PANELS */}
          {isCoverOpen && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full flex flex-row relative z-10 text-stone-800"
              id="lapbook-inside"
            >
              <div className="absolute inset-0 bg-stone-100/50 pointer-events-none" />

              {/* 1. LEFT PANEL (Width 30%) */}
              <div className="w-[30%] h-full border-r-2 border-stone-900 bg-stone-50 p-4 flex flex-col gap-4 overflow-y-auto relative z-10 scrollbar-thin">
                
                {/* 1a. Mini Book Lipat */}
                <div 
                  onClick={() => handleComponentClick("minibook")}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 relative border-2 ${
                    activeHighlightedId === "minibook" 
                      ? "bg-white border-pink-500 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-minibook"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-pink-600 flex items-center gap-1 uppercase">
                      <BookOpen className="h-3 w-3" /> Mini-Book
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">Andi - 1:00</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950">Klasifikasi Ilmiah</h4>
                  
                  {/* Visual 3D page flip */}
                  <div className="mt-2 text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-200 min-h-[95px] flex flex-col justify-between">
                    <div>
                      {miniBookPage === 1 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <p className="font-bold text-pink-600">Definisi & Ordo</p>
                          <p className="text-stone-700 leading-snug mt-1 italic text-[10px] font-serif">
                            "Serangga predator ordo Mantodea, famili Hymenopodidae. Melakukan mimikri menyerupai bunga anggrek."
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <p className="font-bold text-emerald-700">Peta Kekerabatan</p>
                          <p className="text-stone-700 leading-snug mt-1 text-[10px]">
                            Berkerabat dekat dengan <strong className="text-pink-600">Belalang Sembah</strong>. Bedanya belalang anggrek tinggal menetap di bunga, sembah di dedaunan.
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t border-stone-200">
                      <span className="text-[9px] text-stone-500 font-mono">Halaman {miniBookPage}/2</span>
                      <button className="text-[9px] text-pink-600 font-bold flex items-center hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setMiniBookPage(miniBookPage === 1 ? 2 : 1); }}>
                        Balik <RotateCw className="h-2 w-2 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1b. Flap Warna Katup */}
                <div 
                  onClick={() => handleComponentClick("flap_color")}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 relative border-2 ${
                    activeHighlightedId === "flap_color" 
                      ? "bg-white border-pink-500 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-flap-color"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-pink-600 flex items-center gap-1 uppercase">
                      <Layers className="h-3 w-3" /> Liftable Flap
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">Sinta - 2:05</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950">Warna Kamuflase</h4>

                  <div className="mt-2 relative bg-stone-50 p-2.5 rounded-lg border border-stone-200 overflow-hidden text-[10px]">
                    <div className="flex gap-1.5 mb-2">
                      <span className="h-3.5 w-3.5 rounded-full bg-pink-100 border border-pink-300 inline-block" title="Putih Kelopak" />
                      <span className="h-3.5 w-3.5 rounded-full bg-pink-300 border border-pink-400 inline-block" title="Pink Muda" />
                      <span className="h-3.5 w-3.5 rounded-full bg-amber-100 border border-amber-300 inline-block" title="Kuning Pucat" />
                    </div>

                    <AnimatePresence>
                      {isColorFlapOpen ? (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-stone-700 overflow-hidden leading-snug"
                        >
                          <p className="text-[10px] font-medium leading-relaxed">
                            Mampu menyatu utuh dengan variasi mahkota bunga anggrek asli. Predator benci ataupun terkecoh mengiranya kelopak mati!
                          </p>
                        </motion.div>
                      ) : (
                        <div className="text-center py-2 text-pink-700 font-bold bg-pink-50 rounded cursor-pointer border-2 border-pink-500 text-[9px] uppercase tracking-wider">
                          Angkat Katup Lipat
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* 2. CHIEF CENTER PANEL (Width 40%) */}
              <div className="w-[40%] h-full p-4 flex flex-col justify-between items-center relative z-10 gap-3 bg-stone-100/30">
                
                {/* Title Banner */}
                <div 
                  onClick={() => handleComponentClick("banner")}
                  className={`w-full text-center py-2.5 px-3 rounded-2xl cursor-pointer border-2 transition-all duration-300 relative ${
                    activeHighlightedId === "banner" 
                      ? "bg-white border-stone-900 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-banner"
                >
                  <div className="absolute top-1 left-2 text-[8px] text-stone-400 uppercase tracking-widest font-bold">Judul 3D Lapbook</div>
                  <h1 className="text-sm font-black text-stone-950 tracking-wide uppercase mt-1">BELALANG ANGGREK</h1>
                  <p className="italic text-[10px] text-pink-600 font-mono font-bold">Hymenopus coronatus</p>
                </div>

                {/* Decorative Canvas Orchid and Mantis representation */}
                <div className="flex-1 w-full my-1.5 flex flex-col justify-center items-center relative rounded-2xl border-2 border-dashed border-stone-300 bg-white p-3 overflow-hidden">
                  {/* Orchid Background illustration using SVGs */}
                  <svg className="absolute w-44 h-44 opacity-15 text-pink-400 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 15 C35 15, 30 35, 50 45 C70 35, 65 15, 50 15 Z" />
                    <path d="M50 45 C35 55, 15 50, 25 70 C40 65, 45 55, 50 45 Z" />
                    <path d="M50 45 C65 55, 85 50, 75 70 C60 65, 55 55, 50 45 Z" />
                    <circle cx="50" cy="45" r="5" className="text-amber-400" />
                  </svg>

                  {/* Animated Mantis silhouette overlay */}
                  <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                      animate={{ 
                        y: isPlaying ? [1, -2, 1] : 0, 
                        rotate: isPlaying ? [-1, 2, -1] : 0 
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="px-4 py-2.5 bg-pink-50/70 border-2 border-pink-500 rounded-2xl flex flex-col items-center shadow-sm"
                    >
                      <span className="text-[10px] bg-pink-600 text-white rounded px-2 py-0.5 font-bold uppercase tracking-wider mb-1 shadow">
                        MIMIKRI AKTIF
                      </span>
                      <p className="text-[11px] font-mono font-bold text-center text-stone-950">90% Predasi Efektif</p>
                      <p className="text-[9px] text-stone-550 text-center font-medium mt-0.5">Tubuh menyerupai kelopak anggrek tropis</p>
                    </motion.div>

                    {/* Small action highlight for the timing */}
                    <p className="mt-3 text-[10px] text-pink-600 font-bold italic text-center px-4 font-serif">
                      {currentTimeInSeconds < 115 
                        ? "Andi sedang menjelaskan dasar penelitian..." 
                        : currentTimeInSeconds < 213 
                        ? "Sinta menunjukkan warna dan mikrograf anatomi..." 
                        : currentTimeInSeconds < 318 
                        ? "Rina menceritakan drama penyergapan berburu..." 
                        : "Budi menarik kesimpulan penutup!"}
                    </p>
                  </div>
                </div>

                {/* 3. Budi's Big Recap Flap at Bottom */}
                <div 
                  onClick={() => handleComponentClick("recap_summary")}
                  className={`w-full p-2.5 rounded-2xl cursor-pointer border-2 transition-all duration-300 relative overflow-hidden ${
                    activeHighlightedId === "recap_summary" 
                      ? "bg-white border-amber-500 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-recap"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 uppercase">
                      <Compass className="h-3 w-3" /> Katup Ringkasan Besar
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">Budi - 5:25</span>
                  </div>

                  <AnimatePresence>
                    {isRecapOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 text-[10px] text-stone-800 leading-snug space-y-1 overflow-hidden bg-stone-50 p-2.5 rounded-lg border border-stone-200 font-medium"
                      >
                        <p className="flex items-start gap-1">
                          <strong className="text-amber-700 font-mono">1.</strong> 
                          <span>Kemampuan mimikri menyerupai mahkota anggrek.</span>
                        </p>
                        <p className="flex items-start gap-1">
                          <strong className="text-amber-700 font-mono">2.</strong> 
                          <span>Daya sergap kaki raptorial 1/20 detik (90% sukses).</span>
                        </p>
                        <p className="flex items-start gap-1">
                          <strong className="text-amber-700 font-mono">3.</strong> 
                          <span>Spesies terancam deforestasi hutan tropis Asia Tenggara.</span>
                        </p>
                      </motion.div>
                    ) : (
                      <div className="text-center text-[9px] font-bold text-amber-800 py-1.5 bg-amber-50 rounded mt-1 border-2 border-amber-500">
                        Buka Katup Kesimpulan Utama
                      </div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* 3. RIGHT PANEL (Width 30%) */}
              <div className="w-[30%] h-full border-l-2 border-stone-900 bg-stone-50 p-4 flex flex-col gap-4 overflow-y-auto relative z-10 scrollbar-thin">
                
                {/* 3a. Jendela Anatomi (Sinta) */}
                <div 
                  onClick={() => handleComponentClick("windows_anatomy")}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 relative border-2 ${
                    activeHighlightedId === "windows_anatomy" 
                      ? "bg-white border-pink-500 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-anatomy"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-pink-600 flex items-center gap-1 uppercase">
                      <Eye className="h-3 w-3" /> Double Window
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">Sinta - 2:40</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950">Katup Jendela Tubuh</h4>

                  {/* Double swing windows layout */}
                  <div className="grid grid-cols-3 gap-1 mt-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
                    
                    {/* Window 1: Head */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenWindows(prev => ({ ...prev, head: !prev.head }));
                      }}
                      className="bg-white border border-stone-200 rounded p-1 text-center cursor-pointer min-h-[50px] flex flex-col justify-between hover:border-stone-400"
                    >
                      <span className="text-[8px] font-extrabold text-stone-500 uppercase">Kepala</span>
                      {openWindows.head ? (
                        <span className="text-[8px] text-pink-700 font-mono font-bold leading-tight">Mata Majemuk Peka</span>
                      ) : (
                        <div className="bg-pink-500 text-white rounded text-[7px] py-[1px] uppercase font-bold border border-pink-600">Buka</div>
                      )}
                    </div>

                    {/* Window 2: Toraks */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenWindows(prev => ({ ...prev, thorax: !prev.thorax }));
                      }}
                      className="bg-white border border-stone-200 rounded p-1 text-center cursor-pointer min-h-[50px] flex flex-col justify-between hover:border-stone-400"
                    >
                      <span className="text-[8px] font-extrabold text-stone-500 uppercase">Toraks</span>
                      {openWindows.thorax ? (
                        <span className="text-[8px] text-pink-700 font-mono font-bold leading-tight">2 Sayap Terbang</span>
                      ) : (
                        <div className="bg-pink-500 text-white rounded text-[7px] py-[1px] uppercase font-bold border border-pink-600">Buka</div>
                      )}
                    </div>

                    {/* Window 3: Kaki Raptorial */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenWindows(prev => ({ ...prev, legs: !prev.legs }));
                      }}
                      className="bg-white border border-stone-200 rounded p-1 text-center cursor-pointer min-h-[50px] flex flex-col justify-between hover:border-stone-400"
                    >
                      <span className="text-[8px] font-extrabold text-stone-500 uppercase">Kaki</span>
                      {openWindows.legs ? (
                        <span className="text-[8px] text-pink-700 font-mono font-bold leading-tight">1/20 Detik Duri</span>
                      ) : (
                        <div className="bg-pink-500 text-white rounded text-[7px] py-[1px] uppercase font-bold border border-pink-600">Buka</div>
                      )}
                    </div>

                  </div>
                </div>

                {/* 3b. Accordion Storytelling (Rina) */}
                <div 
                  onClick={() => handleComponentClick("accordion_hunt")}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 relative border-2 ${
                    activeHighlightedId === "accordion_hunt" 
                      ? "bg-white border-emerald-500 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-accordion"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 uppercase">
                      <Layers className="h-3 w-3" /> Accordion
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">Rina - 3:43</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950">Skenario Berburu</h4>

                  {/* Visual accordion folds */}
                  <div className="mt-2 space-y-1.5 bg-stone-100 p-2 rounded-lg border border-stone-200 text-[10px]">
                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-stone-200">
                      <span className="font-extrabold text-emerald-800">Siklus Fase</span>
                      <span className="text-[8px] px-1.5 bg-stone-200 rounded text-stone-700 font-bold font-mono">Tahap {accordionStage}/3</span>
                    </div>

                    <div className="space-y-1">
                      {accordionStage >= 1 && (
                        <motion.div initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-1.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-950">
                          🌾 <strong>Posisi diam:</strong> Membeku mirip kelopak.
                        </motion.div>
                      )}
                      {accordionStage >= 2 && (
                        <motion.div initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-1.5 bg-emerald-100 border border-emerald-400 rounded text-emerald-950">
                          ⏳ <strong>Menunggu:</strong> Membiarkan mangsa mengisap nektar.
                        </motion.div>
                      )}
                      {accordionStage >= 3 && (
                        <motion.div initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-1.5 bg-pink-500 border-2 border-pink-600 rounded font-bold text-white shadow-xs">
                          ⚡ <strong>WHUSH!:</strong> Sergap dalam 1/20 detik!
                        </motion.div>
                      )}
                      {accordionStage === 0 && (
                        <div className="text-center py-2 text-stone-500 italic text-[9px]">
                          Ketuk untuk menarik accordion secara serial
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3c. Prey Wheel Roda berputar (Rina) */}
                <div 
                  onClick={() => handleComponentClick("wheel_prey")}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 relative border-2 ${
                    activeHighlightedId === "wheel_prey" 
                      ? "bg-white border-emerald-500 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-wheel"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 uppercase">
                      <RotateCw className="h-3 w-3 animate-spin-slow text-emerald-600" /> Prey Wheel
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">Rina - 4:15</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950">Roda Pakan Mangsa</h4>

                  {/* Rotatable wheel simulation */}
                  <div className="mt-2 flex flex-col items-center">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <motion.div 
                        style={{ rotate: wheelRotation }}
                        className="w-full h-full rounded-full border-4 border-stone-900 bg-stone-50 flex items-center justify-center overflow-hidden shadow-inner relative"
                      >
                        {/* Wheel sectors */}
                        <div className="absolute inset-x-0 h-0.5 bg-stone-300 rotate-0"></div>
                        <div className="absolute inset-x-0 h-0.5 bg-stone-300 rotate-45"></div>
                        <div className="absolute inset-x-0 h-0.5 bg-stone-300 rotate-90"></div>
                        <div className="absolute inset-x-0 h-0.5 bg-stone-300 rotate-135"></div>
                        
                        {/* Wheel tags */}
                        <div className="absolute top-1 text-[7px] text-stone-900 font-bold">🦋 Kupu</div>
                        <div className="absolute bottom-1 text-[7px] text-stone-900 font-bold">🐝 Lebah</div>
                        <div className="absolute left-1 text-[7px] text-stone-900 font-bold">🦟 Lalat</div>
                        <div className="absolute right-1 text-[7px] text-stone-900 font-bold">🐸 Katak</div>
                      </motion.div>
                      {/* Fixed center pointer */}
                      <div className="absolute w-6 h-6 bg-rose-500 rounded-full border-2 border-white shadow flex items-center justify-center font-bold text-[8px] text-white">
                        90%
                      </div>
                    </div>
                    <span className="text-[8px] text-stone-500 mt-2 font-bold hover:underline">Ketuk roda untuk memutarnya!</span>
                  </div>
                </div>

                {/* 3d. Habitat pocket (Rina) */}
                <div 
                  onClick={() => handleComponentClick("pocket_habitat")}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 relative border-2 ${
                    activeHighlightedId === "pocket_habitat" 
                      ? "bg-white border-emerald-500 shadow-md" 
                      : "bg-white border-stone-200 hover:border-stone-400"
                  }`}
                  id="lapbook-card-pocket"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 uppercase">
                      <MapPin className="h-3 w-3" /> Habitat Pocket
                    </span>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">Rina - 4:40</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950">Kantong Kartu Habitat</h4>

                  {/* Saku visual and slot cards popping up */}
                  <div className="mt-2.5 relative bg-stone-200 p-2 pt-4 rounded-lg border border-stone-300 min-h-[65px] flex items-end justify-center">
                    
                    {/* Pocket mouth lines */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-stone-400" />

                    {/* Pullable cards */}
                    <div className="flex gap-1 justify-center w-full relative z-10">
                      {[
                        { title: "Kawasan", desc: "Hutan tropis se-Asia Tenggara & Indonesia." },
                        { title: "Ketinggian", desc: "Berhabitat pada ketinggian 0 - 500 mdpl." },
                        { title: "Ancaman", desc: "Deforestasi & perdagangan hewan ilegal." }
                      ].map((card, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: pocketActiveCard === i ? -14 : 0,
                            scale: pocketActiveCard === i ? 1.05 : 1,
                            zIndex: pocketActiveCard === i ? 10 : 1,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPocketActiveCard(pocketActiveCard === i ? null : i);
                          }}
                          className={`w-1/3 py-1 px-1.5 rounded text-center cursor-pointer border-2 text-[8px] font-bold ${
                            pocketActiveCard === i 
                              ? "bg-emerald-600 text-white border-emerald-700" 
                              : "bg-white text-stone-850 border-stone-950 hover:bg-stone-50"
                          }`}
                        >
                          {card.title}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Card Description */}
                  {pocketActiveCard !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 p-2 rounded-lg bg-emerald-50 border-2 border-emerald-300 text-[10px] text-emerald-950 font-medium"
                    >
                      {[
                        "Hutan tropis se-Asia Tenggara & Indonesia.",
                        "Berhabitat pada ketinggian 0 - 500 mdpl (ketinggian ideal untuk bunga anggrek berkembang).",
                        "Kerusakan hutan (deforestasi) serta eksploitasi hias/peliharaan mengancam keberlangsungan spesies."
                      ][pocketActiveCard]}
                    </motion.div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* CAMERA STUDIO OVERLAYS */}
          {showCameraOverlay && (
            <div className={`absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 ${
              cameraStyle === "retro" ? "contrast-125 brightness-90 saturate-75" : 
              cameraStyle === "neon" ? "hue-rotate-15 saturate-125" : ""
            }`}>
              {/* Retro VHS Scanlines / Grid lines layer overlay */}
              {cameraStyle === "retro" && (
                <div 
                  className="absolute inset-0 bg-repeat bg-center opacity-15 pointer-events-none" 
                  style={{ backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.3) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.08), rgba(0, 255, 0, 0.04), rgba(0, 0, 255, 0.08))", backgroundSize: "100% 4px, 3px 100%" }}
                />
              )}
              {cameraStyle === "neon" && (
                <div className="absolute inset-0 border-2 border-pink-500/40 rounded-xl animate-pulse pointer-events-none" />
              )}

              {/* Top Bar indicators */}
              <div className="flex justify-between items-start w-full relative z-50">
                <div className="flex items-center gap-2 bg-stone-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg text-white">
                  <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                    {isRecording ? (
                      <>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-450 animate-ping opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    )}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest">
                    {isRecording ? "REC ●" : "STANDBY"}
                  </span>
                  <span className="h-3 w-px bg-white/20 mx-1" />
                  <span className="text-[10px] text-stone-300 font-mono font-bold">1080p 60FPS</span>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="bg-stone-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg text-[10px] text-stone-300 font-mono font-semibold">
                    ⏱ {Math.floor(currentTimeInSeconds / 60)}:{(Math.floor(currentTimeInSeconds) % 60).toString().padStart(2, "0")}
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-1.5 bg-red-600 text-white font-extrabold text-[8px] tracking-wider uppercase px-2.5 py-1 rounded shadow-md border border-red-500 animate-pulse">
                      📹 BERLANGSUNG
                    </div>
                  )}
                </div>
              </div>

              {/* Viewfinder crosshairs or corners */}
              <div className="absolute inset-8 border border-white/5 flex items-center justify-center pointer-events-none">
                <div className="w-5 h-5 border-t-2 border-l-2 border-white/40 absolute top-0 left-0" />
                <div className="w-5 h-5 border-t-2 border-r-2 border-white/40 absolute top-0 right-0" />
                <div className="w-5 h-5 border-b-2 border-l-2 border-white/40 absolute bottom-0 left-0" />
                <div className="w-5 h-5 border-b-2 border-r-2 border-white/40 absolute bottom-0 right-0" />
              </div>

              {/* Bottom: Subtitles Overlay & Floating Presenter Face */}
              <div className="flex justify-between items-end w-full relative z-50">
                
                {/* 1. Large Captions style overlay */}
                <div className="flex-1 max-w-[70%] mr-4 text-left pointer-events-auto">
                  {activeLineSpeech && (
                    <motion.div 
                      key={activeLineSpeech}
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`font-sans rounded-xl p-3 shadow-xl leading-relaxed select-text ${
                        subtitleStyle === "yellow" 
                          ? "bg-amber-400 text-stone-950 font-extrabold border-2 border-stone-950 text-center text-xs md:text-sm uppercase tracking-wide"
                          : subtitleStyle === "banner"
                          ? "bg-stone-950/95 text-white border border-stone-800 font-bold text-center text-xs md:text-sm"
                          : "bg-black/80 backdrop-blur-sm text-stone-100 font-serif border border-white/10 text-xs md:text-sm px-4 shadow-2xl py-2.5 rounded-lg italic text-center"
                      }`}
                    >
                      "{activeLineSpeech}"
                    </motion.div>
                  )}
                </div>

                {/* 2. Mini Floating Active Presenter Webcam Feed */}
                {activePresenter && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="w-24 h-24 rounded-2xl bg-stone-950/90 backdrop-blur-md border-2 border-pink-500 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto"
                  >
                    {/* Tiny green live webcam light */}
                    <div className="absolute top-1 right-1 flex items-center gap-1 font-mono text-[6px] text-emerald-400 font-bold bg-black/50 px-1 py-0.5 rounded border border-emerald-500/20">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                      LIVE
                    </div>

                    <div className="text-3xl mt-1 select-none animate-bounce" style={{ animationDuration: isPlaying ? "1s" : "0s" }}>
                      {activePresenter === PresenterId.ANDI ? "👦" :
                       activePresenter === PresenterId.SINTA ? "👧" :
                       activePresenter === PresenterId.RINA ? "👩" : "👨"}
                    </div>

                    <span className="text-[10px] text-white font-extrabold uppercase tracking-wider mt-1">
                      {activePresenter === PresenterId.ANDI ? "Andi" :
                       activePresenter === PresenterId.SINTA ? "Sinta" :
                       activePresenter === PresenterId.RINA ? "Rina" : "Budi"}
                    </span>

                    <span className="text-[7px] text-pink-300 font-semibold mb-1">
                      {isPlaying ? "🎙 Bicara..." : "⏸ Diam"}
                    </span>

                    {/* Simple bouncing audio bar when isPlaying */}
                    {isPlaying && (
                      <div className="absolute bottom-0 inset-x-0 h-1.5 flex items-end justify-center gap-[1px] px-2 bg-black/40">
                        <span className="h-1 flex-1 bg-pink-500 animate-[bounce_0.6s_infinite]" />
                        <span className="h-3 flex-1 bg-pink-500 animate-[bounce_0.4s_infinite_0.1s]" />
                        <span className="h-2 flex-1 bg-pink-500 animate-[bounce_0.5s_infinite_0.2s]" />
                      </div>
                    )}
                  </motion.div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Explore Explanations Panel */}
      <AnimatePresence>
        {isExploreMode && selectedExploreComponent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-5 bg-stone-950 border-2 border-stone-950 rounded-2xl z-10 text-white shadow-lg"
            id="lapbook-explore-pane"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-pink-300 uppercase bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-400/20">
                  Detail Elemen Lapbook
                </span>
                <h4 className="text-base font-bold text-white mt-2">
                  {selectedExploreComponent.name}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedExploreComponent(null)}
                className="text-stone-400 hover:text-white text-xs bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-md cursor-pointer border border-stone-700 transition"
              >
                Tutup
              </button>
            </div>
            <p className="text-sm text-stone-300 mt-2 leading-relaxed">
              {selectedExploreComponent.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-800 text-xs">
              <div>
                <span className="text-pink-300 font-bold flex items-center gap-1">
                  💡 Tips Teknik Presentasi:
                </span>
                <p className="text-stone-400 mt-1 leading-relaxed">
                  {selectedExploreComponent.techniqueTip}
                </p>
              </div>
              <div>
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  ✂️ Pembuatan di Dunia Nyata:
                </span>
                <p className="text-stone-400 mt-1 leading-relaxed">
                  {selectedExploreComponent.realLifeCrafting}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
