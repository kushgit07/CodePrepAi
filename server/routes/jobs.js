const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/jobs
// @desc    Create a job
// @access  Private/Admin
router.post('/', [auth, isAdmin], async (req, res) => {
  const {
    title,
    company,
    location,
    description,
    requirements,
    salary,
    jobType,
    skills,
    applicationUrl
  } = req.body;

  try {
    const newJob = new Job({
      title,
      company,
      location,
      description,
      requirements,
      salary,
      jobType,
      skills,
      applicationUrl
    });

    const job = await newJob.save();
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/jobs/:id
// @desc    Update a job
// @access  Private/Admin
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Update job with new data
    job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private/Admin
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    await job.remove();
    res.json({ message: 'Job removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/jobs/search/:keyword
// @desc    Search jobs by keyword
// @access  Public
router.get('/search/:keyword', async (req, res) => {
  const { keyword } = req.params;
  
  try {
    const jobs = await Job.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { skills: { $in: [new RegExp(keyword, 'i')] } }
      ]
    }).sort({ postedDate: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
