import { jsPDF } from 'jspdf';

// ── Colour palette ─────────────────────────────────────────────────────────────
const C = {
  black:      [8,   10,  15],
  darkGrey:   [15,  20,  30],
  cardGrey:   [22,  29,  42],
  lineGrey:   [40,  50,  65],
  textLight:  [220, 230, 242],
  textMid:    [148, 163, 184],
  textDim:    [71,  85,  105],
  red:        [255, 45,  85],
  redDim:     [80,  15,  25],
  green:      [0,   220, 120],
  greenDim:   [0,   50,  30],
  amber:      [255, 184, 0],
  amberDim:   [70,  50,  0],
  cyan:       [0,   212, 255],
  cyanDim:    [0,   50,  70],
  white:      [255, 255, 255],
  purple:     [168, 85,  247],
};

function hex(rgb) {
  return `#${rgb.map(v => v.toString(16).padStart(2,'0')).join('')}`;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function setFill(doc, rgb)   { doc.setFillColor(...rgb); }
function setDraw(doc, rgb)   { doc.setDrawColor(...rgb); }
function setColor(doc, rgb)  { doc.setTextColor(...rgb); }

function rect(doc, x, y, w, h, rgb, style = 'F') {
  setFill(doc, rgb);
  doc.rect(x, y, w, h, style);
}

function line(doc, x1, y1, x2, y2, rgb, lw = 0.3) {
  setDraw(doc, rgb);
  doc.setLineWidth(lw);
  doc.line(x1, y1, x2, y2);
}

// Word-wrap text into lines that fit within maxWidth
function wrapText(doc, text, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (doc.getTextWidth(test) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Draw multi-line text, return new Y position
function drawWrapped(doc, text, x, y, maxWidth, lineHeight) {
  const lines = wrapText(doc, text, maxWidth);
  for (const l of lines) {
    doc.text(l, x, y);
    y += lineHeight;
  }
  return y;
}

// ── Status helpers ─────────────────────────────────────────────────────────────
function statusColors(status) {
  if (status === 'flagged')     return { fg: C.red,   bg: C.redDim,   label: 'FLAGGED — AI MANIPULATION DETECTED' };
  if (status === 'verified')    return { fg: C.green, bg: C.greenDim, label: 'VERIFIED AUTHENTIC' };
  return                               { fg: C.amber, bg: C.amberDim, label: 'INCONCLUSIVE — MANUAL REVIEW ADVISED' };
}

// ── Main export ────────────────────────────────────────────────────────────────
export function generateForensicPDF(result, caseId) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;   // page width
  const PH = 297;   // page height
  const M  = 15;    // margin
  const CW = PW - M * 2;  // content width

  const sc = statusColors(result.status);
  const isFlagged  = result.status === 'flagged';
  const isVerified = result.status === 'verified';
  const now        = new Date();

  // ── Page background ──────────────────────────────────────────────────────────
  rect(doc, 0, 0, PW, PH, C.black);

  // ── Top accent bar ───────────────────────────────────────────────────────────
  // Gradient simulation: three overlapping rects fading red→purple→cyan
  rect(doc, 0,  0, PW * 0.45, 3, C.red);
  rect(doc, PW * 0.35, 0, PW * 0.35, 3, C.purple);
  rect(doc, PW * 0.65, 0, PW * 0.4,  3, C.cyan);

  let y = 12;

  // ── Logo row ─────────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.cyan);
  doc.text('AEGIS', M, y);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.textDim);
  doc.text('DIGITAL SAFETY GUARDIAN', M, y + 5);

  // Report type label (top right)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.textMid);
  doc.text('FORENSIC ANALYSIS REPORT', PW - M, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(doc, C.textDim);
  doc.text(`Generated: ${now.toUTCString()}`, PW - M, y + 5, { align: 'right' });

  y += 14;
  line(doc, M, y, PW - M, y, C.lineGrey, 0.4);
  y += 8;

  // ── Case ID banner ───────────────────────────────────────────────────────────
  rect(doc, M, y, CW, 14, C.cardGrey);
  // Left accent
  rect(doc, M, y, 3, 14, sc.fg);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.textDim);
  doc.text('CASE IDENTIFIER', M + 6, y + 4.5);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.white);
  doc.text(caseId, M + 6, y + 10.5);

  // Confidential badge
  rect(doc, PW - M - 42, y + 2.5, 42, 9, [60, 15, 15]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.red);
  doc.text('⚠ CONFIDENTIAL', PW - M - 21, y + 7.8, { align: 'center' });

  y += 20;

  // ── Status verdict card ──────────────────────────────────────────────────────
  rect(doc, M, y, CW, 26, sc.bg);
  // border
  setDraw(doc, sc.fg);
  doc.setLineWidth(0.5);
  doc.rect(M, y, CW, 26, 'S');
  // Left thick accent
  setFill(doc, sc.fg);
  doc.rect(M, y, 4, 26, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, sc.fg);
  doc.text('VERDICT', M + 8, y + 7);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, sc.fg);
  doc.text(sc.label, M + 8, y + 15);

  // Score badge
  rect(doc, PW - M - 38, y + 5, 38, 16, [0,0,0]);
  setDraw(doc, sc.fg);
  doc.setLineWidth(0.5);
  doc.rect(PW - M - 38, y + 5, 38, 16, 'S');
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  setColor(doc, sc.fg);
  doc.text(`${result.score}%`, PW - M - 19, y + 17, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.textDim);
  doc.text('AI PROBABILITY', PW - M - 19, y + 22, { align: 'center' });

  y += 32;

  // ── File metadata grid ────────────────────────────────────────────────────────
  const cols = [
    { label: 'FILENAME',      value: result.filename },
    { label: 'FILE TYPE',     value: result.type || 'Unknown' },
    { label: 'FILE SIZE',     value: result.size },
    { label: 'PLATFORM',      value: result.platform },
    { label: 'SCAN DATE',     value: now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) },
    { label: 'SCAN TIME',     value: now.toLocaleTimeString('en-GB') + ' UTC' },
  ];

  const colW = CW / 3;
  cols.forEach((col, i) => {
    const cx = M + (i % 3) * colW;
    const cy = y + Math.floor(i / 3) * 18;
    rect(doc, cx, cy, colW - 2, 16, C.cardGrey);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, C.textDim);
    doc.text(col.label, cx + 4, cy + 5.5);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, C.textLight);
    // Truncate long values
    const maxW = colW - 10;
    let val = col.value;
    while (val.length > 3 && doc.getTextWidth(val) > maxW) val = val.slice(0, -1);
    if (val !== col.value) val += '…';
    doc.text(val, cx + 4, cy + 12);
  });

  y += 42;

  // ── Section: Forensic Analysis ───────────────────────────────────────────────
  const sectionHeader = (label, accentColor) => {
    rect(doc, M, y, CW, 9, C.cardGrey);
    rect(doc, M, y, 3, 9, accentColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(doc, accentColor);
    doc.text(label, M + 7, y + 6);
    y += 13;
  };

  const forensicBlock = (label, content, accentColor) => {
    sectionHeader(label, accentColor);
    rect(doc, M, y, CW, 1, [0,0,0,0]); // spacer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(doc, C.textMid);
    const newY = drawWrapped(doc, content, M + 2, y, CW - 4, 5);
    y = newY + 5;
    line(doc, M, y, PW - M, y, C.lineGrey, 0.2);
    y += 5;
  };

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, C.white);
  doc.text('FORENSIC ANALYSIS BREAKDOWN', M, y);
  y += 6;
  line(doc, M, y, PW - M, y, C.cyan, 0.5);
  y += 8;

  forensicBlock('01  EXIF METADATA & SCRUB ANALYSIS',   result.forensics.exif,      C.cyan);
  forensicBlock('02  FACIAL BLENDING & GAN DETECTION',  result.forensics.faceBlend, C.purple);
  forensicBlock('03  TEMPORAL CONSISTENCY SCAN',        result.forensics.temporal,  C.cyan);
  forensicBlock('04  HARASSMENT DATABASE QUERY',        result.forensics.database,  C.amber);

  // ── Final verdict block ──────────────────────────────────────────────────────
  sectionHeader('05  FINAL FORENSIC VERDICT', sc.fg);
  rect(doc, M, y, CW, 2, [0,0,0,0]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  setColor(doc, sc.fg);
  const newY = drawWrapped(doc, result.forensics.verdict, M + 2, y, CW - 4, 5.5);
  y = newY + 8;

  // ── Platform reporting guide ─────────────────────────────────────────────────
  if (y < PH - 60) {
    line(doc, M, y, PW - M, y, C.lineGrey, 0.3);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    setColor(doc, C.white);
    doc.text('RECOMMENDED REPORTING ACTIONS', M, y);
    y += 8;

    const steps = [
      ['Instagram',  'Go to post → ⋯ → Report → It\'s inappropriate → Nudity or sexual activity → Submit. Attach this Case ID in the report.'],
      ['WhatsApp',   'Press & hold the message → Report → Report spam. Forward this PDF to local cybercrime helpline or NCII.'],
      ['Snapchat',   'Press & hold snap → Report → Sexually explicit → Submit. Include Case ID in your description.'],
      ['Law Enforcement', 'File a report at your national cybercrime portal. Attach this document as evidence. Case ID: ' + caseId],
    ];

    for (const [platform, instruction] of steps) {
      rect(doc, M, y, CW, 1, [0,0,0,0]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      setColor(doc, C.cyan);
      doc.text(`• ${platform}`, M + 2, y + 5);
      doc.setFont('helvetica', 'normal');
      setColor(doc, C.textMid);
      const ny = drawWrapped(doc, instruction, M + 8, y + 10, CW - 10, 4.5);
      y = ny + 4;
    }
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  const footerY = PH - 14;
  line(doc, 0, footerY - 4, PW, footerY - 4, C.lineGrey, 0.3);
  rect(doc, 0, footerY - 3, PW, 17, C.darkGrey);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, C.textDim);
  doc.text('AEGIS Digital Safety Guardian  ·  Confidential Forensic Report  ·  For authorised use only', M, footerY + 4);
  doc.text(`Case: ${caseId}  ·  Page 1 of 1`, PW - M, footerY + 4, { align: 'right' });

  // Watermark diagonal text
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  setColor(doc, [255,255,255]);
  doc.setGState(doc.GState({ opacity: 0.03 }));
  doc.text('AEGIS FORENSIC', PW / 2, PH / 2, { align: 'center', angle: 45 });
  doc.setGState(doc.GState({ opacity: 1 }));

  // ── Save ─────────────────────────────────────────────────────────────────────
  const safeFilename = result.filename.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  doc.save(`AEGIS_Forensic_Report_${safeFilename}_${caseId}.pdf`);
}
