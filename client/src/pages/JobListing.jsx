import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { jobsAPI } from "../utils/api";

const JobListing = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    jobType: "",
    location: "",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);

      try {
        
        const jobData = await jobsAPI.getMockJobs();

        // Cache the jobs for viewing job details later
        localStorage.setItem("mockJobs", JSON.stringify(jobData));

        // If it's the first page, replace jobs, otherwise append
        setJobs((prevJobs) =>
          page === 1 ? jobData : [...prevJobs, ...jobData]
        );

        // Simulate pagination
        setHasMore(page * 6 < jobData.length);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
        setJobs(getHardcodedMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [page]);

  // Hardcoded mock data as a fallback
  const getHardcodedMockData = () => {
    return [
      {
        _id: "mock1",
        title: "Senior Frontend Developer",
        company: "TechCorp",
        location: "Remote",
        description:
          "We're looking for an experienced frontend developer proficient in React to join our growing team.",
        salary: "$120,000 - $150,000",
        jobType: "Full-time",
        skills: ["React", "JavaScript", "CSS", "Redux"],
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "mock2",
        title: "Backend Engineer",
        company: "DataSystems Inc",
        location: "New York, NY",
        description:
          "Join our backend team to build scalable APIs and services.",
        salary: "$110,000 - $140,000",
        jobType: "Full-time",
        skills: ["Node.js", "Express", "MongoDB", "Docker"],
        postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        _id: "mock3",
        title: "Full Stack Developer",
        company: "WebSolutions",
        location: "Chicago, IL",
        description:
          "Building responsive web applications using modern technologies.",
        salary: "$100,000 - $130,000",
        jobType: "Full-time",
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1); 
  };

  const loadMoreJobs = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Apply client-side filtering and searching
  const filteredJobs = jobs.filter((job) => {
    // Filter by job type if selected
    const matchesJobType =
      filters.jobType === "" ||
      job.jobType?.toLowerCase().includes(filters.jobType.toLowerCase());

    // Filter by location if entered
    const matchesLocation =
      filters.location === "" ||
      job.location?.toLowerCase().includes(filters.location.toLowerCase());

    // Filter by search term across multiple fields
    const matchesSearchTerm =
      searchTerm === "" ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesJobType && matchesLocation && matchesSearchTerm;
  });

  // Get the paginated jobs
  const paginatedJobs = filteredJobs.slice(0, page * 6);

  return (
    <JobListingContainer>
      <JobListingHeader>
        <h1>Available Jobs</h1>
        <p>
          Find your next career opportunity and practice with mock interviews
        </p>
      </JobListingHeader>

      <FilterSection>
        <SearchBar
          type="text"
          placeholder="Search for jobs, companies, or keywords..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <FilterControls>
          <FilterSelect
            name="jobType"
            value={filters.jobType}
            onChange={handleFilterChange}
          >
            <option value="">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </FilterSelect>

          <FilterInput
            type="text"
            name="location"
            placeholder="Filter by location"
            value={filters.location}
            onChange={handleFilterChange}
          />
        </FilterControls>
      </FilterSection>

      {error && <ErrorNotice>{error}</ErrorNotice>}

      <ResultsStats>
        Showing {paginatedJobs.length} of {filteredJobs.length} jobs
      </ResultsStats>

      <JobsGrid>
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading jobs...</LoadingText>
          </LoadingContainer>
        ) : filteredJobs.length > 0 ? (
          <>
            {paginatedJobs.map((job) => (
              <JobCard key={job._id}>
                <JobCompany>{job.company}</JobCompany>
                <JobTitle>{job.title}</JobTitle>
                <JobLocation>📍 {job.location}</JobLocation>
                <JobType>{job.jobType}</JobType>
                <JobSalary>{job.salary}</JobSalary>

                <JobDescription>
                  {job.description?.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </JobDescription>

                <JobSkills>
                  {job.skills &&
                    job.skills
                      .slice(0, 3)
                      .map((skill, index) => (
                        <SkillTag key={index}>{skill}</SkillTag>
                      ))}
                </JobSkills>

                <JobPostedDate>
                  Posted: {new Date(job.postedDate).toLocaleDateString()}
                </JobPostedDate>

                <JobActions>
                  <ActionButton as={Link} to={`/jobs/${job._id}`}>
                    View Details
                  </ActionButton>
                  <ActionButton as={Link} to={`/jobs/${job._id}`} secondary>
                    Practice Interview
                  </ActionButton>
                </JobActions>
              </JobCard>
            ))}

            {hasMore && (
              <LoadMoreContainer>
                <LoadMoreButton onClick={loadMoreJobs} disabled={loading}>
                  {loading ? "Loading..." : "Load More Jobs"}
                </LoadMoreButton>
              </LoadMoreContainer>
            )}
          </>
        ) : (
          <NoJobsFound>
            <h3>No jobs found matching your search criteria</h3>
            <p>Try adjusting your filters or search term</p>
          </NoJobsFound>
        )}
      </JobsGrid>
    </JobListingContainer>
  );
};


