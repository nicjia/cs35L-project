import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasks } from '../contexts/TaskContext';
import { AddTaskForm } from '../features/tasks/AddTaskForm';
import { TaskList } from '../features/tasks/TaskList';

// Helper to check if a date is today
function isToday(dateStr) {
  if (!dateStr) return false;
  const taskDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  return taskDate.toDateString() === today.toDateString();
}

// Helper to check if date is in the next 7 days (excluding today)
function isUpcoming(dateStr) {
  if (!dateStr) return false;
  const taskDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  return taskDate > today && taskDate <= weekFromNow;
}

// Helper to check if task is overdue
function isOverdue(dateStr, done) {
  if (!dateStr || done) return false;
  const taskDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return taskDate < today;
}

export default function Tasks() {
  const { tasks } = useTasks();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);

  // Read filter from URL or default to 'all'
  const urlFilter = searchParams.get('filter') || 'all';
  const [filter, setFilter] = useState(urlFilter);

  // Sync filter state with URL param changes
  useEffect(() => {
    const newFilter = searchParams.get('filter') || 'all';
    setFilter(newFilter);
  }, [searchParams]);

  // Update URL when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: newFilter });
    }
  };

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.done;
      case 'completed':
        return task.done;
      case 'today':
        return isToday(task.dueDate) && !task.done;
      case 'upcoming':
        return isUpcoming(task.dueDate) && !task.done;
      case 'overdue':
        return isOverdue(task.dueDate, task.done);
      case 'high':
        return (task.priority === 'High' || task.priority === 'Urgent') && !task.done;
      default:
        return true;
    }
  });

  // Counts for filter badges
  const counts = {
    all: tasks.length,
    active: tasks.filter(t => !t.done).length,
    completed: tasks.filter(t => t.done).length,
    today: tasks.filter(t => isToday(t.dueDate) && !t.done).length,
    upcoming: tasks.filter(t => isUpcoming(t.dueDate) && !t.done).length,
    overdue: tasks.filter(t => isOverdue(t.dueDate, t.done)).length,
    high: tasks.filter(t => (t.priority === 'High' || t.priority === 'Urgent') && !t.done).length,
  };

  const filterLabels = {
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    today: 'Today',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    high: 'High Priority',
  };

  return (
    <div className="Tasks page">
      <div className="page-header">
        <div className="page-header-content">
          <h1>My Tasks</h1>
          <p className="page-description">Manage and track all your tasks in one place</p>
        </div>
        <button 
          className="add-task-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Close' : '+ Add Task'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-task-section">
          <AddTaskForm onSuccess={() => setShowAddForm(false)} />
        </div>
      )}

      <div className="tasks-filters">
        {['all', 'active', 'today', 'upcoming', 'overdue', 'high', 'completed'].map(f => (
          <button 
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''} ${f === 'overdue' && counts.overdue > 0 ? 'has-overdue' : ''}`}
            onClick={() => handleFilterChange(f)}
          >
            {filterLabels[f]} ({counts[f]})
          </button>
        ))}
      </div>

      <div className="tasks-content">
        {filteredTasks.length > 0 ? (
          <TaskList tasks={filteredTasks} />
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>No tasks found</h3>
            <p>
              {filter === 'completed' 
                ? "You haven't completed any tasks yet."
                : filter === 'active'
                ? "You're all caught up! No active tasks."
                : filter === 'today'
                ? "No tasks due today."
                : filter === 'upcoming'
                ? "No upcoming tasks in the next 7 days."
                : filter === 'overdue'
                ? "Great job! No overdue tasks."
                : filter === 'high'
                ? "No high priority tasks."
                : "Click '+ Add Task' to create your first task."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}