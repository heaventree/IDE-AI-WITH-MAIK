import { useState, useRef, useEffect } from 'react';
import { useAI } from '../../hooks/useAI';
import { AIMessage, AIAgent } from '../../types';

const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const [agent, setAgent] = useState<AIAgent>('Coder');
  const { messages, isProcessing, sendQuery } = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;
    
    await sendQuery(query, agent);
    setQuery('');
  };

  const formatMessageContent = (content: string) => {
    // Detect code blocks with language
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let formattedContent = content;
    let match;
    
    // Replace all code blocks with formatted ones
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || '';
      const code = match[2];
      const replacement = `
        <pre class="bg-neutral-100 dark:bg-dark-100 p-2 rounded text-xs overflow-x-auto my-2">
          ${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </pre>
      `;
      formattedContent = formattedContent.replace(match[0], replacement);
    }
    
    // Convert line breaks to <br> tags
    formattedContent = formattedContent.replace(/\n/g, '<br>');
    
    return formattedContent;
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-dark-400 overflow-hidden">
      {/* AI chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {/* Agent selection */}
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <h3 className="text-base font-medium mb-2 sm:mb-0">AI Assistant</h3>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-sm rounded-full transition ${
                  agent === 'Coder' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-neutral-200 dark:bg-dark-100 hover:bg-neutral-300 dark:hover:bg-dark-200'
                }`}
                onClick={() => setAgent('Coder')}
              >
                Coder
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-full transition ${
                  agent === 'Debugger' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-neutral-200 dark:bg-dark-100 hover:bg-neutral-300 dark:hover:bg-dark-200'
                }`}
                onClick={() => setAgent('Debugger')}
              >
                Debugger
              </button>
              <button 
                className={`px-3 py-1 text-sm rounded-full transition ${
                  agent === 'WCAG Auditor' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-neutral-200 dark:bg-dark-100 hover:bg-neutral-300 dark:hover:bg-dark-200'
                }`}
                onClick={() => setAgent('WCAG Auditor')}
              >
                WCAG Auditor
              </button>
            </div>
          </div>
          
          {/* Chat thread */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                <div className="text-4xl mb-2">👋</div>
                <h3 className="text-lg font-medium mb-1">Welcome to Bolt DIY Enhanced</h3>
                <p className="text-sm">Ask the AI Assistant for help with coding, debugging, or accessibility.</p>
              </div>
            ) : (
              messages.map((message: AIMessage) => (
                <div 
                  key={message.id}
                  className={`flex items-start ${
                    message.role === 'user' ? '' : 'justify-end'
                  }`}
                >
                  <div 
                    className={`rounded-lg p-3 max-w-[85%] ${
                      message.role === 'user' 
                        ? 'bg-neutral-200 dark:bg-dark-100' 
                        : 'bg-primary-100 dark:bg-primary-900 dark:bg-opacity-30'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 mr-2">
                          {message.agent || 'AI'}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Using {message.model || 'GPT-4'}
                        </span>
                      </div>
                    )}
                    <div 
                      className="prose prose-sm dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessageContent(message.content) 
                      }}
                    />
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="flex items-start justify-end">
                <div className="bg-primary-100 dark:bg-primary-900 dark:bg-opacity-30 rounded-lg p-3">
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* AI input area */}
        <div className="p-3 border-t border-neutral-300 dark:border-dark-100 bg-neutral-100 dark:bg-dark-300">
          <form onSubmit={handleSubmit} className="flex items-center">
            <textarea
              placeholder="Ask AI Assistant..."
              className="flex-1 rounded-l bg-white dark:bg-dark-100 border border-neutral-300 dark:border-dark-200 p-2 text-sm resize-none h-10 min-h-[40px] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              type="submit" 
              className={`bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 h-10 rounded-r transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </form>
          <div className="mt-2 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
            <div>
              <span>Using GPT-4</span>
              <button className="ml-1 underline">Change model</button>
            </div>
            <div>
              <span>Context: Project files + conversation history</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
