import React from 'react';
import { TaskItem } from './TaskItem'; 

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
        />
      ))}
    </ul>
  );
}