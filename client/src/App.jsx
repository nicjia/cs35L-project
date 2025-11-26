import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';


import { TaskProvider } from "./contexts/TaskContext.jsx";


import Home from './pages/Home';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Login from './pages/Login';

function App() {
  return (
    // Wrap the *entire* app
    <TaskProvider>
      <div className="App">
        <div className="Navbar">
          <nav>
            <ul>
              <li><Link to="/">Login</Link></li>
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/tasks">Tasks</Link></li>
            </ul>
          </nav>
        </div>

        <main>
          <Routes>
          
            <Route path="/" element={<Login />} />
            <Route path="/main" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </main>
      </div>
    </TaskProvider>
  );
}

export default App;