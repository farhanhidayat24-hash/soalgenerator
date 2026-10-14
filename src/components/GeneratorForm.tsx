import React, { useState } from 'react';
import { 
  GradeLevel, 
  GenerateFormState, 
  QuestionType,
} from '../types/quiz';
import { 
  Sparkles, 
  Sliders, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  School, 
  Clock, 
  HelpCircle,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

interface GeneratorFormProps {
  onGenerate: (formState: GenerateFormState) => Promise<void>;
  isLoading: boolean;
  loadingStepText: string;
}

const GRADE_INFO: Record<GradeLevel, { name: string; phase: string; age: string; color: string }> = {
  '1': { name: 'Kelas 1 SD', phase: 'Fase A (Awal)', age: '6-7 Tahun', color: 'border-emerald-300 bg-emerald-50/50 text-emerald-800' },
  '2': { name: 'Kelas 2 SD', phase: 'Fase A (Lanjut)', age: '7-8 Tahun', color: 'border-emerald-300 bg-emerald-50/50 text-emerald-800' },
  '3': { name: 'Kelas 3 SD', phase: 'Fase B (Awal)', age: '8-9 Tahun', color: 'border-blue-300 bg-blue-50/50 text-blue-800' },
  '4': { name: 'Kelas 4 SD', phase: 'Fase B (Lanjut)', age: '9-10 Tahun', color: 'border-blue-300 bg-blue-50/50 text-blue-800' },
  '5': { name: 'Kelas 5 SD', phase: 'Fase C (Awal)', age: '10-11 Tahun', color: 'border-indigo-300 bg-indigo-50/50 text-indigo-800' },
  '6': { name: 'Kelas 6 SD', phase: 'Fase C (Kelulusan)', age: '11-12 Tahun', color: 'border-indigo-300 bg-indigo-50/50 text-indigo-800' },
};

const SUBJECT_OPTIONS = [
  'Matematika',
  'IPAS (Ilmu Pengetahuan Alam & Sosial)',
  'Bahasa Indonesia',
  'Pendidikan Pancasila',
  'Bahasa Inggris',
  'Pendidikan Agama Islam (PAI)',
  'Seni Budaya & Prakarya',
  'Pendidikan Jasmani (PJOK)',
  'Lainnya / Kustom',
];

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  'Matematika': [
    'Operasi Hitung Penjumlahan & Pengurangan Bilangan Cacah',
    'Perkalian & Pembagian Dasar dalam Kehidupan Sehari-hari',
    'Pecahan Senilai, Desimal, dan Persen',
    'Pengukuran Panjang, Berat, Waktu, dan Satuan Baku',
    'Ciri Bangun Datar, Keliling, Luas, dan Sudut Siku-siku',
  ],
  'IPAS (Ilmu Pengetahuan Alam & Sosial)': [
    'Bagian Tubuh Tumbuhan, Fotosintesis, dan Perkembangbiakan',
    'Rantai Makanan, Jaring-jaring Makanan, dan Ekosistem',
    'Perubahan Wujud Zat dan Siklus Air di Bumi',
    'Gaya dan Gerak (Gaya Gesek, Magnet, Gravitasi, dan Pegas)',
    'Keberagaman Budaya, Peninggalan Sejarah, dan Kearifan Lokal',
  ],
  'Bahasa Indonesia': [
    'Menentukan Ide Pokok dan Kalimat Utama dalam Paragraf',
    'Unsur Intrinsik Cerita Fabel dan Cerita Pendek (Tokoh, Latar, Amanat)',
    'Teks Petunjuk, Prosedur, dan Formulir Sederhana',
    'Kosakata Baku, Tanda Baca, dan Huruf Kapital Sesuai EYD',
    'Majas Personifikasi dan Metafora dalam Karya Puisi Anak',
  ],
  'Pendidikan Pancasila': [
    'Penerapan Nilai-Nilai Sila Pancasila di Rumah dan Sekolah',
    'Hak dan Kewajiban Anak sebagai Anggota Keluarga dan Warga Sekolah',
    'Musyawarah untuk Mencapai Mufakat dalam Menyelesaikan Masalah',
    'Menghargai Keberagaman Suku, Agama, dan Budaya di Indonesia',
  ],
};

