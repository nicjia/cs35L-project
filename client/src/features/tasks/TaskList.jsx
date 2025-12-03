import React from 'react';
import { TaskItem } from './TaskItem'; 

// Helper to check if task is overdue
function isOverdue(dateStr, done) {
  if (!dateStr || done) return false;
  const taskDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return taskDate < today;
}

export function TaskList({ tasks }) {
  if (!tasks.length) {
    return <p className="task-empty">No tasks yet. Add one above!</p>;
  }
  return (
    <ul className="task-list">
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          isOverdue={isOverdue(t.dueDate, t.done)}
        />
      ))}
    </ul>
  );
}