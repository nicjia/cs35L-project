// server/index.js
const express = require("express");
const app = express();
app.use(express.json());

const db = require("./models");

// --- API ROUTES ---

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/api/tasks", (req, res) => {
  db.Task.findAll({ order: [["createdAt", "ASC"]] })
    .then((tasks) => {
      res.json(tasks);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch tasks" });
    });
});

app.post("/api/tasks", (req, res) => {
  db.Task.create(req.body)
    .then((newTask) => {
      res.status(201).json(newTask);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Failed to create task" });
    });
});

app.put("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const updates = req.body;

  db.Task.update(updates, { where: { id: taskId } })
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

app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  db.Task.destroy({ where: { id: taskId } })
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
