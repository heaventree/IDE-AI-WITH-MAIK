import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

// Icons
import { ArrowRight, MessageSquare, Calculator, Wallet } from 'lucide-react';

interface PromptPanelProps {
  username?: string;
  onSubmit?: (prompt: string) => void;
  onReturn?: () => void;
}

const PromptPanel: React.FC<PromptPanelProps> = ({
  username = 'there',
  onSubmit,
  onReturn
}) => {
  const [prompt, setPrompt] = useState('');
  const [location, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(prompt);
    } else {
      console.log('Prompt submitted:', prompt);
      // In a real implementation, we would process the prompt here
      if (onReturn) {
        onReturn();
      }
    }
  };

  const templates = [
    { 
      id: 'ai-chat', 
      name: 'AI chat', 
      icon: <MessageSquare className="h-5 w-5 text-sky-500" /> 
    },
    { 
      id: 'calculator', 
      name: 'Statistical significance calculator', 
      icon: <Calculator className="h-5 w-5 text-emerald-500" /> 
    },
    { 
      id: 'wallet', 
      name: 'Wallet website', 
      icon: <Wallet className="h-5 w-5 text-violet-500" /> 
    },
  ];

  const recentApps = [
    {
      id: 'saas',
      name: 'AI SAAS - PM PROCESS',
      hours: 3,
      icon: <div className="bg-sky-900 p-2 rounded">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-sky-400">
          <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="2" />
          <path d="M19 3h-3a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    },
    {
      id: 'maik',
      name: 'MAIK AI CODING APP',
      hours: 5,
      icon: <div className="bg-emerald-900 p-2 rounded">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-emerald-400">
          <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    },
    {
      id: 'accessweb',
      name: 'AccessWeb v9.7',
      hours: 6,
      icon: <div className="bg-purple-900 p-2 rounded">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-purple-400">
          <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    },
  ];

  return (
    <div className="h-full w-full bg-slate-900 text-white p-6 overflow-auto flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Hi {username}, what do you want to make?
        </h1>

        {/* Prompt input */}
        <form onSubmit={handleSubmit} className="w-full mb-8">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe an app or site you want to create..."
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute bottom-3 right-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded">
                Start building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>

        {/* Templates */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
              onClick={() => console.log(`Selected template: ${template.name}`)}
            >
              {template.icon}
              <span className="ml-2">{template.name}</span>
            </Button>
          ))}
        </div>

        {/* Recent apps */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Your recent Apps</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => console.log('View all apps clicked')}
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentApps.map((app) => (
              <Card key={app.id} className="bg-slate-800 border-slate-700 p-4 hover:bg-slate-750 cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {app.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{app.name}</span>
                    <span className="text-gray-400 text-sm">{app.hours} hours ago</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Private</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-1 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Options for ${app.name} clicked`);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;