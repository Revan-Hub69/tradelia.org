import { supabase } from '../supabase/client';

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getExchangeConnections = async (userId: string) => {
  const { data, error } = await supabase
    .from('exchange_connections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createExchangeConnection = async (userId: string, connectionData: any) => {
  const { data, error } = await supabase
    .from('exchange_connections')
    .insert({
      ...connectionData,
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteExchangeConnection = async (userId: string, connectionId: string) => {
  const { error } = await supabase
    .from('exchange_connections')
    .delete()
    .eq('id', connectionId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
};

export const getTradePlans = async (userId: string) => {
  const { data, error } = await supabase
    .from('trade_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getExecutions = async (userId: string) => {
  const { data, error } = await supabase
    .from('executions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
