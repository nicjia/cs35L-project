import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext'; 

export function AddTaskForm() {
  const { addTask } = useTasks(); 
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    addTask({ title: t, 
    dueDate: dueDate || null,
    isPublic: isPublic
  
  }); 
    setTitle('');
    setDueDate('');
    setIsPublic(false);
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        className="task-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        aria-label="New task title"
      />
      <input
        type="date"
        className="task-date-input"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Due date"
      />
      <label className="task-public-label">
        <input
          type ="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          aria-label="Make task public"
        />
        Public
        </label>
      <button className="task-btn" type="submit">
        Add
      </button>
    </form>
  );
}