import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  question_text: {
    type: String,
    required: true,
    trim: true
  },
  question_type: {
    type: String,
    enum: ['mcq', 'true_false', 'text'],
    required: true
  },
  options: {
    type: [String],
    default: null
  },
  correct_answer: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  order_index: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Question', questionSchema);

