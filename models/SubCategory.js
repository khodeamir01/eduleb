const { default: mongoose } = require("mongoose");
const { validate } = require("./Category");

const SubCategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique : true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    description: {
        type: String,
        trim: true
    },

    filters :{
        type: [
            {
                name:{
                    type: String,
                    required: true,
                    trim: true
                },

                slug:{
                    type: String,
                    required: true,
                    trim: true,
                    unique: true
                },

                description: {
                    type: String,
                    trim: true
                },

                type: {
                    type: String,
                    required: true,
                    enum: ["radio", "selectbox"]
                },

                options : {
                    type: [String],
                    default: undefined,
                    validate: {
                        validator: (options) => Array.isArray(options)
                    }
                },
                min : {type: Number},
                max : {type: Number}

                
            }
        ]
    }

});
module.exports = mongoose.model("SubCategory", SubCategorySchema)