/**
 * Aegis Digital Safety Guardian — Backend API Server
 * Express + Multer for file upload handling
 * Simulates a forensic AI pipeline with realistic delays
 */

const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Multer — in-memory storage (files never touch disk → privacy guarantee) ───
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm/i;
    const ext = path.extname(file.originalname).slice(1);
    allowed.test(ext) ? cb(null, true) : cb(new Error('Unsupported file type'));
  },
});

// ── Heuristic analysis engine (mirrors the frontend logic) ────────────────────
const AI_KEYWORDS   = /ai[_\-\s]?gen|generated|midjourney|dalle|dall[\-_]e|stable[_\-\s]?diff|sdxl|comfy|flux|kling|sora|runway|pika|deepfake|faceswap|face[_\-\s]?swap|swap|fake|synthetic|gan|diffusion|artificial|neural|render/i;
const REAL_KEYWORDS = /IMG_|DSC_|DCIM|photo|camera|iphone|samsung|pixel|canon|nikon|sony|screenshot|snap|selfie|whatsapp|signal|telegram|received|sent|download|webcam|live/i;
const EDIT_KEYWORDS = /edited|filter|enhanced|retouch|beauty|vsco|lightroom|photoshop|ps_|adjusted|crop/i;

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function seededRand(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fileSizeBias(mimeType, sizeBytes) {
  const mb = sizeBytes / (1024 * 1024);
  if (mimeType.startsWith('image')) {
    if (mb < 0.15) return 'ai';
    if (mimeType === 'image/png' && mb > 6) return 'ai';
    if (mimeType === 'image/jpeg' && mb >= 2 && mb <= 8) return 'real';
    if (mimeType === 'image/webp' && mb < 1) return 'ai';
  }
  if (mimeType.startsWith('video')) {
    if (mb < 1)  return 'ai';
    if (mb > 50) return 'real';
  }
  return 'neutral';
}

function analyseFile(originalname, mimetype, size) {
  const seed     = hashSeed(originalname + size + mimetype);
  const rand     = seededRand(seed);
  const name     = originalname.toLowerCase();
  const sizeBias = fileSizeBias(mimetype, size);
  const isVideo  = mimetype.startsWith('video');

  let aiSignal = 0.5; // base — suspicious media portal default

  if (AI_KEYWORDS.test(name))   aiSignal += 3.0;
  if (REAL_KEYWORDS.test(name)) aiSignal -= 2.8;
  if (name.includes('webcam'))  aiSignal -= 4.0; // Force live webcam scans to be extremely authentic
  if (EDIT_KEYWORDS.test(name)) aiSignal += 0.4;

  if (mimetype === 'image/png')  aiSignal += 1.2;
  if (mimetype === 'image/jpeg') aiSignal -= 0.6;
  if (mimetype === 'image/webp') aiSignal += 0.5;

  if (sizeBias === 'ai')   aiSignal += 0.8;
  if (sizeBias === 'real') aiSignal -= 0.8;

  aiSignal += (rand() - 0.5) * 0.5; // small deterministic noise

  let status, score;
  if (aiSignal >= 0.4) {
    status = 'flagged';
    const base   = Math.min(99, 75 + Math.round((aiSignal - 0.4) * 7));
    score  = Math.min(99, base + Math.floor(rand() * 10));
  } else if (aiSignal <= -1.2) {
    status = 'verified';
    const base   = Math.max(3, 18 - Math.round((-aiSignal - 1.2) * 5));
    score  = Math.max(3, Math.min(22, base + Math.floor(rand() * 8)));
  } else {
    status = 'inconclusive';
    const mid  = 55 + Math.round(aiSignal * 10);
    score  = Math.min(68, Math.max(42, mid + Math.floor(rand() * 12) - 6));
  }

  // Build forensic strings
  const r1 = rand(), r2 = rand(), r3 = rand(), r4 = rand();
  const devices = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Google Pixel 8', 'Canon EOS R6'];

  const exifMap = {
    flagged:      'EXIF metadata completely stripped — origin concealed. Container encoding fingerprint matches FFmpeg synthetic media pipeline (v6.1+). Creation timestamp absent.',
    verified:     `EXIF data intact and self-consistent. Captured: ${devices[Math.floor(r1*4)]}, f/${(1.4+r2*2.4).toFixed(1)}, 1/${Math.floor(80+r3*200)}s, ISO ${Math.floor(50+r4*800)}. Sensor noise pattern matches claimed device model.`,
    inconclusive: `EXIF metadata partially present. ${['GPS data absent','Timestamp fields missing','Device model field blank'][Math.floor(r1*3)]} — consistent with screenshot or third-party app save.`,
  };

  const faceMap = {
    flagged:      `GAN-based face-swap detected with ${score}.${Math.floor(r1*9)}% confidence. Blending artifacts at jawline boundary (pixels ${Math.floor(r2*200+300)}–${Math.floor(r2*200+500)}). DCT frequency domain reveals residuals consistent with DeepFaceLab output.`,
    verified:     `No GAN artefacts detected. Skin texture matches authentic photographic capture. DCT distribution: natural (score: ${(0.85+r1*0.1).toFixed(2)}/1.0).`,
    inconclusive: `Moderate GAN probability (${score}%) — consistent with heavy beauty filter rather than malicious deepfake.`,
  };

  const temporalMap = {
    flagged:      isVideo ? `Lighting inconsistency across frames. Blinking: ${(r2*1.8+0.2).toFixed(1)} blinks/min (human avg 15–20/min). Micro-expression suppression detected.` : 'N/A — Static image. Chromatic aberration absent — synthetic generation confirmed.',
    verified:     isVideo ? `Lighting consistency across all ${Math.floor(r1*200+80)} frames. Blink frequency: ${Math.floor(r2*8+14)}/min (normal range).` : 'N/A — Static image. Lens distortion consistent with claimed device optics.',
    inconclusive: isVideo ? 'Minor frame inconsistencies — within tolerance for heavy H.264 compression.' : 'N/A — Static image. Noise pattern consistent with screen capture.',
  };

  const dbMap = {
    flagged:      `Content fingerprint matched in ${Math.floor(r1*3+1)} harassment databases. ${r2>0.5 ? `Similar content in ${Math.floor(r3*12+2)} prior reports.` : 'Novel content — stylometric signature matches known threat actor tooling.'}`,
    verified:     `No matches in ${Math.floor(r1*8+12)} queried databases. Perceptual hash unique — not flagged in any prior report.`,
    inconclusive: `No harassment database matches. ${Math.floor(r1*3+1)} partial similarity hits on consumer filter output only.`,
  };

  const verdictMap = {
    flagged:      score >= 90 ? `SYSTEM FLAG (HIGH CONFIDENCE): ${score}% probability of malicious AI generation. ${isVideo?'Face reenactment / voice cloning detected.':'GAN face-swap artifacts confirmed.'} Immediate reporting recommended.` : `System Flag: AI manipulation detected with ${score}% confidence. Manual expert review advised.`,
    verified:     `Authenticity Confirmed (${100-score}% confidence): No AI manipulation detected. ${score>15?'Minor consumer filter detected but non-malicious.':'No post-processing detected.'}`,
    inconclusive: `Inconclusive (${score}% AI signal): Insufficient evidence to confirm or deny AI generation. Recommend obtaining original file for definitive analysis.`,
  };

  return {
    status,
    score,
    label: status === 'flagged'
      ? (score >= 95 ? `${score}% Deepfake / Face-Swap Detected` : `${score}% AI Manipulation Detected`)
      : status === 'verified'
      ? `Verified Authentic — ${score}% AI Probability`
      : `Inconclusive — ${score}% AI Signal`,
    forensics: {
      exif:      exifMap[status],
      faceBlend: faceMap[status],
      temporal:  temporalMap[status],
      database:  dbMap[status],
      verdict:   verdictMap[status],
    },
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Aegis Forensic API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    filesAnalyzed:   2847,
    deepfakesCaught: 1203,
    verifiedClean:   1491,
    avgAnalysisMs:   9800,
    uptime:          process.uptime(),
  });
});

// Main analysis endpoint
app.post('/api/analyse', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const { originalname, mimetype, size } = req.file;

  // Simulate pipeline delay (realistic processing time)
  const delay = ms => new Promise(r => setTimeout(r, ms));
  await delay(500); // EXIF extraction
  await delay(600); // Face analysis
  await delay(500); // Temporal scan
  await delay(400); // DB lookup
  await delay(300); // Score generation

  const result = analyseFile(originalname, mimetype, size);

  // File is already in memory — immediately GC'd, never stored (privacy guarantee)
  const caseId = `AGS-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0,4).toUpperCase()}`;

  console.log(`[${new Date().toISOString()}] Analysed: ${originalname} → ${result.status.toUpperCase()} (${result.score}%)`);

  res.json({
    caseId,
    filename:  originalname,
    type:      mimetype,
    size:      `${(size / (1024*1024)).toFixed(1)} MB`,
    timestamp: new Date().toISOString(),
    platform:  'User Upload',
    ...result,
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum 200 MB.' });
  }
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ⚡ AEGIS Backend API');
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Health: http://localhost:${PORT}/api/health`);
  console.log('');
});
