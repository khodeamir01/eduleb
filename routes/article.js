const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const roleGuard = require("../middlewares/roleGuard");
const Controller = require("../controllers/article");
const multer = require("multer");

const upload = multer({
    storage: multer.diskStorage({
        destination: "public/assets/img/blog",
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        }
    })
});

router.get("/create", auth, roleGuard("AUTHOR"), Controller.showCreateArticlePage) 
router.get("/", Controller.getAll);
router.get("/:slug", Controller.getOne);



// نیاز به احراز هویت
router.post("/", auth, roleGuard("AUTHOR"), upload.single("cover"), Controller.create);
router.put("/:id", auth, roleGuard("AUTHOR", "ADMIN"), Controller.update);
router.delete("/:id", auth, roleGuard("AUTHOR", "ADMIN"), Controller.remove);

router.get("/edit/:id", auth, roleGuard("AUTHOR", "ADMIN"), Controller.edit);

// لایک و کامنت
router.post("/:id/comment", auth, Controller.addComment);

// مقالات نویسنده
router.get("/my/articles", auth, Controller.getMyArticles);



module.exports = router;