'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from '@/lib/i18n/use-translations';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  showLabel?: boolean;
}

export function ShareButtons({
  url,
  title,
  description,
  className,
  variant = 'default',
  showLabel = true,
}: ShareButtonsProps) {
  const { t, locale } = useTranslations();
  const [copied, setCopied] = useState(false);

  // Usa URL corrente se non fornito
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : 'Tradelia');
  const shareDescription = description || '';

  const handleShare = async (platform: 'facebook' | 'twitter' | 'linkedin' | 'native') => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedDescription = encodeURIComponent(shareDescription);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${encodedDescription ? `&description=${encodedDescription}` : ''}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: shareTitle,
              text: shareDescription,
              url: shareUrl,
            });
            return;
          } catch (error) {
            // User cancelled or error occurred
            console.log('Share cancelled or error:', error);
          }
        }
        // Fallback to copy
        handleCopy();
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400,menubar=no,toolbar=no,resizable=yes,scrollbars=yes');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const buttonClass = variant === 'compact' 
    ? 'h-9 px-3 text-sm' 
    : variant === 'icon-only'
    ? 'h-10 w-10 p-0'
    : 'h-10 px-4';

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)} role="group" aria-label={t('share.title') || 'Condividi'}>
      {showLabel && variant !== 'icon-only' && (
        <span className="text-sm text-text-secondary mr-2">
          {t('share.title') || 'Condividi:'}
        </span>
      )}
      
      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('native')}
          className={cn(buttonClass, 'min-w-[44px] min-h-[44px]')}
          aria-label={t('share.native') || 'Condividi'}
        >
          {variant === 'icon-only' ? (
            <Share2 className="w-4 h-4" aria-hidden="true" />
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
              {variant !== 'compact' && (t('share.native') || 'Condividi')}
            </>
          )}
        </Button>
      )}

      {/* Facebook */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className={cn(buttonClass, 'min-w-[44px] min-h-[44px]')}
        aria-label={t('share.facebook') || 'Condividi su Facebook'}
      >
        {variant === 'icon-only' ? (
          <Facebook className="w-4 h-4" aria-hidden="true" />
        ) : (
          <>
            <Facebook className="w-4 h-4 mr-2" aria-hidden="true" />
            {variant !== 'compact' && 'Facebook'}
          </>
        )}
      </Button>

      {/* Twitter */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className={cn(buttonClass, 'min-w-[44px] min-h-[44px]')}
        aria-label={t('share.twitter') || 'Condividi su Twitter'}
      >
        {variant === 'icon-only' ? (
          <Twitter className="w-4 h-4" aria-hidden="true" />
        ) : (
          <>
            <Twitter className="w-4 h-4 mr-2" aria-hidden="true" />
            {variant !== 'compact' && 'Twitter'}
          </>
        )}
      </Button>

      {/* LinkedIn */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className={cn(buttonClass, 'min-w-[44px] min-h-[44px]')}
        aria-label={t('share.linkedin') || 'Condividi su LinkedIn'}
      >
        {variant === 'icon-only' ? (
          <Linkedin className="w-4 h-4" aria-hidden="true" />
        ) : (
          <>
            <Linkedin className="w-4 h-4 mr-2" aria-hidden="true" />
            {variant !== 'compact' && 'LinkedIn'}
          </>
        )}
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className={cn(buttonClass, 'min-w-[44px] min-h-[44px]')}
        aria-label={t('share.copyLink') || 'Copia link'}
      >
        {variant === 'icon-only' ? (
          copied ? (
            <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
          ) : (
            <LinkIcon className="w-4 h-4" aria-hidden="true" />
          )
        ) : (
          <>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-400" aria-hidden="true" />
                {variant !== 'compact' && (t('share.copied') || 'Copiato!')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
                {variant !== 'compact' && (t('share.copyLink') || 'Copia link')}
              </>
            )}
          </>
        )}
      </Button>
    </div>
  );
}
