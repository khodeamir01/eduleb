const { successResponse } = require("../helpers/responses");
const Article = require("../models/Article");
const Category = require("../models/Category");
const { isValidObjectId } = require("mongoose");

// ==================== ایجاد مقاله ====================
exports.create = async (req, res) => {
    try {
        const { title, description, content, tags, status, slug } = req.body;
        const user = req.user;

        // دیباگ - ببین چی میاد
        console.log("Tags received:", tags);
        console.log("req body:", req.body);
        console.log("Type of tags:", typeof tags);

        // اعتبارسنجی slug
        if (!slug || slug.trim() === '') {
            return res.json({ success: false, error: "اسلاگ الزامی است" });
        }
        
        const cleanSlug = slug
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]/g, '')
            .toLowerCase();
        
        if (cleanSlug === '') {
            return res.json({ success: false, error: "اسلاگ نامعتبر است" });
        }
        
        const existing = await Article.findOne({ slug: cleanSlug });
        if (existing) {
            return res.json({ success: false, error: "این اسلاگ قبلاً استفاده شده" });
        }

        // پردازش تگ‌ها - چند حالت رو چک کن
        let tagsArray = [];
        if (tags) {
            if (typeof tags === 'string') {
                // اگه رشته‌ست، با کاما split کن
                tagsArray = tags
                    .split(/[,،]/)  // هم کامای انگلیسی هم فارسی
                    .map(t => t.trim())
                    .filter(t => t.length > 0);
            } else if (Array.isArray(tags)) {
                // اگه آرایه‌ست
                tagsArray = tags.filter(t => t && t.trim());
            }
        }

        console.log("Processed tags:", tagsArray); // دیباگ

        const article = await Article.create({
            title,
            slug: cleanSlug,
            description,
            content,
            cover: req.file ? `/${req.file.filename}` : undefined,
            author: user._id,
            tags: tagsArray,
            status: status || "draft"
        });

        await article.populate("author", "name avatar");

        return res.json({ success: true, message: "مقاله ایجاد شد", article });

    } catch (error) {
        console.error("Create article error:", error);
        return res.json({ success: false, error: error.message });
    }
};



// ==================== گرفتن همه مقالات ====================
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 9, category, search, tag, sort = "newest" } = req.query;
        
        const filter = { status: "published" };

        // فیلتر با category (حالا ObjectId هست)
        if (category && isValidObjectId(category)) {
            filter.category = category;
        }
        
        // جستجو
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // فیلتر با tag
        if (tag) {
            filter.tags = { $in: [tag] };
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            popular: { views: -1 }
        };

        const articles = await Article.find(filter)
            .populate("author", "name avatar")
            .populate("category", "title")
            .select("-content")
            .sort(sortOptions[sort] || sortOptions.newest)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Article.countDocuments(filter);

        return res.json({
            success: true,
            data: { articles, total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) }
        });

    } catch (error) {
        console.error("Get all articles error:", error);
        return res.json({ success: false, error: error.message });
    }
};

// ==================== گرفتن یک مقاله ====================
exports.getOne = async (req, res) => {
    try {
        const user = req.user
        const { slug } = req.params;

        const article = await Article.findOne({ slug })
            .populate("author", "name avatar bio")

        if (!article) {
            return res.json({ success: false, error: "مقاله یافت نشد" });
        }

        article.views += 1;
        await article.save();

        // مقالات مرتبط از همین دسته
        const relatedArticles = await Article.find({
            _id: { $ne: article._id },
            tags: article.tags,
            status: "published"
        })
            .populate("author", "name avatar")
            .select("title slug cover description createdAt")
            .limit(3)
            .lean();

        return res.render("article/single.ejs", { article, user , relatedArticles })
        
    } catch (error) {
        console.error("Get one article error:", error);
        return res.json({ success: false, error: error.message });
    }
};

exports.showCreateArticlePage = async (req, res) => {
    const user = req.user

  return res.render("article/create.ejs", { user: user });
}

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const user = req.user;

        if (!content || content.trim() === "") {
            return res.json({ success: false, error: "متن کامنت الزامی است" });
        }

        const article = await Article.findById(id);
        if (!article) {
            return res.json({ success: false, error: "مقاله یافت نشد" });
        }

        article.comments.push({
            user: user._id,
            content: content.trim()
        });

        await article.save();

        // populate کاربر کامنت جدید
        const populatedArticle = await Article.findById(id)
            .populate("comments.user", "name avatar");

        return res.json({
            success: true,
            message: "کامنت با موفقیت ثبت شد",
            comments: populatedArticle.comments
        });

    } catch (error) {
        console.error("Add comment error:", error);
        return res.json({ success: false, error: error.message });
    }
};


