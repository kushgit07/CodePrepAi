import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBrain, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

const FeedbackPanel = ({ feedback, onClose }) => {
  const [minimized, setMinimized] = useState(false);

  if (!feedback) return null;

  const isLoading = feedback.isLoading;

  return (
    <FeedbackContainer minimized={minimized}>
      <FeedbackHeader minimized={minimized}>
        <HeaderContent minimized={minimized}>
          <HeaderTitle>
            <FaBrain style={{ marginRight: '8px' }} />
            {!minimized && 'AI Code Review'}
            {!minimized && !isLoading && (
              <ScoreBadge>{feedback.overallScore}/100</ScoreBadge>
            )}
          </HeaderTitle>
          <HeaderActions>
            <MinimizeButton onClick={() => setMinimized(!minimized)}>
              {minimized ? <FaExpand /> : <FaCompress />}
            </MinimizeButton>
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
          </HeaderActions>
        </HeaderContent>
      </FeedbackHeader>

      {!minimized && (
        <FeedbackContent>
          {isLoading ? (
            <LoadingContainer>
              <Spinner />
              <LoadingText>Analyzing your code...</LoadingText>
            </LoadingContainer>
          ) : (
            <FeedbackSections>
              <FeedbackSection>
                <SectionTitle>Correctness</SectionTitle>
                <SectionContent>{feedback.correctness}</SectionContent>
              </FeedbackSection>

              <FeedbackSection>
                <SectionTitle>Time Complexity</SectionTitle>
                <SectionContent>{feedback.timeComplexity}</SectionContent>
              </FeedbackSection>

              <FeedbackSection>
                <SectionTitle>Space Complexity</SectionTitle>
                <SectionContent>{feedback.spaceComplexity}</SectionContent>
              </FeedbackSection>

              <FeedbackSection>
                <SectionTitle>Code Quality</SectionTitle>
                <SectionContent>{feedback.codeQuality}</SectionContent>
              </FeedbackSection>

              <FeedbackSection>
                <SectionTitle>Edge Cases</SectionTitle>
                <SectionContent>{feedback.edgeCases}</SectionContent>
              </FeedbackSection>

              <FeedbackSection>
                <SectionTitle>Suggested Improvements</SectionTitle>
                <SectionContent>{feedback.improvements}</SectionContent>
              </FeedbackSection>
            </FeedbackSections>
          )}
        </FeedbackContent>
      )}
    </FeedbackContainer>
  );
};

const FeedbackContainer = styled.div`
  position: fixed;
  right: 20px;
  top: 80px;
  width: ${props => props.minimized ? '60px' : '400px'};
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: width 0.3s ease;
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.minimized ? '12px 8px' : '16px'};
  background: #2c3e50;
  color: white;
  border-radius: 8px 8px 0 0;
  transition: padding 0.3s ease;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  ${props => props.minimized && `
    justify-content: center;
    gap: 8px;
  `}
`;

const HeaderTitle = styled.h3`
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const MinimizeButton = styled(CloseButton)`
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ScoreBadge = styled.span`
  background: ${props => props.children >= 80 ? '#27ae60' : props.children >= 60 ? '#f39c12' : '#e74c3c'};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-left: 12px;
`;

const FeedbackContent = styled.div`
  padding: 16px;
  max-height: 70vh;
  overflow-y: auto;
`;

const FeedbackSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeedbackSection = styled.div`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1rem;
`;

const SectionContent = styled.p`
  margin: 0;
  color: #34495e;
  line-height: 1.5;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;

const Spinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #666;
  margin: 0;
`;

export default FeedbackPanel;
