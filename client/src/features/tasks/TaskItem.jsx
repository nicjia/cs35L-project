import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext'; 
import formatDate from '../../utils/formatDate';
import calculateUrgency, { priorityLevelToString } from '../../utils/calculateUrgency'; 

export function TaskItem({ task }) {
  const { toggleTask, deleteTask, updateTask } = useTasks();

  const [editing, setEditing] = useState(false);
  const [draftData, setDraftData] = useState({
    title: task.title,
    priority: task.priority || 'Medium',
    dueDate: task.dueDate || '',
    isPublic: task.isPublic || false,
  });

  const urgencyLevel = calculateUrgency(task);
  const displayPriority = priorityLevelToString(urgencyLevel);

  function handleSave() {
    const trimmedTitle = draftData.title.trim();
    if (!trimmedTitle) return;

    const updates = {};
    if (trimmedTitle !== task.title) updates.title = trimmedTitle;
    if (draftData.priority !== (task.priority || 'Medium')) updates.priority = draftData.priority;
    if (draftData.dueDate !== (task.dueDate || '')) updates.dueDate = draftData.dueDate || null;
    if (draftData.isPublic !== task.isPublic) updates.isPublic = draftData.isPublic;

    if (Object.keys(updates).length > 0) {
      updateTask(task.id, updates);
    }
    setEditing(false);
  }

  function handleCancel() {
    setDraftData({
      title: task.title,
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || '',
      isPublic: task.isPublic || false,
    });
    setEditing(false);
  }

  // Quick toggle visibility without entering edit mode
  function handleToggleVisibility() {
    updateTask(task.id, { isPublic: !task.isPublic });
  }

  if (editing) {
    return (
      <li className="task-item task-item-editing">
        <div className="task-edit-form">
          <div className="task-edit-row">
            <input
              className="task-edit-input"
              value={draftData.title}
              onChange={(e) => setDraftData((prev) => ({ ...prev, title: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="Task title..."
              autoFocus
            />
          </div>
          <div className="task-edit-row task-edit-options">
            <div className="task-edit-field">
              <label className="task-edit-label">Priority</label>
              <select
                className="task-edit-select"
                value={draftData.priority}
                onChange={(e) => setDraftData((prev) => ({ ...prev, priority: e.target.value }))}
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="task-edit-field">
              <label className="task-edit-label">Due Date</label>
              <input
                type="date"
                className="task-edit-date"
                value={draftData.dueDate}
                onChange={(e) => setDraftData((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="task-edit-field">
              <label className="task-edit-label">Visibility</label>
              <button
                type="button"
                className={`visibility-toggle ${draftData.isPublic ? 'public' : 'private'}`}
                onClick={() => setDraftData((prev) => ({ ...prev, isPublic: !prev.isPublic }))}
              >
                {draftData.isPublic ? '🔓 Public' : '🔒 Private'}
              </button>
            </div>
          </div>
          <div className="task-edit-actions">
            <button className="task-btn-styled task-btn-save" onClick={handleSave}>
              Save Changes
            </button>
            <button className="task-btn-styled task-btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="task-item">
      <div className="task-left">
        <button
          className={`task-done-btn ${task.done ? 'completed' : ''}`}
          onClick={() => toggleTask(task.id)}
          title={task.done ? 'Mark as incomplete' : 'Mark as done'}
        >
          ✓
        </button>
        <div className="task-content">
          <span className={`task-title ${task.done ? 'task-done' : ''}`}>
            {task.title}
          </span>
          <div className="task-meta">
            <span className={`priority-badge priority-${displayPriority.toLowerCase()}`}>
              {displayPriority}
            </span>
            <button
              className={`visibility-badge ${task.isPublic ? 'public' : 'private'}`}
              onClick={handleToggleVisibility}
              title="Click to toggle visibility"
            >
              {task.isPublic ? '🔓 Public' : '🔒 Private'}
            </button>
            {task.project && (
              <span 
                className="project-badge"
                style={{ 
                  backgroundColor: `${task.project.color}20`,
                  color: task.project.color,
                  borderColor: task.project.color 
                }}
              >
                📁 {task.project.name}
              </span>
            )}
            {task.dueDate && (
              <span className="task-due-date">
                📅 {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-actions">
        <button
          className="task-btn-icon"
          onClick={() => {
            setDraftData({
              title: task.title,
              priority: task.priority || 'Medium',
              dueDate: task.dueDate || '',
              isPublic: task.isPublic || false,
            });
            setEditing(true);
          }}
          title="Edit task"
        >
          ✏️
        </button>
        <button
          className="task-btn-icon task-btn-icon-danger"
          onClick={() => deleteTask(task.id)}
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}