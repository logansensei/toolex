import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiSettings,
  FiSave,
  FiRefreshCw,
  FiKey,
  FiShield,
  FiBell,
  FiMonitor,
  FiDatabase,
  FiGlobe,
  FiUser,
  FiLock
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SettingsContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SettingsHeader = styled.div`
  margin-bottom: 30px;
`;

const SettingsTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
`;

const SettingsSubtitle = styled.p`
  font-size: 16px;
  color: #999;
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsNav = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  height: fit-content;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: ${props => props.active ? '#00ff88' : '#999'};
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  margin-bottom: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  &.active {
    background: rgba(0, 255, 136, 0.1);
    color: #00ff88;
  }
`;

const SettingsContent = styled.div`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
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

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
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

const Button = styled.button`
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #000;
  font-size: 14px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00ff88;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 30px;
`;

const InfoBox = styled.div`
  background: rgba(0, 136, 255, 0.1);
  border: 1px solid #0088ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #0088ff;
  margin: 0 0 8px 0;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #999;
  margin: 0;
  line-height: 1.4;
`;

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Security Recon Tool',
    siteDescription: 'Advanced web security reconnaissance platform',
    timezone: 'UTC',
    language: 'en',
    
    // Security Settings
    enableCORS: true,
    enableXSS: true,
    enableSecrets: true,
    enableSubdomains: true,
    enableS3Buckets: true,
    enablePortScan: true,
    maxScanDuration: 300,
    concurrentScans: 5,
    
    // Notification Settings
    emailNotifications: true,
    webhookNotifications: false,
    webhookUrl: '',
    notificationEmail: '',
    
    // API Settings
    apiRateLimit: 100,
    apiKeyExpiry: 30,
    enableCORS: true,
    
    // Database Settings
    dbHost: 'localhost',
    dbPort: 27017,
    dbName: 'recon-tool',
    dbUser: '',
    dbPassword: '',
    
    // Scan Settings
    defaultScanType: 'full',
    autoCleanup: true,
    cleanupDays: 30,
    enableScheduling: false
  });

  const [loading, setLoading] = useState(false);

  const sections = [
    { id: 'general', label: 'General', icon: <FiSettings /> },
    { id: 'security', label: 'Security', icon: <FiShield /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell /> },
    { id: 'api', label: 'API', icon: <FiKey /> },
    { id: 'database', label: 'Database', icon: <FiDatabase /> },
    { id: 'scans', label: 'Scans', icon: <FiMonitor /> }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      toast.success('Settings reset to default');
    }
  };

  const renderGeneralSettings = () => (
    <div>
      <FormGroup>
        <Label>Site Name</Label>
        <Input
          type="text"
          value={settings.siteName}
          onChange={(e) => handleSettingChange('siteName', e.target.value)}
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Site Description</Label>
        <TextArea
          value={settings.siteDescription}
          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
          placeholder="Enter site description..."
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Timezone</Label>
        <Select
          value={settings.timezone}
          onChange={(e) => handleSettingChange('timezone', e.target.value)}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
        </Select>
      </FormGroup>
      
      <FormGroup>
        <Label>Language</Label>
        <Select
          value={settings.language}
          onChange={(e) => handleSettingChange('language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </Select>
      </FormGroup>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      <InfoBox>
        <InfoTitle>Security Configuration</InfoTitle>
        <InfoText>
          Configure which security checks to perform during scans. 
          Disabling certain checks may reduce scan time but may miss important vulnerabilities.
        </InfoText>
      </InfoBox>
      
      <CheckboxGroup>
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enableCORS}
            onChange={(e) => handleSettingChange('enableCORS', e.target.checked)}
          />
          <span>Enable CORS misconfiguration detection</span>
        </CheckboxItem>
        
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enableXSS}
            onChange={(e) => handleSettingChange('enableXSS', e.target.checked)}
          />
          <span>Enable XSS vulnerability detection</span>
        </CheckboxItem>
        
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enableSecrets}
            onChange={(e) => handleSettingChange('enableSecrets', e.target.checked)}
          />
          <span>Enable secrets and API key detection</span>
        </CheckboxItem>
        
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enableSubdomains}
            onChange={(e) => handleSettingChange('enableSubdomains', e.target.checked)}
          />
          <span>Enable subdomain enumeration</span>
        </CheckboxItem>
        
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enableS3Buckets}
            onChange={(e) => handleSettingChange('enableS3Buckets', e.target.checked)}
          />
          <span>Enable S3 bucket discovery</span>
        </CheckboxItem>
        
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enablePortScan}
            onChange={(e) => handleSettingChange('enablePortScan', e.target.checked)}
          />
          <span>Enable port scanning</span>
        </CheckboxItem>
      </CheckboxGroup>
      
      <FormGroup>
        <Label>Maximum Scan Duration (seconds)</Label>
        <Input
          type="number"
          value={settings.maxScanDuration}
          onChange={(e) => handleSettingChange('maxScanDuration', parseInt(e.target.value))}
          min="60"
          max="3600"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Concurrent Scans</Label>
        <Input
          type="number"
          value={settings.concurrentScans}
          onChange={(e) => handleSettingChange('concurrentScans', parseInt(e.target.value))}
          min="1"
          max="20"
        />
      </FormGroup>
    </div>
  );

  const renderNotificationSettings = () => (
    <div>
      <FormGroup>
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
          />
          <span>Enable email notifications</span>
        </CheckboxItem>
      </FormGroup>
      
      <FormGroup>
        <Label>Notification Email</Label>
        <Input
          type="email"
          value={settings.notificationEmail}
          onChange={(e) => handleSettingChange('notificationEmail', e.target.value)}
          placeholder="admin@example.com"
        />
      </FormGroup>
      
      <FormGroup>
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.webhookNotifications}
            onChange={(e) => handleSettingChange('webhookNotifications', e.target.checked)}
          />
          <span>Enable webhook notifications</span>
        </CheckboxItem>
      </FormGroup>
      
      <FormGroup>
        <Label>Webhook URL</Label>
        <Input
          type="url"
          value={settings.webhookUrl}
          onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
        />
      </FormGroup>
    </div>
  );

  const renderAPISettings = () => (
    <div>
      <FormGroup>
        <Label>API Rate Limit (requests per 15 minutes)</Label>
        <Input
          type="number"
          value={settings.apiRateLimit}
          onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
          min="10"
          max="1000"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>API Key Expiry (days)</Label>
        <Input
          type="number"
          value={settings.apiKeyExpiry}
          onChange={(e) => handleSettingChange('apiKeyExpiry', parseInt(e.target.value))}
          min="1"
          max="365"
        />
      </FormGroup>
      
      <FormGroup>
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enableCORS}
            onChange={(e) => handleSettingChange('enableCORS', e.target.checked)}
          />
          <span>Enable CORS for API endpoints</span>
        </CheckboxItem>
      </FormGroup>
    </div>
  );

  const renderDatabaseSettings = () => (
    <div>
      <FormGroup>
        <Label>Database Host</Label>
        <Input
          type="text"
          value={settings.dbHost}
          onChange={(e) => handleSettingChange('dbHost', e.target.value)}
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Database Port</Label>
        <Input
          type="number"
          value={settings.dbPort}
          onChange={(e) => handleSettingChange('dbPort', parseInt(e.target.value))}
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Database Name</Label>
        <Input
          type="text"
          value={settings.dbName}
          onChange={(e) => handleSettingChange('dbName', e.target.value)}
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Database User</Label>
        <Input
          type="text"
          value={settings.dbUser}
          onChange={(e) => handleSettingChange('dbUser', e.target.value)}
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Database Password</Label>
        <Input
          type="password"
          value={settings.dbPassword}
          onChange={(e) => handleSettingChange('dbPassword', e.target.value)}
        />
      </FormGroup>
    </div>
  );

  const renderScanSettings = () => (
    <div>
      <FormGroup>
        <Label>Default Scan Type</Label>
        <Select
          value={settings.defaultScanType}
          onChange={(e) => handleSettingChange('defaultScanType', e.target.value)}
        >
          <option value="full">Full Scan</option>
          <option value="quick">Quick Scan</option>
          <option value="custom">Custom Scan</option>
        </Select>
      </FormGroup>
      
      <FormGroup>
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.autoCleanup}
            onChange={(e) => handleSettingChange('autoCleanup', e.target.checked)}
          />
          <span>Enable automatic cleanup of old scans</span>
        </CheckboxItem>
      </FormGroup>
      
      <FormGroup>
        <Label>Cleanup After (days)</Label>
        <Input
          type="number"
          value={settings.cleanupDays}
          onChange={(e) => handleSettingChange('cleanupDays', parseInt(e.target.value))}
          min="1"
          max="365"
        />
      </FormGroup>
      
      <FormGroup>
        <CheckboxItem>
          <Checkbox
            type="checkbox"
            checked={settings.enableScheduling}
            onChange={(e) => handleSettingChange('enableScheduling', e.target.checked)}
          />
          <span>Enable scheduled scans</span>
        </CheckboxItem>
      </FormGroup>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'api': return renderAPISettings();
      case 'database': return renderDatabaseSettings();
      case 'scans': return renderScanSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <SettingsContainer>
      <SettingsHeader>
        <SettingsTitle>Settings</SettingsTitle>
        <SettingsSubtitle>Configure your security reconnaissance tool</SettingsSubtitle>
      </SettingsHeader>

      <SettingsGrid>
        <SettingsNav>
          {sections.map((section) => (
            <NavItem
              key={section.id}
              active={activeSection === section.id}
              onClick={() => setActiveSection(section.id)}
            >
              {section.icon}
              {section.label}
            </NavItem>
          ))}
        </SettingsNav>

        <SettingsContent>
          <SectionTitle>
            {sections.find(s => s.id === activeSection)?.icon}
            {sections.find(s => s.id === activeSection)?.label} Settings
          </SectionTitle>
          
          {renderSectionContent()}
          
          <ButtonGroup>
            <Button onClick={handleSave} disabled={loading}>
              <FiSave />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
            <SecondaryButton onClick={handleReset}>
              <FiRefreshCw />
              Reset to Default
            </SecondaryButton>
          </ButtonGroup>
        </SettingsContent>
      </SettingsGrid>
    </SettingsContainer>
  );
};

export default SettingsPage;
