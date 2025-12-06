'use client';

import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Send, Loader2, BookOpen, HelpCircle, Sparkles, ArrowRight, RotateCcw, ArrowLeft, Home } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ProBadge } from '@/components/ui/ProBadge';
import { formatAIMessage, renderFormattedMessage } from '@/lib/utils/formatAIMessage';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';
import { sanitizeString } from '@/lib/utils/inputValidation';
import { getItem, setItem, removeItem, isStorageAvailable } from '@/lib/storage/storage';

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

// Memoized Quick Action Button - Best Practice: Performance optimization
const QuickActionButton = memo(({ 
  action, 
  Icon, 
  isPro, 
  onAction 
}: { 
  action: QuickAction; 
  Icon: typeof BookOpen; 
  isPro: boolean; 
  onAction: (action: QuickAction) => void;
}) => {
  if (action.proOnly && !isPro) return null;
  
  return (
    <motion.button
      onClick={() => onAction(action)}
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
});
QuickActionButton.displayName = 'QuickActionButton';

// Memoized Message Component - Best Practice: Performance optimization + Better Design 2025
const MessageBubble = memo(({ msg, locale }: { msg: Message; locale: 'it' | 'en' }) => {
  const isUser = msg.role === 'user';
  // Always format assistant messages - Best Practice: Consistent formatting
  const formatted = !isUser ? formatAIMessage(msg.content) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex mb-6 last:mb-0',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 shadow-sm',
          'transition-all duration-200',
          isUser
            ? 'bg-gradient-to-br from-accent to-accent-hover text-white text-sm leading-relaxed whitespace-pre-wrap break-words shadow-md'
            : 'bg-bg-soft text-text-primary border border-border-subtle hover:border-border-default',
          // Better visual separation
          !isUser && 'bg-gradient-to-br from-bg-soft to-bg-surface'
        )}
        role={isUser ? 'log' : 'log'}
        aria-label={isUser 
          ? (locale === 'it' ? 'Messaggio utente' : 'User message')
          : (locale === 'it' ? 'Messaggio assistente' : 'Assistant message')
        }
      >
        {isUser ? (
          msg.content
                        ) : formatted ? (
                          <div className="space-y-4">
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
});
MessageBubble.displayName = 'MessageBubble';

/**
 * Tradelia AI Chat - Chat di assistenza migliorata
 * 
 * Best Practice 2025:
 * - Schema Tradelia a 5 punti per risposte (definizione, spiegazione, esempi, errori comuni, approfondimenti)
 * - Input predisposti per ridurre cognitive load
 * - Design ottimizzato (testi spaziati, line-height)
 * - Autofocus su risposta
 * - Micro animazioni
 * - Rimanda a formazione per approfondimenti
 * - Rate limiting, input validation, security
 * - Performance: memoization, lazy loading
 * - Accessibility: keyboard navigation, focus trap, ARIA
 */
export function TradeliaAIChat() {
  const { locale } = useTranslations();
  const router = useRouter();
  const isPro = useIsPro();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentLocale, setCurrentLocale] = useState<'it' | 'en'>(locale);
  const [streamingMessage, setStreamingMessage] = useState<string>(''); // For typing effect
  
  // React to locale changes - Best Practice: Update when locale changes
  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);
  
  // Listen for locale change events
  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent) => {
      if (event.detail?.locale) {
        setCurrentLocale(event.detail.locale);
      }
    };
    
    window.addEventListener('localechange', handleLocaleChange as EventListener);
    return () => window.removeEventListener('localechange', handleLocaleChange as EventListener);
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true); // Track if we should auto-scroll

  // Body scroll lock - Best Practice: Prevent background scroll
  useBodyScrollLock(isOpen);

  // Constants - Best Practice: Centralized configuration
  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_CONVERSATION_HISTORY = 10;
  const STORAGE_KEY = 'tradelia-ai-chat-messages';
  const STORAGE_STATE_KEY = 'tradelia-ai-chat-state';
  const MAX_STORED_MESSAGES = 50; // Limit stored messages for privacy/performance

  // Quick Actions - Input predisposti
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'glossary',
      label: currentLocale === 'it' ? 'Aprire Glossario' : 'Open Glossary',
      icon: BookOpen,
      action: currentLocale === 'it' 
        ? 'Apri il glossario finanziario'
        : 'Open the financial glossary',
    },
    {
      id: 'about',
      label: currentLocale === 'it' ? 'Sapere di più su Tradelia' : 'Learn more about Tradelia',
      icon: Sparkles,
      action: currentLocale === 'it'
        ? 'Dimmi di più su Tradelia e le sue funzionalità'
        : 'Tell me more about Tradelia and its features',
    },
    {
      id: 'assistance',
      label: currentLocale === 'it' ? 'Assistenza' : 'Support',
      icon: HelpCircle,
      action: currentLocale === 'it'
        ? 'Ho bisogno di aiuto con la piattaforma Tradelia'
        : 'I need help with the Tradelia platform',
    },
  ], [currentLocale]);

  // Load messages from storage on mount - Best Practice: Persistence with unified storage
  useEffect(() => {
    if (typeof window === 'undefined' || !isStorageAvailable()) return;
    
    const loadMessages = async () => {
      try {
        const stored = await getItem<Array<Omit<Message, 'timestamp'> & { timestamp: string }>>(STORAGE_KEY);
        if (stored && Array.isArray(stored)) {
          // Convert timestamp strings back to Date objects
          const messagesWithDates = stored.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          // Limit to MAX_STORED_MESSAGES
          setMessages(messagesWithDates.slice(-MAX_STORED_MESSAGES));
        }
        
        // Restore chat state (open/closed) from sessionStorage (lightweight, ok for session)
        const storedState = sessionStorage.getItem(STORAGE_STATE_KEY);
        if (storedState === 'open') {
          setIsOpen(true);
        }
      } catch (error) {
        console.warn('Failed to load chat from storage:', error);
        // Clear corrupted data
        try {
          await removeItem(STORAGE_KEY);
        } catch (e) {
          // Ignore
        }
      }
    };

    loadMessages();
  }, []);

  // Save messages to storage - Best Practice: Persistence with unified storage
  useEffect(() => {
    if (typeof window === 'undefined' || !isStorageAvailable() || messages.length === 0) return;
    
    const saveMessages = async () => {
      try {
        // Limit stored messages for privacy/performance
        const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
        await setItem(STORAGE_KEY, messagesToStore);
      } catch (error) {
        console.warn('Failed to save chat to storage:', error);
        // Try storing only last 20 messages if quota exceeded
        try {
          const reducedMessages = messages.slice(-20);
          await setItem(STORAGE_KEY, reducedMessages);
        } catch (e) {
          console.warn('Failed to save reduced messages, clearing storage');
          try {
            await removeItem(STORAGE_KEY);
          } catch (clearError) {
            // Ignore
          }
        }
      }
    };

    saveMessages();
  }, [messages]);

  // Save chat state to sessionStorage - Best Practice: Session persistence
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      if (isOpen) {
        sessionStorage.setItem(STORAGE_STATE_KEY, 'open');
      } else {
        sessionStorage.removeItem(STORAGE_STATE_KEY);
      }
    } catch (error) {
      console.warn('Failed to save chat state:', error);
    }
  }, [isOpen]);

  // Intelligent scroll - Only scroll if user is already at bottom (Best Practice: Don't interrupt reading)
  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return false;
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // Scroll to bottom intelligently - only if user is already at bottom
  useEffect(() => {
    if (!messagesContainerRef.current || !messagesEndRef.current) return;
    
    // Check if user is at bottom before new message
    const wasAtBottom = checkIfAtBottom();
    
    // If user was at bottom OR this is the first message, auto-scroll
    if (shouldAutoScrollRef.current || wasAtBottom || messages.length <= 1) {
      requestAnimationFrame(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          shouldAutoScrollRef.current = true; // Reset flag after scroll
        }
      });
    }
  }, [messages, isLoading, checkIfAtBottom]);

  // Track scroll position to detect if user manually scrolled up
  useEffect(() => {
    if (!messagesContainerRef.current || !isOpen) return;

    const container = messagesContainerRef.current;
    const handleScroll = () => {
      const isAtBottom = checkIfAtBottom();
      shouldAutoScrollRef.current = isAtBottom;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isOpen, checkIfAtBottom]);

  // Autofocus su input quando si apre - Best Practice: Better UX
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      });
    }
  }, [isOpen]);

  // Refocus input after sending message - Best Practice: Better UX flow
  useEffect(() => {
    if (!isLoading && inputRef.current && document.activeElement !== inputRef.current) {
      // Only refocus if chat is open and not loading
      if (isOpen) {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }
  }, [isLoading, isOpen]);

  // Keyboard navigation - Best Practice: Accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape' && !isLoading) {
        setIsOpen(false);
      }
      // Focus trap - Tab navigation
      if (e.key === 'Tab' && chatContainerRef.current) {
        const focusableElements = chatContainerRef.current.querySelectorAll(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading]);

  // Memoized conversation history - Best Practice: Performance
  const conversationHistory = useMemo(() => {
    return messages
      .slice(-MAX_CONVERSATION_HISTORY)
      .map(m => ({
        role: m.role,
        content: m.content,
      }));
  }, [messages]);

  // Memoized error message handler - Best Practice: Performance
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSend = useCallback(async (customMessage?: string) => {
    const messageToSend = (customMessage || message.trim()).slice(0, MAX_MESSAGE_LENGTH);
    
    // Validation - Best Practice: Input validation
    if (!messageToSend || isLoading) return;
    if (messageToSend.length === 0) {
      setError(currentLocale === 'it' ? 'Il messaggio non può essere vuoto' : 'Message cannot be empty');
      return;
    }

    // Sanitize input - Best Practice: Security
    const sanitizedMessage = sanitizeString(messageToSend);
    if (sanitizedMessage.length === 0) {
      setError(currentLocale === 'it' ? 'Messaggio non valido' : 'Invalid message');
      return;
    }

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sanitizedMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    setStreamingMessage(''); // Clear any previous streaming
    shouldAutoScrollRef.current = true; // Enable auto-scroll for user message

    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: sanitizedMessage,
            context: window.location.pathname,
            locale: currentLocale,
            format: 'tradelia-5-points',
            conversationHistory: conversationHistory.slice(-5), // Last 5 messages
          }),
        });

        if (response.status === 429) {
          const data = await response.json();
          const resetAt = data.resetAt || Date.now() + 60000;
          const waitTime = Math.ceil((resetAt - Date.now()) / 1000);
          setError(
            currentLocale === 'it'
              ? `Troppe richieste. Riprova tra ${waitTime} secondi.`
              : `Too many requests. Try again in ${waitTime} seconds.`
          );
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const responseText = data.response || data.message || '';
        
        // Typing effect for AI responses - Best Practice: Better UX, feels more natural
        if (responseText && responseText.length > 0) {
          setStreamingMessage('');
          shouldAutoScrollRef.current = true; // Enable auto-scroll for new message
          
          // Simulate typing effect with adaptive speed (faster for long messages)
          let currentIndex = 0;
          const baseTypingSpeed = 20; // milliseconds per character
          const adaptiveSpeed = responseText.length > 500 ? 10 : baseTypingSpeed; // Faster for long messages
          
          const typeMessage = () => {
            if (currentIndex < responseText.length) {
              const nextChunk = responseText.slice(0, currentIndex + 1);
              setStreamingMessage(nextChunk);
              
              // Auto-scroll during typing if user is at bottom
              if (shouldAutoScrollRef.current && messagesEndRef.current) {
                requestAnimationFrame(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                });
              }
              
              currentIndex++;
              setTimeout(typeMessage, adaptiveSpeed);
            } else {
              // Message complete, add to messages
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, assistantMessage]);
              setStreamingMessage('');
              // Final scroll to ensure message is visible
              requestAnimationFrame(() => {
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              });
            }
          };
          
          // Start typing effect after a small delay for better UX
          setTimeout(() => typeMessage(), 100);
        } else {
          // No typing effect if empty response
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseText || (currentLocale === 'it' 
              ? 'Mi dispiace, non ho ricevuto una risposta valida.'
              : 'Sorry, I didn\'t receive a valid response.'),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
          shouldAutoScrollRef.current = true;
          requestAnimationFrame(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          });
        }
        
        setError(null);
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount > maxRetries) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: currentLocale === 'it'
              ? 'Errore nel recupero della risposta. Riprova più tardi.'
              : 'Error retrieving response. Please try again later.',
            timestamp: new Date(),
          }]);
          setError(
            currentLocale === 'it'
              ? 'Impossibile connettersi al servizio. Verifica la connessione.'
              : 'Unable to connect to service. Check your connection.'
          );
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    setIsLoading(false);
  }, [message, isLoading, currentLocale, conversationHistory]);

  // Handle quick actions - Best Practice: Dopo handleSend per evitare errori di dichiarazione
  const handleQuickAction = useCallback((action: QuickAction) => {
    if (action.proOnly && !isPro) {
      return; // Non fare nulla se è Pro-only e l'utente non è Pro
    }
    
    // Best Practice: Glossario linka direttamente alla pagina, non alla chat
    if (action.id === 'glossary') {
      const glossaryPath = buildLocalePath(currentLocale, '/glossary');
      router.push(glossaryPath);
      setIsOpen(false); // Chiudi chat quando navighi
      return;
    }
    
    setMessage(action.action);
    // Trigger send dopo un breve delay per permettere al messaggio di essere settato
    setTimeout(() => {
      handleSend(action.action);
    }, 100);
  }, [isPro, handleSend, currentLocale, router]);

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
          aria-label={currentLocale === 'it' ? 'Apri chat AI Tradelia' : 'Open Tradelia AI chat'}
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
            ref={chatContainerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
            aria-describedby="chat-description"
          >
            {/* Header - Modern 2025 Design */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-gradient-to-r from-bg-surface via-bg-soft/30 to-bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 id="chat-title" className="text-base font-bold text-text-primary leading-tight">
                    {currentLocale === 'it' ? 'Tradelia AI' : 'Tradelia AI'}
                  </h3>
                  <p id="chat-description" className="text-xs text-text-tertiary leading-tight mt-0.5">
                    {currentLocale === 'it' ? 'Assistente intelligente' : 'Intelligent assistant'}
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
                      setError(null);
                    }}
                    className="p-2 rounded-lg hover:bg-bg-soft transition-colors group"
                    aria-label={currentLocale === 'it' ? 'Torna alla chat principale' : 'Back to main chat'}
                    title={currentLocale === 'it' ? 'Torna alla chat principale' : 'Back to main chat'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                  </motion.button>
                )}
                {/* New conversation button */}
                {messages.length > 0 && (
                  <motion.button
                    onClick={async () => {
                      setMessages([]);
                      setMessage('');
                      setError(null);
                      // Clear storage - Best Practice: Privacy
                      if (isStorageAvailable()) {
                        try {
                          await removeItem(STORAGE_KEY);
                        } catch (error) {
                          console.warn('Failed to clear storage:', error);
                        }
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-bg-soft transition-colors group"
                    aria-label={currentLocale === 'it' ? 'Nuova conversazione' : 'New conversation'}
                    title={currentLocale === 'it' ? 'Nuova conversazione' : 'New conversation'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-bg-soft transition-colors group"
                  aria-label={currentLocale === 'it' ? 'Chiudi chat' : 'Close chat'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </motion.button>
              </div>
            </div>

            {/* Messages - Enhanced scrolling and spacing */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent"
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-label={currentLocale === 'it' ? 'Messaggi della chat' : 'Chat messages'}
            >
              {messages.length === 0 ? (
                // Welcome screen with quick actions - Best Practice: Clear entry point
                <div className="space-y-4">
                  {/* Welcome Message */}
                  <div className="text-center py-4">
                    <p className="text-sm text-text-primary leading-relaxed mb-4">
                      {currentLocale === 'it'
                        ? 'Ciao! Sono Tradelia AI. Posso aiutarti a:'
                        : 'Hello! I\'m Tradelia AI. I can help you with:'}
                    </p>
                    <ul className="text-xs text-text-secondary space-y-2 text-left leading-relaxed">
                      <li>• {currentLocale === 'it' ? 'Spiegare termini finanziari' : 'Explain financial terms'}</li>
                      <li>• {currentLocale === 'it' ? 'Guidarti sugli strumenti' : 'Guide you on tools'}</li>
                      <li>• {currentLocale === 'it' ? 'Rispondere a domande' : 'Answer questions'}</li>
                    </ul>
                  </div>

                  {/* Quick Actions - Enhanced Design */}
                  <div className="space-y-2.5">
                    <p className="text-xs text-text-tertiary font-semibold leading-relaxed uppercase tracking-wide">
                      {currentLocale === 'it' ? 'Azioni rapide:' : 'Quick actions:'}
                    </p>
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      if (action.proOnly && !isPro) return null;
                      return (
                        <QuickActionButton
                          key={action.id}
                          action={action}
                          Icon={Icon}
                          isPro={isPro}
                          onAction={handleQuickAction}
                        />
                      );
                    })}
                  </div>

                  {/* Pro Upgrade Prompt */}
                  {!isPro && (
                    <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                      <p className="text-xs text-text-secondary leading-relaxed mb-2">
                        {currentLocale === 'it'
                          ? 'Diventa Pro per accedere a Tradelia AI avanzato con risposte dettagliate e analisi approfondite.'
                          : 'Become Pro to access advanced Tradelia AI with detailed answers and in-depth analysis.'}
                      </p>
                      <Link
                        href="/pricing"
                        className="text-xs text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1 leading-relaxed"
                      >
                        {currentLocale === 'it' ? 'Scopri Pro' : 'Discover Pro'}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={`${msg.id}-${currentLocale}`} msg={msg} locale={currentLocale} />
                  ))}
                  {/* Streaming message with typing effect */}
                  {streamingMessage && (
                    <div className="flex justify-start mb-6">
                      <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3.5 shadow-sm bg-bg-soft text-text-primary border border-border-subtle relative">
                        <div className="space-y-4">
                          {renderFormattedMessage(formatAIMessage(streamingMessage).parts, currentLocale)}
                        </div>
                        {/* Typing indicator */}
                        <span className="inline-block w-2 h-2 ml-1 bg-accent rounded-full animate-pulse" aria-hidden="true" />
                      </div>
                    </div>
                  )}
                </>
              )}
              {isLoading && !streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                  role="status"
                  aria-live="polite"
                  aria-label={currentLocale === 'it' ? 'Caricamento risposta' : 'Loading response'}
                >
                  <div className="bg-bg-soft rounded-2xl px-4 py-3 border border-border-subtle shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" aria-hidden="true" />
                    <span className="text-xs text-text-tertiary">
                      {currentLocale === 'it' ? 'Sto pensando...' : 'Thinking...'}
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
                    placeholder={currentLocale === 'it' ? 'Scrivi un messaggio...' : 'Type a message...'}
                    className={cn(
                      'w-full px-4 py-3 pr-12 rounded-xl',
                      'bg-bg-soft border border-border-subtle',
                      'text-text-primary placeholder:text-text-tertiary',
                      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-surface',
                      'text-sm leading-relaxed resize-none',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-200',
                      error ? 'border-red-500/50' : ''
                    )}
                    rows={1}
                    style={{ maxHeight: '120px', minHeight: '44px' }}
                    disabled={isLoading}
                    maxLength={MAX_MESSAGE_LENGTH}
                    aria-label={currentLocale === 'it' ? 'Campo di input messaggio' : 'Message input field'}
                    aria-describedby={isLoading ? 'loading-indicator' : undefined}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-errormessage={error ? 'error-message' : undefined}
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
                    aria-label={currentLocale === 'it' ? 'Invia messaggio' : 'Send message'}
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
              {/* Error message */}
              {error && (
                <div 
                  id="error-message" 
                  className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              {/* Character count */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-text-tertiary text-center flex-1">
                  {currentLocale === 'it'
                    ? 'AI powered by Tradelia. Le risposte sono a scopo informativo.'
                    : 'AI powered by Tradelia. Answers are for informational purposes.'}
                </p>
                <span className={cn(
                  'text-[10px] ml-2',
                  message.length > MAX_MESSAGE_LENGTH * 0.9
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-text-tertiary'
                )}>
                  {message.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
