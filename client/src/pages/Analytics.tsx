import React from 'react';
import { useTaskStore } from '../stores/task-store';
import { Button } from '../components/ui/button';
import { BarChart3, TrendingUp, Calendar, Target, Clock } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export const Analytics: React.FC = () => {
  const { tasks, stats, fetchTasks, fetchTaskStats } = useTaskStore();

  React.useEffect(() => {
    fetchTasks();
    fetchTaskStats();
  }, [fetchTasks, fetchTaskStats]);

  // Calculate analytics data
  const completionRate = stats ? 
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0 
    : 0;

  const priorityBreakdown = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Weekly completion data (mock for now)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyData = last7Days.map(date => ({
    date: format(date, 'MMM dd'),
    completed: Math.floor(Math.random() * 5) + 1, // Mock data
    created: Math.floor(Math.random() * 3) + 1, // Mock data
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your productivity and task completion patterns.
          </p>
        </div>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-medium">Completion Rate</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {stats?.completed} of {stats?.total} tasks completed
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-medium">Weekly Average</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {weeklyData.reduce((acc, day) => acc + day.completed, 0)}
          </div>
          <p className="text-xs text-muted-foreground">Tasks completed this week</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <h3 className="text-sm font-medium">Avg. Time</h3>
          </div>
          <div className="text-3xl font-bold text-orange-600">2.5h</div>
          <p className="text-xs text-muted-foreground">Average task completion time</p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-medium">Streak</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">5</div>
          <p className="text-xs text-muted-foreground">Days with completed tasks</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Weekly Activity Chart */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-muted-foreground">
                  {day.date}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-2 relative">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(day.completed / 8) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">
                    {day.completed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Priority Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">High Priority</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.total ? (priorityBreakdown.high / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm w-8">{priorityBreakdown.high}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-600">Medium Priority</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.total ? (priorityBreakdown.medium / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm w-8">{priorityBreakdown.medium}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">Low Priority</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${stats?.total ? (priorityBreakdown.low / stats.total) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm w-8">{priorityBreakdown.low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(completionRate)}%
            </div>
            <div className="text-sm text-green-700">Tasks Completed</div>
            <div className="text-xs text-green-600 mt-1">
              {completionRate > 80 ? 'Excellent!' : completionRate > 60 ? 'Good work!' : 'Keep going!'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats?.pending || 0}
            </div>
            <div className="text-sm text-blue-700">Pending Tasks</div>
            <div className="text-xs text-blue-600 mt-1">
              Stay focused!
            </div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {stats?.overdue || 0}
            </div>
            <div className="text-sm text-orange-700">Overdue Tasks</div>
            <div className="text-xs text-orange-600 mt-1">
              {(stats?.overdue || 0) === 0 ? 'Great timing!' : 'Catch up needed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
