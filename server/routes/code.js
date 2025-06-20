const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");

// Judge0 language IDs mapping
const languageIds = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 54, // C++
  csharp: 51, // C#
  ruby: 72, // Ruby
};

// @route   POST api/code/execute
// @desc    Execute code using Judge0 API
// @access  Private
router.post("/execute", auth, async (req, res) => {
  try {
    const { code, language, input, expectedOutput } = req.body;

    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }

    if (!languageIds[language]) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    // Prepare Judge0 submission
    const submissionData = {
      source_code: code,
      language_id: languageIds[language],
      stdin: input || "",
      expected_output: expectedOutput || null,
    };

    // Call Judge0 API to create a submission
    const createSubmissionResponse = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions`,
      submissionData,
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        params: {
          base64_encoded: "false",
          fields: "*",
        },
      }
    );

    const token = createSubmissionResponse.data.token;

    // Poll for the result
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const getSubmissionResponse = await axios.get(
        `${process.env.JUDGE0_API_URL}/submissions/${token}`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
          params: {
            base64_encoded: "false",
            fields: "*",
          },
        }
      );

      result = getSubmissionResponse.data;

      // If the processing is complete, stop polling
      if (result.status.id > 2) {
        // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, etc.
        break;
      }

      // Wait before next polling attempt
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    // Format and send the result back to the client
    const response = {
      status: result.status.description,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compile_output: result.compile_output || "",
      time: result.time,
      memory: result.memory,
      exit_code: result.exit_code,
      token: token,
    };

    res.json(response);
  } catch (err) {
    console.error("Error executing code:", err);
    res.status(500).json({
      message: "Error executing code",
      error: err.response?.data || err.message,
    });
  }
});

// @route   POST api/code/test
// @desc    Run test cases for a solution
// @access  Private
router.post("/test", auth, async (req, res) => {
  const { code, language, testCases } = req.body;

  if (!code || !language || !testCases || !Array.isArray(testCases)) {
    return res
      .status(400)
      .json({ message: "Code, language, and test cases array are required" });
  }

  try {
    const results = [];

    // Process each test case
    for (const testCase of testCases) {
      const { input, expectedOutput } = testCase;

      // Execute code with the test case input
      const executionResponse = await axios.post(
        `${req.protocol}://${req.get("host")}/api/code/execute`,
        { code, language, input },
        { headers: { "x-auth-token": req.header("x-auth-token") } }
      );

      const executionResult = executionResponse.data;
      const actualOutput = executionResult.stdout.trim();
      const success =
        executionResult.status === "Success" &&
        actualOutput === expectedOutput.trim();

      results.push({
        input,
        expectedOutput,
        actualOutput,
        passed: success,
        executionStatus: executionResult.status,
        error: executionResult.stderr || executionResult.compile_output || "",
      });
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    res.json({
      success: passedCount === totalCount,
      passedCount,
      totalCount,
      results,
    });
  } catch (error) {
    console.error("Test execution error:", error);
    res.status(500).json({
      message: "Error running tests",
      error: error.response ? error.response.data : error.message,
    });
  }
});

module.exports = router;
