const express = require("express");
const controller = require("./../controllers/comments"); // آدرس فایل کنترلر شما
const auth = require("./../middlewares/auth"); // میدل‌ورهای احراز هویت

const router = express.Router();

// مسیرهای عمومی
router.get("/all", controller.getAllComments); // دریافت همه کامنت‌ها (مخصوص پنل مدیریت)
router.get("/:href", controller.getComment);        // دریافت کامنت‌های یک محصول خاص

// مسیرهای نیازمند احراز هویت
router.post("/create", auth, controller.createComment);
router.post("/:commentId/reply", auth, controller.addReply);

// ویرایش و حذف
router.put("/:commentId", auth, controller.updateComment);
router.delete("/:commentId", auth, controller.removeComment);

// مسیرهای مربوط به پاسخ‌ها (Replies)
router.put("/:commentId/reply/:replyId", auth, controller.updateReply);
router.delete("/:commentId/reply/:replyId", auth, controller.removeReply);

module.exports = router;
