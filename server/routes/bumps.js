// server/routes/bumps.js
// Bumping is just a notification feature - no Bump table needed
const router = require("express").Router();
const { Task, User, Notification, Friend } = require("../models");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");

// Send a bump notification to remind someone about their task
router.post("/", auth, async (req, res) => {
  try {
    const { taskId, message } = req.body;
    const fromUserId = req.user.userId;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    // Get the task
    const task = await Task.findByPk(taskId, {
      include: [{ model: User, as: "user" }],
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Cannot bump your own task
    if (task.UserId === fromUserId) {
      return res.status(400).json({ error: "Cannot bump your own task" });
    }

    // Task must be public
    if (!task.isPublic) {
      return res.status(403).json({ error: "Cannot bump a private task" });
    }

    // Verify friendship exists
    const friendship = await Friend.findOne({
      where: {
        [Op.or]: [
          { requesterId: fromUserId, addresseeId: task.UserId },
          { requesterId: task.UserId, addresseeId: fromUserId },
        ],
        status: "accepted",
      },
    });

    if (!friendship) {
      return res.status(403).json({ error: "You can only bump tasks from friends" });
    }

    // Create bump notification (no separate bump table)
    const fromUser = await User.findByPk(fromUserId);
    await Notification.create({
      userId: task.UserId,
      fromUserId,
      type: "bump",
      message: `${fromUser.firstName} bumped your task "${task.title}"${message ? `: "${message}"` : ""}`,
      referenceId: task.id,
      referenceType: "task",
    });

    res.status(201).json({
      message: "Bump sent successfully",
    });
  } catch (error) {
    console.error("Error sending bump:", error);
    res.status(500).json({ error: "Failed to send bump" });
  }
});

module.exports = router;
