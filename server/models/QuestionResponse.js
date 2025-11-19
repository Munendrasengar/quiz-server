import mongoose from 'mongoose';

const questionResponseSchema = new mongoose.Schema({
  submission_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizSubmission',
    required: true
  },
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  user_answer: {
    type: String,
    required: true,
    trim: true
  },
  is_correct: {
    type: Boolean,
    required: true
  },
  points_earned: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('QuestionResponse', questionResponseSchema);

