# Daily Task Tracker App - Complete Development Roadmap

## 📋 Project Overview
A modern, feature-rich daily task tracker application built with TypeScript, React, and a robust backend. Track tasks with tags, due dates, priorities, and get reminders - all with a beautiful, responsive interface.

## 🛠️ Tech Stack
- **Frontend**: React 18 + TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: Neon (PostgreSQL) + Drizzle ORM
- **Authentication**: Clerk
- **State Management**: Zustand
- **Validation**: Zod
- **Deployment**: Vercel (Frontend + API) + Neon (Database)

## 🎯 Core Features
- ✅ Task CRUD operations with real-time updates
- 🏷️ Task categorization with custom tags
- 📅 Due dates and priority levels
- 🔔 Smart reminders and notifications
- 🌙 Dark/Light mode toggle
- 🎯 Drag-and-drop task reordering
- 📊 Task analytics and progress tracking
- 🔐 Secure user authentication

---

## 🏗️ Phase 1: Backend Foundation

### 1.1 Project Setup & Environment
- [x] Create new directory `task-tracker-backend`
- [x] Initialize Node.js project: `npm init -y`
- [x] Install core dependencies:
  ```bash
  pnpm install express cors helmet morgan dotenv
  pnpm install -D typescript @types/node @types/express @types/cors ts-node nodemon concurrently
  ```
