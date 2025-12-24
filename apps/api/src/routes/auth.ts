import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { emailService } from '../services/emailService';

// Supabase client with service role for admin operations
const supabaseAdmin = createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular Supabase client for user operations
const supabase = createClient(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Validation schemas
const LoginRequestSchema = z.object({
  email: z.string().email('Email non valida')
});

const VerifyOTPSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, 'Token OTP deve essere di 6 caratteri'),
  type: z.enum(['magiclink', 'signup', 'invite', 'recovery']).default('magiclink')
});

const RegisterSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(8, 'Password deve essere di almeno 8 caratteri'),
  display_name: z.string().min(2, 'Nome visualizzato richiesto').optional()
});

// In-memory OTP storage (in produzione usare Redis)
const otpStorage = new Map<string, { otp: string; expires: number }>();

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  // LOGIN: Invia OTP via email (sempre, non richiede password)
  fastify.post('/login', async (request, reply) => {
    const { email } = LoginRequestSchema.parse(request.body);

    try {
      // Genera OTP
      const otp = generateOTP();

      // Invia email con OTP usando Brevo
      if (emailService) {
        await emailService.sendOTPEmail(email, otp);
      } else {
        return reply.code(500).send({ error: 'Email service not configured' });
      }

      // Salva OTP temporaneamente (valido 10 minuti)
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minuti da ora
      otpStorage.set(email, { otp, expires: expiresAt });

      return reply.code(200).send({
        message: 'OTP inviato via email',
        expires_in: 600 // 10 minuti
      });

    } catch (error) {
      console.error('Login error:', error);
      return reply.code(500).send({ error: 'Errore nell\'invio dell\'OTP' });
    }
  });

  // VERIFY OTP: Verifica OTP e crea sessione
  fastify.post('/verify-otp', async (request, reply) => {
    const { email, token } = VerifyOTPSchema.parse(request.body);

    try {
      // Verifica OTP dal Map in memoria
      const storedData = otpStorage.get(email);

      if (!storedData || storedData.otp !== token || Date.now() > storedData.expires) {
        return reply.code(401).send({ error: 'OTP non valido o scaduto' });
      }

      // OTP valido, procedi con autenticazione Supabase
      // Prima controlla se l'utente esiste
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();

      let user = existingUser.users.find(u => u.email === email);

      if (!user) {
        // Crea nuovo utente se non esiste
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: Math.random().toString(36), // Password casuale, login solo via OTP
          email_confirm: true, // Salta conferma email
          user_metadata: {
            created_via_otp: true,
            login_method: 'email_otp'
          }
        });

        if (createError) {
          console.error('User creation error:', createError);
          return reply.code(500).send({ error: 'Errore nella creazione dell\'account' });
        }

        user = newUser.user;
      }

      // Crea sessione per l'utente usando una password fissa per gli utenti OTP
      const tempPassword = 'secure_temp_password_123!@#';
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: email,
        password: tempPassword
      });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return reply.code(500).send({ error: 'Errore nella creazione della sessione' });
      }

      // Rimuovi OTP usato
      otpStorage.delete(email);

      // Invia email di benvenuto per nuovi utenti
      if (emailService && !existingUser.users.find(u => u.email === email)) {
        try {
          await emailService.sendWelcomeEmail(email, email.split('@')[0]);
        } catch (emailError) {
          console.warn('Welcome email failed:', emailError);
          // Non bloccare il login se l'email fallisce
        }
      }

      return reply.code(200).send({
        token: sessionData.session?.access_token,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        message: 'Login successful'
      });

    } catch (error) {
      console.error('OTP verification error:', error);
      return reply.code(500).send({ error: 'Errore nella verifica dell\'OTP' });
    }
  });

  // REGISTER: Registrazione tradizionale (opzionale, dato che usiamo OTP)
  fastify.post('/register', async (request, reply) => {
    const payload = RegisterSchema.parse(request.body);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: {
            display_name: payload.display_name,
            created_via_registration: true
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        return reply.code(400).send({ error: error.message });
      }

      if (!data.session) {
        return reply.code(201).send({
          message: 'Registrazione completata. Controlla la tua email per confermare.'
        });
      }

      return reply.code(201).send({
        token: data.session.access_token,
        user: {
          id: data.user?.id,
          email: data.user?.email
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      return reply.code(500).send({ error: 'Errore nella registrazione' });
    }
  });

  // LOGOUT
  fastify.post('/logout', async (request, reply) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
        return reply.code(500).send({ error: 'Errore nel logout' });
      }

      return reply.code(200).send({ message: 'Logout successful' });

    } catch (error) {
      console.error('Logout error:', error);
      return reply.code(500).send({ error: 'Errore nel logout' });
    }
  });

  // RESEND OTP
  fastify.post('/resend-otp', async (request, reply) => {
    const { email } = LoginRequestSchema.parse(request.body);

    try {
      const otp = generateOTP();

      if (emailService) {
        await emailService.sendOTPEmail(email, otp);
      } else {
        return reply.code(500).send({ error: 'Email service not configured' });
      }

      // Salva nuovo OTP
      const expiresAt = Date.now() + 10 * 60 * 1000;
      otpStorage.set(email, { otp, expires: expiresAt });

      return reply.code(200).send({
        message: 'OTP reinviato via email',
        expires_in: 600
      });

    } catch (error) {
      console.error('Resend OTP error:', error);
      return reply.code(500).send({ error: 'Errore nel reinvio dell\'OTP' });
    }
  });
};
