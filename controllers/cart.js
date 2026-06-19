const { isValidObjectId } = require("mongoose");
const Course = require("./../models/Course");
const Cart = require("./../models/Cart");

exports.getCart = async (req, res, next) => {
    try {
        const user = req.user;
        
        const cart = await Cart.findOne({ user: user._id })
            .populate({
                path: "items.course",
                select: "name href cover price description"
            })
            .populate({
                path: "items.teacher",
                select: "name avatar"
            });

        // اگر سبد خرید خالی بود یا وجود نداشت
        if (!cart || cart.items.length === 0) {
            return res.render("cart", {
                cart: null,
                user: user,
                isEmpty: true
            });
        }

        // محاسبه قیمت کل
        const totalPrice = cart.items.reduce((total, item) => {
            return total + (item.priceAtTime * item.quantity);
        }, 0);

        return res.render("cart", {
            cart: cart,
            user: user,
            totalPrice: totalPrice,
            isEmpty: false
        });

    } catch (err) {
        next(err);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const { courseId, teacherId, quantity } = req.body;
        const user = req.user;


        if (!isValidObjectId(courseId) || !isValidObjectId(teacherId)) {
            return res.json({ 
                success: false, 
                error: "آیدی دوره یا مدرس معتبر نیست" 
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ 
                success: false, 
                error: "دوره مورد نظر یافت نشد" 
            });
        }

        // چک کردن اینکه کاربر قبلاً این دوره رو خریده یا نه
        const existingCart = await Cart.findOne({ 
            user: user._id,
            "items.course": courseId 
        });

        if (existingCart) {
            const existingItem = existingCart.items.find(
                item => item.course.toString() === courseId
            );
            if (existingItem) {
                return res.json({ 
                    success: false, 
                    error: "این دوره قبلاً به سبد خرید اضافه شده است" 
                });
            }
        }

        const priceAtTime = course.price;
        const quantityToAdd = quantity || 1;

        let cart = await Cart.findOne({ user: user._id });
        
        if (!cart) {
            cart = await Cart.create({
                user: user._id,
                items: [{
                    course: courseId,
                    teacher: teacherId,
                    quantity: quantityToAdd,
                    priceAtTime: priceAtTime
                }]
            });
        } else {
            cart.items.push({
                course: courseId,
                teacher: teacherId,
                quantity: quantityToAdd,
                priceAtTime: priceAtTime
            });
            await cart.save();
        }

        return res.json({ 
            success: true, 
            message: "دوره با موفقیت به سبد خرید اضافه شد",
            cart: cart 
        });

    } catch (err) {
        next(err);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const user = req.user;
        const { courseId } = req.body;

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            return res.json({ 
                success: false, 
                error: "سبد خرید یافت نشد" 
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.course.toString() === courseId
        );

        if (itemIndex === -1) {
            return res.json({ 
                success: false, 
                error: "این دوره در سبد خرید شما وجود ندارد" 
            });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        return res.json({ 
            success: true, 
            message: "دوره با موفقیت از سبد خرید حذف شد",
            cart: cart 
        });

    } catch (err) {
        next(err);
    }
};