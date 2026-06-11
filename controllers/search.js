// در فایل controllers/searchController.js
const Course = require('../models/Course');
const Category = require('../models/Category');

// جستجوی پیشرفته
exports.search = async (req, res) => {
    try {
        const query = req.query.q || '';
        const type = req.query.type || 'all'; // all, courses, categories
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const sortBy = req.query.sortBy || 'relevance'; // relevance, newest, price_asc, price_desc, rating
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || 1000000000;
        const level = req.query.level || 'all';
        
        const skip = (page - 1) * limit;
        
        // آماده کردن عبارت جستجو
        const searchRegex = new RegExp(query, 'gi');
        
        let results = {
            courses: [],
            categories: [],
            totalCourses: 0,
            totalCategories: 0,
            totalPages: 0,
            currentPage: page,
            query: query
        };
        
        // جستجو در دوره‌ها
        if (type === 'all' || type === 'courses') {
            let courseQuery = {
                price: { $gte: minPrice, $lte: maxPrice },
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: { $in: [searchRegex] } }
                ]
            };
            
            // فیلتر بر اساس سطح
            if (level !== 'all') {
                courseQuery.level = level;
            }
            
            // ترتیب‌بندی
            let sortOptions = {};
            switch (sortBy) {
                case 'newest':
                    sortOptions = { createdAt: -1 };
                    break;
                case 'price_asc':
                    sortOptions = { price: 1 };
                    break;
                case 'price_desc':
                    sortOptions = { price: -1 };
                    break;
                case 'rating':
                    sortOptions = { rating: -1 };
                    break;
                default:
                    sortOptions = { rating: -1, createdAt: -1 };
            }
            
            const courses = await Course.find(courseQuery)
                .populate('creator', 'name avatar')
                .populate('categoryID', 'title href')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);
            
            const totalCourses = await Course.countDocuments(courseQuery);
            
            results.courses = courses;
            results.totalCourses = totalCourses;
        }
        
        // جستجو در دسته‌بندی‌ها
        if (type === 'all' || type === 'categories') {
            const categoryQuery = {
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            };
            
            const categories = await Category.find(categoryQuery).limit(10);
            
            // شمارش تعداد دوره‌های هر دسته
            for (let category of categories) {
                category.courseCount = await Course.countDocuments({ 
                    categoryID: category._id,
                });
            }
            
            results.categories = categories;
            results.totalCategories = categories.length;
        }
        
        // محاسبه تعداد کل صفحات
        const totalItems = type === 'courses' ? results.totalCourses : 
                          type === 'categories' ? results.totalCategories : 
                          results.totalCourses + results.totalCategories;
        results.totalPages = Math.ceil(totalItems / limit);
        
        // آمار جستجو
        results.stats = {
            coursesFound: results.totalCourses,
            categoriesFound: results.totalCategories,
            totalFound: (results.totalCourses || 0) + (results.totalCategories || 0)
        };
        
        res.render('search', {
            results,
            filters: { type, sortBy, minPrice, maxPrice, level, page, limit },
            title: `نتایج جستجو برای "${query}"`
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'خطا در انجام جستجو' });
    }
};

// جستجوی سریع (برای هدر)
exports.quickSearch = async (req, res) => {
    try {
        const query = req.query.q || '';
        
        if (!query || query.length < 2) {
            return res.json({ success: true, results: [] });
        }
        
        const searchRegex = new RegExp(query, 'gi');
        
        // جستجو در دوره‌ها
        const courses = await Course.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        })
        .limit(5)
        .select('name href price cover');
        
        // جستجو در دسته‌بندی‌ها
        const categories = await Category.find({
            $or: [
                { title: searchRegex },
                { description: searchRegex }
            ]
        })
        .limit(3)
        .select('title href');
        
        res.json({
            success: true,
            results: {
                courses,
                categories
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطا در جستجو' });
    }
};

// فیلترهای پیشرفته (گرفتن مقادیر برای فیلترها)
exports.getFilterOptions = async (req, res) => {
    try {
        // گرفتن سطوح مختلف
        const levels = ['مقدماتی', 'متوسط', 'پیشرفته', 'همه سطوح'];
        
        // گرفتن محدوده قیمت
        const priceStats = await Course.aggregate([
            { 
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);
        
        res.json({
            success: true,
            filters: {
                levels,
                minPrice: priceStats[0]?.minPrice || 0,
                maxPrice: priceStats[0]?.maxPrice || 10000000,
                avgPrice: priceStats[0]?.avgPrice || 500000
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطا در دریافت فیلترها' });
    }
};