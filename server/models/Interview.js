const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'job',
  },
  mockJobId: {
    type: String,
  },
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'question',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'in_progress', 'submitted', 'reviewed', 'completed'],
    default: 'pending'
  },
  complexity: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    enum: ['python', 'javascript', 'java', 'cpp', 'csharp', 'ruby'],
    default: 'javascript'
  },
  feedback: {
    type: String
  },
  aiFeedback: {
    type: Object,
    default: {}
  },
  improvedSolution: {
    type: String
  },
  testResults: [{
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// method to get job data
InterviewSchema.methods.getJobData = async function() {
  if (this.mockJobId) {
    const { mockJobs } = require('../utils/mockData');
    return mockJobs.find(job => job._id === this.mockJobId);
  }
  
  if (this.job) {
    return await mongoose.model('job').findById(this.job);
  }
  
  return null;
};

module.exports = mongoose.model('interview', InterviewSchema);
