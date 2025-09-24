# Frontend Development Complete Workflow 🎨
**Step-by-Step Guide to Building a Production-Ready React Task Tracker**

## 📖 Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [TypeScript Integration](#typescript-integration)
3. [Core Architecture](#core-architecture)
4. [Component Development](#component-development)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [UI/UX Implementation](#uiux-implementation)
8. [Testing & Deployment](#testing--deployment)

---

## 🚀 Setup & Configuration

### Phase 1.1: Project Initialization (30 minutes)

```bash
# Navigate to your project root
cd c:\Users\monis\OneDrive\Desktop\TrackRec

# Create React app with Vite (faster than CRA)
npm create vite@latest client -- --template react-ts
cd client

# Install all dependencies at once
npm install @clerk/clerk-react zustand axios react-router-dom @hookform/react-hook-form @hookform/resolvers zod date-fns lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast @radix-ui/react-select @radix-ui/react-checkbox framer-motion

# Install dev dependencies
npm install -D tailwindcss postcss autoprefixer @types/node prettier eslint-config-prettier

# Initialize TailwindCSS
npx tailwindcss init -p
```

### Phase 1.2: Essential Configuration Files

**Update `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
}
```

**Create `.env.local`:**
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_APP_NAME=Task Tracker
VITE_APP_VERSION=1.0.0
```

---

## 📝 TypeScript Integration (CRITICAL FOR AVOIDING ERRORS)

### Phase 2.1: Shared Type Definitions

**Create `src/types/index.ts` (COPY FROM YOUR BACKEND):**
```typescript
// 🚨 IMPORTANT: These types MUST match your backend exactly
export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  isCompleted?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TaskFilters {
  isCompleted?: boolean;
  priority?: string;
  search?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

// Frontend-specific types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
```

### Phase 2.2: Utility Functions

**Create `src/lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Type-safe API error handler
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// Type-safe local storage
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}
```

**Create `src/lib/config.ts`:**
```typescript
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Task Tracker',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
} as const;

// Type-safe environment validation
if (!config.clerk.publishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}
```

---

## 🏗️ Core Architecture

### Phase 3.1: API Client Setup

**Create `src/lib/api-client.ts`:**
```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from './config';
import { ApiResponse } from '../types';

class ApiClient {
  private client: AxiosInstance;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  setTokenProvider(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private setupInterceptors() {
    // Request interceptor for auth
    this.client.interceptors.request.use(
      async (config) => {
        if (this.getToken) {
          const token = await this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for consistent error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          window.location.href = '/sign-in';
        }
        
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'An unexpected error occurred';

        return Promise.reject(new Error(errorMessage));
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data!;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data!;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data!;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data!;
  }
}

export const apiClient = new ApiClient(config.api.baseUrl);
```

### Phase 3.2: Service Layer

**Create `src/services/task.service.ts`:**
```typescript
import { apiClient } from '../lib/api-client';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters, TaskStats } from '../types';

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

  async createTask(input: CreateTaskInput): Promise<Task> {
    return apiClient.post<Task>('/tasks', input);
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return apiClient.put<Task>(`/tasks/${id}`, input);
  },

  async deleteTask(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },

  async getTaskStats(): Promise<TaskStats> {
    return apiClient.get<TaskStats>('/tasks/stats');
  },
};
```

---

## 🎨 Component Development

### Phase 4.1: Base UI Components

**Create `src/components/ui/button.tsx`:**
```typescript
import * as React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
```

**Create `src/components/ui/input.tsx`:**
```typescript
import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
```

### Phase 4.2: Task Components

**Create `src/components/task/TaskCard.tsx`:**
```typescript
import React from 'react';
import { Task } from '../../types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { MoreHorizontal, Calendar, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
}) => {
  const priorityColors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

  return (
    <div
      className={cn(
        "group p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200",
        task.isCompleted && "opacity-60",
        isSelected && "ring-2 ring-primary",
        isOverdue && "border-destructive/50"
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <Checkbox
          checked={task.isCompleted}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium text-sm",
              task.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta information */}
          <div className="flex items-center space-x-4 mt-3">
            {/* Priority */}
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                priorityColors[task.priority]
              )}
            >
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center text-xs text-muted-foreground",
                  isOverdue && "text-destructive"
                )}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(task.dueDate), 'MMM dd')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(task.id)}
            />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(task)}
            className="h-8 w-8"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
```

**Create `src/components/task/TaskForm.tsx`:**
```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateTaskInput, UpdateTaskInput, Task } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Input
          {...register('title')}
          placeholder="Task title"
          error={errors.title?.message}
        />
      </div>

      <div>
        <Textarea
          {...register('description')}
          placeholder="Description (optional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select {...register('priority')}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </Select>
        </div>

        <div>
          <Input
            {...register('dueDate')}
            type="date"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting || isLoading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
```

---

## 🏪 State Management with Zustand

### Phase 5.1: Task Store

**Create `src/stores/task.store.ts`:**
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { taskService } from '../services/task.service';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters, TaskStats } from '../types';

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
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
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
```

---

## 📱 Main App Component

### Phase 6.1: App Setup

**Update `src/App.tsx`:**
```typescript
import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { config } from './lib/config';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { TaskList } from './pages/TaskList';
import { TaskStats } from './components/task/TaskStats';
import './index.css';

// Initialize API client with auth
import { apiClient } from './lib/api-client';
import { useAuth } from '@clerk/clerk-react';

const AppWithAuth: React.FC = () => {
  const { getToken } = useAuth();
  
  React.useEffect(() => {
    apiClient.setTokenProvider(getToken);
  }, [getToken]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/stats" element={<TaskStats />} />
      </Routes>
    </AppLayout>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={config.clerk.publishableKey}>
      <Router>
        <SignedIn>
          <AppWithAuth />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </Router>
    </ClerkProvider>
  );
}

export default App;
```

