export type GradeLevel = '1' | '2' | '3' | '4' | '5' | '6';

export type SubjectName = 
  | 'Matematika'
  | 'IPAS (Ilmu Pengetahuan Alam & Sosial)'
  | 'Bahasa Indonesia'
  | 'Pendidikan Pancasila'
  | 'Bahasa Inggris'
  | 'Pendidikan Agama Islam (PAI)'
  | 'Seni & Prakarya'
  | 'Pendidikan Jasmani & Kesehatan (PJOK)';

export type DifficultyLevel = 'LOTS' | 'MOTS' | 'HOTS';

export type QuestionType = 
  | 'pilihan_ganda'
  | 'pilihan_ganda_kompleks'
  | 'menjodohkan'
  | 'isian_singkat'
  | 'uraian'
  | 'soal_cerita';

export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  description: string;
  defaultCount: number;
}

export interface OptionItem {
  id: string; // 'A', 'B', 'C', 'D'
  label: string;
  text: string;
}

export interface ComplexOptionItem {
  id: string;
  statement: string;
  isCorrect: boolean;
}

export interface MatchingPairItem {
  premiseId: string;
  premise: string; // Kolom Kiri
  responseId: string;
  response: string; // Kolom Kanan
}

export interface QuestionItem {
  id: string;
  number: number;
  type: QuestionType;
  difficulty: DifficultyLevel;
  competencyIndicator?: string; // Capaian Pembelajaran / Indikator
  stimulus?: string; // Cerita, tabel data, narasi kontekstual
  questionText: string;
  
  // Tipe Pilihan Ganda (Single Choice)
  options?: OptionItem[];
  
  // Tipe Pilihan Ganda Kompleks (Centang yang benar atau Benar/Salah)
  complexOptions?: ComplexOptionItem[];
  
  // Tipe Menjodohkan (Matching)
  matchingPairs?: MatchingPairItem[];
  
  // Kunci jawaban (bisa string huruf 'A', array string, atau teks)
  correctAnswer: string | string[];
  
  // Pembahasan detail & rubrik
  explanation: string;
  scoringRubric?: string;
  scoreWeight: number; // Bobot nilai
}

export interface SchoolHeaderConfig {
  schoolName: string;
  district: string; // Dinas Pendidikan / Yayasan
  assessmentName: string; // misal: "SUMATIF AKHIR SEMESTER (SAS) GANJIL"
  academicYear: string; // misal: "2024/2025"
  semester: 'Ganjil' | 'Genap';
  durationMinutes: number;
  generalInstructions?: string[];
}

export interface ExamPaper {
  id: string;
  title: string;
  grade: GradeLevel;
  subject: string;
  topic: string;
  curriculum: 'Kurikulum Merdeka' | 'Kurikulum 2013';
  schoolHeader: SchoolHeaderConfig;
  questions: QuestionItem[];
  summary: {
    totalQuestions: number;
    breakdown: Record<QuestionType, number>;
    difficultyBreakdown: {
      lots: number;
      mots: number;
      hots: number;
    };
    totalScore: number;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface GenerateFormState {
  grade: GradeLevel;
  subject: string;
  customSubject?: string;
  topic: string;
  curriculum: 'Kurikulum Merdeka' | 'Kurikulum 2013';
  schoolName: string;
  district: string;
  assessmentName: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  durationMinutes: number;
  difficultyPreset: 'seimbang' | 'lots_dominan' | 'hots_tantangan' | 'kustom';
  difficultyDistribution: {
    lotsPercent: number; // e.g. 30%
    motsPercent: number; // e.g. 50%
    hotsPercent: number; // e.g. 20%
  };
  counts: Record<QuestionType, number>;
  additionalNotes?: string;
}

export interface StudentAnswers {
  [questionId: string]: any;
}
