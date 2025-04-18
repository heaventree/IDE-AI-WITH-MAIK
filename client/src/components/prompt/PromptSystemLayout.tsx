import React, { useState } from 'react';
import { Link } from 'wouter';
import PromptSidebar from './PromptSidebar';
import { Button } from '@/components/ui/button';
import { Home, ChevronLeft } from 'lucide-react';

interface PromptSystemLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const PromptSystemLayout: React.FC<PromptSystemLayoutProps> = ({ 
  children, 
  title = 'Prompt Management System',
  subtitle = 'A sophisticated system for optimizing AI prompts'
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Top header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2 text-slate-400 hover:text-white">
              <ChevronLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-400 ml-4 hidden md:block">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
              <Home size={16} className="mr-2" />
              Back to IDE
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <PromptSidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={toggleSidebar} 
        />
        
        {/* Main content area */}
        <div className={`flex-1 overflow-auto transition-all duration-200`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PromptSystemLayout;