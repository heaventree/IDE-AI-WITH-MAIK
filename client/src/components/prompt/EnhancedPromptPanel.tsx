import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAI } from '@/hooks/useAI';
import { useProject } from '@/contexts/ProjectContext';
import { usePromptManager } from '@/hooks/usePromptManager';

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
  CreditCard,
  Code,
  Wrench,
  Eye,
  History,
  Lightbulb,
  FileText
} from 'lucide-react';

interface EnhancedPromptPanelProps {
  username?: string;
  onSubmit?: (prompt: string) => void;
  onReturn?: () => void;
}

const EnhancedPromptPanel: React.FC<EnhancedPromptPanelProps> = ({
  username = 'User',
  onSubmit,
  onReturn
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Coder');
  const [selectedModel, setSelectedModel] = useState('GPT-4');
  const [activeTab, setActiveTab] = useState('prompt');
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { projectState } = useProject();
  
  // Initialize AI hook
  const { messages, isProcessing, sendQuery, clearMessages } = useAI();
  
  // Initialize prompt manager
  const { getAvailableTemplates, createPrompt, estimateTokenCount } = usePromptManager();
  const templates = getAvailableTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState('standard');
  const [tokenCount, setTokenCount] = useState(0);
  
  // Update token count when prompt changes
  useEffect(() => {
    const count = estimateTokenCount(prompt);
    setTokenCount(count);
  }, [prompt, estimateTokenCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please enter a prompt before submitting.',
        variant: 'destructive'
      });
      return;
    }
    
    if (onSubmit) {
      onSubmit(prompt);
    } else {
      // Process the prompt using the AI hook
      await sendQuery(prompt, selectedAgent as any, selectedModel as any);
      
      // For demo purposes, switch to the response tab
      setActiveTab('response');
    }
  };

  const promptTemplates = [
    { 
      id: 'app-template', 
      name: 'Create an app', 
      template: 'Create a [type] app that [functionality]. It should include [features].',
      icon: <FileCode className="h-5 w-5" /> 
    },
    { 
      id: 'feature-template', 
      name: 'Add a feature', 
      template: 'Add a [feature] to my app that allows users to [functionality].',
      icon: <Lightbulb className="h-5 w-5" /> 
    },
    { 
      id: 'debug-template', 
      name: 'Debug an issue', 
      template: 'Debug this issue: [describe problem]. The error message is: [error message].',
      icon: <Wrench className="h-5 w-5" /> 
    },
    { 
      id: 'optimize-template', 
      name: 'Optimize code', 
      template: 'Optimize this [language] code for [performance/readability/maintainability]: [paste code or describe file]',
      icon: <Code className="h-5 w-5" /> 
    },
    { 
      id: 'explain-template', 
      name: 'Explain code', 
      template: 'Explain how this [language] code works: [paste code or describe file]',
      icon: <FileText className="h-5 w-5" /> 
    },
  ];

  const recentApps = [
    {
      id: 'saas',
      name: 'AI SAAS - PM PROCESS',
      hours: 3,
      color: 'bg-indigo-600/10',
      iconColor: 'text-indigo-400',
      icon: <div className="h-5 w-5 flex items-center justify-center">
        <FileCode size={20} />
      </div>
    },
    {
      id: 'maik',
      name: 'MAIK AI CODING APP',
      hours: 5,
      color: 'bg-emerald-600/10',
      iconColor: 'text-emerald-400',
      icon: <div className="h-5 w-5 flex items-center justify-center">
        <MessageSquare size={20} />
      </div>
    },
    {
      id: 'accessweb',
      name: 'AccessWeb v9.7',
      hours: 6,
      color: 'bg-rose-600/10',
      iconColor: 'text-rose-400',
      icon: <div className="h-5 w-5 flex items-center justify-center">
        <Globe size={20} />
      </div>
    },
  ];

  return (
    <div className="h-full w-full bg-slate-900 text-white overflow-auto">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 md:p-8">
        {/* Main heading */}
        <h1 className="text-3xl font-semibold mb-4 text-center">
          Hi {username}, what would you like to build?
        </h1>

        <Tabs defaultValue="prompt" value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="prompt">New Prompt</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt" className="mt-0">
            {/* Agent and Model Selection */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-slate-300">Agent Type</label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Coder">Coder</SelectItem>
                    <SelectItem value="Debugger">Debugger</SelectItem>
                    <SelectItem value="WCAG Auditor">WCAG Auditor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-slate-300">AI Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="GPT-4">GPT-4</SelectItem>
                    <SelectItem value="Claude-3">Claude-3</SelectItem>
                    <SelectItem value="Tabby">Tabby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-slate-300">Prompt Template</label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Prompt Templates */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3 text-slate-200">Starter Templates</h2>
              <div className="flex flex-wrap gap-2">
                {promptTemplates.map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setPrompt(template.template)}
                  >
                    {template.icon}
                    <span className="ml-2">{template.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <form onSubmit={handleSubmit} className="w-full mb-6">
              <div className="mb-2 flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-300">Your Prompt</label>
                <span className="text-xs text-slate-400">~{tokenCount} tokens</span>
              </div>
              <div className="relative rounded-xl shadow-sm border border-slate-700 overflow-hidden">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create..."
                  className="w-full min-h-[200px] resize-none bg-slate-800 border-0 p-4 text-white focus-visible:ring-0 text-base outline-none"
                />
                
                {/* Floating buttons in the textarea */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-200"
                    onClick={() => {
                      toast({
                        title: "Template Applied",
                        description: "The prompt was enhanced with AI assistance",
                      });
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="mr-1">Processing...</span>
                    ) : (
                      <span className="mr-1">Submit Prompt</span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
            
            {/* Recent apps */}
            <div className="w-full mt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">Your Recent Projects</h2>
                <Button
                  variant="link"
                  size="sm"
                  className="text-indigo-400 hover:text-indigo-300 px-0"
                >
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentApps.map((app) => (
                  <Card 
                    key={app.id} 
                    className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer overflow-hidden"
                    onClick={() => {
                      setPrompt(`Continue working on the ${app.name} project. I'd like to add a new feature that...`);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`flex-shrink-0 rounded-lg p-2.5 ${app.color}`}>
                          <div className={`${app.iconColor}`}>
                            {app.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">
                            {app.name}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {app.hours} hours ago
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-slate-700 border-slate-600 text-slate-300"
                        >
                          Private
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast({
                              title: "Project Options",
                              description: `Options for ${app.name} opened`,
                            });
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
          </TabsContent>
          
          <TabsContent value="response">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 mb-4">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.slice(-2).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div 
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        <div className="text-sm mb-1 text-slate-300">
                          {msg.role === 'user' ? 'You' : msg.agent || 'Assistant'}
                        </div>
                        <div className="whitespace-pre-wrap" style={{ overflowWrap: 'break-word' }}>
                          {msg.content}
                        </div>
                        <div className="text-xs mt-2 text-slate-400">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No responses yet. Submit a prompt to get started.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                onClick={() => setActiveTab('prompt')}
              >
                New Prompt
              </Button>
              
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                  onClick={clearMessages}
                >
                  Clear History
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-white mb-4">Conversation History</h2>
              
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <Card key={msg.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant={msg.role === 'user' ? 'default' : 'outline'}
                          className={msg.role === 'user' 
                            ? 'bg-indigo-600 hover:bg-indigo-700' 
                            : 'text-slate-300 border-slate-600'
                          }
                        >
                          {msg.role === 'user' ? 'You' : msg.agent || 'Assistant'}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {msg.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap text-sm text-slate-200" style={{ overflowWrap: 'break-word' }}>
                        {msg.content.length > 150 
                          ? `${msg.content.substring(0, 150)}...` 
                          : msg.content
                        }
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-lg">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversation history yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedPromptPanel;