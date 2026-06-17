const { Strategy: JwtStrategy } = require("passport-jwt");
const User  = require("./../models/User");
const bcryptjs = require("bcryptjs");


const cookieExtractor = async (req) => {
if (req?.cookies?.accessToken || null) {
  const accessToken = req?.cookies?.accessToken;
  console.log("accesstoken",accessToken);

  const decode = await bcryptjs.decodeBase64(accessToken)
  console.log("decode",decode);
}
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
