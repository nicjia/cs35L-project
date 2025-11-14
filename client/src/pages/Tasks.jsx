import React from 'react';
import { useTasks } from '../contexts/TaskContext'; // 1. Get the hook
import { AddTaskForm } from '../features/tasks/AddTaskForm'; // 2. Import features
import { TaskList } from '../features/tasks/TaskList'; // 2. Import features

export default function Tasks() {
  // 3. Get the data from the context
  const { tasks } = useTasks();

  // 4. Just render the components!
  return (
    <div className="page">
      <h1>Tasks</h1>
      <AddTaskForm />
      <TaskList tasks={tasks} />
    </div>
  );
}