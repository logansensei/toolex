import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiSettings,
  FiPlay,
  FiPause,
  FiStop,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiTarget,
  FiGlobe,
  FiCode,
  FiEye,
  FiDatabase,
  FiKey,
  FiLock
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import AdvancedBugScanner from '../components/AdvancedBugScanner';

const ScanContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ScanHeader = styled.div`
  margin-bottom: 30px;
`;

const ScanTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
`;

const ScanSubtitle = styled.p`
  font-size: 16px;
  color: #999;
  margin: 0;
`;

const ScanForm = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  &::placeholder {
    color: #666;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #fff;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #00ff88;
`;

const ScanButton = styled.button`
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  color: #000;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ScanOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const OptionCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
    transform: translateY(-2px);
  }
`;

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const OptionIcon = styled.div`
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

const OptionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const OptionDescription = styled.p`
  font-size: 14px;
  color: #999;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ScanStatus = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: ${props => {
    switch (props.status) {
      case 'running': return 'rgba(255, 170, 0, 0.1)';
      case 'completed': return 'rgba(0, 255, 136, 0.1)';
      case 'failed': return 'rgba(255, 68, 68, 0.1)';
      default: return 'rgba(102, 102, 102, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'running': return '#ffaa00';
      case 'completed': return '#00ff88';
      case 'failed': return '#ff4444';
      default: return '#666';
    }
  }};
`;

const StatusText = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 4px 0;
  }
  p {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00cc6a);
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const StatusActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #333;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00ff88;
  }

  &.danger {
    border-color: #ff4444;
    color: #ff4444;

    &:hover {
      background: rgba(255, 68, 68, 0.1);
    }
  }
`;

