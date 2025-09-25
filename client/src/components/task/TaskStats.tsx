import React from 'react';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { TaskStats as TaskStatsType } from '../../types';

interface TaskStatsProps {
  stats: TaskStatsType;
  className?: string;
}

export const TaskStats: React.FC<TaskStatsProps> = ({ stats, className }) => {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-50 border-red-200',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Completion Rate Card */}
      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm text-muted-foreground">Progress Overview</h3>
          <span className="text-2xl font-bold text-primary">{completionRate}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {stats.completed} of {stats.total} tasks completed
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                item.color
              )}
            >
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-full bg-white/50", item.iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs font-medium text-gray-600 truncate">
                    {item.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
        <h3 className="font-medium text-sm text-muted-foreground mb-3">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Tasks:</span>
            <span className="font-medium">{stats.pending}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Success Rate:</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className={cn(
              "text-muted-foreground",
              stats.overdue > 0 && "text-destructive"
            )}>
              Overdue Tasks:
            </span>
            <span className={cn(
              "font-medium",
              stats.overdue > 0 && "text-destructive"
            )}>
              {stats.overdue}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Productivity:</span>
            <span className="font-medium">
              {stats.total === 0 ? 'No data' : 
               completionRate >= 80 ? 'Excellent' :
               completionRate >= 60 ? 'Good' :
               completionRate >= 40 ? 'Average' : 'Needs Focus'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;