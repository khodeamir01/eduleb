const exporess = require("express");
const { auth } = require("../../middlewares/auth");
const {
  createCheckout,
  verifyCheckout,
} = require("../../controllers/v1/checkout");

const router = exporess.Router();

router.route("/").post(auth, createCheckout);
router.route("/verify").get(verifyCheckout);

module.exports = router;
