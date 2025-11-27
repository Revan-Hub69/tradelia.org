// Global type definitions for Tradelia

export interface User {
  id: string;
  email?: string;
  role?: string;
  created_at?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order: number;
}

export interface Progress {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  progress_percentage: number;
  last_accessed: string;
}
