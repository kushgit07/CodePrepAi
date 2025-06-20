import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthContext from "../context/AuthContext";
import {
  FaCode,
  FaLightbulb,
  FaBrain,
  FaExclamationCircle,
} from "react-icons/fa";
import { codeAPI, interviewsAPI } from "../utils/api";

// Components
import Modal from "../components/common/Modal";
import QuestionPanel from "../components/interview/QuestionPanel";
import CodeEditor from "../components/interview/CodeEditor";
import TestCasePanel from "../components/interview/TestCasePanel";
import FeedbackPanel from "../components/interview/FeedbackPanel";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Default language templates
const languageTemplates = {
  javascript: `/**
 * @param {*} input - The input parameter(s) for your solution
 * @return {*} - The output of your solution
 */
function solution(input) {
  // Your solution here
  
  return null;
}

// Example usage:
// const result = solution([1, 2, 3]);
// console.log(result);`,

  python: `def solution(input):
    """
    :param input: The input parameter(s) for your solution
    :return: The output of your solution
    """
    # Your solution here
    
    return None

# Example usage:
# result = solution([1, 2, 3])
# print(result)`,

  java: `import java.util.*;

public class Solution {
    /**
     * @param input The input parameter(s) for your solution
     * @return The output of your solution
     */
    public static Object solution(Object input) {
        // Your solution here
        
        return null;
    }
    
    // Example usage (uncomment to test):
    /*
    public static void main(String[] args) {
        int[] input = {1, 2, 3};
        Object result = solution(input);
        System.out.println(result);
    }
    */
}`,

  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

/**
 * @param input The input parameter(s) for your solution
 * @return The output of your solution
 */
template <typename T>
T solution(T input) {
    // Your solution here
    
    return T();
}

// Example usage (uncomment to test):
/*
int main() {
    vector<int> input = {1, 2, 3};
    auto result = solution(input);
    // Print result
    return 0;
}
*/`,

  csharp: `using System;
using System.Collections.Generic;
using System.Linq;

public class Solution {
    /**
     * @param input The input parameter(s) for your solution
     * @return The output of your solution
     */
    public static object SolveProblem(object input) {
        // Your solution here
        
        return null;
    }
    
    // Example usage (uncomment to test):
    /*
    public static void Main() {
        int[] input = {1, 2, 3};
        var result = SolveProblem(input);
        Console.WriteLine(result);
    }
    */
}`,

  ruby: `# @param input The input parameter(s) for your solution
# @return The output of your solution
def solution(input)
  # Your solution here
  
  return nil
end

# Example usage:
# result = solution([1, 2, 3])
# puts result`,
};

