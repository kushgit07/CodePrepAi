import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFound = () => {
  return (
    <NotFoundContainer>
      <NotFoundContent>
        <ErrorCode>404</ErrorCode>
        <ErrorTitle>Page Not Found</ErrorTitle>
        <ErrorMessage>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </ErrorMessage>
        
        <BackToHomeButton to="/">Back to Home</BackToHomeButton>
        
        <SuggestionsContainer>
          <SuggestionTitle>You might want to:</SuggestionTitle>
          <SuggestionList>
            <SuggestionItem>
              <SuggestionLink to="/jobs">Browse available jobs</SuggestionLink>
            </SuggestionItem>
            <SuggestionItem>
              <SuggestionLink to="/dashboard">Check your dashboard</SuggestionLink>
            </SuggestionItem>
            <SuggestionItem>
              <SuggestionLink to="/profile">Visit your profile</SuggestionLink>
            </SuggestionItem>
          </SuggestionList>
        </SuggestionsContainer>
      </NotFoundContent>
    </NotFoundContainer>
  );
};

const NotFoundContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
`;

const NotFoundContent = styled.div`
  text-align: center;
  max-width: 600px;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: 700;
  color: #3498db;
  margin: 0;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  color: #2c3e50;
  margin: 0.5rem 0 1.5rem;
`;

const ErrorMessage = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const BackToHomeButton = styled(Link)`
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const SuggestionsContainer = styled.div`
  margin-top: 3rem;
  text-align: left;
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
`;

const SuggestionTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const SuggestionList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const SuggestionItem = styled.li`
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
  
  &:before {
    content: "•";
    color: #3498db;
    position: absolute;
    left: 0;
    font-weight: bold;
  }
`;

const SuggestionLink = styled(Link)`
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default NotFound;