const ScanPage = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [scanType, setScanType] = useState('full');
  const [scanOptions, setScanOptions] = useState({
    endpoints: true,
    subdomains: true,
    s3Buckets: true,
    secrets: true,
    cors: true,
    xss: true,
    openRedirects: true,
    headers: true,
    technologies: true,
    certificates: true,
    dns: true,
    ports: true
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleOptionChange = (option) => {
    setScanOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const startScan = async () => {
    if (!targetUrl) {
      toast.error('Please enter a target URL');
      return;
    }

    try {
      setIsScanning(true);
      setScanStatus({
        status: 'running',
        scanId: null,
        message: 'Starting scan...'
      });
      setScanProgress(0);

      const response = await axios.post('/api/scans/start', {
        targetUrl,
        scanType,
        options: scanOptions
      });

      const { scanId } = response.data;
      setScanStatus(prev => ({
        ...prev,
        scanId,
        message: 'Scan started successfully'
      }));

      // Poll for scan status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`/api/scans/status/${scanId}`);
          const { status, progress } = statusResponse.data;
          
          setScanProgress(progress);
          setScanStatus(prev => ({
            ...prev,
            status,
            message: status === 'running' ? 'Scan in progress...' : 
                    status === 'completed' ? 'Scan completed!' : 
                    status === 'failed' ? 'Scan failed' : 'Unknown status'
          }));

          if (status === 'completed' || status === 'failed') {
            clearInterval(pollInterval);
            setIsScanning(false);
            
            if (status === 'completed') {
              toast.success('Scan completed successfully!');
              // Redirect to results page
              window.location.href = `/results/${scanId}`;
            } else {
              toast.error('Scan failed');
            }
          }
        } catch (error) {
          console.error('Error polling scan status:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Error starting scan:', error);
      toast.error('Failed to start scan');
      setIsScanning(false);
      setScanStatus(null);
    }
  };

  const stopScan = async () => {
    if (scanStatus?.scanId) {
      try {
        await axios.post(`/api/scans/cancel/${scanStatus.scanId}`);
        setIsScanning(false);
        setScanStatus(prev => ({
          ...prev,
          status: 'cancelled',
          message: 'Scan cancelled'
        }));
        toast.success('Scan cancelled');
      } catch (error) {
        console.error('Error cancelling scan:', error);
        toast.error('Failed to cancel scan');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <FiRefreshCw className="animate-spin" />;
      case 'completed': return <FiCheckCircle />;
      case 'failed': return <FiAlertTriangle />;
      case 'cancelled': return <FiStop />;
      default: return <FiClock />;
    }
  };

  return (
    <ScanContainer>
      <ScanHeader>
        <ScanTitle>Security Scan</ScanTitle>
        <ScanSubtitle>Perform comprehensive security reconnaissance on your target</ScanSubtitle>
      </ScanHeader>

      <ScanForm
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FormGroup>
          <Label htmlFor="targetUrl">Target URL</Label>
          <Input
            id="targetUrl"
            type="url"
            placeholder="https://example.com"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            disabled={isScanning}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="scanType">Scan Type</Label>
          <Select
            id="scanType"
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            disabled={isScanning}
          >
            <option value="full">Full Scan</option>
            <option value="quick">Quick Scan</option>
            <option value="custom">Custom Scan</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Scan Options</Label>
          <CheckboxGroup>
            {Object.entries(scanOptions).map(([key, value]) => (
              <CheckboxItem key={key}>
                <Checkbox
                  type="checkbox"
                  checked={value}
                  onChange={() => handleOptionChange(key)}
                  disabled={isScanning}
                />
                <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </FormGroup>

        <ScanButton onClick={startScan} disabled={isScanning || !targetUrl}>
          <FiPlay />
          {isScanning ? 'Scanning...' : 'Start Scan'}
        </ScanButton>
      </ScanForm>

      <ScanOptions>
        <OptionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <OptionHeader>
            <OptionIcon bgColor="rgba(0, 136, 255, 0.1)" color="#0088ff">
              <FiGlobe />
            </OptionIcon>
            <OptionTitle>Endpoint Discovery</OptionTitle>
          </OptionHeader>
          <OptionDescription>
            Discover all endpoints, APIs, and hidden paths in your application
          </OptionDescription>
        </OptionCard>

        <OptionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <OptionHeader>
            <OptionIcon bgColor="rgba(255, 68, 68, 0.1)" color="#ff4444">
              <FiShield />
            </OptionIcon>
            <OptionTitle>Vulnerability Detection</OptionTitle>
          </OptionHeader>
          <OptionDescription>
            Detect XSS, CORS misconfigurations, open redirects, and other security issues
          </OptionDescription>
        </OptionCard>

        <OptionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <OptionHeader>
            <OptionIcon bgColor="rgba(255, 170, 0, 0.1)" color="#ffaa00">
              <FiKey />
            </OptionIcon>
            <OptionTitle>Secrets Detection</OptionTitle>
          </OptionHeader>
          <OptionDescription>
            Find exposed API keys, tokens, database credentials, and other sensitive data
          </OptionDescription>
        </OptionCard>

        <OptionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <OptionHeader>
            <OptionIcon bgColor="rgba(0, 255, 136, 0.1)" color="#00ff88">
              <FiDatabase />
            </OptionIcon>
            <OptionTitle>Infrastructure Analysis</OptionTitle>
          </OptionHeader>
          <OptionDescription>
            Analyze subdomains, S3 buckets, DNS records, and network infrastructure
          </OptionDescription>
        </OptionCard>
      </ScanOptions>

      <AdvancedBugScanner />

      {scanStatus && (
        <ScanStatus
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <StatusHeader>
            <StatusInfo>
              <StatusIcon status={scanStatus.status}>
                {getStatusIcon(scanStatus.status)}
              </StatusIcon>
              <StatusText>
                <h3>{scanStatus.message}</h3>
                <p>Target: {targetUrl}</p>
              </StatusText>
            </StatusInfo>
            <StatusActions>
              {scanStatus.status === 'running' && (
                <ActionButton onClick={stopScan} className="danger">
                  <FiStop />
                  Stop Scan
                </ActionButton>
              )}
            </StatusActions>
          </StatusHeader>
          
          {scanStatus.status === 'running' && (
            <ProgressBar>
              <ProgressFill progress={scanProgress} />
            </ProgressBar>
          )}
        </ScanStatus>
      )}
    </ScanContainer>
  );
};

export default ScanPage;
