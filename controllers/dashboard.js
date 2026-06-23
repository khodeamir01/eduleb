const Order = require("../models/Order");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Session = require("../models/Session");
const Course = require("../models/Course");
// const Article = require("../models/Article");

// ========== پنل خودکار (تشخیص نقش) ==========
exports.panel = async (req, res) => {
    const user = req.user;
    
    if (user.roles.includes("ADMIN")) return res.redirect("/dashboard/admin");
    if (user.roles.includes("TEACHER")) return res.redirect("/dashboard/teacher");
    if (user.roles.includes("AUTHOR")) return res.redirect("/dashboard/author");
    
    return res.redirect("/dashboard/user");
};

// ========== ADMIN ==========
exports.adminPanel = async (req, res) => {
    const data = {
        user: req.user,
        totalUsers: await User.countDocuments(),
        totalCourses: await Course.countDocuments(),
        totalComments: await Comment.countDocuments(),
        totalOrders: await Order.countDocuments(),
        totalSessions: await Session.countDocuments(),
        // totalArticles: await Article.countDocuments(),
        recentOrders: await Order.find()
            .populate("user", "name email")
            .populate("items.course", "name")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
    };
    
  return res.render("Admin/dashboard", data);
};

// ========== TEACHER ==========
exports.teacherPanel = async (req, res) => {
    const user = req.user;
    
    const mySessions = await Session.find({ creator: user._id })
        .populate("course", "name")
        .sort({ createdAt: -1 })
        .lean();

    const myCourses = await Course.find({ creator: user._id }).lean();
    const myCourseIds = myCourses.map(c => c._id);

    const courseComments = await Comment.find({ course: { $in: myCourseIds } })
        .populate("user", "name")
        .populate("course", "name")
        .sort({ createdAt: -1 })
        .lean();

    res.render("dashboard/teacher", { user, mySessions, courseComments });
};

// ========== AUTHOR ==========
// exports.authorPanel = async (req, res) => {
//     const myArticles = await Article.find({ author: req.user._id })
//         .sort({ createdAt: -1 })
//         .lean();

//     res.render("dashboard/author", { user: req.user, myArticles });
// };

// ========== USER ==========
exports.userPanel = async (req, res) => {
    const user = req.user;
    
    const orders = await Order.find({ user: user._id })
        .populate("items.course", "name href cover")
        .sort({ createdAt: -1 })
        .lean();

    const myCourses = [];
    orders.forEach(order => {
        order.items.forEach(item => {
            if (item.course) {
                myCourses.push({
                    course: item.course,
                    purchaseDate: order.createdAt,
                    price: item.priceAtTimeOfPurchase
                });
            }
        });
    });

    const myComments = await Comment.find({ user: user._id })
        .populate("course", "name href")
        .sort({ createdAt: -1 })
        .lean();

    res.render("dashboard/user", { user, myCourses, myComments });
};