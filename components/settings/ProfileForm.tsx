'use client';

import { useState, useEffect } from 'react';
import { User, Save, Loader2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfileData {
  display_name: string | null;
  bio: string | null;
  email?: string;
}

/**
 * Profile Form Component
 * Form per modificare profilo utente
 */
export function ProfileForm() {
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    display_name: '',
    bio: '',
    email: '',
  });

  // Fetch current profile
  const { data: profile, loading, retry } = useApi<ProfileData>(
    '/api/settings',
    {
      cacheTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: formData.display_name?.trim() || null,
          bio: formData.bio?.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore aggiornamento profilo');
      }

      toast.success(t('dashboard.settings.profile.success') || 'Profilo aggiornato con successo');
      retry();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('dashboard.settings.profile.error') || 'Errore durante l\'aggiornamento del profilo'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="display_name">
          {t('dashboard.settings.profile.displayName') || 'Nome Visualizzato'}
        </Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          value={formData.display_name || ''}
          onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          placeholder={t('dashboard.settings.profile.displayNamePlaceholder') || 'Il tuo nome pubblico'}
          className="mt-1"
          maxLength={100}
        />
        <p className="text-xs text-text-tertiary mt-1">
          {t('dashboard.settings.profile.displayNameHint') || 'Questo nome sarà visibile ad altri utenti'}
        </p>
      </div>

      <div>
        <Label htmlFor="email">
          {t('dashboard.settings.profile.email') || 'Email'}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          disabled
          className="mt-1 bg-bg-surface opacity-60 cursor-not-allowed"
        />
        <p className="text-xs text-text-tertiary mt-1">
          {t('dashboard.settings.profile.emailHint') || 'L\'email non può essere modificata qui. Contatta il supporto per cambiarla.'}
        </p>
      </div>

      <div>
        <Label htmlFor="bio">
          {t('dashboard.settings.profile.bio') || 'Biografia'}
        </Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder={t('dashboard.settings.profile.bioPlaceholder') || 'Racconta qualcosa di te...'}
          className="mt-1"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-text-tertiary mt-1">
          {(formData.bio?.length || 0)}/500 {t('dashboard.settings.profile.characters') || 'caratteri'}
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('common.saving') || 'Salvataggio...'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('common.save') || 'Salva'}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

