import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiBookmark,
  FiCopy,
  FiDownload,
  FiCode,
  FiShield,
  FiEye,
  FiTarget,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const BookmarkletContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const BookmarkletHeader = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const BookmarkletTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px 0;
`;

const BookmarkletSubtitle = styled.p`
  font-size: 16px;
  color: #999;
  margin: 0;
`;

const BookmarkletCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
`;

const BookmarkletCode = styled.div`
  background: #0c0c0c;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  overflow-x: auto;
  position: relative;
`;

const CodeHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 15px;
`;

const CodeTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #00ff88;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CopyButton = styled.button`
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  border-radius: 6px;
  padding: 8px 16px;
  color: #00ff88;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 255, 136, 0.2);
  }
`;

const CodeContent = styled.pre`
  color: #00ff88;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
`;

const BookmarkletButton = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #000;
  text-decoration: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s;
  margin: 20px 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 136, 0.3);
  }
`;

const InstructionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const InstructionCard = styled(motion.div)`
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

const InstructionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const InstructionIcon = styled.div`
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

const InstructionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const InstructionDescription = styled.p`
  font-size: 14px;
  color: #999;
  margin: 0;
  line-height: 1.5;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.8);
  border: 1px solid #333;
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: #00ff88;
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: ${props => props.bgColor || 'rgba(0, 255, 136, 0.1)'};
  color: ${props => props.color || '#00ff88'};
  margin-bottom: 12px;
`;

const FeatureTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
`;

const FeatureDescription = styled.p`
  font-size: 12px;
  color: #999;
  margin: 0;
  line-height: 1.4;
`;

const AlertBox = styled.div`
  background: rgba(255, 170, 0, 0.1);
  border: 1px solid #ffaa00;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const AlertIcon = styled.div`
  color: #ffaa00;
  font-size: 20px;
  margin-top: 2px;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #ffaa00;
  margin: 0 0 4px 0;
`;

const AlertText = styled.p`
  font-size: 13px;
  color: #999;
  margin: 0;
  line-height: 1.4;
