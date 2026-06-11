const express = require("express");
const {auth} = require("./../../middlewares/auth")
const roleGuard = require("./../../middlewares/roleGuard")
const {getAllOrders,
    updateOrders
    } = require("./../../controllers/v1/order")

const router = express.Router();

router.route("/").get(auth, getAllOrders);

router.route("/:id").patch(auth ,roleGuard("ADMIN") ,updateOrders);

module.exports = router;