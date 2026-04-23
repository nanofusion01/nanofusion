
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve('admin-panel/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const reviews = [
  { author: 'Jan Novák', content: 'Skvělá práce, fasáda vypadá jako nová!', rating: 5, source: 'firmy.cz', approved: true },
  { author: 'Marie Dvořáková', content: 'Velmi profesionální přístup a rychlost.', rating: 5, source: 'firmy.cz', approved: true },
  { author: 'Petr Svoboda', content: 'Doporučuji pro čištění solárních panelů.', rating: 4, source: 'manual', approved: true }
];

async function seedReviews() {
  console.log('⭐ Nahrávám recenze...');
  const { error } = await supabase.from('external_reviews').upsert(reviews);
  if (error) console.error('Chyba recenze:', error);
  else console.log('✅ Recenze nahrány.');
}

seedReviews();
