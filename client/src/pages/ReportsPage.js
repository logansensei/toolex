import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiTarget,
  FiShield,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ReportsContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const ReportsHeader = styled.div`
  margin-bottom: 30px;
`;

const ReportsTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
`;

const ReportsSubtitle = styled.p`
  font-size: 16px;
  color: #999;
  margin: 0;
`;

const FiltersContainer = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
`;

const FilterInput = styled.input`
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
  }

  &::placeholder {
    color: #666;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;

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

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ReportCard = styled(motion.div)`
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

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ReportTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px 0;
  word-break: break-all;
`;

const ReportDate = styled.p`
  font-size: 12px;
  color: #999;
  margin: 0;
`;

const ReportActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 4px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.danger:hover {
    background: rgba(255, 68, 68, 0.1);
    color: #ff4444;
    border-color: #ff4444;
  }
`;

const ReportStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.color || '#fff'};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ReportStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
`;

const StatusDot = styled.div`
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #00ff88;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 30px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  background: ${props => props.active ? '#00ff88' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? '#00ff88' : '#333'};
  border-radius: 6px;
  color: ${props => props.active ? '#000' : '#fff'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#00cc6a' : 'rgba(255, 255, 255, 0.1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchReports();
  }, [filters, pagination.current]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 12,
        ...filters
      });
      
      const response = await axios.get(`/api/scans/list?${params}`);
      setReports(response.data.scans);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleDeleteReport = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await axios.delete(`/api/scans/${scanId}`);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleExportReport = async (scanId, format = 'json') => {
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
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const handleViewReport = (scanId) => {
    window.location.href = `/results/${scanId}`;
  };

  if (loading) {
    return (
      <ReportsContainer>
        <LoadingSpinner>
          <FiRefreshCw className="animate-spin" style={{ fontSize: '32px', marginRight: '12px' }} />
          Loading reports...
        </LoadingSpinner>
      </ReportsContainer>
    );
  }

  return (
    <ReportsContainer>
      <ReportsHeader>
        <ReportsTitle>Scan Reports</ReportsTitle>
        <ReportsSubtitle>View and manage your security scan reports</ReportsSubtitle>
      </ReportsHeader>

      <FiltersContainer>
        <FiltersRow>
          <FilterGroup>
            <FilterLabel>Search</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Search by URL or scan ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </FilterSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Date From</FilterLabel>
            <FilterInput
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Date To</FilterLabel>
            <FilterInput
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </FilterGroup>
        </FiltersRow>
      </FiltersContainer>

      {reports.length > 0 ? (
        <>
          <ReportsGrid>
            {reports.map((report, index) => (
              <ReportCard
                key={report.scanId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ReportHeader>
                  <div>
                    <ReportTitle>{report.targetUrl}</ReportTitle>
                    <ReportDate>
                      {new Date(report.startTime).toLocaleString()}
                    </ReportDate>
                  </div>
                  <ReportActions>
                    <ActionButton
                      onClick={() => handleViewReport(report.scanId)}
                      title="View Report"
                    >
                      <FiEye />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleExportReport(report.scanId, 'json')}
                      title="Export JSON"
                    >
                      <FiDownload />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDeleteReport(report.scanId)}
                      className="danger"
                      title="Delete Report"
                    >
                      <FiTrash2 />
                    </ActionButton>
                  </ReportActions>
                </ReportHeader>

                <ReportStats>
                  <StatItem>
                    <StatValue color="#ff4444">
                      {report.results?.vulnerabilities?.length || 0}
                    </StatValue>
                    <StatLabel>Vulnerabilities</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue color="#0088ff">
                      {report.results?.endpoints?.length || 0}
                    </StatValue>
                    <StatLabel>Endpoints</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue color="#ffaa00">
                      {report.results?.secrets?.length || 0}
                    </StatValue>
                    <StatLabel>Secrets</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue color="#00ff88">
                      {report.results?.subdomains?.length || 0}
                    </StatValue>
                    <StatLabel>Subdomains</StatLabel>
                  </StatItem>
                </ReportStats>

                <ReportStatus>
                  <StatusDot status={report.status} />
                  <span>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
                  {report.duration && (
                    <span>• {Math.round(report.duration / 1000)}s</span>
                  )}
                </ReportStatus>
              </ReportCard>
            ))}
          </ReportsGrid>

          {pagination.pages > 1 && (
            <Pagination>
              <PageButton
                disabled={pagination.current === 1}
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
              >
                Previous
              </PageButton>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PageButton
                    key={page}
                    active={pagination.current === page}
                    onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  >
                    {page}
                  </PageButton>
                );
              })}
              
              <PageButton
                disabled={pagination.current === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <FiFileText style={{ fontSize: '64px', color: '#666', marginBottom: '20px' }} />
          <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '24px' }}>No Reports Found</h3>
          <p style={{ marginBottom: '20px' }}>Start by running a security scan to generate your first report.</p>
          <button
            onClick={() => window.location.href = '/scan'}
            style={{
              background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              color: '#000',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Start New Scan
          </button>
        </EmptyState>
      )}
    </ReportsContainer>
  );
};

export default ReportsPage;
