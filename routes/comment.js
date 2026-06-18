const express = require("express");
const controller = require("./../controllers/comments"); // آدرس فایل کنترلر شما
const auth = require("./../middlewares/auth"); // میدل‌ورهای احراز هویت

const router = express.Router();

router.get("/all", controller.getAllComments); // دریافت همه کامنت‌ها (مخصوص پنل مدیریت)

router.post("/:href/create", auth, controller.createComment);

router.post("/:commentId/reply", auth, controller.addReply);

router.delete("/:commentId", auth, controller.removeComment);

router.delete("/:commentId/reply/:replyId", auth, controller.removeReply);

module.exports = router;