const QUESTION_TYPES_META: {
  key: QuestionType;
  title: string;
  badge: string;
  desc: string;
  defaultVal: number;
}[] = [
  {
    key: 'pilihan_ganda',
    title: 'Pilihan Ganda',
    badge: 'PG (A, B, C, D)',
    desc: 'Satu jawaban benar dengan 4 opsi pilihan',
    defaultVal: 5,
  },
  {
    key: 'pilihan_ganda_kompleks',
    title: 'Pilihan Ganda Kompleks',
    badge: 'PG Kompleks / Centang',
    desc: 'Memilih lebih dari satu pernyataan yang benar',
    defaultVal: 3,
  },
  {
    key: 'menjodohkan',
    title: 'Menjodohkan',
    badge: 'Matching Pairs',
    desc: 'Memasangkan konsep premis dengan respon jawaban',
    defaultVal: 2,
  },
  {
    key: 'isian_singkat',
    title: 'Isian Singkat',
    badge: 'Fill-in-the-blank',
    desc: 'Menjawab dengan kata, istilah, atau angka pasti',
    defaultVal: 3,
  },
  {
    key: 'uraian',
    title: 'Uraian / Essay',
    badge: 'Analisis Terstruktur',
    desc: 'Menjelaskan pemikiran dengan rubrik penskoran',
    defaultVal: 2,
  },
  {
    key: 'soal_cerita',
    title: 'Soal Cerita Kontekstual',
    badge: 'HOTS Problem Solving',
    desc: 'Pemecahan masalah berbasis narasi kehidupan nyata anak',
    defaultVal: 2,
  },
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onGenerate,
  isLoading,
  loadingStepText,
}) => {
  const [grade, setGrade] = useState<GradeLevel>('4');
  const [subject, setSubject] = useState<string>('IPAS (Ilmu Pengetahuan Alam & Sosial)');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('Fotosintesis, Rantai Makanan, dan Keseimbangan Ekosistem');
  const [curriculum, setCurriculum] = useState<'Kurikulum Merdeka' | 'Kurikulum 2013'>('Kurikulum Merdeka');
  
  // School Header
  const [schoolName, setSchoolName] = useState<string>('SD NEGERI NUSANTARA MERDEKA 01');
  const [district, setDistrict] = useState<string>('DINAS PENDIDIKAN KOTA SEMARANG');
  const [assessmentName, setAssessmentName] = useState<string>('SUMATIF AKHIR SEMESTER (SAS) GANJIL');
  const [academicYear, setAcademicYear] = useState<string>('2024/2025');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);

  // Difficulty preset
  const [difficultyPreset, setDifficultyPreset] = useState<'seimbang' | 'lots_dominan' | 'hots_tantangan' | 'kustom'>('seimbang');
  const [lotsPercent, setLotsPercent] = useState<number>(30);
  const [motsPercent, setMotsPercent] = useState<number>(50);
  const [hotsPercent, setHotsPercent] = useState<number>(20);

  // Counts for each question type
  const [counts, setCounts] = useState<Record<QuestionType, number>>({
    pilihan_ganda: 5,
    pilihan_ganda_kompleks: 3,
    menjodohkan: 2,
    isian_singkat: 3,
    uraian: 2,
    soal_cerita: 2,
  });

  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Total questions count
  const totalQuestions = Object.values(counts).reduce((sum, val) => sum + val, 0);

  // Handle Preset changes
  const applyPreset = (preset: 'seimbang' | 'lots_dominan' | 'hots_tantangan') => {
    setDifficultyPreset(preset);
    if (preset === 'seimbang') {
      setLotsPercent(30);
      setMotsPercent(50);
      setHotsPercent(20);
    } else if (preset === 'lots_dominan') {
      setLotsPercent(60);
      setMotsPercent(30);
      setHotsPercent(10);
    } else if (preset === 'hots_tantangan') {
      setLotsPercent(10);
      setMotsPercent(40);
      setHotsPercent(50);
    }
  };

  // Adjust count helper
  const updateCount = (type: QuestionType, delta: number) => {
    setCounts((prev) => {
      const current = prev[type] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [type]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalQuestions <= 0) {
      alert('Pilihlah minimal 1 jenis soal untuk dibuat!');
      return;
    }

    const finalSubject = subject === 'Lainnya / Kustom' ? (customSubject || 'Pelajaran Umum') : subject;

    const formState: GenerateFormState = {
      grade,
      subject: finalSubject,
      topic: topic.trim() || 'Materi Umum Sesuai Kurikulum',
      curriculum,
      schoolName: schoolName.trim() || 'SD NEGERI NUSANTARA',
      district: district.trim() || 'DINAS PENDIDIKAN',
      assessmentName: assessmentName.trim() || 'PENILAIAN AKHIR SEMESTER',
      academicYear,
      semester,
      durationMinutes,
      difficultyPreset,
      difficultyDistribution: {
        lotsPercent,
        motsPercent,
        hotsPercent,
      },
      counts,
      additionalNotes,
    };

    await onGenerate(formState);
  };

  const currentSuggestions = TOPIC_SUGGESTIONS[subject] || [];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Hero Title */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Generator & Bank Soal SD Terpadu
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Penyusun Naskah Soal SD (Kelas 1 - 6)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Hasilkan paket soal resmi lengkap dengan kunci jawaban, kisi-kisi taksonomi (LOTS, MOTS, HOTS), format cetak A4 Kop Sekolah, mode CBT interaktif, dan ekspor instan PDF/Word.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Jenjang Kelas SD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">1</span>
                Pilih Jenjang Kelas Sekolah Dasar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bahasa soal, tingkat literasi, dan kompleksitas stimulus disesuaikan dengan fase perkembangan kognitif siswa.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {GRADE_INFO[grade].phase}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(['1', '2', '3', '4', '5', '6'] as GradeLevel[]).map((g) => {
              const info = GRADE_INFO[g];
              const isSelected = grade === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div className="text-lg font-extrabold text-slate-900">
                    Kelas {g}
                  </div>
                  <div className="text-[11px] font-semibold text-blue-700 mt-0.5">
                    {info.phase.split(' ')[0]} {info.phase.split(' ')[1]}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {info.age}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Mata Pelajaran & Materi */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">2</span>
              Mata Pelajaran & Capaian Pembelajaran (Materi)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tentukan mata pelajaran dan cakupan materi yang akan diujikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mata Pelajaran
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kurikulum
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurriculum('Kurikulum Merdeka')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                    curriculum === 'Kurikulum Merdeka'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Kurikulum Merdeka
                </button>
                <button
                  type="button"
                  onClick={() => setCurriculum('Kurikulum 2013')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                    curriculum === 'Kurikulum 2013'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Kurikulum 2013 (K13)
                </button>
              </div>
            </div>
          </div>

          {subject === 'Lainnya / Kustom' && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Mata Pelajaran Kustom
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="misal: Bahasa Daerah Jawa / Koding Sederhana / PLBJ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cakupan Materi / Bab / Indikator Capaian
            </label>
            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ketik topik spesifik, misal: Operasi hitung pecahan senilai dan desimal, soal cerita belanja di warung..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            {/* Quick Topic Suggestions */}
            {currentSuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  Saran Topik Cepat:
                </span>
                {currentSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition cursor-pointer border border-slate-200"
                  >
                    {sug.length > 38 ? sug.substring(0, 38) + '...' : sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Kustomisasi Jumlah Soal per Masing-Masing Jenis */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">3</span>
                Kustomisasi Jumlah Soal per Jenis Soal
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan jumlah butir soal untuk setiap kategori soal secara spesifik.
              </p>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-extrabold flex items-center gap-1.5">
              <span>Total Soal:</span>
              <span className="text-sm font-black text-blue-700">{totalQuestions} Butir</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {QUESTION_TYPES_META.map((meta) => {
              const count = counts[meta.key] || 0;
              return (
                <div
                  key={meta.key}
                  className={`p-4 rounded-xl border transition-all ${
                    count > 0
                      ? 'border-blue-200 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{meta.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {meta.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3 h-8 leading-relaxed">
                    {meta.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-600">Jumlah butir:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCount(meta.key, -1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer font-bold disabled:opacity-40"
                        disabled={count <= 0}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-extrabold text-sm text-slate-900">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCount(meta.key, 1)}
                        className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 flex items-center justify-center transition cursor-pointer font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Tingkat Kesulitan (LOTS, MOTS, HOTS) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">4</span>
                Komposisi Tingkat Kesulitan (Taksonomi Bloom)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                LOTS (Mengingat/Memahami), MOTS (Menerapkan), HOTS (Menganalisis/Mengevaluasi/Mencipta).
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => applyPreset('seimbang')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                difficultyPreset === 'seimbang'
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">Standar Asesmen Nasional</div>
              <div className="text-[11px] text-slate-600 mt-0.5">30% LOTS • 50% MOTS • 20% HOTS</div>
              <div className="text-[10px] text-blue-700 font-semibold mt-1">Sangat Dianjurkan (SAS/STS)</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('lots_dominan')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                difficultyPreset === 'lots_dominan'
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">Penguatan Pemahaman Dasar</div>
              <div className="text-[11px] text-slate-600 mt-0.5">60% LOTS • 30% MOTS • 10% HOTS</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">Cocok untuk Kelas 1-3 SD</div>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('hots_tantangan')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                difficultyPreset === 'hots_tantangan'
                  ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">Tantangan Nalar Kritis (HOTS)</div>
              <div className="text-[11px] text-slate-600 mt-0.5">10% LOTS • 40% MOTS • 50% HOTS</div>
              <div className="text-[10px] text-purple-700 font-semibold mt-1">Cocok untuk Ujian Akhir & AKM</div>
            </button>
          </div>

          {/* Visual Percentage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-700">LOTS: {lotsPercent}%</span>
              <span className="text-amber-700">MOTS: {motsPercent}%</span>
              <span className="text-red-700">HOTS: {hotsPercent}%</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${lotsPercent}%` }} className="bg-emerald-500 h-full transition-all"></div>
              <div style={{ width: `${motsPercent}%` }} className="bg-amber-500 h-full transition-all"></div>
              <div style={{ width: `${hotsPercent}%` }} className="bg-red-500 h-full transition-all"></div>
            </div>
          </div>
        </div>

        {/* Section 5: Konfigurasi Kop Dokumen Sekolah & Penilaian */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">5</span>
              Identitas Sekolah & Kop Naskah Ujian (Untuk Cetak/PDF)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi ini akan tertera otomatis pada Kop Surat naskah soal resmi, lembar jawaban, dan ekspor dokumen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Sekolah SD
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="misal: SD NEGERI 01 CEMARA"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dinas Pendidikan / Yayasan
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="misal: DINAS PENDIDIKAN KOTA SEMARANG"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Asesmen / Ujian
              </label>
              <input
                type="text"
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                placeholder="misal: SUMATIF AKHIR SEMESTER (SAS)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="misal: 2024/2025"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alokasi Waktu (Menit)
              </label>
              <input
                type="number"
                min={15}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Tambahan untuk AI (Opsional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="misal: Gunakan nama tokoh fiksi kearifan lokal Nusantara (Budi, Siti, Edo, Dayu) dan hindari istilah yang terlalu asing."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-extrabold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Siap Menyusun Paket Naskah Soal
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Kelas {grade} SD • {subject} • {totalQuestions} Butir Soal • {durationMinutes} Menit
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || totalQuestions === 0}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{loadingStepText || 'Menyusun Soal dengan Gemini AI...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Naskah Soal Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
