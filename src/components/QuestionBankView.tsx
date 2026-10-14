import React, { useState, useRef } from 'react';
import { ExamPaper, GradeLevel } from '../types/quiz';
import { 
  Database, 
  Search, 
  Filter, 
  PlayCircle, 
  FileText, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Calendar, 
  Clock, 
  Tag, 
  RotateCcw,
  PlusCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { exportInteractiveHTML, exportToWordDoc, exportToPDFDirect } from '../utils/exportUtils';

interface QuestionBankViewProps {
  exams: ExamPaper[];
  onSelectExam: (exam: ExamPaper) => void;
  onOpenInteractive: (exam: ExamPaper) => void;
  onDeleteExam: (id: string) => void;
  onDuplicateExam: (id: string) => void;
  onExportDatabase: () => void;
  onImportDatabase: (jsonStr: string) => void;
  onResetSamples: () => void;
  onCreateNew: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  exams,
  onSelectExam,
  onOpenInteractive,
  onDeleteExam,
  onDuplicateExam,
  onExportDatabase,
  onImportDatabase,
  onResetSamples,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter list
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.schoolHeader.schoolName && exam.schoolHeader.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGrade = selectedGrade === 'all' || exam.grade === selectedGrade;
    const matchesSubject = selectedSubject === 'all' || exam.subject === selectedSubject;

    return matchesSearch && matchesGrade && matchesSubject;
  });

  // Extract unique subjects
  const availableSubjects = Array.from(new Set(exams.map((e) => e.subject)));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportDatabase(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Top Header & Database Tools */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Bank Soal Sekolah Dasar Terpadu
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sistem repositori penyimpanan bank soal persisten. Simpan, kelola, cari, dan gunakan kembali kapan saja.
            </p>
          </div>

          {/* Database Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Paket Baru</span>
            </button>

            <button
              onClick={onExportDatabase}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Backup seluruh isi database bank soal ke file JSON"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Backup DB</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Restore DB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={onResetSamples}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs transition cursor-pointer"
              title="Reset ke paket soal standar kurikulum"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, judul, mapel..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Filter Grade */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
            >
              <option value="all">Semua Jenjang Kelas (1-6 SD)</option>
              <option value="1">Kelas 1 SD (Fase A)</option>
              <option value="2">Kelas 2 SD (Fase A)</option>
              <option value="3">Kelas 3 SD (Fase B)</option>
              <option value="4">Kelas 4 SD (Fase B)</option>
              <option value="5">Kelas 5 SD (Fase C)</option>
              <option value="6">Kelas 6 SD (Fase C)</option>
            </select>
          </div>

          {/* Filter Subject */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
            >
              <option value="all">Semua Mata Pelajaran</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Count badge */}
          <div className="flex items-center justify-end text-xs font-bold text-slate-600 px-2">
            Menampilkan: <span className="ml-1 text-purple-700 font-extrabold">{filteredExams.length}</span> dari {exams.length} paket
          </div>
        </div>
      </div>

      {/* Exam Cards Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header Tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-blue-100 text-blue-800">
                      Kelas {exam.grade} SD
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {exam.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700">
                      {exam.curriculum}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(exam.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Exam Title & Topic */}
                <h3 className="text-base font-extrabold text-slate-900 mb-1 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                  <strong>Materi:</strong> {exam.topic}
                </p>

                {/* Question Breakdown Pills */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-700 mb-1.5">
                    <span>Total: {exam.questions.length} Butir Soal</span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      Waktu: {exam.schoolHeader.durationMinutes} Menit
                    </span>
                  </div>

                  {/* Types Breakdown badges */}
                  <div className="flex flex-wrap gap-1 text-[10px] font-medium text-slate-600">
                    {Object.entries(exam.summary.breakdown).map(([t, count]) => {
                      if (count <= 0) return null;
                      return (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-white border border-slate-200">
                          {t.replace('_', ' ')}: <strong>{count}</strong>
                        </span>
                      );
                    })}
                  </div>

                  {/* Difficulty Bar */}
                  <div className="mt-2.5 flex items-center gap-2 text-[10px] font-semibold">
                    <span className="text-emerald-700">LOTS: {exam.summary.difficultyBreakdown.lots}</span>
                    <span>•</span>
                    <span className="text-amber-700">MOTS: {exam.summary.difficultyBreakdown.mots}</span>
                    <span>•</span>
                    <span className="text-red-700">HOTS: {exam.summary.difficultyBreakdown.hots}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Open Paper */}
                  <button
                    onClick={() => onSelectExam(exam)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Naskah & Cetak</span>
                  </button>

                  {/* Open CBT */}
                  <button
                    onClick={() => onOpenInteractive(exam)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Mode CBT</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 text-slate-500">
                  {/* Duplicate */}
                  <button
                    onClick={() => onDuplicateExam(exam.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                    title="Duplikasi paket soal ini"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Quick Word */}
                  <button
                    onClick={() => exportToWordDoc(exam)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition cursor-pointer"
                    title="Ekspor ke format Word"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Delete with confirmation */}
                  {confirmDeleteId === exam.id ? (
                    <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg">
                      <button
                        onClick={() => {
                          onDeleteExam(exam.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 text-[10px] text-slate-600 cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(exam.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                      title="Hapus paket soal ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Tidak ada paket soal yang cocok dengan filter
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau bersihkan filter kelas/mata pelajaran untuk melihat paket soal lainnya.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGrade('all');
              setSelectedSubject('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Bersihkan Filter
          </button>
        </div>
      )}
    </div>
  );
};
