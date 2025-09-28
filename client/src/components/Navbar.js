import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiMenu, 
  FiSearch, 
  FiBell, 
  FiSettings, 
  FiUser,
  FiShield,
  FiActivity
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const NavbarContainer = styled(motion.nav)`
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #333;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #00ff88;

  svg {
    font-size: 24px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 300px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  background: none;
  border: none;
  color: #fff;
  font-size: 14px;
  width: 100%;
  outline: none;

  &::placeholder {
    color: #666;
  }
`;

const SearchIcon = styled(FiSearch)`
  color: #666;
  font-size: 16px;
  margin-right: 8px;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ff4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00ff88;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: #666;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #00ff88;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  background: #00ff88;
  border-radius: 50%;
  animation: pulse 2s infinite;
`;

const Navbar = ({ onToggleSidebar }) => {
  const [notifications] = useState(3);
  const [user] = useState({
    name: 'Security Analyst',
    role: 'Admin',
    avatar: 'SA'
  });

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query) {
        toast.success(`Searching for: ${query}`);
        // Implement search functionality
      }
    }
  };

  const handleNotificationClick = () => {
    toast.success('Notifications clicked');
    // Implement notification functionality
  };

  const handleUserClick = () => {
    toast.success('User menu clicked');
    // Implement user menu functionality
  };

  return (
    <NavbarContainer
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <LeftSection>
        <MenuButton onClick={onToggleSidebar}>
          <FiMenu />
        </MenuButton>
        
        <Logo>
          <FiShield />
          Security Recon
        </Logo>

        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search scans, vulnerabilities..."
            onKeyPress={handleSearch}
          />
        </SearchContainer>
      </LeftSection>

      <RightSection>
        <StatusIndicator>
          <StatusDot />
          <span>System Online</span>
        </StatusIndicator>

        <NotificationButton onClick={handleNotificationClick}>
          <FiBell />
          {notifications > 0 && (
            <NotificationBadge>{notifications}</NotificationBadge>
          )}
        </NotificationButton>

        <UserMenu>
          <UserButton onClick={handleUserClick}>
            <UserAvatar>{user.avatar}</UserAvatar>
            <UserInfo>
              <UserName>{user.name}</UserName>
              <UserRole>{user.role}</UserRole>
            </UserInfo>
          </UserButton>
        </UserMenu>
      </RightSection>
    </NavbarContainer>
  );
};

export default Navbar;
