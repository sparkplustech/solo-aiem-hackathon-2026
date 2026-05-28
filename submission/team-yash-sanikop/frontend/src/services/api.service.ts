import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const MeetingService = {
  async getAll() {
    const response = await api.get('/meetings');
    return response.data;
  },

  async processMeeting(audioBlob: Blob, title: string) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'meeting.wav');
    formData.append('title', title);

    const response = await api.post('/meetings/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};

export const TaskService = {
  async getAll() {
    const response = await api.get('/tasks');
    return response.data;
  },

  async create(task: any) {
    const response = await api.post('/tasks', task);
    return response.data;
  }
};
