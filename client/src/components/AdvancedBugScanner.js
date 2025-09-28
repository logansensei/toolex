import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiEye,
  FiZap,
  FiLock,
  FiKey,
  FiDatabase,
  FiGlobe,
  FiCode,
  FiActivity,
  FiCpu,
  FiServer,
  FiUsers,
  FiSettings,
  FiTrendingUp
} from 'react-icons/fi';

const ScannerContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(10px);
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #00ff88, #0088ff, #ff6b6b, #ffaa00, #8844ff);
    background-size: 200% 100%;
    animation: gradientShift 3s ease-in-out infinite;
  }

  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const ScannerHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const ScannerTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #00ff88, #0088ff, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ScannerSubtitle = styled.p`
  font-size: 18px;
  color: #b0b0b0;
  margin: 0;
`;

const ScanForm = styled.form`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UrlInput = styled.input`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid #333;
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 4px rgba(0, 255, 136, 0.1);
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: #666;
  }
`;

const ScanButton = styled.button`
  padding: 16px 32px;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border: none;
  border-radius: 12px;
  color: #000;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScanCategories = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const CategoryCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.05);
  }

  &.active {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.1);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const CategoryIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${props => props.bgColor || 'rgba(0, 255, 136, 0.1)'};
  color: ${props => props.color || '#00ff88'};
`;

const CategoryTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const CategoryDescription = styled.p`
  font-size: 12px;
  color: #b0b0b0;
  margin: 0;
  line-height: 1.4;
`;

const ScanProgress = styled(motion.div)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProgressTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #0088ff);
  border-radius: 4px;
`;

const ProgressText = styled.div`
  font-size: 14px;
  color: #b0b0b0;
  text-align: center;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const ResultCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
    background: rgba(0, 255, 136, 0.05);
  }
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const ResultIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: ${props => props.bgColor || 'rgba(0, 255, 136, 0.1)'};
  color: ${props => props.color || '#00ff88'};
`;

const ResultTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const ResultCount = styled.span`
  font-size: 12px;
  color: #666;
  margin-left: auto;
`;

const VulnerabilityList = styled.div`
  margin-top: 16px;
`;

const VulnerabilityItem = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  border-left: 3px solid ${props => props.severity === 'Critical' ? '#ff4444' : 
    props.severity === 'High' ? '#ffaa00' : 
    props.severity === 'Medium' ? '#4488ff' : '#00ff88'};
`;

const VulnerabilityTitle = styled.h5`
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px 0;
`;

const VulnerabilityDescription = styled.p`
  font-size: 11px;
  color: #b0b0b0;
  margin: 0;
  line-height: 1.4;
`;

