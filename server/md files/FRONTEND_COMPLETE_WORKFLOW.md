# Frontend Development Complete Workflow 🎨
**Step-by-Step Guide to Building a Production-Ready React Task Tracker**

## � QUICK FIX - Create Missing Files Now!

**You have these errors because files are missing. Follow these steps:**

### Step 1: Create Required Folders
```bash
cd client/src
mkdir -p components/ui components/layout components/task pages lib services stores types
```

### Step 2: Create Essential Files

**Create `src/types/index.ts`:**
```typescript
export interface Task {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  isCompleted?: boolean;
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

if (!config.clerk.publishableKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable');
}
```

**Create `src/lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Create `src/lib/api-client.ts`:**
```typescript
import axios from 'axios';
import { config } from './config';

const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenProvider(tokenProvider: () => Promise<string | null>) {
  getAuthToken = tokenProvider;
}

api.interceptors.request.use(async (config) => {
  if (getAuthToken) {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function apiGet<T>(url: string): Promise<T> {
  const response = await api.get(url);
  return response.data.data || response.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.post(url, data);
  return response.data.data || response.data;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await api.put(url, data);
  return response.data.data || response.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await api.delete(url);
  return response.data.data || response.data;
}

export const apiClient = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  setTokenProvider: setAuthTokenProvider,
};
```

**Create `src/pages/Dashboard.tsx`:**
```typescript
import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome to your task dashboard!</p>
    </div>
  );
};
```

**Create the same pattern for other missing pages:**
- `src/pages/TaskList.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/task/TaskStats.tsx`

### Step 3: Fix Your App.tsx
```typescript
import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { config } from './lib/config';
import { Dashboard } from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <ClerkProvider publishableKey={config.clerk.publishableKey}>
      <Router>
        <SignedIn>
          <div className="min-h-screen bg-background">
            <main className="container mx-auto py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>
          </div>
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

### Step 4: Create Environment File
Create `.env.local` in your client folder:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_APP_NAME=Task Tracker
VITE_APP_VERSION=1.0.0
```

**After creating these files, run `npm run dev` and you should have a working basic app!**

---

## �📖 Table of Contents
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

**Update `tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
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

export default config
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
import axios from 'axios';
import { config } from './config';
import { handleApiError } from './utils';

