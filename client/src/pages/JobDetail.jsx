import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { jobsAPI, interviewsAPI } from "../utils/api";
import AuthContext from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedComplexity, setSelectedComplexity] = useState("medium");

  // Check if we should show interview modal from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("mockInterview") === "true") {
      setShowInterviewModal(true);
    }
  }, [location]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        // First try to get from localStorage
        const cachedJobs = localStorage.getItem("mockJobs");
        if (cachedJobs) {
          const jobs = JSON.parse(cachedJobs);
          const job = jobs.find((job) => job._id === id);
          if (job) {
            setJob(job);
            setLoading(false);
            return;
          }
        }

        // If not found in localStorage, try API
        const jobData = await jobsAPI.getMockJobById(id);
        setJob(jobData);
        setLoading(false);
      } catch (err) {
        console.error("Job fetch error:", err);
        setError("Failed to load job details. Please try again later.");
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const ComplexityOptions = () => (
    <ComplexityContainer>
      <ComplexityLabel>Select difficulty:</ComplexityLabel>
      <ComplexitySelect
        value={selectedComplexity}
        onChange={(e) => setSelectedComplexity(e.target.value)}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </ComplexitySelect>
    </ComplexityContainer>
  );

  const handleStartMockInterview = async () => {
    try {
      setLoading(true);

      // Start a new interview with this job
      const response = await interviewsAPI.startInterview(
        id,
        selectedComplexity
      );

      if (response.success) {
        // Redirect to the interview page with the new interview ID
        navigate(`/mock-interview/${response.interview._id}`);
      } else {
        console.error("Failed to start interview:", response.message);
        setError(
          response.message || "Failed to start interview. Please try again."
        );
      }
    } catch (err) {
      console.error("Interview start error:", err);
      setError(
        err.response?.data?.message || "Server error starting the interview"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="medium" />
        <LoadingText>Loading job details...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!job) {
    return <ErrorMessage>Job not found</ErrorMessage>;
  }

  return (
    <JobDetailContainer>
      <JobHeader>
        <CompanyInfo>
          <CompanyLogo>{job.company.charAt(0)}</CompanyLogo>
          <div>
            <JobTitle>{job.title}</JobTitle>
            <CompanyName>{job.company}</CompanyName>
            <JobLocation>📍 {job.location}</JobLocation>
          </div>
        </CompanyInfo>

        <InterviewButton onClick={handleStartMockInterview}>
          Take Mock Interview
        </InterviewButton>
      </JobHeader>

      <JobInfoGrid>
        <InfoCard>
          <InfoTitle>Job Type</InfoTitle>
          <InfoValue>{job.jobType}</InfoValue>
        </InfoCard>

        <InfoCard>
          <InfoTitle>Salary</InfoTitle>
          <InfoValue>{job.salary || "Not specified"}</InfoValue>
        </InfoCard>

        <InfoCard>
          <InfoTitle>Posted Date</InfoTitle>
          <InfoValue>
            {new Date(job.postedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </InfoValue>
        </InfoCard>

        <InfoCard>
          <InfoTitle>Application URL</InfoTitle>
          <InfoValue>
            {job.applicationUrl ? (
              <ApplicationLink
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Apply Now
              </ApplicationLink>
            ) : (
              "Not available"
            )}
          </InfoValue>
        </InfoCard>
      </JobInfoGrid>

      <JobContentSection>
        <SectionTitle>Job Description</SectionTitle>
        <Description>{job.description}</Description>
      </JobContentSection>

      <JobContentSection>
        <SectionTitle>Requirements</SectionTitle>
        <RequirementsList>
          {job.requirements && job.requirements.length > 0 ? (
            job.requirements.map((requirement, index) => (
              <RequirementItem key={index}>{requirement}</RequirementItem>
            ))
          ) : (
            <p>No specific requirements listed</p>
          )}
        </RequirementsList>
      </JobContentSection>

      <JobContentSection>
        <SectionTitle>Skills</SectionTitle>
        <SkillsContainer>
          {job.skills && job.skills.length > 0 ? (
            job.skills.map((skill, index) => (
              <SkillTag key={index}>{skill}</SkillTag>
            ))
          ) : (
            <p>No specific skills listed</p>
          )}
        </SkillsContainer>
      </JobContentSection>

      <CTASection>
        <h3>Ready to practice for this job interview?</h3>
        <p>Take a mock interview to get AI feedback on your coding skills</p>
        <ActionContainer>
          {isAuthenticated && (
            <>
              <ComplexityOptions />
              <PrimaryButton onClick={handleStartMockInterview}>
                Start Mock Interview
              </PrimaryButton>
            </>
          )}
        </ActionContainer>
      </CTASection>

      {showInterviewModal && (
        <ModalOverlay onClick={() => setShowInterviewModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Start Mock Interview</h3>
              <CloseButton onClick={() => setShowInterviewModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <p>You're about to start a mock interview for:</p>
              <h4>
                {job.title} at {job.company}
              </h4>

              <ModalInfo>
                <p>
                  • You'll be presented with a coding challenge related to this
                  job.
                </p>
                <p>
                  • You can write and submit your solution in the code editor.
                </p>
                <p>
                  • Our AI will review your code and provide detailed feedback.
                </p>
                <p>• You can choose from various programming languages.</p>
              </ModalInfo>

              <p>Are you ready to begin?</p>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowInterviewModal(false)}>
                Cancel
              </CancelButton>
              <StartButton onClick={handleStartMockInterview}>
                Start Interview
              </StartButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </JobDetailContainer>
  );
};

const JobDetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const CompanyLogo = styled.div`
  width: 70px;
  height: 70px;
  background-color: #3498db;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const JobTitle = styled.h1`
  font-size: 1.8rem;
  color: #e1e7ed;
  margin-bottom: 0.5rem;
  margin-right: 14rem;
`;

const CompanyName = styled.h2`
  font-size: 1.3rem;
  color: #3498db;
  margin-bottom: 0.5rem;
  margin-right: 17rem;
`;

const JobLocation = styled.div`
  color: #7f8c8d;
  font-size: 1rem;
  margin-right: 18rem;
`;

const InterviewButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const JobInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
`;

const InfoCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.2rem;
`;

const InfoTitle = styled.h3`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
`;

const ApplicationLink = styled.a`
  color: #3498db;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const JobContentSection = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  color: #ebebeb;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
`;

const Description = styled.div`
  color: #ff7a7a;
  line-height: 1.6;
  white-space: pre-line;
`;

const RequirementsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const RequirementItem = styled.li`
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.5;
  color: #ff7a7a;

  &:before {
    content: "--> ";
    color: #3498db;
    // position: absolute;
    left: 0;
    font-weight: bold;
  }
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
`;

const SkillTag = styled.span`
  background-color: #e8f4fd;
  color: #3498db;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
`;

const CTASection = styled.div`
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  margin-top: 2rem;

  h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  background-color: #e74c3c;
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c0392b;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 550px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #ecf0f1;

  h3 {
    margin: 0;
    color: #2c3e50;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #7f8c8d;
  cursor: pointer;
  padding: 0;
  line-height: 1;
`;

const ModalBody = styled.div`
  padding: 1.5rem;

  h4 {
    margin: 0.7rem 0;
    color: #3498db;
  }
`;

const ModalInfo = styled.div`
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 1.5rem 0;

  p {
    margin: 0.5rem 0;
    color: #34495e;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1.2rem 1.5rem;
  border-top: 1px solid #ecf0f1;
  gap: 1rem;
`;

const CancelButton = styled.button`
  background-color: #ecf0f1;
  color: #7f8c8d;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const StartButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
`;

const LoadingText = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  background-color: #ffeaea;
  color: #e74c3c;
  padding: 1.5rem;
  border-radius: 4px;
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
`;

const ComplexityContainer = styled.div`
  margin-bottom: 16px;
`;

const ComplexityLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #00000094;
`;

const ComplexitySelect = styled.select`
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: transparent;
  color: black;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 0.9rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export default JobDetail;