const JobListingContainer = styled.div`
  max-width: 1500px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
  min-height: calc(100vh - 64px);
  border-radius: 10px;
`;

const JobListingHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeIn 0.8s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h1 {
    color: #2c3e50;
    font-size: 2.4rem;
    margin-bottom: 0.7rem;
    font-weight: 800;
    background: linear-gradient(to right, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #7f8c8d;
    font-size: 1.2rem;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const SearchBar = styled.input`
  width: 95%;
  color: black;
  background: transparent;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 50px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1.2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterSelect = styled.select`
  flex: 1;
  color: #34495e;
  background: transparent;
  padding: 0.8rem 1.3rem;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  background-color: white;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
`;

const FilterInput = styled.input`
  flex: 1;
  color: #34495e;
  background: transparent;
  padding: 0.8rem 1.2rem;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
  }
`;

const ResultsStats = styled.div`
  margin-bottom: 1.5rem;
  color: #7f8c8d;
  font-size: 0.95rem;
  background: white;
  padding: 0.7rem 1.2rem;
  border-radius: 30px;
  display: inline-block;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.8rem;
`;

const JobCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 1.8rem;
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  height: 90%;
  border: 1px solid rgba(230, 230, 230, 0.7);
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(to right, #3498db, #2ecc71);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);

    &:before {
      opacity: 1;
    }
  }
`;

const JobCompany = styled.div`
  font-weight: 600;
  color: #3498db;
  margin-bottom: 0.6rem;
  font-size: 1.05rem;
`;

const JobTitle = styled.h2`
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 0.9rem;
  font-weight: 700;
`;

const JobLocation = styled.div`
  color: #7f8c8d;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const JobType = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  padding: 0.35rem 0.8rem;
  border-radius: 30px;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.3);
`;

const JobSalary = styled.div`
  font-weight: 600;
  color: #27ae60;
  margin-bottom: 1rem;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;

  &:before {
    content: "💰";
    font-size: 0.9rem;
  }
`;

const JobDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.95rem;
  margin-bottom: 1.2rem;
  flex-grow: 1;
  line-height: 1.6;
`;

const JobSkills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
`;

const SkillTag = styled.span`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #4b5563;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
`;

const JobActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  display: inline-block;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  background-color: ${(props) => (props.secondary ? "#e74c3c" : "#3498db")};
  color: white;
  border: none;

  &:hover {
    transform: translateY(-2px);
    background-color: ${(props) => (props.secondary ? "#c0392b" : "#2980b9")};
  }
`;

const JobPostedDate = styled.div`
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  animation: fadeIn 0.5s ease-out;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #7f8c8d;
  font-size: 1.2rem;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #ffeaea 0%, #ffe0e0 100%);
  color: #e74c3c;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.2);
  font-weight: 500;
  border-left: 5px solid #e74c3c;
`;

const NoJobsFound = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

  h3 {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1.6rem;
  }

  p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }
`;

const ErrorNotice = styled.div`
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 0.8rem;
  border-radius: 4px;
  margin: 1rem 0;
  border-left: 4px solid #e74c3c;
  font-size: 0.9rem;
`;

const LoadMoreContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const LoadMoreButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #2980b9;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

export default JobListing;
