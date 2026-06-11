const passport = require("passport");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  passport.authenticate("accessToken", { session: false }, (err, user) => {
    console.log("useraccesstoken",user);
    if (err) return next(err);

    if (user) {
      req.user = user;
      return next();
    }

    // اگر accessToken نبود، میریم سراغ refreshToken
    passport.authenticate("refreshToken", { session: false }, (err, refreshUser) => {
      console.log("userrefreshtoken",user);

      if (err) return next(err);

      if (!refreshUser) {
        return res.render("login.ejs", {
          messages: {
            error: "Unauthorized, Please Login !",
            redirect: "/auth/login"
          }
        });
      }

      // فقط وقتی refreshUser معتبر باشه این بخش اجرا میشه
      const newAccessToken = jwt.sign(
        { id: refreshUser.id, role: refreshUser.role },
       process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "15m" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true
      });

      req.user = refreshUser;
      next();
    })(req, res, next);
  })(req, res, next);
};
