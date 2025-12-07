'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setResult({ success: false, message: 'Email e password sono obbligatorie' });
      return;
    }

    if (password.length < 8) {
      setResult({ success: false, message: 'La password deve essere di almeno 8 caratteri' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/reset-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || 'Errore sconosciuto' });
        return;
      }

      setResult({ 
        success: true, 
        message: `✅ ${data.message}\n\nEmail: ${data.email}\nPassword impostata: ${password}\n\nPuoi ora fare login con queste credenziali!` 
      });
      setPassword('');
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Errore sconosciuto' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Reset Password Admin
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Crea o resetta la password per un utente admin
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amministrazione@tradelia.org"
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Email configurate: amministrazione@tradelia.org, info@tradelia.org, support@tradelia.org
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nuova Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caratteri"
              className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password || password.length < 8}
            className="w-full px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Elaborazione...
              </>
            ) : (
              'Crea/Resetta Password'
            )}
          </button>
        </form>

        {result && (
          <div className={`mt-4 p-4 rounded-lg flex items-start gap-2 ${
            result.success 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm whitespace-pre-line">{result.message}</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border-subtle">
          <p className="text-xs text-text-tertiary">
            Questa pagina è accessibile pubblicamente per permettere la creazione/reset delle password admin.
          </p>
        </div>
      </div>
    </div>
  );
}
