const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Collection of new questions to add
const newQuestions = [
  {
    title: 'Two Sum Problem',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'easy',
    category: 'algorithms',
    tags: ['array', 'hash table'],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      {
        input: '[2,7,11,15], 9',
        output: '[0,1]'
      },
      {
        input: '[3,2,4], 6',
        output: '[1,2]'
      }
    ],
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: ['Consider using a hash map to store the values you\'ve seen so far.']
  },
  {
    title: 'Reverse a Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'easy',
    category: 'data structures',
    tags: ['linked list'],
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
        explanation: 'The linked list is reversed.'
      }
    ],
    solution: `function reverseList(head) {
  let prev = null;
  let current = head;
  
  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  
  return prev;
}`
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.',
    difficulty: 'easy',
    category: 'algorithms',
    tags: ['stack', 'string'],
    solution: `function isValid(s) {
  const stack = [];
  const map = {
    '(': ')',
    '[': ']',
    '{': '}'
  };
  
  for (let i = 0; i < s.length; i++) {
    if (s[i] in map) {
      stack.push(s[i]);
    } else {
      const last = stack.pop();
      if (map[last] !== s[i]) {
        return false;
      }
    }
  }
  
  return stack.length === 0;
}`
  },
  {
    title: 'Implement a Queue Using Stacks',
    description: 'Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).',
    difficulty: 'medium',
    category: 'data structures',
    tags: ['stack', 'design'],
    solution: `class MyQueue {
  constructor() {
    this.stack1 = []; // for pushing
    this.stack2 = []; // for popping
  }
  
  push(x) {
    this.stack1.push(x);
  }
  
  pop() {
    if (this.stack2.length === 0) {
      while (this.stack1.length > 0) {
        this.stack2.push(this.stack1.pop());
      }
    }
    return this.stack2.pop();
  }
  
  peek() {
    if (this.stack2.length === 0) {
      while (this.stack1.length > 0) {
        this.stack2.push(this.stack1.pop());
      }
    }
    return this.stack2[this.stack2.length - 1];
  }
  
  empty() {
    return this.stack1.length === 0 && this.stack2.length === 0;
  }
}`
  },
  {
    title: 'Responsive Image Gallery',
    description: 'Create a responsive image gallery that displays images in a grid layout. The gallery should adapt to different screen sizes and provide a lightbox feature for viewing images in full-screen mode.',
    difficulty: 'medium',
    category: 'frontend',
    tags: ['html', 'css', 'javascript', 'responsive design'],
    solution: `// This is a simplified example of the HTML/CSS/JS for a responsive image gallery
// HTML
<div class="gallery-container">
  <div class="gallery">
    <div class="image-item" data-src="image1.jpg">
      <img src="image1-thumb.jpg" alt="Image 1">
    </div>
    <!-- More image items -->
  </div>
  <div class="lightbox">
    <span class="close">&times;</span>
    <img class="lightbox-content">
  </div>
</div>

// CSS
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.image-item {
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-item img:hover {
  transform: scale(1.05);
}

.lightbox {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
}

.lightbox-content {
  display: block;
  max-width: 90%;
  max-height: 90%;
  margin: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// JavaScript
document.querySelectorAll('.image-item').forEach(item => {
  item.addEventListener('click', e => {
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-content');
    
    lightboxImg.src = item.dataset.src;
    lightbox.style.display = 'block';
  });
});

document.querySelector('.lightbox .close').addEventListener('click', () => {
  document.querySelector('.lightbox').style.display = 'none';
});`
  },
  {
    title: 'RESTful API with Express and MongoDB',
    description: 'Implement a RESTful API for a product management system using Express.js and MongoDB. The API should support CRUD operations and include proper error handling and validation.',
    difficulty: 'medium',
    category: 'backend',
    tags: ['node.js', 'express', 'mongodb', 'rest api'],
    solution: `// server.js
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/products');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/products_db')
  .then(() => {
    app.listen(3000, () => console.log('Server started on port 3000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));

// models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  description: String,
  category: String,
  inStock: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/', async (req, res, next) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// Update product
router.put('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;`
  },
  {
    title: 'LRU Cache Implementation',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put operations.',
    difficulty: 'hard',
    category: 'data structures',
    tags: ['hash table', 'linked list', 'design'],
    solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    
    // Get value, remove from map, and re-add to put it at the end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  put(key, value) {
    // Remove if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // If at capacity, remove least recently used (first item in map)
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    // Add new item (most recently used)
    this.cache.set(key, value);
  }
}`
  },
  {
    title: 'Database Optimization for Large Datasets',
    description: 'Design a database schema and optimization strategies for a system that needs to handle millions of records with frequent read and write operations.',
    difficulty: 'hard',
    category: 'database',
    tags: ['database design', 'optimization', 'indexing', 'scaling'],
    solution: `-- This is a conceptual solution for database optimization strategies

