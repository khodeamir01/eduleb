const { Strategy: JwtStrategy } = require("passport-jwt");
const bcryptjs = require("bcryptjs");
const User  = require("./../models/User");
const redis = require("./../redis");

const refreshCookieExtractor = (req) => {
  return req?.cookies?.refreshToken || null;
};

module.exports = new JwtStrategy(
  {
    jwtFromRequest: refreshCookieExtractor,
    secretOrKey: process.env.REFRESH_TOKEN_SECRET_KEY,
    passReqToCallback: true
  },
  async (req, payload, done) => {
    try {
      const user = await User.findById(payload.id).select("-password")

      if (!user) return done(null, false);

      const hashedToken = await redis.get(`refreshToken:${user.id}`);
      if (!hashedToken) return done(null, false);

      const isValid = await bcryptjs.compare(
        req.cookies.refreshToken,
        hashedToken
      );


      if (!isValid) return done(null, false);

      return done(null, user);
    } catch (err) {
      done(err, false);
    }
  }
);
