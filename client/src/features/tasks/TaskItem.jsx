import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext'; 
import formatDate from '../../utils/formatDate'; 

export function TaskItem({ task }) {
  // Get functions from the context
  const { toggleTask, deleteTask, updateTask } = useTasks();

  const [editing, setEditing] = useState(false);
  const [draftData, setDraftData] = useState({
    title: task.title,
    priority: task.priority || 'Medium',
    dueDate: task.dueDate || '',
  });

  function handleSave() {
    const trimmedTitle = draftData.title.trim();
    if (!trimmedTitle) return;

    const updates = {};
    if (trimmedTitle !== task.title) updates.title = trimmedTitle;
    if (draftData.priority !== (task.priority || 'Medium')) updates.priority = draftData.priority;
    if (draftData.dueDate !== (task.dueDate || '')) updates.dueDate = draftData.dueDate || null;

    if (Object.keys(updates).length > 0) {
      updateTask(task.id, updates); // Use the context function
    }
    setEditing(false);
  }

  return (
    <li className="task-item">
      <label className="task-left">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => toggleTask(task.id)} // Use context function
        />
        {editing ? (
          <>
            <input
              className="task-edit-input"
              value={draftData.title}
              onChange={(e) =>
                setDraftData((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <select
              className="task-edit-priority"
              value={draftData.priority}
              onChange={(e) =>
                setDraftData((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input
              type="date"
              className="task-edit-date"
              value={draftData.dueDate}
              onChange={(e) =>
                setDraftData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
            />
          </>
        ) : (
          <>
            <span
              className={`priority-flag priority-${(
                task.priority || 'medium'
              ).toLowerCase()}`}
            >
              {task.priority || 'Medium'}
            </span>
            <span className={`task-title ${task.done ? 'task-done' : ''}`}>
              {task.title}
            </span>

            <span className={`task-visibility-badge ${task.isPublic ? 'public' : 'private'}`}>
            {task.isPublic ? '🔓 Public' : '🔒 Private'}
            </span>
            {task.dueDate && (
              <span className="task-due-date">
                {formatDate(task.dueDate)}
              </span>
            )}
            
          </>
        )}
      </label>

      <div className="task-actions">
        {editing ? (
          <button className="task-btn task-btn-save" onClick={handleSave}>
            Save
          </button>
        ) : (
          <button
            className="task-btn task-btn-edit"
            onClick={() => {
              setDraftData({
                title: task.title,
                priority: task.priority || 'Medium',
                dueDate: task.dueDate || '',
              });
              setEditing(true);
            }}
          >
            Edit
          </button>
        )}
        <button
          className="task-btn task-btn-danger"
          onClick={() => deleteTask(task.id)} // Use context function
        >
          Delete
        </button>
      </div>
    </li>
  );
}