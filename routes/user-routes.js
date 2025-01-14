const express = require("express");
const router = express.Router();
const uploadMiddlware = require("../middlewares/upload-middleware");
const userControllers = require("../controllers/user-controllers");
const {
  registerValidator,
  sendMailVerificationValidator,
  forgotPasswordValidator
} = require("../helpers/validation");
const randomstring = require('randomstring');
const PasswordReset = require('../models/passwordReset');

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

router.post("/forgot-password", forgotPasswordValidator, userControllers.forgotPassword );

module.exports = router;
