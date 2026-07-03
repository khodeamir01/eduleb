const Ban = require("../models/Ban");

module.exports = async (req, res, next) => {
    try {
        if (req.user && req.user.email) {
            const isBanned = await Ban.findOne({ 
                email: req.user.email.toLowerCase() 
            });
            
            if (isBanned) {
                res.clearCookie('token');
                return res.render("index", {
                    messages: {
                        error: "اکانت شما مسدود شده است",
                        redirect: "/auth/login"
                    }
                });
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};