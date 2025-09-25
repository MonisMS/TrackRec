export interface User {
    id:string;
    clerkId:string;
    email:string;
    firstName?:string;
    lastName?:string;
    createdAt: string;
    updatedAt: string;
}

export interface Task{
    id:string;
    userId:string;
    title:string;
    description?:string;
    isCompleted:boolean;
    priority:'low' | 'medium' | 'high';
    dueDate?:string;
    tags?: string[];
    createdAt:string;
    updatedAt:string;
}

export interface CreateTaskRequest{
    title:string;
    description?:string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?:string;
    tags?: string[];
}
export interface UpdateTaskRequest extends Partial<CreateTaskRequest>{
    isCompleted?:boolean;
}
export interface ApiResponse<T = unknown>{
    success:boolean;
    data?:T;
    message?:string;
    error?:string;
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

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}