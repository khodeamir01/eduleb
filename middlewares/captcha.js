const redis = require("./../redis");

module.exports = async (req, res, next) => {
  try {
    const { captcha, uuid } = req.body;

    if (!captcha || !uuid) {
      return res.render("login", {
        messages: {
          error: "لطفا کد اعتبار سنجی را وارد کنید",
          redirect: "/auth/login",
        },
      });
    }

    const savedCaptcha = await redis.get(`captcha:${uuid}`);

    if (!savedCaptcha) {
      return res.render("login", {
        messages: {
          error: "کد اعتبار سنحی منقضی شده است لطفا دوباره امتحان کنید",
          redirect: "/auth/login",
        },
      });
    }

    if (captcha.toLowerCase() !== savedCaptcha) {
      return res.render("login", {
        messages: {
          error: "!کد اعتبار سنحی صحیح نمیباشد",
          redirect: "/auth/login",
        },
      });
    }

    // حذف کپچا بعد از اعتبارسنجی
    await redis.del(`captcha:${uuid}`);

    next();
  } catch (err) {
    next(err);
  }
};
