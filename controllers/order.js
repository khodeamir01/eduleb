const Order = require("./../../models/Order");
const {successResponse} = require("./../../helpers/responses");
const {createPaginationData} = require("./../../utils/index");

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;

    const filters = {
      ...(user.roles.includes("ADMIN") ? {} : { user: user._id }),
    };

    const orders = await Order.find(filters)
      .sort({ createdAt: "desc" })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user")
      .populate("items.product")
      .populate("items.seller");

      const totalCount = await Order.countDocuments(filters)

      return successResponse(res, 200, {
        orders,
        pagination : createPaginationData(page, limit, totalCount, "Orders" )
      })
  } catch (err) {}
};

exports.updateOrders = async (req, res, next) => {
  try {

    const {postTrackingCode, status} = req.body;
    const {id} = req.params
    await updateOrderValidation.validate(req.body, {abortEarly: false})

    const updatedOrder = await Order.findByIdAndUpdate(id, {status, postTrackingCode}, {new: true});
    return successResponse(res, 200,{message: "Order Updated Successfully",order: updatedOrder} )
  } catch (err) {}
};
