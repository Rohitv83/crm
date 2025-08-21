import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Role from '../models/Role.js';
import Plan from "../models/Plan.js";
import LoginAttempt from '../models/LoginAttempt.js'; // Import the new model

const router = express.Router();

// --- Nodemailer Transporter Setup (Defined once at the top) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
});


// === 1. REGISTRATION ROUTE (UPDATED FOR ADMIN ROLE) ===
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, address, companyName, companySize, industryType, password, plan } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const supportTicket = "CRM-" + Math.floor(100000 + Math.random() * 900000);

    const newUser = new User({
      name, email, phone, address, companyName, companySize, industryType,
      password: hashedPassword,
      plan,
      verificationToken,
      supportTicket,
      isVerified: false,
      role: 'admin', // New users who register are company admins
    });

    await newUser.save();
    console.log("User saved to DB with ID:", newUser._id);

    const verificationLink = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;
    await transporter.sendMail({
      from: `MyCRM <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email - MyCRM",
      html: `<p>Welcome to MyCRM! Please click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });

    res.json({ message: "Registration successful! Check your email for verification link." });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// === 2. EMAIL VERIFICATION ROUTE ===
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).send("<h1>Invalid or expired verification link.</h1>");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);

  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).send("<h1>Server error during email verification.</h1>");
  }
});


// === 3. LOGIN ROUTE (UPDATED TO LOG ATTEMPTS) ===
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // --- NEW: Function to log the attempt ---
  const logAttempt = async (isSuccess) => {
    try {
      await LoginAttempt.create({
        email,
        success: isSuccess,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    } catch (logError) {
      console.error("Failed to log login attempt:", logError);
    }
  };

  try {
    const user = await User.findOne({ email });
    if (!user) {
      await logAttempt(false); // Log failed attempt
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logAttempt(false); // Log failed attempt
      return res.status(400).json({ message: "Invalid credentials." });
    }

    if (!user.isVerified) {
      await logAttempt(false); // Log failed attempt
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    await logAttempt(true); // Log successful attempt

    // Fetch permissions based on role and plan
    const roleDetails = await Role.findOne({ name: user.role });
    const planDetails = await Plan.findOne({ identifier: user.plan });
    const rolePermissions = roleDetails ? roleDetails.permissions : [];
    const planPermissions = planDetails ? planDetails.permissions : [];

    let finalPermissions = [];
    if (user.role === 'superadmin') {
        finalPermissions = rolePermissions;
    } else {
        finalPermissions = rolePermissions.filter(p => planPermissions.includes(p));
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        supportTicket: user.supportTicket,
        role: user.role,
        permissions: finalPermissions,
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// === 4. FORGOT PASSWORD ROUTE ===
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If a user with that email exists, a password reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = Date.now() + 900000; // 15 minutes

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password. The link will expire in 15 minutes.</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `;

    await transporter.sendMail({
      from: `MyCRM <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request - MyCRM",
      html: message,
    });

    res.json({ message: "Password reset link sent to your email." });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// === 5. RESET PASSWORD ROUTE ===
router.put("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired." });
    }

    user.password = await bcrypt.hash(req.body.password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
