const { default: mongoose } = require("mongoose");

const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    rating : {
        type: Number,
        min: 1,
        max: 5,
        required: true
    }
},{timestamps: true})

const commentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    
    replies: [replySchema]

}, {timestamps: true});

const model = mongoose.model("Comment", commentSchema)

module.exports = model