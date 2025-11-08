// Tasks.jsx
import React, { useEffect, useState } from "react";

/** ----- Small, self-contained UI for demo purposes -----
 *  - AddTaskForm: create tasks
 *  - TaskItem:    toggle done, rename, delete
 *  - TaskList:    renders the list
 *  - Tasks:       page wrapper + localStorage persistence (optional)
 */

function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onAdd(t);
    setTitle("");
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
      <button className="task-btn" type="submit">
        Add
      </button>
    </form>
  );
}

function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draftData, setDraftData] = useState({
    title: task.title,
    priority: task.priority || "Normal",
  });

  function handleSave() {
    const trimmedTitle = draftData.title.trim();
    if (!trimmedTitle) return; // don't allow empty titles

    const titleChanged = trimmedTitle !== task.title;
    const priorityChanged = draftData.priority !== (task.priority || "Normal");

    if (titleChanged || priorityChanged) {
      onUpdate(task.id, {
        title: trimmedTitle,
        priority: draftData.priority,
      });
    }
    setEditing(false);
  }

  return (
    <li className="task-item">
      <label className="task-left">
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        {editing ? (
          <>
            <input
              className="task-edit-input"
              value={draftData.title}
              onChange={(e) =>
                setDraftData((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
          </>
        ) : (
          <>
            {" "}
            <span
              className={`priority-flag priority-${task.priority?.toLowerCase()}`}
            >
              {task.priority}
            </span>
            <span className={`task-title ${task.done ? "task-done" : ""}`}>
              {task.title}
            </span>
          </>
        )}
      </label>

      <div className="task-actions">
        {editing ? (
          <button className="task-btn" onClick={handleSave}>
            Save
          </button>
        ) : (
          <button className="task-btn" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
        <button
          className="task-btn task-danger"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function TaskList({ tasks, onToggle, onDelete, onUpdate }) {
  if (!tasks.length) {
    return <p className="task-empty">No tasks yet. Add one above!</p>;
  }
  return (
    <ul className="task-list">
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onToggle={onToggle}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}

export default function Tasks() {
  // Load/save to localStorage so it survives refresh (nice for demos)
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem("tasks");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask(title) {
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
        title,
        done: false,
        priority: "Normal",
      },
    ]);
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTask(id, updates) {
    if (!updates || typeof updates !== "object") {
      console.error("Invalid updates object:", updates);
      return;
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }

  return (
    <div className="page">
      <h1>Tasks</h1>
      <AddTaskForm onAdd={addTask} />
      <TaskList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onUpdate={updateTask}
      />
    </div>
  );
}
