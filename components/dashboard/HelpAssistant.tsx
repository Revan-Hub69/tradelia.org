'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, HelpCircle, BookOpen } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { ProBadge } from '@/components/ui/ProBadge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

/**
 * Help Assistant Component
 * Hybrid approach: AI Chat for Pro users, FAQ for all users
 * Best Practice AI 2025: RAG (Retrieval-Augmented Generation) pattern
 * 
 * References:
 * - Lewis et al. (2020): "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
 * - Karpukhin et al. (2020): "Dense Passage Retrieval for Open-Domain Question Answering"
 * - Gao et al. (2023): "Hybrid Search: Combining Keyword and Semantic Search"
 */
export function HelpAssistant() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'faq'>('faq');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [faqSearch, setFaqSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useBodyScrollLock(isOpen);

  // Check if AI is enabled (API key configured)
  useEffect(() => {
    checkAIEnabled();
  }, []);

  // Load FAQ items
  useEffect(() => {
    loadFAQItems();
  }, [locale]);

  const checkAIEnabled = async () => {
    try {
      // Check if AI service is available
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        setAiEnabled(data.enabled || false);
      }
    } catch (error) {
      setAiEnabled(false);
    }
  };

  const loadFAQItems = async () => {
    try {
      const response = await fetch(`/api/faq?locale=${locale}`);
      if (response.ok) {
        const data = await response.json();
        setFaqItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading FAQ:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'ai') {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, activeTab]);

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

  const filteredFAQ = faqItems.filter(item => {
    if (!faqSearch.trim()) return true;
    const searchLower = faqSearch.toLowerCase();
    return (
      item.question.toLowerCase().includes(searchLower) ||
      item.answer.toLowerCase().includes(searchLower) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  // Initialize AI chat with welcome message
  useEffect(() => {
    if (activeTab === 'ai' && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: locale === 'it'
          ? 'Ciao! Sono l\'assistente AI di Tradelia. Posso aiutarti con domande su termini finanziari, strumenti, report e molto altro. Come posso aiutarti?'
          : 'Hello! I\'m Tradelia\'s AI assistant. I can help you with questions about financial terms, tools, reports, and more. How can I help you?',
        timestamp: new Date(),
      }]);
    }
  }, [activeTab, locale]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-accent via-accent to-accent-hover shadow-lg hover:shadow-xl border border-accent/30 flex items-center justify-center text-white transition-all duration-200 group"
        aria-label={locale === 'it' ? 'Apri assistente' : 'Open assistant'}
      >
        <HelpCircle className="w-6 h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform duration-200" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md sm:w-96 bg-bg-surface border-l border-border-subtle shadow-2xl z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Tabs */}
              <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-gradient-to-r from-accent/10 via-transparent to-accent/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">
                      {locale === 'it' ? 'Assistente' : 'Assistant'}
                    </h3>
                    <p className="text-xs text-text-tertiary">
                      {locale === 'it' ? 'FAQ e AI Chat' : 'FAQ and AI Chat'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
                  aria-label={locale === 'it' ? 'Chiudi' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs - Show AI tab only if enabled and user is Pro */}
              {aiEnabled && isPro && (
                <div className="flex border-b border-border-subtle bg-bg-soft">
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={cn(
                      'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                      activeTab === 'faq'
                        ? 'text-accent border-b-2 border-accent bg-bg-surface'
                        : 'text-text-tertiary hover:text-text-primary'
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{locale === 'it' ? 'FAQ' : 'FAQ'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={cn(
                      'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                      activeTab === 'ai'
                        ? 'text-accent border-b-2 border-accent bg-bg-surface'
                        : 'text-text-tertiary hover:text-text-primary'
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{locale === 'it' ? 'AI Chat' : 'AI Chat'}</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {(activeTab === 'faq' || !aiEnabled || !isPro) ? (
                  <div className="p-4 space-y-4">
                    {/* FAQ Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={faqSearch}
                        onChange={(e) => setFaqSearch(e.target.value)}
                        placeholder={locale === 'it' ? 'Cerca nelle FAQ...' : 'Search FAQ...'}
                        className="w-full px-4 py-2 pr-10 bg-bg-soft border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent"
                      />
                      <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    </div>

                    {/* FAQ Items */}
                    {filteredFAQ.length === 0 ? (
                      <div className="text-center py-8 text-text-tertiary text-sm">
                        {locale === 'it' 
                          ? 'Nessuna FAQ trovata. Contattaci per assistenza.'
                          : 'No FAQ found. Contact us for support.'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredFAQ.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-bg-soft border border-border-subtle rounded-lg hover:border-accent/40 transition-colors"
                          >
                            <h4 className="font-semibold text-text-primary text-sm mb-2">
                              {item.question}
                            </h4>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {item.answer}
                            </p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-bg-surface border border-border-subtle rounded text-[10px] text-text-tertiary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
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
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
