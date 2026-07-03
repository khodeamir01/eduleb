const express = require("express");
const router = express.Router();
const  auth  = require("../middlewares/auth");
const roleGuard = require("../middlewares/roleGuard");
const dashboardController = require("../controllers/dashboard");

// پنل ادمین
router.get("/admin", auth, roleGuard("ADMIN"), dashboardController.adminPanel);
// router.get("/admin/users", auth, roleGuard("ADMIN"), dashboardController.adminUsers);
// router.get("/admin/users/:id", auth, roleGuard("ADMIN"), dashboardController.adminUserDetail);
// router.get("/admin/banned", auth, roleGuard("ADMIN"), dashboardController.adminBannedUsers);
router.put("/admin/change-role", auth, roleGuard("ADMIN"), dashboardController.adminChangeRole);
router.post("/admin/ban", auth, roleGuard("ADMIN"), dashboardController.adminBanUser);
router.post("/admin/unban", auth, roleGuard("ADMIN"), dashboardController.adminUnbanUser);
// پنل مدرس
router.get("/teacher", auth, roleGuard("TEACHER"), dashboardController.teacherPanel);

// پنل نویسنده
router.get("/author", auth, roleGuard("AUTHOR"), dashboardController.authorPanel);

// پنل کاربر عادی
router.get("/user", auth, roleGuard("USER"), dashboardController.userPanel);

// یا یه روت کلی که خودش تشخیص بده
router.get("/", auth, dashboardController.panel);

module.exports = router;