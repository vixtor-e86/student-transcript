import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wajfibmjwmbbbpblvnak.supabase.co'; // Extracted from your service role key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhamZpYm1qd21iYmJwYmx2bmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTEwNTMxNSwiZXhwIjoyMDk2NjgxMzE1fQ.jAaU8vn_JGV8EXhuS04Vv6q6eCQzJh5vYb60eZsckmc'; // Using the key provided

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