-- 1. Schema Design
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Other user fields
  INDEX idx_username (username),
  INDEX idx_email (email)
);

CREATE TABLE transactions (
  transaction_id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
  status ENUM('pending', 'completed', 'failed') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Other transaction details
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status),
  INDEX idx_composite (user_id, created_at, status),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 2. Partitioning (for MySQL example)
ALTER TABLE transactions
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2021 VALUES LESS THAN (2022),
  PARTITION p2022 VALUES LESS THAN (2023),
  PARTITION p2023 VALUES LESS THAN (2024),
  PARTITION pCurrent VALUES LESS THAN MAXVALUE
);

-- 3. Optimization Strategies (conceptual)
/*
1. Database Indexing:
   - Create indexes on frequently queried columns
   - Use composite indexes for common query patterns
   - Consider covering indexes for read-heavy operations

2. Partitioning:
   - Horizontal partitioning (sharding) by date or user_id
   - Vertical partitioning to separate frequently accessed columns

3. Caching:
   - Implement Redis or Memcached for caching frequent queries
   - Use query result caching for read-heavy operations

4. Query Optimization:
   - Use EXPLAIN to analyze query execution plans
   - Optimize slow queries by rewriting or adding indexes
   - Consider denormalization for read-heavy workloads

5. Connection Pooling:
   - Implement connection pooling to reuse database connections

6. Read/Write Splitting:
   - Use master-slave replication
   - Direct reads to slave nodes and writes to master

7. Monitoring and Maintenance:
   - Regular index maintenance (rebuild/reorganize)
   - Monitor query performance and identify bottlenecks
   - Implement database health checks
*/`
  },
  {
    title: 'React State Management',
    description: 'Implement state management for a complex React application that includes user authentication, shopping cart functionality, and user preferences. Compare different state management approaches.',
    difficulty: 'medium',
    category: 'frontend',
    tags: ['react', 'state management', 'context api', 'redux'],
    solution: `// Using React Context API for Authentication
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and get user info
      fetchUserProfile(token)
        .then(user => setCurrentUser(user))
        .catch(err => {
          console.error('Auth error:', err);
          localStorage.removeItem('authToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const { token, user } = await loginAPI(credentials);
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Using Redux for Cart Management
// store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0
  },
  reducers: {
    addItem: (state, action) => {
      const { id, name, price, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ id, name, price, quantity });
      }
      
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );
    },
    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }
  }
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Using local state for preferences
// hooks/usePreferences.js
import { useState, useEffect } from 'react';

