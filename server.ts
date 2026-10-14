import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { QuestionItem, QuestionType, DifficultyLevel } from './src/types/quiz.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Google GenAI SDK
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback generator for realistic Indonesian elementary school questions
function generateFallbackQuestions(
  grade: string,
  subject: string,
  topic: string,
  counts: Record<QuestionType, number>,
  difficultyDistribution: { lotsPercent: number; motsPercent: number; hotsPercent: number }
): QuestionItem[] {
  const questions: QuestionItem[] = [];
  let questionCounter = 1;

  const getDifficulty = (index: number): DifficultyLevel => {
    const total = 10;
    const lotsThreshold = Math.round((difficultyDistribution.lotsPercent / 100) * total);
    const motsThreshold = lotsThreshold + Math.round((difficultyDistribution.motsPercent / 100) * total);
    const mod = index % total;
    if (mod < lotsThreshold) return 'LOTS';
    if (mod < motsThreshold) return 'MOTS';
    return 'HOTS';
  };

  // 1. Pilihan Ganda
  const pgCount = counts.pilihan_ganda || 0;
  for (let i = 0; i < pgCount; i++) {
    const diff = getDifficulty(i);
    let stimulus = '';
    let questionText = '';
    let options = [
      { id: 'A', label: 'A', text: 'Pilihan Pertama' },
      { id: 'B', label: 'B', text: 'Pilihan Kedua' },
      { id: 'C', label: 'C', text: 'Pilihan Ketiga' },
      { id: 'D', label: 'D', text: 'Pilihan Keempat' },
    ];
    let correct = 'B';
    let explanation = '';

    if (subject.toLowerCase().includes('matematika')) {
      if (parseInt(grade) <= 2) {
        questionText = `Ibu membeli ${(i + 2) * 3} buah apel, kemudian Kakak memakan ${i + 2} buah apel. Sisa buah apel Ibu sekarang adalah ...`;
        const ans = (i + 2) * 3 - (i + 2);
        options = [
          { id: 'A', label: 'A', text: `${ans - 2} buah` },
          { id: 'B', label: 'B', text: `${ans} buah` },
          { id: 'C', label: 'C', text: `${ans + 3} buah` },
          { id: 'D', label: 'D', text: `${ans + 5} buah` },
        ];
        correct = 'B';
        explanation = `Langkah perhitungan: ${(i + 2) * 3} - ${i + 2} = ${ans} buah apel.`;
      } else {
        stimulus = `Sebuah taman berbentuk persegi panjang memiliki panjang ${(i + 4) * 5} meter dan lebar ${(i + 3) * 4} meter.`;
        questionText = `Berdasarkan keterangan di atas, keliling taman tersebut adalah ...`;
        const p = (i + 4) * 5;
        const l = (i + 3) * 4;
        const keliling = 2 * (p + l);
        options = [
          { id: 'A', label: 'A', text: `${keliling - 10} meter` },
          { id: 'B', label: 'B', text: `${keliling} meter` },
          { id: 'C', label: 'C', text: `${keliling + 12} meter` },
          { id: 'D', label: 'D', text: `${keliling * 2} meter` },
        ];
        correct = 'B';
        explanation = `Rumus Keliling Persegi Panjang = 2 x (Panjang + Lebar) = 2 x (${p} + ${l}) = 2 x ${p + l} = ${keliling} meter.`;
      }
    } else if (subject.toLowerCase().includes('ipas') || subject.toLowerCase().includes('ipa')) {
      stimulus = `Tumbuhan hijau memerlukan cahaya matahari, air, dan karbon dioksida untuk menghasilkan makanan sendiri.`;
      questionText = `Proses pembuatan makanan pada tumbuhan hijau dengan bantuan cahaya matahari dinamakan ...`;
      options = [
        { id: 'A', label: 'A', text: 'Respirasi' },
        { id: 'B', label: 'B', text: 'Fotosintesis' },
        { id: 'C', label: 'C', text: 'Transpirasi' },
        { id: 'D', label: 'D', text: 'Penyerbukan' },
      ];
      correct = 'B';
      explanation = `Fotosintesis adalah proses biokimia pembentukan zat makanan oleh tumbuhan hijau yang memanfaatkan energi cahaya matahari.`;
    } else {
      stimulus = `Indonesia dikenal sebagai negara kepulauan yang kaya akan keragaman suku bangsa, bahasa daerah, dan budaya.`;
      questionText = `Sikap yang tepat untuk menjaga persatuan dalam keberagaman di lingkungan sekolah kelas ${grade} adalah ...`;
      options = [
        { id: 'A', label: 'A', text: 'Hanya mau berteman dengan teman satu daerah' },
        { id: 'B', label: 'B', text: 'Menghargai perbedaan dan saling membantu sesama teman' },
        { id: 'C', label: 'C', text: 'Mengejek logat bicara teman yang berbeda' },
        { id: 'D', label: 'D', text: 'Menjauhi teman yang memiliki perbedaan adat' },
      ];
      correct = 'B';
      explanation = `Menghargai perbedaan dan saling tolong-menolong merupakan wujud pengamalan sila ketiga Pancasila: Persatuan Indonesia.`;
    }

    questions.push({
      id: `q-${questionCounter}`,
      number: questionCounter++,
      type: 'pilihan_ganda',
      difficulty: diff,
      competencyIndicator: `Memahami konsep esensial materi ${topic || subject} untuk Kelas ${grade} SD`,
      stimulus: stimulus || undefined,
      questionText,
      options,
      correctAnswer: correct,
      explanation,
      scoreWeight: 2,
    });
  }

  // 2. Pilihan Ganda Kompleks
  const pgkCount = counts.pilihan_ganda_kompleks || 0;
  for (let i = 0; i < pgkCount; i++) {
    const diff = getDifficulty(i + 2);
    questions.push({
      id: `q-${questionCounter}`,
      number: questionCounter++,
      type: 'pilihan_ganda_kompleks',
      difficulty: diff,
      competencyIndicator: `Menganalisis berbagai pernyataan benar mengenai materi ${topic || subject}`,
      stimulus: `Perhatikan beberapa pernyataan tentang materi ${topic || subject} pada jenjang Kelas ${grade} SD berikut ini:`,
      questionText: `Berilah tanda centang (✓) pada setiap pernyataan yang BENAR (jawaban dapat lebih dari satu):`,
      complexOptions: [
        { id: 'opt-1', statement: `Karakteristik utama dari konsep ${topic || subject} mencerminkan keteraturan ilmiah.`, isCorrect: true },
        { id: 'opt-2', statement: `Penerapan nilai positif dapat dimulai dari hal kecil di lingkungan rumah dan sekolah.`, isCorrect: true },
        { id: 'opt-3', statement: `Pernyataan ini sengaja dibuat keliru untuk menguji ketelitian siswa.`, isCorrect: false },
        { id: 'opt-4', statement: `Eksplorasi dan latihan secara konsisten meningkatkan penguasaan materi secara menyeluruh.`, isCorrect: true },
      ],
      correctAnswer: ['opt-1', 'opt-2', 'opt-4'],
      explanation: `Pernyataan 1, 2, dan 4 benar sesuai konsep dasar, sedangkan pernyataan 3 tidak tepat.`,
      scoringRubric: `Skor penuh (3 poin) jika mencentang semua pernyataan benar dan tidak mencentang yang salah.`,
      scoreWeight: 3,
    });
  }

  // 3. Menjodohkan
  const matchCount = counts.menjodohkan || 0;
  for (let i = 0; i < matchCount; i++) {
    const diff = getDifficulty(i + 4);
    questions.push({
      id: `q-${questionCounter}`,
      number: questionCounter++,
      type: 'menjodohkan',
      difficulty: diff,
      competencyIndicator: `Menghubungkan istilah/peristiwa dengan konsep pasangan yang tepat pada materi ${topic || subject}`,
      stimulus: `Pasangkanlah setiap konsep pada Kolom Kiri dengan jawaban/penjelasan yang sesuai pada Kolom Kanan:`,
      questionText: `Hubungkanlah premis di sebelah kiri dengan pasangan yang paling tepat di sebelah kanan!`,
      matchingPairs: [
        { premiseId: 'p1', premise: 'Simbol Sila Ke-1 Pancasila', responseId: 'r1', response: 'Bintang Tunggal' },
        { premiseId: 'p2', premise: 'Simbol Sila Ke-2 Pancasila', responseId: 'r2', response: 'Rantai Emas' },
        { premiseId: 'p3', premise: 'Simbol Sila Ke-3 Pancasila', responseId: 'r3', response: 'Pohon Beringin' },
        { premiseId: 'p4', premise: 'Simbol Sila Ke-4 Pancasila', responseId: 'r4', response: 'Kepala Banteng' },
      ],
      correctAnswer: 'p1-r1, p2-r2, p3-r3, p4-r4',
      explanation: `Pasangan lambang sila Pancasila: 1=Bintang, 2=Rantai, 3=Pohon Beringin, 4=Kepala Banteng.`,
      scoringRubric: `Setiap pasangan yang benar bernilai 1 poin (Maksimal 4 poin).`,
      scoreWeight: 4,
    });
  }

  // 4. Isian Singkat
  const isianCount = counts.isian_singkat || 0;
  for (let i = 0; i < isianCount; i++) {
    const diff = getDifficulty(i + 1);
    questions.push({
      id: `q-${questionCounter}`,
      number: questionCounter++,
      type: 'isian_singkat',
      difficulty: diff,
      competencyIndicator: `Menyebutkan istilah atau nilai pasti dalam materi ${topic || subject}`,
      questionText: `Zat hijau pada daun yang berperan penting dalam proses fotosintesis dinamakan ...`,
      correctAnswer: 'Klorofil',
      explanation: `Klorofil adalah pigmen warna hijau pada tumbuhan yang berfungsi menyerap energi dari sinar matahari.`,
      scoringRubric: `Benar mendapatkan 2 poin, salah/kosong 0 poin.`,
      scoreWeight: 2,
    });
  }

  // 5. Uraian
  const uraianCount = counts.uraian || 0;
  for (let i = 0; i < uraianCount; i++) {
    const diff = 'HOTS';
    questions.push({
      id: `q-${questionCounter}`,
      number: questionCounter++,
      type: 'uraian',
      difficulty: diff,
      competencyIndicator: `Menguraikan argumen dan solusi pemecahan masalah berdasarkan materi ${topic || subject}`,
      stimulus: `Di sebuah desa, warga sering mengalami kesulitan air bersih saat musim kemarau karena daerah resapan air berkurang drastis akibat penebangan pohon tanpa reboisasi.`,
      questionText: `Jelaskan 3 (tiga) upaya nyata yang dapat dilakukan oleh masyarakat dan siswa sekolah untuk menjaga kelestarian siklus air tanah di lingkungan sekitar!`,
      correctAnswer: '1. Melakukan penghijauan (reboisasi) dengan menanam bibit pohon. 2. Membuat lubang biopori atau sumur resapan air hujan. 3. Menghemat penggunaan air bersih sehari-hari dan tidak membuang sampah ke saluran air.',
      explanation: `Jawaban harus memuat sedikitnya 3 langkah komprehensif: reboisasi/penanaman vegetasi, biopori/resapan, serta perilaku hemat air dan menjaga kebersihan sungai/saluran.`,
      scoringRubric: `Pedoman penskoran: 3 poin jika menyebutkan 3 upaya logis dan terperinci, 2 poin jika menyebutkan 2 upaya, 1 poin jika 1 upaya, 0 jika tidak relevan.`,
      scoreWeight: 5,
    });
  }

  // 6. Soal Cerita
  const ceritaCount = counts.soal_cerita || 0;
  for (let i = 0; i < ceritaCount; i++) {
    const diff = 'HOTS';
    questions.push({
      id: `q-${questionCounter}`,
      number: questionCounter++,
      type: 'soal_cerita',
      difficulty: diff,
      competencyIndicator: `Menyelesaikan masalah kontekstual kehidupan sehari-hari (Soal Cerita Bernalar Kritis)`,
      stimulus: `Keluarga Pak Budi memiliki perkebunan jeruk di lereng bukit. Setiap hari Sabtu, Pak Budi bersama kedua anaknya memanen buah jeruk. Pada hari pertama terkumpul 4 keranjang jeruk, masing-masing keranjang berisi 35 buah jeruk. Pada hari kedua, mereka memanen 6 keranjang yang masing-masing berisi 40 buah jeruk. Sebanyak 150 buah jeruk kemudian dijual ke pasar tradisional, dan sisanya dibagikan sama rata kepada 10 tetangga dekat.`,
      questionText: `Hitunglah secara berurutan:\na. Berapa total seluruh buah jeruk yang berhasil dipanen selama dua hari tersebut?\nb. Berapa sisa buah jeruk setelah dijual ke pasar?\nc. Berapa buah jeruk yang diterima oleh masing-masing tetangga Pak Budi? Sertakan langkah pengerjaannya!`,
      correctAnswer: `a. Total panen = (4 x 35) + (6 x 40) = 140 + 240 = 380 buah jeruk.\nb. Sisa setelah dijual = 380 - 150 = 230 buah jeruk.\nc. Tiap tetangga menerima = 230 : 10 = 23 buah jeruk.`,
      explanation: `Langkah sistematis:\n1. Panen hari 1 = 4 x 35 = 140 buah.\n2. Panen hari 2 = 6 x 40 = 240 buah.\n3. Total panen = 140 + 240 = 380 buah.\n4. Sisa setelah jual 150 = 380 - 150 = 230 buah.\n5. Pembagian ke 10 tetangga = 230 / 10 = 23 buah per tetangga.`,
      scoringRubric: `Skor maksimal 6 poin: Masing-masing sub-pertanyaan a (2 poin), b (2 poin), c (2 poin) dengan langkah pengerjaan yang benar.`,
      scoreWeight: 6,
    });
  }

  return questions;
}

