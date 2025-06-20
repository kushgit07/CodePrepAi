const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const Job = require("../models/Job");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roles");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Types: { ObjectId } } = require('mongoose');
const { mockJobs } = require('../utils/mockData');

// Initialize Google Generative AI - with safety check
let genAI, model;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    console.log("Gemini AI initialized successfully");
  } else {
    console.warn("GEMINI_API_KEY not found in environment variables");
  }
} catch (err) {
  console.error("Error initializing Gemini AI:", err);
}

// Simple memory cache implementation
const cache = {
  questions: new Map(),
  testCases: new Map(),
  cooldownTimers: new Map(),
};

// Cooldown duration in milliseconds (5 seconds between API calls)
const COOLDOWN_MS = 5000;

// Helper function to prevent rate limiting
const preventRateLimiting = async (operationType, key) => {
  const cooldownKey = `${operationType}-${key}`;

  // Check if operation is in cooldown
  if (cache.cooldownTimers.has(cooldownKey)) {
    const timeRemaining = cache.cooldownTimers.get(cooldownKey) - Date.now();
    if (timeRemaining > 0) {
      throw new Error(
        `Please wait ${Math.ceil(
          timeRemaining / 1000
        )} seconds before trying again.`
      );
    }
  }

  // Set cooldown for this operation
  cache.cooldownTimers.set(cooldownKey, Date.now() + COOLDOWN_MS);

  // Auto-clear cooldown after period passes
  setTimeout(() => {
    cache.cooldownTimers.delete(cooldownKey);
  }, COOLDOWN_MS);
};

// Better JSON parser with improved markdown handling
function robustJsonParse(textResult) {
    try {
        console.log("JSON parsing input:", textResult);
        
        // Check if the input is already valid JSON
        try {
            return JSON.parse(textResult);
        } catch (directParseError) {
            console.log("Direct parse failed, attempting cleanup");
        }
        
        // Remove markdown code blocks, but keep their content
        let cleanedText = textResult;
        
        // Extract just the content from markdown code blocks if present
        const codeBlockMatch = textResult.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            cleanedText = codeBlockMatch[1].trim();
            console.log("Extracted from code block:", cleanedText);
            
            // Try parsing the extracted content immediately
            try {
                return JSON.parse(cleanedText);
            } catch (extractedParseError) {
                console.log("Extracted content parse failed:", extractedParseError.message);
            }
        } else {
            // If no code block found, try to remove just the markdown tags
            cleanedText = textResult.replace(/```json\s*|```/g, '').trim();
            console.log("Removed markdown tags:", cleanedText);
        }
        
        // Try to parse the cleaned text
        try {
            return JSON.parse(cleanedText);
        } catch (cleanedParseError) {
            console.log("Cleaned parse failed:", cleanedParseError.message);
        }
        
        // Check if it starts with [ for array
        if (cleanedText.trim().startsWith('[') && cleanedText.trim().endsWith(']')) {
            try {
                console.log("Attempting to parse as array");
                return JSON.parse(cleanedText.trim());
            } catch (arrayParseError) {
                console.log("Array parse failed:", arrayParseError.message);
            }
        }
        
        // Try to find a JSON object or array in the text
        const jsonMatch = cleanedText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
        if (jsonMatch && jsonMatch[1]) {
            const potentialJson = jsonMatch[1].trim();
            const isArray = potentialJson.startsWith('[') && potentialJson.endsWith(']');
            console.log(`Found potential JSON ${isArray ? 'array' : 'object'}:`, 
                potentialJson.substring(0, 50) + "...");
            
            try {
                return JSON.parse(potentialJson);
            } catch (matchParseError) {
                console.log("Match parse failed:", matchParseError.message);
            }
        }
        
        // Last resort: manual JSON fixing for both objects and arrays
        if (cleanedText) {
            try {
                let fixedJson = cleanedText
                    .replace(/[\n\r\t]/g, ' ')              // Replace newlines/tabs with spaces
                    .replace(/,\s*[\]\}]/g, '$1')           // Remove trailing commas
                    .replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"') // Ensure property names are quoted
                    .replace(/:\s*'([^']*)'/g, ':"$1"')     // Replace single quotes with double quotes
                    .replace(/,\s*,/g, ',');                // Remove duplicate commas
                
                // Try to parse the fixed JSON
                return JSON.parse(fixedJson);
            } catch (fixedParseError) {
                console.log("Fixed parse failed:", fixedParseError.message);
            }
        }
        
        console.log("No JSON-like content found.");
        return null;
    } catch (err) {
        console.error("JSON parsing error:", err);
        return null;
    }
}

