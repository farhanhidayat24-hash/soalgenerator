import { ExamPaper } from '../types/quiz';
import jsPDF from 'jspdf';

// Helper to trigger browser print dialog with styling
export function printExamPaper() {
  window.print();
}

// Generate standalone HTML file for students or offline review
export function exportInteractiveHTML(exam: ExamPaper): void {
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${exam.title} - Ujian Interaktif SD</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #1e293b; }
  </style>
</head>
<body class="p-4 md:p-8">
  <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 sm:p-8">
      <div class="text-xs uppercase tracking-widest font-semibold text-blue-200">${exam.schoolHeader.district}</div>
      <h1 class="text-2xl sm:text-3xl font-extrabold mt-1">${exam.schoolHeader.schoolName}</h1>
      <p class="text-blue-100 font-medium text-lg mt-1">${exam.schoolHeader.assessmentName}</p>
      
      <div class="mt-4 pt-4 border-t border-blue-500/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div><span class="text-blue-200">Mata Pelajaran:</span> <strong class="block">${exam.subject}</strong></div>
        <div><span class="text-blue-200">Kelas / Fase:</span> <strong class="block">Kelas ${exam.grade} SD</strong></div>
        <div><span class="text-blue-200">Waktu:</span> <strong class="block">${exam.schoolHeader.durationMinutes} Menit</strong></div>
        <div><span class="text-blue-200">Total Soal:</span> <strong class="block">${exam.questions.length} Butir</strong></div>
      </div>
    </div>

    <!-- Petunjuk -->
    <div class="bg-amber-50 border-b border-amber-200 p-4 text-sm text-amber-900 flex items-start gap-3">
      <div class="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
      <div>
        <strong>Petunjuk Pengerjaan:</strong> Jawablah pertanyaan di bawah ini dengan teliti. Klik tombol "Periksa Hasil" di bagian bawah untuk melihat skor dan pembahasan kunci jawaban.
      </div>
    </div>

    <!-- Questions Container -->
    <div class="p-6 sm:p-8 space-y-8" id="quiz-container">
      ${exam.questions.map((q, idx) => `
        <div class="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition question-block" data-qid="${q.id}">
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Soal Nomor ${q.number}
            </span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              q.difficulty === 'HOTS' ? 'bg-red-100 text-red-700' :
              q.difficulty === 'MOTS' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }">
              Tingkat: ${q.difficulty} (${q.scoreWeight} Poin)
            </span>
          </div>

          ${q.stimulus ? `
            <div class="p-4 mb-4 rounded-lg bg-blue-50/60 border border-blue-100 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
              <strong class="text-blue-900 block mb-1">📖 Stimulus / Narasi:</strong>
              ${q.stimulus}
            </div>
          ` : ''}

          <div class="text-base font-semibold text-slate-900 mb-4 whitespace-pre-line">
            ${q.questionText}
          </div>

          <!-- Options Render based on type -->
          ${q.type === 'pilihan_ganda' && q.options ? `
            <div class="space-y-2">
              ${q.options.map(opt => `
                <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 cursor-pointer transition">
                  <input type="radio" name="ans-${q.id}" value="${opt.id}" class="w-4 h-4 text-blue-600">
                  <span class="font-bold text-slate-700 w-6">${opt.label}.</span>
                  <span class="text-slate-800 text-sm">${opt.text}</span>
                </label>
              `).join('')}
            </div>
          ` : ''}

          ${q.type === 'pilihan_ganda_kompleks' && q.complexOptions ? `
            <div class="space-y-2">
              ${q.complexOptions.map(cOpt => `
                <label class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 cursor-pointer transition">
                  <input type="checkbox" name="ans-${q.id}" value="${cOpt.id}" class="w-4 h-4 text-blue-600 mt-1">
                  <span class="text-slate-800 text-sm leading-relaxed">${cOpt.statement}</span>
                </label>
              `).join('')}
            </div>
          ` : ''}

          ${q.type === 'isian_singkat' ? `
            <div class="mt-2">
              <input type="text" name="ans-${q.id}" placeholder="Ketikkan jawaban singkat di sini..." class="w-full sm:w-80 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            </div>
          ` : ''}

          ${(q.type === 'uraian' || q.type === 'soal_cerita') ? `
            <div class="mt-2">
              <textarea name="ans-${q.id}" rows="4" placeholder="Tuliskan uraian dan langkah pengerjaan kamu secara lengkap di sini..." class="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>
          ` : ''}

          ${q.type === 'menjodohkan' && q.matchingPairs ? `
            <div class="mt-3 overflow-x-auto">
              <table class="w-full text-sm border-collapse border border-slate-200 bg-white rounded-lg">
                <thead>
                  <tr class="bg-slate-100 text-slate-700">
                    <th class="border border-slate-200 p-2 text-left">Pernyataan (Premis)</th>
                    <th class="border border-slate-200 p-2 text-left">Pasangan Jawaban</th>
                  </tr>
                </thead>
                <tbody>
                  ${q.matchingPairs.map((pair, pIdx) => `
                    <tr>
                      <td class="border border-slate-200 p-2.5 font-medium">${pIdx + 1}. ${pair.premise}</td>
                      <td class="border border-slate-200 p-2.5">
                        <select name="ans-${q.id}-${pair.premiseId}" class="w-full p-2 border border-slate-200 rounded text-sm bg-slate-50">
                          <option value="">-- Pilih Pasangan --</option>
                          ${q.matchingPairs!.map(m => `<option value="${m.responseId}">${m.response}</option>`).join('')}
                        </select>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Pembahasan (Hidden by default, shown upon check) -->
          <div id="exp-${q.id}" class="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 hidden">
            <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Kunci Jawaban & Pembahasan:</div>
            <div class="text-sm text-slate-800 font-medium whitespace-pre-line mb-1">
              <strong>Kunci:</strong> ${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
            </div>
            <div class="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              ${q.explanation}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Footer Controls -->
    <div class="p-6 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
      <div id="result-summary" class="text-sm font-semibold text-slate-700">
        Silakan isi seluruh jawaban lalu klik tombol periksa.
      </div>
      <button onclick="checkAnswers()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer">
        Periksa Kunci & Pembahasan
      </button>
    </div>
  </div>

  <script>
    function checkAnswers() {
      const expBlocks = document.querySelectorAll('[id^="exp-"]');
      expBlocks.forEach(b => b.classList.remove('hidden'));
      document.getElementById('result-summary').innerHTML = '✅ Seluruh kunci jawaban dan penjelasan telah dibuka di bawah setiap butir soal!';
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}_Interaktif.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate Word (.doc) format
export function exportToWordDoc(exam: ExamPaper): void {
  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${exam.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; }
        .kop-header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 15px; }
        .kop-district { font-size: 12pt; text-transform: uppercase; font-weight: bold; }
        .kop-school { font-size: 16pt; font-weight: bold; text-transform: uppercase; }
        .kop-address { font-size: 10pt; font-style: italic; }
        .identitas-table { width: 100%; border: none; margin-bottom: 15px; font-size: 11pt; }
        .identitas-table td { padding: 3px; }
        .petunjuk-box { border: 1px solid #000; padding: 8px; margin-bottom: 20px; font-size: 10pt; }
        .soal-item { margin-bottom: 16px; }
        .stimulus { background: #f0f0f0; border-left: 3px solid #000; padding: 6px; margin-bottom: 8px; font-style: italic; }
        .option-item { margin-left: 20px; margin-top: 2px; }
        .kunci-section { page-break-before: always; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="kop-header">
        <div class="kop-district">${exam.schoolHeader.district}</div>
        <div class="kop-school">${exam.schoolHeader.schoolName}</div>
        <div class="kop-district" style="font-size: 12pt; margin-top: 5px;">${exam.schoolHeader.assessmentName}</div>
        <div class="kop-address">Tahun Ajaran: ${exam.schoolHeader.academicYear} | Semester: ${exam.schoolHeader.semester}</div>
      </div>

      <table class="identitas-table">
        <tr>
          <td width="20%"><strong>Mata Pelajaran</strong></td>
          <td width="30%">: ${exam.subject}</td>
          <td width="20%"><strong>Hari / Tanggal</strong></td>
          <td width="30%">: ..............................</td>
        </tr>
        <tr>
          <td><strong>Kelas / Fase</strong></td>
          <td>: Kelas ${exam.grade} SD</td>
          <td><strong>Waktu</strong></td>
          <td>: ${exam.schoolHeader.durationMinutes} Menit</td>
        </tr>
        <tr>
          <td><strong>Nama Siswa</strong></td>
          <td>: ..............................</td>
          <td><strong>Nomor Absen</strong></td>
          <td>: ..............................</td>
        </tr>
      </table>

      <div class="petunjuk-box">
        <strong>PETUNJUK UMUM:</strong>
        <ol style="margin-top: 4px; padding-left: 20px;">
          <li>Berdoalah sebelum mengerjakan soal.</li>
          <li>Tuliskan identitasmu dengan jelas dan rapi pada lembar jawaban.</li>
          <li>Kerjakan soal yang kamu anggap mudah terlebih dahulu.</li>
          <li>Periksa kembali pekerjaanmu sebelum diserahkan kepada pengawas ujian.</li>
        </ol>
      </div>

      <div class="soal-container">
        ${exam.questions.map(q => `
          <div class="soal-item">
            <p><strong>${q.number}.</strong> [${q.type.replace('_', ' ').toUpperCase()} - ${q.difficulty}]</p>
            ${q.stimulus ? `<div class="stimulus">${q.stimulus}</div>` : ''}
            <p>${q.questionText}</p>
            ${q.options ? q.options.map(opt => `<div class="option-item">${opt.label}. ${opt.text}</div>`).join('') : ''}
            ${q.complexOptions ? q.complexOptions.map(co => `<div class="option-item">[   ] ${co.statement}</div>`).join('') : ''}
            ${q.matchingPairs ? `
              <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 5px;">
                <tr><th style="padding: 4px;">Pernyataan</th><th style="padding: 4px;">Pilihan Pasangan</th></tr>
                ${q.matchingPairs.map(mp => `<tr><td style="padding: 4px;">${mp.premise}</td><td style="padding: 4px;">( ... ) ${mp.response}</td></tr>`).join('')}
              </table>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="kunci-section">
        <h2 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px;">KUNCI JAWABAN & PEDOMAN PENSKORAN</h2>
        <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11pt;">
          <tr style="background: #e2e8f0;">
            <th width="8%" style="padding: 6px;">No</th>
            <th width="15%" style="padding: 6px;">Tipe</th>
            <th width="30%" style="padding: 6px;">Kunci Jawaban</th>
            <th width="37%" style="padding: 6px;">Pembahasan / Rubrik</th>
            <th width="10%" style="padding: 6px;">Bobot</th>
          </tr>
          ${exam.questions.map(q => `
            <tr>
              <td style="padding: 6px; text-align: center;">${q.number}</td>
              <td style="padding: 6px;">${q.type}</td>
              <td style="padding: 6px;"><strong>${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</strong></td>
              <td style="padding: 6px;">${q.explanation}</td>
              <td style="padding: 6px; text-align: center;">${q.scoreWeight}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Direct jsPDF quick download generator
export function exportToPDFDirect(exam: ExamPaper): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // Header Kop
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(exam.schoolHeader.district.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(14);
  doc.text(exam.schoolHeader.schoolName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;

  doc.setFontSize(11);
  doc.text(exam.schoolHeader.assessmentName, pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Tahun Ajaran: ${exam.schoolHeader.academicYear} | Semester: ${exam.schoolHeader.semester}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  // Double horizontal line
  doc.setLineWidth(0.8);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 1;
  doc.setLineWidth(0.3);
  doc.line(15, currentY, pageWidth - 15, currentY);
  currentY += 6;

  // Metadata Table Info
  doc.setFontSize(9);
  doc.text(`Mata Pelajaran : ${exam.subject}`, 15, currentY);
  doc.text(`Kelas / Semester : Kelas ${exam.grade} SD / ${exam.schoolHeader.semester}`, 110, currentY);
  currentY += 5;
  doc.text(`Topik / Materi : ${exam.topic}`, 15, currentY);
  doc.text(`Alokasi Waktu   : ${exam.schoolHeader.durationMinutes} Menit`, 110, currentY);
  currentY += 8;

  // Questions loop
  exam.questions.forEach((q) => {
    // Check page break
    if (currentY > 260) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`No. ${q.number} [${q.type.replace('_', ' ').toUpperCase()} - ${q.difficulty}] (${q.scoreWeight} Poin)`, 15, currentY);
    currentY += 5;

    if (q.stimulus) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      const stimulusLines = doc.splitTextToSize(`Stimulus: ${q.stimulus}`, pageWidth - 30);
      doc.text(stimulusLines, 15, currentY);
      currentY += stimulusLines.length * 4 + 2;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const qLines = doc.splitTextToSize(q.questionText, pageWidth - 30);
    doc.text(qLines, 15, currentY);
    currentY += qLines.length * 4 + 2;

    if (q.options && q.type === 'pilihan_ganda') {
      q.options.forEach((opt) => {
        if (currentY > 275) {
          doc.addPage();
          currentY = 15;
        }
        doc.text(`${opt.label}. ${opt.text}`, 20, currentY);
        currentY += 4.5;
      });
    }

    if (q.complexOptions && q.type === 'pilihan_ganda_kompleks') {
      q.complexOptions.forEach((co) => {
        if (currentY > 275) {
          doc.addPage();
          currentY = 15;
        }
        const stmtLines = doc.splitTextToSize(`[   ]  ${co.statement}`, pageWidth - 35);
        doc.text(stmtLines, 20, currentY);
        currentY += stmtLines.length * 4.5;
      });
    }

    if (q.matchingPairs && q.type === 'menjodohkan') {
      q.matchingPairs.forEach((mp, mIdx) => {
        if (currentY > 275) {
          doc.addPage();
          currentY = 15;
        }
        doc.text(`${mIdx + 1}. ${mp.premise}  --->  ( ... ) ${mp.response}`, 20, currentY);
        currentY += 4.5;
      });
    }

    currentY += 4;
  });

  // Save PDF
  doc.save(`${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}
