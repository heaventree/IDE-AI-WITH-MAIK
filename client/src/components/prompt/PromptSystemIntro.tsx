import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowRight, MessageSquare, Lightbulb, FileCode, Brain, Zap } from 'lucide-react';
import PromptSystemLayout from './PromptSystemLayout';

const PromptSystemIntro: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <PromptSystemLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Prompt Management System</h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            A sophisticated, template-based prompt engineering system designed to optimize interactions with large language models
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-indigo-400" />
                <span>Intelligent Template Selection</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Automatically selects the most appropriate template based on query content and context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-900/20 p-1 mt-0.5">
                    <Zap className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span>Context-aware template selection heuristics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-900/20 p-1 mt-0.5">
                    <Zap className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span>Multiple specialized templates for different use cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-indigo-900/20 p-1 mt-0.5">
                    <Zap className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span>Agent-specific prompt optimization</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => navigate('/prompt-system-standalone')}
              >
                View Template Examples
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileCode className="h-6 w-6 text-emerald-400" />
                <span>Automatic Context Optimization</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Intelligently manages token limits and prioritizes relevant context
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-emerald-900/20 p-1 mt-0.5">
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span>Token-aware prompt construction and truncation</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-emerald-900/20 p-1 mt-0.5">
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span>Smart content prioritization algorithm</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-emerald-900/20 p-1 mt-0.5">
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span>Special handling for code snippets and documentation</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate('/prompt-system')}
              >
                Try Interactive Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="rounded-full bg-amber-600/10 p-3 w-12 h-12 flex items-center justify-center mb-2">
                <MessageSquare className="h-6 w-6 text-amber-400" />
              </div>
              <CardTitle>Conversational Context</CardTitle>
              <CardDescription className="text-slate-400">
                Maintains and optimizes conversation history
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Intelligently manages conversation history to maintain continuity while staying within token limits.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="rounded-full bg-blue-600/10 p-3 w-12 h-12 flex items-center justify-center mb-2">
                <FileCode className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle>Code Specialization</CardTitle>
              <CardDescription className="text-slate-400">
                Optimized for programming tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Special templates and context handling for code generation, explanation, and debugging tasks.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="rounded-full bg-purple-600/10 p-3 w-12 h-12 flex items-center justify-center mb-2">
                <Lightbulb className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle>Function Calling</CardTitle>
              <CardDescription className="text-slate-400">
                Tool-use optimized prompting
              </CardDescription>
            </CardHeader>
            <CardContent className="text-slate-300">
              Specialized templates for function/tool-calling scenarios with clear instructions for AI models.
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
              Back to IDE
            </Button>
          </Link>
          <Link href="/prompt-system-standalone">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Explore Templates
            </Button>
          </Link>
          <Link href="/prompt-system">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Try Interactive Demo
            </Button>
          </Link>
        </div>
      </div>
    </PromptSystemLayout>
  );
};

export default PromptSystemIntro;