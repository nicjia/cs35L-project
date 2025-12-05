import React, { useState, useEffect } from 'react';
import { useTasks } from '../../contexts/TaskContext'; 
import { projectsApi } from '../../services/api';

export function AddTaskForm({ onSuccess }) {
  const { addTask } = useTasks(); 
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isPublic, setIsPublic] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectsApi.getAll();
        setProjects(res.data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    addTask({ 
      title: t, 
      dueDate: dueDate || null,
      priority: priority,
      isPublic: isPublic,
      ProjectId: projectId ? parseInt(projectId) : null
    }); 
    setTitle('');
    setDueDate('');
    setPriority('Medium');
    setIsPublic(false);
    setProjectId('');
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
          <label className="form-label">Project</label>
          <select 
            className="task-project-select"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">No Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">&nbsp;</label>
          <button
            type="button"
            className={`visibility-toggle ${isPublic ? 'public' : 'private'}`}
            onClick={() => setIsPublic(!isPublic)}
            aria-label={isPublic ? 'Make private' : 'Make public'}
          >
            {isPublic ? '🌐 Public' : '🔒 Private'}
          </button>
        </div>
        <button className="task-btn task-btn-primary" type="submit">
          Add Task
        </button>
      </div>
    </form>
  );
}