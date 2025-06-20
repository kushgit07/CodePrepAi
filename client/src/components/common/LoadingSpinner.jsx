import React from "react";
import styled, { keyframes } from "styled-components";

const LoadingSpinner = ({ size = "medium", color = "#3498db" }) => {
  // Map size prop to actual pixel values
  const sizeMap = {
    small: "24px",
    medium: "40px",
    large: "60px",
  };

  const actualSize = sizeMap[size] || size; // Use the mapped size or the raw size value

  return (
    <SpinnerContainer>
      <Spinner size={actualSize} color={color} />
    </SpinnerContainer>
  );
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid ${(props) => props.color};
  border-radius: 50%;
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  animation: ${spin} 1s linear infinite;
`;

export default LoadingSpinner;
