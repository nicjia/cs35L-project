import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { AddTaskForm } from '../features/tasks/AddTaskForm';
import { TaskList } from '../features/tasks/TaskList';

export default function Tasks() {
  const { tasks } = useTasks();
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.done;
    if (filter === 'completed') return task.done;
    return true;
  });

  const activeCount = tasks.filter(t => !t.done).length;
  const completedCount = tasks.filter(t => t.done).length;

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
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({activeCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({completedCount})
        </button>
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
                : "Click '+ Add Task' to create your first task."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}