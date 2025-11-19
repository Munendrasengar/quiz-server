import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizSubmission from '../models/QuizSubmission.js';
import QuestionResponse from '../models/QuestionResponse.js';

const router = express.Router();

// Get all published quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ is_published: true })
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all quizzes (admin)
router.get('/all', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select('-__v');
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get questions for a quiz
router.get('/:id/questions', async (req, res) => {
  try {
    const questions = await Question.find({ quiz_id: req.params.id })
      .sort({ order_index: 1 })
      .select('-__v');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create quiz
router.post('/', async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const quiz = new Quiz({
      title: title.trim(),
      description: description || null,
      is_published: false
    });

    const savedQuiz = await quiz.save();

    // Save questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionsToInsert = questions.map((q, index) => ({
        quiz_id: savedQuiz._id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.question_type === 'mcq' ? q.options : null,
        correct_answer: q.correct_answer,
        points: q.points || 1,
        order_index: index
      }));

      await Question.insertMany(questionsToInsert);
    }

    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update quiz
router.put('/:id', async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (title) quiz.title = title.trim();
    if (description !== undefined) quiz.description = description || null;

    await quiz.save();

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete old questions
      await Question.deleteMany({ quiz_id: req.params.id });

      // Insert new questions
      if (questions.length > 0) {
        const questionsToInsert = questions.map((q, index) => ({
          quiz_id: req.params.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.question_type === 'mcq' ? q.options : null,
          correct_answer: q.correct_answer,
          points: q.points || 1,
          order_index: index
        }));

        await Question.insertMany(questionsToInsert);
      }
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete quiz
router.delete('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Delete related questions
    await Question.deleteMany({ quiz_id: req.params.id });

    // Delete related submissions and responses
    const submissions = await QuizSubmission.find({ quiz_id: req.params.id });
    const submissionIds = submissions.map(s => s._id);
    await QuestionResponse.deleteMany({ submission_id: { $in: submissionIds } });
    await QuizSubmission.deleteMany({ quiz_id: req.params.id });

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    quiz.is_published = !quiz.is_published;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz
router.post('/:id/submit', async (req, res) => {
  try {
    const { participant_name, answers } = req.body;

    if (!participant_name || !participant_name.trim()) {
      return res.status(400).json({ error: 'Participant name is required' });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Answers are required' });
    }

    // Get quiz and questions
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = await Question.find({ quiz_id: req.params.id })
      .sort({ order_index: 1 });

    if (questions.length === 0) {
      return res.status(400).json({ error: 'Quiz has no questions' });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;
    const responses = [];

    for (const question of questions) {
      totalPoints += question.points;
      const userAnswer = (answers[question._id.toString()] || '').trim();
      const isCorrect = userAnswer.toLowerCase() === question.correct_answer.toLowerCase();
      
      if (isCorrect) {
        score += question.points;
      }

      responses.push({
        question_id: question._id,
        user_answer: userAnswer,
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0
      });
    }

    // Create submission
    const submission = new QuizSubmission({
      quiz_id: req.params.id,
      participant_name: participant_name.trim(),
      score,
      total_points: totalPoints
    });

    const savedSubmission = await submission.save();

    // Create responses
    const responsesToInsert = responses.map(r => ({
      ...r,
      submission_id: savedSubmission._id
    }));

    await QuestionResponse.insertMany(responsesToInsert);

    res.status(201).json({ submission_id: savedSubmission._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

