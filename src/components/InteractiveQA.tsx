import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  MessageSquare, 
  Sparkles, 
  User, 
  HelpCircle, 
  CheckCircle,
  Loader2,
  Info,
  ShieldCheck,
  Award
} from "lucide-react";
import { ChatMessage, PresenterId } from "../types";
import { staticQAItems } from "../data";

export default function InteractiveQA() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPresenter, setSelectedPresenter] = useState<string>("all");
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Check backend server setup dynamically on load
  useEffect(() => {
    fetch("/api/config-status")
      .then((res) => {
        if (!res.ok) throw new Error("Offline");
        return res.json();
      })
      .then((data) => setHasApiKey(data.hasApiKey))
      .catch(() => setHasApiKey(false));

    // Seed initial system introduction message
    setMessages([
      {
        id: "sys-init",
        sender: "bot",
        responderName: "BUDI",
        text: "Halo teman-teman! Saya Budi, moderator Kelompok 3. Selamat datang di Sesi Tanya Jawab (Q&A) Interaktif. Silakan ketuk salah satu pertanyaan siap-saji di bawah, atau ajukan pertanyaan bebas kreasi kalian sendiri menggunakan kotak teks!",
        techniques: "Formula ACT (Apresiasi pembuka & kesantunan moderator)."
      }
    ]);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle preset questions directly for high-fidelity offline execution
  const handleStaticQA = (questionText: string) => {
    const qItem = staticQAItems.find((q) => q.question === questionText);
    if (!qItem) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: questionText,
    };

    setIsLoading(true);

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        responderName: qItem.responder.toUpperCase(),
        text: qItem.response,
        techniques: qItem.techniques,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);
    }, 1000); // realistic think delay
  };

  // Submit custom unscripted question to server-side Gemini
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isLoading) return;

    const qText = customQuestion;
    setCustomQuestion("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: qText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build simplified history array for Gemini context context tracking
      const historyPayload = messages
        .filter(m => m.id !== "sys-init")
        .slice(-6)
        .map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }));

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: qText,
          presenterId: selectedPresenter,
          history: historyPayload
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghubungi Gemini server.");
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        responderName: data.responderName,
        text: data.text,
        techniques: data.techniques,
        recommendedTeammate: data.recommendedTeammate
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      
      // Error fallback with dynamic local simulation if API isn't fully ready
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "bot",
        responderName: "BUDI",
        text: `Maaf, saya selaku moderator mendeteksi kendala koneksi atau API Key. Namun, secara umum belalang anggrek memiliki pertahanan alami luar biasa dan riset kami akan terus berkembang. (Error: ${err.message})`,
        techniques: "Prinsip Tanggap Masalah & Kejujuran atas keterbatasan server."
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPresenterBadgeStyle = (name?: string) => {
    switch (name?.toUpperCase()) {
      case "ANDI":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "SINTA":
        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "RINA":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "BUDI":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-white min-h-[500px]">
      
      {/* 1st Column: Preset Questions panel */}
      <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-pink-400" />
            Pertanyaan Kunci Skenario
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pilih pertanyaan siap-saji dari Tabel 17 untuk mendengarkan & melihat bagaimana masing-masing presenter menjawab menggunakan skenario aslinya.
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
          {staticQAItems.map((q) => (
            <button
              key={q.id}
              onClick={() => handleStaticQA(q.question)}
              disabled={isLoading}
              className="text-left p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800 hover:border-slate-700 transition duration-300 text-xs text-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              id={`preset-${q.id}`}
            >
              <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-pink-500/30 to-emerald-500/10 pointer-events-none" />
              <div className="flex justify-between items-center text-[10px] text-pink-300 font-bold mb-1 uppercase tracking-wide">
                <span>{q.category}</span>
                <span className="text-[9px] text-slate-500 uppercase">Jawab: {q.responder.toUpperCase()}</span>
              </div>
              <p className="font-medium group-hover:text-white leading-normal">
                "{q.question}"
              </p>
            </button>
          ))}
        </div>

        {/* Education note about ACT formula */}
        <div className="p-3.5 rounded-xl bg-pink-500/5 border border-pink-500/10 text-[11px] text-pink-300/90 leading-relaxed">
          💡 <strong>Teknik Kelompok:</strong> Kelompok 3 menjawab menggunakan formula <strong>A-C-T</strong> (Apresiasi, Clarification/Data, Tanggapan). Hal ini menjamin kesantunan, akurasi ilmiah, dan resolusi masalah.
        </div>
      </div>

      {/* 2nd & 3rd Column: Live Conversation sandbox */}
      <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between h-[560px]">
        
        {/* Top bar header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Simulasi Diskusi Interaktif</h3>
          </div>

          <div className="flex items-center gap-2">
            {hasApiKey === false ? (
              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                ⚠️ Tanpa API Key (Mode Demo)
              </span>
            ) : hasApiKey === true ? (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                ✅ Gemini AI Aktif
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Mengecek Sistem...
              </span>
            )}
          </div>
        </div>

        {/* Real-time Message stream */}
        <div className="flex-1 overflow-y-auto my-3 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col gap-4 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${
                m.sender === "user" ? "self-end items-end" : "self-start items-start"
              }`}
            >
              {/* Presenter Name tag */}
              {m.sender === "bot" && (
                <span className={`text-[9px] font-bold px-2 py-0.5 mb-1 rounded border uppercase tracking-wider ${getPresenterBadgeStyle(m.responderName)}`}>
                  {m.responderName || "MODERATOR"}
                </span>
              )}

              {/* Speech balloon */}
              <div
                className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-gradient-to-tr from-pink-600 to-rose-600 text-white rounded-br-none"
                    : "bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none"
                }`}
              >
                {m.text}

                {/* Inside-bubble applied techniques */}
                {m.sender === "bot" && m.techniques && (
                  <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/10 p-2 rounded-lg flex flex-col gap-0.5">
                    <span className="font-bold flex items-center gap-1 select-none">
                      <Award className="h-3 w-3 inline" /> Analisis Teknik Presentasi:
                    </span>
                    <span>{m.techniques}</span>
                  </div>
                )}

                {/* Handover notification if any */}
                {m.sender === "bot" && m.recommendedTeammate && (
                  <div className="mt-1 text-[10px] text-sky-300 font-mono italic">
                    Delegasi rujukan: Ditopang oleh masukan {m.recommendedTeammate}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Sinking Loader */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 self-start p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <Loader2 className="h-4 w-4 animate-spin text-pink-400" />
              <span className="text-xs italic font-serif">Anggota kelompok sedang berdiskusi...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom bar form for unscripted queries */}
        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          
          {/* Ask Target Selector */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800/65">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tanyakan Ke:</span>
            <div className="flex gap-1.5 overflow-x-auto text-[9px] font-bold">
              {[
                { id: "all", label: "Group Panel" },
                { id: "andi", label: "Andi (Umum)" },
                { id: "sinta", label: "Sinta (Fisik)" },
                { id: "rina", label: "Rina (Perilaku)" },
                { id: "budi", label: "Budi (Kesimpulan)" }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPresenter(p.id)}
                  className={`px-2.5 py-1 rounded-full cursor-pointer border transition ${
                    selectedPresenter === p.id
                      ? "bg-pink-500 text-white border-pink-400 shadow-sm"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ketik pertanyaan bebas tentang belalang anggrek..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500/50 focus:border-pink-500 transition disabled:opacity-50"
              id="input-custom-question"
            />
            <button
              type="submit"
              disabled={!customQuestion.trim() || isLoading}
              className="bg-emerald-500 text-slate-900 hover:bg-emerald-400 p-2 rounded-xl flex items-center justify-center cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold"
              id="btn-custom-submit"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
