import React from 'react';
import type { Task } from '../../types';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { MoreHorizontal, Calendar, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

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
            <Button
  variant="ghost"
  size="icon"
  onClick={() => onDelete(task.id)}
  className="h-8 w-8 text-destructive"
>
  <Trash2 className="h-4 w-4" />
</Button>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};