'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  FileText,
  ExternalLink,
  Code,
  Link2,
  Tag,
  Layers,
  ChevronRight,
  Printer,
  Download,
  Search,
} from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { getGlossaryTerm } from '@/lib/glossary/terms';
import type { GlossaryTerm as GlossaryTermType } from '@/lib/glossary/terms';
import { formatTextIntoParagraphs } from '@/lib/glossary/text-formatter';
import type { AcademicSource } from '@/lib/glossary/tradelia-glossary-structure';
import Image from 'next/image';

interface GlossaryTerm {
  title: string;
  what: string; // Definizione accademica precisa
  source: string; // Fonti accademiche
  whatDoes?: string; // Cosa fa - spiegazione Tradelia AI semplice ma esaustiva
  howToUse?: string; // Come si usa - spiegazione Tradelia AI semplice ma esaustiva
  // Nuova struttura Tradelia (prioritaria se presente)
  academicDefinition?: {
    what: string;
    source: string | AcademicSource[];
    academicContext?: string;
  };
  tradeliaExplanation?: {
    whatDoes: string;
    howToUse: string;
    practicalExample?: string;
    commonMistakes?: string;
  };
  // Legacy support
  technical?: string; // Deprecated: use whatDoes + howToUse
  how?: string; // Deprecated: use whatDoes + howToUse
  relatedTerms?: string[]; // Termini correlati (opzionale)
  category?: string;
  tags?: string[];
}

interface GlossaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  term: GlossaryTerm | null;
  onTermClick?: (termKey: string) => void; // Callback quando si clicca su un termine correlato
}

/**
 * Glossary Drawer Component
 * Drawer completo per mostrare termini del glossario con:
 * - Nome del termine (title)
 * - Definizione Accademica (what)
 * - Spiegazione Tecnica Tradelia AI (technical) - best practice educativa ma solida
 * - Fonti Accademiche (source)
 * - Termini Correlati (relatedTerms)
 * 
 * Best Practice:
 * - Focus trap per accessibilità
 * - Keyboard navigation (ESC, Tab)
 * - ARIA labels completi
 * - Responsive design
 * Riferimento: Material Design Drawer, WCAG 2.1 - Modal/Dialog
 */
