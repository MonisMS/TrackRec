import { Router,type IRouter } from 'express';
import { 
  getAllTasksController,
  getTaskByIdController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
  getTaskStatsController
} from '../controllers/taskController.js';
// import { validateTask } from '../middlewares/validation'; // We'll create this later

const router:IRouter = Router();

// GET /api/tasks/stats - Must come before /:id route
router.get('/stats', getTaskStatsController);

// GET /api/tasks - Get all tasks with optional filters
router.get('/', getAllTasksController);

// GET /api/tasks/:id - Get single task
router.get('/:id', getTaskByIdController);

// POST /api/tasks - Create new task
router.post('/', 
  // validateTask, // Add validation middleware later
  createTaskController
);

// PUT /api/tasks/:id - Update task
router.put('/:id', 
  // validateTask, // Add validation middleware later
  updateTaskController
);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTaskController);

export default router;