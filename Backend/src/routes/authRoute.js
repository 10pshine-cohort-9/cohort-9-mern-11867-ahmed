import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
}

router.post("/register", async (req, res, next) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 8);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "user not found!" });
    }

    const isPasswordValid = bcryptjs.compareSync(password, user.password);
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

router.post("/logout", (req, res) => {
  res.json({ message: "Successfully logged out" });
});

export default router;