export function GlossaryDrawer({ isOpen, onClose, term, onTermClick }: GlossaryDrawerProps) {
  const { t } = useTranslations();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentScrollableRef = useRef<HTMLDivElement>(null);
  const [relatedTermsData, setRelatedTermsData] = useState<GlossaryTermType[]>([]);

  // Blocca scroll quando drawer è aperto (Best Practice: Prevent body scroll)
  useEffect(() => {
    if (isOpen) {
      // Salva lo scroll corrente
      const scrollY = window.scrollY;
      // Blocca scroll body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Ripristina scroll body
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      // Cleanup: ripristina sempre
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

  // Carica termini correlati
  useEffect(() => {
    if (!term?.relatedTerms || term.relatedTerms.length === 0) {
      setRelatedTermsData([]);
      return;
    }

    const loadRelatedTerms = async () => {
      const terms = await Promise.all(
        term.relatedTerms!.map(async (termKey) => {
          const termData = await getGlossaryTerm(termKey);
          return termData ? { key: termKey, term: termData } : null;
        })
      );
      setRelatedTermsData(
        terms
          .filter((t): t is { key: string; term: GlossaryTermType } => t !== null)
          .map((t) => t.term)
      );
    };

    loadRelatedTerms();
  }, [term?.relatedTerms]);

  // Focus trap e gestione tastiera migliorata
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC: chiudi drawer
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Solo se il contenuto è focalizzato
      if (document.activeElement === contentScrollableRef.current) {
        // Frecce: scroll fluido
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (contentScrollableRef.current) {
            contentScrollableRef.current.scrollBy({ top: 80, behavior: 'smooth' });
          }
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (contentScrollableRef.current) {
            contentScrollableRef.current.scrollBy({ top: -80, behavior: 'smooth' });
          }
          return;
        }
        
        // Page Down/Up: scroll pagina
        if (e.key === 'PageDown') {
          e.preventDefault();
          if (contentScrollableRef.current) {
            const viewportHeight = contentScrollableRef.current.clientHeight;
            contentScrollableRef.current.scrollBy({ top: viewportHeight * 0.9, behavior: 'smooth' });
          }
          return;
        }
        if (e.key === 'PageUp') {
          e.preventDefault();
          if (contentScrollableRef.current) {
            const viewportHeight = contentScrollableRef.current.clientHeight;
            contentScrollableRef.current.scrollBy({ top: -viewportHeight * 0.9, behavior: 'smooth' });
          }
          return;
        }
        
        // Home/End: inizio/fine
        if (e.key === 'Home') {
          e.preventDefault();
          if (contentScrollableRef.current) {
            contentScrollableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
          return;
        }
        if (e.key === 'End') {
          e.preventDefault();
          if (contentScrollableRef.current) {
            contentScrollableRef.current.scrollTo({ top: contentScrollableRef.current.scrollHeight, behavior: 'smooth' });
          }
          return;
        }
      }
    };

    // Focus sul contenuto scrollabile quando si apre (Best Practice: Keyboard Navigation)
    const timer = setTimeout(() => {
      if (contentScrollableRef.current) {
        contentScrollableRef.current.focus();
        contentScrollableRef.current.scrollTop = 0;
        // Scroll al top per garantire che l'utente veda l'inizio del contenuto
        contentScrollableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  // Focus trap con Tab (Best Practice: WCAG 2.1 Level AA)
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const scrollableElement = drawer.querySelector<HTMLElement>('.overflow-y-auto');
    
    // Get all focusable elements
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    
    const allFocusableElements = Array.from(
      drawer.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => {
      // Filter out hidden elements
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      return true;
    });

    if (allFocusableElements.length === 0) return;

    const firstElement = allFocusableElements[0];
    const lastElement = allFocusableElements[allFocusableElements.length - 1];

    // Focus first element when drawer opens (Best Practice: Focus management)
    const focusTimer = setTimeout(() => {
      firstElement?.focus();
    }, 100);

    // Tab trap (Best Practice: WCAG 2.1 - Focus order)
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Se il focus è fuori dal drawer, riportalo dentro
      if (!drawer.contains(document.activeElement)) {
        e.preventDefault();
        firstElement?.focus();
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab: go backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: go forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Frecce controllano solo lo scroll (non il focus)
    const handleArrowKeys = (e: KeyboardEvent) => {
      // Permetti sempre lo scroll con le frecce nello scrollable
      if (scrollableElement && scrollableElement.contains(document.activeElement)) {
        return; // Lascia che le frecce facciano scroll normalmente
      }
      
      // Se il focus è su un elemento focusabile, non interferire con le frecce
      // (permettere comportamento nativo per elementi come input, textarea, etc.)
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      )) {
        return; // Lascia comportamento nativo
      }
      
      // Per altri elementi, permettere scroll normale se lo scrollable è visibile
      if (scrollableElement) {
        return; // Non prevenire lo scroll
      }
    };

    window.addEventListener('keydown', handleTab);
    window.addEventListener('keydown', handleArrowKeys);
    
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleTab);
      window.removeEventListener('keydown', handleArrowKeys);
    };
  }, [isOpen]);

  // Inject print styles dynamically (Best Practice: Compatible with Next.js build)
  useEffect(() => {
    const printStyles = [
      '@media print {',
      '  * {',
      '    -webkit-print-color-adjust: exact !important;',
      '    print-color-adjust: exact !important;',
      '  }',
      '  html, body {',
      '    background: white !important;',
      '    margin: 0 !important;',
      '    padding: 0 !important;',
      '    width: 100% !important;',
      '    height: auto !important;',
      '  }',
      '  /* Hide everything except print container */',
      '  body > *:not(.glossary-print-container) {',
      '    display: none !important;',
      '    visibility: hidden !important;',
      '  }',
      '  /* Show print container */',
      '  .glossary-print-container {',
      '    display: block !important;',
      '    visibility: visible !important;',
      '    position: relative !important;',
      '    left: 0 !important;',
      '    top: 0 !important;',
      '    width: 100% !important;',
      '    max-width: 100% !important;',
      '    height: auto !important;',
      '    min-height: auto !important;',
      '    background: white !important;',
      '    color: #000 !important;',
      '    padding: 0 !important;',
      '    margin: 0 !important;',
      '    z-index: 999999 !important;',
      '    opacity: 1 !important;',
      '    page-break-after: auto !important;',
      '  }',
      '  /* Ensure all children are visible */',
      '  .glossary-print-container * {',
      '    visibility: visible !important;',
      '    opacity: 1 !important;',
      '    color: inherit !important;',
      '  }',
      '  .no-print, button, .backdrop, nav, .print-header-actions, [class*="backdrop"], [class*="bg-black"], [class*="fixed"][class*="inset"] { display: none !important; visibility: hidden !important; }',
      '  /* Hide drawer panel and all dark overlays */',
      '  [class*="drawer"], [class*="motion"], [class*="z-[999"] {',
      '    display: none !important;',
      '    visibility: hidden !important;',
      '  }',
      '  .print-header {',
      '    display: flex;',
      '    justify-content: space-between;',
      '    align-items: flex-start;',
      '    padding: 0 0 0.8cm 0;',
      '    margin-bottom: 1cm;',
      '    padding-bottom: 0.6cm;',
      '    border-bottom: 1px solid #e5e7eb !important;',
      '    background: white !important;',
      '    page-break-after: avoid;',
      '  }',
      '  .print-logo-container {',
      '    display: block !important;',
      '    visibility: visible !important;',
      '    background: white !important;',
      '  }',
      '  .print-logo {',
      '    height: 40px !important;',
      '    width: auto !important;',
      '    display: block !important;',
      '    visibility: visible !important;',
      '    opacity: 1 !important;',
      '    filter: none !important;',
      '  }',
      '  .print-logo img, .print-logo svg {',
      '    display: block !important;',
      '    visibility: visible !important;',
      '    opacity: 1 !important;',
      '    max-width: 160px !important;',
      '    height: auto !important;',
      '  }',
      '  .print-header-info {',
      '    text-align: right;',
      '    font-size: 9pt;',
      '    color: #475569;',
      '    line-height: 1.5;',
      '    font-weight: 500;',
      '    padding-left: 0.5cm;',
      '  }',
      '  .print-content {',
      '    padding: 0;',
      '    font-size: 11pt;',
      '    line-height: 1.7;',
      '    color: #111827;',
      '    margin-top: 0;',
      '  }',
      '  .print-title {',
      '    font-size: 28pt;',
      '    font-weight: 700;',
      '    color: #0f172a;',
      '    margin-bottom: 0.5cm;',
      '    margin-top: 0;',
      '    padding-top: 0;',
      '    line-height: 1.2;',
      '    page-break-after: avoid;',
      '  }',
      '  .print-meta {',
      '    font-size: 9pt;',
      '    color: #475569;',
      '    margin-bottom: 1cm;',
      '    margin-top: 0;',
      '    padding-top: 0.4cm;',
      '    padding-bottom: 0.5cm;',
      '    border-bottom: 1px solid #cbd5e1;',
      '  }',
      '  .print-section {',
      '    margin-bottom: 1.2cm;',
      '    margin-top: 0;',
      '    padding-top: 0;',
      '    page-break-inside: avoid;',
      '  }',
      '  .print-section-title {',
      '    font-size: 15pt;',
      '    font-weight: 600;',
      '    color: #0f172a;',
      '    margin-bottom: 0.5cm;',
      '    margin-top: 0;',
      '    padding-top: 0;',
      '    padding-bottom: 0.3cm;',
      '    border-bottom: 1px solid #cbd5e1;',
      '    letter-spacing: -0.01em;',
      '  }',
      '  .print-section-content {',
      '    font-size: 11pt;',
      '    line-height: 1.75;',
      '    color: #1e293b;',
      '    text-align: left;',
      '    margin-top: 0.3cm;',
      '    margin-bottom: 0;',
      '    padding: 0;',
      '  }',
      '  .print-paragraph {',
      '    margin-bottom: 0.5cm;',
      '    margin-top: 0;',
      '    padding: 0;',
      '    text-align: left;',
      '    max-width: 100%;',
      '    word-spacing: 0.05em;',
      '    letter-spacing: 0.01em;',
      '  }',
      '  .print-paragraph:last-child {',
      '    margin-bottom: 0;',
      '  }',
      '  .print-sources {',
      '    margin-top: 1.2cm;',
      '    margin-bottom: 0;',
      '    padding-top: 0.8cm;',
      '    padding-bottom: 0;',
      '    border-top: 1px solid #e5e7eb;',
      '    page-break-inside: avoid;',
      '  }',
      '  .print-source-item {',
      '    font-size: 9pt;',
      '    font-family: "Courier New", monospace;',
      '    color: #4b5563;',
      '    margin-bottom: 0.4cm;',
      '    margin-top: 0;',
      '    padding-left: 1em;',
      '    padding-right: 0;',
      '    text-indent: -1em;',
      '  }',
      '  .print-source-item:last-child {',
      '    margin-bottom: 0;',
      '  }',
      '  .print-footer {',
      '    position: fixed;',
      '    bottom: 0;',
      '    left: 0;',
      '    right: 0;',
      '    padding: 0.5cm 0;',
      '    border-top: 1px solid #cbd5e1;',
      '    font-size: 8pt;',
      '    color: #64748b;',
      '    text-align: center;',
      '    background: white;',
      '    font-weight: 500;',
      '  }',
      '  /* Professional print layout - A4 format with optimized margins */',
      '  @page {',
      '    size: A4;',
      '    margin: 1.5cm 2cm;',
      '    background: white;',
      '  }',
      '  .print-section, .print-source-item { page-break-inside: avoid; }',
      '  .print-tags {',
      '    display: flex;',
      '    flex-wrap: wrap;',
      '    gap: 0.25cm;',
      '    margin-bottom: 0.4cm;',
      '    margin-top: 0.3cm;',
      '    padding: 0;',
      '  }',
      '  .print-tag {',
      '    font-size: 8pt;',
      '    padding: 0.15cm 0.35cm;',
      '    background: #f3f4f6;',
      '    border: 1px solid #d1d5db;',
      '    border-radius: 3px;',
      '    color: #4b5563;',
      '    margin: 0;',
      '  }',
      '}',
    ].join('\n');

    const styleId = 'glossary-print-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = printStyles;

    return () => {
      // Cleanup: remove style element when component unmounts
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, []);

  if (!term) return null;

  // Estrai dati dalla nuova struttura Tradelia o usa struttura vecchia (compatibilità)
  const academicWhat = term.academicDefinition?.what || term.what;
  const academicSource = term.academicDefinition?.source || term.source;
  const whatDoes = term.tradeliaExplanation?.whatDoes || term.whatDoes;
  const howToUse = term.tradeliaExplanation?.howToUse || term.howToUse;
  const practicalExample = term.tradeliaExplanation?.practicalExample;
  const commonMistakes = term.tradeliaExplanation?.commonMistakes;

  // Handle print - create new window with print content
  const handlePrint = async () => {
    // Load white label customization if available
    let logoUrl = `${window.location.origin}/logos/tradelia-logo-variant-1-wordmark.svg`;
    let headerText = 'Glossario Finanziario Tradelia';
    let footerText = `Glossario Tradelia • ${new Date().getFullYear()} • Fonti accademiche verificate`;
    
    try {
      const response = await fetch('/api/pdf/customization');
      if (response.ok) {
        const customization = await response.json();
        if (customization.logo_url) {
          logoUrl = customization.logo_url;
        }
        if (customization.header_text) {
          headerText = customization.header_text;
        }
        if (customization.footer_text) {
          footerText = customization.footer_text;
        }
      }
    } catch (error) {
      // Use default Tradelia branding
      console.log('Using default Tradelia branding for print');
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Glossario - ${term.title}</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm 2cm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #000;
      background: white;
      padding: 0;
      margin: 0;
      max-width: 100%;
      overflow-x: hidden;
    }
    .print-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 0.6cm;
      margin-bottom: 1cm;
      border-bottom: 1px solid #e5e7eb;
      page-break-after: avoid;
    }
    .print-logo-container {
      display: block;
    }
    .print-logo {
      height: 40px;
      width: auto;
      max-width: 160px;
      display: block;
      filter: brightness(0) saturate(100%);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Logo variant for print - black/grayscale */
    .print-logo[data-print-variant="true"] {
      filter: brightness(0) saturate(100%) invert(0%);
    }
    .print-header-info {
      text-align: right;
      font-size: 9pt;
      color: #475569;
      line-height: 1.5;
      font-weight: 500;
    }
    .print-content {
      padding: 0;
      margin: 0;
      font-size: 11pt;
      line-height: 1.7;
      color: #111827;
      width: 100%;
      max-width: 100%;
      overflow: visible;
    }
    .print-title {
      font-size: 28pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5cm;
      line-height: 1.2;
    }
    .print-meta {
      font-size: 9pt;
      color: #475569;
      margin-bottom: 1cm;
      padding-top: 0.4cm;
      padding-bottom: 0.5cm;
      border-bottom: 1px solid #cbd5e1;
    }
    .print-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25cm;
      margin-top: 0.3cm;
    }
    .print-tag {
      font-size: 8pt;
      padding: 0.15cm 0.35cm;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 3px;
      color: #4b5563;
    }
    .print-section {
      margin-bottom: 1.2cm;
      page-break-inside: avoid;
      orphans: 3;
      widows: 3;
    }
    .print-section-title {
      page-break-after: avoid;
      break-after: avoid;
    }
    .print-section-content {
      page-break-inside: auto;
      break-inside: auto;
    }
    /* Prevent breaking inside important sections */
    .print-section:has(.print-section-title) {
      page-break-inside: avoid;
    }
    .print-section-title {
      font-size: 15pt;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 0.5cm;
      padding-bottom: 0.3cm;
      border-bottom: 1px solid #cbd5e1;
    }
    .print-section-content {
      font-size: 11pt;
      line-height: 1.75;
      color: #1e293b;
      text-align: left;
      margin-top: 0.3cm;
      white-space: normal;
    }
    .print-paragraph {
      margin-bottom: 0.5cm;
      margin-top: 0;
      padding: 0;
      text-align: left;
      max-width: 100%;
      word-spacing: 0.05em;
      letter-spacing: 0.01em;
    }
    .print-paragraph:last-child {
      margin-bottom: 0;
    }
    .print-sources {
      margin-top: 1.2cm;
      padding-top: 0.8cm;
      border-top: 1px solid #e5e7eb;
    }
    .print-source-item {
      font-size: 9pt;
      font-family: 'Courier New', monospace;
      color: #4b5563;
      margin-bottom: 0.4cm;
      padding-left: 1em;
      text-indent: -1em;
    }
    .print-footer {
      margin-top: 2cm;
      padding-top: 0.5cm;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      text-align: center;
      background: white;
      page-break-inside: avoid;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .print-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="print-logo-container">
      <img src="${logoUrl}" alt="Logo" class="print-logo" data-print-variant="true" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTYwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjgiIHk9IjI0IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSI2MDAiIGZpbGw9IiMwMDAwMDAiPlRyYWRlbGlhPC90ZXh0Pjwvc3ZnPg==';">
    </div>
    <div class="print-header-info">
      <div style="font-weight: 600; margin-bottom: 0.2cm;">${headerText}</div>
      <div>${new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
  </div>

  <div class="print-content">
    <h1 class="print-title">${term.title}</h1>
    
    <div class="print-meta">
      ${term.category ? `<div style="margin-bottom: 0.25cm;"><strong>Categoria:</strong> ${term.category}</div>` : ''}
      ${term.tags && term.tags.length > 0 ? `
        <div class="print-tags">
          ${term.tags.map(tag => `<span class="print-tag">#${tag}</span>`).join('')}
        </div>
      ` : ''}
    </div>

    <section class="print-section">
      <h2 class="print-section-title">Definizione Accademica</h2>
      <div class="print-section-content">${formatTextIntoParagraphs(academicWhat || '').map(p => `<p class="print-paragraph">${p}</p>`).join('')}</div>
    </section>

    ${(whatDoes || howToUse || term.technical || term.how) ? `
      <section class="print-section">
        <h2 class="print-section-title">Spiegazione Tradelia AI</h2>
        ${whatDoes ? `
          <div style="margin-bottom: 0.8cm;">
            <h3 style="font-size: 13pt; font-weight: 600; color: #0f172a; margin-bottom: 0.3cm;">Cosa fa</h3>
            <div class="print-section-content">${formatTextIntoParagraphs(whatDoes || '').map(p => `<p class="print-paragraph">${p}</p>`).join('')}</div>
          </div>
        ` : ''}
        ${howToUse ? `
          <div style="margin-bottom: 0.8cm;">
            <h3 style="font-size: 13pt; font-weight: 600; color: #0f172a; margin-bottom: 0.3cm;">Come si usa</h3>
            <div class="print-section-content">${formatTextIntoParagraphs(howToUse || '').map(p => `<p class="print-paragraph">${p}</p>`).join('')}</div>
          </div>
        ` : ''}
        ${practicalExample ? `
          <div style="margin-bottom: 0.8cm; padding: 0.5cm; background-color: #f9fafb; border-left: 3px solid #3b82f6; border-radius: 4px;">
            <h3 style="font-size: 12pt; font-weight: 600; color: #0f172a; margin-bottom: 0.3cm;">Esempio Pratico</h3>
            <div class="print-section-content" style="font-size: 10pt;">${formatTextIntoParagraphs(practicalExample || '').map(p => `<p class="print-paragraph">${p}</p>`).join('')}</div>
          </div>
        ` : ''}
        ${commonMistakes ? `
          <div style="margin-bottom: 0.8cm; padding: 0.5cm; background-color: #fef2f2; border-left: 3px solid #ef4444; border-radius: 4px;">
            <h3 style="font-size: 12pt; font-weight: 600; color: #0f172a; margin-bottom: 0.3cm;">Errori Comuni da Evitare</h3>
            <div class="print-section-content" style="font-size: 10pt;">${formatTextIntoParagraphs(commonMistakes || '').map(p => `<p class="print-paragraph">${p}</p>`).join('')}</div>
          </div>
        ` : ''}
        ${!whatDoes && !howToUse && (term.technical || term.how) ? `
          <div class="print-section-content">${term.technical || term.how}</div>
        ` : ''}
      </section>
    ` : ''}

    ${relatedTermsData.length > 0 ? `
      <section class="print-section">
        <h2 class="print-section-title">Termini Correlati</h2>
        <div class="print-section-content">
          ${relatedTermsData.map((relatedTerm, index) => 
            `• ${relatedTerm.title}${relatedTerm.category ? ` (${relatedTerm.category})` : ''}`
          ).join('<br>')}
        </div>
      </section>
    ` : ''}

    <section class="print-sources">
      <h2 class="print-section-title">Riferimenti Bibliografici</h2>
      <div>
        ${Array.isArray(academicSource) 
          ? academicSource.map(source => {
              // Formato strutturato AcademicSource
              let citation = `${source.author} (${source.year}). ${source.title}`;
              if (source.journal) {
                citation += `. ${source.journal}`;
                if (source.volume) {
                  citation += ` ${source.volume}`;
                  if (source.issue) citation += `(${source.issue})`;
                }
                if (source.pages) citation += `, ${source.pages}`;
                citation += '.';
              }
              if (source.publisher) citation += ` ${source.publisher}.`;
              if (source.doi) citation += ` DOI: ${source.doi}`;
              if (source.isbn) citation += ` ISBN: ${source.isbn}`;
              return `<div class="print-source-item">${citation}</div>`;
            }).join('')
          : typeof academicSource === 'string' 
            ? academicSource.split('|').map(source => 
                `<div class="print-source-item">${source.trim()}</div>`
              ).join('')
            : ''
        }
      </div>
    </section>
  </div>

  <div class="print-footer">
    <div style="text-align: center; width: 100%;">
      ${footerText}
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.onafterprint = function() {
          window.close();
        };
      }, 250);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  return (
    <React.Fragment>
      {/* Print Version - Always in DOM, positioned off-screen, visible when printing */}
      <div className="glossary-print-container" style={{ 
        position: 'fixed',
        left: '-9999px',
        top: '0',
        width: '210mm',
        background: 'white',
        display: 'none'
      }} aria-hidden="true">
                {/* Print Header with Logo - Professional Layout */}
                <div className="print-header">
                  <div className="print-logo-container" style={{ display: 'block', visibility: 'visible' }}>
                    <img
                      src="/logos/tradelia-logo-variant-1-wordmark.svg"
                      alt="Tradelia"
                      style={{
                        height: '40px',
                        width: 'auto',
                        display: 'block',
                        visibility: 'visible',
                        opacity: 1,
                      }}
                      className="print-logo"
                    />
                  </div>
                  <div className="print-header-info">
                    <div style={{ fontWeight: 600, marginBottom: '0.2cm' }}>Glossario Finanziario Tradelia</div>
                    <div style={{ fontSize: '9pt' }}>{new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>

                {/* Print Content */}
                <div className="print-content">
                  {/* Print Title */}
                  <h1 className="print-title">{term.title}</h1>
                  
                  {/* Print Meta */}
                  <div className="print-meta">
                    {term.category && (
                      <div style={{ marginBottom: '0.25cm', marginTop: '0' }}>
                        <strong>Categoria:</strong> {term.category}
                      </div>
                    )}
                    {term.tags && term.tags.length > 0 && (
                      <div className="print-tags">
                        {term.tags.map((tag) => (
                          <span key={tag} className="print-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Definizione Accademica */}
                  <section className="print-section">
                    <h2 className="print-section-title">Definizione Accademica</h2>
                    <div className="print-section-content">
                      {academicWhat}
                    </div>
                  </section>

                  {/* Spiegazione Tradelia AI */}
                  {(whatDoes || howToUse || term.technical || term.how) && (
                    <section className="print-section">
                      <h2 className="print-section-title">Spiegazione Tradelia AI</h2>
                      {whatDoes && (
                        <div style={{ marginBottom: '0.8cm' }}>
                          <h3 style={{ fontSize: '13pt', fontWeight: 600, color: '#0f172a', marginBottom: '0.3cm' }}>Cosa fa</h3>
                          <div className="print-section-content" style={{ whiteSpace: 'pre-line' }}>
                            {whatDoes}
                          </div>
                        </div>
                      )}
                      {howToUse && (
                        <div style={{ marginBottom: '0.8cm' }}>
                          <h3 style={{ fontSize: '13pt', fontWeight: 600, color: '#0f172a', marginBottom: '0.3cm' }}>Come si usa</h3>
                          <div className="print-section-content" style={{ whiteSpace: 'pre-line' }}>
                            {howToUse}
                          </div>
                        </div>
                      )}
                      {practicalExample && (
                        <div style={{ marginBottom: '0.8cm', padding: '0.5cm', backgroundColor: '#f9fafb', borderLeft: '3px solid #3b82f6', borderRadius: '4px' }}>
                          <h3 style={{ fontSize: '12pt', fontWeight: 600, color: '#0f172a', marginBottom: '0.3cm' }}>Esempio Pratico</h3>
                          <div className="print-section-content" style={{ whiteSpace: 'pre-line', fontSize: '10pt' }}>
                            {practicalExample}
                          </div>
                        </div>
                      )}
                      {commonMistakes && (
                        <div style={{ marginBottom: '0.8cm', padding: '0.5cm', backgroundColor: '#fef2f2', borderLeft: '3px solid #ef4444', borderRadius: '4px' }}>
                          <h3 style={{ fontSize: '12pt', fontWeight: 600, color: '#0f172a', marginBottom: '0.3cm' }}>Errori Comuni da Evitare</h3>
                          <div className="print-section-content" style={{ whiteSpace: 'pre-line', fontSize: '10pt' }}>
                            {commonMistakes}
                          </div>
                        </div>
                      )}
                      {!whatDoes && !howToUse && (term.technical || term.how) && (
                        <div className="print-section-content" style={{ whiteSpace: 'pre-line' }}>
                          {term.technical || term.how}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Termini Correlati */}
                  {relatedTermsData.length > 0 && (
                    <section className="print-section">
                      <h2 className="print-section-title">Termini Correlati</h2>
                      <div className="print-section-content">
                        {relatedTermsData.map((relatedTerm, index) => (
                          <div key={index} style={{ marginBottom: '0.25cm', marginTop: index === 0 ? '0' : '0.25cm' }}>
                            • {relatedTerm.title}
                            {relatedTerm.category && ` (${relatedTerm.category})`}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Fonti Accademiche */}
                  <section className="print-sources">
                    <h2 className="print-section-title">Riferimenti Bibliografici</h2>
                    <div>
                      {Array.isArray(academicSource) 
                        ? academicSource.map((source, index) => {
                            // Formato strutturato AcademicSource
                            let citation = `${source.author} (${source.year}). ${source.title}`;
                            if (source.journal) {
                              citation += `. ${source.journal}`;
                              if (source.volume) {
                                citation += ` ${source.volume}`;
                                if (source.issue) citation += `(${source.issue})`;
                              }
                              if (source.pages) citation += `, ${source.pages}`;
                              citation += '.';
                            }
                            if (source.publisher) citation += ` ${source.publisher}.`;
                            if (source.doi) citation += ` DOI: ${source.doi}`;
                            if (source.isbn) citation += ` ISBN: ${source.isbn}`;
                            return (
                              <div key={index} className="print-source-item">
                                {citation}
                              </div>
                            );
                          })
                        : typeof academicSource === 'string'
                          ? academicSource.split('|').map((source, index) => (
                              <div key={index} className="print-source-item">
                                {source.trim()}
                              </div>
                            ))
                          : null
                      }
                    </div>
                  </section>
                </div>

                {/* Print Footer - Professional, no URL */}
                <div className="print-footer">
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    Glossario Tradelia • {new Date().getFullYear()} • Fonti accademiche verificate
                  </div>
                </div>
              </div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] sm:backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-full sm:max-w-lg bg-bg-surface border-l border-border-default shadow-2xl z-[9999] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="glossary-drawer-title"
              aria-describedby="glossary-drawer-description"
            >
            {/* Header - Academic Style - Design System */}
            <div className="no-print border-b border-border-default bg-bg-surface">
              {/* Breadcrumb Navigation - Improved Spacing and Readability */}
              <div className="px-4 sm:px-6 pt-3 pb-2">
                <nav 
                  className="flex items-center gap-1.5 sm:gap-2 text-xs text-text-tertiary overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
                  aria-label="Breadcrumb"
                >
                  <span className="hover:text-text-secondary whitespace-nowrap flex-shrink-0">Glossario</span>
                  {term.category && (
                    <>
                      <ChevronRight className="w-3 h-3 flex-shrink-0 text-text-tertiary/60" aria-hidden="true" />
                      <span className="text-text-secondary truncate max-w-[120px] sm:max-w-[200px]" title={term.category}>
                        {term.category}
                      </span>
                    </>
                  )}
                  <ChevronRight className="w-3 h-3 flex-shrink-0 text-text-tertiary/60" aria-hidden="true" />
                  <span className="text-text-primary font-medium truncate max-w-[180px] sm:max-w-[300px] md:max-w-none" title={term.title}>
                    {term.title}
                  </span>
                </nav>
              </div>
              
              {/* Title Section - Improved Spacing */}
              <div className="flex items-start justify-between px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-bg-soft border border-border-accent flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 id="glossary-drawer-title" className="text-lg sm:text-xl font-bold text-text-primary mb-1.5 break-words">
                      {term.title}
                    </h2>
                    <p id="glossary-drawer-description" className="text-xs sm:text-sm text-text-secondary">
                      {term.category && (
                        <span className="inline-flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" aria-hidden="true" />
                          <span className="text-text-tertiary truncate">{term.category}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="print-header-actions flex items-center gap-2 ml-4">
                  <button
                    onClick={handlePrint}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Stampa definizione"
                    title="Stampa"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    aria-label={t('common.close') || 'Chiudi drawer'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Tags Bar */}
              {term.tags && term.tags.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {term.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-bg-soft text-accent border border-border-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Content - Academic Layout - Leggibilità ottimale con gerarchia visiva */}
            <div 
              ref={contentScrollableRef}
              tabIndex={0}
              role="region"
              aria-label="Contenuto glossario"
              className="no-print flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 bg-bg-surface" 
              style={{ 
                scrollbarWidth: 'thin'
              }}
            >
              {/* Spiegazione Accademica - Academic Style */}
              {/* Sezione Principale - Definizione Accademica */}
              <section className="mb-8 sm:mb-10" aria-labelledby="academic-section-title">
                {/* Header Sezione - Gerarchia Livello 1 */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 pb-4 sm:pb-5 border-b-2 border-border-strong">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-soft border-2 border-accent/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-accent" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h2 id="academic-section-title" className="text-lg sm:text-2xl font-bold text-text-primary mb-1.5 sm:mb-2">
                      {t('glossary.drawer.academicExplanation') || 'Definizione Accademica'}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-tertiary font-medium">Definizione precisa e verificata</p>
                  </div>
                </div>
                {/* Contenuto Sezione */}
                <div className="max-w-full sm:max-w-3xl">
                  {/* Paragrafi formattati per leggibilità ottimale */}
                  <div className="space-y-5 sm:space-y-5">
                    {formatTextIntoParagraphs(academicWhat).map((paragraph, idx) => (
                      <p 
                        key={idx}
                        className="text-[15px] sm:text-[15px] text-text-primary leading-[1.75] sm:leading-[1.7] font-normal tracking-[0.01em]"
                        style={{ 
                          maxWidth: '100%', // Mobile: usa tutta la larghezza disponibile
                          textAlign: 'left', // WCAG 2.2: allineamento sinistra raccomandato
                          wordSpacing: '0.05em', // WCAG 2.2: migliora leggibilità
                          marginBottom: idx < formatTextIntoParagraphs(academicWhat).length - 1 ? '1em' : '0' // Spacing ottimale mobile
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {term.academicDefinition?.academicContext && (
                    <div className="mt-6 sm:mt-6 p-5 sm:p-5 bg-bg-soft border-l-2 border-accent/40 rounded-r-md">
                      <p className="text-sm sm:text-sm text-text-secondary italic leading-[1.75] sm:leading-[1.7] font-normal max-w-full sm:max-w-[60ch]">
                        {(() => {
                          const paragraphs = formatTextIntoParagraphs(term.academicDefinition?.academicContext || '');
                          return paragraphs.map((p, idx) => (
                            <span key={idx}>
                              {p}
                              {idx < paragraphs.length - 1 && (
                                <>
                                  <br /><br />
                                </>
                              )}
                            </span>
                          ));
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Sezione Principale - Spiegazione Tradelia AI */}
              {(whatDoes || howToUse || term.technical || term.how) && (
                <section className="mb-8 sm:mb-10" aria-labelledby="tradelia-ai-section-title">
                  {/* Header Sezione - Gerarchia Livello 1 */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 pb-4 sm:pb-5 border-b-2 border-border-strong">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-soft border-2 border-accent/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Code className="w-6 h-6 sm:w-7 sm:h-7 text-accent" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h2 id="tradelia-ai-section-title" className="text-lg sm:text-2xl font-bold text-text-primary mb-1.5 sm:mb-2">
                        {t('glossary.drawer.tradeliaAIExplanation') || 'Spiegazione Tradelia AI'}
                      </h2>
                      <p className="text-xs sm:text-sm text-text-tertiary font-medium">Spiegazione educativa semplice ma completa</p>
                    </div>
                  </div>
                  {/* Sottosezioni - Gerarchia Livello 2 */}
                  <div className="space-y-8 sm:space-y-8">
                    {whatDoes && (
                      <div className="space-y-4 sm:space-y-4">
                        {/* Sottotitolo - Gerarchia Livello 2 */}
                        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 sm:mb-4 pb-2 border-b border-border-default">Cosa fa</h3>
                        <div className="max-w-full sm:max-w-3xl space-y-4 sm:space-y-4">
                          {formatTextIntoParagraphs(whatDoes).map((paragraph, idx) => (
                            <p 
                              key={idx}
                              className="text-sm sm:text-[15px] text-text-primary leading-[1.7] font-normal tracking-[0.01em]"
                              style={{ 
                                maxWidth: '65ch', // WCAG 2.2: 45-75 caratteri ottimale
                                textAlign: 'left', // WCAG 2.2: allineamento sinistra
                                wordSpacing: '0.05em', // WCAG 2.2: migliora leggibilità
                                marginBottom: idx < formatTextIntoParagraphs(whatDoes).length - 1 ? '0.875em' : '0' // Spacing compatto tra paragrafi
                              }}
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {howToUse && (
                      <div className="space-y-4 sm:space-y-4">
                        {/* Sottotitolo - Gerarchia Livello 2 */}
                        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-4 sm:mb-4 pb-2.5 border-b border-border-default">Come si usa</h3>
                        <div className="max-w-full sm:max-w-3xl space-y-4 sm:space-y-4">
                          {formatTextIntoParagraphs(howToUse).map((paragraph, idx) => (
                            <p 
                              key={idx}
                              className="text-[15px] sm:text-[15px] text-text-primary leading-[1.8] sm:leading-[1.75] font-normal tracking-[0.01em]"
                              style={{ 
                                maxWidth: '100%', // Mobile: usa tutta la larghezza disponibile
                                textAlign: 'left', // WCAG 2.2: allineamento sinistra
                                wordSpacing: '0.05em', // WCAG 2.2: migliora leggibilità
                                marginBottom: idx < formatTextIntoParagraphs(howToUse).length - 1 ? '1.25em' : '0' // Spacing ottimale
                              }}
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {practicalExample && (
                      <div className="space-y-4 sm:space-y-4 p-5 sm:p-5 bg-bg-soft border-l-2 border-accent/40 rounded-r-md">
                        {/* Sottotitolo Card - Gerarchia Livello 2 */}
                        <h3 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2.5 mb-4 sm:mb-4">
                          <Sparkles className="w-5 h-5 sm:w-5 sm:h-5 text-accent" />
                          Esempio Pratico
                        </h3>
                        <div className="max-w-full sm:max-w-3xl space-y-4 sm:space-y-4">
                          {formatTextIntoParagraphs(practicalExample).map((paragraph, idx) => (
                            <p 
                              key={idx}
                              className="text-[15px] sm:text-[15px] text-text-primary leading-[1.8] sm:leading-[1.75] font-normal tracking-[0.01em]"
                              style={{ 
                                maxWidth: '100%', // Mobile: usa tutta la larghezza disponibile
                                textAlign: 'left', // WCAG 2.2: allineamento sinistra
                                wordSpacing: '0.05em', // WCAG 2.2: migliora leggibilità
                                marginBottom: idx < formatTextIntoParagraphs(practicalExample).length - 1 ? '1.25em' : '0' // Spacing ottimale
                              }}
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {commonMistakes && (
                      <div className="space-y-4 sm:space-y-4 p-5 sm:p-5 bg-bg-soft border-l-2 border-error/40 rounded-r-md">
                        {/* Sottotitolo Card - Gerarchia Livello 2 */}
                        <h3 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2.5 mb-4 sm:mb-4">
                          <FileText className="w-5 h-5 sm:w-5 sm:h-5 text-error" />
                          Errori Comuni da Evitare
                        </h3>
                        <div className="max-w-full sm:max-w-3xl space-y-4 sm:space-y-4">
                          {formatTextIntoParagraphs(commonMistakes).map((paragraph, idx) => (
                            <p 
                              key={idx}
                              className="text-[15px] sm:text-[15px] text-text-primary leading-[1.8] sm:leading-[1.75] font-normal tracking-[0.01em]"
                              style={{ 
                                maxWidth: '100%', // Mobile: usa tutta la larghezza disponibile
                                textAlign: 'left', // WCAG 2.2: allineamento sinistra
                                wordSpacing: '0.05em', // WCAG 2.2: migliora leggibilità
                                marginBottom: idx < formatTextIntoParagraphs(commonMistakes).length - 1 ? '1.25em' : '0' // Spacing ottimale
                              }}
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {!whatDoes && !howToUse && (term.technical || term.how) && (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line font-normal">
                          {term.technical || term.how}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Termini Correlati - Academic Style */}
              {relatedTermsData.length > 0 && (
                <section className="space-y-3" aria-labelledby="related-terms-section-title">
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-5 h-5 text-indigo-600 dark:text-cyan-300" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 id="related-terms-section-title" className="text-base font-bold text-text-primary">
                        {t('glossary.drawer.relatedTerms') || 'Termini Correlati'}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-0.5">Related Terms & Concepts</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {relatedTermsData.map((relatedTerm, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (onTermClick) {
                            const termKey = term.relatedTerms?.[index];
                            if (termKey) {
                              onTermClick(termKey);
                            }
                          }
                        }}
                        className="px-4 py-2.5 text-sm font-medium text-text-primary bg-bg-soft border border-border-subtle rounded-lg hover:bg-bg-base hover:border-border-default hover:shadow-sm transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        aria-label={`Apri definizione di ${relatedTerm.title}`}
                      >
                        <span className="block truncate">{relatedTerm.title}</span>
                        {relatedTerm.category && (
                          <span className="block text-xs text-text-tertiary mt-1 truncate">{relatedTerm.category}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Sezione Riferimenti Bibliografici - Academic Style */}
              {academicSource && (
                <section className="mb-8 sm:mb-10" aria-labelledby="sources-section-title">
                  {/* Header Sezione - Gerarchia Livello 1 */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 pb-4 sm:pb-5 border-b-2 border-border-strong">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-bg-soft border-2 border-accent/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-accent" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h2 id="sources-section-title" className="text-lg sm:text-2xl font-bold text-text-primary mb-1.5 sm:mb-2">
                        {t('glossary.drawer.sources') || 'Riferimenti Bibliografici'}
                      </h2>
                      <p className="text-xs sm:text-sm text-text-tertiary font-medium">Fonti accademiche verificate</p>
                    </div>
                  </div>
                  {/* Lista Riferimenti - Formato Accademico */}
                  <div className="space-y-5 sm:space-y-6">
                    {Array.isArray(academicSource) ? (
                      // Formato strutturato AcademicSource[]
                      academicSource.map((source, index) => (
                        <div key={index} className="p-5 sm:p-6 bg-bg-soft border-l-2 border-accent/40 rounded-r-md shadow-sm">
                          <div className="space-y-3">
                            {/* Citazione principale - Formato Accademico */}
                            <p className="text-sm sm:text-[15px] text-text-primary leading-[1.8] font-normal">
                              <span className="font-semibold">{source.author}</span> ({source.year}). <em className="not-italic font-medium">{source.title}</em>
                              {source.journal && (
                                <>.
                                  <span className="font-semibold"> {source.journal}</span>
                                  {source.volume && (
                                    <> <span className="font-normal">{source.volume}</span>
                                      {source.issue && `(${source.issue})`}
                                    </>
                                  )}
                                  {source.pages && `, ${source.pages}`}.
                                </>
                              )}
                              {source.publisher && (
                                <>. {source.publisher}.</>
                              )}
                            </p>
                            {/* Metadata accademici */}
                            <div className="flex flex-wrap gap-3 text-xs text-text-tertiary mt-2">
                              {source.type && (
                                <span className="px-2 py-1 bg-bg-surface rounded border border-border-default">
                                  {source.type === 'peer-reviewed' ? 'Peer-reviewed' : 
                                   source.type === 'textbook' ? 'Textbook' :
                                   source.type === 'primary-source' ? 'Fonte primaria' :
                                   source.type === 'secondary-source' ? 'Fonte secondaria' :
                                   source.type === 'working-paper' ? 'Working paper' :
                                   source.type === 'book-chapter' ? 'Capitolo libro' : source.type}
                                </span>
                              )}
                              {source.primary && (
                                <span className="px-2 py-1 bg-accent/20 text-accent rounded border border-accent/30">
                                  Fonte primaria
                                </span>
                              )}
                              {source.jel && (
                                <span className="px-2 py-1 bg-bg-surface rounded border border-border-default">
                                  JEL: {source.jel}
                                </span>
                              )}
                            </div>
                            {/* Link DOI/ISBN/URL */}
                            <div className="flex flex-wrap gap-3 mt-3">
                              {source.doi && (
                                <a
                                  href={`https://doi.org/${source.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm text-accent hover:text-accent-hover underline flex items-center gap-1.5"
                                  aria-label={`DOI: ${source.doi}`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  DOI: {source.doi}
                                </a>
                              )}
                              {source.isbn && (
                                <span className="text-xs sm:text-sm text-text-tertiary">
                                  ISBN: {source.isbn}
                                </span>
                              )}
                              {source.url && !source.doi && (
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs sm:text-sm text-accent hover:text-accent-hover underline flex items-center gap-1.5"
                                  aria-label="Link alla fonte"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Link
                                </a>
                              )}
                              {source.accessedDate && (
                                <span className="text-xs text-text-tertiary">
                                  Accesso: {new Date(source.accessedDate).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Formato stringa legacy (compatibilità)
                      typeof academicSource === 'string' && academicSource.split('|').map((source, index) => (
                        <div key={index} className="p-5 sm:p-6 bg-bg-soft border-l-2 border-accent/40 rounded-r-md shadow-sm">
                          <p className="text-sm sm:text-[15px] text-text-primary leading-[1.8] font-normal">
                            {source.trim()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Footer - Academic Style */}
            <div className="no-print p-6 border-t border-border-subtle bg-bg-surface">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-text-tertiary">
                  Glossario Tradelia • {new Date().getFullYear()}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-text-primary bg-bg-soft hover:bg-bg-base border border-border-subtle rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  {t('common.close') || 'Chiudi'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </React.Fragment>
  );
}

