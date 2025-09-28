import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiTarget,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';

// Mock data - replace with actual API calls
const mockStats = {
  totalScans: 156,
  activeScans: 3,
  vulnerabilitiesFound: 47,
  criticalVulnerabilities: 8,
  highVulnerabilities: 15,
  mediumVulnerabilities: 18,
  lowVulnerabilities: 6,
  riskScore: 72
};

const mockRecentScans = [
  {
    id: 'scan-001',
    target: 'https://example.com',
    status: 'completed',
    vulnerabilities: 12,
    duration: '2m 34s',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: 'scan-002',
    target: 'https://test.com',
    status: 'running',
    vulnerabilities: 0,
    duration: '1m 12s',
    timestamp: '2024-01-15T10:15:00Z'
  },
  {
    id: 'scan-003',
    target: 'https://demo.com',
    status: 'completed',
    vulnerabilities: 5,
    duration: '1m 45s',
    timestamp: '2024-01-15T09:45:00Z'
  }
];

const mockVulnerabilityTrend = [
  { month: 'Jan', critical: 12, high: 25, medium: 18, low: 8 },
  { month: 'Feb', critical: 8, high: 20, medium: 22, low: 12 },
  { month: 'Mar', critical: 6, high: 18, medium: 25, low: 15 },
  { month: 'Apr', critical: 4, high: 15, medium: 28, low: 18 },
  { month: 'May', critical: 2, high: 12, medium: 30, low: 20 },
  { month: 'Jun', critical: 1, high: 10, medium: 32, low: 22 }
];

const mockSeverityDistribution = [
  { name: 'Critical', value: 8, color: '#ff4444' },
  { name: 'High', value: 15, color: '#ff8800' },
  { name: 'Medium', value: 18, color: '#ffaa00' },
  { name: 'Low', value: 6, color: '#00ff88' }
];

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  margin-bottom: 30px;
`;

const DashboardTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
`;

const DashboardSubtitle = styled.p`
  font-size: 16px;
  color: #999;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 136, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #999;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatIcon = styled.div`
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

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.positive ? '#00ff88' : '#ff4444'};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px 0;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const RecentScansCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 24px;
  backdrop-filter: blur(10px);
`;

const ScanItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #333;

  &:last-child {
    border-bottom: none;
  }
`;

const ScanInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ScanStatus = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#00ff88';
      case 'running': return '#ffaa00';
      case 'failed': return '#ff4444';
      default: return '#666';
    }
  }};
`;

const ScanTarget = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`;

const ScanDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #999;
`;

const VulnerabilityCount = styled.span`
  color: ${props => props.count > 10 ? '#ff4444' : props.count > 5 ? '#ffaa00' : '#00ff88'};
  font-weight: 600;
`;

const RefreshButton = styled.button`
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    () => Promise.resolve(mockStats),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: recentScans, isLoading: scansLoading } = useQuery(
    'recent-scans',
    () => Promise.resolve(mockRecentScans),
    {
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.success('Dashboard refreshed');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FiCheckCircle />;
      case 'running': return <FiClock />;
      case 'failed': return <FiAlertTriangle />;
      default: return <FiActivity />;
    }
  };

  if (statsLoading || scansLoading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <FiRefreshCw className="animate-spin" style={{ fontSize: '32px', color: '#00ff88' }} />
          <p style={{ marginTop: '16px', color: '#999' }}>Loading dashboard...</p>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <DashboardTitle>Security Dashboard</DashboardTitle>
            <DashboardSubtitle>Monitor your security posture and scan results</DashboardSubtitle>
          </div>
          <RefreshButton onClick={handleRefresh} disabled={isRefreshing}>
            <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </RefreshButton>
        </div>
      </DashboardHeader>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatHeader>
            <StatTitle>Total Scans</StatTitle>
            <StatIcon bgColor="rgba(0, 136, 255, 0.1)" color="#0088ff">
              <FiTarget />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalScans}</StatValue>
          <StatChange positive>
            <FiTrendingUp />
            +12% from last month
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatHeader>
            <StatTitle>Active Scans</StatTitle>
            <StatIcon bgColor="rgba(255, 170, 0, 0.1)" color="#ffaa00">
              <FiActivity />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.activeScans}</StatValue>
          <StatChange positive>
            <FiClock />
            Running now
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatHeader>
            <StatTitle>Vulnerabilities</StatTitle>
            <StatIcon bgColor="rgba(255, 68, 68, 0.1)" color="#ff4444">
              <FiShield />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.vulnerabilitiesFound}</StatValue>
          <StatChange positive={false}>
            <FiAlertTriangle />
            -8% from last week
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatHeader>
            <StatTitle>Risk Score</StatTitle>
            <StatIcon bgColor="rgba(0, 255, 136, 0.1)" color="#00ff88">
              <FiEye />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.riskScore}/100</StatValue>
          <StatChange positive={stats.riskScore < 50}>
            <FiTrendingUp />
            {stats.riskScore < 50 ? 'Low risk' : 'High risk'}
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChartTitle>Vulnerability Trends</ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockVulnerabilityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line type="monotone" dataKey="critical" stroke="#ff4444" strokeWidth={2} />
                <Line type="monotone" dataKey="high" stroke="#ff8800" strokeWidth={2} />
                <Line type="monotone" dataKey="medium" stroke="#ffaa00" strokeWidth={2} />
                <Line type="monotone" dataKey="low" stroke="#00ff88" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ChartTitle>Severity Distribution</ChartTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockSeverityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockSeverityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </ChartsGrid>

      <RecentScansCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <ChartTitle>Recent Scans</ChartTitle>
        {recentScans.map((scan, index) => (
          <ScanItem key={scan.id}>
            <ScanInfo>
              <ScanStatus status={scan.status} />
              <ScanTarget>{scan.target}</ScanTarget>
            </ScanInfo>
            <ScanDetails>
              <VulnerabilityCount count={scan.vulnerabilities}>
                {scan.vulnerabilities} vulns
              </VulnerabilityCount>
              <span>{scan.duration}</span>
              <span>{new Date(scan.timestamp).toLocaleString()}</span>
            </ScanDetails>
          </ScanItem>
        ))}
      </RecentScansCard>
    </DashboardContainer>
  );
};

export default Dashboard;
