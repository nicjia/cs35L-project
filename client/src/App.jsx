import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; 
import './App.css';

//import page components
import Home from './pages/Home';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';

function App() {
  return (
    <div className="App">
      <nav>
        <ul>
          {/* navigation links to switch between pages */}
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/tasks">Tasks</Link>
          </li>
        </ul>
      </nav>

      {/* Defines the "page" that will be swapped in and out */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<Tasks />} />
          {/* Add future routes here*/}
        </Routes>
      </main>
      
    </div>
  );
}

export default App;