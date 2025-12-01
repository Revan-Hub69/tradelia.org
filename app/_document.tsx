import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document per sopprimere completamente gli hydration warnings
 * Questo è l'ultimo tentativo per risolvere l'errore #310
 */
export default function Document() {
  return (
    <Html lang="it" suppressHydrationWarning>
      <Head />
      <body suppressHydrationWarning>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

