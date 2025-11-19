import express from 'express';
import QuizSubmission from '../models/QuizSubmission.js';
import QuestionResponse from '../models/QuestionResponse.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

const router = express.Router();

// Get submission by ID with details
router.get('/:id', async (req, res) => {
  try {
    const submission = await QuizSubmission.findById(req.params.id)
      .populate('quiz_id', 'title')
      .select('-__v');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Get responses with question details
    const responses = await QuestionResponse.find({ submission_id: req.params.id })
      .populate('question_id', 'question_text correct_answer points')
      .sort({ createdAt: 1 })
      .select('-__v');

    // Transform response to match frontend format
    const transformedResponses = responses.map(r => ({
      question_id: r.question_id._id.toString(),
      user_answer: r.user_answer,
      is_correct: r.is_correct,
      points_earned: r.points_earned,
      questions: {
        question_text: r.question_id.question_text,
        correct_answer: r.question_id.correct_answer,
        points: r.question_id.points
      }
    }));

    const submissionResult = {
      id: submission._id.toString(),
      participant_name: submission.participant_name,
      score: submission.score,
      total_points: submission.total_points,
      submitted_at: submission.createdAt.toISOString(),
      quizzes: {
        title: submission.quiz_id.title
      }
    };

    res.json({
      submission: submissionResult,
      responses: transformedResponses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

