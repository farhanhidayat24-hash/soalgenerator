import { ExamPaper } from '../types/quiz';

const DB_KEY = 'bank_soal_sd_database_v1';

// Sample pre-seeded exam papers
const INITIAL_SAMPLE_EXAMS: ExamPaper[] = [
  {
    id: 'sample-ipas-kls4',
    title: 'Sumatif Akhir Semester IPAS Kelas 4: Tumbuhan dan Ekosistem',
    grade: '4',
    subject: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    topic: 'Fotosintesis, Bagian Tumbuhan, dan Rantai Makanan',
    curriculum: 'Kurikulum Merdeka',
    schoolHeader: {
      schoolName: 'SD NEGERI NUSANTARA MERDEKA 01',
      district: 'DINAS PENDIDIKAN KOTA SEMARANG',
      assessmentName: 'SUMATIF AKHIR SEMESTER (SAS) GANJIL',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      durationMinutes: 90,
      generalInstructions: [
        'Berdoalah sebelum mengerjakan soal.',
        'Tuliskan nama, nomor absen, dan kelas pada lembar jawaban yang telah disediakan.',
        'Bacalah setiap soal dengan teliti dan cermat sebelum menjawab.',
        'Periksa kembali seluruh jawaban sebelum diserahkan kepada Bapak/Ibu Guru.',
      ],
    },
    questions: [
      {
        id: 'sample-q1',
        number: 1,
        type: 'pilihan_ganda',
        difficulty: 'LOTS',
        competencyIndicator: 'Mengidentifikasi fungsi bagian tumbuhan',
        stimulus: 'Pada sebuah tanaman mawar, terdapat bagian yang berfungsi menyerap air dan zat hara dari dalam tanah serta memperkokoh berdirinya tanaman.',
        questionText: 'Bagian tumbuhan yang dimaksud pada teks di atas adalah ...',
        options: [
          { id: 'A', label: 'A', text: 'Daun' },
          { id: 'B', label: 'B', text: 'Akar' },
          { id: 'C', label: 'C', text: 'Bunga' },
          { id: 'D', label: 'D', text: 'Batang' },
        ],
        correctAnswer: 'B',
        explanation: 'Akar berfungsi untuk menyerap air dan mineral/unsur hara dari tanah serta menopang berdirinya tumbuhan.',
        scoreWeight: 2,
      },
      {
        id: 'sample-q2',
        number: 2,
        type: 'pilihan_ganda_kompleks',
        difficulty: 'MOTS',
        competencyIndicator: 'Menganalisis faktor yang diperlukan dalam proses fotosintesis',
        stimulus: 'Siswa kelas 4 sedang mengamati daun sirih yang diletakkan di bawah sinar matahari pagi.',
        questionText: 'Berilah tanda centang (✓) pada semua kebutuhan utama tumbuhan hijau untuk dapat melakukan fotosintesis:',
        complexOptions: [
          { id: 'c1', statement: 'Cahaya matahari sebagai sumber energi', isCorrect: true },
          { id: 'c2', statement: 'Klorofil (zat hijau daun) untuk menyerap cahaya', isCorrect: true },
          { id: 'c3', statement: 'Oksigen sebagai bahan baku utama', isCorrect: false },
          { id: 'c4', statement: 'Air dan Karbon Dioksida dari lingkungan sekitar', isCorrect: true },
        ],
        correctAnswer: ['c1', 'c2', 'c4'],
        explanation: 'Bahan baku fotosintesis adalah air (H2O) dan karbon dioksida (CO2) dengan bantuan klorofil dan cahaya matahari, menghasilkan glukosa dan oksigen.',
        scoringRubric: 'Skor 3 poin jika memilih tepat c1, c2, dan c4.',
        scoreWeight: 3,
      },
      {
        id: 'sample-q3',
        number: 3,
        type: 'menjodohkan',
        difficulty: 'MOTS',
        competencyIndicator: 'Menghubungkan peran makhluk hidup dalam rantai makanan',
        stimulus: 'Dalam ekosistem sawah di pedesaan terdapat berbagai jenis makhluk hidup yang saling berinteraksi.',
        questionText: 'Pasangkanlah peran ekosistem pada Kolom Kiri dengan contoh makhluk hidup yang sesuai pada Kolom Kanan!',
        matchingPairs: [
          { premiseId: 'p1', premise: 'Produsen (Menghasilkan makanan sendiri)', responseId: 'r1', response: 'Padi di Sawah' },
          { premiseId: 'p2', premise: 'Konsumen Tingkat I (Herbivora)', responseId: 'r2', response: 'Belalang' },
          { premiseId: 'p3', premise: 'Konsumen Tingkat II (Karnivora kecil)', responseId: 'r3', response: 'Katak Sawah' },
          { premiseId: 'p4', premise: 'Dekomposer (Pengurai zat organik)', responseId: 'r4', response: 'Bakteri dan Jamur' },
        ],
        correctAnswer: 'p1-r1, p2-r2, p3-r3, p4-r4',
        explanation: 'Padi adalah produsen autotrof, belalang memakan padi, katak memangsa belalang, dan bakteri/jamur bertindak sebagai pengurai bangkai.',
        scoringRubric: '1 poin untuk setiap pasangan yang dihubungkan dengan benar.',
        scoreWeight: 4,
      },
      {
        id: 'sample-q4',
        number: 4,
        type: 'isian_singkat',
        difficulty: 'LOTS',
        competencyIndicator: 'Menyebutkan hasil samping fotosintesis yang bermanfaat bagi manusia',
        questionText: 'Gas yang dihasilkan oleh tumbuhan saat fotosintesis dan sangat dibutuhkan manusia untuk bernapas adalah gas ...',
        correctAnswer: 'Oksigen',
        explanation: 'Proses fotosintesis melepaskan gas oksigen (O2) ke atmosfer yang digunakan makhluk hidup untuk respirasi.',
        scoreWeight: 2,
      },
      {
        id: 'sample-q5',
        number: 5,
        type: 'uraian',
        difficulty: 'HOTS',
        competencyIndicator: 'Menganalisis dampak kepunahan suatu populasi dalam jaring-jaring makanan',
        stimulus: 'Di sebuah desa lumbung padi, para petani memburu ular sawah secara berlebihan karena merasa takut. Akibatnya, populasi ular di sawah tersebut menjadi hampir punah dalam waktu 6 bulan.',
        questionText: 'Berdasarkan fenomena rantai makanan di atas, analisis dan jelaskan:\na. Apa yang akan terjadi pada populasi tikus sawah?\nb. Apa dampak lanjutan terhadap hasil panen padi para petani?\nc. Solusi ramah lingkungan apa yang sebaiknya dilakukan petani?',
        correctAnswer: 'a. Populasi tikus sawah akan meledak/meningkat pesat karena predator alaminya (ular) hilang.\nb. Hasil panen padi akan rusak parah dan menurun drastis akibat serangan hama tikus.\nc. Menghentikan perburuan ular, menjaga keseimbangan ekosistem, atau memanfaatkan burung hantu sebagai musuh alami tikus.',
        explanation: 'Hilangnya predator puncak menyebabkan mangsanya berkembang biak tanpa kendali, merusak rantai trofik berikutnya.',
        scoringRubric: 'Skor 5 poin: 2 poin untuk poin a, 2 poin untuk poin b, dan 1 poin untuk solusi logis c.',
        scoreWeight: 5,
      },
      {
        id: 'sample-q6',
        number: 6,
        type: 'soal_cerita',
        difficulty: 'HOTS',
        competencyIndicator: 'Menyelesaikan permasalahan kontekstual eksperimen sains',
        stimulus: 'Rani dan Dimas melakukan percobaan menanam dua pot biji kacang hijau dengan usia dan jenis tanah yang sama. Pot A diletakkan di teras rumah yang terkena sinar matahari melimpah dan disiram teratur. Pot B diletakkan di dalam lemari gelap tanpa cahaya dan disiram dengan takaran air yang sama. Setelah 7 hari, tanaman pada Pot A tampak hijau segar berbatang kokoh, sedangkan tanaman pada Pot B tumbuh sangat tinggi, pucat berwarna kuning, dan batangnya rapuh mudah patah.',
        questionText: 'Berdasarkan kisah percobaan Rani dan Dimas di atas:\n1. Mengapa tanaman pada Pot B batangnya tumbuh lebih cepat tinggi namun pucat dan lemah? (Sebutkan nama fenomenanya jika kamu tahu)\n2. Kesimpulan apa yang dapat kamu ambil mengenai pengaruh cahaya matahari terhadap pembuatan klorofil dan pertumbuhan tanaman?\n3. Jika Pot B dipindahkan ke tempat terang sekarang, apa yang harus diperhatikan agar tanaman tidak mati?',
        correctAnswer: '1. Fenomena etiolasi: tanaman mencari sumber cahaya dengan memanjangkan sel secara cepat, namun kekurangan klorofil sehingga pucat.\n2. Cahaya matahari sangat penting untuk pembentukan klorofil (zat hijau daun) dan membuat tanaman tumbuh kokoh dan sehat.\n3. Jangan langsung dijemur terik mendadak; adaptasikan secara bertahap dan jaga kelembapan tanah agar tidak layu mendadak.',
        explanation: 'Etiolasi terjadi saat tumbuhan tumbuh di tempat gelap. Klorofil tidak dapat terbentuk tanpa bantuan radiasi sinar matahari.',
        scoringRubric: 'Skor maksimal 6 poin (Masing-masing poin 2).',
        scoreWeight: 6,
      },
    ],
    summary: {
      totalQuestions: 6,
      breakdown: {
        pilihan_ganda: 1,
        pilihan_ganda_kompleks: 1,
        menjodohkan: 1,
        isian_singkat: 1,
        uraian: 1,
        soal_cerita: 1,
      },
      difficultyBreakdown: {
        lots: 2,
        mots: 2,
        hots: 2,
      },
      totalScore: 22,
    },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ['IPAS', 'Kelas 4', 'Fotosintesis', 'SAS', 'Kurikulum Merdeka'],
  },
  {
    id: 'sample-matematika-kls2',
    title: 'Asesmen Formatif Matematika Kelas 2: Penjumlahan, Pengurangan & Bangun Datar',
    grade: '2',
    subject: 'Matematika',
    topic: 'Operasi Hitung Bilangan Cacah hingga 100 dan Pengenalan Bentuk Segitiga, Segiempat, Lingkaran',
    curriculum: 'Kurikulum Merdeka',
    schoolHeader: {
      schoolName: 'SD TELADAN BANGSA',
      district: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
      assessmentName: 'ASESMEN SUMATIF LINGKUP MATERI',
      academicYear: '2024/2025',
      semester: 'Ganjil',
      durationMinutes: 60,
      generalInstructions: [
        'Tulis nama dan nomor absen dengan rapi.',
        'Jawablah pertanyaan dengan jujur dan teliti.',
      ],
    },
    questions: [
      {
        id: 'sample-mat-1',
        number: 1,
        type: 'pilihan_ganda',
        difficulty: 'LOTS',
        competencyIndicator: 'Menghitung hasil penjumlahan dua bilangan cacah',
        questionText: 'Paman memiliki 34 ekor ayam jago dan 25 ekor ayam betina. Jumlah seluruh ayam milik Paman adalah ...',
        options: [
          { id: 'A', label: 'A', text: '57 ekor' },
          { id: 'B', label: 'B', text: '59 ekor' },
          { id: 'C', label: 'C', text: '61 ekor' },
          { id: 'D', label: 'D', text: '63 ekor' },
        ],
        correctAnswer: 'B',
        explanation: '34 + 25 = 59. Satuan: 4 + 5 = 9. Puluhan: 3 + 2 = 5. Jadi hasilnya 59.',
        scoreWeight: 2,
      },
      {
        id: 'sample-mat-2',
        number: 2,
        type: 'menjodohkan',
        difficulty: 'LOTS',
        competencyIndicator: 'Mengenal ciri-ciri bangun datar sederhana',
        questionText: 'Tarik garis atau jodohkan bangun datar dengan jumlah sudutnya yang benar!',
        matchingPairs: [
          { premiseId: 'p1', premise: 'Segitiga', responseId: 'r1', response: 'Memiliki 3 sudut' },
          { premiseId: 'p2', premise: 'Persegi Panjang', responseId: 'r2', response: 'Memiliki 4 sudut siku-siku' },
          { premiseId: 'p3', premise: 'Lingkaran', responseId: 'r3', response: 'Tidak memiliki titik sudut' },
        ],
        correctAnswer: 'p1-r1, p2-r2, p3-r3',
        explanation: 'Segitiga memiliki 3 sisi dan 3 sudut, persegi panjang memiliki 4 sudut, dan lingkaran berbatas lengkung tanpa titik sudut.',
        scoreWeight: 3,
      },
      {
        id: 'sample-mat-3',
        number: 3,
        type: 'soal_cerita',
        difficulty: 'MOTS',
        competencyIndicator: 'Menyelesaikan soal cerita pengurangan dua tahap',
        stimulus: 'Siti membawa 50 butir kelereng dalam kantong. Di sekolah, Siti memberikan 15 butir kelereng kepada Edo. Kemudian saat istirahat, Siti membeli lagi 10 butir kelereng di koperasi.',
        questionText: 'Berapa banyak kelereng Siti sekarang? Tuliskan cara hitungnya!',
        correctAnswer: '45 butir kelereng. Cara: 50 - 15 = 35 butir, lalu 35 + 10 = 45 butir.',
        explanation: 'Langkah 1: Berikan ke Edo = 50 - 15 = 35. Langkah 2: Beli lagi = 35 + 10 = 45 butir.',
        scoreWeight: 4,
      },
    ],
    summary: {
      totalQuestions: 3,
      breakdown: {
        pilihan_ganda: 1,
        pilihan_ganda_kompleks: 0,
        menjodohkan: 1,
        isian_singkat: 0,
        uraian: 0,
        soal_cerita: 1,
      },
      difficultyBreakdown: {
        lots: 2,
        mots: 1,
        hots: 0,
      },
      totalScore: 9,
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    tags: ['Matematika', 'Kelas 2', 'Penjumlahan', 'Bangun Datar'],
  },
  {
    id: 'sample-indo-kls5',
    title: 'Ujian Literasi & Bahasa Indonesia Kelas 5: Teks Narasi & Ide Pokok',
    grade: '5',
    subject: 'Bahasa Indonesia',
    topic: 'Menentukan Ide Pokok, Kata Baku, Unsur Intrinsik Cerita & Majas Personifikasi',
    curriculum: 'Kurikulum Merdeka',
    schoolHeader: {
      schoolName: 'SD PERTIWI KENCANA JAYA',
      district: 'DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN BOGOR',
      assessmentName: 'PENILAIAN AKHIR SEMESTER (PAS) LITERASI',
      academicYear: '2024/2025',
      semester: 'Genap',
      durationMinutes: 90,
      generalInstructions: [
        'Isi identitas diri dengan lengkap dan jelas.',
        'Pilihlah jawaban yang paling tepat dengan memberikan tanda silang (X) atau tanda centang (✓).',
      ],
    },
    questions: [
      {
        id: 'sample-indo-1',
        number: 1,
        type: 'pilihan_ganda',
        difficulty: 'MOTS',
        competencyIndicator: 'Menemukan majas dalam kalimat fiksi',
        stimulus: '"Matahari baru saja terbangun dari peraduannya, menyapa dedaunan yang basah oleh sisa embun pagi."',
        questionText: 'Kalimat di atas menggunakan majas ...',
        options: [
          { id: 'A', label: 'A', text: 'Hiperbola' },
          { id: 'B', label: 'B', text: 'Personifikasi' },
          { id: 'C', label: 'C', text: 'Metafora' },
          { id: 'D', label: 'D', text: 'Litotes' },
        ],
        correctAnswer: 'B',
        explanation: 'Majas personifikasi adalah gaya bahasa yang melekatkan sifat-sifat insani (seperti bangun tidur, menyapa) pada benda mati atau alam semesta.',
        scoreWeight: 2,
      },
      {
        id: 'sample-indo-2',
        number: 2,
        type: 'uraian',
        difficulty: 'HOTS',
        competencyIndicator: 'Menulis simpulan dan amanat dari kutipan fabel',
        stimulus: 'Kancil yang cerdik selalu menolong teman-temannya di hutan rimba. Namun, suatu ketika ia mulai merasa bangga diri dan meremehkan nasihat Kura-kura tua. Saat banjir besar melanda hutan, Kancil tersesat karena mengabaikan peringatan Kura-kura, beruntung Kura-kura tetap berenang mencarinya dan membantunya menyeberang ke bukit tinggi.',
        questionText: 'Tuliskan amanat atau pesan moral yang terkandung dalam cerita fabel di atas, serta bagaimana kamu menerapkannya dalam kehidupan sehari-hari di sekolah!',
        correctAnswer: 'Amanat: Jangan pernah sombong atau meremehkan nasihat orang lain meskipun kita merasa pintar, serta selalu memiliki sifat pemaaf dan suka menolong. Penerapan di sekolah: Mendengarkan nasihat guru dan teman, tidak menyombongkan nilai tinggi, dan tetap membantu teman yang kesulitan belajar.',
        explanation: 'Amanat fabel menyoroti bahaya keangkuhan dan pentingnya kerendahan hati serta persahabatan sejati.',
        scoreWeight: 5,
      },
    ],
    summary: {
      totalQuestions: 2,
      breakdown: {
        pilihan_ganda: 1,
        pilihan_ganda_kompleks: 0,
        menjodohkan: 0,
        isian_singkat: 0,
        uraian: 1,
        soal_cerita: 0,
      },
      difficultyBreakdown: {
        lots: 0,
        mots: 1,
        hots: 1,
      },
      totalScore: 7,
    },
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    tags: ['Bahasa Indonesia', 'Kelas 5', 'Majas', 'Literasi', 'Fabel'],
  },
];

export const examStorage = {
  // Get all exam papers
  getAllExams(): ExamPaper[] {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        // Initialize with rich samples
        localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_SAMPLE_EXAMS));
        return INITIAL_SAMPLE_EXAMS;
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to read exams from localStorage:', err);
      return INITIAL_SAMPLE_EXAMS;
    }
  },

  // Save new exam paper
  saveExam(exam: ExamPaper): void {
    const list = this.getAllExams();
    const existingIndex = list.findIndex((item) => item.id === exam.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...exam, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...exam, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(DB_KEY, JSON.stringify(list));
  },

  // Get single exam paper by ID
  getExamById(id: string): ExamPaper | null {
    const list = this.getAllExams();
    return list.find((item) => item.id === id) || null;
  },

  // Delete an exam paper
  deleteExam(id: string): boolean {
    const list = this.getAllExams();
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    return filtered.length !== list.length;
  },

  // Duplicate an exam paper
  duplicateExam(id: string): ExamPaper | null {
    const original = this.getExamById(id);
    if (!original) return null;
    const duplicated: ExamPaper = {
      ...original,
      id: `copy-${Date.now()}`,
      title: `${original.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveExam(duplicated);
    return duplicated;
  },

  // Export all database records as JSON string for backup
  exportDatabaseJSON(): string {
    const list = this.getAllExams();
    return JSON.stringify(list, null, 2);
  },

  // Import database records from JSON string
  importDatabaseJSON(jsonStr: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'Format data JSON tidak valid: bukan daftar soal' };
      }
      localStorage.setItem(DB_KEY, JSON.stringify(parsed));
      return { success: true, count: parsed.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Gagal memproses file JSON' };
    }
  },

  // Reset to initial sample data
  resetToSampleData(): void {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_SAMPLE_EXAMS));
  },
};
