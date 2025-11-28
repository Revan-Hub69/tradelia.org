'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b border-border bg-bg-base/85 backdrop-blur-xl supports-[backdrop-filter]:bg-bg-base/75"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container flex h-16 items-center justify-between px-8">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform duration-300 hover:-translate-y-0.5"
        >
          <div className="relative">
            <Image
              src="/logos/tradelia-logo.svg"
              alt="Tradelia AI"
              width={200}
              height={50}
              className="h-10 w-auto brightness-95 drop-shadow-[0_0_10px_rgba(0,188,212,0.2)] transition-all duration-300 group-hover:brightness-100 group-hover:drop-shadow-[0_0_15px_rgba(0,188,212,0.4)] group-hover:scale-105"
              priority
            />
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full" />
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Button asChild variant="secondary" size="sm" className="group">
            <Link href="/dashboard">
              <LayoutDashboard className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}
