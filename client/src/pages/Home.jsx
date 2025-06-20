import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>Ace Your Next Tech Interview with AI-Powered Practice</HeroTitle>
          <HeroSubtitle>
            Get real-time feedback and improve your coding skills with our mock interview platform
          </HeroSubtitle>
          <CTAButton to="/jobs">Find Jobs &amp; Practice</CTAButton>
        </HeroContent>
        <HeroImage src="https://www.ttnews.com/sites/default/files/2023-09/iTECH-Dysart-1200.jpg" alt="Interview Illustration" />
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>How It Works</SectionTitle>
        <FeaturesContainer>
          <FeatureCard>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureTitle>Browse Jobs</FeatureTitle>
            <FeatureDescription>
              Explore our curated list of tech jobs from leading companies
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💻</FeatureIcon>
            <FeatureTitle>Take Mock Interviews</FeatureTitle>
            <FeatureDescription>
              Practice with job-specific coding challenges in our LeetCode-style editor
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🤖</FeatureIcon>
            <FeatureTitle>Get AI Feedback</FeatureTitle>
            <FeatureDescription>
              Receive detailed code reviews and optimization suggestions from our AI
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📈</FeatureIcon>
            <FeatureTitle>Track Progress</FeatureTitle>
            <FeatureDescription>
              Monitor your improvement over time with detailed performance analytics
            </FeatureDescription>
          </FeatureCard>
        </FeaturesContainer>
      </FeaturesSection>

      <CtaSection>
        <CtaContent>
          <CtaTitle>Ready to level up your interview skills?</CtaTitle>
          <CtaDescription>
            Join thousands of developers who have improved their coding interview performance
          </CtaDescription>
          <CtaButton to="/register">Get Started Now</CtaButton>
        </CtaContent>
      </CtaSection>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  max-width: 100%;
  overflow-x: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
`;

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rem 3rem;
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -10%;
    right: -5%;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(52, 152, 219, 0.2) 0%, rgba(0, 0, 0, 0) 70%);
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -15%;
    left: -10%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(231, 76, 60, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    padding: 4rem 1.5rem;
  }
`;

const HeroContent = styled.div`
  flex: 1;
  max-width: 650px;
  position: relative;
  z-index: 1;
  animation: fadeInUp 1s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.2rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(to right, #ffffff, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.4rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.7;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(to right, #e74c3c, #c0392b);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(231, 76, 60, 0.5);
    
    &:before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const HeroImage = styled.img`
  flex: 1;
  max-width: 550px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: perspective(1000px) rotateY(-5deg);
  transition: all 0.5s ease;
  position: relative;
  z-index: 1;
  
  &:hover {
    transform: perspective(1000px) rotateY(0deg);
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    transform: none;
    
    &:hover {
      transform: none;
    }
  }
`;

const FeaturesSection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.4rem;
  margin-bottom: 4rem;
  color: #2c3e50;
  position: relative;
  font-weight: 800;
  
  &:after {
    content: '';
    position: absolute;
    width: 100px;
    height: 4px;
    background: linear-gradient(to right, #3498db, #2ecc71);
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 2px;
  }
`;

const FeaturesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  text-align: center;
  border: 1px solid rgba(230, 230, 230, 0.7);
  position: relative;
  z-index: 1;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(to right, #3498db, #2ecc71);
    transform: scaleX(0);
    transform-origin: 0 0;
    transition: transform 0.4s ease;
    z-index: -1;
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    
    &:before {
      transform: scaleX(1);
    }
  }
`;

const FeatureIcon = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
`;

const FeatureTitle = styled.h3`
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 700;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 40px;
    height: 2px;
    background: linear-gradient(to right, #3498db, rgba(52, 152, 219, 0.2));
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const FeatureDescription = styled.p`
  color: #7f8c8d;
  line-height: 1.6;
  font-size: 1rem;
`;

const CtaSection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%);
  }
`;

const CtaContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  animation: fadeIn 1s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CtaTitle = styled.h2`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CtaDescription = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  line-height: 1.6;
`;

const CtaButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(to right, #e74c3c, #c0392b);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: all 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
    
    &:before {
      left: 100%;
    }
  }
`;

export default Home;
