import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { interviewsAPI } from "../utils/api";
import AuthContext from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("interviews");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/dashboard" } });
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch user's interviews using the API service
        const interviewsData = await interviewsAPI.getUserInterviews();
        setInterviews(Array.isArray(interviewsData) ? interviewsData : []);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="medium" />
        <LoadingText>Loading dashboard...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeSection>
          <h1>Welcome back, {user?.name || "User"}</h1>
          <p>Track your interview practice and job applications</p>
        </WelcomeSection>

        <StatsContainer>
          <StatCard>
            <StatNumber>{interviews.length}</StatNumber>
            <StatLabel>Mock Interviews</StatLabel>
          </StatCard>

          <StatCard>
            <StatNumber>
              {
                interviews.filter(
                  (interview) => interview.status === "reviewed"
                ).length
              }
            </StatNumber>
            <StatLabel>Reviewed</StatLabel>
          </StatCard>
        </StatsContainer>
      </DashboardHeader>

      <TabsContainer>
        <TabButton
          active={activeTab === "interviews"}
          onClick={() => setActiveTab("interviews")}
        >
          Mock Interviews
        </TabButton>
      </TabsContainer>

      <ContentSection>
        {activeTab === "interviews" && (
          <TabContent>
            <SectionHeader>
              <h2>Your Mock Interviews</h2>
              <Link to="/jobs">
                <NewButton>Take New Interview</NewButton>
              </Link>
            </SectionHeader>

            {interviews.length > 0 ? (
              <InterviewsList>
                {interviews.map((interview) => (
                  <InterviewCard
                    key={interview._id}
                    to={`/interview/${interview.job?._id || "practice"}/${
                      interview._id
                    }`}
                  >
                    <InterviewCardHeader status={interview.status}>
                      <InterviewCardCompany>
                        {interview.job?.company || "Job Practice"}
                      </InterviewCardCompany>
                      <InterviewCardPosition>
                        {interview.job?.title || "Mock Interview"}
                      </InterviewCardPosition>
                    </InterviewCardHeader>

                    <InterviewCardBody>
                      <InterviewCardDate>
                        Taken on{" "}
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </InterviewCardDate>
                      <InterviewCardDifficulty
                        difficulty={interview.difficulty}
                      >
                        {interview.difficulty}
                      </InterviewCardDifficulty>
                    </InterviewCardBody>

                    <InterviewCardFooter>
                      <ViewButton
                        to={`/interview/${interview.job?._id || "practice"}/${
                          interview._id
                        }`}
                      >
                        {interview.status === "reviewed"
                          ? "View Feedback"
                          : "Continue"}
                      </ViewButton>
                    </InterviewCardFooter>
                  </InterviewCard>
                ))}
              </InterviewsList>
            ) : (
              <EmptyState>
                <EmptyStateTitle>No mock interviews yet</EmptyStateTitle>
                <EmptyStateText>
                  Take your first mock interview to prepare for job interviews
                </EmptyStateText>
              </EmptyState>
            )}
          </TabContent>
        )}
      </ContentSection>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #f9fafb;
  min-height: calc(100vh - 64px);
`;

const DashboardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2.5rem;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 25px rgba(52, 152, 219, 0.15);
  color: white;

  @media (min-width: 992px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const WelcomeSection = styled.div`
  h1 {
    font-size: 2.4rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, #ffffff, #e0e0e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  width: 100%;

  @media (min-width: 992px) {
    width: auto;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 2rem;
  gap: 0.5rem;
`;

const TabButton = styled.button`
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, #3498db 0%, #2980b9 100%)"
      : "transparent"};
  color: ${(props) => (props.active ? "white" : "#555")};
  border: none;
  border-bottom: 3px solid
    ${(props) => (props.active ? "#3498db" : "transparent")};
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, #3498db 0%, #2980b9 100%)"
        : "#f5f5f5"};
    color: ${(props) => (props.active ? "white" : "#3498db")};
  }
`;

const TabContent = styled.div`
  margin-bottom: 2rem;
`;

const ContentSection = styled.div`
  margin-bottom: 2rem;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
  }
`;

const InterviewsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InterviewCard = styled(Link)`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  height: 100%;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
    border-color: #3498db;
  }
`;

const InterviewCardHeader = styled.div`
  background: ${(props) => {
    switch (props.status) {
      case "submitted":
        return "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)";
      case "reviewed":
        return "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)";
      default:
        return "linear-gradient(135deg, #3498db 0%, #2980b9 100%)";
    }
  }};
  color: white;
  padding: 1rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InterviewCardBody = styled.div`
  padding: 1.5rem;
  flex: 1;
`;

const InterviewCardCompany = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const InterviewCardPosition = styled.div`
  font-size: 1rem;
  color: #b8cbdd;
  margin-bottom: 1.2rem;
`;

const InterviewCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e0e0e0;
`;

const InterviewCardDate = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const InterviewCardDifficulty = styled.div`
  background: ${(props) => {
    switch (props.difficulty) {
      case "easy":
        return "#e3fcef";
      case "medium":
        return "#fff8e6";
      case "hard":
        return "#fee7e7";
      default:
        return "#e3fcef";
    }
  }};
  color: ${(props) => {
    switch (props.difficulty) {
      case "easy":
        return "#2ecc71";
      case "medium":
        return "#f39c12";
      case "hard":
        return "#e74c3c";
      default:
        return "#2ecc71";
    }
  }};
  border-radius: 20px;
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 1px dashed #e0e0e0;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const EmptyStateText = styled.p`
  color: #7f8c8d;
  margin-bottom: 2rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const EmptyStateButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    color: #2c3e50;
    margin: 0;
  }
`;

const NewButton = styled.button`
  background-color: #3498db;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2980b9;
  }
`;

const ViewButton = styled(Link)`
  text-align: center;
  padding: 0.6rem 1rem;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #dfe6e9;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 1.2rem;
  margin-top: 1rem;
`;

export default Dashboard;
