import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Icons
import { 
  ArrowRight, 
  MessageSquare, 
  Calculator, 
  Wallet, 
  Sparkles, 
  Link2, 
  Globe,
  FileCode,
  CreditCard
} from 'lucide-react';

interface PromptPanelProps {
  username?: string;
  onSubmit?: (prompt: string) => void;
  onReturn?: () => void;
}

const PromptPanel: React.FC<PromptPanelProps> = ({
  username = 'Sean',
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
      icon: <MessageSquare className="h-5 w-5" /> 
    },
    { 
      id: 'calculator', 
      name: 'Statistical significance calculator', 
      icon: <Calculator className="h-5 w-5" /> 
    },
    { 
      id: 'wallet', 
      name: 'Wallet website', 
      icon: <CreditCard className="h-5 w-5" /> 
    },
  ];

  const recentApps = [
    {
      id: 'saas',
      name: 'AI SAAS - PM PROCESS',
      hours: 3,
      color: 'bg-indigo-600/10',
      iconColor: 'text-indigo-500',
      icon: <FileCode />
    },
    {
      id: 'maik',
      name: 'MAIK AI CODING APP',
      hours: 5,
      color: 'bg-emerald-600/10',
      iconColor: 'text-emerald-500',
      icon: <MessageSquare />
    },
    {
      id: 'accessweb',
      name: 'AccessWeb v9.7',
      hours: 6,
      color: 'bg-rose-600/10',
      iconColor: 'text-rose-500',
      icon: <Globe />
    },
  ];

  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white overflow-auto">
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full p-8 md:p-12">
        {/* Main heading */}
        <h1 className="text-4xl font-semibold mb-4 text-center">
          Hi {username}, what do you want to make?
        </h1>

        {/* Prompt input */}
        <form onSubmit={handleSubmit} className="w-full mb-8 mt-6">
          <div className="relative rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe an app or site you want to create..."
              className="w-full min-h-[160px] resize-none bg-white dark:bg-slate-800 border-0 p-4 text-slate-900 dark:text-white focus-visible:ring-0 text-base outline-none"
            />
            
            {/* Floating buttons in the textarea */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-4"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                <span>Start building</span>
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
              size="sm"
              className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70"
              onClick={() => console.log(`Selected template: ${template.name}`)}
            >
              <div className="bg-slate-100 dark:bg-slate-700 rounded-full p-1 mr-2">
                {template.icon}
              </div>
              <span>{template.name}</span>
            </Button>
          ))}
        </div>

        {/* Recent apps */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-slate-900 dark:text-white">Your recent Apps</h2>
            <Button
              variant="link"
              size="sm"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-0"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentApps.map((app) => (
              <Card 
                key={app.id} 
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors cursor-pointer overflow-hidden"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className={`flex-shrink-0 rounded-lg p-2.5 ${app.color}`}>
                      <div className={`${app.iconColor}`}>
                        {app.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {app.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {app.hours} hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                    >
                      Private
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full h-7 w-7 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Options for ${app.name} clicked`);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;