export const usePreferences = () => {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('userPreferences');
    if (savedPrefs) {
      const { theme, notifications, language } = JSON.parse(savedPrefs);
      setTheme(theme);
      setNotifications(notifications);
      setLanguage(language);
    }
  }, []);

  const savePreferences = () => {
    const prefs = { theme, notifications, language };
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
  };

  useEffect(() => {
    savePreferences();
  }, [theme, notifications, language]);

  return {
    theme, 
    setTheme,
    notifications, 
    setNotifications,
    language, 
    setLanguage
  };
};`
  },
  {
    title: 'Microservices Architecture Design',
    description: 'Design a microservices architecture for an e-commerce platform, including service boundaries, communication patterns, and deployment strategies.',
    difficulty: 'hard',
    category: 'system design',
    tags: ['microservices', 'architecture', 'API gateway', 'docker', 'kubernetes'],
    solution: `// This is a conceptual solution for microservices architecture

/*
E-Commerce Microservices Architecture Design

1. Service Boundaries:

User Service:
- Manages user accounts, authentication, and profiles
- API: /api/users/*
- Database: User database (MongoDB)

Product Service:
- Manages product catalog, inventory, and categories
- API: /api/products/*
- Database: Product database (PostgreSQL)

Order Service:
- Handles order processing, status updates, and history
- API: /api/orders/*
- Database: Order database (PostgreSQL)

Payment Service:
- Manages payment processing, refunds, and payment methods
- API: /api/payments/*
- Database: Payment database (MongoDB)

Cart Service:
- Handles shopping cart functionality
- API: /api/cart/*
- Database: Redis

Notification Service:
- Sends emails, SMS, and push notifications
- Event-driven, no direct API
- Database: Message queue (RabbitMQ)

2. Architecture Components:

API Gateway:
- Single entry point for all client requests
- Routes requests to appropriate microservices
- Handles authentication and rate limiting
- Technology: Node.js with Express.js

Service Discovery:
- Registers and discovers service instances
- Technology: Consul or Kubernetes service discovery

Message Broker:
- Enables asynchronous communication between services
- Technology: RabbitMQ or Apache Kafka

Circuit Breaker:
- Prevents cascading failures
- Technology: Hystrix or resilience4j

3. Communication Patterns:

Synchronous:
- REST APIs with JSON for direct service-to-service communication
- gRPC for performance-critical internal service communication

Asynchronous:
- Event-driven architecture using message queues
- Publish-subscribe pattern for broadcasting events

4. Data Management:

Database per Service:
- Each service has its own database
- Mix of SQL and NoSQL based on service requirements

Data Consistency:
- Implement Saga pattern for distributed transactions
- Use event sourcing for critical operations

5. Deployment Strategy:

Containerization:
- Docker containers for each microservice
- Docker Compose for local development

Orchestration:
- Kubernetes for container orchestration
- Helm charts for deployment management

CI/CD Pipeline:
- GitHub Actions or Jenkins for CI/CD
- Automated testing and deployment

6. Monitoring and Observability:

Distributed Tracing:
- Jaeger or Zipkin for request tracing

Monitoring:
- Prometheus for metrics collection
- Grafana for visualization

Logging:
- ELK stack (Elasticsearch, Logstash, Kibana)
- Centralized logging with correlation IDs

7. Security:

Authentication:
- OAuth 2.0 / JWT tokens
- API gateway enforces authentication

Authorization:
- Role-based access control (RBAC)
- Service-to-service authentication

8. Scaling Strategy:

Horizontal Scaling:
- Auto-scaling based on CPU/memory usage
- Kubernetes Horizontal Pod Autoscaler

Caching:
- Redis for distributed caching
- CDN for static assets

9. Resilience Patterns:

Retry with exponential backoff
Circuit breaker pattern
Bulkhead pattern
Timeout pattern
*/`
  }
];

// Function to seed questions
const seedQuestions = async () => {
  try {
    // Clean previous questions (optional)
    // await Question.deleteMany({});
    
    // Insert questions
    const result = await Question.insertMany(newQuestions);
    
    console.log(`${result.length} questions successfully added!`);
    console.log('Questions added:', result.map(q => q.title).join(', '));
    
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Error seeding questions:', error);
    mongoose.connection.close();
  }
};

// Run the seed function
seedQuestions();
