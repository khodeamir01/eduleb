const Category = require('./../models/Category')
const Course = require('./../models/Course')
exports.findAllCategories = async (req, res, next) => {
try {
    const categories = await Category.find({})

    return res.render("createcourse", {
      categories: categories, // لیست دسته‌بندی‌ها به فرانت فرستاده می‌شود
      messages: {}
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryCourses = async (req, res) => {
  try {
      const {href} = req.params
      
      // پیدا کردن اطلاعات دسته‌بندی
      const category = await Category.findOne({href});
      
      if (!category) {
          return res.status(404).render('404', { message: 'دسته‌بندی یافت نشد' });
      }
      
      // پیدا کردن همه دوره‌های این دسته‌بندی
      const courses = await Course.find({ 
          categoryID: category._id
      })
      .populate('creator', 'name avatar')
      .sort({ createdAt: -1 });
      
      // گرفتن دسته‌بندی‌های دیگر برای سایدبار
      const otherCategories = await Category.find({ 
          _id: { $ne: category._id } 
      }).limit(5);
      
      // شمارش تعداد دوره‌های هر دسته دیگر
      for (let cat of otherCategories) {
          cat.courseCount = await Course.countDocuments({ 
              categoryID: cat._id,
          });
      }
      
      res.render('categories_courses', {
          category,
          courses,
          otherCategories,
          courseCount: courses.length,
          title: `دوره‌های ${category.title}`
      });
      
  } catch (error) {
      console.error(error);
      res.status(500).render('error', { message: 'خطا در دریافت اطلاعات' });
  }
};