function isMockJobId(id) {
  return id && typeof id === 'string' && id.startsWith('mock');
}

async function findQuestionSafely(questionId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      console.warn('Invalid question ID format:', questionId);
      return null;
    }
    
    const question = await Question.findById(questionId);
    return question;
  } catch (err) {
    console.error('Error finding question:', err);
    return null;
  }
}

function parseJsonArray(textResult) {
    try {
        console.log("Parsing JSON array input:", textResult);
        
        // Try direct parse first
        try {
            const parsed = JSON.parse(textResult);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.log("Direct array parse failed");
        }
        
        // Extract from code block if present
        const codeBlockMatch = textResult.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
            const extracted = codeBlockMatch[1].trim();
            try {
                const parsed = JSON.parse(extracted);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.log("Code block array parse failed");
            }
        }
        
        // Look for array pattern
        const arrayMatch = textResult.match(/(\[\s*\{[\s\S]*\}\s*\])/);
        if (arrayMatch && arrayMatch[1]) {
            try {
                const parsed = JSON.parse(arrayMatch[1]);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.log("Array pattern match parse failed");
            }
        }
        
        // Last resort - find all objects and construct array
        const objectMatches = textResult.match(/\{[^{}]*\}/g);
        if (objectMatches && objectMatches.length > 0) {
            try {
                const objects = objectMatches.map(obj => JSON.parse(obj));
                return objects;
            } catch (e) {
                console.log("Object extraction failed");
            }
        }
        
        return null;
    } catch (err) {
        console.error("Array parsing error:", err);
        return null;
    }
}

// @route   GET api/interviews
// @desc    Get all interviews for a user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .populate("job", "title company")
      .populate("question", "title difficulty")
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET api/interviews/user-interviews
// @desc    Get all interviews for the current user
// @access  Private
router.get("/user-interviews", auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .populate("job", "title company")
      .populate("question", "title difficulty")
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET api/interviews/:id
// @desc    Get interview by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    console.log("Getting interview with ID:", req.params.id);
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ 
        success: false, 
        message: 'Interview not found' 
      });
    }
    
    // Get job data based on whether it's a mock job or real job
    let job;
    if (interview.mockJobId) {
      const { mockJobs } = require('../utils/mockData');
      job = mockJobs.find(j => j._id === interview.mockJobId);
      
      if (!job) {
        console.log("Mock job not found:", interview.mockJobId);
        return res.status(404).json({
          success: false,
          message: 'Associated mock job not found'
        });
      }
    } else if (interview.job) {
      job = await Job.findById(interview.job);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Associated job not found'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Interview has no associated job'
      });
    }
    
    res.json({
      success: true,
      interview,
      job
    });
  } catch (err) {
    console.error('Get interview error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// @route   GET api/interviews/job/:jobId
// @desc    Get interviews for a specific job
// @access  Private
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user.id,
      job: req.params.jobId,
    })
      .populate("question", "title difficulty")
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST api/interviews/start
// @desc    Start a new mock interview
// @access  Private
router.post("/start", auth, async (req, res) => {
  try {
    const { jobId, complexity = 'medium' } = req.body; 
    
    console.log('Starting interview for job:', jobId, 'complexity:', complexity);
    
    // Check if this is a mock job ID
    if (isMockJobId(jobId)) {
      const { mockJobs } = require('../utils/mockData');
      const mockJob = mockJobs.find(job => job._id === jobId);
      
      if (!mockJob) {
        return res.status(404).json({ 
          success: false, 
          message: 'Mock job not found' 
        });
      }
      
      // Create the interview with mock job data
      const newInterview = new Interview({
        user: req.user.id,
        mockJobId: jobId,
        jobTitle: mockJob.title,
        company: mockJob.company || 'Mock Company',
        complexity: complexity || 'medium', 
        status: 'pending'
      });
      
      const interview = await newInterview.save();
      console.log("Created interview:", interview._id);
      
      return res.json({
        success: true,
        interview,
        job: mockJob
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid job ID format' 
      });
    }
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    // Create the interview with job data
    const newInterview = new Interview({
      user: req.user.id,
      job: jobId,
      jobTitle: job.title,
      company: job.company,
      complexity: complexity || 'medium',
      status: 'pending' 
    });
    
    const interview = await newInterview.save();
    
    res.json({
      success: true,
      interview,
      job
    });
  } catch (err) {
    console.error('Start interview error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error starting interview', 
      error: err.message 
    });
  }
});

