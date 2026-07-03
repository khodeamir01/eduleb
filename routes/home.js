const express = require("express");
const auth = require("../middlewares/auth");
const Course = require("./../models/Course");
const Category= require("./../models/Category");
const Article= require("./../models/Article");



const router = express.Router();



router.get("/", auth, async (req, res) => {
    try {
        const user = req.user || null;        
        const courses = await Course.find({}).populate("categoryID");
        const categories = await Category.find({})
        const articles = await Article.find({ status: "published" })
        .populate("title", "tags")
        .sort({ createdAt: -1 })
        .limit(3) 
        .lean()

        const totalCourses = await Course.countDocuments();

        res.render("index.ejs", { 
            courses: courses, 
            categories: categories ,
            totalCourses: totalCourses ,
            articles: articles,
            user: user
        });

    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).send("خطای سرور در دریافت اطلاعات");
    }
});


module.exports = router