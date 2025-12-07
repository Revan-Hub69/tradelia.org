'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface RichTextEditorProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  id?: string;
}

/**
 * Rich Text Editor Component
 * Editor semplice per note e descrizioni
 * Riferimento: ContentEditable Best Practices, WCAG 2.1 AAA
 * 
 * Nota: Per un editor più avanzato, considerare librerie come TipTap o Slate
 */
export function RichTextEditor({
  label,
  error,
  helperText,
  required,
  value = '',
  onChange,
  placeholder = 'Scrivi qui...',
  maxLength,
  className,
  id,
}: RichTextEditorProps) {
  const [content, setContent] = useState(value);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const editorId = id || `rich-text-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = error ? `${editorId}-error` : undefined;
  const helperId = helperText ? `${editorId}-helper` : undefined;

  useEffect(() => {
    if (value !== content) {
      setContent(value);
      if (editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setContent(html);
    onChange?.(html);
    updateFormatting();
  };

  const updateFormatting = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const parent = range.commonAncestorContainer.parentElement;
    
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateFormatting();
    handleInput();
  };

  const getPlainText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const characterCount = getPlainText(content).length;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={editorId}
          className="block text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div
        className={cn(
          'border rounded-lg overflow-hidden',
          error
            ? 'border-red-400'
            : 'border-border-subtle focus-within:border-accent focus-within:ring-2 focus-within:ring-accent'
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-bg-soft border-b border-border-subtle">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className={cn(
              'p-1.5 rounded hover:bg-accent/10 transition-colors',
              isBold && 'bg-accent/20'
            )}
            aria-label="Grassetto"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className={cn(
              'p-1.5 rounded hover:bg-accent/10 transition-colors',
              isItalic && 'bg-accent/20'
            )}
            aria-label="Corsivo"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className={cn(
              'p-1.5 rounded hover:bg-accent/10 transition-colors',
              isUnderline && 'bg-accent/20'
            )}
            aria-label="Sottolineato"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border-subtle mx-1" />
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-accent/10 transition-colors"
            aria-label="Lista puntata"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-1.5 rounded hover:bg-accent/10 transition-colors"
            aria-label="Lista numerata"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt('Inserisci URL:');
              if (url) execCommand('createLink', url);
            }}
            className="p-1.5 rounded hover:bg-accent/10 transition-colors"
            aria-label="Inserisci link"
          >
            <Link className="w-4 h-4" />
          </button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          id={editorId}
          contentEditable
          onInput={handleInput}
          onBlur={updateFormatting}
          className={cn(
            'min-h-[150px] p-3 bg-bg-surface text-text-primary',
            'focus:outline-none',
            'prose prose-invert max-w-none',
            '[&_ul]:list-disc [&_ul]:ml-6',
            '[&_ol]:list-decimal [&_ol]:ml-6',
            '[&_strong]:font-bold',
            '[&_em]:italic',
            '[&_u]:underline',
            '[&_a]:text-blue-400 [&_a]:underline',
            isOverLimit && 'ring-2 ring-red-400',
            className
          )}
          data-placeholder={placeholder}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperId}
          aria-required={required}
          suppressContentEditableWarning
        />

        {/* Character Count */}
        {maxLength && (
          <div className="px-3 py-2 bg-bg-soft border-t border-border-subtle text-xs text-text-secondary flex justify-between">
            <span>{characterCount} / {maxLength} caratteri</span>
            {isOverLimit && (
              <span className="text-red-400">Limite superato</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-sm text-red-400 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}