// @route   PUT api/interviews/:id/submit
// @desc    Submit code for an interview
// @access  Private
router.put("/:id/submit", auth, async (req, res) => {
  try {
    const { code, language } = req.body;
    
    // Find the interview by ID and user
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("job question");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Update interview with submission data
    interview.code = code;
    interview.language = language;
    interview.status = "submitted";
    interview.submittedAt = Date.now();

    // Get question data for AI feedback
    const question = interview.question;
    
    console.log('Sending code for feedback...');

    // Only attempt to generate AI feedback if we have API key and question data
    if (model && question) {
      try {
        // Check rate limiting for AI feedback
        try {
          await preventRateLimiting('generate-feedback', req.user.id);
        } catch (cooldownError) {
          console.warn('Rate limited for AI feedback:', cooldownError.message);
          // Continue without AI feedback
        }

        const feedbackPrompt = `
          You are an expert software engineer reviewing code for a technical interview.
          The candidate was given this question:
          
          Title: ${question.title}
          Description: ${question.description}
          
          And they provided this ${language} solution:
          
          ${code}
          
          Analyze this code and provide feedback in this EXACT JSON format. Do NOT include any markdown, text,
          or explanations outside of the JSON object. The response should consist
          ENTIRELY of a single, valid JSON object:
          {
            "correctness": "Analysis of solution correctness",
            "timeComplexity": "Analysis of time complexity",
            "spaceComplexity": "Analysis of space complexity",
            "codeQuality": "Analysis of code quality",
            "edgeCases": "Analysis of edge case handling",
            "improvements": "Specific suggestions for improvement",
            "betterSolution": null,
            "overallScore": 70
          }
          
          Important:
          - Return ONLY valid JSON
          - Do not use markdown or code blocks
          - Ensure proper JSON syntax
        `;

        console.log('Sending AI feedback generation prompt to Gemini AI');
        const result = await model.generateContent(feedbackPrompt);
        const responseText = result.response.text();

        console.log('AI feedback generated');
        console.log('RAW AI RESPONSE (Feedback):', responseText);

        // Parse JSON response using robust parsing
        const feedback = robustJsonParse(responseText);
        
        if (!feedback) {
          console.error('Failed to parse AI feedback');
          interview.aiFeedback = {
            correctness: "Could not assess correctness",
            timeComplexity: "Could not determine",
            spaceComplexity: "Could not determine",
            codeQuality: "Could not assess",
            edgeCases: "Could not assess",
            improvements: "No specific improvements could be suggested",
            betterSolution: "",
            overallScore: 60
          };
        } else {
          // Ensure all properties exist in the feedback object
          interview.aiFeedback = {
            correctness: feedback.correctness || "Could not assess correctness",
            timeComplexity: feedback.timeComplexity || "Could not determine",
            spaceComplexity: feedback.spaceComplexity || "Could not determine",
            codeQuality: feedback.codeQuality || "Could not assess",
            edgeCases: feedback.edgeCases || "Could not assess",
            improvements: feedback.improvements || "No specific improvements could be suggested",
            betterSolution: feedback.betterSolution || "",
            overallScore: feedback.overallScore || 60
          };
        }
        
        // Critical: Set the status to "reviewed" so the UI knows feedback is ready
        interview.status = "reviewed";
        interview.overallScore = feedback?.overallScore || 60;
        
        console.log('AI feedback saved to interview:', interview.aiFeedback);
      } catch (aiGenError) {
        console.error('AI feedback generation error:', aiGenError);
        interview.aiFeedback = {
          correctness: "Could not assess correctness",
          timeComplexity: "Could not determine",
          spaceComplexity: "Could not determine",
          codeQuality: "Could not assess",
          edgeCases: "Could not assess",
          improvements: "No specific improvements could be suggested",
          betterSolution: "",
          overallScore: 60
        };
        interview.overallScore = 60;
        // Still mark as reviewed even if there was an error
        interview.status = "reviewed";
      }
    } else {
      console.log('Skipping AI feedback - missing API key or question data');
      interview.aiFeedback = { 
        correctness: "Could not assess correctness",
        timeComplexity: "Could not determine",
        spaceComplexity: "Could not determine",
        codeQuality: "Could not assess",
        edgeCases: "Could not assess",
        improvements: "No specific improvements could be suggested",
        betterSolution: "",
        overallScore: 60
      };
      interview.overallScore = 60;
      interview.status = "reviewed";
    }

    // Save the updated interview
    await interview.save();
    console.log('Interview saved with AI feedback');

    // Return the complete interview with feedback
    const updatedInterview = await Interview.findById(interview._id)
      .populate("job question");

    return res.json({
      success: true,
      message: "Interview submitted successfully",
      interview: updatedInterview
    });
  } catch (err) {
    console.error('Interview submission error:', err);
    return res.status(500).json({
      success: false,
      message: "Server error during submission",
      error: err.message
    });
  }
});

