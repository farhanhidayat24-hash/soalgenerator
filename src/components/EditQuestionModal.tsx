import React, { useState } from 'react';
import { QuestionItem, DifficultyLevel } from '../types/quiz';
import { X, Save, AlertCircle } from 'lucide-react';

interface EditQuestionModalProps {
  question: QuestionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedQuestion: QuestionItem) => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  question,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !question) return null;

  const [questionText, setQuestionText] = useState(question.questionText);
  const [stimulus, setStimulus] = useState(question.stimulus || '');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(question.difficulty);
  const [correctAnswer, setCorrectAnswer] = useState<string>(
    Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer
  );
  const [explanation, setExplanation] = useState(question.explanation);
  const [scoreWeight, setScoreWeight] = useState(question.scoreWeight);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: QuestionItem = {
      ...question,
      questionText,
      stimulus: stimulus.trim() || undefined,
      difficulty,
      correctAnswer: question.type === 'pilihan_ganda_kompleks' && correctAnswer.includes(',')
        ? correctAnswer.split(',').map((s) => s.trim())
        : correctAnswer,
      explanation,
      scoreWeight: Number(scoreWeight) || 2,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Edit Butir Soal Nomor {question.number}
            </h3>
            <p className="text-xs text-slate-500">
              Tipe: {question.type.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tingkat Kesulitan & Bobot Skor
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="LOTS">LOTS (Mengingat / Memahami)</option>
                <option value="MOTS">MOTS (Penerapan / Aplikasi)</option>
                <option value="HOTS">HOTS (Analisis / Bernalar Kritis)</option>
              </select>

              <input
                type="number"
                min={1}
                max={20}
                value={scoreWeight}
                onChange={(e) => setScoreWeight(parseInt(e.target.value) || 2)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Bobot Skor"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Stimulus / Teks Cerita (Opsional)
            </label>
            <textarea
              rows={3}
              value={stimulus}
              onChange={(e) => setStimulus(e.target.value)}
              placeholder="Cerita pengantar, data tabel, atau ilustrasi kontekstual..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kalimat Pertanyaan
            </label>
            <textarea
              rows={3}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kunci Jawaban
            </label>
            <input
              type="text"
              required
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pembahasan & Langkah Penyelesaian
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