// Create a simple axios instance
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Simple function to get auth token (you'll set this up with Clerk later)
let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenProvider(tokenProvider: () => Promise<string | null>) {
  getAuthToken = tokenProvider;
}

// Add auth token to requests automatically
api.interceptors.request.use(async (config) => {
  if (getAuthToken) {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      window.location.href = '/sign-in';
    }
    
    // Create a simple error message
    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   error.message || 
                   'Something went wrong';
    
    throw new Error(message);
  }
);

// Simple API functions - just like fetch but easier!

export async function apiGet<T>(url: string): Promise<T> {
  try {
    const response = await api.get(url);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function apiPost<T>(url: string, data?: any): Promise<T> {
  try {
    const response = await api.post(url, data);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function apiPut<T>(url: string, data?: any): Promise<T> {
  try {
    const response = await api.put(url, data);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}

export async function apiDelete<T>(url: string): Promise<T> {
  try {
    const response = await api.delete(url);
    return response.data.data || response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
}
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

---

## 🎨 Advanced Components & Features

### Phase 7.1: Layout Components

**Create `src/components/layout/AppLayout.tsx`:**
```typescript
import React from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  PlusCircle 
} from 'lucide-react';
import { Button } from '../ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <CheckSquare className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                TaskTracker
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location.pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Quick Create Button */}
              <Button size="sm" className="h-8">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Task</span>
              </Button>
            </div>
            <nav className="flex items-center space-x-2">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
};
```

### Phase 7.2: Enhanced Dashboard

**Create `src/pages/Dashboard.tsx`:**
```typescript
import React from 'react';
import { useTaskStore } from '../stores/task.store';
import { TaskStats } from '../components/task/TaskStats';
import { TaskCard } from '../components/task/TaskCard';
import { Button } from '../components/ui/button';
import { Plus, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';

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

  React.useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [fetchTasks, fetchTaskStats]);

  const recentTasks = tasks.slice(0, 5);
  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const todayTasks = tasks.filter(task => 
    task.dueDate && isToday(new Date(task.dueDate))
  );
  const tomorrowTasks = tasks.filter(task => 
    task.dueDate && isTomorrow(new Date(task.dueDate))
  );
  const overdueTasks = tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    !task.isCompleted
  );

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchTasks} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Total Tasks</h3>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-medium">Completed</h3>
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
            </p>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium">Pending</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <h3 className="text-sm font-medium">Overdue</h3>
            </div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </div>
        </div>
      )}

      {/* Quick Sections */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Today's Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today's Tasks</h2>
            <span className="text-sm text-muted-foreground">
              {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.slice(0, 3).map((task) => (
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
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tasks scheduled for today</p>
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-red-600">Overdue Tasks</h2>
            <span className="text-sm text-muted-foreground">
              {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {overdueTasks.length > 0 ? (
            <div className="space-y-3">
              {overdueTasks.slice(0, 3).map((task) => (
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
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Great! No overdue tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Tasks</h2>
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
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tasks yet. Create your first task to get started!</p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### Phase 7.3: Analytics Page

**Create `src/pages/Analytics.tsx`:**
```typescript
import React from 'react';
import { useTaskStore } from '../stores/task.store';
import { Button } from '../components/ui/button';
import { BarChart3, TrendingUp, Calendar, Target, Clock } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export const Analytics: React.FC = () => {
  const { tasks, stats, fetchTasks, fetchTaskStats } = useTaskStore();

  React.useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [fetchTasks, fetchTaskStats]);

  // Calculate analytics data
  const completionRate = stats ? 
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0 
    : 0;

  const priorityBreakdown = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Weekly completion data (mock for now)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyData = last7Days.map(date => ({
    date: format(date, 'MMM dd'),
    completed: Math.floor(Math.random() * 5) + 1, // Mock data
    created: Math.floor(Math.random() * 3) + 1, // Mock data
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your productivity and task completion patterns.
          </p>
        </div>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium">Completion Rate</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {stats?.completed} of {stats?.total} tasks completed
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium">Weekly Average</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {weeklyData.reduce((acc, day) => acc + day.completed, 0)}
          </div>
          <p className="text-xs text-muted-foreground">Tasks completed this week</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <h3 className="text-sm font-medium">Avg. Time</h3>
          </div>
          <div className="text-3xl font-bold text-orange-600">2.5h</div>
          <p className="text-xs text-muted-foreground">Average task completion time</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-medium">Streak</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">5</div>
          <p className="text-xs text-muted-foreground">Days with completed tasks</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Weekly Activity Chart */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-muted-foreground">
                  {day.date}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2 relative">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(day.completed / 8) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">
                    {day.completed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">High Priority</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.total ? (priorityBreakdown.high / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm w-8">{priorityBreakdown.high}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">Medium Priority</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.total ? (priorityBreakdown.medium / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm w-8">{priorityBreakdown.medium}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Low Priority</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.total ? (priorityBreakdown.low / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm w-8">{priorityBreakdown.low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(completionRate)}%
            </div>
            <div className="text-sm text-green-700">Tasks Completed</div>
            <div className="text-xs text-green-600 mt-1">
              {completionRate > 80 ? 'Excellent!' : completionRate > 60 ? 'Good work!' : 'Keep going!'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats?.pending || 0}
            </div>
            <div className="text-sm text-blue-700">Pending Tasks</div>
            <div className="text-xs text-blue-600 mt-1">
              Stay focused!
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {stats?.overdue || 0}
            </div>
            <div className="text-sm text-orange-700">Overdue Tasks</div>
            <div className="text-xs text-orange-600 mt-1">
              {(stats?.overdue || 0) === 0 ? 'Great timing!' : 'Catch up needed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Phase 7.4: Settings Page

**Create `src/pages/Settings.tsx`:**
```typescript
import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Select } from '../components/ui/select';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = React.useState({
    notifications: true,
    emailDigest: false,
    darkMode: false,
    autoSave: true,
    defaultPriority: 'medium',
    taskReminders: true,
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <Input 
                defaultValue={user?.firstName || ''} 
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                defaultValue={user?.lastName || ''} 
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input 
              defaultValue={user?.primaryEmailAddress?.emailAddress || ''} 
              disabled
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed here. Manage it through your account settings.
            </p>
          </div>
          <Button>Save Profile Changes</Button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive notifications for task updates and reminders
              </div>
            </div>
            <Switch 
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Digest</div>
              <div className="text-sm text-muted-foreground">
                Receive daily email summaries of your tasks
              </div>
            </div>
            <Switch 
              checked={settings.emailDigest}
              onCheckedChange={(checked) => handleSettingChange('emailDigest', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Task Reminders</div>
              <div className="text-sm text-muted-foreground">
                Get reminded about upcoming due dates
              </div>
            </div>
            <Switch 
              checked={settings.taskReminders}
              onCheckedChange={(checked) => handleSettingChange('taskReminders', checked)}
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </div>
            </div>
            <Switch 
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Save</div>
              <div className="text-sm text-muted-foreground">
                Automatically save changes as you type
              </div>
            </div>
            <Switch 
              checked={settings.autoSave}
              onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Priority</label>
            <Select 
              value={settings.defaultPriority}
              onChange={(value) => handleSettingChange('defaultPriority', value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <p className="text-xs text-muted-foreground">
              Default priority for new tasks
            </p>
          </div>
        </div>
      </div>

      {/* Data & Privacy Section */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Data & Privacy</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">
                Download all your tasks and data
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-destructive">Delete Account</div>
              <div className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </div>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save All Changes</Button>
      </div>
    </div>
  );
};
```

---

## 🔧 Missing UI Components

Let's add the missing UI components that are referenced but not created:

### Phase 8.1: Switch Component

**Create `src/components/ui/switch.tsx`:**
```typescript
import * as React from "react";
import { cn } from "../../lib/utils";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
```

### Phase 8.2: Select Component

**Create `src/components/ui/select.tsx`:**
```typescript
import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
```

### Phase 8.3: Textarea Component

**Create `src/components/ui/textarea.tsx`:**
```typescript
import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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

Textarea.displayName = "Textarea";

export { Textarea };
```

### Phase 8.4: Checkbox Component

**Create `src/components/ui/checkbox.tsx`:**
```typescript
import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary text-primary-foreground" : "bg-background",
          className
        )}
        onClick={() => onCheckedChange?.(!checked)}
        ref={ref}
        {...props}
      >
        {checked && (
          <Check className="h-4 w-4" />
        )}
      </button>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
```

### Phase 8.5: Dialog Components

**Create `src/components/ui/dialog.tsx`:**
```typescript
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Dialog Content */}
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
      className
    )}>
      {children}
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle };
```

---

## 🚀 Complete Development Commands & Workflow

### Phase 9.1: Complete Setup Commands

```bash
# 1. Initial Setup
cd c:\Users\monis\OneDrive\Desktop\TrackRec
npm create vite@latest client -- --template react-ts
cd client

# 2. Install ALL Dependencies
npm install @clerk/clerk-react zustand axios react-router-dom @hookform/react-hook-form @hookform/resolvers zod date-fns lucide-react clsx tailwind-merge class-variance-authority framer-motion react-hot-toast

# 3. Install Dev Dependencies
npm install -D tailwindcss postcss autoprefixer @types/node prettier eslint-config-prettier

# 4. Initialize TailwindCSS
npx tailwindcss init -p

# 5. Start Development
npm run dev
```

### Phase 9.2: Development Workflow

**Week 1: Foundation**
- ✅ Setup project structure
- ✅ Configure TypeScript and TailwindCSS
- ✅ Create base UI components
- ✅ Setup API client and services
- ✅ Implement authentication with Clerk

**Week 2: Core Features**
- ✅ Build task CRUD operations
- ✅ Implement task filtering and search
- ✅ Add task prioritization
- ✅ Create responsive layouts

**Week 3: Advanced Features**
- ✅ Add bulk operations
- ✅ Implement drag-and-drop (optional)
- ✅ Build analytics dashboard
- ✅ Add settings page

**Week 4: Polish & Deploy**
- Add animations with Framer Motion
- Implement PWA features
- Add error boundaries
- Deploy to Vercel/Netlify

### Phase 9.3: Environment Variables

**Create `.env.local`:**
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_APP_NAME=Task Tracker
VITE_APP_VERSION=1.0.0
```

### Phase 9.4: Update CSS Globals

**Update `src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

---

## 🎯 Final Checklist & Testing

### Phase 10.1: Feature Completeness

- ✅ **Authentication**: Clerk integration working
- ✅ **CRUD Operations**: Create, read, update, delete tasks
- ✅ **Filtering**: By priority, completion status, search
- ✅ **Task Management**: Toggle completion, bulk operations
- ✅ **Dashboard**: Stats, recent tasks, overdue items
- ✅ **Analytics**: Completion rates, priority breakdown
- ✅ **Settings**: User preferences, notifications
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Loading States**: Smooth user experience

### Phase 10.2: Testing Commands

```bash
# Test the complete application
npm run dev

# Run type checking
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

### Phase 10.3: Deployment Preparation

**Add to `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

**Create `vercel.json` for deployment:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🚀 You're Ready to Build!

This comprehensive guide gives you everything needed to build a production-ready React TypeScript task tracker application. The workflow includes:

✅ **Complete component library** with proper TypeScript typing  
✅ **Full CRUD functionality** with optimistic updates  
✅ **Professional UI/UX** with TailwindCSS styling  
✅ **Advanced features** like analytics, bulk operations, and settings  
✅ **Production-ready architecture** with proper error handling  
✅ **Responsive design** that works on all devices  

**Start building now:**
1. Follow the setup commands in Phase 9.1
2. Create components one by one following the examples
3. Test each feature as you build it
4. Deploy when ready!

Your backend is already complete - this frontend will connect seamlessly and give you a portfolio-worthy full-stack application!