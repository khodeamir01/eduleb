const GoogleStrategy = require("passport-google-oauth20");
const { default: slugify } = require("slugify");
const { User } = require("../db");
const configs = require("../configs");

module.exports = new GoogleStrategy(
  {
    clientID: configs.auth.google.clientID,
    clientSecret: configs.auth.google.clientSecret,
    callbackURL: `${configs.domain}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;

    let user = await User.findOne({
      where: { email },
    });
    console.log(profile);

    if (user) return done(null, user);

    const familyName = profile.name.familyName || "";
    const name = `${profile.name.givenName} ${familyName}`.trim();

    const username =
      slugify(name, { lower: true }).replace(/[.\-\/]/g, "") +
      Math.floor(Math.random() * 9000);
    const avatar = profile.photos?.[0]?.value || null;

    await User.create({
      name,
      username,
      email,
      avatar,
      provider: "google",
    });
    done(null, user);
  }
);
