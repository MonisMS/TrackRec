import { Task } from "../models/taskModel.js";
import type { CreateTaskRequest, Task1, UpdateTaskRequest } from "../types/task.js";


export const getAllTasks = async(filters:{
    isCompleted?: boolean;
    priority?: string | undefined;
    search?: string | undefined ;
} ={}): Promise<any[]> => {
    const query:any = {};

    if (filters.isCompleted !== undefined) {
    query.isCompleted = filters.isCompleted;
  }

   if (filters.priority) {
    query.priority = filters.priority;
  }

    if (filters.search) {
        query.$or = [
            {title: {$regex: filters.search,$options: 'i'}},
            {description: {$regex: filters.search,$options: 'i'}}
        ]
    }
    return await Task.find(query).sort({createdAt:-1});
}
export const getTaskById = async (id:string): Promise<any> =>{
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        throw new Error('Invalid task ID format');
    }
    return await Task.findById(id);
}


export const createTask = async (taskdata: CreateTaskRequest): Promise<any> =>{
    if(taskdata.dueDate && new Date(taskdata.dueDate) <= new Date()){
        throw new Error('Due date must be in the future');
    }
    const task = new Task({
        ...taskdata,
        dueDate: taskdata.dueDate ? new Date(taskdata.dueDate) : undefined
    });
    return await task.save();
}

export const updateTask = async (id:string,updates:UpdateTaskRequest): Promise <Task1 | null> =>{
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        throw new Error('Invalid task ID format');
    }

    if(updates.dueDate && new Date(updates.dueDate) <= new Date()){
        throw new Error('Due date must be in the future');
    }

    const updateData = {
        ...updates,
        dueDate: updates.dueDate ? new Date(updates.dueDate) : undefined,
        updatedAt: new Date()
    };
    return await Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
}

export const deleteTask = async (id:string): Promise<boolean> => {
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        throw new Error('Invalid task ID format');
    }

    const result = await Task.findByIdAndDelete(id);
    return result !== null;
}

export const getTaskStats = async (): Promise<{
    total:number;
    completed:number;
    pending:number;
    overdue:number;
}> => {
const total = await Task.countDocuments();
const completed = await Task.countDocuments({ isCompleted: true });
const pending = await Task.countDocuments({ isCompleted: false });
const overdue = await Task.countDocuments({ dueDate: { $lt: new Date(), $exists: true }, isCompleted: false });
return { total, completed, pending, overdue };  
}



export const markTaskCompleted = async (id: string): Promise<Task1 | null> => {
  return await updateTask(id, { isCompleted: true });
};

// Quick way to mark a task as pending
export const markTaskPending = async (id: string): Promise<Task1 | null> => {
  return await updateTask(id, { isCompleted: false });
};

// Get tasks by priority level
export const getTasksByPriority = async (priority: 'low' | 'medium' | 'high'): Promise<Task1[]> => {
  return await getAllTasks({ priority });
};

// Get only completed tasks
export const getCompletedTasks = async (): Promise<Task1[]> => {
  return await getAllTasks({ isCompleted: true });
};

// Get only pending tasks
export const getPendingTasks = async (): Promise<Task1[]> => {
  return await getAllTasks({ isCompleted: false });
};