// @route   GET api/interviews/statistics
// @desc    Get interview statistics for a user
// @access  Private
router.get("/statistics", auth, async (req, res) => {
  try {
    const totalInterviews = await Interview.countDocuments({
      user: req.user.id,
    });
    const completedInterviews = await Interview.countDocuments({
      user: req.user.id,
      status: { $in: ["submitted", "reviewed"] },
    });

    const averageScore = await Interview.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          overallScore: { $exists: true },
        },
      },
      { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
    ]);

    res.json({
      totalInterviews,
      completedInterviews,
      averageScore: averageScore.length > 0 ? averageScore[0].avgScore : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST api/interviews/generate-question
// @desc    Generate a coding question based on job description
// @access  Private
router.post("/generate-question", auth, async (req, res) => {
  try {
    const { jobDescription, jobTitle, difficulty, interviewId } = req.body;

    // Add randomness to prompt to get different questions
    const randomTopic = [
      'arrays', 'linked lists', 'trees', 'graphs', 
      'dynamic programming', 'sorting', 'searching'
    ][Math.floor(Math.random() * 7)];
    
    // Add a timestamp to ensure different responses each time
    const timestamp = new Date().toISOString();

    const questionPrompt = `
      Generate a unique Data Structures and Algorithms (DSA) coding question 
      focused on ${randomTopic} for a ${difficulty} level ${jobTitle} interview.
      The question should be solvable in under 45 minutes and must be 
      strictly related to DSA concepts. Make sure it's different from any
      previous questions I've asked (current timestamp: ${timestamp}).

      Job Description:
      ${jobDescription}

      Return ONLY valid JSON without any markdown or text outside the JSON.
      The JSON should have the following format:
      {
        "title": "Question Title",
        "description": "Detailed question description",
        "examples": [
          { "input": "Example input 1", "output": "Example output 1" },
          { "input": "Example input 2", "output": "Example output 2" }
        ],
        "difficulty": "${difficulty}",
        "category": "data structures",
        "constraints": [
          "Constraint 1",
          "Constraint 2"
        ],
        "testCases": [
          {"input": "Test case 1 input", "expectedOutput": "Test case 1 output"},
          {"input": "Test case 2 input", "expectedOutput": "Test case 2 output"}
        ]
      }
    `;

    // Check rate limiting
    try {
      await preventRateLimiting('generate-question', req.user.id);
    } catch (cooldownError) {
      return res.status(429).json({ message: cooldownError.message });
    }

    console.log("Generating DSA question with improved parsing");
    
    // Only call Gemini if API key is present
    if (model) {
      try {
        const result = await model.generateContent(questionPrompt);
        const textResult = result.response.text();
        console.log('AI generated content:', textResult);

        // Use the improved parsing function
        let questionData = robustJsonParse(textResult);

        if (!questionData) {
          // If parsing fails, try one more time with a fallback approach
          console.log("Trying fallback parsing approach");
          // Just extract everything between the first { and last }
          const firstBrace = textResult.indexOf('{');
          const lastBrace = textResult.lastIndexOf('}');
          
          if (firstBrace >= 0 && lastBrace > firstBrace) {
            const jsonContent = textResult.substring(firstBrace, lastBrace + 1);
            try {
              questionData = JSON.parse(jsonContent);
              console.log("Fallback parsing succeeded");
            } catch (fallbackError) {
              console.error("Fallback parsing failed:", fallbackError);
            }
          }
          
          if (!questionData) {
            throw new Error("Failed to parse AI response after multiple attempts");
          }
        }

        // Validate and save the question
        try {
          // Create the question with proper error handling
          const question = new Question({
            title: questionData.title,
            description: questionData.description,
            examples: questionData.examples,
            difficulty: questionData.difficulty,
            category: questionData.category,
            constraints: questionData.constraints,
            testCases: questionData.testCases,
            relatedJobs: []
          });

          console.log('Saving DSA question to database');
          const savedQuestion = await question.save();

          
          if (interviewId) {
            try {
              const interview = await Interview.findById(interviewId);

              if (interview) {
                interview.question = savedQuestion._id;
                await interview.save();

                console.log('Question associated with interview:', interview._id);
              }
            } catch (interviewUpdateError) {
              console.error('Error updating interview with question:', interviewUpdateError);
              // Still return the question even if association fails
            }
          }

          res.json({
            success: true,
            message: 'DSA question generated successfully',
            question: savedQuestion
          });
        } catch (questionSaveError) {
          console.error('Error saving question:', questionSaveError);
          res.status(500).json({
            success: false,
            message: 'Error saving question: ' + questionSaveError.message,
            error: questionSaveError.message
          });
        }
      } catch (aiError) {
        console.error('AI question generation error:', aiError);
        // Try to use cached question if available
        if (cache && cache.questions && cache.questions.has(interviewId)) {
          console.log('Using cached question for interview:', interviewId);
          return res.json({
            success: true,
            message: 'Using cached question',
            question: cache.questions.get(interviewId)
          });
        }
        
        return res.status(500).json({
          success: false,
          message: 'Error generating question with AI: ' + aiError.message,
          error: aiError.message
        });
      }
    } else {
      console.warn("AI model not initialized, skipping question generation");
      return res.status(503).json({ success: false, message: "AI service unavailable" });
    }
  } catch (err) {
    console.error('Generate question error:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating question: ' + err.message,
      error: err.message
    });
  }
});

// @route   POST api/interviews/get-test-cases
// @desc    Generate test cases for a coding question
// @access  Private
router.post("/get-test-cases", auth, async (req, res) => {
  try {
    const { questionId } = req.body;

    // First try to get existing test cases from the question
    const question = await Question.findById(questionId);
    if (question && question.testCases && question.testCases.length > 0) {
      return res.json({
        success: true,
        message: 'Retrieved existing test cases',
        testCases: question.testCases.slice(0, 2) // limiting to 2 test cases
      });
    }

    // If no test cases found, return default ones
    const defaultTestCases = [
      { input: "Default input 1", expectedOutput: "Default output 1" },
      { input: "Default input 2", expectedOutput: "Default output 2" }
    ];

    return res.json({
      success: true,
      message: 'Using default test cases',
      testCases: defaultTestCases
    });

  } catch (err) {
    console.error('Get test cases error:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving test cases: ' + err.message
    });
  }
});

