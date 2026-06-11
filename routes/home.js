const express = require("express");
const auth = require("../middlewares/auth");
const Course = require("./../models/Course");
const Category= require("./../models/Category");



const router = express.Router();



router.get("/", auth, async (req, res) => {
    try {
        const user = req.user
        console.log(user);
        // 1. واکشی اطلاعات با populate برای دسته‌بندی
        const courses = await Course.find({}).populate("categoryID");
        const categories = await Category.find({})

        // 2. شمردن کل دوره‌ها
        const totalCourses = await Course.countDocuments();

        res.render("index.ejs", { 
            courses: courses, 
            categories: categories ,
            totalCourses: totalCourses ,
            user: user
        });

    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).send("خطای سرور در دریافت اطلاعات");
    }
});


module.exports = router