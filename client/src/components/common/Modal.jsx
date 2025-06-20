import React from "react";
import styled from "styled-components";

const Modal = ({ isOpen, onClose, title, submissionState, feedback }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={() => submissionState !== "submitting" && onClose()}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>{title}</h3>
          {submissionState !== "submitting" && (
            <CloseButton onClick={onClose}>×</CloseButton>
          )}
        </ModalHeader>

        <ModalBody>
          {submissionState === "submitting" && (
            <SubmissionStatus>
              <Spinner />
              <p>Submitting your solution...</p>
              <p>Please wait while we process your code.</p>
            </SubmissionStatus>
          )}

          {submissionState === "success" && (
            <SubmissionStatus success>
              <SuccessIcon>✓</SuccessIcon>
              <p>Your solution has been submitted successfully!</p>
              {feedback ? (
                <p>AI feedback is now available.</p>
              ) : (
                <p>
                  AI is currently reviewing your code. Please wait a moment for
                  feedback.
                </p>
              )}
            </SubmissionStatus>
          )}

          {submissionState === "error" && (
            <SubmissionStatus error>
              <ErrorIcon>!</ErrorIcon>
              <p>There was an error submitting your solution.</p>
              <p>
                Please try again or contact support if the problem persists.
              </p>
            </SubmissionStatus>
          )}
        </ModalBody>

        <ModalFooter>
          {submissionState !== "submitting" && (
            <CloseModalButton onClick={onClose}>Close</CloseModalButton>
          )}
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.2rem;
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  padding: 1.2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e6ed;
  text-align: right;
`;

const CloseModalButton = styled.button`
  padding: 0.6rem 1.2rem;
  background-color: #e0e6ed;
  color: #2c3e50;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #d0d7de;
  }
`;

const SubmissionStatus = styled.div`
  text-align: center;
  padding: 1rem;
  ${(props) =>
    props.success &&
    `
    color: #27ae60;
  `}
  ${(props) =>
    props.error &&
    `
    color: #e74c3c;
  `}
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SuccessIcon = styled.div`
  width: 50px;
  height: 50px;
  background-color: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 1rem;
`;

const ErrorIcon = styled.div`
  width: 50px;
  height: 50px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 1rem;
`;

export default Modal;
