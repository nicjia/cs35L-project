import React from 'react';
import { useTasks } from '../contexts/TaskContext';
import { TaskList } from '../features/tasks/TaskList';
import calculateUrgency from '../utils/calculateUrgency';

// --- Helper Functions for Sorting and Grouping ---
function getLocalDate(dateString) { return new Date(dateString + 'T00:00:00'); }
function getToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

// Get user first name from localStorage
function getUserName() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    return user.firstName || 'there';
  }
  return 'there';
}

// Task Section Component
function TaskSection({ title, tasks, count }) {
  if (tasks.length === 0) return null;
  return (
    <section className="home-task-section">
      <div className="section-header">
        <h2>{title}</h2>
        <span className="task-count">{count} tasks</span>
      </div>
      <TaskList tasks={tasks} />
    </section>
  );
}

// Project Card Component (decorative - not tied to backend)
function ProjectCard({ title, progress, color, icon }) {
  return (
    <div className={`project-card ${color}`}>
      <div className="project-card-header">
        <span className="project-icon">{icon}</span>
        <span className="project-menu">⋯</span>
      </div>
      <h3 className="project-title">{title}</h3>
      <div className="project-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="progress-text">{progress}%</span>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && <div className="stat-trend">{trend}</div>}
    </div>
  );
}

function Home() {
  const { tasks } = useTasks();
  const userName = getUserName();

  // Sort tasks by due date then urgency
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && b.dueDate) {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
    }
    const urgencyA = calculateUrgency(a);
    const urgencyB = calculateUrgency(b);
    return urgencyB - urgencyA;
  });

  // Group tasks by time period
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
    if (task.done) continue;
    if (!task.dueDate) {
      groups.later.push(task);
      continue;
    }
    const dueDate = getLocalDate(task.dueDate);
    if (dueDate < today) groups.today.push(task);
    else if (dueDate.getTime() === today.getTime()) groups.today.push(task);
    else if (dueDate.getTime() === tomorrow.getTime()) groups.tomorrow.push(task);
    else if (dueDate < oneWeekFromNow) groups.thisWeek.push(task);
    else if (dueDate < oneMonthFromNow) groups.thisMonth.push(task);
    else groups.later.push(task);
  }

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.done).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' && !t.done).length;

  return (
    <div className="Home page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Welcome back, {userName}! 👋</h1>
          <p className="hero-subtitle">
            You have <strong>{pendingTasks}</strong> tasks pending and <strong>{groups.today.length}</strong> tasks due today.
            Let's get productive!
          </p>
        </div>
        <div className="hero-decoration">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <StatCard icon="📋" value={totalTasks} label="Total Tasks" />
        <StatCard icon="✅" value={completedTasks} label="Completed" trend="+12%" />
        <StatCard icon="⏳" value={pendingTasks} label="Pending" />
        <StatCard icon="🔥" value={highPriorityTasks} label="High Priority" />
      </div>

      {/* Projects Section */}
      <section className="projects-section">
        <div className="section-header">
          <h2>Projects</h2>
          <button className="see-all-btn">See all →</button>
        </div>
        <div className="projects-grid">
          <ProjectCard 
            title="Work Tasks" 
            progress={75} 
            color="pink" 
            icon="💼"
          />
          <ProjectCard 
            title="Personal Goals" 
            progress={45} 
            color="yellow" 
            icon="🎯"
          />
          <ProjectCard 
            title="Study Plan" 
            progress={60} 
            color="green" 
            icon="📚"
          />
        </div>
      </section>

      {/* Task Sections */}
      <section className="tasks-overview">
        <div className="section-header">
          <h2>Upcoming Tasks</h2>
        </div>
        <TaskSection title="Due Today" tasks={groups.today} count={groups.today.length} />
        <TaskSection title="Tomorrow" tasks={groups.tomorrow} count={groups.tomorrow.length} />
        <TaskSection title="This Week" tasks={groups.thisWeek} count={groups.thisWeek.length} />
        <TaskSection title="This Month" tasks={groups.thisMonth} count={groups.thisMonth.length} />
        <TaskSection title="Later" tasks={groups.later} count={groups.later.length} />
        
        {pendingTasks === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <h3>All caught up!</h3>
            <p>You don't have any pending tasks. Time to add some new goals!</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;