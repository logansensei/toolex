import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00ff88, #0088ff, #ff6b6b);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    border-color: #00ff88;
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 255, 136, 0.1);

    &::before {
      opacity: 1;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: ${props => props.bgColor || 'rgba(0, 255, 136, 0.1)'};
  color: ${props => props.color || '#00ff88'};
`;

const CardContent = styled.div`
  color: #b0b0b0;
  line-height: 1.6;
`;

const CardFooter = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
`;

const CardLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CardChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.positive ? '#00ff88' : '#ff4444'};
`;

const ModernCard = ({ 
  title, 
  icon, 
  value, 
  label, 
  change, 
  positive, 
  children, 
  iconColor, 
  iconBgColor,
  onClick,
  className 
}) => {
  return (
    <CardContainer
      className={className}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CardHeader>
        <CardTitle>
          {icon && <CardIcon bgColor={iconBgColor} color={iconColor}>{icon}</CardIcon>}
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {value && (
          <CardValue>{value}</CardValue>
        )}
        {label && (
          <CardLabel>{label}</CardLabel>
        )}
        {change && (
          <CardChange positive={positive}>
            {change}
          </CardChange>
        )}
        {children}
      </CardContent>
      
      {onClick && (
        <CardFooter>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Click to view details
          </div>
        </CardFooter>
      )}
    </CardContainer>
  );
};

export default ModernCard;
