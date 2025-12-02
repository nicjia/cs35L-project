import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext'; 

export function AddTaskForm({ onSuccess }) {
  const { addTask } = useTasks(); 
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isPublic, setIsPublic] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    addTask({ 
      title: t, 
      dueDate: dueDate || null,
      priority: priority,
      isPublic: isPublic
    }); 
    setTitle('');
    setDueDate('');
    setPriority('Medium');
    setIsPublic(false);
    if (onSuccess) onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-row">
        <input
          className="task-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          aria-label="New task title"
        />
      </div>
      <div className="form-row form-options">
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            className="task-date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select 
            className="task-priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div className="form-group">
          <label className="task-public-label">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              aria-label="Make task public"
            />
            <span>Make Public</span>
          </label>
        </div>
        <button className="task-btn task-btn-primary" type="submit">
          Add Task
        </button>
      </div>
    </form>
  );
}