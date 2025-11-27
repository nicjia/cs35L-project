import React from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import "./App.css";

import { TaskProvider } from "./contexts/TaskContext.jsx";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";

const RequireAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <TaskProvider>
      <div className="Navbar">
        <nav>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/tasks">Tasks</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="content">
        <Outlet />
      </div>
    </TaskProvider>
  );
};

function App() {
  return (
    <div className="App">
      <main>
        <Routes>
          //Public login route
          <Route path="/" element={<Login />} />
          //protected auth check route
          <Route element={<RequireAuth />}>
            <Route path="/main" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks" element={<Tasks />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
