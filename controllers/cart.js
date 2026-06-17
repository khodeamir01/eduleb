const { isValidObjectId } = require("mongoose")
const { addToCartValidator, removeFromCartValidator } = require("../../validators/cart")
const Product = require("./../../models/Products")
const Seller = require("./../../models/Seller")
const Cart = require("./../../models/Cart")

exports.getcart = async (req, res, next) => {

    try {
        const user = req.user;
    
        const cart = await Cart.findOne({user: user._id}).populate("items.product").populate("items.seller");
    
        if (!cart) return errorResponse(res, 404, "Cart not found for this user !!");
    
        return successResponse(res, 200, {cart})
        
        
    } catch (err) {
        next(err)
    }
}

exports.addTocart = async (req, res, next) => {

    try {
        
        await addToCartValidator.validate(req.body, {abortEarly: false});
    
        const {sellerId, productId, quantity} = req.body;
        const user = req.user;
    
        if (!isValidObjectId(sellerId) || !isValidObjectId(productId)) {
            return errorResponse(res, 400, "SellerId or ProductId is not valid !!")
        }
    
        const product = await Product.findById(productId);
        if (!product) {
            return errorResponse(res, 404, "Product not found !!")
        }
    
        const seller = await Seller.findById(sellerId);
        if (!seller) {
            return errorResponse(res, 404, "Seller not found !!")
        }
    
        
        const sellerDetails = product.sellers.find(s => s.seller.toString() === sellerId.toString());
        if (!sellerDetails) {
            return errorResponse(res, 400, "Seller dosent sell this product");
        }
    
        const priceAtTime = sellerDetails.price
    
        const cart = await Cart.findOne({user: user._id});
        if (!cart) {
            const newCart = await Cart.create({
                user: user._id,
                items: [
                    {
                        product: productId,
                        seller: sellerId,
                        quantity,
                        priceAtTime
    
                    }
                ]
            })
            return successResponse(res, 201, {cart : newCart})
        };

        const existingItems = cart.items.find(item => item.product.toString() === productId && item.seller.toString() === sellerId);

        if (existingItems) {
            existingItems.quantity += quantity;
            existingItems.priceAtTime = priceAtTime
        } else {
            cart.items.push({
                product: productId,
                seller: sellerId,
                quantity,
                priceAtTime
            })

        }
        await cart.save();

        return successResponse(res, 200, {cart})
    } catch (err) {
        next(err)
    }
    
}

exports.removeFromcart = async (req, res, next) => {
    try {

        await removeFromCartValidator.validate(req.body, {abortEarly: false})
        const user = req.user;
        const {sellerId, productId} = req.body;
    
        const cart = await Cart.findOne({user: user._id});
        if (!cart) return errorResponse(res, 404, "Cart not founf for this user !!");
    
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId && item.seller.toString() === sellerId); // findIndex find index of item that user want to delete 
        if (itemIndex === -1) return errorResponse(res, 404, "Product not found in your cart !!"); // if findIndex not true, it return -1
    
        cart.items.splice(itemIndex, 1);  //Splice method remove answer of itemIndex , itemIndex always return a index number
    
        await cart.save();
    
        return successResponse(res, 200, {message: "Item remove from your shopping cart successfully", cart})
        
        
    } catch (err) {
        next(err)
    }
}
