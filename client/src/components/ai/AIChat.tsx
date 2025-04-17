/** @jsxImportSource theme-ui */
import { useState, useRef, useEffect } from 'react';
import { Box, Button, Flex, Heading, Text, Textarea } from 'theme-ui';
import { ChevronDown, ChevronUp, Send, X, Zap } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { AIAgent } from '@/types';

interface AIChatProps {
  initialOpen?: boolean;
}

const AIChat = ({ initialOpen = false }: AIChatProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [query, setQuery] = useState('');
  const { messages, sendQuery, isProcessing, activeAgent, setAgent, clearMessages } = useAI();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing) {
      sendQuery(query);
      setQuery('');
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleAgentChange = (agent: AIAgent) => {
    setAgent(agent);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        right: '20px',
        width: isOpen ? '400px' : 'auto',
        height: isOpen ? '500px' : 'auto',
        backgroundColor: 'backgroundElevated',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        border: '1px solid',
        borderBottom: 'none',
        borderColor: 'border',
      }}
    >
      {/* Header */}
      <Flex
        sx={{
          padding: 2,
          backgroundColor: 'backgroundFloating',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'border',
          cursor: 'pointer',
        }}
        onClick={toggleOpen}
      >
        <Flex sx={{ alignItems: 'center' }}>
          <Zap size={18} color="var(--theme-ui-colors-primary)" sx={{ marginRight: 2 }} />
          <Heading as="h3" sx={{ fontSize: 2, margin: 0 }}>
            AI Assistant ({activeAgent})
          </Heading>
        </Flex>
        <Flex>
          {isOpen && (
            <Button
              variant="icon"
              onClick={(e) => {
                e.stopPropagation();
                clearMessages();
              }}
              sx={{ marginRight: 1 }}
              aria-label="Clear chat"
            >
              <X size={18} />
            </Button>
          )}
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </Flex>
      </Flex>

      {isOpen && (
        <>
          {/* Agent selection tabs */}
          <Flex
            sx={{
              borderBottom: '1px solid',
              borderColor: 'border',
              backgroundColor: 'backgroundElevated',
            }}
          >
            {(['Coder', 'Debugger', 'WCAG Auditor'] as AIAgent[]).map((agent) => (
              <Button
                key={agent}
                variant={activeAgent === agent ? 'tabActive' : 'tab'}
                onClick={() => handleAgentChange(agent)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  justifyContent: 'center',
                  borderTop: 'none',
                  borderLeft: 'none',
                }}
              >
                {agent}
              </Button>
            ))}
          </Flex>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              padding: 3,
              backgroundColor: 'background',
            }}
          >
            {messages.length === 0 ? (
              <Flex
                sx={{
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  color: 'foregroundMuted',
                  textAlign: 'center',
                  padding: 3,
                }}
              >
                <Zap size={32} sx={{ marginBottom: 3, opacity: 0.5 }} />
                <Text sx={{ fontSize: 1 }}>
                  Ask the {activeAgent} for help with your code.
                </Text>
              </Flex>
            ) : (
              messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    marginBottom: 3,
                    padding: 2,
                    borderRadius: '8px',
                    backgroundColor:
                      message.role === 'user' ? 'primaryMuted' : 'backgroundElevated',
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    marginLeft: message.role === 'user' ? 'auto' : 0,
                  }}
                >
                  <Text
                    sx={{
                      color: message.role === 'user' ? 'primary' : 'foreground',
                      fontWeight: message.role === 'user' ? 'bold' : 'normal',
                      marginBottom: 1,
                      fontSize: 0,
                    }}
                  >
                    {message.role === 'user' ? 'You' : message.agent || 'Assistant'}
                  </Text>
                  <Text sx={{ whiteSpace: 'pre-wrap', fontSize: 1 }}>{message.content}</Text>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box as="form" onSubmit={handleSubmit} sx={{ padding: 2, borderTop: '1px solid', borderColor: 'border' }}>
            <Flex sx={{ alignItems: 'flex-end' }}>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Ask ${activeAgent} a question...`}
                rows={2}
                sx={{
                  resize: 'none',
                  flex: 1,
                  borderRadius: '4px',
                  padding: 2,
                  fontSize: 1,
                  backgroundColor: 'backgroundActive',
                  border: '1px solid',
                  borderColor: 'border',
                  color: 'foreground',
                  '&:focus': {
                    outline: 'none',
                    borderColor: 'primary',
                  },
                }}
                disabled={isProcessing}
              />
              <Button
                type="submit"
                variant="primary"
                sx={{ marginLeft: 2, height: '36px', width: '36px', padding: 0 }}
                disabled={!query.trim() || isProcessing}
                aria-label="Send message"
              >
                <Send size={16} />
              </Button>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
};

// Add displayName for component identification in IDELayout
AIChat.displayName = 'AIChat';

export default AIChat;