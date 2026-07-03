const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const redis = require("./../redis");

const auth = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;

    // اگر اکسس توکن وجود دارد
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
            req.user = await User.findById(decoded.id).select("-password");
            return next(); 
        } catch (err) {
            console.log("Access Token invalid, checking Refresh Token...");
        }
    }

    // اگر رفرش توکن وجود دارد
    if (refreshToken) {
        try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
            
            const storedHash = await redis.get(`refreshToken:${decodedRefresh.id}`);
            
            if (!storedHash) {
                req.user = null;
                return next();
            }

            const isMatch = await bcrypt.compare(refreshToken, storedHash);

            if (isMatch) {
                const user = await User.findById(decodedRefresh.id).select("-password");
                if (!user) {
                    req.user = null;
                    return next();
                }

                const newAccessToken = jwt.sign(
                    { id: user._id, role: user.role }, 
                    process.env.ACCESS_TOKEN_SECRET_KEY, 
                    { expiresIn: "15m" }
                );
                
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
            req.user = null;
            return next();
        }
    }

    // کاربر مهمان (بدون توکن) - به جای خطا، اجازه دسترسی بده
    req.user = null;
    next();
};

module.exports = auth;