const express = require("express");
const multer = require("multer");
const auth = require("./../middlewares/auth");
const Controller = require("./../controllers/course");
const { multerStorage } = require("../utils/multerConfigs");
const upload = multerStorage("public/assets/img");

const router = express.Router();

router
  .route("/create")
  .post(
    upload.single(
      "cover"
    ),
    auth,
    Controller.create
  )

  router.route("/").get(Controller.showCreateCoursePanel)

  router.route("/getAll").get(Controller.getAllCourses);

  router.route("/:href").get(auth,Controller.getOneCourse);


router
  .route("/:courseId/sessions")
  .post(
    multer({ storage: multerStorage, limits: { filesize: 1000000000 } }).single(
      "video"
    ),
    auth,
    Controller.createSession
  );

// router
//   .route("/sessions")
//   .get(auth, Controller.getAllSession);

// router.route("/categories/:href").get(Controller.getAllByCategory);
// // router.route("/:href/:sessionsID").get(Controller.getSessionInfo);

// router
//   .route("/sessions/:id")
//   .delete(auth, Controller.removeSession);

// router.route("/:id/register").post(auth, Controller.register);
// router.route("/:href").get( auth,Controller.getOne);


module.exports = router;
