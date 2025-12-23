import { FastifyPluginAsync, FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().optional()
});

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post('/login', async (request, reply) => {
    const payload = LoginSchema.parse(request.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    if (error) {
      fastify.log.error(error);
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    if (!data.session) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    return reply.code(200).send({
      token: data.session.access_token,
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });
  });

  fastify.post('/register', async (request, reply) => {
    const payload = RegisterSchema.parse(request.body);

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          display_name: payload.display_name
        }
      }
    });

    if (error) {
      fastify.log.error(error);
      return reply.code(400).send({ error: error.message });
    }

    if (!data.session) {
      return reply.code(201).send({
        message: 'Registration successful. Please check your email for confirmation.'
      });
    }

    return reply.code(201).send({
      token: data.session.access_token,
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    });
  });

  fastify.post('/logout', async (request, reply) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to logout' });
    }

    return reply.code(200).send({ message: 'Logout successful' });
  });
};
