import React, { useEffect, useState } from 'react';
import { 
  Zap, Clock, GitBranch, Circle, 
  FileCode, Bell, Wifi, Cpu, 
  CheckCircle, Terminal
} from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface StatusBarProps {
  // Add props as needed
}

interface StatusItemProps {
  icon: React.ReactNode;
  text: string;
  title?: string;
  className?: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ icon, text, title, className = '' }) => (
  <div className={`statusbar-item ${className}`} title={title}>
    <span className="statusbar-item-icon">{icon}</span>
    <span>{text}</span>
  </div>
);

const StatusBar: React.FC<StatusBarProps> = () => {
  const { connected } = useWebSocket();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <>
      {/* Left status items */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
          <Circle size={8} style={{ marginRight: '4px' }} fill={connected ? '#0dcb97' : 'none'} color={connected ? '#0dcb97' : '#7a7e96'} />
          <span style={{ color: connected ? '#0dcb97' : '#7a7e96' }}>{connected ? 'Connected' : 'Disconnected'}</span>
        </span>
        
        <span style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
          <Zap size={12} style={{ marginRight: '4px' }} />
          <span>Ready</span>
        </span>
        
        <span style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
          <FileCode size={12} style={{ marginRight: '4px' }} />
          <span>TypeScript</span>
        </span>
        
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Terminal size={12} style={{ marginRight: '4px' }} />
          <span>main.ts</span>
        </span>
      </div>
      
      {/* Right status items */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
          <GitBranch size={12} style={{ marginRight: '4px' }} />
          <span>main</span>
        </span>
        
        <span style={{ display: 'flex', alignItems: 'center', marginRight: '12px' }}>
          <Cpu size={12} style={{ marginRight: '4px' }} />
          <span>98%</span>
        </span>
        
        <span style={{ display: 'flex', alignItems: 'center', marginRight: '12px', color: '#0dcb97' }}>
          <CheckCircle size={12} style={{ marginRight: '4px' }} />
          <span>All good</span>
        </span>
        
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <Clock size={12} style={{ marginRight: '4px' }} />
          <span>{time}</span>
        </span>
      </div>
    </>
  );
};

export default StatusBar;