const AdvancedBugScanner = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState({
    advancedXSS: true,
    businessLogic: true,
    hpp: true,
    nosqlInjection: true,
    ldapInjection: true,
    commandInjection: true,
    pathTraversal: true,
    authBypass: true,
    sessionIssues: true,
    cryptoWeaknesses: true,
    infoDisclosure: true
  });

  const scanCategories = [
    {
      id: 'advancedXSS',
      title: 'Advanced XSS',
      description: 'DOM-based, stored, and filter bypass XSS',
      icon: <FiAlertTriangle />,
      bgColor: 'rgba(255, 68, 68, 0.1)',
      color: '#ff4444'
    },
    {
      id: 'businessLogic',
      title: 'Business Logic',
      description: 'Price manipulation, race conditions',
      icon: <FiTrendingUp />,
      bgColor: 'rgba(255, 170, 0, 0.1)',
      color: '#ffaa00'
    },
    {
      id: 'hpp',
      title: 'Parameter Pollution',
      description: 'HTTP parameter pollution attacks',
      icon: <FiSettings />,
      bgColor: 'rgba(68, 136, 255, 0.1)',
      color: '#4488ff'
    },
    {
      id: 'nosqlInjection',
      title: 'NoSQL Injection',
      description: 'MongoDB, CouchDB injection',
      icon: <FiDatabase />,
      bgColor: 'rgba(255, 68, 68, 0.1)',
      color: '#ff4444'
    },
    {
      id: 'ldapInjection',
      title: 'LDAP Injection',
      description: 'LDAP query injection attacks',
      icon: <FiUsers />,
      bgColor: 'rgba(255, 68, 68, 0.1)',
      color: '#ff4444'
    },
    {
      id: 'commandInjection',
      title: 'Command Injection',
      description: 'OS command injection attacks',
      icon: <FiServer />,
      bgColor: 'rgba(255, 68, 68, 0.1)',
      color: '#ff4444'
    },
    {
      id: 'pathTraversal',
      title: 'Path Traversal',
      description: 'Directory traversal attacks',
      icon: <FiGlobe />,
      bgColor: 'rgba(255, 170, 0, 0.1)',
      color: '#ffaa00'
    },
    {
      id: 'authBypass',
      title: 'Auth Bypass',
      description: 'Authentication bypass techniques',
      icon: <FiLock />,
      bgColor: 'rgba(255, 68, 68, 0.1)',
      color: '#ff4444'
    },
    {
      id: 'sessionIssues',
      title: 'Session Issues',
      description: 'Session management vulnerabilities',
      icon: <FiKey />,
      bgColor: 'rgba(68, 136, 255, 0.1)',
      color: '#4488ff'
    },
    {
      id: 'cryptoWeaknesses',
      title: 'Crypto Weaknesses',
      description: 'Cryptographic vulnerabilities',
      icon: <FiShield />,
      bgColor: 'rgba(255, 170, 0, 0.1)',
      color: '#ffaa00'
    },
    {
      id: 'infoDisclosure',
      title: 'Info Disclosure',
      description: 'Information disclosure issues',
      icon: <FiEye />,
      bgColor: 'rgba(68, 136, 255, 0.1)',
      color: '#4488ff'
    }
  ];

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!targetUrl) return;

    setIsScanning(true);
    setScanProgress(0);
    setScanResults(null);

    // Simulate advanced scan progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsScanning(false);
          // Simulate advanced results
          setScanResults({
            vulnerabilities: 28,
            critical: 5,
            high: 12,
            medium: 8,
            low: 3,
            advancedXSS: 4,
            businessLogic: 3,
            hpp: 2,
            nosqlInjection: 1,
            ldapInjection: 1,
            commandInjection: 2,
            pathTraversal: 3,
            authBypass: 2,
            sessionIssues: 4,
            cryptoWeaknesses: 3,
            infoDisclosure: 3,
            vulnerabilityList: [
              { name: 'Advanced XSS - DOM-based', severity: 'High', description: 'DOM-based XSS vulnerability detected' },
              { name: 'Business Logic - Price Manipulation', severity: 'High', description: 'Price manipulation vulnerability found' },
              { name: 'NoSQL Injection - MongoDB', severity: 'Critical', description: 'MongoDB injection vulnerability detected' },
              { name: 'Command Injection - OS Commands', severity: 'Critical', description: 'OS command injection vulnerability found' },
              { name: 'Authentication Bypass - SQL Injection', severity: 'Critical', description: 'SQL injection in authentication' },
              { name: 'Path Traversal - File Access', severity: 'High', description: 'Directory traversal vulnerability detected' },
              { name: 'Session Fixation', severity: 'Medium', description: 'Session ID not regenerated after login' },
              { name: 'Weak Encryption - MD5', severity: 'High', description: 'MD5 hashing algorithm detected' },
              { name: 'Information Disclosure - Error Messages', severity: 'Medium', description: 'Sensitive error information exposed' }
            ]
          });
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 300);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return '#ff4444';
      case 'High': return '#ffaa00';
      case 'Medium': return '#4488ff';
      case 'Low': return '#00ff88';
      default: return '#666';
    }
  };

  const getSeverityBgColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'rgba(255, 68, 68, 0.1)';
      case 'High': return 'rgba(255, 170, 0, 0.1)';
      case 'Medium': return 'rgba(68, 136, 255, 0.1)';
      case 'Low': return 'rgba(0, 255, 136, 0.1)';
      default: return 'rgba(102, 102, 102, 0.1)';
    }
  };

  return (
    <ScannerContainer>
      <ScannerHeader>
        <ScannerTitle>Advanced Bug Scanner</ScannerTitle>
        <ScannerSubtitle>
          Comprehensive vulnerability detection with modern attack techniques
        </ScannerSubtitle>
      </ScannerHeader>

      <ScanForm onSubmit={handleScan}>
        <UrlInput
          type="url"
          placeholder="https://example.com"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          disabled={isScanning}
        />
        <ScanButton type="submit" disabled={isScanning || !targetUrl}>
          {isScanning ? (
            <>
              <FiClock className="animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <FiZap />
              Start Advanced Scan
            </>
          )}
        </ScanButton>
      </ScanForm>

      <ScanCategories>
        {scanCategories.map((category) => (
          <CategoryCard
            key={category.id}
            className={selectedCategories[category.id] ? 'active' : ''}
            onClick={() => handleCategoryToggle(category.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CategoryHeader>
              <CategoryIcon bgColor={category.bgColor} color={category.color}>
                {category.icon}
              </CategoryIcon>
              <CategoryTitle>{category.title}</CategoryTitle>
            </CategoryHeader>
            <CategoryDescription>{category.description}</CategoryDescription>
          </CategoryCard>
        ))}
      </ScanCategories>

      <AnimatePresence>
        {isScanning && (
          <ScanProgress
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ProgressHeader>
              <ProgressTitle>
                <FiCpu className="animate-pulse" />
                Advanced Scanning in Progress
              </ProgressTitle>
              <span style={{ color: '#00ff88', fontWeight: '600' }}>
                {Math.round(scanProgress)}%
              </span>
            </ProgressHeader>
            <ProgressBar>
              <ProgressFill
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </ProgressBar>
            <ProgressText>
              Analyzing advanced security vulnerabilities...
            </ProgressText>
          </ScanProgress>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultsGrid>
              <ResultCard>
                <ResultHeader>
                  <ResultIcon bgColor="rgba(255, 68, 68, 0.1)" color="#ff4444">
                    <FiAlertTriangle />
                  </ResultIcon>
                  <ResultTitle>Total Vulnerabilities</ResultTitle>
                  <ResultCount>{scanResults.vulnerabilities}</ResultCount>
                </ResultHeader>
              </ResultCard>

              <ResultCard>
                <ResultHeader>
                  <ResultIcon bgColor="rgba(255, 68, 68, 0.1)" color="#ff4444">
                    <FiAlertTriangle />
                  </ResultIcon>
                  <ResultTitle>Critical</ResultTitle>
                  <ResultCount>{scanResults.critical}</ResultCount>
                </ResultHeader>
              </ResultCard>

              <ResultCard>
                <ResultHeader>
                  <ResultIcon bgColor="rgba(255, 170, 0, 0.1)" color="#ffaa00">
                    <FiAlertTriangle />
                  </ResultIcon>
                  <ResultTitle>High</ResultTitle>
                  <ResultCount>{scanResults.high}</ResultCount>
                </ResultHeader>
              </ResultCard>

              <ResultCard>
                <ResultHeader>
                  <ResultIcon bgColor="rgba(68, 136, 255, 0.1)" color="#4488ff">
                    <FiAlertTriangle />
                  </ResultIcon>
                  <ResultTitle>Medium</ResultTitle>
                  <ResultCount>{scanResults.medium}</ResultCount>
                </ResultHeader>
              </ResultCard>

              <ResultCard>
                <ResultHeader>
                  <ResultIcon bgColor="rgba(0, 255, 136, 0.1)" color="#00ff88">
                    <FiCheckCircle />
                  </ResultIcon>
                  <ResultTitle>Low</ResultTitle>
                  <ResultCount>{scanResults.low}</ResultCount>
                </ResultHeader>
              </ResultCard>
            </ResultsGrid>

            <VulnerabilityList>
              <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>
                Detailed Vulnerability Report
              </h3>
              {scanResults.vulnerabilityList.map((vuln, index) => (
                <VulnerabilityItem
                  key={index}
                  severity={vuln.severity}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VulnerabilityTitle>{vuln.name}</VulnerabilityTitle>
                  <VulnerabilityDescription>{vuln.description}</VulnerabilityDescription>
                </VulnerabilityItem>
              ))}
            </VulnerabilityList>
          </motion.div>
        )}
      </AnimatePresence>
    </ScannerContainer>
  );
};

export default AdvancedBugScanner;
