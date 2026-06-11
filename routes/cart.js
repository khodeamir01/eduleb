const express = require("express");
const { auth } = require("../../middlewares/auth");
const {getcart,
    addTocart,
    removeFromcart} = require("./../../controllers/v1/cart")

const router = express.Router();

router.route("/").get(auth ,getcart)
router.route("/add").post(auth ,addTocart)
router.route("/remove").delete(auth ,removeFromcart)

module.exports = router


