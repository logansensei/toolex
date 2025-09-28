import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiTarget,
  FiGlobe,
  FiKey,
  FiDatabase,
  FiLock,
  FiCode,
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ResultsContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const ResultsHeader = styled.div`
  margin-bottom: 30px;
`;

const ResultsTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
`;

const ResultsSubtitle = styled.p`
  font-size: 16px;
  color: #999;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  font-size: 12px;
  color: #999;
`;

const TabsContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  overflow-x: auto;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 16px 24px;
  color: ${props => props.active ? '#00ff88' : '#999'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#00ff88' : 'transparent'};
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #fff;
  }
`;

const TabContent = styled.div`
  padding: 24px;
`;

const DataTable = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 100px 80px;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid #333;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 100px 80px;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #333;
  font-size: 14px;
  color: #fff;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SeverityBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.severity) {
      case 'Critical': return '#ff4444';
      case 'High': return '#ff8800';
      case 'Medium': return '#ffaa00';
      case 'Low': return '#00ff88';
      default: return '#666';
    }
  }};
  color: #000;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #00ff88;
`;

const ResultsPage = () => {
  const { scanId } = useParams();
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchScanResults();
  }, [scanId]);

  const fetchScanResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/scans/results/${scanId}`);
      setScanData(response.data);
    } catch (error) {
      console.error('Error fetching scan results:', error);
      setError('Failed to load scan results');
      toast.error('Failed to load scan results');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = async (format) => {
    try {
      const response = await axios.get(`/api/reports/${scanId}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scan-${scanId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Results exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export results');
    }
  };

  if (loading) {
    return (
      <ResultsContainer>
        <LoadingSpinner>
          <FiRefreshCw className="animate-spin" style={{ fontSize: '32px', marginRight: '12px' }} />
          Loading scan results...
        </LoadingSpinner>
      </ResultsContainer>
    );
  }

  if (error || !scanData) {
    return (
      <ResultsContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <FiAlertTriangle style={{ fontSize: '48px', color: '#ff4444', marginBottom: '16px' }} />
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>Error Loading Results</h2>
          <p style={{ color: '#999' }}>{error || 'Scan results not found'}</p>
        </div>
      </ResultsContainer>
    );
  }

  const { results, summary } = scanData;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiEye /> },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: <FiShield /> },
    { id: 'endpoints', label: 'Endpoints', icon: <FiTarget /> },
    { id: 'secrets', label: 'Secrets', icon: <FiKey /> },
    { id: 'headers', label: 'Headers', icon: <FiLock /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <FiDatabase /> }
  ];

  const renderOverview = () => (
    <div>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Scan Summary</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '12px' }}>Target Information</h4>
          <p style={{ color: '#999', margin: '4px 0' }}><strong>URL:</strong> {scanData.targetUrl}</p>
          <p style={{ color: '#999', margin: '4px 0' }}><strong>Scan Type:</strong> {scanData.scanType}</p>
          <p style={{ color: '#999', margin: '4px 0' }}><strong>Duration:</strong> {Math.round(scanData.duration / 1000)}s</p>
          <p style={{ color: '#999', margin: '4px 0' }}><strong>Completed:</strong> {new Date(scanData.endTime).toLocaleString()}</p>
        </div>
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '12px' }}>Findings Summary</h4>
          <p style={{ color: '#999', margin: '4px 0' }}><strong>Total Vulnerabilities:</strong> {summary.totalVulnerabilities}</p>
          <p style={{ color: '#ff4444', margin: '4px 0' }}><strong>Critical:</strong> {summary.criticalVulnerabilities}</p>
          <p style={{ color: '#ff8800', margin: '4px 0' }}><strong>High:</strong> {summary.highVulnerabilities}</p>
          <p style={{ color: '#ffaa00', margin: '4px 0' }}><strong>Medium:</strong> {summary.mediumVulnerabilities}</p>
          <p style={{ color: '#00ff88', margin: '4px 0' }}><strong>Low:</strong> {summary.lowVulnerabilities}</p>
        </div>
      </div>
    </div>
  );

  const renderVulnerabilities = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', margin: 0 }}>Vulnerabilities</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => exportResults('json')}
            style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid #00ff88',
              borderRadius: '6px',
              padding: '8px 16px',
              color: '#00ff88',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <FiDownload style={{ marginRight: '6px' }} />
            Export
          </button>
        </div>
      </div>
      
      {results.vulnerabilities.length > 0 ? (
        <DataTable>
          <TableHeader>
            <div>Vulnerability</div>
            <div>Severity</div>
            <div>Category</div>
            <div>Actions</div>
          </TableHeader>
          {results.vulnerabilities.map((vuln, index) => (
            <TableRow key={index}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>{vuln.name}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>{vuln.description}</div>
              </div>
              <div>
                <SeverityBadge severity={vuln.severity}>{vuln.severity}</SeverityBadge>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>Security</div>
              <div>
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#00ff88',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                  onClick={() => navigator.clipboard.writeText(vuln.poc)}
                >
                  Copy PoC
                </button>
              </div>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        <EmptyState>
          <FiCheckCircle style={{ fontSize: '48px', color: '#00ff88', marginBottom: '16px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Vulnerabilities Found</h3>
          <p>Great! No security vulnerabilities were detected in this scan.</p>
        </EmptyState>
      )}
    </div>
  );

  const renderEndpoints = () => (
    <div>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Discovered Endpoints</h3>
      {results.endpoints.length > 0 ? (
        <DataTable>
          <TableHeader>
            <div>URL</div>
            <div>Method</div>
            <div>Status</div>
            <div>Vulnerabilities</div>
          </TableHeader>
          {results.endpoints.map((endpoint, index) => (
            <TableRow key={index}>
              <div style={{ wordBreak: 'break-all' }}>{endpoint.url}</div>
              <div>{endpoint.method || 'GET'}</div>
              <div>{endpoint.statusCode || 'Unknown'}</div>
              <div>{endpoint.vulnerabilities?.length || 0}</div>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        <EmptyState>
          <FiTarget style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Endpoints Found</h3>
          <p>No endpoints were discovered during this scan.</p>
        </EmptyState>
      )}
    </div>
  );

  const renderSecrets = () => (
    <div>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Exposed Secrets</h3>
      {results.secrets.length > 0 ? (
        <DataTable>
          <TableHeader>
            <div>Type</div>
            <div>Value</div>
            <div>Location</div>
            <div>Severity</div>
          </TableHeader>
          {results.secrets.map((secret, index) => (
            <TableRow key={index}>
              <div>{secret.type}</div>
              <div style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {secret.value.substring(0, 50)}...
              </div>
              <div>{secret.location}</div>
              <div>
                <SeverityBadge severity={secret.severity}>{secret.severity}</SeverityBadge>
              </div>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        <EmptyState>
          <FiKey style={{ fontSize: '48px', color: '#00ff88', marginBottom: '16px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Secrets Found</h3>
          <p>No exposed secrets were detected in this scan.</p>
        </EmptyState>
      )}
    </div>
  );

  const renderHeaders = () => (
    <div>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Security Headers</h3>
      {results.headers.length > 0 ? (
        <DataTable>
          <TableHeader>
            <div>Header</div>
            <div>Value</div>
            <div>Secure</div>
            <div>Recommendations</div>
          </TableHeader>
          {results.headers.map((header, index) => (
            <TableRow key={index}>
              <div>{header.name}</div>
              <div style={{ wordBreak: 'break-all' }}>{header.value}</div>
              <div>
                {header.secure ? (
                  <FiCheckCircle style={{ color: '#00ff88' }} />
                ) : (
                  <FiAlertTriangle style={{ color: '#ff4444' }} />
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {header.recommendations?.join(', ') || 'N/A'}
              </div>
            </TableRow>
          ))}
        </DataTable>
      ) : (
        <EmptyState>
          <FiLock style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Headers Analyzed</h3>
          <p>No security headers were analyzed in this scan.</p>
        </EmptyState>
      )}
    </div>
  );

  const renderInfrastructure = () => (
    <div>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Infrastructure Analysis</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '12px' }}>Subdomains ({results.subdomains.length})</h4>
          {results.subdomains.length > 0 ? (
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '16px' }}>
              {results.subdomains.map((sub, index) => (
                <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #333' }}>
                  <div style={{ color: '#fff' }}>{sub.subdomain}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>IP: {sub.ip}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No subdomains found</p>
          )}
        </div>
        
        <div>
          <h4 style={{ color: '#00ff88', marginBottom: '12px' }}>S3 Buckets ({results.s3Buckets.length})</h4>
          {results.s3Buckets.length > 0 ? (
            <div style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', padding: '16px' }}>
              {results.s3Buckets.map((bucket, index) => (
                <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #333' }}>
                  <div style={{ color: '#fff' }}>{bucket.bucket}</div>
                  <div style={{ fontSize: '12px', color: bucket.public ? '#ff4444' : '#00ff88' }}>
                    {bucket.public ? 'Public' : 'Private'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999' }}>No S3 buckets found</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'vulnerabilities': return renderVulnerabilities();
      case 'endpoints': return renderEndpoints();
      case 'secrets': return renderSecrets();
      case 'headers': return renderHeaders();
      case 'infrastructure': return renderInfrastructure();
      default: return renderOverview();
    }
  };

  return (
    <ResultsContainer>
      <ResultsHeader>
        <ResultsTitle>Scan Results</ResultsTitle>
        <ResultsSubtitle>Target: {scanData.targetUrl}</ResultsSubtitle>
      </ResultsHeader>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatHeader>
            <StatTitle>Vulnerabilities</StatTitle>
            <StatIcon bgColor="rgba(255, 68, 68, 0.1)" color="#ff4444">
              <FiShield />
            </StatIcon>
          </StatHeader>
          <StatValue>{summary.totalVulnerabilities}</StatValue>
          <StatChange>Total security issues found</StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatHeader>
            <StatTitle>Endpoints</StatTitle>
            <StatIcon bgColor="rgba(0, 136, 255, 0.1)" color="#0088ff">
              <FiTarget />
            </StatIcon>
          </StatHeader>
          <StatValue>{summary.totalEndpoints}</StatValue>
          <StatChange>Discovered endpoints</StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatHeader>
            <StatTitle>Secrets</StatTitle>
            <StatIcon bgColor="rgba(255, 170, 0, 0.1)" color="#ffaa00">
              <FiKey />
            </StatIcon>
          </StatHeader>
          <StatValue>{summary.totalSecrets}</StatValue>
          <StatChange>Exposed secrets found</StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatHeader>
            <StatTitle>Subdomains</StatTitle>
            <StatIcon bgColor="rgba(0, 255, 136, 0.1)" color="#00ff88">
              <FiGlobe />
            </StatIcon>
          </StatHeader>
          <StatValue>{summary.totalSubdomains}</StatValue>
          <StatChange>Subdomains discovered</StatChange>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <TabsHeader>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span style={{ marginLeft: '8px' }}>{tab.label}</span>
            </Tab>
          ))}
        </TabsHeader>
        <TabContent>
          {renderTabContent()}
        </TabContent>
      </TabsContainer>
    </ResultsContainer>
  );
};

export default ResultsPage;
