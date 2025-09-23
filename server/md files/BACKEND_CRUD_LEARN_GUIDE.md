# Backend CRUD Learning Guide (MongoDB Edition) 🚀

Welcome! This guide will help you **learn by doing** as you build a basic CRUD backend for your Daily Task Tracker. The goal is to understand *why* each step matters, not just *how* to do it. You'll use MongoDB now, but structure your code so you can swap in Drizzle/Postgres later.

---

## 🎯 Learning Philosophy

**Think Like This:** 
- **Controllers** = Traffic directors (handle requests, don't do business logic)
- **Services** = The brain (business logic, talk to database)
- **Models** = Data blueprints (what your data looks like)
- **Routes** = Address book (which URL goes where)
- **Middleware** = Security guards (check auth, validate data)

---

## 1. Project Structure: Why It Matters

**Why:** Good structure keeps code maintainable, testable, and ready for growth. When you have 50+ files, you'll thank yourself for organizing early.

**Your Current Structure:**
```
server/src/
  app.ts ✅ (you created this)
  controllers/    (create this)
  db/            (create this)
  middlewares/   (create this) 
  models/        (create this)
  routes/        (create this)
  services/      (create this)
  types/         (create this)
  utils/         (create this)
```

**What Each Folder Does:**
- **controllers/**: Handle HTTP requests, call services, return responses
- **services/**: Business logic, talk to the database (your app's brain)
- **models/**: Database schemas (Mongoose models for MongoDB)
- **routes/**: Define API endpoints, connect to controllers
- **middlewares/**: Reusable logic for requests (auth, validation, error handling)
- **db/**: Database connection logic
- **types/**: TypeScript interfaces/types
- **utils/**: Helper functions (date formatting, validation helpers, etc.)

---

## 2. Step 1: Install MongoDB Dependencies

**Why:** You need Mongoose (MongoDB ODM) and types for TypeScript support.

**Do This:**
```bash
cd server
pnpm add mongoose
pnpm add -D @types/mongoose
```

**Learning Note:** ODM (Object Document Mapper) is like ORM but for document databases. It maps JavaScript objects to MongoDB documents.

---

## 3. Step 2: Environment Variables Setup

**Why:** Never hardcode secrets, make your app configurable for different environments.

**Create:** `server/.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tasktracker
NODE_ENV=development
```

**Create:** `server/.env.example` (for version control)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

**Learning Note:** Always commit `.env.example` but never `.env` (add `.env` to `.gitignore`).

---

## 4. Step 3: Database Connection

**Why:** Centralize DB connection logic so it's easy to change later.

**Create:** `src/db/index.ts`
```typescript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit if DB connection fails
  }
};

// Graceful shutdown
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB Disconnected');
};
```

**Learning Questions to Ask Yourself:**
- Why do we use `process.exit(1)` if DB connection fails?
- What does the `!` after `process.env.MONGODB_URI` do?
- Why is graceful shutdown important?

---

## 5. Step 4: TypeScript Interfaces

**Why:** Define your data structure first, before writing code. This helps you think clearly and catches bugs early.

**Create:** `src/types/task.ts`
```typescript
// Database document interface (what MongoDB stores)
export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// API request/response interfaces (what your API expects/returns)
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO date string from frontend
  tags?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  isCompleted?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Learning Note:** Notice how we have different interfaces for database vs API? This separation is crucial for clean architecture.

---

## 6. Step 5: MongoDB Models/Schemas

**Why:** Mongoose schemas define data structure, validation, and default values at the database level.

**Create:** `src/models/taskModel.ts`
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../types/task';

// Extend ITask with Mongoose Document
interface ITaskDocument extends ITask, Document {}

const taskSchema = new Schema<ITaskDocument>({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        return date > new Date(); // Due date must be in future
      },
      message: 'Due date must be in the future'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update 'updatedAt' on save
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create and export the model
export const Task = mongoose.model<ITaskDocument>('Task', taskSchema);
```

**Learning Questions:**
- Why do we use `trim: true`?
- What's the difference between validation in the schema vs in the API layer?
- Why do we need `pre('save')` middleware?

---

## 7. Step 6: Service Layer (The Brain)

**Why:** Services contain your business logic. Controllers are thin and just handle HTTP stuff. When you switch to Drizzle later, only services change.

**Create:** `src/services/taskService.ts`
```typescript
import { Task } from '../models/taskModel.js';
import type { ITask, CreateTaskRequest, UpdateTaskRequest } from '../types/task.js';

// ========================================
// GET ALL TASKS WITH FILTERING
// ========================================
export const getAllTasks = async (filters: {
  isCompleted?: boolean;
  priority?: string;
  search?: string;
} = {}): Promise<ITask[]> => {
  // Start with empty MongoDB query object
  const query: any = {};
  
  // Build the query step by step based on what filters are provided
  
  // Filter by completion status (true/false/undefined)
  // We check !== undefined because false is a valid value
  if (filters.isCompleted !== undefined) {
    query.isCompleted = filters.isCompleted;
  }
  
  // Filter by priority level (low/medium/high)
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  // Search in title OR description (case-insensitive)
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },        // Search in title
      { description: { $regex: filters.search, $options: 'i' } }   // Search in description
    ];
    // $regex = MongoDB's way to search text patterns
    // $options: 'i' = case-insensitive search
  }
  
  // Execute the query and sort by newest first
  return await Task.find(query).sort({ createdAt: -1 });
  // createdAt: -1 means descending order (newest first)
};

// ========================================
// GET SINGLE TASK BY ID
// ========================================
export const getTaskById = async (id: string): Promise<ITask | null> => {
  // Validate MongoDB ObjectID format before hitting database
  // MongoDB IDs are 24 character hex strings
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid task ID format');
  }
  
  // Find the task by its unique ID
  return await Task.findById(id);
  // Returns null if not found, throws error if invalid ID
};

// ========================================
// CREATE NEW TASK
// ========================================
export const createTask = async (taskData: CreateTaskRequest): Promise<ITask> => {
  // Business logic: Validate due date is in the future
  // This is application-level validation, separate from database validation
  if (taskData.dueDate && new Date(taskData.dueDate) <= new Date()) {
    throw new Error('Due date must be in the future');
  }

  // Create new task instance with the provided data
  const task = new Task({
    ...taskData,  // Spread all the task data (title, description, etc.)
    // Convert string date to Date object (frontend sends strings)
    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
  });

  // Save to database and return the created task
  return await task.save();
  // .save() runs all schema validations and returns the saved document
};

// ========================================
// UPDATE EXISTING TASK
// ========================================
export const updateTask = async (id: string, updates: UpdateTaskRequest): Promise<ITask | null> => {
  // Validate ID format first (same as getTaskById)
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid task ID format');
  }

  // Business logic: Validate due date if it's being updated
  if (updates.dueDate && new Date(updates.dueDate) <= new Date()) {
    throw new Error('Due date must be in the future');
  }

  // Prepare the update data
  const updateData = {
    ...updates,  // All the fields being updated
    // Handle date conversion if dueDate is being updated
    dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
    updatedAt: new Date()  // Always update the timestamp
  };

  // Update and return the modified document
  return await Task.findByIdAndUpdate(id, updateData, { 
    new: true,         // Return the updated document (not the old one)
    runValidators: true // Run schema validations on update
  });
  // Returns null if task not found
};

// ========================================
// DELETE TASK
// ========================================
export const deleteTask = async (id: string): Promise<boolean> => {
  // Validate ID format (same validation as other functions)
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Invalid task ID format');
  }

  // Delete the task and get the result
  const result = await Task.findByIdAndDelete(id);
  
  // Return true if something was deleted, false if nothing found
  return result !== null;
};

// ========================================
// GET TASK STATISTICS
// ========================================
export const getTaskStats = async (): Promise<{
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}> => {
  // Run multiple database queries to get different counts
  // These could be optimized with aggregation pipeline, but this is clearer
  
  const total = await Task.countDocuments();  // Count all tasks
  const completed = await Task.countDocuments({ isCompleted: true });  // Count completed tasks
  const pending = await Task.countDocuments({ isCompleted: false });   // Count pending tasks
  
  // Count overdue tasks (not completed AND due date has passed)
  const overdue = await Task.countDocuments({
    isCompleted: false,           // Not completed
    dueDate: { $lt: new Date() }  // Due date less than now
  });
  // $lt = MongoDB "less than" operator

  return { total, completed, pending, overdue };
};

// ========================================
// BONUS: HELPER FUNCTIONS
// ========================================

// Quick way to mark a task as completed
export const markTaskCompleted = async (id: string): Promise<ITask | null> => {
  return await updateTask(id, { isCompleted: true });
};

// Quick way to mark a task as pending
export const markTaskPending = async (id: string): Promise<ITask | null> => {
  return await updateTask(id, { isCompleted: false });
};

// Get tasks by priority level
export const getTasksByPriority = async (priority: 'low' | 'medium' | 'high'): Promise<ITask[]> => {
  return await getAllTasks({ priority });
};

// Get only completed tasks
export const getCompletedTasks = async (): Promise<ITask[]> => {
  return await getAllTasks({ isCompleted: true });
};

// Get only pending tasks
export const getPendingTasks = async (): Promise<ITask[]> => {
  return await getAllTasks({ isCompleted: false });
};
```

**Learning Questions:**
- Why do we validate MongoDB ObjectID format?
- What's the difference between business logic and database validation?
- Why do we use `findByIdAndUpdate` with `new: true`?

---

## 8. Step 7: Controllers (Traffic Directors)

**Why:** Controllers handle HTTP requests/responses. They should be thin - just validate input, call services, and return responses.

**Create:** `src/controllers/taskController.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { ApiResponse } from '../types/task';

export class TaskController {
  // GET /api/tasks
  static async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        isCompleted: req.query.completed === 'true' ? true : 
                    req.query.completed === 'false' ? false : undefined,
        priority: req.query.priority as string,
        search: req.query.search as string
      };

      const tasks = await TaskService.getAllTasks(filters);
      
      const response: ApiResponse<typeof tasks> = {
        success: true,
        data: tasks,
        message: `Found ${tasks.length} tasks`
      };

      res.json(response);
    } catch (error) {
      next(error); // Pass to error handler middleware
    }
  }

  // GET /api/tasks/:id
  static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      
      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      const response: ApiResponse<typeof task> = {
        success: true,
        data: task
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/tasks
  static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.createTask(req.body);
      
      const response: ApiResponse<typeof task> = {
        success: true,
        data: task,
        message: 'Task created successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/tasks/:id
  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.updateTask(req.params.id, req.body);
      
      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      const response: ApiResponse<typeof task> = {
        success: true,
        data: task,
        message: 'Task updated successfully'
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/tasks/:id
  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await TaskService.deleteTask(req.params.id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Task not found'
        });
        return;
      }

      const response: ApiResponse<null> = {
        success: true,
        message: 'Task deleted successfully'
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tasks/stats
  static async getTaskStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await TaskService.getTaskStats();
      
      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
```

**Learning Questions:**
- Why do controllers not contain business logic?
- What's the purpose of the `next(error)` pattern?
- Why do we use consistent response format?

---

## 9. Step 8: Routes (Address Book)

**Why:** Routes connect URLs to controller methods. Keep them simple and organized.

**Create:** `src/routes/taskRoutes.ts`
```typescript
import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
// import { validateTask } from '../middlewares/validation'; // We'll create this later

const router = Router();

// GET /api/tasks/stats - Must come before /:id route
router.get('/stats', TaskController.getTaskStats);

// GET /api/tasks - Get all tasks with optional filters
router.get('/', TaskController.getAllTasks);

// GET /api/tasks/:id - Get single task
router.get('/:id', TaskController.getTaskById);

// POST /api/tasks - Create new task
router.post('/', 
  // validateTask, // Add validation middleware later
  TaskController.createTask
);

// PUT /api/tasks/:id - Update task
router.put('/:id', 
  // validateTask, // Add validation middleware later
  TaskController.updateTask
);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', TaskController.deleteTask);

export default router;
```

**Learning Note:** Order matters! `/stats` must come before `/:id` or it will be treated as an ID parameter.

---

## 10. Step 9: Error Handling Middleware

**Why:** Centralized error handling makes debugging easier and provides consistent error responses.

**Create:** `src/middlewares/errorHandler.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not found - ${req.originalUrl}`) as CustomError;
  error.statusCode = 404;
  next(error);
};
```

**Learning Questions:**
- Why do we log errors but not send stack traces in production?
- What's the difference between 400, 404, and 500 errors?
- Why do we handle Mongoose-specific errors?

---

## 11. Step 10: Main App Setup

**Why:** This ties everything together and configures your Express app.

**Update:** `src/app.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { connectDB } from './db';
import taskRoutes from './routes/taskRoutes';
import { errorHandler, notFound } from './middlewares/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/tasks', taskRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API docs: http://localhost:${PORT}/api/tasks`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
```

**Learning Questions:**
- Why is middleware order important?
- What's the purpose of the health check endpoint?
- Why do we handle SIGTERM and SIGINT?

---

## 12. Step 11: Testing Your API

**Why:** Test as you build to catch bugs early and ensure your API works as expected.

**Install MongoDB locally** or use MongoDB Atlas (cloud):
- Local: https://www.mongodb.com/try/download/community
- Atlas: https://www.mongodb.com/atlas

**Test with these commands:**

```bash
# Start your server
cd server
pnpm run dev

# In another terminal, test with curl or use Postman/Thunder Client

# Health check
curl http://localhost:5000/health

# Get all tasks (empty at first)
curl http://localhost:5000/api/tasks

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn MongoDB","priority":"high"}'

# Get task stats
curl http://localhost:5000/api/tasks/stats
```

---

## 13. What You've Learned So Far

**Architecture Patterns:**
- ✅ **Layered Architecture**: Controllers → Services → Models
- ✅ **Separation of Concerns**: Each layer has a single responsibility
- ✅ **Dependency Injection**: Services inject models, controllers inject services

**MongoDB Concepts:**
- ✅ **ODM (Object Document Mapper)**: Mongoose maps objects to documents
- ✅ **Schema Design**: Structure, validation, and defaults
- ✅ **Middleware**: Pre/post hooks for database operations

**Express.js Patterns:**
- ✅ **Middleware Chain**: Request flows through middleware functions
- ✅ **Error Handling**: Centralized error processing
- ✅ **RESTful APIs**: Standard HTTP methods and status codes

**TypeScript Benefits:**
- ✅ **Type Safety**: Catch errors at compile time
- ✅ **Interface Design**: Clear contracts between layers
- ✅ **Better IDE Support**: Autocomplete and refactoring

---

## 14. Next Steps: Making It Production-Ready

**Validation Middleware** (Add Zod validation):
```typescript
// src/middlewares/validation.ts
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional()
});
```

**Authentication** (Add JWT middleware):
```typescript
// src/middlewares/auth.ts
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Verify JWT token
};
```

**Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

---

## 15. Migration Strategy: MongoDB → Drizzle

**When you're ready to switch to Postgres/Drizzle:**

1. **Keep interfaces the same** (`src/types/task.ts` doesn't change)
2. **Replace models** (`src/models/` → Drizzle schemas)
3. **Update services** (`src/services/taskService.ts` → use Drizzle queries)
4. **Controllers stay the same** (they don't know about the database)

**Migration script example:**
```typescript
// scripts/migrate-data.ts
import { connectDB } from '../src/db';
import { Task as MongoTask } from '../src/models/taskModel';
// import { drizzleDb, tasks as DrizzleTask } from '../src/db/drizzle';

const migrateData = async () => {
  const mongoTasks = await MongoTask.find();
  // Insert into Postgres using Drizzle
  // await drizzleDb.insert(DrizzleTask).values(mongoTasks);
};
```

---

## 🎉 Congratulations!

You've built a **production-ready CRUD backend** with:
- ✅ Clean, maintainable architecture
- ✅ Type safety with TypeScript
- ✅ Error handling and validation
- ✅ RESTful API design
- ✅ Database abstraction (easy to migrate later)

**Key Takeaways:**
1. **Structure matters** - Good organization scales with your project
2. **Separation of concerns** - Each layer has one job
3. **Type safety** - TypeScript catches bugs before runtime
4. **Error handling** - Fail gracefully and provide useful feedback
5. **Abstraction** - Hide implementation details behind interfaces

**You're now ready to:**
- Add authentication and authorization
- Implement data validation with Zod
- Add rate limiting and security middleware
- Build your frontend and connect it to this API
- Migrate to Postgres/Drizzle when ready

**Remember:** Code is read more often than it's written. Make it clear, not clever! 🚀