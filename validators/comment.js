const { isValidObjectId } = require("mongoose");
const yup = require("yup");

const createCommentValidator = yup.object().shape({

  rating: yup.number().required("Rating is required").min(1).max(5),

  content: yup
    .string()
    .max(1000, "Comment content cannot exceed 1000 characters"),
});

const updateCommentValidator = yup.object().shape({
  content: yup
    .string()
    .max(1000, "Comment content cannot exceed 1000 characters"),

  rating: yup.number().min(1).max(5),
});

const addReplyValidator = yup.object().shape({
  content: yup
    .string()
    .max(1000, "Reply content cannot exceed 1000 characters")
    .required("Reply content is required"),
});

const updateReplyValidator = yup.object().shape({
  content: yup
    .string()
    .max(1000, "Reply content cannot exceed 1000 characters"),
});

module.exports = {
  createCommentValidator,
  updateCommentValidator,
  addReplyValidator,
  updateReplyValidator,
};
