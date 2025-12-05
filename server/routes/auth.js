const router = require("express").Router();
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");
const { logError, getErrorResponse } = require("../utils/logger");
const { generateToken } = require("../utils/jwtHelper");

router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
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

    const token = generateToken(newUser);

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
    logError(error, "Auth Registration Error");

    const { status, json } = getErrorResponse(error);
    res.status(status).json(json);
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

// Request password reset - sends email with reset token
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user with resetToken fields included
    const user = await User.unscoped().findOne({ where: { email } });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.json({
        message: "Password reset link has been sent",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(
      Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRY)
    );

    // Save token to database
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken);

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.json({
      message: "Password reset link has been sent",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify reset token validity
router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.unscoped().findOne({
      where: { resetToken: token },
    });

    if (!user) {
      return res.json({ valid: false, message: "Invalid reset token" });
    }

    // Check if token has expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.json({ valid: false, message: "Reset token has expired" });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error("Error in verify-reset-token:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Find user with valid token
    const user = await User.unscoped().findOne({
      where: { resetToken: token },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Check if token has expired
    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Update password (beforeSave hook will hash it automatically)
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in reset-password:", error);

    // Handle validation errors
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }

    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
