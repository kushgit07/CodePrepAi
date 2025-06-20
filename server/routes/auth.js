const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        console.log("User already exists:", email);
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Create new user
      user = new User({
        name,
        email,
        password,
      });

      // Save user to database
      await user.save();
      console.log("User registered successfully:", email);

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
        },
      };

      // Sign and return JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "10h" },
        (err, token) => {
          if (err) {
            console.error("JWT error:", err.message);
            return res.status(500).json({
              success: false,
              message: "Error generating authentication token",
            });
          }
          res.status(201).json({
            success: true,
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      console.error("Registration error:", err.message);
      if (err.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: Object.values(err.errors).map((e) => e.message),
        });
      }
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
      });
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Login validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        console.log("Invalid login attempt - user not found:", email);
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        console.log("Invalid login attempt - password mismatch:", email);
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      console.log("User logged in successfully:", email);

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "10h" },
        (err, token) => {
          if (err) {
            console.error("JWT error during login:", err.message);
            return res.status(500).json({
              success: false,
              message: "Error generating authentication token",
            });
          }
          res.json({
            success: true,
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      console.error("Login error:", err.message);
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
      });
    }
  }
);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Error fetching user data:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
    });
  }
});


router.put("/users/profile", auth, async (req, res) => {
  try {
    // Get user from database (excluding password)
    let user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update basic user fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;

    // Handle profile updates
    if (req.body.profile) {
      user.profile = {
        ...user.profile,
        ...req.body.profile,
      };
    }

    // Handle password update if provided
    if (req.body.currentPassword && req.body.newPassword) {
      // Verify current password
      const isMatch = await user.comparePassword(req.body.currentPassword);

      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }

      // Update to new password
      user.password = req.body.newPassword;
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