const MockInterview = () => {
  const params = useParams();
  const interviewId = params.id || params.interviewId;
  const jobId = params.jobId;
  const navigate = useNavigate();
  const { isAuthenticated, token } = useContext(AuthContext);

  // States
  const [interview, setInterview] = useState(null);
  const [job, setJob] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionState, setSubmissionState] = useState("submitting");
  const [viewMode, setViewMode] = useState("split");
  const [testCases, setTestCases] = useState([]);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isTestingAllCases, setIsTestingAllCases] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [apiCooldown, setApiCooldown] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState("");

  // Track if test cases have been requested yet
  const [testCasesRequested, setTestCasesRequested] = useState(false);

  // State to control test cases panel visibility
  const [showTestCases, setShowTestCases] = useState(false);

  // Ai - Feedback - State
  const [showAiFeedback, setShowAiFeedback] = useState(false);

  // Language options
  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "ruby", label: "Ruby" },
  ];

  
  const [questionRequestInProgress, setQuestionRequestInProgress] =
    useState(false);

  // Modify your useEffect to set the initial code template
  useEffect(() => {
    // Set initial code based on selected language
    if (!code || code.trim() === "") {
      setCode(languageTemplates[language] || languageTemplates.javascript);
    }
  }, [language]);

  // Check if the user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: `/interview/${jobId}/${interviewId}` },
      });
    }
  }, [isAuthenticated, navigate, jobId, interviewId]);

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        console.log("Fetching interview with ID:", interviewId);
        setLoading(true);
        setError(null);

        const response = await interviewsAPI.getInterviewById(interviewId);

        console.log("Interview API response:", response);

        if (response.success) {
          setInterview(response.interview);
          setJob(response.job);

          // Check if a question already exists
          if (response.interview.question) {
            console.log(
              "Question found in interview:",
              response.interview.question
            );

            // If we got the full question data
            if (
              typeof response.interview.question === "object" &&
              response.interview.question !== null
            ) {
              console.log("Full question data available");
              setQuestion(response.interview.question);

              // Set code template
              if (!code || code.trim() === "") {
                setCode(
                  languageTemplates[language] || languageTemplates.javascript
                );
              }
            }
            // If we just got a question ID, fetch the full question
            else if (typeof response.interview.question === "string") {
              console.log("Only question ID available, fetching question data");
              if (!questionRequestInProgress) {
                await generateQuestion(response.job, response.interview);
              }
            }
          } else {
            console.log("No question set, will generate one...");
            // Only automatically generate if we don't have one
            if (
              response.job &&
              response.interview &&
              !questionRequestInProgress
            ) {
              await generateQuestion(response.job, response.interview);
            }
          }
        } else {
          setError("Failed to load interview details");
        }
      } catch (err) {
        console.error("Interview fetch error:", err);
        setError(
          "Error loading interview: " +
          (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterview();
    } else {
      setError("No interview ID provided");
    }
  }, [interviewId]);


  const generateQuestion = async (jobData, interviewData) => {
    // Implement strong locking mechanism
    if (questionRequestInProgress) {
      console.log(
        "Question generation already in progress, ignoring duplicate request"
      );
      return;
    }

    try {
      // Set both loading indicators
      setQuestionRequestInProgress(true);
      setIsGeneratingQuestion(true);
      setError(null);

      console.log(`Generating question for interview ${interviewData._id}`);

      const response = await interviewsAPI.generateQuestion({
        jobDescription: jobData.description || "",
        jobTitle: jobData.title || "Coding Challenge",
        difficulty: interviewData.complexity || "medium",
        interviewId: interviewData._id,
      });

      console.log("Question generation response:", response);

      if (response.success && response.question) {
        console.log("Setting new question:", response.question);

        // Set the question state
        setQuestion(response.question);

        // Update the interview object to include the question
        setInterview((prev) => ({
          ...prev,
          question: response.question._id,
        }));

        // If your question has a code starter template, set it
        if (response.question.starterCode) {
          setCode(response.question.starterCode);
        } else {
          // Otherwise, use our language template
          setCode(languageTemplates[language] || languageTemplates.javascript);
        }

        // Force a re-render for good measure
        setTimeout(() => {
          console.log("Re-render triggered");
          setQuestion({ ...response.question });
        }, 100);
      } else {
        setError(response.message || "Failed to generate question");
      }
    } catch (err) {
      console.error("Question generation error:", err);
      setError("Error generating question: " + (err.message || err.toString()));
    } finally {
      // Release both locks
      setIsGeneratingQuestion(false);
      setQuestionRequestInProgress(false);
    }
  };

  // Update your handleLanguageChange function
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    // Asking user before replacing their code if they've already written something
    if (
      code &&
      code.trim() !== "" &&
      !Object.values(languageTemplates).includes(code) &&
      !window.confirm(
        "Changing the language will replace your current code. Continue?"
      )
    ) {
      return;
    }

    // Set the template for the new language
    setCode(languageTemplates[newLanguage] || languageTemplates.javascript);
  };

  // Handle code execution (test run)
  const handleRunCode = async () => {
    if (!code.trim()) {
      setError("Please write some code first.");
      return;
    }

    setExecuting(true);
    setExecutionResult(null);
    setError(null);

    try {
      const res = await codeAPI.executeCode(code, language, "");

      setExecutionResult(res);
    } catch (err) {
      setError(
        "Error executing code: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setExecuting(false);
    }
  };

  // Generate test cases for the question - With cooldown handling
  const generateTestCases = async () => {
    if (!question) {
      setError("No question available to generate test cases.");
      return;
    }

    setTestCasesRequested(true);
    setShowTestCases(true);
    setError(null);

    try {
      // Use the test cases that came with the question
      if (question.testCases && question.testCases.length > 0) {
        setTestCases(question.testCases.slice(0, 2)); // Keep limiting to 2 test cases
        return;
      }

      // If no test cases in question, use defaults
      const defaultTestCases = [
        { input: "Default input 1", expectedOutput: "Default output 1" },
        { input: "Default input 2", expectedOutput: "Default output 2" }
      ];
      setTestCases(defaultTestCases);

    } catch (err) {
      console.error("Error setting test cases:", err);
      setError("Failed to load test cases: " + err.message);
    }
  };

  // Run code against all test cases - With limit
  const runAllTestCases = async () => {
    if (!code.trim() || !testCases.length) {
      setError("Please write some code and generate test cases first.");
      return;
    }

    setIsTestingAllCases(true);
    setTestResults([]);
    setError(null);

    try {
      // Only use up to 2 test cases
      const limitedTestCases = testCases.slice(0, 2);
      const results = [];

      for (const testCase of limitedTestCases) {
        try {
          const res = await codeAPI.executeCode(code, language, testCase.input);

          // Simple string comparison for test results
          let passed = false;
          try {
            const output = res.stdout?.trim() || "";
            const expected = testCase.expectedOutput?.trim() || "";
            passed = output === expected;
          } catch (compError) {
            passed = false;
          }

          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: res.stdout,
            passed,
            execution: res,
          });
        } catch (err) {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            error: err.response?.data?.message || err.message,
            passed: false,
          });
        }
      }

      setTestResults(results);
    } catch (err) {
      setError(
        "Error running test cases: " +
        (err.response?.data?.message || err.message)
      );
    } finally {
      setIsTestingAllCases(false);
    }
  };

  // Generate question - With cooldown handling
  const generateQuestionFromJobDescription = async () => {
    if (!job?.description) {
      setError("No job description available to generate questions.");
      return;
    }

    if (apiCooldown) {
      setError(cooldownMessage || "Please wait before making another request.");
      return;
    }

    setIsGeneratingQuestion(true);
    setError(null);

    try {
      const res = await interviewsAPI.generateQuestion(
        job.description,
        job.title,
        "medium",
        interviewId
      );

      if (res && res.question) {
        setQuestion(res.question);
      }
    } catch (err) {
      // Handle rate limiting errors specially
      if (err.response?.status === 429) {
        setApiCooldown(true);
        setCooldownMessage(err.response.data.message);

        // Auto-clear cooldown message after the cooldown period
        setTimeout(() => {
          setApiCooldown(false);
          setCooldownMessage("");
        }, 5000); // Match the server's cooldown period
      }

      setError(
        "Error generating question: " +
        (err.response?.data?.message || err.message)
      );
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Handle code submission
  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setError("Please write some code before submitting.");
      return;
    }

    // Show feedback panel immediately with loading state
    setFeedback({
      overallScore: "...",
      correctness: "Analyzing your solution...",
      timeComplexity: "Calculating complexity...",
      spaceComplexity: "Analyzing space usage...",
      codeQuality: "Evaluating code quality...",
      edgeCases: "Checking edge cases...",
      improvements: "Finding potential improvements...",
      betterSolution: "",
      isLoading: true, 
    });

    setShowSubmissionModal(true);
    setSubmissionState("submitting");

    try {
      // Save code to the interview
      await interviewsAPI.submitInterview(interviewId, {
        code,
        language,
      });

      setSubmissionState("success");

      // Start polling for feedback
      pollForFeedback();
    } catch (err) {
      setSubmissionState("error");
      setError(
        "Error submitting code: " + (err.response?.data?.message || err.message)
      );
    }
  };

  // Poll for feedback - With timeout
  const pollForFeedback = () => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await interviewsAPI.getInterviewById(interviewId);

        if (res.status === "reviewed") {
          clearInterval(pollInterval);
          if (res.aiFeedback) {
            console.log("Feedback received:", res.aiFeedback);
            // Update the existing feedback with the real AI feedback
            setFeedback({
              ...res.aiFeedback,
              isLoading: false, 
            });
          } else {
            console.error("Interview is reviewed but no feedback found");
            // Update with a "feedback not available" message
            setFeedback((prev) => ({
              ...prev,
              correctness: "Feedback not available",
              timeComplexity: "Not available",
              spaceComplexity: "Not available",
              codeQuality: "Not available",
              edgeCases: "Not available",
              improvements: "Try submitting again later",
              isLoading: false,
            }));
          }
        }
      } catch (err) {
        console.error("Error polling for feedback:", err);
      }
    }, 2000); 

    // Clean up interval after 2 minutes (timeout)
    setTimeout(() => {
      clearInterval(pollInterval);
      // If we reach timeout, update feedback to show timeout message
      setFeedback((prev) => {
        if (prev.isLoading) {
          return {
            ...prev,
            correctness: "Feedback generation took too long",
            timeComplexity: "Not available",
            spaceComplexity: "Not available",
            codeQuality: "Not available",
            edgeCases: "Not available",
            improvements: "Please try submitting again",
            isLoading: false,
          };
        }
        return prev;
      });
    }, 120000);
  };


  const getLanguageTemplate = (languageKey) => {
    return languageTemplates[languageKey] || languageTemplates.javascript;
  };

  // button to reset code to template
  const resetCodeToTemplate = () => {
    if (window.confirm("Reset your code to the template?")) {
      setCode(getLanguageTemplate(language));
    }
  };

  // function to handle AI feedback request
  const requestAiFeedback = async () => {
    if (!code.trim()) {
      setError("Please write some code first.");
      return;
    }

    setFeedback({ isLoading: true });
    setShowAiFeedback(true);

    try {
      const res = await interviewsAPI.submitInterview(interviewId, {
        code,
        language,
        requestFeedbackOnly: true
      });

      if (res.success && res.interview.aiFeedback) {
        setFeedback({
          ...res.interview.aiFeedback,
          isLoading: false
        });
      } else {
        throw new Error("Could not generate AI feedback");
      }
    } catch (err) {
      setError("Error getting AI feedback: " + (err.response?.data?.message || err.message));
      setFeedback(null);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="medium" color="#3498db" />
        <LoadingText>Loading interview...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error && !interview) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <MockInterviewContainer>
      <InterviewHeader>
        <HeaderContent>
          <div>
            <JobTitle>{job?.title || "Mock Interview"}</JobTitle>
            <CompanyName>{job?.company || ""}</CompanyName>
          </div>
          <HeaderActionGroup>
            <ViewModeToggle>
              <ViewModeButton
                active={viewMode === "question"}
                onClick={() => setViewMode("question")}
                title="Question View"
              >
                <FaLightbulb />
              </ViewModeButton>
              <ViewModeButton
                active={viewMode === "editor"}
                onClick={() => setViewMode("editor")}
                title="Editor View"
              >
                <FaCode />
              </ViewModeButton>
              <ViewModeButton
                active={viewMode === "split"}
                onClick={() => setViewMode("split")}
                title="Split View"
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FaLightbulb
                    style={{ marginRight: "4px", fontSize: "0.8em" }}
                  />
                  <FaCode style={{ fontSize: "0.8em" }} />
                </div>
              </ViewModeButton>
            </ViewModeToggle>
            <LanguageSelect value={language} onChange={handleLanguageChange}>
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </LanguageSelect>
          </HeaderActionGroup>
        </HeaderContent>
      </InterviewHeader>

      {/* Display error message at the top if there's an error */}
      {error && (
        <ErrorBanner>
          <ErrorIcon>
            <FaExclamationCircle />
          </ErrorIcon>
          <ErrorText>{error}</ErrorText>
          <CloseButton onClick={() => setError(null)}>×</CloseButton>
        </ErrorBanner>
      )}

      <InterviewContent viewMode={viewMode}>
        {/* Question Panel */}
        {(viewMode === "question" || viewMode === "split") && (
          <QuestionContainer viewMode={viewMode}>
            <QuestionPanel
              viewMode={viewMode}
              question={question}
              job={job}
              isGeneratingQuestion={isGeneratingQuestion}
              onGenerateQuestion={generateQuestionFromJobDescription}
            />
          </QuestionContainer>
        )}

        {/* Editor Panel */}
        {(viewMode === "editor" || viewMode === "split") && (
          <EditorPanel viewMode={viewMode}>
            <EditorContainer>
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
                executing={executing}
                executionResult={executionResult}
                error={null} 
              />
            </EditorContainer>

            <ActionButtons>
              <ActionButton primary onClick={handleRunCode} disabled={executing}>
                {executing ? "Running..." : "Run Code"}
              </ActionButton>

              <ActionButton
                onClick={requestAiFeedback}
                disabled={executing || feedback?.isLoading}
              >
                <FaBrain style={{ marginRight: '4px' }} />
                {feedback?.isLoading ? "Analyzing..." : "Get AI Feedback"}
              </ActionButton>

              <ActionButton secondary onClick={handleSubmitCode} disabled={executing}>
                Submit Solution
              </ActionButton>

              <ActionButton
                onClick={() => {
                  if (question?.testCases?.length > 0) {
                    setTestCases(question.testCases.slice(0, 2));
                    setShowTestCases(true);
                  } else {
                    generateTestCases();
                  }
                }}
                disabled={!question}
              >
                View Test Cases
              </ActionButton>
            </ActionButtons>
          </EditorPanel>
        )}
      </InterviewContent>

      {/* Submission Modal */}
      {showSubmissionModal && (
        <Modal
          isOpen={showSubmissionModal}
          onClose={() =>
            submissionState !== "submitting" && setShowSubmissionModal(false)
          }
          title="Code Submission"
          submissionState={submissionState}
          feedback={feedback}
        />
      )}

      {/* Display test cases panel at the bottom */}
      {showTestCases && (
        <TestCasePanel
          testCases={testCases.slice(0, 2)}
          testResults={testResults}
          isTestingAllCases={isTestingAllCases}
          onGenerateTestCases={() => generateTestCases()}
          onRunAllTestCases={runAllTestCases}
          onClose={() => setShowTestCases(false)}
        />
      )}

      {/* Display feedback separately */}
      {showAiFeedback && (
        <FeedbackPanel
          feedback={feedback}
          onClose={() => {
            setShowAiFeedback(false);
            setFeedback(null);
          }}
        />
      )}

      {/* Add a reset button near your code editor */}
      <ResetButton onClick={resetCodeToTemplate} style={{ color: "black" }}>
        Reset Template
      </ResetButton>

      {isGeneratingQuestion && (
        <LoadingOverlay>
          <LoadingSpinner size="large" />
          <LoadingText>Generating DSA question...</LoadingText>
        </LoadingOverlay>
      )}
    </MockInterviewContainer>
  );
};

