import React from 'react';
import { useTaskStore } from '../stores/task-store';
import { TaskCard } from '../components/task/TaskCard';
import { TaskForm } from '../components/task/TaskForm';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import type { CreateTaskRequest, UpdateTaskRequest, Task } from '../types';

export const TaskList: React.FC = () => {
  const { 
    tasks, 
    filters,
    selectedTasks,
    isLoading, 
    error, 
    fetchTasks, 
    createTask,
    updateTask,
    deleteTask,
    toggleTaskOptimistic,
    setFilters,
    clearFilters,
    selectTask,
    deselectTask,
    clearSelection,
  } = useTaskStore();

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [searchValue, setSearchValue] = React.useState(filters.search || '');

  // Fetch tasks on mount
  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchValue || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, setFilters]);

  const handleCreateTask = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    await createTask(data as CreateTaskRequest);
    setShowCreateForm(false);
  };

  const handleUpdateTask = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    if (editingTask) {
      await updateTask(editingTask.id, data as UpdateTaskRequest);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.isCompleted !== undefined && task.isCompleted !== filters.isCompleted) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and stay organized.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.priority || ''}
          onChange={(e) => setFilters({ priority: e.target.value || undefined })}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>

        <Select
          value={filters.isCompleted !== undefined ? filters.isCompleted.toString() : ''}
          onChange={(e) => 
            setFilters({ 
              isCompleted: e.target.value === '' ? undefined : e.target.value === 'true' 
            })
          }
        >
          <option value="">All Tasks</option>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </Select>

        {(filters.search || filters.priority || filters.isCompleted !== undefined) && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Selection Actions */}
      {selectedTasks.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm">
            {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(`Delete ${selectedTasks.size} selected tasks?`)) {
                  selectedTasks.forEach(id => deleteTask(id));
                  clearSelection();
                }
              }}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Task List */}
      {error ? (
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchTasks} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTaskOptimistic}
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              isSelected={selectedTasks.has(task.id)}
              onSelect={(id) => 
                selectedTasks.has(id) ? deselectTask(id) : selectTask(id)
              }
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tasks found. Try adjusting your filters or create a new task.</p>
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask || undefined}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};