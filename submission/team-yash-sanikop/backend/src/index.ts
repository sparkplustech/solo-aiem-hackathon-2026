import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { AIService } from './services/ai.service';
import { DBService } from './services/db.service';
import multer from 'multer';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// --- Routes ---

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'SyncOS API', ai: 'Gemini-Native' });
});

app.get('/api/meetings', async (req: Request, res: Response) => {
  try {
    const meetings = await DBService.getMeetings();
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

app.get('/api/tasks', async (req: Request, res: Response) => {
  try {
    const tasks = await DBService.getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * Direct Audio Ingestion & Gemini Processing
 */
app.post('/api/meetings/process', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

    // Process using Gemini Multimodal (Transcription + Analysis in one pass)
    const analysis = await AIService.processAudioMeeting(
      req.file.buffer, 
      req.file.mimetype || 'audio/wav'
    );

    // Save to Supabase
    const meeting = await DBService.saveMeeting({
      title: req.body.title || 'Untitled Meeting',
      ...analysis,
      status: 'completed'
    });

    res.json(meeting);
  } catch (error: any) {
    console.error('Gemini Processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process meeting with Gemini' });
  }
});

// --- Real-time ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Gemini-Native SyncOS Server running on port ${PORT}`);
});
