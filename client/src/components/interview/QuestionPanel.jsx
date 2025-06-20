import React from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import { FaBrain, FaRobot } from "react-icons/fa";

const QuestionPanel = ({
  viewMode,
  question,
  job,
  isGeneratingQuestion,
  onGenerateQuestion,
  feedback,
}) => {
  return (
    <QuestionPanelContainer viewMode={viewMode}>
      <QuestionHeader>
        <QuestionTitle>{question?.title || "Coding Challenge"}</QuestionTitle>
        {job?.description && (
          <GenerateButton
            onClick={onGenerateQuestion}
            disabled={isGeneratingQuestion}
          >
            {isGeneratingQuestion ? "Generating..." : "Generate New Question"}
            <FaRobot style={{ marginLeft: "8px" }} />
          </GenerateButton>
        )}
      </QuestionHeader>

      <QuestionScrollContainer>
        <QuestionDescription>
          <ReactMarkdown>
            {question?.description ||
              'No question generated yet. Click "Generate New Question" to create one based on the job description.'}
          </ReactMarkdown>
        </QuestionDescription>

        {question?.examples && question.examples.length > 0 && (
          <ExamplesSection>
            <SubheaderTitle>Examples</SubheaderTitle>
            {question.examples.map((example, index) => (
              <ExampleCard key={index}>
                <ExampleItem>
                  <strong>Input:</strong> {example.input}
                </ExampleItem>
                <ExampleItem>
                  <strong>Output:</strong> {example.output}
                </ExampleItem>
                {example.explanation && (
                  <ExampleItem>
                    <strong>Explanation:</strong> {example.explanation}
                  </ExampleItem>
                )}
              </ExampleCard>
            ))}
          </ExamplesSection>
        )}

        {question?.constraints && question.constraints.length > 0 && (
          <ConstraintsSection>
            <SubheaderTitle>Constraints</SubheaderTitle>
            <ConstraintsList>
              {question.constraints.map((constraint, index) => (
                <ConstraintItem key={index}>{constraint}</ConstraintItem>
              ))}
            </ConstraintsList>
          </ConstraintsSection>
        )}

        {feedback && (
          <FeedbackSection>
            <SubheaderTitle>
              <FaBrain style={{ marginRight: "8px" }} />
              AI Feedback
            </SubheaderTitle>
            <FeedbackContent>{feedback}</FeedbackContent>
          </FeedbackSection>
        )}
      </QuestionScrollContainer>
    </QuestionPanelContainer>
  );
};

const QuestionPanelContainer = styled.div`
  flex: ${(props) => (props.viewMode === "split" ? "1" : "0")};
  flex-grow: ${(props) => (props.viewMode === "question" ? "1" : "")};
  display: flex;
  flex-direction: column;
  background-color: white;
  border-right: ${(props) =>
    props.viewMode === "split" ? "1px solid #eee" : "none"};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 1rem;
`;

const QuestionTitle = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
    transform: none;
  }
`;


const QuestionScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 4px;
  }
`;

const QuestionDescription = styled.div`
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 1.5rem;

  & code {
    background-color: #f1f5f9;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }

  & pre {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    border: 1px solid #e0e6ed;
  }
`;

const ExamplesSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SubheaderTitle = styled.h3`
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
`;

const ExampleCard = styled.div`
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 3px solid #3498db;
`;

const ExampleItem = styled.div`
  margin-bottom: 0.5rem;
  color: #34495e;

  &:last-child {
    margin-bottom: 0;
  }

  & strong {
    font-weight: 600;
    color: #2c3e50;
  }
`;

const ConstraintsSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ConstraintsList = styled.ul`
  padding-left: 1.5rem;
  margin-top: 0;
`;

const ConstraintItem = styled.li`
  color: #34495e;
  margin-bottom: 0.5rem;
`;

const FeedbackSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FeedbackContent = styled.div`
  color: #34495e;
  line-height: 1.6;
`;

export default QuestionPanel;
