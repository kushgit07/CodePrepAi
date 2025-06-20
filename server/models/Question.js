const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    required: true
  },
  category: {
    type: String,
    enum: [
      "data structures",
      "algorithms",
      "databases",
      "system design",
      "UI/UX Design",
      "UI components",
      "frontend",
      "backend",
      "devops",
      "testing"
    ],
    default: 'algorithms',
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  examples: [{
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    explanation: String
  }],
  constraints: {
    type: [String],
    default: []
  },
  testCases: [{
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    expectedOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  solution: {
    type: String 
  },
  hints: {
    type: [String],
    default: []
  },
  timeLimit: {
    type: Number, 
    default: 1000
  },
  memoryLimit: {
    type: Number, 
    default: 131072 
  },
  relatedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  starterCode: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('question', QuestionSchema);