// Endpoint POST /api/generate-questions
app.post('/api/generate-questions', async (req, res) => {
  const {
    grade,
    subject,
    topic,
    curriculum = 'Kurikulum Merdeka',
    schoolName = 'SD Negeri Nusantara',
    district = 'Dinas Pendidikan',
    assessmentName = 'SUMATIF AKHIR SEMESTER (SAS)',
    academicYear = '2024/2025',
    semester = 'Ganjil',
    durationMinutes = 90,
    difficultyDistribution = { lotsPercent: 30, motsPercent: 50, hotsPercent: 20 },
    counts = {
      pilihan_ganda: 5,
      pilihan_ganda_kompleks: 3,
      menjodohkan: 2,
      isian_singkat: 3,
      uraian: 2,
      soal_cerita: 2,
    },
    additionalNotes = '',
  } = req.body;

  const totalRequested = 
    (counts.pilihan_ganda || 0) +
    (counts.pilihan_ganda_kompleks || 0) +
    (counts.menjodohkan || 0) +
    (counts.isian_singkat || 0) +
    (counts.uraian || 0) +
    (counts.soal_cerita || 0);

  const ai = getGeminiClient();

  if (!ai) {
    console.log('[API] GEMINI_API_KEY is not configured or in default placeholder. Using high-fidelity fallback generator.');
    const generatedQuestions = generateFallbackQuestions(
      grade,
      subject,
      topic,
      counts,
      difficultyDistribution
    );

    return res.json({
      success: true,
      source: 'fallback',
      questions: generatedQuestions,
      meta: {
        totalQuestions: generatedQuestions.length,
        curriculum,
        subject,
        grade,
      },
    });
  }

  try {
    const prompt = `Anda adalah seorang ahli penyusun instrumen evaluasi pendidikan Sekolah Dasar (SD) bertaraf nasional untuk ${curriculum} Indonesia.
Buatkan paket naskah soal lengkap berkualitas tinggi untuk:
- Jenjang: Kelas ${grade} SD (Usia sekitar ${parseInt(grade) + 6} tahun. Bahasa dan konteks WAJIB disesuaikan dengan psikologi dan pemahaman kognitif siswa Kelas ${grade} SD).
- Mata Pelajaran: ${subject}
- Materi / Capaian Pembelajaran: ${topic || 'Komprehensif Semester ' + semester}
- Semester: ${semester} (Tahun Ajaran ${academicYear})
- Catatan Khusus Guru: ${additionalNotes || 'Buat soal bervariasi, kontekstual kearifan lokal, dan mendidik.'}

Rincian Jumlah & Jenis Soal yang WAJIB dibuat:
1. Pilihan Ganda (Single Choice 4 pilihan A, B, C, D): ${counts.pilihan_ganda || 0} butir
2. Pilihan Ganda Kompleks (Centang pernyataan benar, atau benar/salah lebih dari satu): ${counts.pilihan_ganda_kompleks || 0} butir
3. Menjodohkan (Premis Kolom Kiri dan Respon Kolom Kanan): ${counts.menjodohkan || 0} butir
4. Isian Singkat (Jawaban kata/angka pendek pasti): ${counts.isian_singkat || 0} butir
5. Uraian (Analisis mendalam dengan rubrik penskoran): ${counts.uraian || 0} butir
6. Soal Cerita (Pemecahan masalah berbasis narasi kontekstual kehidupan nyata): ${counts.soal_cerita || 0} butir

Komposisi Tingkat Kesulitan:
- LOTS (Mengingat/Memahami C1-C2): sekitar ${difficultyDistribution.lotsPercent}%
- MOTS (Aplikasi/Penerapan C3): sekitar ${difficultyDistribution.motsPercent}%
- HOTS (Analisis/Evaluasi/Kreasi C4-C6): sekitar ${difficultyDistribution.hotsPercent}%

Instruksi Penting:
1. Setiap soal wajib menyertakan:
   - "number": urutan nomor soal (1, 2, 3, ...)
   - "type": salah satu dari 'pilihan_ganda', 'pilihan_ganda_kompleks', 'menjodohkan', 'isian_singkat', 'uraian', 'soal_cerita'
   - "difficulty": 'LOTS', 'MOTS', atau 'HOTS'
   - "competencyIndicator": Indikator Capaian Pembelajaran singkat
   - "stimulus": Teks cerita pendek / tabel deskripsi / narasi sebelum pertanyaan (sangat penting untuk HOTS dan soal cerita)
   - "questionText": Kalimat pertanyaan yang jelas dan santun
   - "correctAnswer": Kunci jawaban yang tepat
   - "explanation": Penjelasan / pembahasan lengkap langkah demi langkah
   - "scoreWeight": Bobot nilai angka (misal PG: 1-2, Uraian: 4-5)
   - "scoringRubric": Pedoman penilaian (khusus uraian & soal cerita)
2. Untuk 'pilihan_ganda': Berikan array "options" dengan 4 pilihan (label A, B, C, D).
3. Untuk 'pilihan_ganda_kompleks': Berikan array "complexOptions" berisi 4 pernyataan dengan properti statement dan isCorrect (boolean).
4. Untuk 'menjodohkan': Berikan array "matchingPairs" berisi 4 pasang premise dan response yang relevan.
5. Gunakan bahasa Indonesia baku, ejaan EYD V, kalimat komunikatif anak SD, dan tidak ambigu.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  type: {
                    type: Type.STRING,
                    description: 'pilihan_ganda, pilihan_ganda_kompleks, menjodohkan, isian_singkat, uraian, atau soal_cerita',
                  },
                  difficulty: { type: Type.STRING, description: 'LOTS, MOTS, atau HOTS' },
                  competencyIndicator: { type: Type.STRING },
                  stimulus: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        text: { type: Type.STRING },
                      },
                    },
                  },
                  complexOptions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        statement: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN },
                      },
                    },
                  },
                  matchingPairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        premiseId: { type: Type.STRING },
                        premise: { type: Type.STRING },
                        responseId: { type: Type.STRING },
                        response: { type: Type.STRING },
                      },
                    },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  scoringRubric: { type: Type.STRING },
                  scoreWeight: { type: Type.INTEGER },
                },
                required: ['number', 'type', 'difficulty', 'questionText', 'correctAnswer', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Format respon Gemini tidak memuat array questions yang valid');
    }

    // Standardize IDs
    const normalizedQuestions: QuestionItem[] = parsed.questions.map((q: any, idx: number) => ({
      id: `q-${idx + 1}-${Date.now()}`,
      number: q.number || idx + 1,
      type: q.type as QuestionType,
      difficulty: (q.difficulty || 'MOTS') as DifficultyLevel,
      competencyIndicator: q.competencyIndicator,
      stimulus: q.stimulus,
      questionText: q.questionText,
      options: q.options,
      complexOptions: q.complexOptions,
      matchingPairs: q.matchingPairs,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      scoringRubric: q.scoringRubric,
      scoreWeight: q.scoreWeight || 2,
    }));

    return res.json({
      success: true,
      source: 'gemini',
      questions: normalizedQuestions,
      meta: {
        totalQuestions: normalizedQuestions.length,
        curriculum,
        subject,
        grade,
      },
    });
  } catch (error: any) {
    console.error('[API Error in generateContent]:', error);
    // Graceful fallback to guaranteed questions
    const fallbackQuestions = generateFallbackQuestions(
      grade,
      subject,
      topic,
      counts,
      difficultyDistribution
    );

    return res.json({
      success: true,
      source: 'fallback_error',
      questions: fallbackQuestions,
      warning: `Gemini API mengalami kendala (${error.message}). Telah digunakan mesin penyusun cadangan standar kurikulum.`,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
  });
});

// Serve frontend in dev using Vite middlewares, or static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Generator Soal SD Pintar running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
