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
    <div className="flex-between">
      {/* Left status items */}
      <div className="statusbar-left">
        <StatusItem 
          icon={<Circle size={8} fill={connected ? 'currentColor' : 'none'} />}
          text={connected ? 'Connected' : 'Disconnected'}
          className={connected ? 'success' : 'muted'}
        />
        
        <StatusItem 
          icon={<Zap size={12} />}
          text="Ready"
        />
        
        <StatusItem 
          icon={<FileCode size={12} />}
          text="TypeScript"
        />
        
        <StatusItem 
          icon={<Terminal size={12} />}
          text="main.ts"
        />
      </div>
      
      {/* Right status items */}
      <div className="statusbar-right">
        <StatusItem 
          icon={<GitBranch size={12} />}
          text="main"
          title="Git branch"
        />
        
        <StatusItem 
          icon={<Cpu size={12} />}
          text="98%"
          title="Performance: 98% efficient"
        />
        
        <StatusItem 
          icon={<CheckCircle size={12} color="#0acf97" />}
          text="All good"
          title="All systems normal"
          className="success"
        />
        
        <StatusItem 
          icon={<Clock size={12} />}
          text={time}
          title="Current time"
        />
      </div>
    </div>
  );
};

export default StatusBar;