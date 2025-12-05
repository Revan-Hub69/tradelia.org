'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, BookOpen, HelpCircle, Sparkles, ArrowRight, RotateCcw, ArrowLeft, Home } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ProBadge } from '@/components/ui/ProBadge';
import { formatAIMessage, renderFormattedMessage } from '@/lib/utils/formatAIMessage';

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      {/* Floating Button - Modern 2025 Design */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-14 h-14 sm:w-16 sm:h-16 rounded-full',
            'bg-gradient-to-br from-accent to-accent-hover',
            'hover:from-accent-hover hover:to-accent',
            'flex items-center justify-center',
            'shadow-xl hover:shadow-2xl transition-all',
            'text-white',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base',
            'border border-white/10'
          )}
          aria-label={locale === 'it' ? 'Apri chat AI Tradelia' : 'Open Tradelia AI chat'}
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.92 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
        </motion.button>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Chat Window - Modern Drawer Design 2025 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              mass: 0.8
            }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-50',
              'w-full sm:w-[420px] lg:w-[480px] xl:w-[520px]',
              'bg-bg-surface border-l border-border-subtle',
              'shadow-2xl flex flex-col',
              'backdrop-blur-xl',
              'max-h-screen'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Modern 2025 Design */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-gradient-to-r from-bg-surface via-bg-soft/30 to-bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary leading-tight">
                    {locale === 'it' ? 'Tradelia AI' : 'Tradelia AI'}
                  </h3>
                  <p className="text-xs text-text-tertiary leading-tight mt-0.5">
                    {locale === 'it' ? 'Assistente intelligente' : 'Intelligent assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Back to main chat button - Best Practice 2025: Clear navigation */}
                {messages.length > 0 && (
                  <motion.button
                    onClick={() => {
                      setMessages([]);
                      setMessage('');
                    }}
                    className="p-2 rounded-lg hover:bg-bg-soft transition-colors group"
                    aria-label={locale === 'it' ? 'Torna alla chat principale' : 'Back to main chat'}
                    title={locale === 'it' ? 'Torna alla chat principale' : 'Back to main chat'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                  </motion.button>
                )}
                {/* New conversation button */}
                {messages.length > 0 && (
                  <motion.button
                    onClick={() => {
                      setMessages([]);
                      setMessage('');
                    }}
                    className="p-2 rounded-lg hover:bg-bg-soft transition-colors group"
                    aria-label={locale === 'it' ? 'Nuova conversazione' : 'New conversation'}
                    title={locale === 'it' ? 'Nuova conversazione' : 'New conversation'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-bg-soft transition-colors group"
                  aria-label={locale === 'it' ? 'Chiudi chat' : 'Close chat'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </motion.button>
              </div>
            </div>

            {/* Messages - Enhanced scrolling and spacing */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent">
              {messages.length === 0 ? (
                // Welcome screen with quick actions - Best Practice: Clear entry point
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

                  {/* Quick Actions - Enhanced Design */}
                  <div className="space-y-2.5">
                    <p className="text-xs text-text-tertiary font-semibold leading-relaxed uppercase tracking-wide">
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
                            'w-full flex items-center gap-3 p-3.5 rounded-xl',
                            'bg-bg-soft border border-border-subtle',
                            'hover:bg-bg-elevated hover:border-accent/50 hover:shadow-md',
                            'transition-all text-left group',
                            'text-sm text-text-primary leading-relaxed'
                          )}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="w-9 h-9 rounded-lg bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
                            <Icon className="w-4 h-4 text-accent flex-shrink-0" />
                          </div>
                          <span className="flex-1 font-medium">{action.label}</span>
                          {action.proOnly && <ProBadge size="sm" />}
                          <ArrowRight className="w-4 h-4 text-text-tertiary group-hover:text-accent transition-colors opacity-0 group-hover:opacity-100" />
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
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const formatted = !isUser ? formatAIMessage(msg.content) : null;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'flex',
                        isUser ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
                          isUser
                            ? 'bg-gradient-to-br from-accent to-accent-hover text-white text-sm leading-relaxed whitespace-pre-wrap break-words'
                            : 'bg-bg-soft text-text-primary border border-border-subtle'
                        )}
                      >
                        {isUser ? (
                          msg.content
                        ) : formatted ? (
                          <div className="space-y-1">
                            {renderFormattedMessage(formatted.parts, locale)}
                          </div>
                        ) : (
                          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-bg-soft rounded-2xl px-4 py-3 border border-border-subtle shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-xs text-text-tertiary">
                      {locale === 'it' ? 'Sto pensando...' : 'Thinking...'}
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Modern 2025 Design */}
            <div className="p-5 border-t border-border-subtle bg-bg-surface">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      // Auto-resize
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={locale === 'it' ? 'Scrivi un messaggio...' : 'Type a message...'}
                    className={cn(
                      'w-full px-4 py-3 pr-12 rounded-xl',
                      'bg-bg-soft border border-border-subtle',
                      'text-text-primary placeholder:text-text-tertiary',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-surface',
                      'text-sm leading-relaxed resize-none',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-200'
                    )}
                    rows={1}
                    style={{ maxHeight: '120px', minHeight: '44px' }}
                    disabled={isLoading}
                    aria-label={locale === 'it' ? 'Campo di input messaggio' : 'Message input field'}
                    aria-describedby={isLoading ? 'loading-indicator' : undefined}
                  />
                  <motion.button
                    onClick={() => handleSend()}
                    disabled={!message.trim() || isLoading}
                    className={cn(
                      'absolute right-2 bottom-2 w-9 h-9 rounded-lg flex items-center justify-center',
                      'bg-accent hover:bg-accent-hover text-white',
                      'disabled:opacity-40 disabled:cursor-not-allowed',
                      'transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
                      message.trim() && !isLoading ? 'shadow-lg' : ''
                    )}
                    aria-label={locale === 'it' ? 'Invia messaggio' : 'Send message'}
                    whileHover={message.trim() && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={message.trim() && !isLoading ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
              <p className="text-[10px] text-text-tertiary mt-3 text-center">
                {locale === 'it'
                  ? 'AI powered by Tradelia. Le risposte sono a scopo informativo.'
                  : 'AI powered by Tradelia. Answers are for informational purposes.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
