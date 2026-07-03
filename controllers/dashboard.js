const Order = require("../models/Order");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Session = require("../models/Session");
const Course = require("../models/Course");
const Ban = require("../models/Ban");
const Article = require("../models/Article");

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
    const [
        totalUsers, totalCourses, totalComments, 
        totalOrders, totalSessions,
        // totalArticles,
        allUsers, bans
    ] = await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Comment.countDocuments(),
        Order.countDocuments(),
        Session.countDocuments(),
        // Article.countDocuments(),
        User.find({}).select("-password").sort({ createdAt: -1 }).lean(),
        Ban.find({}).lean()
    ]);

       // ========== اضافه کردن isBanned به هر کاربر ==========
       const bannedEmails = new Set(
        bans.map(b => b.email?.toLowerCase().trim()).filter(Boolean)
    );

    // اینجا isBanned رو اضافه کن
    allUsers.forEach(u => {
        const userEmail = (u.email || '').toLowerCase().trim();
        u.isBanned = userEmail !== '' && bannedEmails.has(userEmail);
    });
    return res.render("dashboard/admin/admin.ejs", {
        user: req.user,
        activePage: "dashboard",
        totalUsers,
        totalCourses,
        totalComments,
        totalOrders,
        totalSessions,
        // totalArticles,
        allUsers
        
    });
};

// تغییر نقش کاربر
exports.adminChangeRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        
        // اعتبارسنجی
        const validRoles = ["USER", "TEACHER", "AUTHOR", "ADMIN"];
        if (!validRoles.includes(role)) {
            return res.json({ 
                success: false, 
                error: "نقش نامعتبر است" 
            });
        }

        if (!userId) {
            return res.json({ 
                success: false, 
                error: "آیدی کاربر الزامی است" 
            });
        }

        // پیدا کردن کاربر
        const targetUser = await User.findById(userId);
        
        if (!targetUser) {
            return res.json({ 
                success: false, 
                error: "کاربر مورد نظر یافت نشد" 
            });
        }

        // ادمین نمی‌تونه نقش خودش رو عوض کنه (اختیاری - برای امنیت)
        if (userId === req.user._id.toString()) {
            return res.json({ 
                success: false, 
                error: "نمی‌توانید نقش خود را تغییر دهید" 
            });
        }

        // آپدیت نقش کاربر
        await User.findByIdAndUpdate(userId, { 
            roles: [role]  // آرایه roles رو با نقش جدید جایگزین کن
        });

        console.log(`User ${targetUser.name} role changed to ${role} by admin ${req.user.name}`);

        return res.json({ 
            success: true, 
            message: `نقش کاربر ${targetUser.name} با موفقیت به ${role} تغییر کرد`,
            data: {
                userId: userId,
                newRole: role
            }
        });

    } catch (error) {
        console.error("Change role error:", error);
        return res.json({ 
            success: false, 
            error: "خطا در تغییر نقش کاربر" 
        });
    }
};

// بن کردن کاربر
exports.adminBanUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const targetUser = await User.findById(userId);
        console.log("targetUser", targetUser);
        if (!targetUser) {
            return res.json({ success: false, error: "کاربر یافت نشد" });
        }

        // ادمین نمی‌تونه خودش رو بن کنه
        if (userId === req.user._id.toString()) {
            return res.json({ success: false, error: "نمی‌توانید خود را بن کنید" });
        }

        // چک کردن تکراری نبودن
        const existingBan = await Ban.findOne({ email: targetUser.email });
        console.log("existingBan", existingBan);

        if (existingBan) {
            return res.json({ success: false, error: "این کاربر قبلاً بن شده است" });
        }

        // ثبت در مدل Ban
        await Ban.create({ 
            email: targetUser.email 
        });

        console.log(`User ${targetUser.name} (${targetUser.email}) banned by admin ${req.user.name}`);

        return res.json({ 
            success: true, 
            message: `کاربر ${targetUser.name} با موفقیت بن شد` 
        });

    } catch (error) {
        console.error("Ban error:", error);
        return res.json({ success: false, error: "خطا در بن کردن کاربر" });
    }
};

// آنبن کردن کاربر
exports.adminUnbanUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.json({ success: false, error: "کاربر یافت نشد" });
        }

        // حذف از مدل Ban
        const result = await Ban.deleteOne({ email: targetUser.email });

        if (result.deletedCount === 0) {
            return res.json({ success: false, error: "این کاربر بن نشده بود" });
        }

        console.log(`User ${targetUser.name} (${targetUser.email}) unbanned by admin ${req.user.name}`);

        return res.json({ 
            success: true, 
            message: `کاربر ${targetUser.name} با موفقیت آنبن شد` 
        });

    } catch (error) {
        console.error("Unban error:", error);
        return res.json({ success: false, error: "خطا در آنبن کردن کاربر" });
    }
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

exports.authorPanel = async (req, res) => {
    const myArticles = await Article.find({ author: req.user._id })
        .sort({ createdAt: -1 })
        .lean();

   return res.render("dashboard/author/author.ejs", { user: req.user, myArticles });
};


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