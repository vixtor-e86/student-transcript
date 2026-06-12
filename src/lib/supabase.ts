import { createClient } from '@supabase/supabase-js';

// New Supabase Project: ifwltbcgufdmhwdfiyim
const supabaseUrl = 'https://ifwltbcgufdmhwdfiyim.supabase.co';
const supabaseAnonKey = 'sb_publishable_pL7CMNIT64tF48gtumsYfw_0hoB0DYr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
