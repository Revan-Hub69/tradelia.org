'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, BookOpen, X } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Glossary Chat AI Component
 * Replaces traditional glossary with AI-powered chat interface
 * Best Practice: Conversational interface for better UX (Nielsen, 1994)
 */
export function GlossaryChat() {
  const { t, locale } = useTranslations();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: locale === 'it' 
        ? 'Ciao! Sono l\'assistente AI di Tradelia per il glossario finanziario. Posso spiegarti qualsiasi termine finanziario, concetto o definizione. Cosa vorresti sapere?'
        : 'Hello! I\'m Tradelia\'s AI assistant for the financial glossary. I can explain any financial term, concept, or definition. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/glossary/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          locale: locale,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Errore nella risposta');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: locale === 'it'
          ? 'Mi dispiace, si è verificato un errore. Riprova più tardi.'
          : 'Sorry, an error occurred. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = locale === 'it' ? [
    'Cos\'è il Sharpe Ratio?',
    'Spiegami la volatilità',
    'Cosa significa hedging?',
    'Come funziona l\'interesse composto?',
  ] : [
    'What is the Sharpe Ratio?',
    'Explain volatility',
    'What does hedging mean?',
    'How does compound interest work?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px] bg-bg-base">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-subtle bg-bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary">
              {t('glossary.title') || 'Glossario AI'}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary">
              {t('glossary.subtitle') || 'Chiedi qualsiasi termine finanziario'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-accent text-white'
                    : 'bg-bg-surface border border-border-subtle text-text-primary'
                )}
              >
                <div className="text-sm whitespace-pre-wrap break-words prose prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => {
                    // Format markdown-like syntax
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <strong key={i} className="font-semibold text-text-primary">
                          {line.slice(2, -2)}
                        </strong>
                      );
                    }
                    if (line.startsWith('**')) {
                      const parts = line.split('**');
                      return (
                        <div key={i}>
                          {parts.map((part, j) => 
                            j % 2 === 1 ? (
                              <strong key={j} className="font-semibold text-text-primary">
                                {part}
                              </strong>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                        </div>
                      );
                    }
                    return <div key={i}>{line || '\u00A0'}</div>;
                  })}
                </div>
                <div className={cn(
                  'text-xs mt-2',
                  message.role === 'user' ? 'text-white/70' : 'text-text-secondary'
                )}>
                  {message.timestamp.toLocaleTimeString(locale === 'it' ? 'it-IT' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-bg-soft border border-border-subtle flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-xl px-4 py-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 sm:px-6 pb-4">
          <p className="text-xs text-text-secondary mb-2">
            {locale === 'it' ? 'Domande suggerite:' : 'Suggested questions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(question);
                  inputRef.current?.focus();
                }}
                className="text-xs px-3 py-1.5 bg-bg-soft border border-border-subtle rounded-lg text-text-secondary hover:border-accent/40 hover:text-text-primary transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-border-subtle bg-bg-surface">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale === 'it' ? 'Chiedi qualsiasi termine finanziario...' : 'Ask any financial term...'}
              className="w-full px-4 py-3 pr-12 bg-bg-soft border border-border-subtle rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent resize-none"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={cn(
                'absolute right-2 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                input.trim() && !loading
                  ? 'bg-accent hover:bg-accent-hover text-white'
                  : 'bg-bg-surface text-text-secondary cursor-not-allowed'
              )}
              aria-label={locale === 'it' ? 'Invia messaggio' : 'Send message'}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-text-secondary mt-2 text-center">
          {locale === 'it' 
            ? 'L\'AI utilizza il glossario Tradelia come knowledge base. Le risposte sono a scopo informativo.'
            : 'AI uses Tradelia glossary as knowledge base. Answers are for informational purposes.'}
        </p>
      </div>
    </div>
  );
}
