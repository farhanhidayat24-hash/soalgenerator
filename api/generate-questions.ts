import { GoogleGenAI } from "@google/genai";

/**
 * Vercel serverless endpoint for the SD Pintar question generator.
 * Keep GEMINI_API_KEY in Vercel Environment Variables; never expose it to the browser.
 */
type AnyRecord = Record<string, any>;

const QUESTION_TYPES = [
  "pilihan_ganda",
  "pilihan_ganda_kompleks",
  "menjodohkan",
  "isian_singkat",
  "uraian",
  "soal_cerita",
] as const;

function jsonError(res: any, status: number, message: string) {
  return res.status(status).json({ success: false, warning: message });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return jsonError(res, 405, "Gunakan metode POST untuk membuat soal.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return jsonError(
      res,
      500,
      "GEMINI_API_KEY belum dikonfigurasi di Vercel. Buka Project Settings → Environment Variables, tambahkan GEMINI_API_KEY, lalu deploy ulang."
    );
  }

  try {
    const body: AnyRecord =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const grade = String(body.grade || "4");
    const subject = String(body.subject || "IPAS");
    const topic = String(body.topic || "Materi umum sesuai kurikulum");
    const curriculum = String(body.curriculum || "Kurikulum Merdeka");
    const semester = String(body.semester || "Ganjil");
    const academicYear = String(body.academicYear || "");
    const additionalNotes = String(body.additionalNotes || "");
    const difficulty = body.difficultyDistribution || {
      lotsPercent: 30,
      motsPercent: 50,
      hotsPercent: 20,
    };

    const requestedCounts: AnyRecord = body.counts || {
      pilihan_ganda: 5,
      pilihan_ganda_kompleks: 3,
      menjodohkan: 2,
      isian_singkat: 3,
      uraian: 2,
      soal_cerita: 2,
    };
    const counts: AnyRecord = {};
    for (const type of QUESTION_TYPES) {
      const value = Number(requestedCounts[type] || 0);
      if (!Number.isInteger(value) || value < 0 || value > 50) {
        return jsonError(res, 400, "Jumlah setiap jenis soal harus berupa bilangan bulat 0–50.");
      }
      counts[type] = value;
    }

    const totalRequested = QUESTION_TYPES.reduce((sum, type) => sum + counts[type], 0);
    if (totalRequested < 1) {
      return jsonError(res, 400, "Pilih minimal satu butir soal untuk dibuat.");
    }
    if (totalRequested > 100) {
      return jsonError(res, 400, "Maksimal 100 butir soal dalam satu permintaan.");
    }

    const prompt = `Anda adalah ahli asesmen pendidikan Sekolah Dasar Indonesia.
Buat tepat ${totalRequested} butir soal dalam bahasa Indonesia yang jelas, sesuai usia kelas ${grade} SD.
Kurikulum: ${curriculum}
Mata pelajaran: ${subject}
Materi: ${topic}
Semester: ${semester}; tahun ajaran: ${academicYear || "sesuai input guru"}.
Catatan guru: ${additionalNotes || "Gunakan konteks kehidupan sehari-hari Indonesia."}

Jumlah yang wajib dipenuhi:
- pilihan_ganda: ${counts.pilihan_ganda}
- pilihan_ganda_kompleks: ${counts.pilihan_ganda_kompleks}
- menjodohkan: ${counts.menjodohkan}
- isian_singkat: ${counts.isian_singkat}
- uraian: ${counts.uraian}
- soal_cerita: ${counts.soal_cerita}

Komposisi kesulitan target: LOTS ${Number(difficulty.lotsPercent ?? 30)}%, MOTS ${Number(difficulty.motsPercent ?? 50)}%, HOTS ${Number(difficulty.hotsPercent ?? 20)}%.
Buat butir yang benar-benar relevan dengan materi, bukan template generik. Pastikan kunci jawaban benar, opsi pilihan ganda hanya memiliki satu jawaban benar, dan hitungan matematika diperiksa.
Keluarkan JSON dengan bentuk { "questions": [...] } saja.
Setiap item wajib memiliki:
number (angka), type (salah satu jenis di atas), difficulty (LOTS/MOTS/HOTS),
competencyIndicator (string), stimulus (string, boleh kosong), questionText (string),
correctAnswer (string atau array string), explanation (string), scoreWeight (angka),
scoringRubric (string, boleh kosong), options (untuk pilihan_ganda berupa array objek id,label,text),
complexOptions (untuk pilihan_ganda_kompleks berupa array objek id,statement,isCorrect),
matchingPairs (untuk menjodohkan berupa array objek premiseId,premise,responseId,response).
Untuk jenis yang tidak memerlukan options/complexOptions/matchingPairs, boleh menghilangkan properti tersebut.
Gunakan hanya tipe soal yang diminta dan pastikan jumlah setiap jenis tepat sesuai daftar di atas.`;

    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      // Stable broadly available model; can be changed via GEMINI_MODEL in Vercel.
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const raw = result.text;
    if (!raw) {
      return jsonError(res, 502, "Gemini mengembalikan respons kosong. Silakan coba lagi.");
    }

    let parsed: AnyRecord;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return jsonError(res, 502, "Respons Gemini bukan JSON yang valid. Silakan coba lagi.");
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return jsonError(res, 502, "Respons Gemini tidak berisi daftar questions yang valid.");
    }

    const questions = parsed.questions.map((q: AnyRecord, index: number) => ({
      id: `q-${index + 1}-${Date.now()}`,
      number: Number(q.number) || index + 1,
      type: QUESTION_TYPES.includes(q.type) ? q.type : "isian_singkat",
      difficulty: ["LOTS", "MOTS", "HOTS"].includes(q.difficulty) ? q.difficulty : "MOTS",
      competencyIndicator: String(q.competencyIndicator || ""),
      stimulus: String(q.stimulus || ""),
      questionText: String(q.questionText || ""),
      options: Array.isArray(q.options) ? q.options : undefined,
      complexOptions: Array.isArray(q.complexOptions) ? q.complexOptions : undefined,
      matchingPairs: Array.isArray(q.matchingPairs) ? q.matchingPairs : undefined,
      correctAnswer: q.correctAnswer ?? "",
      explanation: String(q.explanation || ""),
      scoringRubric: String(q.scoringRubric || ""),
      scoreWeight: Number(q.scoreWeight) || 2,
    }));

    // Check the shape needed by the UI before returning success.
    if (questions.some((q: AnyRecord) => !q.questionText || !q.type)) {
      return jsonError(res, 502, "Ada butir soal dari Gemini yang tidak lengkap. Silakan generate ulang.");
    }

    return res.status(200).json({
      success: true,
      source: "gemini",
      questions,
      meta: { totalQuestions: questions.length, curriculum, subject, grade },
    });
  } catch (error: any) {
    console.error("[api/generate-questions] Gemini request failed:", error);
    const message = String(error?.message || "");
    if (/API key|api_key|unauthenticated|permission denied/i.test(message)) {
      return jsonError(res, 502, "Gemini menolak akses API. Periksa GEMINI_API_KEY dan akses API di Google AI Studio.");
    }
    if (/model|not found|404/i.test(message)) {
      return jsonError(res, 502, "Model atau endpoint Gemini tidak ditemukan. Periksa GEMINI_MODEL di Vercel.");
    }
    return jsonError(res, 502, "Gagal membuat soal melalui Gemini. Periksa log Functions di Vercel, lalu coba lagi.");
  }
}
