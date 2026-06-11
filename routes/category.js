const express = require("express");
const auth = require("../middlewares/auth");
const controller = require("./../controllers/category");




const router = express.Router();



router.get("/",auth , controller.findAllCategories)
router.get("/:href",auth , controller.getCategoryCourses)

module.exports = router