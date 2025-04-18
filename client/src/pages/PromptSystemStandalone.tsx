import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PromptManager } from '@/services/prompt/PromptManager';
import { allTemplates } from '@/services/prompt/templates';
import { PromptInput, PromptContext } from '@/types/prompt';

// Sample input and context
const sampleInput: PromptInput = {
  query: 'Create a React component that shows a progress bar with percentage',
  systemMessage: 'You are an expert React developer who writes clean, reusable components.',
  agent: 'Coder',
  language: 'typescript',
  outputFormat: 'jsx'
};

const sampleContext: PromptContext = {
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
};

const PromptSystemStandalone: React.FC = () => {
  // Create a prompt manager instance
  const promptManager = new PromptManager();
  
  // Generate prompts for all templates
  const templateResults = allTemplates.map(template => {
    try {
      const result = promptManager.createPrompt(
        sampleInput,
        sampleContext
      );
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        prompt: result.prompt,
        tokens: result.estimatedTokens,
        truncated: result.truncated
      };
    } catch (error) {
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        prompt: 'Error generating prompt',
        tokens: 0,
        truncated: false
      };
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Prompt Management System</h1>
          <p className="text-slate-400 text-lg mb-4">
            A powerful template-based system for optimizing AI prompts
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                Back to Home
              </Button>
            </Link>
            <Link href="/prompt-system">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Go to Interactive Demo
              </Button>
            </Link>
          </div>
        </header>
        
        <div className="mb-8">
          <Card className="bg-slate-800 border-slate-700 text-white mb-8">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription className="text-slate-400">
                The Prompt Management System provides sophisticated prompt creation with template-based formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The Prompt Management System is designed to optimize interactions with large language models through:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Template-based formatting:</strong> Multiple templates for different use cases</li>
                  <li><strong>Token optimization:</strong> Ensures prompts fit within model context windows</li>
                  <li><strong>Dynamic context inclusion:</strong> Intelligent inclusion of relevant context</li>
                  <li><strong>Function calling support:</strong> Specialized templates for tool usage</li>
                  <li><strong>Code optimization:</strong> Special handling for code-related prompts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Templates</h2>
          <Tabs defaultValue={templateResults[0].id} className="w-full">
            <TabsList className="mb-6 w-full justify-start bg-slate-800 border border-slate-700 p-1 overflow-x-auto flex-nowrap whitespace-nowrap flex">
              {templateResults.map(result => (
                <TabsTrigger key={result.id} value={result.id} className="flex-shrink-0">
                  {result.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {templateResults.map(result => (
              <TabsContent key={result.id} value={result.id} className="mt-0">
                <Card className="bg-slate-800 border-slate-700 text-white">
                  <CardHeader>
                    <CardTitle>{result.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {result.description} • {result.tokens} tokens
                      {result.truncated && (
                        <span className="ml-2 text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-400/20">
                          Truncated
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 max-h-[500px] overflow-y-auto">
                      <pre className="text-slate-300 whitespace-pre-wrap" style={{ overflowWrap: 'break-word' }}>
                        {result.prompt}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Implementation Roadmap</h2>
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="pt-6">
              <ol className="space-y-4 list-decimal pl-5">
                <li className="pl-2">
                  <div className="font-semibold">Advanced context optimization</div>
                  <p className="text-slate-400">Implement importance scoring for context elements to prioritize retention</p>
                </li>
                <li className="pl-2">
                  <div className="font-semibold">Model-specific tokenizers</div>
                  <p className="text-slate-400">Integrate with model-specific tokenizers for more accurate token counting</p>
                </li>
                <li className="pl-2">
                  <div className="font-semibold">Domain-specific templates</div>
                  <p className="text-slate-400">Create specialized templates for web development, data science, DevOps, etc.</p>
                </li>
                <li className="pl-2">
                  <div className="font-semibold">Memory integration</div>
                  <p className="text-slate-400">Connect with the memory management system for better conversation context</p>
                </li>
                <li className="pl-2">
                  <div className="font-semibold">Feedback-based optimization</div>
                  <p className="text-slate-400">Incorporate user feedback to improve template selection heuristics</p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromptSystemStandalone;