'use client';

import { useState } from 'react';
import { Shield, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Password Form Component
 * Form per cambiare password
 */
export function PasswordForm() {
  const { t } = useTranslations();
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = t('dashboard.settings.security.errors.currentRequired') || 'Password attuale richiesta';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('dashboard.settings.security.errors.newRequired') || 'Nuova password richiesta';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('dashboard.settings.security.errors.passwordTooShort') || 'La password deve essere di almeno 8 caratteri';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('dashboard.settings.security.errors.passwordsDontMatch') || 'Le password non corrispondono';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = t('dashboard.settings.security.errors.samePassword') || 'La nuova password deve essere diversa dalla corrente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore cambio password');
      }

      toast.success(t('dashboard.settings.security.success') || 'Password cambiata con successo');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('dashboard.settings.security.error') || 'Errore durante il cambio password'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="currentPassword">
          {t('dashboard.settings.security.currentPassword') || 'Password Attuale'} *
        </Label>
        <div className="relative mt-1">
          <Input
            id="currentPassword"
            name="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className={errors.currentPassword ? 'border-error' : ''}
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          >
            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-xs text-error mt-1">{errors.currentPassword}</p>
        )}
      </div>

      <div>
        <Label htmlFor="newPassword">
          {t('dashboard.settings.security.newPassword') || 'Nuova Password'} *
        </Label>
        <div className="relative mt-1">
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className={errors.newPassword ? 'border-error' : ''}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          >
            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-error mt-1">{errors.newPassword}</p>
        )}
        <p className="text-xs text-text-tertiary mt-1">
          {t('dashboard.settings.security.passwordHint') || 'Minimo 8 caratteri'}
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">
          {t('dashboard.settings.security.confirmPassword') || 'Conferma Nuova Password'} *
        </Label>
        <div className="relative mt-1">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={errors.confirmPassword ? 'border-error' : ''}
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>
        )}
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
              <span>{t('dashboard.settings.security.changePassword') || 'Cambia Password'}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