### Phase 6.2: Dashboard Page

**Create `src/pages/Dashboard.tsx`:**
```typescript
import React from 'react';
import { useTaskStore } from '../stores/task.store';
import { TaskStats } from '../components/task/TaskStats';
import { TaskCard } from '../components/task/TaskCard';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    tasks, 
    stats, 
    isLoading, 
    error, 
    fetchTasks, 
    fetchTaskStats, 
    toggleTaskOptimistic 
  } = useTaskStore();

  // Fetch data on mount
  React.useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [fetchTasks, fetchTaskStats]);

  const recentTasks = tasks.slice(0, 5);
  const pendingTasks = tasks.filter(task => !task.isCompleted);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchTasks} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      {stats && <TaskStats stats={stats} />}

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
        {recentTasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTaskOptimistic}
                onEdit={(task) => console.log('Edit task:', task)}
                onDelete={(id) => console.log('Delete task:', id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        )}
      </div>

      {/* Pending Tasks Summary */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pending Tasks ({pendingTasks.length})
          </h2>
          <div className="text-sm text-muted-foreground">
            You have {pendingTasks.length} tasks waiting to be completed.
          </div>
        </div>
      )}
    </div>
  );
};
```

### Phase 6.3: Task List Page

**Create `src/pages/TaskList.tsx`:**
```typescript
import React from 'react';
import { useTaskStore } from '../stores/task.store';
import { TaskCard } from '../components/task/TaskCard';
import { TaskForm } from '../components/task/TaskForm';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus, Search, Filter } from 'lucide-react';
import { CreateTaskInput, Task } from '../types';

export const TaskList: React.FC = () => {
  const { 
    tasks, 
    filters,
    selectedTasks,
    isLoading, 
    error, 
    fetchTasks, 
    createTask,
    updateTask,
    deleteTask,
    toggleTaskOptimistic,
    setFilters,
    clearFilters,
    selectTask,
    deselectTask,
    clearSelection,
  } = useTaskStore();

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [searchValue, setSearchValue] = React.useState(filters.search || '');

  // Fetch tasks on mount
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchValue || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, setFilters]);

  const handleCreateTask = async (data: CreateTaskInput) => {
    await createTask(data);
    setShowCreateForm(false);
  };

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.isCompleted !== undefined && task.isCompleted !== filters.isCompleted) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and stay organized.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.priority || ''}
          onChange={(value) => setFilters({ priority: value || undefined })}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>

        <Select
          value={filters.isCompleted !== undefined ? filters.isCompleted.toString() : ''}
          onChange={(value) => 
            setFilters({ 
              isCompleted: value === '' ? undefined : value === 'true' 
            })
          }
        >
          <option value="">All Tasks</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </Select>

        {(filters.search || filters.priority || filters.isCompleted !== undefined) && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Selection Actions */}
      {selectedTasks.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm">
            {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(`Delete ${selectedTasks.size} selected tasks?`)) {
                  selectedTasks.forEach(id => deleteTask(id));
                  clearSelection();
                }
              }}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Task List */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchTasks} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTaskOptimistic}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              isSelected={selectedTasks.has(task.id)}
              onSelect={(id) => 
                selectedTasks.has(id) ? deselectTask(id) : selectTask(id)
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tasks found. Try adjusting your filters or create a new task.</p>
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask || undefined}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
```

---

## 🚀 Getting Started Commands

### Development Workflow:

```bash
# 1. Setup the project
cd c:\Users\monis\OneDrive\Desktop\TrackRec
npm create vite@latest client -- --template react-ts
cd client
npm install

# 2. Install all dependencies
npm install @clerk/clerk-react zustand axios react-router-dom @hookform/react-hook-form @hookform/resolvers zod date-fns lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast @radix-ui/react-select @radix-ui/react-checkbox framer-motion
npm install -D tailwindcss postcss autoprefixer @types/node prettier eslint-config-prettier

# 3. Initialize TailwindCSS
npx tailwindcss init -p

# 4. Start development
npm run dev
```

### Key Points to Remember:

1. **Always match your backend types** - Copy types exactly from your backend
2. **Use TypeScript strictly** - Don't use `any` unless absolutely necessary
3. **Handle errors properly** - Always show user-friendly error messages
4. **Test as you build** - Run both frontend and backend together
5. **Keep it simple** - Start with basic features, then add complexity

### Next Steps After Setup:

1. **Week 1**: Get basic CRUD working (create, read, update, delete tasks)
2. **Week 2**: Add authentication with Clerk
3. **Week 3**: Implement advanced features (filters, search, bulk actions)
4. **Week 4**: Polish UI/UX and add animations
5. **Week 5**: Add analytics and reporting
6. **Week 6**: Testing and deployment

### Common TypeScript Errors and Solutions:

1. **"Property does not exist on type"**
   - Solution: Make sure your types match your backend exactly

2. **"Cannot assign to parameter of type"**
   - Solution: Check that your function parameters match the expected types

3. **"Object is possibly null"**
   - Solution: Add null checks: `if (task) { ... }`

4. **"Argument of type 'unknown' is not assignable"**
   - Solution: Type your error handling: `error instanceof Error ? error.message : 'Unknown error'`

This guide provides a complete foundation for building your React frontend. Each component is fully typed, follows React best practices, and integrates seamlessly with your existing backend. Start with the setup phase and build incrementally, testing each feature as you go!