// Styled Components
const MockInterviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: #f8f9fa;
`;

const InterviewHeader = styled.div`
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1800px;
  margin: 0 auto;
`;

const HeaderActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const JobTitle = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  margin-bottom: 0.3rem;
  font-weight: 700;
`;

const CompanyName = styled.h2`
  font-size: 1rem;
  font-weight: normal;
  margin: 0;
  opacity: 0.9;
`;

const ViewModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ViewModeButton = styled.button`
  padding: 0.5rem 0.8rem;
  background-color: ${(props) => (props.active ? "#3498db" : "#e0e6ed")};
  color: ${(props) => (props.active ? "white" : "#2c3e50")};
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: ${(props) => (props.active ? "#2980b9" : "#d0d7de")};
  }
`;

const LanguageSelect = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  background-color: white;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  color: #2c3e50;
  font-weight: 500;
`;

const InterviewContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
`;

const QuestionContainer = styled.div`
  flex: ${(props) => (props.viewMode === "split" ? "0 0 50%" : "1 0 100%")};
  display: ${(props) => (props.viewMode === "editor" ? "none" : "flex")};
  flex-direction: column;
  background-color: white;
  border-right: ${(props) =>
    props.viewMode === "split" ? "1px solid #eee" : "none"};
  overflow-y: auto;
`;