- [x] Setup TypeScript config (`tsconfig.json`):
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "lib": ["ES2020"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  }
  ```
- [ ] Create folder structure:
  ```
  src/
  ├── controllers/
  ├── middleware/
  ├── routes/
  ├── services/
  ├── types/
  ├── utils/
  ├── db/
  └── app.ts
  ```
- [X] Setup package.json scripts:
  ```json
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
  ```

**Learning Note**: This step teaches you professional Node.js project structure and TypeScript configuration for backend development.

### 1.2 Database Setup with Neon + Drizzle
- [ ] Create Neon PostgreSQL database account and project
- [ ] Install Drizzle dependencies:
  ```bash
  npm install drizzle-orm postgres
  npm install -D drizzle-kit @types/pg
  ```
- [ ] Create database schema (`src/db/schema.ts`):
  ```typescript
  import { pgTable, serial, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';

  export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull().unique(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  });

  export const tasks = pgTable('tasks', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    isCompleted: boolean('is_completed').default(false),
    priority: text('priority').$type<'low' | 'medium' | 'high'>().default('medium'),
    dueDate: timestamp('due_date'),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
  });

  export const tags = pgTable('tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    color: text('color').default('#3B82F6'),
    userId: uuid('user_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow()
  });

  export const taskTags = pgTable('task_tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('task_id').references(() => tasks.id).notNull(),
    tagId: uuid('tag_id').references(() => tags.id).notNull()
  });
  ```
- [ ] Setup Drizzle config (`drizzle.config.ts`):
  ```typescript
  import type { Config } from 'drizzle-kit';
  import * as dotenv from 'dotenv';
  dotenv.config();

  export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
      connectionString: process.env.DATABASE_URL!,
    }
  } satisfies Config;
  ```
- [ ] Create database connection (`src/db/index.ts`):
  ```typescript
  import { drizzle } from 'drizzle-orm/postgres-js';
  import postgres from 'postgres';
  import * as schema from './schema';

  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  export const db = drizzle(client, { schema });
  ```
- [ ] Add environment variables to `.env`:
  ```
  DATABASE_URL=your_neon_connection_string
  PORT=5000
  NODE_ENV=development
  ```
- [ ] Run initial migration: `npx drizzle-kit generate:pg` then `npx drizzle-kit push:pg`

**Learning Note**: This step teaches you modern database setup with Drizzle ORM, type-safe schema definitions, and database migrations.

### 1.3 Authentication Setup with Clerk
- [ ] Install Clerk backend SDK: `npm install @clerk/express`
- [ ] Create Clerk middleware (`src/middleware/auth.ts`):
  ```typescript
  import { ClerkExpressRequireAuth } from '@clerk/express';
  import { Request, Response, NextFunction } from 'express';

  export const requireAuth = ClerkExpressRequireAuth({
    onError: (error, req, res, next) => {
      res.status(401).json({ error: 'Unauthorized' });
    }
  });

  export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    // Add optional auth logic here
    next();
  };
  ```
- [ ] Add Clerk environment variables:
  ```
  CLERK_PUBLISHABLE_KEY=your_publishable_key
  CLERK_SECRET_KEY=your_secret_key
  ```

**Learning Note**: This step teaches you how to integrate third-party authentication services and protect API routes.

### 1.4 Zod Validation Schemas
- [ ] Install Zod: `npm install zod`
- [ ] Create validation schemas (`src/types/validation.ts`):
  ```typescript
  import { z } from 'zod';

  export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().datetime().optional(),
    tagIds: z.array(z.string().uuid()).optional()
  });

  export const updateTaskSchema = createTaskSchema.partial();

  export const createTagSchema = z.object({
    name: z.string().min(1, 'Tag name is required').max(50, 'Tag name too long'),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
  });

  export const reorderTasksSchema = z.object({
    taskIds: z.array(z.string().uuid()).min(1, 'At least one task ID required')
  });
  ```
- [ ] Create validation middleware (`src/middleware/validation.ts`):
  ```typescript
  import { Request, Response, NextFunction } from 'express';
  import { ZodSchema } from 'zod';

  export const validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    };
  };

  export const validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        req.params = schema.parse(req.params);
        next();
      } catch (error) {
        res.status(400).json({ error: 'Invalid parameters', details: error });
      }
    };
  };
  ```

**Learning Note**: This step teaches you input validation, data sanitization, and creating reusable middleware for API security.

### 1.5 Core Controllers & Services
- [ ] Create user service (`src/services/userService.ts`):
  ```typescript
  import { db } from '../db';
  import { users } from '../db/schema';
  import { eq } from 'drizzle-orm';

  export class UserService {
    static async createUser(clerkId: string, email: string, firstName?: string, lastName?: string) {
      const [user] = await db.insert(users).values({
        clerkId,
        email,
        firstName,
        lastName
      }).returning();
      return user;
    }

    static async getUserByClerkId(clerkId: string) {
      const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
      return user;
    }

    static async upsertUser(clerkId: string, email: string, firstName?: string, lastName?: string) {
      const existingUser = await this.getUserByClerkId(clerkId);
      if (existingUser) {
        return existingUser;
      }
      return this.createUser(clerkId, email, firstName, lastName);
    }
  }
  ```
- [ ] Create task service (`src/services/taskService.ts`):
  ```typescript
  import { db } from '../db';
  import { tasks, taskTags } from '../db/schema';
  import { eq, and, desc } from 'drizzle-orm';

  export class TaskService {
    static async getUserTasks(userId: string) {
      return await db.select().from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt));
    }

    static async createTask(userId: string, taskData: any) {
      const [task] = await db.insert(tasks).values({
        ...taskData,
        userId
      }).returning();
      return task;
    }

    static async updateTask(taskId: string, userId: string, updates: any) {
      const [task] = await db.update(tasks)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
        .returning();
      return task;
    }

    static async deleteTask(taskId: string, userId: string) {
      await db.delete(taskTags).where(eq(taskTags.taskId, taskId));
      await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
    }

    static async reorderTasks(userId: string, taskIds: string[]) {
      const updates = taskIds.map((taskId, index) => 
        db.update(tasks)
          .set({ sortOrder: index })
          .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      );
      
      await Promise.all(updates);
    }
  }
  ```
- [ ] Create controllers (`src/controllers/taskController.ts`, `src/controllers/userController.ts`, `src/controllers/tagController.ts`)
- [ ] Implement error handling middleware (`src/middleware/errorHandler.ts`)

**Learning Note**: This step teaches you service layer architecture, separation of concerns, and proper error handling in Express applications.

### 1.6 API Routes Setup
- [ ] Create task routes (`src/routes/taskRoutes.ts`):
  ```typescript
  import { Router } from 'express';
  import { TaskController } from '../controllers/taskController';
  import { requireAuth } from '../middleware/auth';
  import { validateBody } from '../middleware/validation';
  import { createTaskSchema, updateTaskSchema, reorderTasksSchema } from '../types/validation';

  const router = Router();

  router.use(requireAuth);

  router.get('/', TaskController.getUserTasks);
  router.post('/', validateBody(createTaskSchema), TaskController.createTask);
  router.put('/:id', validateBody(updateTaskSchema), TaskController.updateTask);
  router.delete('/:id', TaskController.deleteTask);
  router.patch('/reorder', validateBody(reorderTasksSchema), TaskController.reorderTasks);

  export default router;
  ```
- [ ] Create tag routes (`src/routes/tagRoutes.ts`)
- [ ] Create user routes (`src/routes/userRoutes.ts`)
- [ ] Setup main app (`src/app.ts`):
  ```typescript
  import express from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import morgan from 'morgan';
  import dotenv from 'dotenv';

  import taskRoutes from './routes/taskRoutes';
  import tagRoutes from './routes/tagRoutes';
  import userRoutes from './routes/userRoutes';
  import { errorHandler } from './middleware/errorHandler';

  dotenv.config();

  const app = express();
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());

  // Routes
  app.use('/api/tasks', taskRoutes);
  app.use('/api/tags', tagRoutes);
  app.use('/api/users', userRoutes);

  // Error handling
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  ```

**Learning Note**: This step teaches you RESTful API design, route organization, and middleware composition in Express.

### 1.7 Testing Backend APIs
- [ ] Install testing dependencies: `npm install -D jest @types/jest supertest @types/supertest`
- [ ] Create test configuration and sample tests
- [ ] Test all CRUD operations with Postman or Thunder Client
- [ ] Verify authentication works correctly
- [ ] Test validation schemas with invalid data

**Learning Note**: This step teaches you API testing, test-driven development principles, and ensuring code quality before frontend integration.

---

## 🎨 Phase 2: Frontend Foundation

### 2.1 React App Setup
- [ ] Create React app with TypeScript: `npx create-react-app task-tracker-frontend --template typescript`
- [ ] Navigate to frontend directory: `cd task-tracker-frontend`
- [ ] Install core dependencies:
  ```bash
  npm install @clerk/clerk-react zustand zod axios react-router-dom
  npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
  ```
- [ ] Setup TailwindCSS:
  ```bash
  npx tailwindcss init -p
  ```
- [ ] Configure `tailwind.config.js`:
  ```javascript
  module.exports = {
    darkMode: 'class',
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  ```
- [ ] Setup shadcn/ui:
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button input card dialog toast
  ```
- [ ] Create folder structure:
  ```
  src/
  ├── components/
  │   ├── ui/
  │   ├── layout/
  │   ├── task/
  │   └── auth/
  ├── hooks/
  ├── services/
  ├── stores/
  ├── types/
  ├── utils/
  └── pages/
  ```

**Learning Note**: This step teaches you modern React setup, utility-first CSS with Tailwind, and component library integration.

### 2.2 Authentication Setup (Frontend)
- [ ] Setup Clerk Provider in `src/App.tsx`:
  ```typescript
  import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

  const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY!;

  function App() {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <SignedIn>
          <TaskApp />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </ClerkProvider>
    );
  }
  ```
- [ ] Create authentication hook (`src/hooks/useAuth.ts`):
  ```typescript
  import { useUser } from '@clerk/clerk-react';
  import { useEffect } from 'react';
  import { userService } from '../services/userService';

  export const useAuth = () => {
    const { user, isLoaded } = useUser();

    useEffect(() => {
      if (isLoaded && user) {
        // Sync user with backend
        userService.syncUser(user);
      }
    }, [user, isLoaded]);

    return { user, isLoaded };
  };
  ```
- [ ] Add environment variables to `.env`:
  ```
  REACT_APP_CLERK_PUBLISHABLE_KEY=your_publishable_key
  REACT_APP_API_URL=http://localhost:5000/api
  ```

**Learning Note**: This step teaches you frontend authentication flow, user session management, and environment configuration.

### 2.3 State Management with Zustand
- [ ] Create task store (`src/stores/taskStore.ts`):
  ```typescript
  import { create } from 'zustand';
  import { devtools } from 'zustand/middleware';
  import { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';
  import { taskService } from '../services/taskService';

  interface TaskStore {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    
    // Actions
    fetchTasks: () => Promise<void>;
    createTask: (input: CreateTaskInput) => Promise<void>;
    updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    reorderTasks: (taskIds: string[]) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
  }

  export const useTaskStore = create<TaskStore>()(
    devtools(
      (set, get) => ({
        tasks: [],
        loading: false,
        error: null,

        fetchTasks: async () => {
          set({ loading: true, error: null });
          try {
            const tasks = await taskService.getTasks();
            set({ tasks, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },

        createTask: async (input) => {
          set({ loading: true, error: null });
          try {
            const newTask = await taskService.createTask(input);
            set(state => ({ 
              tasks: [newTask, ...state.tasks], 
              loading: false 
            }));
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },

        updateTask: async (id, input) => {
          try {
            const updatedTask = await taskService.updateTask(id, input);
            set(state => ({
              tasks: state.tasks.map(task => 
                task.id === id ? updatedTask : task
              )
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        deleteTask: async (id) => {
          try {
            await taskService.deleteTask(id);
            set(state => ({
              tasks: state.tasks.filter(task => task.id !== id)
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        reorderTasks: async (taskIds) => {
          try {
            await taskService.reorderTasks(taskIds);
            set(state => ({
              tasks: taskIds.map(id => 
                state.tasks.find(task => task.id === id)!
              )
            }));
          } catch (error) {
            set({ error: error.message });
          }
        },

        toggleTask: async (id) => {
          const task = get().tasks.find(t => t.id === id);
          if (task) {
            await get().updateTask(id, { isCompleted: !task.isCompleted });
          }
        }
      }),
      { name: 'task-store' }
    )
  );
  ```
- [ ] Create tag store (`src/stores/tagStore.ts`)
- [ ] Create theme store for dark mode (`src/stores/themeStore.ts`)

**Learning Note**: This step teaches you modern state management, immutable updates, and devtools integration for debugging.

### 2.4 API Service Layer
- [ ] Create API client (`src/services/apiClient.ts`):
  ```typescript
  import axios from 'axios';
  import { useAuth } from '@clerk/clerk-react';

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token to requests
  apiClient.interceptors.request.use(async (config) => {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle auth errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.Clerk?.redirectToSignIn();
      }
      return Promise.reject(error);
    }
  );
  ```
- [ ] Create task service (`src/services/taskService.ts`)
- [ ] Create tag service (`src/services/tagService.ts`)
- [ ] Create user service (`src/services/userService.ts`)

**Learning Note**: This step teaches you API abstraction, request/response interceptors, and centralized error handling.

### 2.5 Type Definitions
- [ ] Create shared types (`src/types/task.ts`):
  ```typescript
  export interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    sortOrder: number;
    tags?: Tag[];
    createdAt: string;
    updatedAt: string;
  }

  export interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    tagIds?: string[];
  }

  export interface UpdateTaskInput extends Partial<CreateTaskInput> {
    isCompleted?: boolean;
    sortOrder?: number;
  }

  export interface Tag {
    id: string;
    name: string;
    color: string;
    userId: string;
    createdAt: string;
  }

  export interface CreateTagInput {
    name: string;
    color: string;
  }
  ```
- [ ] Create other type definitions (`src/types/user.ts`, `src/types/api.ts`)

**Learning Note**: This step teaches you TypeScript best practices, interface design, and maintaining type safety across your application.

---

## 🎯 Phase 3: Core Components & Features

### 3.1 Layout Components
- [ ] Create main layout (`src/components/layout/AppLayout.tsx`):
  ```typescript
  import React from 'react';
  import { Header } from './Header';
  import { Sidebar } from './Sidebar';
  import { useThemeStore } from '../../stores/themeStore';

  interface AppLayoutProps {
    children: React.ReactNode;
  }

  export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const { isDark } = useThemeStore();

    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    );
  };
  ```
- [ ] Create header with user menu and theme toggle (`src/components/layout/Header.tsx`)
- [ ] Create sidebar with navigation (`src/components/layout/Sidebar.tsx`)
- [ ] Create responsive mobile navigation

**Learning Note**: This step teaches you component composition, responsive design, and layout patterns in React.

### 3.2 Task Components
- [ ] Create task list component (`src/components/task/TaskList.tsx`):
  ```typescript
  import React, { useEffect } from 'react';
  import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
  import { TaskCard } from './TaskCard';
  import { useTaskStore } from '../../stores/taskStore';
  import { Button } from '../ui/button';
  import { Plus } from 'lucide-react';

  export const TaskList: React.FC = () => {
    const { tasks, loading, fetchTasks, reorderTasks } = useTaskStore();

    useEffect(() => {
      fetchTasks();
    }, [fetchTasks]);

    const handleDragEnd = (result: any) => {
      if (!result.destination) return;

      const reorderedTasks = Array.from(tasks);
      const [removed] = reorderedTasks.splice(result.source.index, 1);
      reorderedTasks.splice(result.destination.index, 0, removed);

      const taskIds = reorderedTasks.map(task => task.id);
      reorderTasks(taskIds);
    };

    if (loading) return <div>Loading tasks...</div>;

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskCard task={task} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  };
  ```
- [ ] Create task card component (`src/components/task/TaskCard.tsx`)
- [ ] Create task form component (`src/components/task/TaskForm.tsx`)
- [ ] Add drag-and-drop functionality: `npm install react-beautiful-dnd @types/react-beautiful-dnd`

**Learning Note**: This step teaches you complex state management, drag-and-drop interactions, and component communication patterns.

### 3.3 Task Management Features
- [ ] Create task creation modal (`src/components/task/CreateTaskModal.tsx`)
- [ ] Create task editing functionality
- [ ] Add task deletion with confirmation
- [ ] Implement task completion toggle
- [ ] Create task filtering by status, priority, tags
- [ ] Add task search functionality
- [ ] Create task sorting options (date, priority, alphabetical)

**Learning Note**: This step teaches you form handling, modal patterns, and implementing complex user interactions.

### 3.4 Tag Management System
- [ ] Create tag component (`src/components/tag/Tag.tsx`):
  ```typescript
  import React from 'react';
  import { X } from 'lucide-react';
  import { Tag as TagType } from '../../types/task';

  interface TagProps {
    tag: TagType;
    removable?: boolean;
    onRemove?: (tagId: string) => void;
  }

  export const Tag: React.FC<TagProps> = ({ tag, removable, onRemove }) => {
    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: tag.color }}
      >
        {tag.name}
        {removable && (
          <button
            onClick={() => onRemove?.(tag.id)}
            className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </span>
    );
  };
  ```
- [ ] Create tag selector component (`src/components/tag/TagSelector.tsx`)
- [ ] Create tag management modal (`src/components/tag/TagManager.tsx`)
- [ ] Add color picker for tags: `npm install react-color @types/react-color`
- [ ] Implement tag filtering and search

**Learning Note**: This step teaches you reusable component design, color handling, and advanced filtering patterns.

### 3.5 Date & Time Features
- [ ] Add date picker for due dates: `npm install react-datepicker @types/react-datepicker`
- [ ] Create due date display with relative time
- [ ] Add overdue task highlighting
- [ ] Create calendar view for tasks (bonus)
- [ ] Implement date-based task filtering

**Learning Note**: This step teaches you date handling in JavaScript/TypeScript, third-party component integration, and time-based logic.

---

## 🔔 Phase 4: Advanced Features

### 4.1 Notifications & Reminders
- [ ] Setup browser notifications API
- [ ] Create notification service (`src/services/notificationService.ts`):
  ```typescript
  export class NotificationService {
    static async requestPermission(): Promise<boolean> {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    static showNotification(title: string, body: string, icon?: string) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          tag: 'task-reminder'
        });
      }
    }

    static scheduleReminder(task: Task) {
      if (!task.dueDate) return;

      const dueTime = new Date(task.dueDate).getTime();
      const now = Date.now();
      const delay = dueTime - now - (15 * 60 * 1000); // 15 minutes before

      if (delay > 0) {
        setTimeout(() => {
          this.showNotification(
            'Task Reminder',
            `"${task.title}" is due in 15 minutes!`
          );
        }, delay);
      }
    }
  }
  ```
- [ ] Create notification settings component
- [ ] Add reminder scheduling for due dates
- [ ] Implement daily task summary notifications

**Learning Note**: This step teaches you browser APIs, scheduling, and user preference management.

### 4.2 Dark Mode Implementation
- [ ] Create theme context and hook (`src/hooks/useTheme.ts`)
- [ ] Implement system theme detection
- [ ] Add theme toggle button
- [ ] Ensure all components support dark mode
- [ ] Save theme preference to localStorage

**Learning Note**: This step teaches you CSS custom properties, system preferences detection, and persistent user settings.

### 4.3 Task Analytics & Progress
- [ ] Create analytics service (`src/services/analyticsService.ts`)
- [ ] Build dashboard with task statistics
- [ ] Add completion rate charts: `npm install recharts`
- [ ] Create productivity insights
- [ ] Implement task history tracking
- [ ] Add weekly/monthly progress reports

**Learning Note**: This step teaches you data visualization, statistical calculations, and dashboard design patterns.

### 4.4 Search & Filtering Enhancement
- [ ] Implement full-text search across tasks
- [ ] Add advanced filtering options (date ranges, multiple tags)
- [ ] Create saved filter presets
- [ ] Add keyboard shortcuts for quick actions
- [ ] Implement task templates for recurring tasks

**Learning Note**: This step teaches you search algorithms, keyboard event handling, and user experience optimization.

---

## 🔗 Phase 5: Integration & Polish

### 5.1 Frontend-Backend Integration
- [ ] Test all CRUD operations work correctly
- [ ] Implement optimistic updates for better UX
- [ ] Add proper loading states and error handling
- [ ] Test authentication flow end-to-end
- [ ] Verify real-time updates work correctly
- [ ] Test drag-and-drop with backend sync

**Learning Note**: This step teaches you full-stack integration, error handling strategies, and user experience optimization.

### 5.2 Error Handling & User Feedback
- [ ] Create error boundary component
- [ ] Add toast notifications: `npm install react-hot-toast`
- [ ] Implement retry mechanisms for failed requests
- [ ] Add skeleton loading states
- [ ] Create empty states for lists
- [ ] Add confirmation dialogs for destructive actions

**Learning Note**: This step teaches you robust error handling, user feedback patterns, and progressive enhancement.

### 5.3 Performance Optimization
- [ ] Implement React.memo for expensive components
- [ ] Add useCallback and useMemo where appropriate
- [ ] Optimize bundle size with code splitting
- [ ] Add service worker for offline functionality
- [ ] Implement virtual scrolling for large task lists (if needed)
- [ ] Optimize API calls with caching

**Learning Note**: This step teaches you React performance optimization, code splitting, and progressive web app features.

### 5.4 Accessibility & UX
- [ ] Add proper ARIA labels and roles
- [ ] Ensure keyboard navigation works everywhere
- [ ] Test with screen readers
- [ ] Add focus management for modals
- [ ] Implement proper color contrast
- [ ] Add loading indicators and progress bars

**Learning Note**: This step teaches you web accessibility standards, inclusive design, and testing methodologies.

### 5.5 Responsive Design
- [ ] Test on mobile devices (320px - 768px)
- [ ] Optimize tablet layout (768px - 1024px)
- [ ] Ensure desktop experience is polished (1024px+)
- [ ] Add swipe gestures for mobile
- [ ] Optimize touch targets for mobile
- [ ] Test different screen orientations

**Learning Note**: This step teaches you responsive design principles, mobile-first development, and cross-device testing.

---

## 🚀 Phase 6: Testing & Quality Assurance

### 6.1 Frontend Testing
- [ ] Install testing dependencies:
  ```bash
  npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
  ```
- [ ] Write unit tests for utility functions
- [ ] Create component tests for key components
- [ ] Add integration tests for user flows
- [ ] Test error scenarios and edge cases
- [ ] Add accessibility tests

**Learning Note**: This step teaches you testing strategies, test-driven development, and quality assurance practices.

### 6.2 End-to-End Testing
- [ ] Setup Cypress or Playwright: `npm install -D cypress`
- [ ] Create E2E tests for critical user journeys:
  - User registration and login
  - Creating, editing, and deleting tasks
  - Tag management
  - Task reordering
  - Theme switching
- [ ] Add visual regression tests
- [ ] Test different browsers and devices

**Learning Note**: This step teaches you end-to-end testing, browser automation, and comprehensive quality assurance.

### 6.3 Code Quality
- [ ] Setup ESLint and Prettier
- [ ] Add pre-commit hooks with Husky
- [ ] Configure TypeScript strict mode
- [ ] Add code coverage reporting
- [ ] Setup automated security scanning
- [ ] Document API endpoints and components

**Learning Note**: This step teaches you code quality tools, automation, and maintainable code practices.

---

## 🌐 Phase 7: Deployment & DevOps

### 7.1 Backend Deployment Preparation
- [ ] Create production environment variables
- [ ] Setup database connection pooling
- [ ] Add request rate limiting: `npm install express-rate-limit`
- [ ] Implement proper logging: `npm install winston`
- [ ] Add health check endpoint
- [ ] Setup error monitoring (Sentry)

**Learning Note**: This step teaches you production readiness, monitoring, and scalability considerations.

### 7.2 Frontend Deployment Preparation
- [ ] Optimize build configuration
- [ ] Setup environment-specific configs
- [ ] Add service worker for caching
- [ ] Optimize images and assets
- [ ] Setup error tracking
- [ ] Add analytics (optional)

**Learning Note**: This step teaches you build optimization, caching strategies, and production monitoring.

### 7.3 Vercel Deployment
- [ ] Create Vercel account and install CLI: `npm install -g vercel`
- [ ] Configure `vercel.json` for both frontend and API routes:
  ```json
  {
    "functions": {
      "api/**/*.ts": {
        "runtime": "@vercel/node"
      }
    },
    "routes": [
      {
        "src": "/api/(.*)",
        "dest": "/api/$1"
      },
      {
        "src": "/(.*)",
        "dest": "/index.html"
      }
    ]
  }
  ```
- [ ] Setup environment variables in Vercel dashboard
- [ ] Deploy backend API routes to Vercel Functions
- [ ] Deploy frontend to Vercel
- [ ] Configure custom domain (optional)

**Learning Note**: This step teaches you serverless deployment, edge functions, and modern hosting platforms.

### 7.4 Database Production Setup
- [ ] Ensure Neon database is configured for production
- [ ] Run database migrations in production
- [ ] Setup database backups
- [ ] Configure connection limits
- [ ] Add database monitoring
- [ ] Test database connectivity from deployed app

**Learning Note**: This step teaches you production database management, backup strategies, and monitoring.

### 7.5 Post-Deployment
- [ ] Test all features in production environment
- [ ] Verify authentication works with production URLs
- [ ] Test performance with real data
- [ ] Setup monitoring and alerts
- [ ] Create deployment documentation
- [ ] Plan backup and disaster recovery

**Learning Note**: This step teaches you production operations, monitoring, and maintenance planning.

---

## 🎨 Best Practices Reminders

### Code Organization
- [ ] Use consistent file and folder naming conventions (kebab-case for files, PascalCase for components)
- [ ] Keep components small and focused (< 200 lines)
- [ ] Use TypeScript strictly (no `any` types)
- [ ] Implement proper error boundaries
- [ ] Use absolute imports with path mapping

### Performance
- [ ] Implement lazy loading for routes
- [ ] Use React.memo for expensive components
- [ ] Optimize bundle size with tree shaking
- [ ] Cache API responses appropriately
- [ ] Use efficient data structures

### Security
- [ ] Validate all inputs on both client and server
- [ ] Use HTTPS in production
- [ ] Implement proper CORS policies
- [ ] Sanitize user data
- [ ] Use environment variables for secrets

### User Experience
- [ ] Provide immediate feedback for user actions
- [ ] Handle offline scenarios gracefully
- [ ] Implement proper loading states
- [ ] Add meaningful error messages
- [ ] Ensure accessibility compliance

---

## 🏆 Bonus Challenges

### Advanced Features
- [ ] **Real-time Collaboration**: Add WebSocket support for real-time task updates when multiple users share lists
- [ ] **Task Dependencies**: Implement task relationships (blocked by, depends on)
- [ ] **Time Tracking**: Add time tracking functionality with start/stop timers
- [ ] **Recurring Tasks**: Implement repeating tasks (daily, weekly, monthly)
- [ ] **Task Templates**: Create reusable task templates
- [ ] **File Attachments**: Add ability to attach files to tasks
- [ ] **Comments System**: Add commenting on tasks
- [ ] **Team Collaboration**: Multi-user workspaces and task assignment

### Technical Improvements
- [ ] **Server-Side Rendering**: Migrate to Next.js for better SEO and performance
- [ ] **Micro-frontend Architecture**: Split into multiple deployable frontend applications
- [ ] **GraphQL API**: Replace REST API with GraphQL using Apollo
- [ ] **Redis Caching**: Add Redis for session management and caching
- [ ] **Message Queue**: Implement background job processing with Bull Queue
- [ ] **Elasticsearch**: Add advanced search capabilities
- [ ] **Docker Containerization**: Create Docker containers for development and deployment

### DevOps & Monitoring
- [ ] **CI/CD Pipeline**: Setup automated testing and deployment with GitHub Actions
- [ ] **Monitoring Dashboard**: Create comprehensive monitoring with Grafana
- [ ] **Load Testing**: Implement performance testing with Artillery or k6
- [ ] **Database Optimization**: Add database indexing and query optimization
- [ ] **CDN Integration**: Setup CloudFlare or AWS CloudFront
- [ ] **Security Audit**: Implement automated security scanning
- [ ] **API Documentation**: Create interactive API docs with Swagger/OpenAPI

### Mobile & Desktop
- [ ] **React Native App**: Create mobile application
- [ ] **Electron Desktop App**: Build desktop application
- [ ] **Progressive Web App**: Add PWA features for mobile-like experience
- [ ] **Push Notifications**: Implement push notifications for mobile

### Analytics & Intelligence
- [ ] **Advanced Analytics**: Implement user behavior tracking
- [ ] **AI-Powered Insights**: Add task completion predictions
- [ ] **Smart Scheduling**: AI-powered task scheduling suggestions
- [ ] **Productivity Reports**: Generate detailed productivity analytics

---

## 📚 Learning Resources

### Essential Reading
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React Documentation**: https://react.dev/
- **Drizzle ORM Docs**: https://orm.drizzle.team/
- **Zustand Documentation**: https://github.com/pmndrs/zustand
- **TailwindCSS Docs**: https://tailwindcss.com/docs

### Advanced Topics
- **React Performance**: https://react.dev/learn/render-and-commit
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **Database Design**: Learn about normalization, indexing, and query optimization
- **API Design**: RESTful principles and GraphQL concepts

---

## ✅ Project Completion Checklist

### Core Functionality
- [ ] User authentication works correctly
- [ ] CRUD operations for tasks complete
- [ ] Tag management system functional
- [ ] Drag-and-drop reordering works
- [ ] Due dates and reminders implemented
- [ ] Dark/light mode toggle works
- [ ] Responsive design implemented

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint and Prettier configured
- [ ] Test coverage > 80%
- [ ] No console errors in production
- [ ] Proper error handling implemented
- [ ] Code documented and commented

### Production Ready
- [ ] Application deployed successfully
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Performance optimized
- [ ] Security measures implemented
- [ ] Monitoring and logging setup

### User Experience
- [ ] Loading states implemented
- [ ] Error messages user-friendly
- [ ] Accessibility requirements met
- [ ] Mobile experience optimized
- [ ] Keyboard navigation works
- [ ] Offline functionality (if implemented)

---

🎉 **Congratulations!** You've built a complete, production-ready task tracking application with modern technologies and best practices. This project demonstrates full-stack development skills, from database design to user interface polish.

**Next Steps**: Consider contributing to open-source projects, building additional features, or applying these skills to new projects. The patterns and practices learned here are transferable to many other applications!