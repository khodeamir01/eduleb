const { isValidObjectId } = require("mongoose");
const { createPaginationData } = require("./../../utils/index");
const { errorResponse, successResponse } = require("../../helpers/responses");
const Product = require("./../../models/Products");
const Comment = require("./../../models/comment");
const {
  createCommentValidator,
  addReplyValidator,
  updateCommentValidator,
  updateReplyValidator,
} = require("../../validators/comment");

exports.getComment = async (req, res, next) => {
  const { productId } = req.query;

  if (!isValidObjectId(productId))
    return errorResponse(res, 400, "ProductID is not valid !!");

  const comments = await Comment.find({ product: productId })
    .populate("user")
    .populate({
      path: "replies",
      populate: {
        path: "user",
      },
    });

  if (!comments)
    return errorResponse(res, 404, { message: "comments not found" });

  return successResponse(res, 200, { comments });
};

exports.getAllComments = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const commnets = await Comment.find()
    .sort({ createdAt: "desc" })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "-addresses")
    .populate("product")
    .populate({
      path: "replies",
      populate: {
        path: "user",
        select: "-addresses",
      },
    });

    const totalCount = await Comment.countDocuments()

    return successResponse(res, 200, {
        commnets,
        pagination: createPaginationData(page, limit, totalCount, "Comments")
    })
};

exports.createComment = async (req, res, next) => {
  const user = req.user;
  const { rating, content, productId } = req.body;

  await createCommentValidator.validate(req.body, { abortEarly: false });

  const product = await Product.findById(productId);

  if (!product) return errorResponse(res, 404, " Product not found !!");

  const newComment = await Comment.create({
    product: productId,
    user: user._id,
    content,
    rating,
    replies: [],
  });

  return successResponse(res, 201, {
    comment: newComment,
    message: "Comment created successfully",
  });
};

exports.updateComment = async (req, res, next) => {
  const user = req.user;
  const { content, rating } = req.body;
  const { commentId } = req.params;

  if (!isValidObjectId(commentId))
    return errorResponse(res, 400, "CommentID is not valid !!");

  await updateCommentValidator.validate(req.body, { abortEarly: false });

  const commnet = await Comment.findById(commentId);
  if (!commnet) return errorResponse(res, 404, "Comment not found !");

  if (commnet.user.toString() !== user._id.toString())
    return errorResponse(res, 403, "You dont have access to this page");

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content, rating },
    { new: true }
  );

  return successResponse(res, 200, {
    message: "Comment updataed successfully",
    commnet: updatedComment,
  });
};

exports.removeComment = async (req, res, next) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId))
    return errorResponse(res, 400, "CommentID is not valid !!");

  const deleteComment = await Comment.findByIdAndDelete(commentId);
  if (!deleteComment) return errorResponse(res, 404, "Comment not found ");

  return successResponse(res, 200, {
    message: "Comment deleted successfully",
    deleteComment,
  });
};

exports.addReply = async (req, res, next) => {
  const { commentId } = req.params;
  const user = req.user;
  const { content } = req.body;

  if (!isValidObjectId(commentId))
    return errorResponse(res, 400, "CommentID is not valid !!");

  await addReplyValidator.validate({ content }, { abortEarly: false });

  const reply = await Comment.findByIdAndUpdate(
    commentId,
    {
      $push: {
        replies: {
          content,
          user: user._id,
        },
      },
    },
    { new: true }
  );

  if (!reply) return errorResponse(res, 404, "reply not found");

  return successResponse(res, 200, { reply });
};

exports.updateReply = async (req, res, next) => {
  const { commentId, replyId } = req.params;
  const user = req.user;
  const { content } = req.body;

  if (!isValidObjectId(commentId))
    return errorResponse(res, 400, "CommentID is not valid !!");

  await updateReplyValidator.validate({ content }, { abortEarly: false });

  const comment = await Comment.findById(commentId);
  if (!comment) return errorResponse(res, 404, "Comment not found");

  comment.replies.pull(replyId);

  await comment.save();

  const updatedreply = await Comment.findByIdAndUpdate(
    commentId,
    {
      $push: {
        replies: {
          content,
          user: user._id,
        },
      },
    },
    { new: true }
  );

  return successResponse(res, 200, { updatedreply });
};

exports.removeReply = async (req, res, next) => {
  const user = req.user;
  const { commentId, replyId } = req.params;

  if (!isValidObjectId(commentId) || !isValidObjectId(replyId))
    return errorResponse(res, 400, "CommentID  pr ReplyID is not valid !!");

  const commnet = await Comment.findById(commentId);

  if (!commnet) return errorResponse(res, 404, "Comment not found");

  const reply = commnet.replies.id(replyId);

  if (!reply) return errorResponse(res, 404, "Reply not found");

  if (reply.user.toString() !== user._id.toString())
    return errorResponse(res, 403, "You dont have access to this page");

  commnet.replies.pull(replyId);

  await commnet.save();

  return successResponse(res, 200, { message: "Reply deleted successfully" });
};
