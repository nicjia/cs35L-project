import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = '/api/tasks';

const TaskContext = createContext();

export function useTasks() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  // 1. (Read) Get all tasks on app load
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    }
    fetchTasks();
  }, []); 

  // 2. (Create) Add a new task
  async function addTask({ title, dueDate }) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dueDate: dueDate || null,
          priority: 'Medium', // Default priority
          done: false,
        }),
      });
      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  }

  // 3. (Update) General-purpose update function
  async function updateTask(id, updates) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedTask = await response.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }

  // 4. (Update) Toggle a task's 'done' status
  async function toggleTask(id) {
    const taskToToggle = tasks.find((t) => t.id === id);
    if (!taskToToggle) return;
    
    // Call the general update function
    updateTask(id, { done: !taskToToggle.done });
  }

  // 5. (Delete) Delete a task
  async function deleteTask(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }

  // Pass all functions to the app
  const value = {
    tasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}