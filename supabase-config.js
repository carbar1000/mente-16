import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = window.env.SUPABASE_URL;
const supabaseAnonKey = window.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Credenciais do Supabase não encontradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
