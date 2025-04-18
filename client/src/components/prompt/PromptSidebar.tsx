import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  MessageSquare, 
  Code, 
  FileText, 
  Zap, 
  Settings, 
  Sparkles,
  PanelLeft,
  Bot,
  Book,
  Database,
  GitBranch,
  Feather
} from 'lucide-react';

interface PromptSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const PromptSidebar: React.FC<PromptSidebarProps> = ({ 
  collapsed = false,
  onToggleCollapse
}) => {
  const [location] = useLocation();
  
  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <div className={`h-full flex flex-col bg-slate-900 border-r border-slate-800 ${collapsed ? 'w-16' : 'w-56'} transition-all duration-200 overflow-y-auto`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-sm font-medium text-white">Prompt System</h2>
        )}
        <button 
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
          onClick={onToggleCollapse}
        >
          <PanelLeft size={16} />
        </button>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 py-4">
        <div className="px-3 pb-2">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              System
            </h3>
          )}
          <nav className="space-y-1">
            <Link href="/prompt-intro">
              <a className={`flex items-center rounded-md px-3 py-2 transition-colors ${
                isActive('/prompt-intro') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}>
                <Zap size={collapsed ? 20 : 16} className={collapsed ? 'mx-auto' : 'mr-3'} />
                {!collapsed && <span>Overview</span>}
              </a>
            </Link>
            <Link href="/prompt-system">
              <a className={`flex items-center rounded-md px-3 py-2 transition-colors ${
                isActive('/prompt-system') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}>
                <MessageSquare size={collapsed ? 20 : 16} className={collapsed ? 'mx-auto' : 'mr-3'} />
                {!collapsed && <span>Interactive Demo</span>}
              </a>
            </Link>
            <Link href="/prompt-system-standalone">
              <a className={`flex items-center rounded-md px-3 py-2 transition-colors ${
                isActive('/prompt-system-standalone') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}>
                <Sparkles size={collapsed ? 20 : 16} className={collapsed ? 'mx-auto' : 'mr-3'} />
                {!collapsed && <span>Templates</span>}
              </a>
            </Link>
          </nav>
        </div>
        
        {!collapsed && (
          <div className="mt-8 px-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Use Cases
            </h3>
            <nav className="space-y-1">
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <Code size={16} className="mr-3" />
                <span>Code Generation</span>
              </a>
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <Bot size={16} className="mr-3" />
                <span>Conversational</span>
              </a>
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <FileText size={16} className="mr-3" />
                <span>Documentation</span>
              </a>
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <Book size={16} className="mr-3" />
                <span>Knowledge Base</span>
              </a>
            </nav>
          </div>
        )}
        
        {!collapsed && (
          <div className="mt-8 px-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Advanced
            </h3>
            <nav className="space-y-1">
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <Database size={16} className="mr-3" />
                <span>Context Management</span>
              </a>
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <GitBranch size={16} className="mr-3" />
                <span>Version Control</span>
              </a>
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <Feather size={16} className="mr-3" />
                <span>Custom Templates</span>
              </a>
              <a href="#" className="flex items-center text-slate-300 hover:bg-slate-800 rounded-md px-3 py-2 transition-colors">
                <Settings size={16} className="mr-3" />
                <span>Settings</span>
              </a>
            </nav>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {!collapsed && (
        <div className="p-3 mt-auto border-t border-slate-800">
          <div className="rounded-md bg-slate-800 p-2 text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span>API Status</span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1"></span>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Model</span>
              <span className="text-emerald-400">GPT-4o</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptSidebar;