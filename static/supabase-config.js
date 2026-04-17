import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://mgmtkdwvhgrzefmyucvr.supabase.co';
const supabaseKey = 'sb_publishable_4zx8PSeFySdRwOitS1bsqA_xO0LimWR';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Also attach to window for global access (backward compatibility / debugging)
window.supabase = supabase;
