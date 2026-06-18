const express = require("express");
const Controller = require("./../controllers/auth");
const registerSchema = require("./../validators/register");
const loginSchema = require("./../validators/login")
const validate = require("./../middlewares/validate");
const captcha = require("./../middlewares/captcha");
const passport = require("passport");
const auth = require("../middlewares/auth");
const { multerStorage } = require("../utils/multerConfigs");
const upload = multerStorage("public/assets/img");



const router  = express.Router();

router.route("/register").get(Controller.showRegisterView).post(validate(registerSchema),Controller.register);
router.route("/login").get(Controller.showLoginView).post(validate(loginSchema), captcha , Controller.login);  
router.route("/me").get(auth, Controller.dashboard)
router.get('/me/edit', auth, Controller.showUpdateProfile);
router.post('/me/update', auth, upload.single('avatar'), Controller.updateProfile);
router.get('/me/my-courses', auth, Controller.myCourses);
router.route("/logout").post(auth, Controller.logOut);
router.route("/google").get(passport.authenticate("google", {scope: ["profile", "email"]}));
router.route("/google/callback").get(passport.authenticate("google", {session: false}), Controller.login);
module.exports = router
