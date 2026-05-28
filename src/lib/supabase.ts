import { createClient } from '@supabase/supabase-js';

// Essas variáveis serão puxadas do arquivo .env que configuraremos na sequência
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // <-- ADICIONE O VITE_ AQUI!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Atenção: As chaves do Supabase não foram encontradas no arquivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);