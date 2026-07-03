module.exports = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/auth/login');
        }

        const hasAccess = roles.some(role => req.user.roles.includes(role));

        if (!hasAccess) {
            return res.status(403).json({ 
                success: false, 
                error: "شما دسترسی لازم را ندارید" 
            });
        }

        next();
    };
};