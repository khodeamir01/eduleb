const User  = require("./../models/User");
const localStrategy = require("passport-local").Strategy;
const bcryptjs = require("bcryptjs")


module.exports = new localStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      console.log("UserInLocalStrategy", user);

      if (!user) {
        return done(null, false, { message: " !کاربر یافت نشد" });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return done(null, false, { message:  "!نام کاربری یا رمز عبور صحیح نمیباشد" });
      }

      
      if (!user) {
        return res.render("login", {
          messages: {
            error: "!نام کاربری یا رمز عبور صحیح نمیباشد",
              redirect: "/auth/login"
          }
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);


// const { User } = require("../db");
// const localStrategy = require("passport-local").Strategy;
// const bcryptjs = require("bcryptjs")

// module.exports = new localStrategy (async (username, password, done) => {
//     const user = await User.findOne({
//         where: {
//             username
//         },
//         raw: true
//     });
//     if (!user) return done(null, false);

//     const isPasswordValid = await bcryptjs.compare(password, user.password);
//     if (!isPasswordValid) return done (null, false);

//     return done(null, user)

// })

