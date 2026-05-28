import { create } from 'zustand';
import { MeetingService, TaskService } from '@/services/api.service';

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  deadline: string;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  summary: string;
  status: 'processing' | 'completed';
}

interface AppState {
  tasks: Task[];
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  processMeeting: (audioBlob: Blob, title: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  tasks: [],
  meetings: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [meetings, tasks] = await Promise.all([
        MeetingService.getAll(),
        TaskService.getAll(),
      ]);
      set({ meetings, tasks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTask: async (task) => {
    try {
      const newTask = await TaskService.create(task);
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
  })),

  processMeeting: async (audioBlob, title) => {
    set({ isLoading: true });
    try {
      const meeting = await MeetingService.processMeeting(audioBlob, title);
      set((state) => ({ 
        meetings: [meeting, ...state.meetings],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
