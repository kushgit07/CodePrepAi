import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthContext from "../../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <NavbarContainer>
      <NavLogo to="/">
        <LogoText>CodePrep AI</LogoText>
      </NavLogo>
      <NavLinks>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
            <UserInfo>Hi, {user?.name || "User"}</UserInfo>
          </>
        ) : (
          <>
            <AuthLink to="/login">Login</AuthLink>
            <AuthLink to="/register" className="register">
              Register
            </AuthLink>
          </>
        )}
      </NavLinks>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavLogo = styled(Link)`
  text-decoration: none;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 3px;
    background: linear-gradient(to right, #e74c3c, #3498db);
    transition: width 0.3s ease;
  }

  &:hover:after {
    width: 100%;
  }
`;

const LogoText = styled.span`
  background: linear-gradient(to right, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  &::first-letter {
    color: #e74c3c;
    -webkit-text-fill-color: #e74c3c;
    font-size: 2rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #3498db;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #3498db;
    transform: translateY(-2px);
  }

  &:hover:after {
    width: 100%;
  }
`;

const AuthLink = styled(NavLink)`
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  font-weight: 600;

  &.register {
    background: linear-gradient(to right, #3498db, #2ecc71);
    color: white;
    box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);
    border: none;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(to right, #2980b9, #27ae60);
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(46, 204, 113, 0.4);
    }
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #ecf0f1;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    color: #e74c3c;
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.span`
  margin-left: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(52, 152, 219, 0.2) 0%,
    rgba(46, 204, 113, 0.2) 100%
  );
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    margin-left: 0.5rem;
    padding: 0.3rem 0.8rem;
  }
`;

export default Navbar;
