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

function TaskItem({ task, onToggle, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  function handleSave() {
    const t = draft.trim();
    if (t && t !== task.title) onRename(task.id, t);
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
          <input
            className="task-edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        ) : (
          <span className={`task-title ${task.done ? "task-done" : ""}`}>
            {task.title}
          </span>
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
        <button className="task-btn task-danger" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}

function TaskList({ tasks, onToggle, onDelete, onRename }) {
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
          onRename={onRename}
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
      { id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()), title, done: false },
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

  function renameTask(id, title) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  }

  return (
    <div className="page">
      <h1>Tasks</h1>
      <AddTaskForm onAdd={addTask} />
      <TaskList
        tasks={tasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onRename={renameTask}
      />
    </div>
  );
}
