const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user-controllers");
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

router.get('/mail-verification', userControllers.mailVerification);
router.get('/reset-password', userControllers.resetPassword);
router.post('/reset-password', userControllers.updatePassword);
router.get('/reset-success', userControllers.resetSuccess);

module.exports = router;
