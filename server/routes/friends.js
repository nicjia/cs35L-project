// server/routes/friends.js
const router = require("express").Router();
const { Friend, User, Task, Notification } = require("../models");
const { Op } = require("sequelize");
const auth = require("../middleware/auth");

// Get all friends (accepted) and pending requests
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all friend relationships where user is involved
    const friendships = await Friend.findAll({
      where: {
        [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
        status: "accepted",
      },
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "firstName", "lastName", "username", "email"],
        },
        {
          model: User,
          as: "addressee",
          attributes: ["id", "firstName", "lastName", "username", "email"],
        },
      ],
    });

    // Map to friend objects (the other user in each relationship)
    const friends = friendships.map((f) => {
      const friend =
        f.requesterId === userId ? f.addressee : f.requester;
      return {
        friendshipId: f.id,
        ...friend.toJSON(),
      };
    });

    res.json(friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// Get pending friend requests (received)
router.get("/requests", auth, async (req, res) => {
  try {
    const requests = await Friend.findAll({
      where: {
        addresseeId: req.user.userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "firstName", "lastName", "username", "email"],
        },
      ],
    });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Get sent friend requests
router.get("/sent", auth, async (req, res) => {
  try {
    const requests = await Friend.findAll({
      where: {
        requesterId: req.user.userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "addressee",
          attributes: ["id", "firstName", "lastName", "username", "email"],
        },
      ],
    });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({ error: "Failed to fetch sent requests" });
  }
});

// Send friend request (by username or email)
router.post("/request", auth, async (req, res) => {
  try {
    const { usernameOrEmail } = req.body;
    const requesterId = req.user.userId;

    if (!usernameOrEmail) {
      return res.status(400).json({ error: "Username or email is required" });
    }

    // Find the user to send request to
    const addressee = await User.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!addressee) {
      return res.status(404).json({ error: "User not found" });
    }

    if (addressee.id === requesterId) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    // Check if friendship already exists
    const existingFriendship = await Friend.findOne({
      where: {
        [Op.or]: [
          { requesterId, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === "accepted") {
        return res.status(400).json({ error: "Already friends with this user" });
      }
      if (existingFriendship.status === "pending") {
        return res.status(400).json({ error: "Friend request already pending" });
      }
    }

    // Create friend request
    const friendRequest = await Friend.create({
      requesterId,
      addresseeId: addressee.id,
      status: "pending",
    });

    // Create notification for addressee
    const requester = await User.findByPk(requesterId);
    await Notification.create({
      userId: addressee.id,
      fromUserId: requesterId,
      type: "friend_request",
      message: `${requester.firstName} ${requester.lastName} sent you a friend request`,
      referenceId: friendRequest.id,
      referenceType: "friend",
    });

    res.status(201).json({
      message: "Friend request sent",
      friendRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Accept friend request
router.patch("/:id/accept", auth, async (req, res) => {
  try {
    const friendRequest = await Friend.findOne({
      where: {
        id: req.params.id,
        addresseeId: req.user.userId,
        status: "pending",
      },
      include: [{ model: User, as: "requester" }],
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Notify the requester that their request was accepted
    const addressee = await User.findByPk(req.user.userId);
    await Notification.create({
      userId: friendRequest.requesterId,
      fromUserId: req.user.userId,
      type: "friend_accepted",
      message: `${addressee.firstName} ${addressee.lastName} accepted your friend request`,
      referenceId: friendRequest.id,
      referenceType: "friend",
    });

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

// Reject friend request
router.patch("/:id/reject", auth, async (req, res) => {
  try {
    const friendRequest = await Friend.findOne({
      where: {
        id: req.params.id,
        addresseeId: req.user.userId,
        status: "pending",
      },
    });

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Failed to reject friend request" });
  }
});

// Remove friend
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const friendship = await Friend.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [{ requesterId: userId }, { addresseeId: userId }],
        status: "accepted",
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found" });
    }

    await friendship.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

// Get a friend's public tasks
router.get("/:friendId/tasks", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const friendId = parseInt(req.params.friendId);

    // Verify friendship exists
    const friendship = await Friend.findOne({
      where: {
        [Op.or]: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId },
        ],
        status: "accepted",
      },
    });

    if (!friendship) {
      return res.status(403).json({ error: "You are not friends with this user" });
    }

    // Get only public tasks from the friend
    const tasks = await Task.findAll({
      where: {
        UserId: friendId,
        isPublic: true,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "username"],
        },
      ],
      order: [["dueDate", "ASC"], ["createdAt", "DESC"]],
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching friend's tasks:", error);
    res.status(500).json({ error: "Failed to fetch friend's tasks" });
  }
});

module.exports = router;
