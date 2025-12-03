// server/routes/users.js
const router = require("express").Router();
const { User, Task, Friend } = require("../models");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// Get current user's full profile (for settings page)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ["id", "firstName", "lastName", "username", "email", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update current user's profile
router.patch("/me", auth, async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Get user with password for verification
    const user = await User.scope("withPassword").findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates = {};

    // First name can be updated without password
    if (firstName !== undefined) {
      updates.firstName = firstName;
    }

    // Last name can be updated without password
    if (lastName !== undefined) {
      updates.lastName = lastName;
    }

    // Email change requires current password
    if (email !== undefined && email !== user.email) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password required to change email" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Check if email is already in use
      const existingEmail = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }

      updates.email = email;
    }

    // Password change requires current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password required to change password" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters" });
      }

      updates.password = newPassword; // Will be hashed by beforeSave hook
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      await user.update(updates);
    }

    // Return updated user (without password)
    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "username", "email", "createdAt"],
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ errors: messages });
    }

    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Search users by username (partial match)
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { username: { [Op.like]: `%${q}%` } },
              { firstName: { [Op.like]: `%${q}%` } },
              { lastName: { [Op.like]: `%${q}%` } },
            ],
          },
          { id: { [Op.ne]: req.user.userId } }, // Exclude self
        ],
      },
      attributes: ["id", "firstName", "lastName", "username"],
      limit: 20,
    });

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// Get user public profile by username
router.get("/profile/:username", auth, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user.userId;

    const user = await User.findOne({
      where: { username },
      attributes: ["id", "firstName", "lastName", "username", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check friendship status
    let friendshipStatus = "none";
    let friendshipId = null;

    const friendship = await Friend.findOne({
      where: {
        [Op.or]: [
          { requesterId: currentUserId, addresseeId: user.id },
          { requesterId: user.id, addresseeId: currentUserId },
        ],
      },
    });

    if (friendship) {
      friendshipId = friendship.id;
      if (friendship.status === "accepted") {
        friendshipStatus = "friends";
      } else if (friendship.status === "pending") {
        // Check who sent the request
        if (friendship.requesterId === currentUserId) {
          friendshipStatus = "pending_sent"; // Current user sent request
        } else {
          friendshipStatus = "pending_received"; // Other user sent request
        }
      } else if (friendship.status === "rejected") {
        friendshipStatus = "none"; // Allow re-requesting
      }
    }

    // Get public tasks count and list (only public tasks visible to non-friends too)
    const publicTasks = await Task.findAll({
      where: {
        UserId: user.id,
        isPublic: true,
      },
      attributes: ["id", "title", "done", "priority", "dueDate", "createdAt"],
      order: [["dueDate", "ASC"], ["createdAt", "DESC"]],
    });

    // Stats
    const totalPublicTasks = publicTasks.length;
    const completedPublicTasks = publicTasks.filter(t => t.done).length;

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        memberSince: user.createdAt,
      },
      friendshipStatus,
      friendshipId,
      stats: {
        publicTasks: totalPublicTasks,
        completedTasks: completedPublicTasks,
      },
      publicTasks: publicTasks,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

module.exports = router;
