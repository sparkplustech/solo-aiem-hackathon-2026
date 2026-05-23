export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL: string;
  streak: number;
  focusScore: number;
  totalStudyHours: number;
  lastActive?: any;
}

export interface SummaryNote {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  keyPoints: string[];
  examNotes: string;
  formulas: string[];
  createdAt: any;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizFlashcard {
  front: string;
  back: string;
}

export interface VivaQuestion {
  question: string;
  idealAnswer: string;
}

export interface StudyQuiz {
  id: string;
  ownerId: string;
  title: string;
  questions: QuizQuestion[];
  flashcards: QuizFlashcard[];
  vivaQuestions?: VivaQuestion[];
  score?: number;
  maxScore?: number;
  completed?: boolean;
  createdAt: any;
}

export interface StudyPlan {
  id: string;
  ownerId: string;
  subjects: string[];
  dailySchedule: { time: string; activity: string; notes: string }[];
  revisionPlan: { day: string; subject: string; topics: string; hours: number }[];
  subjectPriorities: { subject: string; priority: "High" | "Medium" | "Low"; reason: string }[];
  weakSubjects?: string[];
  createdAt: any;
}

export interface AcademicAssignment {
  id: string;
  ownerId: string;
  title: string;
  subject: string;
  deadline: string; // ISO yyyy-mm-dd
  progress: number; // 0 - 100
  priority: "High" | "Medium" | "Low";
  createdAt: any;
}

export interface StudyAnalyticsEntry {
  id: string;
  ownerId: string;
  date: string; // yyyy-mm-dd
  hoursStudied: number;
  focusScore: number;
  quizPerformance: number; // percentage
  completedAssignments: number;
}
