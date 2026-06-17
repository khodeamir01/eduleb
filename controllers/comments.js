const { isValidObjectId } = require("mongoose");
const { createPaginationData } = require("./../helpers/pagination");
const Course = require("./../models/Course");
const Comment = require("./../models/Comment");



exports.getComment = async (req, res, next) => {
  const { href } = req.params;

  // استفاده از findOne برای پیدا کردن یک مورد
  const course = await Course.findOne({ href });
  
  if (!course) {
    return res.render("course_details.ejs", { comments: [], error: "درس یافت نشد" });
  }

  const comments = await Comment.find({ course: course._id })
    .populate("user")
    .populate({
      path: "replies",
      populate: { path: "user" },
    })
    .sort({ createdAt: -1 }); // نمایش جدیدترین‌ها در ابتدا

    if (!comments) {
      return res.render("course_details.ejs", { comments: [], error: "درس یافت نشد" });
    }


  return res.render("course_details.ejs", { comments, course });
};


exports.getAllComments = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const Comments = await Comment.find()
    .sort({ createdAt: "desc" })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "-addresses")
    .populate("Course")
    .populate({
      path: "replies",
      populate: {
        path: "user",
        select: "-addresses",
      },
    });

    const totalCount = await Comment.countDocuments()

    return successResponse(res, 200, {
        Comments,
        pagination: createPaginationData(page, limit, totalCount, "Comments")
    })
};

exports.createComment = async (req, res, next) => {
  const user = req.user;
  const { rating, content, courseId } = req.body;

  await createCommentValidator.validate(req.body, { abortEarly: false });

  const course = await Course.findById(courseId);

  if (!Course) return errorResponse(res, 404, " Course not found !!");

  const newComment = await Comment.create({
    course: courseId,
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

  const Comment = await Comment.findById(commentId);
  if (!Comment) return errorResponse(res, 404, "Comment not found !");

  if (Comment.user.toString() !== user._id.toString())
    return errorResponse(res, 403, "You dont have access to this page");

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content, rating },
    { new: true }
  );

  return successResponse(res, 200, {
    message: "Comment updataed successfully",
    Comment: updatedComment,
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

  const Comment = await Comment.findById(commentId);

  if (!Comment) return errorResponse(res, 404, "Comment not found");

  const reply = Comment.replies.id(replyId);

  if (!reply) return errorResponse(res, 404, "Reply not found");

  if (reply.user.toString() !== user._id.toString())
    return errorResponse(res, 403, "You dont have access to this page");

  Comment.replies.pull(replyId);

  await Comment.save();

  return successResponse(res, 200, { message: "Reply deleted successfully" });
};
