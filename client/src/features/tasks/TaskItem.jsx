import React, { useState } from 'react';
import { useTasks } from '../../contexts/TaskContext'; 
import formatDate from '../../utils/formatDate';
import calculateUrgency, { priorityLevelToString } from '../../utils/calculateUrgency'; 


// helpers — util functions (Information Hiding Principle)


 // creates a draft object from a task
 
function createDraft(task) {
  return {
    title: task.title,
    priority: task.priority || 'Medium',
    dueDate: task.dueDate || '',
    isPublic: task.isPublic || false,
  };
}

/**
 * computes only the changed fields between original task and draft
 * returns an object with updates or empty object if nothing changed
 * this separates the editing logic from the how to save logic 
 */
function buildUpdates(task, draft) {
  const updates = {};
  const trimmedTitle = draft.title.trim();
  
  if (trimmedTitle && trimmedTitle !== task.title) {
    updates.title = trimmedTitle;
  }
  if (draft.priority !== (task.priority || 'Medium')) {
    updates.priority = draft.priority;
  }
  if (draft.dueDate !== (task.dueDate || '')) {
    updates.dueDate = draft.dueDate || null;
  }
  if (draft.isPublic !== task.isPublic) {
    updates.isPublic = draft.isPublic;
  }
  
  return updates;
}

/**
 * generates inline styles for project badge
 */
function getProjectBadgeStyle(project) {
  if (!project) return {};
  return {
    backgroundColor: `${project.color}20`,
    color: project.color,
    borderColor: project.color,
  };
}

//priority options now here instead of hardcoding in jsx 
// allows easier updates in case you want new states such as 'none' or critical
const PRIORITY_OPTIONS = ['Urgent', 'High', 'Medium', 'Low'];


 //TaskEditor — handles everything edit related
 
function TaskEditor({ draft, onDraftChange, onSave, onCancel }) {
  const updateField = (field, value) => {
    onDraftChange({ ...draft, [field]: value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave();
  };

  return (
    <li className="task-item task-item-editing">
      <div className="task-edit-form">
        <div className="task-edit-row">
          <input
            className="task-edit-input"
            value={draft.title}
            onChange={(e) => updateField('title', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task title..."
            autoFocus
          />
        </div>
        
        <div className="task-edit-row task-edit-options">
          <div className="task-edit-field">
            <label className="task-edit-label">Priority</label>
            <select
              className="task-edit-select"
              value={draft.priority}
              onChange={(e) => updateField('priority', e.target.value)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          
          <div className="task-edit-field">
            <label className="task-edit-label">Due Date</label>
            <input
              type="date"
              className="task-edit-date"
              value={draft.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
            />
          </div>
          
          <div className="task-edit-field">
            <label className="task-edit-label">Visibility</label>
            <button
              type="button"
              className={`visibility-toggle ${draft.isPublic ? 'public' : 'private'}`}
              onClick={() => updateField('isPublic', !draft.isPublic)}
            >
              {draft.isPublic ? '🔓 Public' : '🔒 Private'}
            </button>
          </div>
        </div>
        
        <div className="task-edit-actions">
          <button className="task-btn-styled task-btn-save" onClick={onSave}>
            Save Changes
          </button>
          <button className="task-btn-styled task-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </li>
  );
}


 // TaskView — only for viewing mode

function TaskView({ task, displayPriority, isOverdue, onToggle, onToggleVisibility, onEdit, onDelete }) {
  return (
    <li className={`task-item ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-left">
        <button
          className={`task-done-btn ${task.done ? 'completed' : ''}`}
          onClick={onToggle}
          title={task.done ? 'Mark as incomplete' : 'Mark as done'}
          aria-label={task.done ? 'Mark as incomplete' : 'Mark as done'}
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
              onClick={onToggleVisibility}
              title="Click to toggle visibility"
              aria-label={task.isPublic ? 'Make private' : 'Make public'}
            >
              {task.isPublic ? '🔓 Public' : '🔒 Private'}
            </button>
            
            {task.project && (
              <span className="project-badge" style={getProjectBadgeStyle(task.project)}>
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
          onClick={onEdit}
          title="Edit task"
          aria-label="Edit task"
        >
          ✏️
        </button>
        <button
          className="task-btn-icon task-btn-icon-danger"
          onClick={onDelete}
          title="Delete task"
          aria-label="Delete task"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}



/**
 * TaskItem — main component that orchestrates edit/view modes.
 * manages state and delegates rendering to sub-components --> better organization and modularity
 */
export function TaskItem({ task, isOverdue = false }) {
  const { toggleTask, deleteTask, updateTask } = useTasks();

  // State: editing mode and draft data
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => createDraft(task));

  // Computed values
  const urgencyLevel = calculateUrgency(task);
  const displayPriority = priorityLevelToString(urgencyLevel);
  
  const handleSave = () => {
    const updates = buildUpdates(task, draft);
    if (Object.keys(updates).length > 0) {
      updateTask(task.id, updates);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(createDraft(task));  // reset
    setEditing(false);
  };

  const handleStartEdit = () => {
    setDraft(createDraft(task));  // sync draft with current task
    setEditing(true);
  };

  const handleToggleVisibility = () => {
    updateTask(task.id, { isPublic: !task.isPublic });
  };

  const handleToggle = () => toggleTask(task.id);
  const handleDelete = () => deleteTask(task.id);

  // sends to appropriate renderer
  
  if (editing) {
    return (
      <TaskEditor
        draft={draft}
        onDraftChange={setDraft}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <TaskView
      task={task}
      displayPriority={displayPriority}
      isOverdue={isOverdue}
      onToggle={handleToggle}
      onToggleVisibility={handleToggleVisibility}
      onEdit={handleStartEdit}
      onDelete={handleDelete}
    />
  );
}