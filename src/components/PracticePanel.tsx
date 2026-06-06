import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  HelpCircle, 
  Award, 
  Sparkles, 
  BookOpen, 
  RefreshCw, 
  Check, 
  Smile, 
  AlertCircle,
  Play
} from "lucide-react";
import { PresenterId } from "../types";

export default function PracticePanel() {
  const [selectedRole, setSelectedRole] = useState<PresenterId>(PresenterId.ANDI);
  const [speechInput, setSpeechInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const practiceScenarios = [
    {
      id: PresenterId.ANDI,
      title: "Andi: Membuka dengan Hook Menarik",
      script: "Tahukah kalian... ada serangga yang bisa menyamar menjadi bunga? Bukan sekadar menyerupai — tetapi meniru setiap detail kelopak, warna, bahkan goyangan tertiup angin. Predator sekelas kadal pun tertipu.",
      tips: "Gunakan jeda dramatis 2 detik setelah kalimat pertama untuk membangun rasa antusias audiens.",
      requiredKeywords: ["menyamar", "bunga", "bukan sekadar menyerupai", "predator", "kadal"],
      weight: "Hook & Ekspresi"
    },
    {
      id: PresenterId.SINTA,
      title: "Sinta: Menyajikan Data Anatomi",
      script: "Nah, kaki raptorial ini senjata utamanya. Kaki ini dilengkapi duri-duri tajam yang digunakan untuk mencengkeram mangsa dalam waktu hanya satu per dua puluh detik. Cepat banget, kan?",
      tips: "Berikan penekanan kuat pada kalimat 'satu per dua puluh detik' dan pastikan kamu menunjuk gambar kaki raptorial.",
      requiredKeywords: ["raptorial", "senjata utama", "duri-duri tajam", "satu per dua puluh detik", "cepat banget"],
      weight: "Akurasi Teknis & Tunjuk-Ucap"
    },
    {
      id: PresenterId.RINA,
      title: "Rina: Mendongengkan Proses Berburu",
      script: "Lalu, saat mangsanya berada dalam jangkauan... WHUSH! Kaki raptorialnya meluncur dalam waktu satu per dua puluh detik! Roda mangsa berputar mencapai tingkat keberhasilan sembilan puluh persen.",
      tips: "Ucapkan 'WHUSH!' dengan nada yang bertenaga dan beri jeda 3 detik sebelum meneruskan dengan intonasi naik.",
      requiredKeywords: ["jangkauan", "whush", "meluncur", "sembilan puluh persen", "suara berburu"],
      weight: "Storytelling & Onomatope"
    }
  ];

  const currentScenario = practiceScenarios.find(s => s.id === selectedRole) || practiceScenarios[0];

  const handleSimulateRecording = () => {
    setIsRecording(true);
    setEvaluationResult(null);

    // Simulate speech detection filling the inputs realistically
    setTimeout(() => {
      let speechResult = currentScenario.script;
      
      // Randomly introduce minor typos or edits to show an active grading capability
      const randomOutcome = Math.random();
      if (randomOutcome < 0.4) {
        // perfect
      } else if (randomOutcome < 0.7) {
        speechResult = speechResult.replace("Bukan sekadar menyerupai", "Ya dia mirip banget").replace("raptorial", "raptor");
      } else {
        speechResult = "Eee... Halo semuanya. Hari ini saya mau ngomongin belalang anggrek yang bisa menyamar di bunga. Kaki belalangnya itu punya duri yang tajam beneran dan cepet banget nyamber makanan. Makasih.";
      }

      setSpeechInput(speechResult);
      setIsRecording(false);
      evaluateSpeech(speechResult);
    }, 2500);
  };

  const evaluateSpeech = (text: string) => {
    const rawText = text.toLowerCase();
    const keywordsFound: string[] = [];
    const keywordsMissing: string[] = [];

    currentScenario.requiredKeywords.forEach(kw => {
      if (rawText.includes(kw.toLowerCase())) {
        keywordsFound.push(kw);
      } else {
        keywordsMissing.push(kw);
      }
    });

    const keywordPercentage = (keywordsFound.length / currentScenario.requiredKeywords.length) * 100;
    
    // Compute holistic scores
    let accuracyScore = Math.round(keywordPercentage);
    let timingScore = text === currentScenario.script ? 98 : Math.max(45, Math.round(100 - keywordsMissing.length * 15 - (text.length < 50 ? 30 : 0)));
    let stylingScore = text.includes("WHUSH") || text.includes("whush") || text.includes("...") || text.length > 80 ? 95 : 70;

    const finalGrade = Math.round((accuracyScore + timingScore + stylingScore) / 3);

    let feedbackMessage = "";
    if (finalGrade >= 85) {
      feedbackMessage = "Luar biasa! Kamu menguasai teknik presentasi ini dengan matang. Pengulangan kata kunci presisi, didukung struktur lisan pembangun antusiasme.";
    } else if (finalGrade >= 65) {
      feedbackMessage = "Cukup bagus! Kamu sudah menyampaikan sebagian besar esensi materi. Cobalah berikan tekanan kata (word stress) yang lebih ekspresif serta jangan terburu-buru.";
    } else {
      feedbackMessage = "Perlu latihan lagi! Banyak teknik penting (seperti hook dramatis atau data numerik spesifik) terlewatkan. Tetap semangat berlatih menggunakan skenario di atas!";
    }

    setEvaluationResult({
      score: finalGrade,
      accuracy: accuracyScore,
      timing: timingScore,
      style: stylingScore,
      keywordsFound,
      keywordsMissing,
      feedback: feedbackMessage
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!speechInput.trim()) return;
    evaluateSpeech(speechInput);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white min-h-[500px]">
      
      {/* Tab Header explanation */}
      <div className="mb-6 pb-4 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mic className="h-5 w-5 text-pink-400" />
          Rehearse kawalan Pro (Praktik Bicara)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Latih kemampuan berkomunikasimu! Pilih salah satu skenario presenter, lalu coba bacakan skripnya. Sistem akan menilai kecakapan komunikasimu, analisis kata kunci ilmiah, serta dramatisasi presentasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Seleksi Skenario (Cols 5) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pilih Peran Latihan</span>
          
          <div className="flex flex-col gap-2.5">
            {practiceScenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedRole(sc.id);
                  setSpeechInput("");
                  setEvaluationResult(null);
                }}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                  selectedRole === sc.id
                    ? "bg-slate-800 border-pink-400 shadow-md ring-1 ring-pink-500/10"
                    : "bg-slate-950/40 border-slate-800 hover:bg-slate-800/50"
                }`}
                id={`practice-role-${sc.id}`}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                  <span className="uppercase font-mono font-bold text-pink-300">{sc.weight}</span>
                  <span>Kelompok 3</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1.5">{sc.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  "{sc.script}"
                </p>
              </button>
            ))}
          </div>

          {/* Guidelines info card */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-300 space-y-2 mt-2">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              💡 Petunjuk Khusus Peran ini:
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {currentScenario.tips}
            </p>
          </div>
        </div>

        {/* Right Side: Rehearsal Area (Cols 7) */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4">
          
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px]">
              <span className="text-slate-400 uppercase font-bold block mb-0.5">Teks Panduan Skrip:</span>
              <p className="text-amber-100 font-serif leading-relaxed italic">
                "{currentScenario.script}"
              </p>
            </div>
          </div>

          {/* Form and Simulator Buttons */}
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hasil Latihanmu (Ketik atau Simulasikan Suara):</label>
              <textarea
                value={speechInput}
                onChange={(e) => setSpeechInput(e.target.value)}
                placeholder="Salin teks panduan atau coba simulasikan latihan rekaman suara untuk mengetes penilai..."
                className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-600"
                id="practice-text-input"
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleSimulateRecording}
                disabled={isRecording}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isRecording 
                    ? "bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse" 
                    : "bg-rose-600 text-white hover:bg-rose-500 shadow"
                }`}
                id="btn-simulate-rehearsal"
              >
                <Mic className={`h-4.5 w-4.5 ${isRecording ? "animate-bounce" : ""}`} />
                {isRecording ? "Sedang Merekam Latihan..." : "Simulasikan Rehearsal Suara"}
              </button>

              <button
                type="submit"
                disabled={!speechInput.trim() || isRecording}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-900 hover:bg-emerald-400 font-bold text-xs disabled:opacity-50 cursor-pointer"
                id="btn-submit-scoring"
              >
                Evaluasi Teks
              </button>
            </div>
          </form>

          {/* Practice Evaluation Result panel */}
          <AnimatePresence>
            {evaluationResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-slate-900 border border-slate-700/60 mt-2 space-y-3"
                id="rehearsal-feedback-panel"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-5 w-5 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Hasil Penilaian Pelatih</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Total Nilai</span>
                    <strong className={`text-xl font-mono font-black ${
                      evaluationResult.score >= 85 ? "text-emerald-400" :
                      evaluationResult.score >= 65 ? "text-amber-400" : "text-rose-400"
                    }`}>
                      {evaluationResult.score}/100
                    </strong>
                  </div>
                </div>

                {/* Score meters */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-[10px]">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Analisis Kata Kunci</span>
                    <strong className="text-white text-xs">{evaluationResult.accuracy}%</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Jeda & Tempo</span>
                    <strong className="text-white text-xs">{evaluationResult.timing}%</strong>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block mb-0.5">Gaya Bicara</span>
                    <strong className="text-white text-xs">{evaluationResult.style}%</strong>
                  </div>
                </div>

                {/* Feedback text */}
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 italic leading-relaxed">
                  "{evaluationResult.feedback}"
                </p>

                {/* Keywords indicator */}
                <div className="text-[10px] text-slate-400 space-y-1">
                  <p className="font-bold uppercase text-[9px] text-slate-500">Kandungan Istilah:</p>
                  <div className="flex flex-wrap gap-1">
                    {evaluationResult.keywordsFound.map((k: string) => (
                      <span key={k} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 text-[9px]">
                        ✓ {k}
                      </span>
                    ))}
                    {evaluationResult.keywordsMissing.map((k: string) => (
                      <span key={k} className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded-md border border-rose-500/20 text-[9px]">
                        ✗ {k}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
