const { isValidObjectId } = require("mongoose");
const { createPaginationData } = require("./../helpers/pagination");
const Course = require("./../models/Course");
const Comment = require("./../models/Comment");
const { createCommentValidator } = require("../validators/comment");
const { errorResponse, successResponse } = require("../helpers/responses");



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
  try {
    const user = req.user;
    const { rating, content } = req.body;
    const { href } = req.params;

    if (!rating || !content) {
      return errorResponse(res, 401, 'rating و content الزامی هستند')
    }

    const course = await Course.findOne({ href });
    if (!course) {
      return errorResponse(res, 404,  "دوره مورد نظر یافت نشد" )
    }

    const newComment = await Comment.create({
      course: course._id,
      user: user._id,
      content: content,
      rating: parseInt(rating),
      replies: [],
    });

    // populate کردن user برای ارسال اطلاعات کامل به کلاینت
    await newComment.populate('user', 'name avatar');

    return successResponse(res, 200, {
      comment: newComment
    })
    
  } catch (error) {
    console.error('Error in createComment:', error);
    return errorResponse(res, 500, error.err)
  }
};

exports.removeComment = async (req, res, next) => {
  const user = req.user
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    return errorResponse(res, 401, "آیدی کامنت معتبیر نیست" )
  }
  

  const comment = await Comment.findById(commentId);
  if (!comment) { 
    return errorResponse(res, 404,  "کامنت مورد نظر یافت نشد" )
  }

  if (comment.user.toString() !== user._id.toString()) {
    return errorResponse(res, 403,  "شما دسترسی لازم برا دیدن  این صفحه را ندارید" )

  }

  const deleteOne = await Comment.deleteOne({_id: commentId})

  return successResponse(res, 200, {
    deletedComment: deleteOne
  })
};

exports.addReply = async (req, res, next) => {
  const user = req.user;
  const { rating, content } = req.body;
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    return res.json({ 
      success: false, 
      error: "آیدی کامنت معتبیر نیست" 
    });
  }

  if (!rating || !content) {
    return res.json({ 
      success: false, 
      error: 'rating و content الزامی هستند' 
    });
  }

  const ratingNumber = parseInt(rating);


  const comment = await Comment.findById(commentId).populate("course")
  if (!comment) {
    return res.json({ 
      success: false, 
      error: "کامنت مورد نظر یافت نشد" 
    });
  }
  
  if (!comment.course) {
    return res.json({ 
      success: false, 
      error: "دوره مورد نظر یافت نشد" 
    });
  }


  const reply = await Comment.findByIdAndUpdate(
    commentId,
    {
      $push: {
        replies: {
          content,
          user: user._id,
          rating: ratingNumber       
        },
      },
    },
    { returnDocument: true }
  );

  if (!reply) return errorResponse(res, 404, "ریپلای یافت نشد");

  return successResponse(res, 200, { reply });
};



exports.removeReply = async (req, res, next) => {
  const user = req.user;
  const { commentId, replyId } = req.params;

  if (!isValidObjectId(commentId) || !isValidObjectId(replyId))
    return errorResponse(res, 400, "CommentID  or ReplyID is not valid !!");

  const comment = await Comment.findById(commentId);

  if (!comment) return errorResponse(res, 404, "Comment not found");

  const reply = comment.replies.id(replyId);

  if (!reply) return errorResponse(res, 404, "Reply not found");

  if (reply.user.toString() !== user._id.toString())
    return errorResponse(res, 403, "You dont have access to this page");

  comment.replies.pull(replyId);

  await comment.save()

  return successResponse(res, 200, { message: "Reply deleted successfully" });
};
