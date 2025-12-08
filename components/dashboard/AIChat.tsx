'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * AI Chat Floating Component
 * Replaces HelpSupport and ProUtilities floating buttons
 * Best Practice: Conversational interface for better UX
 */
interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

export function AIChat() {
  const { t, locale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: locale === 'it'
        ? 'Ciao! Sono l\'assistente AI di Tradelia. Posso aiutarti con domande su termini finanziari, strumenti, report e molto altro. Come posso aiutarti?'
        : 'Hello! I\'m Tradelia\'s AI assistant. I can help you with questions about financial terms, tools, reports, and more. How can I help you?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useBodyScrollLock(isOpen);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tradelia_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChatHistory(parsed.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
          messages: h.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        })));
      } catch (e) {
        console.error('Error loading chat history:', e);
      }
    }
  }, []);

  // Save chat history to localStorage
  const saveChatHistory = (msgs: Message[]) => {
    if (msgs.length <= 1) return; // Don't save welcome-only chats
    
    const title = msgs.find(m => m.role === 'user')?.content.substring(0, 50) || 'Nuova conversazione';
    const lastMessage = msgs[msgs.length - 1].content.substring(0, 100);
    
    const newHistory: ChatHistory = {
      id: currentChatId || Date.now().toString(),
      title,
      lastMessage,
      timestamp: new Date(),
      messages: msgs,
    };

    const updated = [newHistory, ...chatHistory.filter(h => h.id !== newHistory.id)].slice(0, 10);
    setChatHistory(updated);
    localStorage.setItem('tradelia_chat_history', JSON.stringify(updated));
  };

  // Start new chat
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: locale === 'it'
          ? 'Ciao! Sono l\'assistente AI di Tradelia. Posso aiutarti con domande su termini finanziari, strumenti, report e molto altro. Come posso aiutarti?'
          : 'Hello! I\'m Tradelia\'s AI assistant. I can help you with questions about financial terms, tools, reports, and more. How can I help you?',
        timestamp: new Date(),
      },
    ]);
    setShowHistory(false);
  };

  // Load chat from history
  const loadChat = (history: ChatHistory) => {
    setCurrentChatId(history.id);
    setMessages(history.messages);
    setShowHistory(false);
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !showHistory) {
      scrollToBottom();
      // Don't auto-focus - wait for user to click input
    }
  }, [messages, isOpen, showHistory]);

  // Open chat only when input is focused (not on button click)
  const handleInputFocus = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Start new chat if no current chat
      if (!currentChatId) {
        startNewChat();
      }
    }
  };

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
      const response = await fetch('/api/ai/chat', {
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
        content: data.response || data.message || (locale === 'it' ? 'Mi dispiace, non ho capito. Puoi riformulare?' : 'Sorry, I didn\'t understand. Can you rephrase?'),
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        saveChatHistory(updated);
        return updated;
      });
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
    'Come funziona il PAC?',
    'Spiegami la volatilità',
  ] : [
    'What is the Sharpe Ratio?',
    'How does PAC work?',
    'Explain volatility',
  ];

  return (
    <>
      {/* Floating Input - Opens chat on focus */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40"
      >
        {!isOpen ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsOpen(true);
              startNewChat();
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-accent via-accent to-accent-hover shadow-lg hover:shadow-xl border border-accent/30 flex items-center justify-center text-white transition-all duration-200 group"
            aria-label={locale === 'it' ? 'Apri chat AI' : 'Open AI chat'}
          >
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform duration-200" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ width: 56, height: 56 }}
            animate={{ width: 'auto', height: 'auto' }}
            className="bg-bg-surface border border-border-subtle rounded-full shadow-lg p-2 flex items-center gap-2"
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-10 h-10 rounded-full bg-bg-soft hover:bg-bg-base flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label={locale === 'it' ? 'Cronologia chat' : 'Chat history'}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={startNewChat}
              className="w-10 h-10 rounded-full bg-bg-soft hover:bg-bg-base flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
              aria-label={locale === 'it' ? 'Nuova chat' : 'New chat'}
            >
              <span className="text-xs font-semibold">+</span>
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                setShowHistory(false);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md sm:w-96 bg-bg-surface border-l border-border-subtle shadow-2xl z-[60] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-accent/10 via-transparent to-accent/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">
                      {locale === 'it' ? 'Assistente AI' : 'AI Assistant'}
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      {locale === 'it' ? 'Chiedi qualsiasi cosa' : 'Ask anything'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowHistory(false);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                  aria-label={locale === 'it' ? 'Chiudi' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat History Sidebar */}
              {showHistory && (
                <div className="absolute inset-y-0 left-0 w-full bg-bg-surface border-r border-border-subtle z-10 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-text-primary">
                        {locale === 'it' ? 'Cronologia Chat' : 'Chat History'}
                      </h4>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="w-6 h-6 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {chatHistory.length === 0 ? (
                      <p className="text-sm text-text-tertiary text-center py-8">
                        {locale === 'it' ? 'Nessuna chat precedente' : 'No previous chats'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {chatHistory.map((history) => (
                          <button
                            key={history.id}
                            onClick={() => loadChat(history)}
                            className="w-full text-left p-3 rounded-lg bg-bg-soft hover:bg-bg-base border border-border-subtle hover:border-accent/30 transition-colors"
                          >
                            <div className="font-medium text-sm text-text-primary mb-1 line-clamp-1">
                              {history.title}
                            </div>
                            <div className="text-xs text-text-tertiary line-clamp-2 mb-1">
                              {history.lastMessage}
                            </div>
                            <div className="text-xs text-text-tertiary">
                              {history.timestamp.toLocaleDateString(locale, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        'flex gap-2',
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
                          'max-w-[80%] rounded-xl px-3 py-2 text-sm',
                          message.role === 'user'
                            ? 'bg-accent text-white'
                            : 'bg-bg-soft border border-border-subtle text-text-primary'
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">
                          {message.content}
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
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-bg-soft border border-border-subtle rounded-xl px-3 py-2">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {messages.length === 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-text-tertiary">
                      {locale === 'it' ? 'Domande suggerite:' : 'Suggested questions:'}
                    </p>
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(question);
                          inputRef.current?.focus();
                        }}
                        className="text-xs text-left px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-secondary hover:border-accent/40 hover:text-text-primary transition-colors w-full"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border-subtle bg-bg-surface">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder={locale === 'it' ? 'Scrivi un messaggio...' : 'Type a message...'}
                      className="w-full px-3 py-2 pr-10 bg-bg-soft border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent resize-none"
                      rows={1}
                      style={{ maxHeight: '120px' }}
                      disabled={loading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className={cn(
                        'absolute right-2 bottom-2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                        input.trim() && !loading
                          ? 'bg-accent hover:bg-accent-hover text-white'
                          : 'bg-bg-surface text-text-tertiary cursor-not-allowed'
                      )}
                      aria-label={locale === 'it' ? 'Invia' : 'Send'}
                    >
                      {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-text-tertiary mt-2 text-center">
                  {locale === 'it'
                    ? 'AI powered by Tradelia. Le risposte sono a scopo informativo.'
                    : 'AI powered by Tradelia. Answers are for informational purposes.'}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
