// server/routes/projects.js

const express = require("express");
const router = express.Router();
const db = require("../models");
const authenticate = require("../middleware/auth");

// GET /api/projects - Get all projects for current user
router.get("/", authenticate, async (req, res) => {
  try {
    const projects = await db.Project.findAll({
      where: { UserId: req.user.userId },
      include: [
        {
          model: db.Task,
          as: "tasks",
          attributes: ["id", "title", "done", "priority", "dueDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:id - Get single project with tasks
router.get("/:id", authenticate, async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, UserId: req.user.userId },
      include: [
        {
          model: db.Task,
          as: "tasks",
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// POST /api/projects - Create new project
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, color, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await db.Project.create({
      name: name.trim(),
      color: color || "#3b82f6",
      description: description || null,
      UserId: req.user.userId,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT /api/projects/:id - Update project
router.put("/:id", authenticate, async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, UserId: req.user.userId },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const { name, color, description } = req.body;

    await project.update({
      name: name !== undefined ? name.trim() : project.name,
      color: color !== undefined ? color : project.color,
      description: description !== undefined ? description : project.description,
    });

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id - Delete project (tasks become general tasks)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const project = await db.Project.findOne({
      where: { id: req.params.id, UserId: req.user.userId },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Move all tasks in this project to general (no project)
    await db.Task.update(
      { ProjectId: null },
      { where: { ProjectId: req.params.id } }
    );

    await project.destroy();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// PUT /api/projects/:id/tasks/:taskId - Move task to project
router.put("/:id/tasks/:taskId", authenticate, async (req, res) => {
  try {
    const { id, taskId } = req.params;

    // Verify project belongs to user (unless id is "null" for removing from project)
    if (id !== "null") {
      const project = await db.Project.findOne({
        where: { id: id, UserId: req.user.userId },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
    }

    // Verify task belongs to user
    const task = await db.Task.findOne({
      where: { id: taskId, UserId: req.user.userId },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Update task's project
    await task.update({
      ProjectId: id === "null" ? null : parseInt(id),
    });

    res.json(task);
  } catch (error) {
    console.error("Error moving task:", error);
    res.status(500).json({ error: "Failed to move task" });
  }
});

module.exports = router;
