import mongoose from "mongoose";
import { Document,Schema } from "mongoose";
import type { Task1 } from "../types/task.js";

interface TaskDocument extends Omit<Task1, '_id'>, Document {}

const taskSchema = new Schema<TaskDocument>({

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
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
export const Task = mongoose.model<TaskDocument>("Task", taskSchema);