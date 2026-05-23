import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const DBService = {
  /**
   * Meetings
   */
  async getMeetings() {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase error fetching meetings:", error);
      return [];
    }
    return data || [];
  },

  async saveMeeting(meeting: any) {
    const { data, error } = await supabase
      .from('meetings')
      .insert([meeting])
      .select();
    
    if (error) {
      console.error("Supabase error saving meeting:", error);
      throw error;
    }

    // Auto-create tasks in the tasks table if Gemini extracted action items
    if (meeting.actionItems && Array.isArray(meeting.actionItems)) {
      const tasksToInsert = meeting.actionItems.map((item: any) => ({
        title: item.task,
        assignee: item.owner,
        priority: (['low', 'medium', 'high'].includes(item.priority?.toLowerCase()) ? item.priority.toLowerCase() : 'medium'),
        status: 'todo',
        deadline: item.deadline
      }));

      if (tasksToInsert.length > 0) {
        await supabase.from('tasks').insert(tasksToInsert);
      }
    }

    return data ? data[0] : null;
  },

  /**
   * Tasks
   */
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error("Supabase error fetching tasks:", error);
      return [];
    }
    return data || [];
  },

  async createTask(task: any) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select();
    if (error) throw error;
    return data ? data[0] : null;
  },

  async updateTaskStatus(taskId: string, status: string) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select();
    if (error) throw error;
    return data ? data[0] : null;
  }
};
