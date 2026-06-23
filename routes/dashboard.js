const express = require("express");
const router = express.Router();
const  auth  = require("../middlewares/auth");
const roleGuard = require("../middlewares/roleGuard");
const dashboardController = require("../controllers/dashboard");

// پنل ادمین
router.get("/admin", auth, roleGuard("ADMIN"), dashboardController.adminPanel);

// پنل مدرس
router.get("/teacher", auth, roleGuard("TEACHER"), dashboardController.teacherPanel);

// پنل نویسنده
// router.get("/author", auth, roleGuard("AUTHOR"), dashboardController.authorPanel);

// پنل کاربر عادی
router.get("/user", auth, roleGuard("USER"), dashboardController.userPanel);

// یا یه روت کلی که خودش تشخیص بده
router.get("/", auth, dashboardController.panel);

module.exports = router;