import React, { useEffect, useState } from "react";

/**
 * A utility function to format the date.
 * '2025-11-10' -> 'Nov 10'
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Re-add timezone offset to get local date
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  // Add state for the due date
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    // Pass an object with title and dueDate
    onAdd({ title: t, dueDate: dueDate || null });
    setTitle("");
    setDueDate("");
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
      {/* New Date Input Field */}
      <input
        type="date"
        className="task-date-input"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        aria-label="Due date"
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
    priority: task.priority || "Medium", // Default to Medium
    dueDate: task.dueDate || "",
  });

  function handleSave() {
    const trimmedTitle = draftData.title.trim();
    if (!trimmedTitle) return; // don't allow empty titles

    // Check if any fields have changed
    const titleChanged = trimmedTitle !== task.title;
    const priorityChanged = draftData.priority !== (task.priority || "Medium");
    const dateChanged = draftData.dueDate !== (task.dueDate || "");

    if (titleChanged || priorityChanged || dateChanged) {
      onUpdate(task.id, {
        title: trimmedTitle,
        priority: draftData.priority,
        dueDate: draftData.dueDate || null,
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
            {/* Date editor */}
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
                task.priority || "medium"
              ).toLowerCase()}`}
            >
              {task.priority || "Medium"}
            </span>
            <span className={`task-title ${task.done ? "task-done" : ""}`}>
              {task.title}
            </span>
            {/* Display the due date */}
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
          <button className="task-btn task-btn-edit" onClick={() => {
            setDraftData({
              title: task.title,
              priority: task.priority || "Medium",
              dueDate: task.dueDate || "",
            });
            setEditing(true);
          }}>
            Edit
          </button>
        )}
        <button
          className="task-btn task-btn-danger"
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

  function addTask({ title, dueDate }) { // Receive object
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
        title,
        done: false,
        priority: "Medium", // Default priority
        dueDate, // Add the due date
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
        onUpdate={updateTask} // Use the new update function
      />
    </div>
  );
}