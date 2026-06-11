const svgCaptcha = require("svg-captcha");
const redis = require("./../redis");
const uuidv4 = require("uuidv4")

exports.get = async (req, res, next) => {
const captcha = svgCaptcha.create({size: 4 , noise: 10});

const uuid = uuidv4();
await redis.set(`captcha:${uuid}`, captcha.text.toLowerCase(), "EX", 60 * 5);
res.json({uuid, captcha: captcha.data})
};
