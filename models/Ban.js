const { default: mongoose } = require("mongoose");

const banSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});
const model = mongoose.model("Ban", banSchema);

module.exports = model