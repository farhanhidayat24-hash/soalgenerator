import React, { useState, useEffect } from 'react';
import { ExamPaper, GenerateFormState, QuestionItem, QuestionType } from './types/quiz';
import { examStorage } from './services/storage';
import { Navbar } from './components/Navbar';
import { GeneratorForm } from './components/GeneratorForm';
import { ExamPaperView } from './components/ExamPaperView';
import { InteractiveQuizView } from './components/InteractiveQuizView';
import { QuestionBankView } from './components/QuestionBankView';
import { EditQuestionModal } from './components/EditQuestionModal';
import { printExamPaper } from './utils/exportUtils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'paper' | 'interactive' | 'bank'>('generator');
  const [allExams, setAllExams] = useState<ExamPaper[]>([]);
  const [activeExam, setActiveExam] = useState<ExamPaper | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Question Edit Modal state
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Load stored exams on mount
  useEffect(() => {
    const loaded = examStorage.getAllExams();
    setAllExams(loaded);
    if (loaded.length > 0) {
      setActiveExam(loaded[0]);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Generate Questions handler
  const handleGenerate = async (formData: GenerateFormState) => {
    setIsLoading(true);
    setLoadingStepText('Menghubungi AI Kurikulum SD...');

    const stepTimer = setTimeout(() => {
      setLoadingStepText('Menyusun stimulus cerita & butir soal kearifan lokal...');
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setLoadingStepText('Menghitung kunci jawaban & pedoman penskoran...');
    }, 3200);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.warning ||
          data.error ||
          `Permintaan gagal (HTTP ${response.status}). Pastikan endpoint API tersedia dan konfigurasi Vercel sudah benar.`
        );
      }

      if (!data.success || !data.questions) {
        throw new Error(data.warning || 'Gagal menyusun soal');
      }

      // Calculate summaries
      const questions: QuestionItem[] = data.questions;
      const breakdown: Record<QuestionType, number> = {
        pilihan_ganda: 0,
        pilihan_ganda_kompleks: 0,
        menjodohkan: 0,
        isian_singkat: 0,
        uraian: 0,
        soal_cerita: 0,
      };

      let lotsCount = 0;
      let motsCount = 0;
      let hotsCount = 0;
      let totalScore = 0;

      questions.forEach((q) => {
        if (breakdown[q.type] !== undefined) {
          breakdown[q.type]++;
        }
        if (q.difficulty === 'LOTS') lotsCount++;
        else if (q.difficulty === 'MOTS') motsCount++;
        else if (q.difficulty === 'HOTS') hotsCount++;
        totalScore += q.scoreWeight || 2;
      });

      const newExam: ExamPaper = {
        id: `exam-${Date.now()}`,
        title: `${formData.assessmentName}: ${formData.subject} Kelas ${formData.grade} SD`,
        grade: formData.grade,
        subject: formData.subject,
        topic: formData.topic,
        curriculum: formData.curriculum,
        schoolHeader: {
          schoolName: formData.schoolName,
          district: formData.district,
          assessmentName: formData.assessmentName,
          academicYear: formData.academicYear,
          semester: formData.semester,
          durationMinutes: formData.durationMinutes,
        },
        questions,
        summary: {
          totalQuestions: questions.length,
          breakdown,
          difficultyBreakdown: {
            lots: lotsCount,
            mots: motsCount,
            hots: hotsCount,
          },
          totalScore,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [formData.subject, `Kelas ${formData.grade}`, formData.curriculum],
      };

      // Save to database & update state
      examStorage.saveExam(newExam);
      setAllExams(examStorage.getAllExams());
      setActiveExam(newExam);
      setActiveTab('paper');
      showToast('Paket soal berhasil dibuat dan disimpan otomatis ke Bank Soal!');
    } catch (err: any) {
      console.error('Generate error:', err);
      showToast(err.message || 'Terjadi kendala saat menyusun soal. Silakan coba kembali.', 'error');
    } finally {
      clearTimeout(stepTimer);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStepText('');
    }
  };

  // Save active exam to bank
  const handleSaveToBank = (examToSave: ExamPaper) => {
    examStorage.saveExam(examToSave);
    setAllExams(examStorage.getAllExams());
    showToast('Berhasil menyimpan perubahan paket soal!');
  };

  // Open interactive mode with specific exam
  const handleOpenInteractive = (examToPlay?: ExamPaper) => {
    if (examToPlay) {
      setActiveExam(examToPlay);
    }
    setActiveTab('interactive');
  };

  // Delete exam
  const handleDeleteExam = (id: string) => {
    examStorage.deleteExam(id);
    const updated = examStorage.getAllExams();
    setAllExams(updated);
    if (activeExam?.id === id) {
      setActiveExam(updated.length > 0 ? updated[0] : null);
    }
    showToast('Paket soal telah dihapus dari bank.');
  };

  // Duplicate exam
  const handleDuplicateExam = (id: string) => {
    const copy = examStorage.duplicateExam(id);
    if (copy) {
      setAllExams(examStorage.getAllExams());
      setActiveExam(copy);
      showToast('Salinan paket soal berhasil dibuat!');
    }
  };

  // Export full DB backup JSON
  const handleExportDB = () => {
    const jsonStr = examStorage.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Bank_Soal_SD_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File backup database JSON berhasil diunduh!');
  };

  // Import full DB JSON
  const handleImportDB = (jsonStr: string) => {
    const res = examStorage.importDatabaseJSON(jsonStr);
    if (res.success) {
      const updated = examStorage.getAllExams();
      setAllExams(updated);
      if (updated.length > 0) setActiveExam(updated[0]);
      showToast(`Berhasil merestore ${res.count} paket soal dari file backup!`);
    } else {
      showToast(res.error || 'Gagal memproses file JSON', 'error');
    }
  };

  // Reset to initial sample exams
  const handleResetSamples = () => {
    if (confirm('Kembalikan bank soal ke data standar kurikulum awal?')) {
      examStorage.resetToSampleData();
      const updated = examStorage.getAllExams();
      setAllExams(updated);
      if (updated.length > 0) setActiveExam(updated[0]);
      showToast('Bank soal telah direset ke data contoh kurikulum.');
    }
  };

  // Open edit modal for question
  const handleOpenEditQuestion = (question: QuestionItem) => {
    setEditingQuestion(question);
    setIsEditModalOpen(true);
  };

  // Save edited question
  const handleSaveEditedQuestion = (updatedQ: QuestionItem) => {
    if (!activeExam) return;
    const nextQuestions = activeExam.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
    const updatedExam: ExamPaper = {
      ...activeExam,
      questions: nextQuestions,
      updatedAt: new Date().toISOString(),
    };
    setActiveExam(updatedExam);
    examStorage.saveExam(updatedExam);
    setAllExams(examStorage.getAllExams());
    showToast(`Butir soal nomor ${updatedQ.number} berhasil diperbarui!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white ${
              toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-200" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bankCount={allExams.length}
        hasActiveExam={!!activeExam}
        onQuickPrint={() => printExamPaper()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'generator' && (
          <GeneratorForm
            onGenerate={handleGenerate}
            isLoading={isLoading}
            loadingStepText={loadingStepText}
          />
        )}

        {activeTab === 'paper' && activeExam && (
          <ExamPaperView
            exam={activeExam}
            onSaveToBank={handleSaveToBank}
            onOpenInteractive={() => setActiveTab('interactive')}
            onEditQuestion={handleOpenEditQuestion}
          />
        )}

        {activeTab === 'interactive' && activeExam && (
          <InteractiveQuizView
            exam={activeExam}
            onBackToPaper={() => setActiveTab('paper')}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBankView
            exams={allExams}
            onSelectExam={(e) => {
              setActiveExam(e);
              setActiveTab('paper');
            }}
            onOpenInteractive={(e) => {
              setActiveExam(e);
              setActiveTab('interactive');
            }}
            onDeleteExam={handleDeleteExam}
            onDuplicateExam={handleDuplicateExam}
            onExportDatabase={handleExportDB}
            onImportDatabase={handleImportDB}
            onResetSamples={handleResetSamples}
            onCreateNew={() => setActiveTab('generator')}
          />
        )}
      </main>

      {/* Edit Question Modal */}
      <EditQuestionModal
        question={editingQuestion}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveEditedQuestion}
      />

      {/* Footer (Hidden during print) */}
      <footer className="no-print mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Generator & Bank Soal SD Pintar</strong> — Kurikulum Merdeka & K13 Indonesia
          </div>
          <div className="text-[11px] text-slate-400">
            Mendukung 6 Jenjang SD • 6 Tipe Soal • LOTS/MOTS/HOTS • Ekspor PDF & Word • CBT Online
          </div>
        </div>
      </footer>
    </div>
  );
}
