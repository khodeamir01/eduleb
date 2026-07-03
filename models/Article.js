const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 300
    },
    content: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        default: "public/assets/blog/3.jpg"
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },

    views: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

const model = mongoose.model("Article", articleSchema);


module.exports = model