const Course = require("./../models/Course");
const Session = require("./../models/Session");
const CourseUser = require("./../models/Course-User");
const Category = require("./../models/Category");
const Comments = require("./../models/Comment");
const { isValidObjectId } = require("mongoose");
const mongoose = require("mongoose");

exports.showCreateCoursePanel = async (req, res, next) => {
  const categories = await Category.find({}); console.log(categories);
  return res.render("Admin/createCourse.ejs", {categories})

}
exports.getAllCourses = async (req, res, next) => {
  const courses = await Course.find({});
  return res.render("course.ejs", {
    courses: courses,
    categories: categories,

  })
};


exports.create = async (req, res) => {
  const {
    name,
    description,
    discount,
    support,
    href,
    price,
    status,
    categoryID,
  } = req.body;
  const course = await Course.create({
    name,
    description,
    discount,
    support,
    href,
    price,
    status,
    categoryID,
    creator: req.user._id,
    cover: `/img/cover/${req.file.filename}`
  });
  const mainCourse = await Course
  .findById(course._id)
  .populate("creator", "-password");

  
  return res.render("index", {
    messages: {
     success: "Create Course Was Successfully",
      redirect: "/",
     }
   });
};

exports.createSession = async (req, res) => {
  const { time, free, title } = req.body;
  const { id } = req.params;
  const isValidUserID = isValidObjectId(id);
  if (!isValidUserID) {
    return res.status(409).json({
      message: "This User ID is Not Valid !!",
    });
  }
  
  const session = await Session.create({
    title,
    time,
    free,
    video: `/img/session/${req.file.filename}`,
    course: id,
  });
  return res.status(201).json(session);
};

exports.getAllSession = async (req, res) => {
  const session = await Session.find().populate("course", "name").lean();
  return res.status(200).json(session);
};

exports.getSessionInfo = async (req, res) => {
  const course = await Course.findOne({ href: req.params.href });
  const session = await Session.findOne({ _id: req.params.sessionsID });
  const sessions = await Session.find({ course: course._id });
  return res.json({ session, sessions });
};

exports.removeSession = async (req, res) => {
  const deletedSession = await Session.findOneAndDelete({
    _id: req.params.id,
  });
  const isValidSessionID = isValidObjectId(req.params.id);
  if (!isValidSessionID) {
    return res.status(409).json({
      message: "This User ID is Not Valid !!",
    });
  }
  if (!deletedSession) {
    return res.status(404).json({
      message: "Session NOT FOUND",
    });
  }
  return res.json(deletedSession);
};

exports.register = async (req, res) => {
  const isUserAlreadyRegistered = await CourseUser
  .findOne({
    user: req.user._id,
    course: req.params.id,
  })
    .lean();
  if (isUserAlreadyRegistered) {
    return res.status(409).json({
      message: "You are Already registered",
    });
  }
  
  const register = await CourseUser.create({
    user: req.user._id,
    course: req.params.id,
    price: req.body.price,
  });
  return res.status(201).json({
    message: "You ARE Registered !",
  });
};

exports.getAllByCategory = async (req, res) => {
  const { href } = req.params;
  const category = await Category.findOne({ href: href });
  if (category) {
    const categoryCourse = await Course.find({
      categoryID: category._id,
    });
    return res.json(categoryCourse);
  } else {
    return res.json([]);
  }
};

exports.getOneCourse = async (req, res) => {
  
  const user = req.user;
  const {href} = req.params;
  
  const course = await Course
    .findOne({href})
    .populate(
      "creator",
      "-password -phone -email -username -role -_id -__v -createdAt -updatedAt"
    ).lean();
  
    const relatedCourses = await Course.find({
      _id: { $ne: course._id },
      categoryID: course.categoryID
  }).populate('creator')
  .limit(4);
  
  
  const categories = await Category.find().sort({ title: 1 });
  
    return res.render("course_details.ejs", {
      course: course,
      categories: categories,
      user: user,
      relatedCourses: relatedCourses
  
    })

  // const sessions = await Session.find({ course: course._id }).lean();
  // const comments = await Comments
  //   .find({ course: course._id, isAccept: 1 })
  //   .populate("creator", "-password")
  //   .lean();
  // const courseStudentCount = await CourseUser
  //   .find({ course: course._id })
  //   const isUserRegisteredInThisCourse = !!(await CourseUser.find({
  //     user: req.user._id,
  //     course: course._id
  //   }))
    
  res.json({ course, comments, sessions, courseStudentCount, isUserRegisteredInThisCourse });
};
