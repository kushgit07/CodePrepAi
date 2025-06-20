import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AuthContext from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const { name, email, password, confirmPassword } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create proper formData object matching what the AuthContext expects
      const userData = {
        name,
        email,
        password
      };
      
      const success = await register(userData);
      
      if (!success) {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <h1>Create Your Account</h1>
          <p>Join JobsForce to prepare for coding interviews</p>
        </RegisterHeader>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <RegisterForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
            <FieldHelp>Password must be at least 6 characters long</FieldHelp>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </FormGroup>
          
          <RegisterButton type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </RegisterButton>
        </RegisterForm>
        
        <LoginPrompt>
          Already have an account? <LoginLink to="/login">Log In</LoginLink>
        </LoginPrompt>
        
        <TermsText>
          By creating an account, you agree to our{' '}
          <TermsLink to="/terms">Terms of Service</TermsLink> and{' '}
          <TermsLink to="/privacy">Privacy Policy</TermsLink>.
        </TermsText>
      </RegisterCard>
      
      <BenefitsSection>
        <BenefitsHeader>
          <h2>Why Join JobsForce?</h2>
          <p>Prepare for coding interviews with confidence</p>
        </BenefitsHeader>
        
        <BenefitsList>
          <BenefitItem>
            <BenefitIcon>💼</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Access to Job Listings</BenefitTitle>
              <BenefitDescription>
                Browse through hundreds of tech job listings from top companies.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>
          
          <BenefitItem>
            <BenefitIcon>💻</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Mock Coding Interviews</BenefitTitle>
              <BenefitDescription>
                Practice with realistic coding challenges tailored to specific job roles.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>
          
          <BenefitItem>
            <BenefitIcon>🤖</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>AI-Powered Feedback</BenefitTitle>
              <BenefitDescription>
                Get detailed code reviews and suggestions from our AI system.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>
          
          <BenefitItem>
            <BenefitIcon>📊</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Performance Tracking</BenefitTitle>
              <BenefitDescription>
                Monitor your progress and identify areas for improvement.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>
        </BenefitsList>
      </BenefitsSection>
    </RegisterContainer>
  );
};

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  gap: 3rem;
  
  @media (min-width: 992px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const RegisterCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  
  @media (min-width: 992px) {
    margin: 0;
  }
`;

const RegisterHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const RegisterForm = styled.form`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  color: black;
  background: transparent;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FieldHelp = styled.p`
  font-size: 0.85rem;
  color: #95a5a6;
  margin-top: 0.3rem;
`;

const RegisterButton = styled.button`
  width: 100%;
  padding: 0.8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2980b9;
  }
  
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const LoginPrompt = styled.p`
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 1rem;
`;

const LoginLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TermsText = styled.p`
  text-align: center;
  font-size: 0.85rem;
  color: #95a5a6;
  line-height: 1.5;
`;

const TermsLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BenefitsSection = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  
  @media (max-width: 991px) {
    margin-top: 2rem;
  }
`;

const BenefitsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.8rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #7f8c8d;
    font-size: 1rem;
  }
`;

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BenefitItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;

const BenefitIcon = styled.div`
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
`;

const BenefitContent = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.h3`
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const BenefitDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
`;

export default Register;
