// Base API URL that works in both development and production environments
export const API_URL =
  process.env.NODE_ENV === "production"
    ? import.meta.env.VITE_API_URL || "https://api.codeprepai.dev-om.live/api" // Production subdomain
    : "http://localhost:5000/api"; // Development environment

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  GET_USER: "/auth/user",
  UPDATE_PROFILE: "/users/profile",
};

// Jobs endpoints
export const JOBS_ENDPOINTS = {
  GET_ALL: "/jobs",
  GET_MOCK: "/jobs/mock",
  GET_BY_ID: "/jobs",
  GET_MOCK_BY_ID: "/jobs/mock",
};

// Interviews endpoints
export const INTERVIEWS_ENDPOINTS = {
  GET_USER_INTERVIEWS: "/interviews/user-interviews",
  GET_BY_ID: "/interviews",
  START: "/interviews/start",
  SUBMIT: "/interviews",
  GENERATE_QUESTION: "/interviews/generate-question",
  GENERATE_TEST_CASES: "/interviews/generate-test-cases", // This might be missing
};

// Code execution endpoints
export const CODE_ENDPOINTS = {
  EXECUTE: "/code/execute",
  TEST: "/code/test",
};

// If you're using user management endpoints outside auth
export const USER_ENDPOINTS = {
  DELETE_ACCOUNT: "/users", // For the delete account functionality
};
