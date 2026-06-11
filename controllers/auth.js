const  User  = require("./../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("./../redis");


exports.showRegisterView =async (req, res) => {
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
         error: "Email or Username Already Exist, Please Login",
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

      res.cookie("refreshToken", hashedRefreshToken, {
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

  res.cookie("accessToken", hashedAcceessToken, {
    httpOnly: true,
    maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000,
  });

  res.cookie("refreshToken",hashedRefreshToken, {
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

exports.getMe = async (req, res) => {
  const user = req.user;
  return res.json(user);
};

exports.refreshToken = async (req, res) => {
  const user = req.user;

  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS + "s" }
  );

    res.cookie("accesstoken", accessToken, {
    httpOnly: true,
    maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000
  });


};

exports.logOut = async (req, res) => {
  const redisKey = `refreshToken:${req.user.id}`;
  await redis.del(redisKey);
  return res.json({ message: "User Logged Out Successfully" });
};
