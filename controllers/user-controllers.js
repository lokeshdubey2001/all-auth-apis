const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mailer = require("../helpers/mailer");
const PasswordReset = require("../models/passwordReset");
const randomstring = require("randomstring");
const JWT = require("jsonwebtoken");

const userRegister = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Errors",
        errors: errors.array(),
      });
    }
    const { name, email, mobile, password } = req.body;
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: "User already exist with this email",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      image: "images/" + req.file.filename,
    });
    const userData = await user.save();

    const msg =
      "<p>Hii " +
      name +
      ', Please <a href="http://localhost:3000/mail-verification?id=' +
      userData._id +
      '">verify</a> your email</p>';

    mailer.sendMail(email, "Email verification", msg);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const mailVerification = async (req, res) => {
  try {
    if (req.query.id === "undefined") {
      return res.render("404");
    }

    const userData = await User.findOne({ _id: req.query.id });

    if (userData.is_verified === true) {
      return res.render("mail-verification", {
        message: "Email has been already verified!",
      });
    }

    if (userData) {
      await User.findByIdAndUpdate(
        { _id: req.query.id },
        {
          $set: {
            is_verified: true,
          },
        }
      );

      return res.render("mail-verification", {
        message: "Email has been verified successfully",
      });
    } else {
      return res.render("mail-verification", { message: "User not found!" });
    }
  } catch (error) {
    console.log(error.message);
    return res.render("404");
  }
};

const sendMailVerification = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "Email doesn't exist",
      });
    }

    if (userData.is_verified === true) {
      return res.status(400).json({
        success: false,
        message: userData.email + "email already verified",
      });
    }

    const msg =
      "<p>Hii " +
      userData.name +
      ', Please <a href="http://localhost:3000/mail-verification?id=' +
      userData._id +
      '">verify</a> your email</p>';

    mailer.sendMail(userData.email, "Email verification", msg);

    res.status(200).json({
      success: true,
      message: "Verification link sent to your email, Please check",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Errors",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "Email doesn't exist",
      });
    }

    const randomString = randomstring.generate();
    const msg =
      "<p> Hii " +
      userData.name +
      ', Please click <a href="http://localhost:3000/reset-password?token=' +
      randomString +
      '">here</a> to reset your password</p>';

    await PasswordReset.deleteMany({ user_id: userData._id }); // delete duplicate entries in the database

    const passwordReset = new PasswordReset({
      user_id: userData._id,
      token: randomString,
    });

    await passwordReset.save();

    mailer.sendMail(userData.email, "Reset Password", msg);

    return res.status(201).json({
      success: true,
      message: "Reset password link sent to your email, please check.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    if (req.query.token == undefined) {
      return res.render("404");
    }

    const resetData = await PasswordReset.findOne({ token: req.query.token });

    if (!resetData) {
      return res.render("404");
    }

    return res.render("reset-password", { resetData });
  } catch (error) {
    res.render("404");
  }
};

const updatePassword = async (req, res) => {
  try {
    const { user_id, password, c_password } = req.body;

    const resetData = await PasswordReset.findOne({ user_id });

    if (password !== c_password) {
      return res.render("reset-password", {
        resetData,
        error: "Confirm password not matching!",
      });
    }

    const hasedPassword = await bcrypt.hash(c_password, 10);

    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          password: hasedPassword,
        },
      }
    );

    await PasswordReset.deleteMany({ user_id });

    return res.redirect("/reset-success");
  } catch (error) {
    res.render("404");
  }
};

const resetSuccess = (req, res) => {
  try {
    return res.render("reset-success");
  } catch (error) {
    res.render("404");
  }
};

const generateAccessToken = async (user) => {
  const token = await JWT.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
  });
  return token;
};

const loginUser = async (req, res) => {
  try {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        error: error.array(),
      });
    }

    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.status(401).json({
        success: false,
        msg: "email or password is incorrect",
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        msg: "email or password is incorrect",
      });
    }

    if (userData.is_verified === false) {
      return res.status(401).json({
        success: false,
        msg: "Please verify your account",
      });
    }

    const accessToken = await generateAccessToken({ user: userData });

    return res.status(200).json({
      success: true,
      msg: "Login successfully",
      user: userData,
      accessToken: accessToken,
      tokenType: "Bearer",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const userProfile = async (req, res) => {
  try {
    const userData = req.user.user;

    return res.status(200).json({
      success: true,
      msg: "User profile data",
      data: userData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }

    const { name, mobile } = req.body;

    const data = {
      name,
      mobile,
    };

    if (req.file !== undefined) {
      data.image = "image/" + req.file.filename;
    }

    const userData = await User.findByIdAndUpdate(
      { _id: req.user.user._id },
      {
        $set: data,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  userRegister,
  mailVerification,
  sendMailVerification,
  forgotPassword,
  resetPassword,
  updatePassword,
  resetSuccess,
  loginUser,
  userProfile,
  updateProfile,
};
