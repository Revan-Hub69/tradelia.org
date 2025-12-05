'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';

/**
 * AI Chat Floating - Chat AI disponibile ovunque nel sito
 * 
 * Best Practice: Cognitive Load Theory - Accesso rapido senza interrompere workflow
 * Design: Non invasivo, discreto, sempre accessibile
 */
export function AIChatFloating() {
  const { locale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: window.location.pathname, // Context della pagina corrente
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: locale === 'it'
          ? 'Errore nel recupero della risposta. Riprova più tardi.'
          : 'Error retrieving response. Please try again later.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-14 h-14 rounded-full bg-accent hover:bg-accent-hover',
            'flex items-center justify-center',
            'shadow-lg hover:shadow-xl transition-all',
            'text-white',
            'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-base'
          )}
          aria-label={locale === 'it' ? 'Apri chat AI' : 'Open AI chat'}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50',
            'w-96 h-[600px] max-h-[80vh]',
            'bg-bg-surface border border-border-subtle rounded-xl',
            'shadow-2xl flex flex-col',
            'animate-in slide-in-from-bottom-4 duration-300'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {locale === 'it' ? 'Tradelia AI' : 'Tradelia AI'}
                </h3>
                <p className="text-xs text-text-tertiary">
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
              <div className="text-center text-text-tertiary text-sm py-8">
                {locale === 'it'
                  ? 'Ciao! Come posso aiutarti oggi?'
                  : 'Hello! How can I help you today?'}
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'bg-accent text-white'
                        : 'bg-bg-soft text-text-primary'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-bg-soft rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border-subtle">
            <div className="flex gap-2">
              <input
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
                onClick={handleSend}
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
        </div>
      )}
    </>
  );
}
