
import { apiClient } from '../lib/api-client';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters, TaskStats } from '../types';

export const taskService = {
  // 🚨 IMPORTANT: These function signatures must match your backend endpoints
  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filters?.isCompleted !== undefined) {
      params.append('completed', filters.isCompleted.toString());
    }
    if (filters?.priority) {
      params.append('priority', filters.priority);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const query = params.toString();
    return apiClient.get<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  async getTask(id: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`);
  },

  async createTask(input: CreateTaskRequest): Promise<Task> {
    return apiClient.post<Task>('/tasks', input);
  },

  async updateTask(id: string, input: UpdateTaskRequest): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, input);
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },

  async getTaskStats(): Promise<TaskStats> {
    return apiClient.get<TaskStats>('/tasks/stats');
  },
};