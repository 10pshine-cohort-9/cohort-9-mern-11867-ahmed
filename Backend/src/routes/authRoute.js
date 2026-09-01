import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

/**
 * Validates and sanitizes username and password from request body.
 * Returns { sanitizedUsername, password } on success, or sends a 400 response.
 */
const parseCredentials = (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    res.status(400).json({ message: "Username and password are required" });
    return null;
  }
  const { username, password } = req.body;
  // Prevent NoSQL injection: ensure username is a plain string
  if (typeof username !== "string" || username.trim() === "") {
    res.status(400).json({ message: "Invalid username format" });
    return null;
  }
  return { sanitizedUsername: username.trim(), password };
};

router.post("/register", async (req, res, next) => {
  const credentials = parseCredentials(req, res);
  if (!credentials) return;
  const { sanitizedUsername, password } = credentials;

  try {
    const existingUser = await User.findOne({ username: sanitizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    const user = await User.create({
      username: sanitizedUsername,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already exists" });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const credentials = parseCredentials(req, res);
  if (!credentials) return;
  const { sanitizedUsername, password } = credentials;

  try {
    const user = await User.findOne({ username: sanitizedUsername });

    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "invalid password!" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
});


router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put("/change-password", authMiddleware, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Both current and new password are required" });
  }
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  if (!PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      message: "New password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character.",
    });
  }
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = await bcryptjs.hash(newPassword, 8);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
