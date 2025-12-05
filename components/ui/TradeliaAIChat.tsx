'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, BookOpen, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ProBadge } from '@/components/ui/ProBadge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  icon: typeof BookOpen;
  action: string;
  proOnly?: boolean;
}

/**
 * Tradelia AI Chat - Chat di assistenza migliorata
 * 
 * Best Practice:
 * - Schema Tradelia a 5 punti per risposte (definizione, spiegazione, esempi, errori comuni, approfondimenti)
 * - Input predisposti per ridurre cognitive load
 * - Design ottimizzato (testi spaziati, line-height)
 * - Autofocus su risposta
 * - Micro animazioni
 * - Rimanda a formazione per approfondimenti
 */
export function TradeliaAIChat() {
  const { locale } = useTranslations();
  const isPro = useIsPro();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Actions - Input predisposti
  const quickActions: QuickAction[] = [
    {
      id: 'glossary',
      label: locale === 'it' ? 'Aprire Glossario' : 'Open Glossary',
      icon: BookOpen,
      action: locale === 'it' 
        ? 'Apri il glossario finanziario'
        : 'Open the financial glossary',
    },
    {
      id: 'about',
      label: locale === 'it' ? 'Sapere di più su Tradelia' : 'Learn more about Tradelia',
      icon: Sparkles,
      action: locale === 'it'
        ? 'Dimmi di più su Tradelia e le sue funzionalità'
        : 'Tell me more about Tradelia and its features',
    },
    {
      id: 'assistance',
      label: locale === 'it' ? 'Assistenza' : 'Support',
      icon: HelpCircle,
      action: locale === 'it'
        ? 'Ho bisogno di assistenza'
        : 'I need support',
    },
  ];

  // Scroll to bottom quando arrivano nuovi messaggi
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Autofocus su input quando si apre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleQuickAction = (action: QuickAction) => {
    if (action.proOnly && !isPro) {
      return; // Non fare nulla se è Pro-only e l'utente non è Pro
    }
    setMessage(action.action);
    // Trigger send dopo un breve delay per permettere al messaggio di essere settato
    setTimeout(() => {
      handleSend(action.action);
    }, 100);
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || message.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          context: window.location.pathname,
          locale,
          format: 'tradelia-5-points', // Schema Tradelia a 5 punti
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: locale === 'it'
          ? 'Errore nel recupero della risposta. Riprova più tardi.'
          : 'Error retrieving response. Please try again later.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-14 h-14 rounded-full bg-accent hover:bg-accent-hover',
            'flex items-center justify-center',
            'shadow-lg hover:shadow-xl transition-all',
            'text-white',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base'
          )}
          aria-label={locale === 'it' ? 'Apri chat AI Tradelia' : 'Open Tradelia AI chat'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-96 h-[600px] max-h-[80vh]',
              'bg-bg-surface border border-border-subtle rounded-xl',
              'shadow-2xl flex flex-col',
              'backdrop-blur-sm'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary leading-relaxed">
                    {locale === 'it' ? 'Tradelia AI' : 'Tradelia AI'}
                  </h3>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    {locale === 'it' ? 'Assistente intelligente' : 'Intelligent assistant'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-bg-soft transition-colors"
                aria-label={locale === 'it' ? 'Chiudi chat' : 'Close chat'}
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  {/* Welcome Message */}
                  <div className="text-center py-4">
                    <p className="text-sm text-text-primary leading-relaxed mb-4">
                      {locale === 'it'
                        ? 'Ciao! Sono Tradelia AI. Posso aiutarti a:'
                        : 'Hello! I\'m Tradelia AI. I can help you with:'}
                    </p>
                    <ul className="text-xs text-text-secondary space-y-2 text-left leading-relaxed">
                      <li>• {locale === 'it' ? 'Spiegare termini finanziari' : 'Explain financial terms'}</li>
                      <li>• {locale === 'it' ? 'Guidarti sugli strumenti' : 'Guide you on tools'}</li>
                      <li>• {locale === 'it' ? 'Rispondere a domande' : 'Answer questions'}</li>
                    </ul>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <p className="text-xs text-text-tertiary font-medium leading-relaxed">
                      {locale === 'it' ? 'Azioni rapide:' : 'Quick actions:'}
                    </p>
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      if (action.proOnly && !isPro) return null;
                      return (
                        <motion.button
                          key={action.id}
                          onClick={() => handleQuickAction(action)}
                          className={cn(
                            'w-full flex items-center gap-2 p-3 rounded-lg',
                            'bg-bg-soft border border-border-subtle',
                            'hover:bg-bg-elevated hover:border-accent/40',
                            'transition-all text-left',
                            'text-sm text-text-primary leading-relaxed'
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                          <span className="flex-1">{action.label}</span>
                          {action.proOnly && <ProBadge size="sm" />}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Pro Upgrade Prompt */}
                  {!isPro && (
                    <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                      <p className="text-xs text-text-secondary leading-relaxed mb-2">
                        {locale === 'it'
                          ? 'Diventa Pro per accedere a Tradelia AI avanzato con risposte dettagliate e analisi approfondite.'
                          : 'Become Pro to access advanced Tradelia AI with detailed answers and in-depth analysis.'}
                      </p>
                      <Link
                        href="/pricing"
                        className="text-xs text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1 leading-relaxed"
                      >
                        {locale === 'it' ? 'Scopri Pro' : 'Discover Pro'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed',
                        'whitespace-pre-wrap break-words',
                        msg.role === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-bg-soft text-text-primary border border-border-subtle'
                      )}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-bg-soft rounded-lg px-4 py-3 border border-border-subtle">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-subtle">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={locale === 'it' ? 'Scrivi un messaggio...' : 'Type a message...'}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg',
                    'bg-bg-soft border border-border-subtle',
                    'text-text-primary placeholder:text-text-tertiary',
                    'focus:outline-none focus:ring-2 focus:ring-accent',
                    'text-sm leading-relaxed'
                  )}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!message.trim() || isLoading}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    'bg-accent hover:bg-accent-hover text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-accent'
                  )}
                  aria-label={locale === 'it' ? 'Invia messaggio' : 'Send message'}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
