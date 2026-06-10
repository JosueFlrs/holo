import { createClient } from '@supabase/supabase-js';

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clavePublicaSupabase = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const clienteSupabase = createClient(urlSupabase, clavePublicaSupabase);