const User = require('./../models/User');
const CourseUser = require('./../models/Course-User');

// نمایش داشبورد
exports.dashboard = async (req, res) => {
    try {
        const user = req.user;
        
        // دوره‌هایی که کاربر خریداری کرده
        const enrollments = await CourseUser.find({ user: user._id })
            .populate('course')
            .sort({ createdAt: -1 });
        
        // آمار
        const totalCourses = enrollments.length;
        const totalSpent = enrollments.reduce((sum, item) => sum + item.price, 0);
        
        return res.render('Admin/dashboard', {
            user,
            enrollments,
            totalCourses,
            totalSpent,
            title: 'داشبورد کاربری'
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).render('dashboard.ejs', { message: 'خطا در دریافت اطلاعات', redirect: "/dashboard" });
    }
};

// صفحه ویرایش پروفایل
exports.editProfile = async (req, res) => {
    try {
        res.render('edit_profile', {
            user: req.user,
            title: 'ویرایش پروفایل'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).render('dashboard.ejs', { message: 'خطا در دریافت اطلاعات',redirect: "/dashboard" });
    }
};

// به‌روزرسانی پروفایل
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, bio } = req.body;
        
        const updateData = {
            name,
            email,
            phone,
            bio,
            updatedAt: Date.now()
        };
        
        if (req.file) {
            updateData.avatar = req.file.filename;
        }
        
        await User.findByIdAndUpdate(req.user._id, updateData);
        
        req.flash('success', 'پروفایل با موفقیت به‌روزرسانی شد');
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error(error);
        return res.status(500).render('dashboard.ejs', { message: 'خطا در دریافت اطلاعات', redirect: "/dashboard" });

    }
};

// صفحه دوره‌های من
exports.myCourses = async (req, res) => {
    try {
        const enrollments = await CourseUser.find({ user: req.user._id })
            .populate('course')
            .sort({ createdAt: -1 });
        
        res.render('my_courses', {
            enrollments,
            title: 'دوره‌های من'
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'خطا در دریافت دوره‌ها' });
    }
};