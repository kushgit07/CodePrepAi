const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");
const Job = require("../models/Job");
const Question = require("../models/Question");

// Load environment variables
dotenv.config();

// Sample data
const users = [
  {
    name: "Admin User",
    email: "admin@jobsforce.com",
    password: "password123",
    role: "admin",
  },
  {
    name: "Test User",
    email: "user@jobsforce.com",
    password: "password123",
    role: "user",
  },
];

// Expanded mock data - 10 job listings
const mockJobs = [
  {
    _id: "mock1",
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Remote",
    description:
      "We're looking for an experienced frontend developer proficient in React to join our growing team.",
    requirements: [
      "5+ years of experience with React",
      "Experience with state management libraries",
      "Strong CSS and responsive design skills",
      "Experience with testing frameworks",
    ],
    salary: "$120,000 - $150,000",
    jobType: "Full-time",
    skills: ["React", "JavaScript", "CSS", "Redux"],
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock2",
    title: "Backend Engineer",
    company: "DataSystems Inc",
    location: "New York, NY",
    description: "Join our backend team to build scalable APIs and services.",
    requirements: [
      "3+ years of experience with Node.js",
      "Experience with MongoDB or PostgreSQL",
      "Knowledge of RESTful API design",
      "Familiarity with containerization using Docker",
    ],
    salary: "$110,000 - $140,000",
    jobType: "Full-time",
    skills: ["Node.js", "Express", "MongoDB", "Docker"],
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock3",
    title: "Full Stack Developer",
    company: "WebSolutions",
    location: "Chicago, IL",
    description:
      "Building responsive web applications using modern technologies.",
    requirements: [
      "3+ years full stack development experience",
      "Proficient in JavaScript/TypeScript",
      "Experience with React and Node.js",
      "Database design and management",
    ],
    salary: "$100,000 - $130,000",
    jobType: "Full-time",
    skills: ["JavaScript", "React", "Node.js", "MongoDB"],
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock4",
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Remote",
    description:
      "Join our DevOps team to build and maintain our cloud infrastructure and CI/CD pipelines.",
    requirements: [
      "3+ years experience with AWS or Azure",
      "Experience with Docker and Kubernetes",
      "Knowledge of Infrastructure as Code (Terraform, CloudFormation)",
      "CI/CD pipeline implementation",
    ],
    salary: "$130,000 - $160,000",
    jobType: "Full-time",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock5",
    title: "UI/UX Designer",
    company: "Creative Digital",
    location: "San Francisco, CA",
    description:
      "Design beautiful and intuitive user interfaces for web and mobile applications.",
    requirements: [
      "Portfolio demonstrating UI/UX projects",
      "Experience with Figma or Adobe XD",
      "Understanding of user-centered design principles",
      "Ability to create wireframes and prototypes",
    ],
    salary: "$90,000 - $120,000",
    jobType: "Full-time",
    skills: ["UI Design", "UX Design", "Figma", "User Research", "Prototyping"],
    postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock6",
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Boston, MA",
    description:
      "Analyze complex data sets to drive business decisions and product improvements.",
    requirements: [
      "MS or PhD in Computer Science, Statistics, or related field",
      "Experience with Python and data analysis libraries",
      "Knowledge of machine learning algorithms",
      "Experience with big data technologies",
    ],
    salary: "$120,000 - $150,000",
    jobType: "Full-time",
    skills: [
      "Python",
      "Machine Learning",
      "SQL",
      "Data Visualization",
      "Statistics",
    ],
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock7",
    title: "Mobile App Developer",
    company: "AppWorks Inc",
    location: "Austin, TX",
    description:
      "Create cutting-edge mobile applications for iOS and Android platforms.",
    requirements: [
      "Experience with React Native or Flutter",
      "Knowledge of iOS and Android development",
      "Understanding of mobile UI/UX principles",
      "Experience with RESTful APIs",
    ],
    salary: "$95,000 - $125,000",
    jobType: "Full-time",
    skills: ["React Native", "Flutter", "iOS", "Android", "Mobile Development"],
    postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock8",
    title: "Cloud Security Engineer",
    company: "SecureNet",
    location: "Remote",
    description:
      "Help us secure our cloud infrastructure and implement best security practices.",
    requirements: [
      "Experience with AWS/Azure/GCP security services",
      "Knowledge of security compliance frameworks",
      "Understanding of network security concepts",
      "Experience with security monitoring tools",
    ],
    salary: "$130,000 - $160,000",
    jobType: "Full-time",
    skills: [
      "Cloud Security",
      "AWS",
      "Security Compliance",
      "Network Security",
    ],
    postedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock9",
    title: "Product Manager",
    company: "ProductPro",
    location: "Seattle, WA",
    description:
      "Lead the product development lifecycle for our SaaS platform.",
    requirements: [
      "3+ years of product management experience",
      "Strong understanding of user research methodologies",
      "Experience with agile development processes",
      "Technical background preferred",
    ],
    salary: "$120,000 - $150,000",
    jobType: "Full-time",
    skills: ["Product Management", "Agile", "User Research", "Roadmapping"],
    postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
  {
    _id: "mock10",
    title: "Machine Learning Engineer",
    company: "AI Innovations",
    location: "Remote",
    description:
      "Develop and deploy machine learning models to solve real-world problems.",
    requirements: [
      "Strong background in ML algorithms",
      "Experience with TensorFlow or PyTorch",
      "Python programming skills",
      "Data preprocessing and feature engineering expertise",
    ],
    salary: "$140,000 - $180,000",
    jobType: "Full-time",
    skills: ["Machine Learning", "TensorFlow", "Python", "AI"],
    postedDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    applicationUrl: "https://example.com/apply",
  },
];

// For seeding the original jobs format by overwriting the _id
const seedJobs = mockJobs.map(({ _id, ...rest }) => rest);

const questions = [
  {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
    ],
    difficulty: "easy",
    category: "algorithms",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
      },
    ],
    relatedJobs: [],
  },
  {
    title: "Reverse a Linked List",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list. Implement a function that takes a pointer to the head node of a linked list, and returns a pointer to the new head of the reversed linked list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
      },
    ],
    difficulty: "medium",
    category: "data structures",
    constraints: [
      "The number of nodes in the list is the range [0, 5000]",
      "-5000 <= Node.val <= 5000",
    ],
    testCases: [
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "[5,4,3,2,1]",
      },
    ],
    relatedJobs: [],
  },
  {
    title: "Binary Tree Level Order Traversal",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
      },
    ],
    difficulty: "medium",
    category: "data structures",
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000]",
      "-1000 <= Node.val <= 1000",
    ],
    testCases: [
      {
        input: "[3,9,20,null,null,15,7]",
        expectedOutput: "[[3],[9,20],[15,7]]",
      },
    ],
    relatedJobs: [],
  },
];

// Separate seed function that connects to MongoDB
const runSeedData = async () => {
  try {
    // Connect to MongoDB only if this file is being executed directly
    if (require.main === module) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log("Connected to MongoDB for seeding");
    }

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Question.deleteMany({});

    // Insert jobs
    const createdJobs = await Job.insertMany(seedJobs);

    // Update questions with job IDs
    for (let question of questions) {
      question.relatedJobs = [
        createdJobs[Math.floor(Math.random() * createdJobs.length)]._id,
        createdJobs[Math.floor(Math.random() * createdJobs.length)]._id,
      ];
    }

    await Question.insertMany(questions);

    // Hash passwords and create users
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    await User.insertMany(users);

    console.log("Database seeded successfully");
    
    // Only exit if this file is being executed directly
    if (require.main === module) {
      mongoose.disconnect();
      process.exit(0);
    }
    
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    
    // Only exit if this file is being executed directly
    if (require.main === module) {
      process.exit(1);
    }
    
    throw error;
  }
};

// Run the seed function only if this file is being executed directly
if (require.main === module) {
  runSeedData();
}

// Export the mock data and the seed function so they can be imported elsewhere
module.exports = { 
  mockJobs,
  seedJobs,
  questions,
  users,
  runSeedData
};
