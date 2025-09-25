import React from 'react';
import { useTaskStore } from '../stores/task-store';
import TaskStats from '../components/task/TaskStats';
import { TaskCard } from '../components/task/TaskCard';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { 
    tasks, 
    stats, 
    isLoading, 
    error, 
    fetchTasks, 
    fetchTaskStats, 
    toggleTaskOptimistic 
  } = useTaskStore();

  // Fetch data on mount
  React.useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [fetchTasks, fetchTaskStats]);

  const recentTasks = tasks.slice(0, 5);
  const pendingTasks = tasks.filter(task => !task.isCompleted);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchTasks} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your tasks.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      {stats && <TaskStats stats={stats} />}

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
        {recentTasks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTaskOptimistic}
                onEdit={(task) => console.log('Edit task:', task)}
                onDelete={(id) => console.log('Delete task:', id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks yet. Create your first task to get started!</p>
          </div>
        )}
      </div>

      {/* Pending Tasks Summary */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Pending Tasks ({pendingTasks.length})
          </h2>
          <div className="text-sm text-muted-foreground">
            You have {pendingTasks.length} tasks waiting to be completed.
          </div>
        </div>
      )}
    </div>
  );
};