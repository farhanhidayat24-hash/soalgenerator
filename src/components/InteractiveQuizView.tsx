import React, { useState, useEffect } from 'react';
import { ExamPaper, QuestionItem } from '../types/quiz';
import { 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  RefreshCw, 
  FileText, 
  Bookmark, 
  Play, 
  Pause,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InteractiveQuizViewProps {
  exam: ExamPaper;
  onBackToPaper: () => void;
}

export const InteractiveQuizView: React.FC<InteractiveQuizViewProps> = ({
  exam,
  onBackToPaper,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(exam.schoolHeader.durationMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [resultScore, setResultScore] = useState<{
    earned: number;
    total: number;
    percentage: number;
    breakdown: { qId: string; isCorrect: boolean; score: number }[];
  } | null>(null);

  const currentQuestion: QuestionItem = exam.questions[currentIndex] || exam.questions[0];

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isFinished]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set single choice answer
  const handleSelectRadio = (qId: string, optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  // Toggle complex checkbox answer
  const handleToggleCheckbox = (qId: string, choiceId: string) => {
    setUserAnswers((prev) => {
      const currentList: string[] = prev[qId] || [];
      const exists = currentList.includes(choiceId);
      const nextList = exists
        ? currentList.filter((id) => id !== choiceId)
        : [...currentList, choiceId];
      return { ...prev, [qId]: nextList };
    });
  };

  // Handle matching pair dropdown
  const handleSelectMatching = (qId: string, premiseId: string, responseId: string) => {
    setUserAnswers((prev) => {
      const currentMap: Record<string, string> = prev[qId] || {};
      return { ...prev, [qId]: { ...currentMap, [premiseId]: responseId } };
    });
  };

  // Handle text input
  const handleTextInput = (qId: string, text: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  // Toggle flag (ragu-ragu)
  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Evaluate & finish quiz
  const finishQuiz = () => {
    let earned = 0;
    let totalMax = 0;
    const breakdown: { qId: string; isCorrect: boolean; score: number }[] = [];

    exam.questions.forEach((q) => {
      totalMax += q.scoreWeight;
      const ans = userAnswers[q.id];
      let isCorrect = false;
      let questionScore = 0;

      if (q.type === 'pilihan_ganda') {
        if (ans && ans.toString().toUpperCase() === q.correctAnswer.toString().toUpperCase()) {
          isCorrect = true;
          questionScore = q.scoreWeight;
        }
      } else if (q.type === 'pilihan_ganda_kompleks' && q.complexOptions) {
        const correctSet = q.complexOptions.filter((c) => c.isCorrect).map((c) => c.id);
        const userSet: string[] = Array.isArray(ans) ? ans : [];
        const isExact =
          correctSet.length === userSet.length &&
          correctSet.every((id) => userSet.includes(id));
        if (isExact) {
          isCorrect = true;
          questionScore = q.scoreWeight;
        } else if (userSet.length > 0) {
          // Partial points
          const matchCount = userSet.filter((id) => correctSet.includes(id)).length;
          questionScore = Math.max(0, Math.round((matchCount / correctSet.length) * q.scoreWeight));
        }
      } else if (q.type === 'menjodohkan' && q.matchingPairs) {
        const userMap: Record<string, string> = ans || {};
        let matches = 0;
        q.matchingPairs.forEach((pair) => {
          if (userMap[pair.premiseId] === pair.responseId) {
            matches++;
          }
        });
        if (matches === q.matchingPairs.length) {
          isCorrect = true;
          questionScore = q.scoreWeight;
        } else {
          questionScore = Math.round((matches / q.matchingPairs.length) * q.scoreWeight);
        }
      } else if (q.type === 'isian_singkat') {
        const cleanedUser = (ans || '').toString().trim().toLowerCase();
        const cleanedTarget = (q.correctAnswer || '').toString().trim().toLowerCase();
        if (cleanedUser && cleanedUser === cleanedTarget) {
          isCorrect = true;
          questionScore = q.scoreWeight;
        }
      } else {
        // Uraian & Soal cerita (Auto-awarded partial for submission)
        if (ans && ans.toString().trim().length > 10) {
          isCorrect = true;
          questionScore = q.scoreWeight; // Will be verified in rubric review
        }
      }

      earned += questionScore;
      breakdown.push({ qId: q.id, isCorrect, score: questionScore });
    });

    const percentage = totalMax > 0 ? Math.round((earned / totalMax) * 100) : 0;
    setResultScore({ earned, total: totalMax, percentage, breakdown });
    setIsFinished(true);
    setIsTimerRunning(false);

    if (percentage >= 70) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const isCurrentAnswered = (qId: string) => {
    const a = userAnswers[qId];
    if (a === undefined || a === null || a === '') return false;
    if (Array.isArray(a) && a.length === 0) return false;
    if (typeof a === 'object' && Object.keys(a).length === 0) return false;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header CBT Siswa */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-20">
        <div>
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
            CBT Online Kelas {exam.grade} SD
          </span>
          <h2 className="text-base font-extrabold text-slate-900 mt-1">
            {exam.subject}: {exam.topic}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm shadow-xs">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formatTime(timeLeft)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="ml-1 text-slate-400 hover:text-white cursor-pointer"
              title={isTimerRunning ? 'Jeda waktu' : 'Lanjutkan waktu'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

          <button
            onClick={onBackToPaper}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
          >
            Kembali ke Naskah
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Card (Left 3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      {currentQuestion.type.replace('_', ' ')}
                    </span>
                    <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Tingkat: {currentQuestion.difficulty}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    flagged[currentQuestion.id]
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{flagged[currentQuestion.id] ? 'Ditandai Ragu' : 'Tandai Ragu'}</span>
                </button>
              </div>

              {/* Stimulus Narasi jika ada */}
              {currentQuestion.stimulus && (
                <div className="mb-4 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  <strong className="text-blue-900 block mb-1">📖 Stimulus / Cerita:</strong>
                  {currentQuestion.stimulus}
                </div>
              )}

              {/* Question Text */}
              <div className="text-sm sm:text-base font-bold text-slate-900 mb-6 leading-relaxed whitespace-pre-line">
                {currentQuestion.questionText}
              </div>

              {/* Interactive Inputs based on Question Type */}
              {/* 1. Pilihan Ganda */}
              {currentQuestion.type === 'pilihan_ganda' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = userAnswers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectRadio(currentQuestion.id, opt.id)}
                        className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-800 font-medium pt-0.5">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Pilihan Ganda Kompleks */}
              {currentQuestion.type === 'pilihan_ganda_kompleks' && currentQuestion.complexOptions && (
                <div className="space-y-3">
                  <p className="text-xs text-blue-700 font-semibold mb-2">
                    💡 Pilih semua jawaban yang benar (bisa lebih dari satu):
                  </p>
                  {currentQuestion.complexOptions.map((cOpt) => {
                    const currentSelectedList: string[] = userAnswers[currentQuestion.id] || [];
                    const isChecked = currentSelectedList.includes(cOpt.id);
                    return (
                      <button
                        key={cOpt.id}
                        type="button"
                        onClick={() => handleToggleCheckbox(currentQuestion.id, cOpt.id)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs sm:text-sm text-slate-800 font-medium">
                          {cOpt.statement}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Menjodohkan */}
              {currentQuestion.type === 'menjodohkan' && currentQuestion.matchingPairs && (
                <div className="space-y-3">
                  <p className="text-xs text-blue-700 font-semibold mb-2">
                    💡 Pasangkan setiap premis di kolom kiri dengan respon di kolom kanan:
                  </p>
                  <div className="space-y-2.5">
                    {currentQuestion.matchingPairs.map((pair, pIdx) => {
                      const userMap = userAnswers[currentQuestion.id] || {};
                      const selectedVal = userMap[pair.premiseId] || '';
                      return (
                        <div
                          key={pair.premiseId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/70"
                        >
                          <div className="text-xs sm:text-sm font-semibold text-slate-800">
                            {pIdx + 1}. {pair.premise}
                          </div>
                          <select
                            value={selectedVal}
                            onChange={(e) =>
                              handleSelectMatching(currentQuestion.id, pair.premiseId, e.target.value)
                            }
                            className="px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">-- Pilih Pasangan --</option>
                            {currentQuestion.matchingPairs!.map((m) => (
                              <option key={m.responseId} value={m.responseId}>
                                {m.response}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Isian Singkat */}
              {currentQuestion.type === 'isian_singkat' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ketikkan jawaban singkatmu:
                  </label>
                  <input
                    type="text"
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextInput(currentQuestion.id, e.target.value)}
                    placeholder="Tulis jawaban di sini..."
                    className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              )}

              {/* 5. Uraian & Soal Cerita */}
              {(currentQuestion.type === 'uraian' || currentQuestion.type === 'soal_cerita') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tuliskan uraian dan langkah penyelesaianmu:
                  </label>
                  <textarea
                    rows={5}
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleTextInput(currentQuestion.id, e.target.value)}
                    placeholder="Jelaskan jawaban dan langkah pengerjaanmu secara teratur..."
                    className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                {currentIndex < exam.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={finishQuiz}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selesai & Kumpulkan</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Navigator Sidebar (1 col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Nomor Soal
              </h3>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {exam.questions.map((q, idx) => {
                  const answered = isCurrentAnswered(q.id);
                  const isFlag = flagged[q.id];
                  const isCurrent = currentIndex === idx;

                  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (answered) bgClass = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                  if (isFlag) bgClass = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                  if (isCurrent) bgClass += ' ring-2 ring-blue-600 ring-offset-2';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-lg border text-xs flex items-center justify-center transition cursor-pointer ${bgClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <span>Sudah dijawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span>Ragu-ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                  <span>Belum dijawab</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={finishQuiz}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  Kumpulkan Ujian
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Evaluation & Result Screen */
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-md space-y-8">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Ujian Telah Selesai!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Hasil pengerjaan {exam.subject} Kelas {exam.grade} SD
            </p>

            {/* Score Pill */}
            <div className="my-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                Nilai Akhir
              </div>
              <div className="text-5xl font-black text-blue-900 mt-1">
                {resultScore?.percentage}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-2">
                Skor Diperoleh: <strong>{resultScore?.earned}</strong> dari total{' '}
                <strong>{resultScore?.total}</strong> poin maksimal
              </div>
              <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold bg-white text-emerald-700 border border-emerald-200 shadow-xs">
                {resultScore && resultScore.percentage >= 70
                  ? '🎉 Selamat! Mencapai Kriteria Ketuntasan (KKTP)'
                  : 'Tetap Semangat! Tingkatkan Pemahaman Materi'}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsFinished(false);
                  setUserAnswers({});
                  setTimeLeft(exam.schoolHeader.durationMinutes * 60);
                  setIsTimerRunning(true);
                  setCurrentIndex(0);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ulangi Pengerjaan</span>
              </button>

              <button
                onClick={onBackToPaper}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat Naskah Cetak</span>
              </button>
            </div>
          </div>

          {/* Detailed Review per Question */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Pembahasan & Analisis Hasil Butir Soal
            </h3>

            <div className="space-y-4">
              {exam.questions.map((q) => {
                const uAns = userAnswers[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-800">
                        Nomor {q.number} ({q.type.replace('_', ' ')})
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        Bobot: {q.scoreWeight} Poin
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      {q.questionText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong className="text-slate-500 block mb-0.5">Jawaban Kamu:</strong>
                        <span className="font-semibold text-slate-800">
                          {uAns ? (typeof uAns === 'object' ? JSON.stringify(uAns) : uAns.toString()) : '(Kosong)'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                        <strong className="text-emerald-700 block mb-0.5">Kunci Jawaban:</strong>
                        <span className="font-bold text-emerald-900">
                          {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block mb-0.5">Penjelasan & Pembahasan:</strong>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
