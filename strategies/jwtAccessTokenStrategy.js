const { Strategy: JwtStrategy } = require("passport-jwt");
const User  = require("./../models/User");

const cookieExtractor = (req) => {
  return req?.cookies?.accessToken || null;
};

module.exports = new JwtStrategy({
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.ACCESS_TOKEN_SECRET_KEY
},
  async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select("-password")

      if (!user) return done(null, false);

      return done(null, user);
      
    } catch (err) {
      done(err, false);
    }
  }
);
