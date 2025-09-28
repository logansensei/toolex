import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiSearch,
  FiFileText,
  FiSettings,
  FiBookmark,
  FiShield,
  FiActivity,
  FiX,
  FiChevronRight
} from 'react-icons/fi';

const SidebarContainer = styled(motion.aside)`
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: rgba(12, 12, 12, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid #333;
  z-index: 200;
  display: flex;
  flex-direction: column;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  }

  @media (min-width: 769px) {
    transform: translateX(0);
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #00ff88;
  margin: 0;
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const SidebarContent = styled.nav`
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 15px 20px;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLinkStyled = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #999;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;

  &:hover {
    color: #fff;
    background: rgba(0, 255, 136, 0.1);
  }

  &.active {
    color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
    border-right: 3px solid #00ff88;
  }

  svg {
    font-size: 18px;
    min-width: 18px;
  }
`;

const NavText = styled.span`
  flex: 1;
`;

const NavBadge = styled.span`
  background: #ff4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
`;

const NavChevron = styled(FiChevronRight)`
  font-size: 14px;
  transition: transform 0.2s;
  transform: ${props => props.isOpen ? 'rotate(90deg)' : 'rotate(0deg)'};
`;

const SubNavList = styled(motion.ul)`
  list-style: none;
  margin: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.2);
`;

const SubNavItem = styled.li`
  margin: 0;
`;

const SubNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 10px 50px;
  color: #666;
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(0, 255, 136, 0.05);
  }

  &.active {
    color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
  }
`;

const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #333;
`;

const FooterText = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
  text-align: center;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
  display: ${props => props.isOpen ? 'block' : 'none'};

  @media (min-width: 769px) {
    display: none;
  }
`;

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState({});

  const toggleExpanded = (item) => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const navItems = [
    {
      section: 'Main',
      items: [
        {
          to: '/',
          icon: FiHome,
          text: 'Dashboard',
          badge: null
        },
        {
          to: '/scan',
          icon: FiSearch,
          text: 'New Scan',
          badge: null
        },
        {
          to: '/bookmarklet',
          icon: FiBookmark,
          text: 'Bookmarklet',
          badge: 'New'
        }
      ]
    },
    {
      section: 'Analysis',
      items: [
        {
          to: '/reports',
          icon: FiFileText,
          text: 'Reports',
          badge: null
        },
        {
          to: '/vulnerabilities',
          icon: FiShield,
          text: 'Vulnerabilities',
          badge: '5'
        },
        {
          to: '/activity',
          icon: FiActivity,
          text: 'Activity Log',
          badge: null
        }
      ]
    },
    {
      section: 'System',
      items: [
        {
          to: '/settings',
          icon: FiSettings,
          text: 'Settings',
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      <Overlay
        isOpen={isOpen}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <SidebarContainer
        isOpen={isOpen}
        initial={{ x: -250 }}
        animate={{ x: isOpen ? 0 : -250 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <SidebarHeader>
          <SidebarTitle>Security Recon</SidebarTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </SidebarHeader>

        <SidebarContent>
          {navItems.map((section, sectionIndex) => (
            <NavSection key={sectionIndex}>
              <SectionTitle>{section.section}</SectionTitle>
              <NavList>
                {section.items.map((item, itemIndex) => (
                  <NavItem key={itemIndex}>
                    <NavLinkStyled
                      to={item.to}
                      onClick={onClose}
                    >
                      <item.icon />
                      <NavText>{item.text}</NavText>
                      {item.badge && (
                        <NavBadge>{item.badge}</NavBadge>
                      )}
                    </NavLinkStyled>
                  </NavItem>
                ))}
              </NavList>
            </NavSection>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <FooterText>
            Security Recon Tool v2.0
            <br />
            © 2024 Security Team
          </FooterText>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
