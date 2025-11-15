const router = require("express").Router();
const { User } = require("../models");

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
    res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser.id });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }

    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
