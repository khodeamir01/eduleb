// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  video: {
    type: String, // لینک ویدیو
    required: true
  },

  duration: {
    type: Number, // مدت زمان به دقیقه
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  order: {
    type: Number, // شماره جلسه
    default: 1
  },

  isFree: {
    type: Boolean,
    default: false // رایگان یا پولی
  }
  
}, { timestamps: true });

const model = mongoose.model('Session', sessionSchema);

module.exports = model