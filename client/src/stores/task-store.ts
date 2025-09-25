import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { taskService } from '../services/task.services';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters, TaskStats } from '../types';

interface TaskState {
  tasks: Task[];
  selectedTasks: Set<string>;
  filters: TaskFilters;
  stats: TaskStats | null;
  isLoading: boolean;
  error: string | null;
}

interface TaskActions {
  // Data fetching
  fetchTasks: () => Promise<void>;
  fetchTaskStats: () => Promise<void>;
  
  // CRUD operations
  createTask: (input: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  
  // Optimistic updates
  toggleTaskOptimistic: (id: string) => void;
  
  // Selection
  selectTask: (id: string) => void;
  deselectTask: (id: string) => void;
  clearSelection: () => void;
  
  // Filters
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  
  // Utilities
  setError: (error: string | null) => void;
}

export type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      // State
      tasks: [],
      selectedTasks: new Set(),
      filters: {},
      stats: null,
      isLoading: false,
      error: null,

      // Data fetching
      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const tasks = await taskService.getTasks(get().filters);
          set({ tasks, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
          set({ error: errorMessage, isLoading: false });
        }
      },

      fetchTaskStats: async () => {
        try {
          const stats = await taskService.getTaskStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to fetch task stats:', error);
        }
      },

      // CRUD operations
      createTask: async (input) => {
        set({ isLoading: true, error: null });
        
        try {
          const newTask = await taskService.createTask(input);
          
          set((state) => ({
            tasks: [newTask, ...state.tasks],
            isLoading: false,
          }));
          
          // Refresh stats
          get().fetchTaskStats();
          
          return newTask;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateTask: async (id, input) => {
        set({ error: null });
        
        try {
          const updatedTask = await taskService.updateTask(id, input);
          
          set((state) => ({
            tasks: state.tasks.map(task => 
              task.id === id ? updatedTask : task
            ),
          }));
          
          // Refresh stats if completion status changed
          if ('isCompleted' in input) {
            get().fetchTaskStats();
          }
          
          return updatedTask;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
          set({ error: errorMessage });
          throw error;
        }
      },

      deleteTask: async (id) => {
        set({ error: null });
        
        try {
          await taskService.deleteTask(id);
          
          set((state) => ({
            tasks: state.tasks.filter(task => task.id !== id),
            selectedTasks: new Set([...state.selectedTasks].filter(taskId => taskId !== id)),
          }));
          
          // Refresh stats
          get().fetchTaskStats();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Optimistic updates
      toggleTaskOptimistic: (id) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id 
              ? { ...task, isCompleted: !task.isCompleted }
              : task
          ),
        }));
        
        // Sync with server
        const task = get().tasks.find(t => t.id === id);
        if (task) {
          get().updateTask(id, { isCompleted: task.isCompleted }).catch(() => {
            // Revert on error
            get().toggleTaskOptimistic(id);
          });
        }
      },

      // Selection management
      selectTask: (id) => {
        set((state) => ({
          selectedTasks: new Set([...state.selectedTasks, id]),
        }));
      },

      deselectTask: (id) => {
        set((state) => {
          const newSelection = new Set(state.selectedTasks);
          newSelection.delete(id);
          return { selectedTasks: newSelection };
        });
      },

      clearSelection: () => {
        set({ selectedTasks: new Set() });
      },

      // Filters
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
        
        // Fetch with new filters
        get().fetchTasks();
      },

      clearFilters: () => {
        set({ filters: {} });
        get().fetchTasks();
      },

      // Utilities
      setError: (error) => set({ error }),
    }),
    { name: 'task-store' }
  )
);