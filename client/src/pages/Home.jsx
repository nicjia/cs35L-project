import React from 'react';
import { useTasks } from '../contexts/TaskContext'; // Import the hook
import { TaskList } from '../features/tasks/TaskList'; // Re-use the TaskList
import calculateUrgency from '../utils/calculateUrgency';

// --- Helper Functions for Sorting and Grouping ---
const priorityMap = { High: 3, Medium: 2, Low: 1 };
function getLocalDate(dateString) { return new Date(dateString + 'T00:00:00'); }
function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// A component to render sections (can be moved to features/ later!)
function TaskSection({ title, tasks }) {
  if (tasks.length === 0) {
    return null; // Don't render empty sections
  }
  return (
    <section className="home-task-section">
      <h2>{title}</h2>
      <TaskList tasks={tasks} />
    </section>
  );
}

function Home() {
  // 1. Get tasks from the context
  const { tasks } = useTasks();

  // 2. Sort the tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
    }
    // Use calculated urgency instead of stored priority
    const urgencyA = calculateUrgency(a);
    const urgencyB = calculateUrgency(b);
    return urgencyB - urgencyA;
  });

  // 3. Group the tasks
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  const oneMonthFromNow = new Date(today);
  oneMonthFromNow.setMonth(today.getMonth() + 1);

  const groups = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    thisMonth: [],
    later: [],
  };

  for (const task of sortedTasks) {
    if (task.done) continue; // Hide completed tasks
    if (!task.dueDate) {
      groups.later.push(task);
      continue;
    }
    const dueDate = getLocalDate(task.dueDate);
    if (dueDate < today) groups.today.push(task); // Overdue
    else if (dueDate.getTime() === today.getTime()) groups.today.push(task);
    else if (dueDate.getTime() === tomorrow.getTime()) groups.tomorrow.push(task);
    else if (dueDate < oneWeekFromNow) groups.thisWeek.push(task);
    else if (dueDate < oneMonthFromNow) groups.thisMonth.push(task);
    else groups.later.push(task);
  }

  // 4. Render the sections
  return (
    <div className="Home page">
      <h1>Dashboard</h1>
      <TaskSection title="Today" tasks={groups.today} />
      <TaskSection title="Tomorrow" tasks={groups.tomorrow} />
      <TaskSection title="This Week" tasks={groups.thisWeek} />
      <TaskSection title="This Month" tasks={groups.thisMonth} />
      <TaskSection title="Later" tasks={groups.later} />
    </div>
  );
}

export default Home;