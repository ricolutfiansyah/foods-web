import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration is missing in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;