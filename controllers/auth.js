const  User  = require("./../models/User");
const CourseUser = require('./../models/Course-User');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("./../redis");


exports.showRegisterView = async (req, res) => {
    res.render("register.ejs", {messages: req.flash() })
}

exports.register = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const isUserExist = await User.findOne({
      $or: [{username, email}]
    });
    if (isUserExist) {
     return res.render("login", {
       messages: {
         error: "ایمیل یا نام کاربری تکراری است , لطقا لاگین کنید",
          redirect: "/auth/register",
        }
        });
    }
    const hashedPassword = await bcryptjs.hash(password, 12);
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      { id: user.id, role: user.roles },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS + "s" }
    );

      const hashedAcceessToken = await bcryptjs.hash(accessToken, 12);


    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET_KEY ,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS + "s" }
    );
    const hashedRefreshToken = await bcryptjs.hash(refreshToken, 12);

    await redis.set(
      `refreshToken:${user.id}`,
      hashedRefreshToken,
      "EX",
      process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS
    );

      res.cookie("accessToken", accessToken, {
         httpOnly: true,
         maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
         httpOnly: true,
         maxAge: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000
      });

      res.locals.user = user

     return res.render("index", {
         messages: {
          success: "ثبت نام شما موفقیت آمیز بود , خوش آمدید",
           redirect: "/",
          }
        });
  } catch (error) {
    next(error);
  }
};

exports.showLoginView = (req, res) => {
  res.render("login.ejs", {messages: req.flash() })
}

exports.login = async (req, res, next) => {
  const user = req.user;

  

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS + "s" }
  );

  const hashedAcceessToken = await bcryptjs.hash(accessToken, 12);

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS + "s" }
  );
  const hashedRefreshToken = await bcryptjs.hash(refreshToken, 12);

  await redis.set(
    `refreshToken:${user.id}`,
    hashedRefreshToken,
    "EX",
    process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000
    
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000,
  });

  res.cookie("refreshToken",refreshToken, {
    httpOnly: true,
    maxAge: process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000,
  }); 

     return res.render("login", {
         messages: {
          success: "ورود شما موفقیت آمیز بود , خوش آمدید",
           redirect: "/",
          }
        });
        
};


exports.dashboard = async (req, res) => {
    try {
        const user = req.user;
        
        const enrollments = await CourseUser.find({ user: user._id })
            .populate('course')
            .sort({ createdAt: -1 });
        
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

exports.showUpdateProfile = async (req, res) => {
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

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, bio } = req.body;
        const userId = req.user._id
        
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
        
        await User.findByIdAndUpdate(userId, updateData);
        
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

exports.logOut = async (req, res) => {
  const redisKey = `refreshToken:${req.user.id}`;
  await redis.del(redisKey);
  return res.render("logout.ejs",{ message: "User Logged Out Successfully" });
};
