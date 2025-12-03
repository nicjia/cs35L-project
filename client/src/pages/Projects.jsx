// client/src/pages/Projects.jsx
import { useState, useEffect, useCallback } from "react";
import api, { projectsApi } from "../services/api";
import { useTasks } from "../contexts/TaskContext";
import "../features/projects/Projects.css";

const PROJECT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export default function Projects() {
  const { tasks: allTasks, refreshTasks } = useTasks();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", color: "#3b82f6", description: "" });
  const [editingProject, setEditingProject] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(null); // projectId or 'general'
  const [newTask, setNewTask] = useState({ title: "", dueDate: "", priority: "Medium", isPublic: false });

  // Compute general tasks (tasks without a project) from context
  const generalTasks = allTasks.filter((t) => !t.ProjectId);

  // Get tasks for a specific project from context
  const getProjectTasks = (projectId) => {
    return allTasks.filter((t) => t.ProjectId === projectId);
  };

  const fetchProjects = useCallback(async () => {
    try {
      const projectsRes = await projectsApi.getAll();
      setProjects(projectsRes.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      await projectsApi.create(newProject);
      setNewProject({ name: "", color: "#3b82f6", description: "" });
      setShowNewProject(false);
      fetchProjects();
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      await projectsApi.update(editingProject.id, editingProject);
      setEditingProject(null);
      fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Delete this project? Tasks will be moved to General.")) return;

    try {
      await projectsApi.delete(projectId);
      fetchProjects();
      refreshTasks(); // Refresh tasks since they'll be moved to general
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, task, sourceProjectId) => {
    setDraggedTask({ task, sourceProjectId });
    e.dataTransfer.effectAllowed = "move";
    e.target.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
    setDraggedTask(null);
    setDragOverTarget(null);
  };

  const handleDragOver = (e, targetProjectId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTarget(targetProjectId);
  };

  const handleDragLeave = () => {
    setDragOverTarget(null);
  };

  const handleDrop = async (e, targetProjectId) => {
    e.preventDefault();
    setDragOverTarget(null);

    if (!draggedTask) return;

    const { task, sourceProjectId } = draggedTask;

    // Don't do anything if dropped on same project
    if (sourceProjectId === targetProjectId) return;

    try {
      await projectsApi.moveTask(targetProjectId === null ? "null" : targetProjectId, task.id);
      refreshTasks(); // Refresh the shared task context
      fetchProjects(); // Refresh project data
    } catch (err) {
      console.error("Error moving task:", err);
    }
  };

  // Create a task within a project (with full options)
  const handleCreateTaskInProject = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      await api.post("/tasks", {
        title: newTask.title.trim(),
        ProjectId: showAddTaskModal === 'general' ? null : showAddTaskModal,
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        isPublic: newTask.isPublic,
      });
      setNewTask({ title: "", dueDate: "", priority: "Medium", isPublic: false });
      setShowAddTaskModal(null);
      refreshTasks(); // Refresh the shared task context
      fetchProjects();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleToggleTaskDone = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { done: !task.done });
      refreshTasks(); // Refresh the shared task context
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const getTaskCount = (project) => {
    return getProjectTasks(project.id).length;
  };

  const getCompletedCount = (project) => {
    return getProjectTasks(project.id).filter((t) => t.done).length;
  };

  if (loading) {
    return (
      <div className="projects-container">
        <div className="projects-loading">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <button
          className="new-project-btn"
          onClick={() => setShowNewProject(true)}
        >
          + New Project
        </button>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="modal-overlay" onClick={() => setShowNewProject(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${
                        newProject.color === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewProject({ ...newProject, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowNewProject(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${
                        editingProject.color === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setEditingProject({ ...editingProject, color })
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingProject(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal !== null && (
        <div className="modal-overlay" onClick={() => setShowAddTaskModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Task {showAddTaskModal !== 'general' ? `to ${projects.find(p => p.id === showAddTaskModal)?.name}` : ''}</h2>
            <form onSubmit={handleCreateTaskInProject}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newTask.isPublic}
                    onChange={(e) => setNewTask({ ...newTask, isPublic: e.target.checked })}
                  />
                  <span>Make Public (visible to friends)</span>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddTaskModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-create">
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="projects-grid">
        {/* General Tasks (No Project) */}
        <div
          className={`project-card general-tasks ${
            dragOverTarget === null && draggedTask ? "drag-over" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, null)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, null)}
        >
          <div className="project-card-header">
            <div className="project-info">
              <div
                className="project-color-dot"
                style={{ backgroundColor: "#64748b" }}
              />
              <h3>General Tasks</h3>
            </div>
            <span className="task-count">
              {generalTasks.filter((t) => !t.done).length} active
            </span>
          </div>

          <div className="project-tasks">
            {generalTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className={`project-task-item ${task.done ? "done" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, task, null)}
                onDragEnd={handleDragEnd}
              >
                <button
                  className="task-done-btn"
                  onClick={() => handleToggleTaskDone(task)}
                >
                  {task.done && "✓"}
                </button>
                <span className="task-title">{task.title}</span>
                <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                  {task.priority}
                </span>
              </div>
            ))}
            {generalTasks.length > 5 && (
              <div className="more-tasks">
                +{generalTasks.length - 5} more tasks
              </div>
            )}
            {generalTasks.length === 0 && (
              <div className="no-tasks">
                Drag tasks here to remove from projects
              </div>
            )}
            <button
              className="add-task-btn"
              onClick={() => setShowAddTaskModal('general')}
            >
              + Add task
            </button>
          </div>
        </div>

        {/* Project Cards */}
        {projects.map((project) => (
          <div
            key={project.id}
            className={`project-card ${
              dragOverTarget === project.id && draggedTask ? "drag-over" : ""
            } ${expandedProject === project.id ? "expanded" : ""}`}
            onDragOver={(e) => handleDragOver(e, project.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, project.id)}
          >
            <div className="project-card-header">
              <div
                className="project-info"
                onClick={() =>
                  setExpandedProject(
                    expandedProject === project.id ? null : project.id
                  )
                }
              >
                <div
                  className="project-color-dot"
                  style={{ backgroundColor: project.color }}
                />
                <h3>{project.name}</h3>
              </div>
              <div className="project-actions">
                <span className="task-count">
                  {getCompletedCount(project)}/{getTaskCount(project)}
                </span>
                <button
                  className="btn-icon"
                  onClick={() => setEditingProject(project)}
                  title="Edit project"
                >
                  ✏️
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => handleDeleteProject(project.id)}
                  title="Delete project"
                >
                  🗑️
                </button>
              </div>
            </div>

            {project.description && (
              <p className="project-description">{project.description}</p>
            )}

            {/* Progress bar */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    getTaskCount(project) > 0
                      ? (getCompletedCount(project) / getTaskCount(project)) * 100
                      : 0
                  }%`,
                  backgroundColor: project.color,
                }}
              />
            </div>

            {/* Tasks List */}
            <div className="project-tasks">
              {getProjectTasks(project.id)
                .slice(0, expandedProject === project.id ? undefined : 3)
                .map((task) => (
                  <div
                    key={task.id}
                    className={`project-task-item ${task.done ? "done" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, project.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <button
                      className="task-done-btn"
                      onClick={() => handleToggleTaskDone(task)}
                    >
                      {task.done && "✓"}
                    </button>
                    <span className="task-title">{task.title}</span>
                    <span
                      className={`priority-badge ${task.priority?.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}

              {/* Add task button */}
              <button
                className="add-task-btn"
                onClick={() => setShowAddTaskModal(project.id)}
              >
                + Add task
              </button>

              {getTaskCount(project) > 3 &&
                expandedProject !== project.id && (
                  <button
                    className="show-more-btn"
                    onClick={() => setExpandedProject(project.id)}
                  >
                    Show {getTaskCount(project) - 3} more tasks
                  </button>
                )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first project to organize your tasks</p>
            <button
              className="new-project-btn"
              onClick={() => setShowNewProject(true)}
            >
              + Create Project
            </button>
          </div>
        )}
      </div>

      {/* Drag hint */}
      {draggedTask && (
        <div className="drag-hint">
          Drag to a project to move task
        </div>
      )}
    </div>
  );
}
