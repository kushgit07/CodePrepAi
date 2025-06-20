import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterTitle>CodePrep AI</FooterTitle>
          <FooterText>
            AI-powered mock interview platform to help you ace your next job
            interview.
          </FooterText>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Quick Links</FooterTitle>
          <FooterLinks>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/jobs">Find Jobs</FooterLink>
            <FooterLink to="/dashboard">Dashboard</FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>Contact Us</FooterTitle>
          <FooterText>support@CodePrep AI.com</FooterText>
          <FooterText>+1 (555) 123-4567</FooterText>
        </FooterSection>
      </FooterContent>

      <FooterBottom>
        <CopyrightText>
          &copy; {year} CodePrep AI. All rights reserved.
        </CopyrightText>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 2rem 0 0 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 250px;
  margin-bottom: 2rem;
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.2rem;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 40px;
    height: 2px;
    background-color: #3498db;
  }
`;

const FooterText = styled.p`
  color: #bdc3c7;
  line-height: 1.6;
  margin-bottom: 0.8rem;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const FooterLink = styled(Link)`
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #3498db;
  }
`;

const FooterBottom = styled.div`
  background-color: #1a252f;
  padding: 1.5rem 0;
  text-align: center;
  margin-top: 1rem;
`;

const CopyrightText = styled.p`
  color: #bdc3c7;
  font-size: 0.9rem;
`;

export default Footer;