// @route   PUT api/interviews/:id/update
// @desc    Update an interview with a new question or code
// @access  Private
router.put("/:id/update", auth, async (req, res) => {
  try {
    const interviewId = req.params.id;
    const updateData = req.body;

    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: "Invalid interview ID format" });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if user is authorized to update this interview
    if (interview.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this interview" });
    }

    // Update the interview with the new data
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: updateData },
      { new: true }
    )
      .populate("job")
      .populate("question")
      .populate("user", "-password");

    res.json(updatedInterview);
  } catch (err) {
    console.error("Error updating interview:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET api/interviews/questions/:id
// @desc    Get a question by ID
// @access  Private
router.get("/questions/:id", auth, async (req, res) => {
  try {
    const questionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID format'
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
     message: 'Question not found'
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (err) {
    console.error('Get question error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Add a new route to check server health
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check models are registered
    const models = mongoose.modelNames();

    res.json({
      success: true,
      status: 'Server is healthy',
      database: dbStatus,
      registeredModels: models,
      aiApiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: 'Server has issues',
      error: err.message
    });
  }
});

// Add a new route to debug the server state
router.get("/debug", auth, async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check if models are registered
    const registeredModels = mongoose.modelNames();
    
    res.json({
      success: true,
      status: 'Server operational',
      database: dbStatus,
      registeredModels,
      aiConfigured: !!process.env.GEMINI_API_KEY,
      endpoints: [
        "/api/interviews/user-interviews",
        "/api/interviews/:id",
        "/api/interviews/start",
        "/api/interviews/generate-question",
        "/api/interviews/get-test-cases",
        "/api/interviews/:id/submit"
      ]
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error checking server status',
      error: err.message
    });
  }
});

module.exports = router;
