const express = require("express");
const path = require("path");
const flash = require('express-flash');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const homeRouter = require("./routes/home.js")
const courseRouter = require("./routes/course.js")
const authRouter = require("./routes/auth.js")
const captchaController = require("./controllers/captcha.js")
const categoriesRouter = require("./routes/category.js")
const searchRouter = require("./routes/search.js")
const dashboardRouter = require("./routes/dashboard.js")
const commentsRouter = require("./routes/comment.js")
const cartRouter = require("./routes/cart.js")
const checkoutRouter = require("./routes/checkout.js")
const checkBan = require("./middlewares/checkBan.js");
const articlesRouter = require("./routes/article.js");
const passport = require("passport");
const { Strategy: JwtStrategy } = require("passport-jwt");




const { setHeaders } = require("./middlewares/headers.js");
const { errorHandler } = require("./middlewares/errorHandler.js");

const app = express();
// Nodemailer  TODO ------------------------------------------------------------------------->

app.use(session({
    secret: "Secret Key",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());

app.use(express.static(path.resolve(__dirname, "public/assets")));
app.use("/css",express.static(path.resolve(__dirname, "public/assets/css")));
app.use("/js",express.static(path.resolve(__dirname, "public/assets/js")));
app.use("/fonts",express.static(path.resolve(__dirname, "public/assets/fonts")));
app.use("/images",express.static(path.resolve(__dirname, "public/assets/images")));
app.use("/bootstrap",express.static(path.resolve(__dirname, "public/assets/bootstrap")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({limit:"30mb", extended: true}));
app.use(express.json({limit: "30mb"}))
app.use(setHeaders);

//* Routers

app.use(checkBan); // قبل از همه روت‌ها
app.use("/", homeRouter)
app.use("/auth", authRouter)
app.use("/course", courseRouter)
app.use("/categories", categoriesRouter);
app.use("/search", searchRouter);
app.use("/dashboard", dashboardRouter);
app.use("/comments", commentsRouter);
app.use("/cart", cartRouter);
app.use("/checkout", checkoutRouter);
app.use("/articles", articlesRouter);
app.get("/captcha", captchaController.get);


app.use((req, res) => {
    console.log("This Path Is Not Found !!", req.url);
    return res.json({message: "404! NOT FOUND !"})
});

app.use(errorHandler)

module.exports = app

