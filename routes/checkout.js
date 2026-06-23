const exporess = require("express");
const Controller = require("./../controllers/checkout")
const auth = require("../middlewares/auth");

const router = exporess.Router();

router.route("/").post(auth,Controller.createCheckout);
router.route("/verify").get(Controller.verifyCheckout);

module.exports = router;
