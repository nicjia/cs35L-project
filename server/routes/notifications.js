// server/routes/notifications.js
const router = require("express").Router();
const { Notification, User } = require("../models");
const auth = require("../middleware/auth");

// Get all notifications for the current user
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: User,
          as: "fromUser",
          attributes: ["id", "firstName", "lastName", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread count
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.userId, isRead: false },
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// Mark single notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const [rowsAffected] = await Notification.update(
      { isRead: true },
      {
        where: {
          id: req.params.id,
          userId: req.user.userId,
        },
      }
    );

    if (rowsAffected === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", auth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.userId,
          isRead: false,
        },
      }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

// Delete a notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const rowsAffected = await Notification.destroy({
      where: {
        id: req.params.id,
        userId: req.user.userId,
      },
    });

    if (rowsAffected === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

module.exports = router;
