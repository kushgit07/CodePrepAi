import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthContext from "../context/AuthContext";
import { authAPI } from "../utils/api"; 

const Profile = () => {
  const { user, isAuthenticated, token, updateUser, logout } =
    useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    bio: "",
    skills: "",
    education: "",
    experience: "",
    github: "",
    linkedin: "",
    portfolio: "",
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        bio: user.profile?.bio || "",
        skills: user.profile?.skills?.join(", ") || "",
        education: user.profile?.education || "",
        experience: user.profile?.experience || "",
        github: user.profile?.github || "",
        linkedin: user.profile?.linkedin || "",
        portfolio: user.profile?.portfolio || "",
      });
      setLoading(false);
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess(null);
    setError(null);
    setSaving(true);

    try {

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmNewPassword) {
          setError("New passwords do not match");
          setSaving(false);
          return;
        }

        if (!formData.currentPassword) {
          setError("Current password is required to set a new password");
          setSaving(false);
          return;
        }
      }

      const updateData = {
        name: formData.name,
        email: formData.email,
        profile: {
          bio: formData.bio,
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill),
          education: formData.education,
          experience: formData.experience,
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
        },
      };

      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Update user profile using authAPI instead of axios with hardcoded URL
      const response = await authAPI.updateProfile(updateData);

      // Update local context with new user data
      updateUser(response.user);

      setSuccess("Profile updated successfully");

      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await authAPI.deleteAccount();
        logout();
        navigate("/");
      } catch (err) {
        setError("Failed to delete account");
      }
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading profile...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <h1>Your Profile</h1>
        <p>Manage your personal information and account settings</p>
      </ProfileHeader>

      <ProfileContent>
        <TabsContainer>
          <TabButton
            active={activeTab === "personal"}
            onClick={() => setActiveTab("personal")}
          >
            Personal Info
          </TabButton>
          <TabButton
            active={activeTab === "skills"}
            onClick={() => setActiveTab("skills")}
          >
            Skills & Experience
          </TabButton>
          <TabButton
            active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
          >
            Account Settings
          </TabButton>
        </TabsContainer>

        <ProfileForm onSubmit={handleSubmit}>
          {success && <SuccessMessage>{success}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {activeTab === "personal" && (
            <FormSection>
              <FormGroup>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell employers about yourself..."
                />
              </FormGroup>
            </FormSection>
          )}

          {activeTab === "skills" && (
            <FormSection>
              <FormGroup>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. JavaScript, React, Node.js, Python"
                />
                <FieldHelp>Separate skills with commas</FieldHelp>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Your educational background..."
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="experience">Work Experience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Your work history and experience..."
                />
              </FormGroup>

              <LinksGroup>
                <h3>Professional Links</h3>

                <FormGroup>
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input
                    type="url"
                    id="github"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://www.linkedin.com/in/username"
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="portfolio">Portfolio Website</Label>
                  <Input
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleChange}
                    placeholder="https://your-portfolio.com"
                  />
                </FormGroup>
              </LinksGroup>
            </FormSection>
          )}

          {activeTab === "account" && (
            <FormSection>
              <PasswordSection>
                <h3>Change Password</h3>
                <FormGroup>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    type="password"
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FieldHelp>
                  Leave password fields empty if you don't want to change it
                </FieldHelp>
              </PasswordSection>

              <DangerZone>
                <h3>Danger Zone</h3>
                <p>
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <DeleteButton type="button" onClick={handleDeleteAccount}>
                  Delete Account
                </DeleteButton>
              </DangerZone>
            </FormSection>
          )}

          <SaveButtonContainer>
            <SaveButton type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </SaveButton>
          </SaveButtonContainer>
        </ProfileForm>
      </ProfileContent>
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 3rem auto;
  padding: 2rem;
`;

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.2rem;
    background: linear-gradient(135deg, #3498db, #2ecc71);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.8rem;
    font-weight: 700;
  }

  p {
    color: #7f8c8d;
    font-size: 1.1rem;
  }
`;

const ProfileContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid rgba(230, 230, 230, 0.7);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TabButton = styled.button`
  flex: 1;
  padding: 1.2rem;
  background: none;
  border: none;
  position: relative;
  color: ${(props) => (props.active ? "#2c3e50" : "#7f8c8d")};
  font-weight: ${(props) => (props.active ? "600" : "400")};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: ${(props) => (props.active ? "0" : "50%")};
    width: ${(props) => (props.active ? "100%" : "0")};
    height: 3px;
    background: linear-gradient(to right, #3498db, #2ecc71);
    transition: all 0.3s ease;
  }

  &:hover {
    color: #2c3e50;

    &:after {
      left: 0;
      width: 100%;
    }
  }
`;

const ProfileForm = styled.form`
  padding: 2.5rem;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(249, 249, 249, 0.9) 100%
  );
`;

const FormSection = styled.div`
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.8rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.8rem;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;

  &:after {
    content: "";
    display: block;
    width: 30px;
    height: 2px;
    background: linear-gradient(to right, #3498db, rgba(52, 152, 219, 0.2));
    margin-top: 4px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  background-color: #fff;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.9rem 1rem;
  color: black;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  &:hover {
    border-color: #bdc3c7;
  }
`;

const FieldHelp = styled.p`
  font-size: 0.85rem;
  color: #95a5a6;
  margin-top: 0.5rem;
  font-style: italic;
`;

const LinksGroup = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(236, 240, 241, 0.4) 0%,
    rgba(245, 247, 250, 0.4) 100%
  );
  border-radius: 8px;

  h3 {
    font-size: 1.2rem;
    color: #2c3e50;
    margin-bottom: 1.2rem;
    position: relative;
    display: inline-block;

    &:after {
      content: "";
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(to right, #3498db, rgba(52, 152, 219, 0.2));
    }
  }
`;

const PasswordSection = styled.div`
  margin: 2.5rem 0;
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(236, 240, 241, 0.4) 0%,
    rgba(245, 247, 250, 0.4) 100%
  );
  border-radius: 8px;

  h3 {
    font-size: 1.2rem;
    color: #2c3e50;
    margin-bottom: 1.2rem;
    position: relative;
    display: inline-block;

    &:after {
      content: "";
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(to right, #3498db, rgba(52, 152, 219, 0.2));
    }
  }
`;

const DangerZone = styled.div`
  background: linear-gradient(
    135deg,
    rgba(255, 245, 245, 0.7) 0%,
    rgba(253, 235, 235, 0.7) 100%
  );
  padding: 1.8rem;
  border-radius: 10px;
  border-left: 4px solid #e74c3c;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.1);

  h3 {
    font-size: 1.2rem;
    color: #e74c3c;
    margin-bottom: 0.8rem;
    font-weight: 600;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 1.2rem;
    line-height: 1.5;
  }
`;

const DeleteButton = styled.button`
  background-color: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  padding: 0.7rem 1.4rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;

  &:hover {
    background-color: #e74c3c;
    color: white;
    box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
    transform: translateY(-2px);
  }
`;

const SaveButtonContainer = styled.div`
  margin-top: 2.5rem;
  display: flex;
  justify-content: flex-end;
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
  color: white;
  padding: 0.9rem 2.5rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(46, 204, 113, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(
    135deg,
    rgba(212, 237, 218, 0.7) 0%,
    rgba(195, 230, 203, 0.7) 100%
  );
  color: #155724;
  padding: 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #2ecc71;
  display: flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(46, 204, 113, 0.1);

  &:before {
    content: "✓";
    font-size: 1.2rem;
    font-weight: bold;
    margin-right: 10px;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(
    135deg,
    rgba(248, 215, 218, 0.7) 0%,
    rgba(244, 194, 199, 0.7) 100%
  );
  color: #721c24;
  padding: 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #e74c3c;
  display: flex;
  align-items: center;
  box-shadow: 0 3px 10px rgba(231, 76, 60, 0.1);

  &:before {
    content: "!";
    font-size: 1.2rem;
    font-weight: bold;
    margin-right: 10px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(236, 240, 241, 0.8);
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
  box-shadow: 0 0 20px rgba(52, 152, 219, 0.2);

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
  position: relative;

  &:after {
    content: "...";
    position: absolute;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      content: ".";
    }
    33% {
      content: "..";
    }
    66% {
      content: "...";
    }
  }
`;

export default Profile;
