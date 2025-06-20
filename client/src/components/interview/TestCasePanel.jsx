import React, { useState } from "react";
import styled from "styled-components";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronUp,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";

const TestCasePanel = ({
  testCases,
  testResults,
  isTestingAllCases,
  onRunAllTestCases,
  onClose,
}) => {
  const [expanded, setExpanded] = useState(true);

  const safeStringify = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return "[Object]";
      }
    }
    return String(value);
  };

  return (
    <TestCasesContainer>
      <TestCaseHeader>
        <HeaderLeftSection>
          <SubheaderTitle>Test Cases</SubheaderTitle>
          <CollapseToggle onClick={() => setExpanded(!expanded)}>
            {expanded ? <FaChevronDown /> : <FaChevronUp />}
          </CollapseToggle>
        </HeaderLeftSection>
        <CloseButtonWrapper onClick={onClose}>
          <FaTimes />
        </CloseButtonWrapper>
      </TestCaseHeader>

      {expanded && (
        <TestCasesContent>
          <ButtonGroup>
            <RunTestCasesButton
              onClick={onRunAllTestCases}
              disabled={isTestingAllCases || !testCases.length}
            >
              {isTestingAllCases ? "Running Tests..." : "Run Test Cases"}
            </RunTestCasesButton>
          </ButtonGroup>

          {testCases.map((testCase, index) => (
            <TestCaseItem key={index}>
              <TestCaseItemHeader>
                <TestCaseTitle>Test Case {index + 1}</TestCaseTitle>
                <TestCaseStatus>
                  {testResults[index]?.passed ? (
                    <PassedIcon>
                      <FaCheckCircle />
                    </PassedIcon>
                  ) : testResults[index] ? (
                    <FailedIcon>
                      <FaExclamationCircle />
                    </FailedIcon>
                  ) : null}
                </TestCaseStatus>
              </TestCaseItemHeader>
              <TestCaseDetails>
                <InputOutput>
                  <Label>Input:</Label>
                  <Value>{safeStringify(testCase.input)}</Value>
                </InputOutput>
                <InputOutput>
                  <Label>Expected Output:</Label>
                  <Value>{safeStringify(testCase.expectedOutput)}</Value>
                </InputOutput>
                {testResults[index] && (
                  <InputOutput>
                    <Label>Actual Output:</Label>
                    <Value>
                      {testResults[index].error ||
                        safeStringify(testResults[index].actualOutput)}
                    </Value>
                  </InputOutput>
                )}
              </TestCaseDetails>
            </TestCaseItem>
          ))}
        </TestCasesContent>
      )}
    </TestCasesContainer>
  );
};


const TestCasesContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 1rem;
  overflow: hidden;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const TestCaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  padding: 1rem 1.5rem;
`;

const HeaderLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SubheaderTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const CollapseToggle = styled.span`
  display: flex;
  align-items: center;
  color: white;
  opacity: 0.7;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const CloseButtonWrapper = styled.span`
  cursor: pointer;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

const TestCasesContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(80vh - 60px);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RunTestCasesButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #27ae60;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const TestCaseList = styled.div`
  margin-bottom: 1rem;
`;

const TestCaseItem = styled.div`
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 3px solid #3498db;
`;

const TestCaseItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const TestCaseTitle = styled.h4`
  margin: 0;
  font-weight: 600;
`;

const TestCaseStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PassedIcon = styled.span`
  color: #27ae60;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
`;

const FailedIcon = styled.span`
  color: #e74c3c;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
`;

const TestCaseDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const InputOutput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 700;
  color: #2c3e50;
`;

const Value = styled.span`
  color: #34495e;
`;

export default TestCasePanel;
