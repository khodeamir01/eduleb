const { errorResponse } = require("../helpers/responses")

module.exports = (role) => {
    return async (req, res, next) => {
        try {
            if (!req.user.roles.includes(role)) {
                return res.render("index", {
                    messages: {
                     error: " شما دسترسی لازم برای استفاده از این آدرس را ندارید",
                      redirect: "/",
                     }
                   });
            }

            next()

  
        } catch (error) {
            next(error)
        }
    }
}