// ==================== ویرایش مقاله ====================
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { title, description, content, tags, status } = req.body;

        const article = await Article.findById(id);
        if (!article) {
            return res.json({ success: false, error: "مقاله یافت نشد" });
        }

        // فقط نویسنده یا ادمین
        const isOwner = article.author.toString() === user._id.toString();
        const isAdmin = user.roles.includes('ADMIN');

        if (!isOwner && !isAdmin) {
            return res.json({ success: false, error: "شما دسترسی ویرایش این مقاله را ندارید" });
        }

        let slug = article.slug;
        if (title && title !== article.title) {
            slug = title
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .toLowerCase();
            
                const existing = await Article.findOne({ slug: cleanSlug });
                if (existing) {
                    return res.json({ success: false, error: "این اسلاگ قبلاً استفاده شده، یه اسلاگ دیگه انتخاب کن" });
                }
        }

        const updateData = {
            title: title || article.title,
            slug,
            description: description || article.description,
            content: content || article.content,
            status: status || article.status
        };

        if (tags) {
            updateData.tags = typeof tags === 'string' 
                ? tags.split(",").map(t => t.trim()).filter(Boolean)
                : tags;
        }

        if (req.file) {
            updateData.cover = `/${req.file.filename}`;
        }

        const updated = await Article.findByIdAndUpdate(id, updateData, { new: true })
            .populate("author", "name avatar")

        return res.json({ 
            success: true, 
            message: status === 'published' ? 'مقاله منتشر شد 🎉' : 'پیش‌نویس ذخیره شد 📝',
            article: updated 
        });

    } catch (error) {
        console.error("Update article error:", error);
        return res.json({ success: false, error: error.message });
    }
};
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const article = await Article.findById(id);
        if (!article) return res.json({ success: false, error: "مقاله یافت نشد" });

        const isOwner = article.author.toString() === user._id.toString();
        const isAdmin = user.roles.includes('ADMIN');

        if (!isOwner && !isAdmin) {
            return res.json({ success: false, error: "شما دسترسی ویرایش این مقاله را ندارید" });
        }


        const updateData = {};
        

        // multer اگه JSON باشه body معمولیه، اگه FormData باشه body خالیه
        // پس چک کن body چیه
        if (req.body.title) updateData.title = req.body.title;
        if (req.body.description) updateData.description = req.body.description;
        if (req.body.content) updateData.content = req.body.content;
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.slug) updateData.slug = req.body.slug;

            
        const existing = await Article.findOne({ slug: cleanSlug });
         if (existing) {
            return res.json({ success: false, error: "این اسلاگ قبلاً استفاده شده، یه اسلاگ دیگه انتخاب کن" });
        }
        
        
        if (req.body.tags) {
            updateData.tags = typeof req.body.tags === 'string' 
                ? req.body.tags.split(/[,،]/).map(t => t.trim()).filter(Boolean)
                : req.body.tags;
        }
        
        if (req.file) updateData.cover = `/${req.file.filename}`;

        if (Object.keys(updateData).length === 0) {
            return res.json({ success: false, error: "هیچ تغییری اعمال نشد" });
        }

        const updated = await Article.findByIdAndUpdate(id, updateData, { new: true });
        return res.json({ success: true, message: "بروزرسانی شد ✓", article: updated });

    } catch (error) {
        return res.json({ success: false, error: error.message });
    }
};

// ==================== حذف مقاله ====================
exports.remove = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const article = await Article.findById(id);
        if (!article) return res.json({ success: false, error: "مقاله یافت نشد" });

        if (article.author.toString() !== user._id.toString() && !user.roles.includes("ADMIN")) {
            return res.json({ success: false, error: "دسترسی غیرمجاز" });
        }

        await Article.findByIdAndDelete(id);
        return res.json({ success: true, message: "مقاله حذف شد" });

    } catch (error) {
        console.error("Remove article error:", error);
        return res.json({ success: false, error: error.message });
    }
};

// ==================== مقالات من ====================
exports.getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({ author: req.user._id })
            .populate("category", "title")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, data: { articles } });

    } catch (error) {
        return res.json({ success: false, error: error.message });
    }
};

exports.edit = async (req, res) => {
    const article = await Article.findById(req.params.id);
    if (!article) return res.redirect("/dashboard/author");
    
    return res.render("dashboard/author/edit.ejs", { article, user: req.user });
}