`;

const BookmarkletPage = () => {
  const [bookmarkletCode] = useState(`javascript:(function(){
    const regex=/["'`](\/[a-zA-Z0-9_\-/=?&%.#:]+)[%22'%60]/g,paramRegex=/[?&]([a-zA-Z0-9_]+)=/g,results=new%20Set(),params=new%20Set(),features=new%20Set([%22debug%22,%22beta%22,%22internal%22,%22test%22,%22dev%22,%22staging%22,%22private%22,%22v1%22,%22v2%22,%22alpha%22]),fileExts=new%20Set([%22json%22,%22config%22,%22xml%22,%22bak%22,%22log%22,%22txt%22,%22yml%22,%22yaml%22,%22conf%22,%22ini%22]);
    function%20processText(txt){
      let%20e;
      while((e=regex.exec(txt))!==null){
        results.add(e[1]);
      }
      let%20p;
      while((p=paramRegex.exec(txt))!==null){
        params.add(p[1]);
      }
    }
    processText(document.documentElement.outerHTML);
    let%20promises=[...document.getElementsByTagName(%22script%22)].filter(s=%3Es.src).map(s=%3Efetch(s.src).then(r=%3Er.text()).then(t=%3EprocessText(t)).catch(()=%3E{}));
    Promise.all(promises).then(()=%3E{
      let%20old=document.getElementById(%22reconPanel%22);
      if(old)old.remove();
      let%20panel=document.createElement(%22div%22);
      panel.id=%22reconPanel%22;
      panel.style=%22position:fixed;top:20px;right:20px;width:700px;height:80%;background:#1a1a1a;color:#0f0;border:2px%20solid%20#0f0;border-radius:8px;padding:10px;font:14px%20monospace;z-index:999999;overflow-y:auto;box-shadow:0%200%2010px%20rgba(0,255,0,0.5);%22;
      let%20header=document.createElement(%22div%22);
      header.innerHTML=%22%3Cb%20style='color:cyan;font-size:16px'%3E%F0%9F%94%8E%20JS%20Recon%20Enhanced%3C/b%3E%3Cbr%3E%3Cinput%20id='reconSearch'%20placeholder='Search%20endpoints/params...'%20style='width:200px;margin:5px;padding:5px;color:#0f0;background:#333;border:1px%20solid%20#0f0;'%3E%22;
      let%20btns=document.createElement(%22div%22);
      btns.style=%22margin-bottom:10px;%22;
      let%20copyBtn=document.createElement(%22button%22);
      copyBtn.textContent=%22Copy%20All%22;
      copyBtn.style=%22margin-right:5px;background:#0f0;color:#000;padding:5px%2010px;border:none;border-radius:4px;cursor:pointer;%22;
      copyBtn.onclick=()=%3Enavigator.clipboard.writeText([...results].join(%22\n%22));
      let%20exportBtn=document.createElement(%22button%22);
      exportBtn.textContent=%22Export%20JSON%22;
      exportBtn.style=%22margin-right:5px;background:#0f0;color:#000;padding:5px%2010px;border:none;border-radius:4px;cursor:pointer;%22;
      exportBtn.onclick=()=%3E{
        let%20data={endpoints:[...results],params:[...params],timestamp:new%20Date().toISOString()};
        let%20a=document.createElement(%22a%22);
        a.href=URL.createObjectURL(new%20Blob([JSON.stringify(data,null,2)],{type:%22application/json%22}));
        a.download=%22recon_results.json%22;
        a.click();
      };
      let%20closeBtn=document.createElement(%22button%22);
      closeBtn.textContent=%22Close%22;
      closeBtn.style=%22background:#f00;color:#fff;padding:5px%2010px;border:none;border-radius:4px;cursor:pointer;%22;
      closeBtn.onclick=()=%3Epanel.remove();
      btns.append(copyBtn,exportBtn,closeBtn);
      panel.append(header,btns);
      function%20addSec(title,items,filterFn=x=%3Ex){
        let%20d=document.createElement(%22div%22);
        let%20h=document.createElement(%22h3%22);
        h.style=%22color:yellow;cursor:pointer;margin:5px%200;%22;
        h.textContent=title+%60%20(${items.length})%60;
        let%20c=document.createElement(%22div%22);
        c.style=%22display:none;padding-left:10px;%22;
        h.onclick=()=%3Ec.style.display=c.style.display===%22none%22?%22block%22:%22none%22;
        c.innerHTML=items.length?items.filter(filterFn).map(x=%3E%60%3Cdiv%20style=%22word-break:break-all;%22%3E${x}%3C/div%3E%60).join(%22%22):%22%3Ci%3ENone%3C/i%3E%22;
        d.append(h,c);
        panel.appendChild(d);
      }
      let%20arr=[...results],search=document.getElementById(%22reconSearch%22);
      let%20updateFilter=()=%3E{
        let%20q=search.value.toLowerCase();
        addSec(%22All%20Endpoints%22,arr,x=%3Ex.toLowerCase().includes(q));
        addSec(%22API%20Endpoints%22,arr.filter(x=%3E/api/i.test(x)),x=%3Ex.toLowerCase().includes(q));
        addSec(%22Admin%20Paths%22,arr.filter(x=%3E/(admin|dashboard|manage|panel|login|auth)/i.test(x)),x=%3Ex.toLowerCase().includes(q));
        addSec(%22Files%22,arr.filter(x=%3EfileExts.has(x.split(%22.%22).pop()?.toLowerCase())),x=%3Ex.toLowerCase().includes(q));
        addSec(%22Feature%20Flags%22,arr.filter(x=%3Efeatures.has(x.split(%22/%22).pop()?.toLowerCase())||[...features].some(f=%3Ex.toLowerCase().includes(f))),x=%3Ex.toLowerCase().includes(q));
        addSec(%22Parameters%22,[...params],x=%3Ex.toLowerCase().includes(q));
      };
      search=document.createElement(%22input%22);
      search.id=%22reconSearch%22;
      search.placeholder=%22Search%20endpoints/params...%22;
      search.style=%22width:200px;margin:5px;padding:5px;color:#0f0;background:#333;border:1px%20solid%20#0f0;%22;
      search.oninput=updateFilter;
      header.appendChild(search);
      updateFilter();
      document.body.appendChild(panel);
      let%20err=document.createElement(%22div%22);
      err.style=%22color:red;font-style:italic;%22;
      err.textContent=results.size===0&&params.size===0?%22No%20results%20found.%20Possible%20CORS%20or%20content%20issues.%22:%22%22;
      panel.appendChild(err);
    });
  })();`);

  const handleCopy = () => {
    toast.success('Bookmarklet code copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([bookmarkletCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-recon-bookmarklet.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Bookmarklet downloaded!');
  };

  const instructions = [
    {
      icon: <FiBookmark />,
      title: 'Copy the Bookmarklet',
      description: 'Copy the JavaScript code from the code block above to your clipboard.',
      bgColor: 'rgba(0, 136, 255, 0.1)',
      color: '#0088ff'
    },
    {
      icon: <FiCode />,
      title: 'Create Bookmark',
      description: 'Create a new bookmark in your browser and paste the code as the URL.',
      bgColor: 'rgba(255, 170, 0, 0.1)',
      color: '#ffaa00'
    },
    {
      icon: <FiTarget />,
      title: 'Visit Target Site',
      description: 'Navigate to the website you want to analyze and click the bookmarklet.',
      bgColor: 'rgba(0, 255, 136, 0.1)',
      color: '#00ff88'
    },
    {
      icon: <FiEye />,
      title: 'Analyze Results',
      description: 'Review the discovered endpoints, parameters, and security findings.',
      bgColor: 'rgba(255, 68, 68, 0.1)',
      color: '#ff4444'
    }
  ];

  const features = [
    {
      icon: <FiShield />,
      title: 'Endpoint Discovery',
      description: 'Finds all API endpoints, hidden paths, and internal routes',
      bgColor: 'rgba(0, 136, 255, 0.1)',
      color: '#0088ff'
    },
    {
      icon: <FiTarget />,
      title: 'Parameter Extraction',
      description: 'Discovers URL parameters and form fields',
      bgColor: 'rgba(255, 170, 0, 0.1)',
      color: '#ffaa00'
    },
    {
      icon: <FiCode />,
      title: 'JavaScript Analysis',
      description: 'Analyzes inline and external JavaScript files',
      bgColor: 'rgba(0, 255, 136, 0.1)',
      color: '#00ff88'
    },
    {
      icon: <FiAlertTriangle />,
      title: 'Security Headers',
      description: 'Checks for missing or misconfigured security headers',
      bgColor: 'rgba(255, 68, 68, 0.1)',
      color: '#ff4444'
    },
    {
      icon: <FiEye />,
      title: 'Feature Detection',
      description: 'Identifies debug flags, admin panels, and sensitive paths',
      bgColor: 'rgba(136, 68, 255, 0.1)',
      color: '#8844ff'
    },
    {
      icon: <FiCheckCircle />,
      title: 'Export Results',
      description: 'Export findings in JSON format for further analysis',
      bgColor: 'rgba(0, 255, 136, 0.1)',
      color: '#00ff88'
    }
  ];

  return (
    <BookmarkletContainer>
      <BookmarkletHeader>
        <BookmarkletTitle>Security Recon Bookmarklet</BookmarkletTitle>
        <BookmarkletSubtitle>
          A powerful client-side reconnaissance tool that runs directly in your browser
        </BookmarkletSubtitle>
      </BookmarkletHeader>

      <BookmarkletCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CodeHeader>
          <CodeTitle>
            <FiCode />
            Bookmarklet Code
          </CodeTitle>
          <div style={{ display: 'flex', gap: '10px' }}>
            <CopyToClipboard text={bookmarkletCode} onCopy={handleCopy}>
              <CopyButton>
                <FiCopy />
                Copy
              </CopyButton>
            </CopyToClipboard>
            <CopyButton onClick={handleDownload}>
              <FiDownload />
              Download
            </CopyButton>
          </div>
        </CodeHeader>
        <CodeContent>{bookmarkletCode}</CodeContent>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <BookmarkletButton href={bookmarkletCode}>
            <FiBookmark style={{ marginRight: '8px' }} />
            Drag to Bookmarks Bar
          </BookmarkletButton>
        </div>
      </BookmarkletCard>

      <AlertBox>
        <AlertIcon>
          <FiInfo />
        </AlertIcon>
        <AlertContent>
          <AlertTitle>Important Security Notice</AlertTitle>
          <AlertText>
            This bookmarklet is designed for authorized security testing only. 
            Only use it on websites you own or have explicit permission to test. 
            Unauthorized testing may violate laws and terms of service.
          </AlertText>
        </AlertContent>
      </AlertBox>

      <InstructionsGrid>
        {instructions.map((instruction, index) => (
          <InstructionCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <InstructionHeader>
              <InstructionIcon bgColor={instruction.bgColor} color={instruction.color}>
                {instruction.icon}
              </InstructionIcon>
              <InstructionTitle>{instruction.title}</InstructionTitle>
            </InstructionHeader>
            <InstructionDescription>{instruction.description}</InstructionDescription>
          </InstructionCard>
        ))}
      </InstructionsGrid>

      <BookmarkletCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>
          Features
        </h2>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.05 }}
            >
              <FeatureIcon bgColor={feature.bgColor} color={feature.color}>
                {feature.icon}
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </BookmarkletCard>
    </BookmarkletContainer>
  );
};

export default BookmarkletPage;
