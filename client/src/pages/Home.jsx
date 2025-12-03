import React from 'react';
import { useNavigate } from 'react-router-dom';
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
function TaskSection({ title, tasks, count, onViewAll }) {
  if (tasks.length === 0) return null;
  return (
    <section className="home-task-section">
      <div className="section-header">
        <h2>{title}</h2>
        <div className="section-header-right">
          <span className="task-count">{count} tasks</span>
          {onViewAll && (
            <button className="view-all-link" onClick={onViewAll}>View All →</button>
          )}
        </div>
      </div>
      <TaskList tasks={tasks.slice(0, 3)} />
      {tasks.length > 3 && onViewAll && (
        <button className="show-more-btn" onClick={onViewAll}>
          Show {tasks.length - 3} more tasks →
        </button>
      )}
    </section>
  );
}

// Stat Card Component - Now clickable
function StatCard({ icon, value, label, trend, onClick, filter }) {
  return (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`} 
      onClick={onClick}
      title={onClick ? `View ${label.toLowerCase()}` : undefined}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && <div className="stat-trend">{trend}</div>}
      {onClick && <div className="stat-arrow">→</div>}
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon, title, description, onClick, color }) {
  return (
    <div className={`quick-action-card ${color}`} onClick={onClick}>
      <div className="quick-action-icon">{icon}</div>
      <h3 className="quick-action-title">{title}</h3>
      <p className="quick-action-desc">{description}</p>
    </div>
  );
}

function Home() {
  const { tasks } = useTasks();
  const navigate = useNavigate();
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
    overdue: [],
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
    if (dueDate < today) groups.overdue.push(task);
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
  const overdueTasks = groups.overdue.length;

  // Navigation helpers
  const goToTasks = (filter) => navigate(`/tasks?filter=${filter}`);

  return (
    <div className="Home page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Welcome back, {userName}! 👋</h1>
          <p className="hero-subtitle">
            You have <strong>{pendingTasks}</strong> tasks pending
            {groups.today.length > 0 && <> and <strong>{groups.today.length}</strong> due today</>}.
            {overdueTasks > 0 && <span className="overdue-warning"> ⚠️ {overdueTasks} overdue!</span>}
            {pendingTasks === 0 && " You're all caught up! 🎉"}
          </p>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={() => navigate('/tasks')}>
              View All Tasks
            </button>
            <button className="hero-btn secondary" onClick={() => goToTasks('today')}>
              Today's Focus
            </button>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
      </div>

      {/* Stats Row - All clickable */}
      <div className="stats-row">
        <StatCard 
          icon="📋" 
          value={totalTasks} 
          label="Total Tasks" 
          onClick={() => navigate('/tasks')}
        />
        <StatCard 
          icon="✅" 
          value={completedTasks} 
          label="Completed" 
          onClick={() => goToTasks('completed')}
        />
        <StatCard 
          icon="⏳" 
          value={pendingTasks} 
          label="Pending" 
          onClick={() => goToTasks('active')}
        />
        <StatCard 
          icon="🔥" 
          value={highPriorityTasks} 
          label="High Priority" 
          onClick={() => goToTasks('high-priority')}
        />
      </div>

      {/* Overdue Alert */}
      {overdueTasks > 0 && (
        <div className="overdue-alert" onClick={() => goToTasks('overdue')}>
          <span className="overdue-alert-icon">⚠️</span>
          <span className="overdue-alert-text">
            You have <strong>{overdueTasks}</strong> overdue {overdueTasks === 1 ? 'task' : 'tasks'}!
          </span>
          <span className="overdue-alert-action">View now →</span>
        </div>
      )}

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>
        <div className="quick-actions-grid">
          <QuickActionCard 
            icon="📅" 
            title="Today's Tasks" 
            description={`${groups.today.length} tasks due today`}
            onClick={() => goToTasks('today')}
            color="blue"
          />
          <QuickActionCard 
            icon="📆" 
            title="Upcoming" 
            description={`${groups.thisWeek.length + groups.tomorrow.length} in the next 7 days`}
            onClick={() => goToTasks('upcoming')}
            color="green"
          />
          <QuickActionCard 
            icon="🔥" 
            title="High Priority" 
            description={`${highPriorityTasks} urgent tasks`}
            onClick={() => goToTasks('high-priority')}
            color="red"
          />
          <QuickActionCard 
            icon="👤" 
            title="Profile" 
            description="Manage your settings"
            onClick={() => navigate('/profile')}
            color="purple"
          />
        </div>
      </section>

      {/* Task Sections */}
      <section className="tasks-overview">
        <div className="section-header">
          <h2>Upcoming Tasks</h2>
          <button className="see-all-btn" onClick={() => navigate('/tasks')}>See all →</button>
        </div>
        
        {groups.overdue.length > 0 && (
          <TaskSection 
            title="⚠️ Overdue" 
            tasks={groups.overdue} 
            count={groups.overdue.length}
            onViewAll={() => goToTasks('overdue')}
          />
        )}
        <TaskSection 
          title="Due Today" 
          tasks={groups.today} 
          count={groups.today.length}
          onViewAll={() => goToTasks('today')}
        />
        <TaskSection 
          title="Tomorrow" 
          tasks={groups.tomorrow} 
          count={groups.tomorrow.length}
          onViewAll={() => goToTasks('upcoming')}
        />
        <TaskSection 
          title="This Week" 
          tasks={groups.thisWeek} 
          count={groups.thisWeek.length}
          onViewAll={() => goToTasks('upcoming')}
        />
        
        {pendingTasks === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🎉</span>
            <h3>All caught up!</h3>
            <p>You don't have any pending tasks. Time to add some new goals!</p>
            <button className="hero-btn primary" onClick={() => navigate('/tasks')}>
              Add New Task
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;