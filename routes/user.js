// روت‌های داشبورد
const express = require("express");
const Controller = require("./../controllers/user");
const auth = require("./../middlewares/auth");

const { multerStorage } = require("../utils/multerConfigs");
const upload = multerStorage("public/assets/img");


const router = express.Router();


router.get('/', auth, Controller.dashboard);
router.get('/edit', auth, Controller.editProfile);
router.post('/update', auth, upload.single('avatar'), Controller.updateProfile);
router.get('/my-courses', auth, Controller.myCourses);




module.exports = router