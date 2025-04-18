import React, { useState, useEffect } from 'react';
import EnhancedPromptPanel from '@/components/prompt/EnhancedPromptPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { usePromptManager } from '@/hooks/usePromptManager';
import { PromptInput, PromptContext, PromptResult } from '@/types/prompt';
import { MessageSquare, Share2, FileCode, ThumbsUp } from 'lucide-react';
import PromptSystemLayout from '@/components/prompt/PromptSystemLayout';

const PromptSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('panel');
  const [input, setInput] = useState<PromptInput>({
    query: 'Create a React component that shows a progress bar with percentage',
    systemMessage: 'You are an expert React developer who writes clean, reusable components.',
    agent: 'Coder',
    language: 'typescript',
    outputFormat: 'jsx'
  });
  
  const [context, setContext] = useState<PromptContext>({
    history: [
      { role: 'user', content: 'How do I create a custom hook in React?' },
      { role: 'assistant', content: 'Custom hooks are functions that start with "use" and can call other hooks. They let you extract component logic into reusable functions.' }
    ],
    codeSnippets: [
      {
        language: 'tsx',
        code: `import React from 'react';\n\ninterface ButtonProps {\n  variant?: 'primary' | 'secondary';\n  children: React.ReactNode;\n}\n\nconst Button: React.FC<ButtonProps> = ({ variant = 'primary', children }) => {\n  return (\n    <button className={\`btn btn-\${variant}\`}>\n      {children}\n    </button>\n  );\n};`,
        path: 'src/components/Button.tsx'
      }
    ],
    project: {
      files: ['src/components/Button.tsx', 'src/App.tsx', 'src/hooks/useCounter.ts'],
      activeFile: 'src/components/ProgressBar.tsx'
    }
  });
  
  const { createPrompt, getAvailableTemplates, estimateTokenCount } = usePromptManager();
  const [promptResult, setPromptResult] = useState<PromptResult | null>(null);
  const templates = getAvailableTemplates();
  
  const handleCreatePrompt = () => {
    const result = createPrompt(input, context);
    if (result) {
      setPromptResult(result);
    }
  };
  
  useEffect(() => {
    // Generate initial prompt on mount
    handleCreatePrompt();
  }, []);
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(prev => ({ ...prev, query: e.target.value }));
  };
  
  const handleSystemMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(prev => ({ ...prev, systemMessage: e.target.value }));
  };
  
  return (
    <PromptSystemLayout 
      title="Interactive Demo" 
      subtitle="Test the prompt management system with real examples"
    >
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Prompt Management System</h1>
            <p className="text-slate-400 text-lg">
              A powerful, template-based system for optimizing AI prompts
            </p>
          </header>
          
          <Tabs defaultValue="panel" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="panel">Prompt UI</TabsTrigger>
              <TabsTrigger value="demo">Template Demo</TabsTrigger>
              <TabsTrigger value="docs">Documentation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="panel" className="mt-0">
              <EnhancedPromptPanel username="Developer" />
            </TabsContent>
            
            <TabsContent value="demo" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-6">
                  <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle>Prompt Input</CardTitle>
                      <CardDescription className="text-slate-400">
                        Configure the input for your prompt
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">User Query</label>
                        <Textarea 
                          value={input.query} 
                          onChange={handleQueryChange}
                          className="w-full min-h-[120px] resize-none bg-slate-900 border-slate-700 text-white"
                          placeholder="Enter your query here..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">System Message</label>
                        <Textarea 
                          value={input.systemMessage} 
                          onChange={handleSystemMessageChange}
                          className="w-full min-h-[80px] resize-none bg-slate-900 border-slate-700 text-white"
                          placeholder="Enter system message here..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">Agent</label>
                          <select 
                            value={input.agent} 
                            onChange={(e) => setInput(prev => ({ ...prev, agent: e.target.value }))}
                            className="w-full p-2 rounded-md bg-slate-900 border-slate-700 text-white"
                          >
                            <option value="Coder">Coder</option>
                            <option value="Debugger">Debugger</option>
                            <option value="WCAG Auditor">WCAG Auditor</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-slate-300">Language</label>
                          <select 
                            value={input.language} 
                            onChange={(e) => setInput(prev => ({ ...prev, language: e.target.value }))}
                            className="w-full p-2 rounded-md bg-slate-900 border-slate-700 text-white"
                          >
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="rust">Rust</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={handleCreatePrompt}>
                        Generate Prompt
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle>Available Templates</CardTitle>
                      <CardDescription className="text-slate-400">
                        The system will automatically select the best template
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {templates.map(template => (
                          <div 
                            key={template.id} 
                            className={`p-3 rounded-lg border ${
                              promptResult?.templateUsed === template.id 
                                ? 'border-indigo-500 bg-indigo-900/20' 
                                : 'border-slate-700 bg-slate-900/50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-white">{template.name}</h3>
                                <p className="text-sm text-slate-400">{template.description}</p>
                              </div>
                              {promptResult?.templateUsed === template.id && (
                                <div className="bg-indigo-600 text-white text-xs p-1 px-2 rounded-full">
                                  Selected
                                </div>
                              )}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {template.tags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Output Section */}
                <div className="space-y-6">
                  <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle>Generated Prompt</CardTitle>
                      <CardDescription className="text-slate-400">
                        {promptResult && (
                          <div className="flex items-center gap-2 mt-1">
                            <span>Using {promptResult.templateUsed} template • </span>
                            <span>{promptResult.estimatedTokens} tokens</span>
                            {promptResult.truncated && (
                              <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-400/20">
                                Truncated
                              </span>
                            )}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 min-h-[400px] max-h-[600px] overflow-y-auto">
                        <pre className="text-slate-300 whitespace-pre-wrap" style={{ overflowWrap: 'break-word' }}>
                          {promptResult?.prompt || 'No prompt generated yet.'}
                        </pre>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-slate-300 border-slate-700">
                        <Share2 className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" className="text-slate-300 border-slate-700">
                        <FileCode className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700 text-white">
                    <CardHeader>
                      <CardTitle>Prompt Analysis</CardTitle>
                      <CardDescription className="text-slate-400">
                        Insights about the generated prompt
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {promptResult ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                              <div className="text-sm text-slate-400 mb-1">Template Used</div>
                              <div className="text-white font-medium">{promptResult.templateUsed}</div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                              <div className="text-sm text-slate-400 mb-1">Token Count</div>
                              <div className="text-white font-medium">{promptResult.estimatedTokens} tokens</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                              <div className="text-sm text-slate-400 mb-1">Context Included</div>
                              <div className="text-white font-medium">
                                {promptResult.metadata.contextIncluded ? 'Yes' : 'No'}
                              </div>
                            </div>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                              <div className="text-sm text-slate-400 mb-1">History</div>
                              <div className="text-white font-medium">
                                {promptResult.metadata.historyIncluded 
                                  ? promptResult.metadata.historyTruncated
                                    ? `Truncated (${promptResult.metadata.contextSize} msgs)`
                                    : 'Full'
                                  : 'None'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-slate-300 mb-2">Improvements</h3>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-400 mt-0.5" />
                                <span className="text-sm text-slate-300">Optimized for the specified programming language</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-400 mt-0.5" />
                                <span className="text-sm text-slate-300">Context-aware with relevant code snippets</span>
                              </li>
                              {promptResult.metadata.historyTruncated && (
                                <li className="flex items-start gap-2">
                                  <ThumbsUp className="h-4 w-4 text-green-400 mt-0.5" />
                                  <span className="text-sm text-slate-300">History optimized to reduce token usage</span>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Generate a prompt to see the analysis</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="docs" className="mt-0">
              <Card className="bg-slate-800 border-slate-700 text-white">
                <CardHeader>
                  <CardTitle>Prompt Management System Documentation</CardTitle>
                  <CardDescription className="text-slate-400">
                    Learn how to use the prompt management system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Overview</h2>
                    <p className="text-slate-300">
                      The Prompt Management System provides a powerful way to construct optimized prompts for large language models. 
                      It uses templates to format prompts appropriately for different use cases, optimizes context to fit within token 
                      limits, and intelligently selects the best template based on the content.
                    </p>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Key Features</h2>
                    <ul className="list-disc pl-5 space-y-2 text-slate-300">
                      <li><strong>Template-based formatting:</strong> Multiple templates for different use cases</li>
                      <li><strong>Token optimization:</strong> Ensures prompts fit within model context windows</li>
                      <li><strong>Dynamic context inclusion:</strong> Intelligent inclusion of relevant context</li>
                      <li><strong>Function calling support:</strong> Specialized templates for tool usage</li>
                      <li><strong>Code optimization:</strong> Special handling for code-related prompts</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Available Templates</h2>
                    <div className="space-y-4">
                      {templates.map(template => (
                        <div key={template.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <h3 className="font-medium text-white mb-1">{template.name}</h3>
                          <p className="text-sm text-slate-400 mb-2">{template.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {template.tags.map(tag => (
                              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-2">How to Use</h2>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                      <pre className="text-slate-300 whitespace-pre-wrap">
{`// Import the hook
import { usePromptManager } from '@/hooks/usePromptManager';

// Use in your component
const { createPrompt } = usePromptManager();

// Create a prompt
const result = createPrompt(
  { 
    query: 'Create a button component',
    agent: 'Coder',
    language: 'typescript' 
  },
  { 
    history: [], 
    project: { files: ['App.tsx'] }
  }
);

// Use the generated prompt
console.log(result.prompt);`}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PromptSystemLayout>
  );
};

export default PromptSystemDemo;