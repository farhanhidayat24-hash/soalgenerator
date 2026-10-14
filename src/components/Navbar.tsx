import React from 'react';
import { 
  FileText, 
  PlayCircle, 
  Database, 
  Sparkles, 
  Printer, 
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'paper' | 'interactive' | 'bank';
  setActiveTab: (tab: 'generator' | 'paper' | 'interactive' | 'bank') => void;
  bankCount: number;
  hasActiveExam: boolean;
  onQuickPrint?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bankCount,
  hasActiveExam,
  onQuickPrint,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('generator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
                  SD Pintar
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-700">
                  Kurikulum Merdeka
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Generator & Bank Soal Kelas 1-6 SD
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Generator Soal</span>
            </button>

            <button
              onClick={() => setActiveTab('paper')}
              disabled={!hasActiveExam}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !hasActiveExam
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : activeTab === 'paper'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Lembar Ujian (Teks/Cetak)</span>
            </button>

            <button
              onClick={() => setActiveTab('interactive')}
              disabled={!hasActiveExam}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !hasActiveExam
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : activeTab === 'interactive'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>HTML Interaktif (CBT Siswa)</span>
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bank'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-purple-600" />
              <span>Bank Soal</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-700 font-bold">
                {bankCount}
              </span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {hasActiveExam && activeTab === 'paper' && onQuickPrint && (
              <button
                onClick={onQuickPrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cetak PDF</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('bank')}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bank ({bankCount})</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex flex-col items-center py-1 px-2 font-medium ${
              activeTab === 'generator' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            Generator
          </button>
          <button
            onClick={() => setActiveTab('paper')}
            disabled={!hasActiveExam}
            className={`flex flex-col items-center py-1 px-2 font-medium ${
              !hasActiveExam ? 'text-slate-300' : activeTab === 'paper' ? 'text-blue-600 font-bold' : 'text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            Naskah
          </button>
          <button
            onClick={() => setActiveTab('interactive')}
            disabled={!hasActiveExam}
            className={`flex flex-col items-center py-1 px-2 font-medium ${
              !hasActiveExam ? 'text-slate-300' : activeTab === 'interactive' ? 'text-emerald-600 font-bold' : 'text-slate-600'
            }`}
          >
            <PlayCircle className="w-4 h-4 mb-0.5" />
            CBT Siswa
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex flex-col items-center py-1 px-2 font-medium ${
              activeTab === 'bank' ? 'text-purple-600 font-bold' : 'text-slate-600'
            }`}
          >
            <Database className="w-4 h-4 mb-0.5" />
            Bank ({bankCount})
          </button>
        </div>
      </div>
    </header>
  );
};
