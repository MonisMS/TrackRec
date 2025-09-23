
//database types for tasks
export interface Task1 {
    _id?: string;
    title: string;
    description?: string;
    priority?: "Low" | "Medium" | "High";
    dueDate?: Date;
    tags?: string[];
    isCompleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

//types for api responses
export interface CreateTaskRequest {
    title: string;
    description?: string;
    priority?: "Low" | "Medium" | "High";
    dueDate?: Date;
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