const EditorPanel = styled.div`
  flex: ${(props) => (props.viewMode === "split" ? "0 0 50%" : "1 0 100%")};
  display: ${(props) => (props.viewMode === "question" ? "none" : "flex")};
  flex-direction: column;
  background-color: #f8fafc;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.8rem;
  padding: 1rem;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const ActionButton = styled.button`
  padding: 0.6rem 1rem;
  background: ${(props) =>
    props.primary
      ? "linear-gradient(to right, #2ecc71, #27ae60)"
      : props.secondary
        ? "linear-gradient(to right, #3498db, #2980b9)"
        : "#f0f0f0"};
  color: ${(props) => (props.primary || props.secondary ? "white" : "#333")};
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  background-color: #ffeaea;
  color: #e74c3c;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.2);
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  background-color: #ffeaea;
  color: #e74c3c;
  padding: 0.8rem 1.5rem;
  margin: 0.5rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ErrorIcon = styled.span`
  margin-right: 10px;
`;

const ErrorText = styled.span`
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #e74c3c;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

const EditorContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

const ResetButton = styled.button`
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  margin: 8px;
  cursor: pointer;
  width: 100px;
  font-size: 12px;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const NoQuestionMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: center;
`;

const GenerateButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: #0069d9;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #e9ecef;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RefreshIcon = styled.span`
  &:before {
    content: "↻";
  }
`;

export default MockInterview;
