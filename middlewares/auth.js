const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const redis = require("./../redis");

const auth = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
            req.user = await User.findById(decoded.id).select("-password");
            return next(); 
        } catch (err) {
            console.log("Access Token invalid, checking Refresh Token...");
        }
    }

    if (refreshToken) {
        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
            
            // چک کردن در Redis
            const storedHash = await redis.get(`refreshToken:${decodedRefresh.id}`);
            
            if (!storedHash) {
                return res.status(401).render("login.ejs", { messages: { error: "نشست شما منقضی شده است" } });
            }

            const isMatch = await bcrypt.compare(refreshToken, storedHash);

            if (isMatch) {
                // پیدا کردن کاربر
                const user = await User.findById(decodedRefresh.id).select("-password");
                if (!user) return res.status(401).render("login.ejs", { messages: { error: "کاربر یافت نشد" } });

                // تولید اکسس توکن جدید
                const newAccessToken = jwt.sign(
                    { id: user._id, role: user.role }, 
                    process.env.ACCESS_TOKEN_SECRET_KEY, 
                    { expiresIn: "15m" }
                );
                
                // ست کردن کوکی جدید
                res.cookie("accessToken", newAccessToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict" 
                });

                req.user = user;
                return next();
            }
        } catch (err) {
            console.error("Refresh Token Error:", err);
            // رفرش توکن هم نامعتبر است
        }
    }

    return res.status(401).render("login.ejs", { messages: { error: "لطفا ابتدا وارد شوید" } });
};

module.exports = auth;
