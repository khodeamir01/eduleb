const express = require("express");
const auth  = require("./../middlewares/auth");

const Controller = require("./../controllers/cart")

const router = express.Router();

router.route("/").get(auth ,Controller.getCart)
router.route("/add").post(auth ,Controller.addToCart)
router.route("/remove").delete(auth ,Controller.removeFromCart)

module.exports = router


