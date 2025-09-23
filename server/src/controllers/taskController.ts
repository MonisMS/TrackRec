import type { Request, Response, NextFunction } from 'express';
import { 
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} from '../services/taskServices.js';
import type { ApiResponse } from '../types/task.js';

// ========================================
// GET ALL TASKS - GET /api/tasks
// ========================================
export const getAllTasksController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract filters from query parameters
    const filters = {
      isCompleted: req.query.completed === 'true' ? true : 
                  req.query.completed === 'false' ? false : undefined,
      priority: typeof req.query.priority === 'string' ? req.query.priority : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined
    } as any;

    // Call service to get tasks with filters
    const tasks = await getAllTasks(filters);
    
    // Create standardized API response
    const response: ApiResponse<typeof tasks> = {
      success: true,
      data: tasks,
      message: `Found ${tasks.length} tasks`
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET SINGLE TASK - GET /api/tasks/:id
// ========================================
export const getTaskByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await getTaskById(req.params.id as string );
    
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
};

// ========================================
// CREATE NEW TASK - POST /api/tasks
// ========================================
export const createTaskController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await createTask(req.body);
    
    const response: ApiResponse<typeof task> = {
      success: true,
      data: task,
      message: 'Task created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// ========================================
// UPDATE TASK - PUT /api/tasks/:id
// ========================================
export const updateTaskController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const task = await updateTask(req.params.id as string, req.body);
    
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
};

// ========================================
// DELETE TASK - DELETE /api/tasks/:id
// ========================================
export const deleteTaskController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await deleteTask(req.params.id as string );
    
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
};

// ========================================
// GET TASK STATISTICS - GET /api/tasks/stats
// ========================================
export const getTaskStatsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await getTaskStats();
    
    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};