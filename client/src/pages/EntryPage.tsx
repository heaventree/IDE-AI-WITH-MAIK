import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  ArrowRight,
  Code,
  Import,
  Laptop,
  Lightbulb,
  FileText,
  Presentation,
  ChevronUp,
  Link as LinkIcon
} from "lucide-react";

const EntryPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle prompt submission
    console.log("Prompt submitted:", prompt);
  };

  const frameworks = [
    { name: "React", icon: <div className="text-[#61DAFB] w-6 h-6">⚛️</div> },
    { name: "Vue", icon: <div className="text-[#4FC08D] w-6 h-6">📊</div> },
    { name: "Next.js", icon: <div className="text-black w-6 h-6 dark:text-white">▲</div> },
    { name: "Nuxt", icon: <div className="text-[#00DC82] w-6 h-6">🔰</div> },
    { name: "Angular", icon: <div className="text-[#DD0031] w-6 h-6">🅰️</div> },
    { name: "Svelte", icon: <div className="text-[#FF3E00] w-6 h-6">🔄</div> },
    { name: "Express", icon: <div className="text-gray-800 w-6 h-6 dark:text-white">🚂</div> },
    { name: "Remix", icon: <div className="text-gray-800 w-6 h-6 dark:text-white">♻️</div> },
    { name: "Typescript", icon: <div className="text-[#3178C6] w-6 h-6">TS</div> },
    { name: "Redux", icon: <div className="text-[#764ABC] w-6 h-6">🔄</div> },
    { name: "Flask", icon: <div className="text-gray-800 w-6 h-6 dark:text-white">🧪</div> },
    { name: "Django", icon: <div className="text-[#092E20] w-6 h-6">🐍</div> },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col light">
      {/* Top notification banner */}
      <div className="w-full bg-muted/50 py-2 px-4 flex justify-center items-center">
        <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary-foreground">
          <span className="mr-1">New</span>
        </Badge>
        <span className="text-sm ml-2">Stripe Payments support</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center text-foreground">
          What do you want to build?
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          Prompt, run, edit, and deploy full-stack <span className="text-foreground font-medium">web</span> and <span className="text-foreground font-medium">mobile</span> apps.
        </p>

        {/* Token count */}
        <div className="text-sm text-muted-foreground mb-4 flex items-center">
          <span>100K daily tokens remaining</span>
          <Button variant="link" size="sm" className="ml-1 text-primary text-xs">
            Subscribe to Pro for more usage
          </Button>
        </div>

        {/* Prompt input */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8">
          <div className="relative">
            <Input
              value={prompt}
              onChange={handlePromptChange}
              placeholder="How can Bolt help you today?"
              className="pr-20 py-6 text-md bg-white border-border/50 focus-visible:ring-primary/30 focus-visible:ring-offset-0 shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowFullPrompt(!showFullPrompt)}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button type="submit" size="icon" className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFullPrompt && (
            <Card className="mt-2 bg-card border-border/30">
              <CardContent className="p-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Voice typing available</span>
                  <div className="flex items-center gap-1">
                    <span>1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        {/* Quick start options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 w-full max-w-2xl">
          <Button variant="outline" className="justify-start h-auto py-2 px-3 bg-white border-border/40 hover:bg-card/80 shadow-sm">
            <Import className="mr-2 h-4 w-4 text-purple-500" />
            <span>Import from Figma</span>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-2 px-3 bg-white border-border/40 hover:bg-card/80 shadow-sm">
            <Laptop className="mr-2 h-4 w-4 text-blue-500" />
            <span>Build a mobile app with Expo</span>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-2 px-3 bg-white border-border/40 hover:bg-card/80 shadow-sm">
            <FileText className="mr-2 h-4 w-4 text-green-500" />
            <span>Start a blog with Astro</span>
          </Button>
          <Button variant="outline" className="justify-start h-auto py-2 px-3 bg-white border-border/40 hover:bg-card/80 shadow-sm">
            <Presentation className="mr-2 h-4 w-4 text-amber-500" />
            <span>Draft a presentation with Slides</span>
          </Button>
        </div>

        {/* Frameworks */}
        <p className="text-muted-foreground text-sm mb-4">or start a blank app with your favorite stack</p>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-w-3xl mb-8">
          {frameworks.map((framework, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex flex-col items-center justify-center h-14 aspect-square p-0 bg-white border-border/30 hover:bg-card/80 shadow-sm"
            >
              <div className="mb-1">{framework.icon}</div>
              <span className="text-xs">{framework.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 px-6 border-t border-border/20 text-xs text-muted-foreground">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <span>We're hiring</span>
            <span className="mx-2">•</span>
            <Link href="/help">Help Center</Link>
            <span className="mx-2">•</span>
            <Link href="/pricing">Pricing</Link>
            <span className="mx-2">•</span>
            <Link href="/terms">Terms</Link>
            <span className="mx-2">•</span>
            <Link href="/privacy">Privacy</Link>
          </div>
          <div className="flex items-center">
            <span>©️ 2025 Bolt</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EntryPage;