import mongoose from 'mongoose';

const quizSubmissionSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  participant_name: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  total_points: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('QuizSubmission', quizSubmissionSchema);

