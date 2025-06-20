import axios from "axios";
import {
  API_URL,
  AUTH_ENDPOINTS,
  JOBS_ENDPOINTS,
  INTERVIEWS_ENDPOINTS,
  CODE_ENDPOINTS,
} from "./constants";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_API_URL || "https://api.codeprepai.dev-om.live/api"
    : "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, {
      name,
      email,
      password,
    });
    return response.data;
  },

  getUser: async () => {
    const response = await api.get(AUTH_ENDPOINTS.GET_USER);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put(AUTH_ENDPOINTS.UPDATE_PROFILE, userData);
    return response.data;
  },

  deleteAccount: async () => {
    await api.delete("/users");
    return { success: true };
  },
};

// Jobs API
export const jobsAPI = {
  getAllJobs: async (page = 1, filters = {}) => {
    const response = await api.get(JOBS_ENDPOINTS.GET_ALL, {
      params: { page, ...filters },
    });
    return response.data; 
  },

  getMockJobs: async () => {
    const response = await api.get(JOBS_ENDPOINTS.GET_MOCK);
    return response.data; 
  },

  getJobById: async (jobId) => {
    const response = await api.get(`${JOBS_ENDPOINTS.GET_BY_ID}/${jobId}`);
    return response.data;
  },

  getMockJobById: async (jobId) => {
    const response = await api.get(`${JOBS_ENDPOINTS.GET_MOCK_BY_ID}/${jobId}`);
    return response.data; 
  },
};

// Interviews API
export const interviewsAPI = {
  getUserInterviews: async () => {
    const response = await api.get(INTERVIEWS_ENDPOINTS.GET_USER_INTERVIEWS);
    return response.data;
  },

  getInterviewById: async (id) => {
    const response = await api.get(`${INTERVIEWS_ENDPOINTS.GET_BY_ID}/${id}`);
    return response.data;
  },

  startInterview: async (jobId, complexity) => {
    const response = await api.post(INTERVIEWS_ENDPOINTS.START, {
      jobId,
      complexity,
    });
    return response.data;
  },

  submitInterview: async (interviewId, data) => {
    const response = await api.put(
      `${INTERVIEWS_ENDPOINTS.SUBMIT}/${interviewId}/submit`,
      data
    );
    return response.data;
  },

  generateQuestion: async function (data) {
    let payload;

    if (arguments.length === 1 && typeof data === "object" && data !== null) {
      payload = data;
    } else {
      const jobDescription = arguments[0];
      const jobTitle = arguments[1];
      const difficulty = arguments[2];
      const interviewId = arguments[3];

      payload = {
        jobDescription,
        jobTitle,
        difficulty,
        interviewId,
      };
    }

    console.log("Sending question generation payload:", payload);

    try {
      const response = await api.post(
        INTERVIEWS_ENDPOINTS.GENERATE_QUESTION,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error in generateQuestion API call:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.toString(),
      };
    }
  },

  generateTestCases: async function (data) {
    try {
      const response = await api.post(
        INTERVIEWS_ENDPOINTS.GENERATE_TEST_CASES,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error in generateTestCases API call:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error.toString(),
      };
    }
  },
};

// Code Execution API
export const codeAPI = {
  executeCode: async (code, language, input = "") => {
    const response = await api.post(CODE_ENDPOINTS.EXECUTE, {
      code,
      language,
      input,
    });
    return response.data;
  },

  runTests: async (code, language, testCases) => {
    const response = await api.post(CODE_ENDPOINTS.TEST, {
      code,
      language,
      testCases,
    });
    return response.data;
  },
};

export default api;
