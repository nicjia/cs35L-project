const router = require("express").Router();
const { User } = require("../models");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already in use" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    // Ensure JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate JWT token for immediate login
    const token = jwt.sign(
      {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        username: newUser.username,
      },
    });
  } catch (error) {
    // Log full error for debugging (include nested Sequelize properties)
    console.error('Error during registration:');
    try {
      // Print message and stack if available
      console.error('message:', error.message);
      console.error('stack:', error.stack);
      // Sequelize stores original DB error on `error.original` or `error.parent`
      if (error.original) console.error('original:', error.original);
      if (error.parent) console.error('parent:', error.parent);
      // Print a serialized version of the error object to capture any extra fields
      console.error('error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    } catch (logErr) {
      console.error('Failed to stringify error:', logErr);
      console.error(error);
    }

    // Handle common Sequelize errors with more useful messages
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }

    // Generic fallback
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await require("bcryptjs").compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
