import React, { useState } from 'react';
import { ExamPaper, QuestionItem } from '../types/quiz';
import { 
  Printer, 
  Download, 
  FileCode, 
  FileText, 
  PlayCircle, 
  Save, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Clock, 
  ChevronRight,
  Edit3,
  HelpCircle
} from 'lucide-react';
import { exportInteractiveHTML, exportToWordDoc, exportToPDFDirect, printExamPaper } from '../utils/exportUtils';

interface ExamPaperViewProps {
  exam: ExamPaper;
  onSaveToBank: (exam: ExamPaper) => void;
  onOpenInteractive: () => void;
  onEditQuestion: (question: QuestionItem) => void;
}

export const ExamPaperView: React.FC<ExamPaperViewProps> = ({
  exam,
  onSaveToBank,
  onOpenInteractive,
  onEditQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'soal' | 'kunci' | 'kisi' | 'ljk'>('soal');
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const handleSave = () => {
    onSaveToBank(exam);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6 sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3">
        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('soal')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'soal' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Naskah Soal Siswa
          </button>
          <button
            onClick={() => setActiveTab('kunci')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'kunci' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kunci & Pembahasan
          </button>
          <button
            onClick={() => setActiveTab('kisi')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'kisi' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kisi-Kisi & Rubrik
          </button>
          <button
            onClick={() => setActiveTab('ljk')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'ljk' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lembar Jawab (LJK)
          </button>
        </div>

        {/* Export & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CBT Button */}
          <button
            onClick={onOpenInteractive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Mode CBT Siswa</span>
          </button>

          {/* Print PDF Button */}
          <button
            onClick={() => printExamPaper()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            title="Buka dialog cetak PDF resmi format A4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>

          {/* Quick PDF Direct */}
          <button
            onClick={() => exportToPDFDirect(exam)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Download file .pdf instan"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Unduh PDF</span>
          </button>

          {/* Word Export */}
          <button
            onClick={() => exportToWordDoc(exam)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Ekspor ke format Microsoft Word (.doc)"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Word (.doc)</span>
          </button>

          {/* HTML Standalone */}
          <button
            onClick={() => exportInteractiveHTML(exam)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Download file HTML interaktif mandiri yang dapat dibuka offline"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">HTML Offline</span>
          </button>

          {/* Save to Bank */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan ke Bank</span>
          </button>
        </div>
      </div>

      {savedNotification && (
        <div className="no-print mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Naskah soal berhasil disimpan ke Bank Soal lokal! Anda dapat membukanya kapan saja melalui tab Bank Soal.</span>
        </div>
      )}

      {/* Official Exam Sheet Container (Print Sheet) */}
      <div className="print-sheet bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 text-slate-900 transition-all">
        
        {/* 1. KOP SURAT RESMI SEKOLAH */}
        <div className="text-center pb-4 mb-4 border-b-4 border-double border-slate-900">
          <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-700">
            {exam.schoolHeader.district}
          </div>
          <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-slate-900 mt-1">
            {exam.schoolHeader.schoolName}
          </h1>
          <div className="text-xs sm:text-base font-bold uppercase text-slate-800 mt-1">
            {exam.schoolHeader.assessmentName}
          </div>
          <div className="text-xs text-slate-600 font-medium mt-1">
            Tahun Ajaran: {exam.schoolHeader.academicYear} | Semester: {exam.schoolHeader.semester}
          </div>
        </div>

        {/* 2. TABEL IDENTITAS SISWA & MATA PELAJARAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs sm:text-sm mb-6 pb-4 border-b border-slate-200 font-medium">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Mata Pelajaran</span>
              <span>: <strong>{exam.subject}</strong></span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Kelas / Fase</span>
              <span>: Kelas {exam.grade} SD ({exam.curriculum})</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Materi / Bab</span>
              <span>: {exam.topic}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Hari / Tanggal</span>
              <span>: ............................................</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Alokasi Waktu</span>
              <span>: {exam.schoolHeader.durationMinutes} Menit</span>
            </div>
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Nama Siswa / No</span>
              <span>: ............................. / ..........</span>
            </div>
          </div>
        </div>

        {/* 3. PETUNJUK UMUM */}
        <div className="mb-6 p-3.5 rounded-xl border border-slate-300 bg-slate-50/70 text-xs text-slate-700">
          <strong className="block text-slate-900 font-bold mb-1">PETUNJUK UMUM PENGERJAAN:</strong>
          <ol className="list-decimal pl-4 space-y-1">
            {exam.schoolHeader.generalInstructions && exam.schoolHeader.generalInstructions.length > 0 ? (
              exam.schoolHeader.generalInstructions.map((ins, i) => <li key={i}>{ins}</li>)
            ) : (
              <>
                <li>Berdoalah sebelum mengerjakan soal sesuai keyakinan masing-masing.</li>
                <li>Tuliskan nama, nomor absen, dan identitasmu secara lengkap pada lembar jawaban.</li>
                <li>Bacalah setiap butir soal dengan cermat dan teliti sebelum menentukan jawaban.</li>
                <li>Dahulukan menjawab soal yang kamu anggap mudah terlebih dahulu.</li>
                <li>Periksa kembali seluruh lembar jawaban sebelum diserahkan kepada pengawas ujian.</li>
              </>
            )}
          </ol>
        </div>

        {/* VIEW 1: NASKAH SOAL SISWA */}
        {activeTab === 'soal' && (
          <div className="space-y-6">
            {exam.questions.map((q) => (
              <div key={q.id} className="print-question-item pb-4 border-b border-slate-200/60 last:border-0">
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      {q.number}.
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {q.type.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      q.difficulty === 'HOTS' ? 'bg-red-100 text-red-700' :
                      q.difficulty === 'MOTS' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  
                  {/* Edit button in non-print mode */}
                  <button
                    onClick={() => onEditQuestion(q)}
                    className="no-print flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>

                {/* Stimulus Narasi jika ada */}
                {q.stimulus && (
                  <div className="mb-3 p-3.5 rounded-lg bg-blue-50/50 border-l-4 border-blue-600 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                    <span className="font-bold text-blue-900 block mb-1">📖 Stimulus / Narasi:</span>
                    {q.stimulus}
                  </div>
                )}

                {/* Question Text */}
                <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 whitespace-pre-line leading-relaxed">
                  {q.questionText}
                </div>

                {/* Options Rendering */}
                {/* 1. Pilihan Ganda */}
                {q.type === 'pilihan_ganda' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pl-4">
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-start gap-2 py-1">
                        <span className="font-bold text-slate-800 w-5">{opt.label}.</span>
                        <span className="text-slate-800">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Pilihan Ganda Kompleks */}
                {q.type === 'pilihan_ganda_kompleks' && q.complexOptions && (
                  <div className="space-y-1.5 text-xs sm:text-sm pl-4 mt-2">
                    {q.complexOptions.map((co) => (
                      <div key={co.id} className="flex items-start gap-2 py-1">
                        <span className="w-4 h-4 border border-slate-400 rounded shrink-0 mt-0.5"></span>
                        <span className="text-slate-800">{co.statement}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Menjodohkan */}
                {q.type === 'menjodohkan' && q.matchingPairs && (
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-bold">
                          <th className="border border-slate-300 p-2 text-left">Pernyataan (Premis)</th>
                          <th className="border border-slate-300 p-2 text-left">Pilihan Pasangan (Respon)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {q.matchingPairs.map((mp, mIdx) => (
                          <tr key={mp.premiseId}>
                            <td className="border border-slate-300 p-2 font-medium">
                              {mIdx + 1}. {mp.premise}
                            </td>
                            <td className="border border-slate-300 p-2">
                              ( &nbsp; &nbsp; &nbsp; ) &nbsp; {mp.response}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. Isian Singkat */}
                {q.type === 'isian_singkat' && (
                  <div className="mt-3 pl-4">
                    <div className="inline-block border-b-2 border-dotted border-slate-400 w-72 h-6"></div>
                  </div>
                )}

                {/* 5. Uraian & Soal Cerita */}
                {(q.type === 'uraian' || q.type === 'soal_cerita') && (
                  <div className="mt-3 pl-4">
                    <div className="text-[11px] text-slate-400 italic mb-2">Jawaban / Uraian siswa:</div>
                    <div className="border border-dashed border-slate-300 rounded-lg h-24 p-2 bg-slate-50/30"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: KUNCI JAWABAN & PEMBAHASAN */}
        {activeTab === 'kunci' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-medium">
              <strong>Pedoman Kunci Jawaban:</strong> Halaman ini memuat kunci jawaban resmi, langkah penyelesaian, dan penjelasan konsep untuk pendidik dalam memeriksa hasil asesmen.
            </div>

            <div className="space-y-4">
              {exam.questions.map((q) => (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        Nomor {q.number}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {q.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        Bobot: {q.scoreWeight} Poin
                      </span>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    {q.questionText}
                  </div>

                  {/* Kunci Jawaban Box */}
                  <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm mb-2">
                    <strong className="text-emerald-900 block mb-1">Kunci Jawaban:</strong>
                    <div className="font-bold text-emerald-800 whitespace-pre-line">
                      {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                    </div>
                  </div>

                  {/* Pembahasan Detail */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    <strong className="text-slate-900 block mb-1">💡 Pembahasan & Langkah Penyelesaian:</strong>
                    {q.explanation}
                  </div>

                  {/* Rubrik jika ada */}
                  {q.scoringRubric && (
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                      <strong>Rubrik Penskoran:</strong> {q.scoringRubric}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: KISI-KISI & ANALISIS BUTIR */}
        {activeTab === 'kisi' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs sm:text-sm text-purple-900 font-medium">
              <strong>Matriks Kisi-Kisi Ujian:</strong> Pemetaan Capaian Pembelajaran, jenis butir soal, taksonomi berpikir (LOTS/MOTS/HOTS), dan distribusi skor.
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="border border-slate-300 p-2 text-center">No</th>
                    <th className="border border-slate-300 p-2 text-left">Capaian Pembelajaran / Indikator</th>
                    <th className="border border-slate-300 p-2 text-center">Tipe Soal</th>
                    <th className="border border-slate-300 p-2 text-center">Tingkat Kesulitan</th>
                    <th className="border border-slate-300 p-2 text-center">Bobot</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-bold">{q.number}</td>
                      <td className="border border-slate-300 p-2">{q.competencyIndicator || exam.topic}</td>
                      <td className="border border-slate-300 p-2 text-center uppercase font-semibold text-slate-600">
                        {q.type.replace('_', ' ')}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === 'HOTS' ? 'bg-red-100 text-red-700' :
                          q.difficulty === 'MOTS' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{q.scoreWeight}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black">
                    <td colSpan={4} className="border border-slate-300 p-2 text-right">TOTAL SKOR MAKSIMAL:</td>
                    <td className="border border-slate-300 p-2 text-center text-blue-700">
                      {exam.questions.reduce((sum, item) => sum + item.scoreWeight, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 4: LEMBAR JAWABAN (LJK CETAK) */}
        {activeTab === 'ljk' && (
          <div className="space-y-6">
            <div className="text-center pb-2 border-b-2 border-slate-800">
              <h2 className="font-extrabold text-base uppercase">LEMBAR JAWABAN SISWA (LJS)</h2>
              <p className="text-xs text-slate-600">Gunakan pulpen atau pensil 2B untuk mengisi jawaban di bawah ini.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium pb-4 border-b border-slate-200">
              <div>Nama Lengkap: ....................................................</div>
              <div>Kelas: Kelas {exam.grade} SD</div>
              <div>Nomor Absen: ....................................................</div>
              <div>Mata Pelajaran: {exam.subject}</div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase bg-slate-100 p-1.5 rounded">I. Jawaban Pilihan Ganda:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {exam.questions.filter(q => q.type === 'pilihan_ganda').map(q => (
                  <div key={q.id} className="flex items-center gap-2 p-1.5 border border-slate-200 rounded">
                    <span className="font-bold w-6">{q.number}.</span>
                    <div className="flex gap-1.5 font-bold">
                      <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center">A</span>
                      <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center">B</span>
                      <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center">C</span>
                      <span className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center">D</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-xs uppercase bg-slate-100 p-1.5 rounded mt-4">II. Jawaban Isian & Uraian:</h3>
              <div className="space-y-3 text-xs">
                {exam.questions.filter(q => q.type !== 'pilihan_ganda').map(q => (
                  <div key={q.id} className="p-2 border border-slate-200 rounded">
                    <div className="font-bold mb-1">Nomor {q.number} ({q.type.replace('_', ' ')}):</div>
                    <div className="border-b border-dotted border-slate-400 h-10"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kolom Tanda Tangan Resmi di Bawah Naskah */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-3 text-center text-xs">
          <div>
            <p className="font-medium">Mengetahui,</p>
            <p className="font-medium text-slate-600">Orang Tua / Wali Murid</p>
            <div className="h-16"></div>
            <p className="font-bold">( ............................................ )</p>
          </div>
          <div></div>
          <div>
            <p className="font-medium">Semarang, .............................</p>
            <p className="font-medium text-slate-600">Guru Mata Pelajaran</p>
            <div className="h-16"></div>
            <p className="font-bold">( ............................................ )</p>
          </div>
        </div>

      </div>
    </div>
  );
};
