const express = require("express");
const router = express.Router();
const uploadMiddlware = require("../middlewares/upload-middleware");
const authMiddleware = require("../middlewares/auth-middleware");
const userControllers = require("../controllers/user-controllers");
const {
  registerValidator,
  sendMailVerificationValidator,
  forgotPasswordValidator,
  loginValidator,
  updateProfileValidator,
} = require("../helpers/validation");
const randomstring = require("randomstring");
const PasswordReset = require("../models/passwordReset");

router.post(
  "/register",
  uploadMiddlware.single("image"),
  registerValidator,
  userControllers.userRegister
);
router.post(
  "/send-mail-verification",
  sendMailVerificationValidator,
  userControllers.sendMailVerification
);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  userControllers.forgotPassword
);
router.post("/login", loginValidator, userControllers.loginUser);

//authenticated routes
router.get("/profile", authMiddleware, userControllers.userProfile);
router.post(
  "/update-profile",
  authMiddleware,
  uploadMiddlware.single("image"),
  updateProfileValidator,
  userControllers.updateProfile
);

module.exports = router;
