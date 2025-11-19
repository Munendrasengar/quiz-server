import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  is_published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Quiz', quizSchema);

