
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

const realizations = [
  { title: 'Čištění střechy RD, Praha', description: 'Silné znečištění mechem.', location: 'Praha', is_published: true, hero_image_url: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800' },
  { title: 'Renovace fasády, Brno', description: 'Atmosférické nečistoty.', location: 'Brno', is_published: true, hero_image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' }
];

const reviews = [
  { author: 'Jan Novák', content: 'Skvělá práce na fasádě!', rating: 5, source: 'firmy.cz', approved: true },
  { author: 'Petr Svoboda', content: 'Doporučuji čištění střech.', rating: 5, source: 'firmy.cz', approved: true }
];

async function seedData() {
  console.log('🚀 Nahrávám Realizace a Recenze...');
  await supabase.from('realizations').upsert(realizations);
  await supabase.from('external_reviews').upsert(reviews);
  console.log('✅ Hotovo.');
}

seedData();
