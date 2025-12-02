// server/index.js
const express = require("express");
const cors = require("cors");
const app = express();
const auth = require("./middleware/auth");

app.use(cors());
app.use(express.json());

const db = require("./models");

// --- API ROUTES ---

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/api/tasks", auth, (req, res) => {
  db.Task.findAll({
    where: { UserId: req.user.userId },
    order: [["createdAt", "ASC"]],
  })
    .then((tasks) => {
      res.json(tasks);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch tasks" });
    });
});

app.post("/api/tasks", auth, (req, res) => {
  console.log("--------------------------------------");
  console.log("Incoming POST request to /api/tasks");
  console.log("Request Body:", req.body);
  console.log("Decoded User from Token:", req.user);

  //Create a task with association with a User ID
  const taskData = {
    ...req.body,
    UserId: req.user.userId,
  };

  db.Task.create(taskData)
    .then((newTask) => {
      console.log("SUCCESS: Task created with ID:", newTask.id);
      res.status(201).json(newTask);
    })
    .catch((err) => {
      console.error("SEQUELIZE ERROR:", err);
      res.status(500).json({ error: "Failed to create task" });
    });
});

app.put("/api/tasks/:id", auth, (req, res) => {
  const taskId = req.params.id;
  const updates = req.body;

  db.Task.update(updates, {
    where: {
      id: taskId,
      UserId: req.user.userId,
    },
  })
    .then(([rowsAffected]) => {
      if (rowsAffected === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      return db.Task.findByPk(taskId); // Note: db.Task
    })
    .then((task) => {
      res.json(task);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to update task" });
    });
});

app.delete("/api/tasks/:id", auth, (req, res) => {
  const taskId = req.params.id;

  db.Task.destroy({
    where: {
      id: taskId,
      UserId: req.user.userId,
    },
  })
    .then((rowsAffected) => {
      if (rowsAffected === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to delete task" });
    });
});

db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
  });
});
