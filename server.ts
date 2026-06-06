import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a dummy client or a clean error handler so that we do not crash if key is missing.
      // We will check for the key dynamically inside the endpoint and throw a descriptive message.
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Check key availability
app.get("/api/config-status", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Interactive Q&A API using Gemini
app.post("/api/ask", async (req, res) => {
  try {
    const { question, presenterId, history } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Pertanyaan wajib diisi." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "GEMINI_API_KEY belum dikonfigurasi. Silakan tambahkan kunci di Settings > Secrets.",
      });
    }

    const ai = getAI();

    // Context & Skenario Presentation Belalang Anggrek Kelompok 3 Kelas X-A
    const teamContext = `
Kamu adalah salah satu presenter dari Kelompok 3 Kelas X-A yang melakukan observasi tentang Belalang Anggrek (Hymenopus coronatus). 
Nama anggota kelompok dan fokus materi mereka:
1. ANDI (Presenter Pembuka & Pernyataan Umum): Menjelaskan definisi umum, klasifikasi ilmiah, dan pembukaan. Gaya bahasanya sopan, antusias, dan ramah.
2. SINTA (Deskripsi Ciri Fisik): Menjelaskan warna tubuh (merah muda, putih, kuning), bentuk tubuh menyerupai kelopak bunga, mata majemuk peka, kaki raptorial tajam (gerak 1/20 detik). Gaya bahasanya bersemangat, mengalir, sesekali santai bertanya ("Cepat banget, kan?").
3. RINA (Deskripsi Perilaku & Habitat): Menjelaskan cara berburu (accordion, diam sesempurna bunga, meluncur 1/20 detik), jenis mangsa (kupu-kupu, lalat, katak kecil dengan tingkat keberhasilan 90%), habitat hutan tropis Asia Tenggara termasuk Indonesia pada 0-500 mdpl, serta isu ancaman deforestasi. Gaya bahasanya seperti mendongeng (storytelling), dramatis, dan menyentuh sisi emosional pelestarian.
4. BUDI (Presenter Penutup & Moderator): Merangkum presentasi, menjelaskan kesimpulan, memberikan refleksi manusiawi, dan memandu sesi tanya jawab dengan tertib, bijak, dan sopan.

SASARAN & FORMULA Q&A (A-C-T):
Setiap kali menjawab pertanyaan audiens, terapkan formula A-C-T secara ketat:
- A (Apresiasi): Mulai dengan mengapresiasi pertanyaan dengan ramah dan tulus (contoh: "Wah, pertanyaan yang bagus!", "Terima kasih, itu poin menarik.").
- C (Clarification/Data): Berikan klarifikasi atau data yang konkret berdasarkan hasil observasi belalang anggrek. Jika pertanyaan di luar fokus observasi, akui dengan jujur namun beri penjelasan berdasar referensi yang diketahui (Kejujuran atas keterbatasan).
- T (Tanggapan/Rekomendasi): Berikan tanggapan akhir, perbandingan sederhana, atau rekomendasi konkret untuk menyimpulkan jawaban.

Jika audiens bertanya kepada presenter tertentu (misal 'Sinta'), jawablah dalam karakter presenter tersebut. Jika ditanyakan ke 'Semua/Panel', pilih salah satu presenter (atau Budi sebagai moderator yang menjawab / mengarahkan ke presenter yang sesuai).

Berikan respons dalam format JSON yang valid dengan skema berikut:
{
  "responderName": "Nama Presenter yang menjawab (ANDI / SINTA / RINA / BUDI)",
  "text": "Jawaban lengkap dalam bahasa Indonesia yang ramah, sopan, mengalir langsung, dan menggunakan formula ACT.",
  "techniques": "Penjelasan singkat teknik presentasi apa saja yang diterapkan di jawaban ini (misalnya: Formula ACT, Kejujuran batas riset, Apresiasi pertanyaan, dll.)",
  "recommendedTeammate": "Jika relevan, nama rekan tim lain yang dapat menambahkan detail, jika tidak kosongkan."
}
    `;

    const presenterPrompt = presenterId && presenterId !== "all" 
      ? `Pengguna menanyakan pertanyaan ini secara khusus kepada: ${presenterId.toUpperCase()}. Tolong jawab sebagai karakter ${presenterId.toUpperCase()} tersebut.`
      : `Pengguna menanyakan pertanyaan ini kepada PANEL KELOMPOK. Pilih karakter yang paling sesuai untuk menjawab (atau BUDI sebagai moderator yang menyerahkan/membagi peran) lalu formulasikan jawabannya.`;

    const chatHistoryPrompt = history && history.length > 0
      ? `Berikut riwayat tanya jawab sebelumnya:\n${JSON.stringify(history)}\n`
      : "";

    const userInstructions = `
Pertanyaan pengguna: "${question}"
${presenterPrompt}
${chatHistoryPrompt}
Pastikan jawabanmu murni berformat JSON dan tidak dibungkus dengan markdown atau tag lain.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: teamContext },
        { text: userInstructions },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responderName: { type: Type.STRING },
            text: { type: Type.STRING },
            techniques: { type: Type.STRING },
            recommendedTeammate: { type: Type.STRING },
          },
          required: ["responderName", "text", "techniques"],
        },
      },
    });

    const reply = response.text;
    res.json(JSON.parse(reply || "{}"));
  } catch (error: any) {
    console.error("Gemini Q&A Error:", error);
    res.status(500).json({ error: error.message || "Terjadi kesalahan pada server." });
  }
});

async function startServer() {
  // Vite middleware development / production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
