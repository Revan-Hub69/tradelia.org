/**
 * Vitest Configuration
 * FASE 3: Testing Framework Setup
 * Best Practice: Testing early previene regressioni
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom', // Per test DOM/browser APIs
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        '*.config.ts',
        'dist/',
        'build/',
        'archivio/',
        'report/',
        'docs/',
        '.git/'
      ]
    },
    
    // Glob patterns
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/', 'dist/', 'build/'],
    
    // Setup files
    setupFiles: ['./tests/setup.js'],
    
    // Timeout
    testTimeout: 10000,
    
    // Reporter
    reporters: ['verbose', 'html'],
    
    // Output directory
    outputFile: {
      html: './tests/coverage/index.html'
    }
  }
});

