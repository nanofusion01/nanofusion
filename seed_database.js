
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

const services = [
  { slug: 'facade', name: 'Čištění fasád', description: 'Hloubkové odstranění řas, plísní a atmosférických nečistot.', hero_image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', is_active: true, order_index: 1 },
  { slug: 'roof', name: 'Čištění střech', description: 'Šetrné čištění střešní krytiny od mechů a lišejníků.', hero_image_url: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800', is_active: true, order_index: 2 },
  { slug: 'pavement', name: 'Čištění dlažeb', description: 'Hloubkové čištění zámkové dlažby a kamene.', hero_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', is_active: true, order_index: 3 },
  { slug: 'pv', name: 'Solární panely', description: 'Profesionální čištění pro vyšší účinnost panelů.', hero_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', is_active: true, order_index: 4 },
  { slug: 'graffiti', name: 'Odstranění graffiti', description: 'Rychlé a šetrné odstranění graffiti z fasád.', hero_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', is_active: true, order_index: 5 }
];

const articles = [
  { slug: 'udrzba-fasady-zima', title: 'Jak pečovat o fasádu v zimě?', content: 'Zima je pro fasádu nejnáročnějším obdobím...', hero_image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', is_published: true, published_at: new Date().toISOString() },
  { slug: 'vyhody-nano-impregnace', title: 'Výhody nano-impregnace', content: 'Nano impregnace vytváří neviditelný štít...', hero_image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800', is_published: true, published_at: new Date().toISOString() }
];

async function seed() {
  console.log('🚀 Spouštím oživovací skript NANOfusion (Verze 2)...');

  // 1. Services
  console.log('📦 Nahrávám služby...');
  const { error: sErr } = await supabase.from('services').upsert(services, { onConflict: 'slug' });
  if (sErr) console.error('❌ Chyba služby:', sErr);
  else console.log('✅ Služby nahrány.');

  // 2. Articles
  console.log('📝 Nahrávám články...');
  const { error: aErr } = await supabase.from('articles').upsert(articles, { onConflict: 'slug' });
  if (aErr) console.error('❌ Chyba články:', aErr);
  else console.log('✅ Články nahrány.');

  // 3. Configurator Prices (Update label and units)
  console.log('💰 Synchronizuji ceník...');
  const { error: pErr } = await supabase.from('configurator_prices').upsert([
    { item_key: 'cleaning_roofs', label: 'Čištění střech', price: 190, unit: 'Kč/m²' },
    { item_key: 'cleaning_facades', label: 'Čištění fasád', price: 150, unit: 'Kč/m²' },
    { item_key: 'cleaning_pavement', label: 'Čištění dlažeb', price: 120, unit: 'Kč/m²' }
  ], { onConflict: 'item_key' });
  if (pErr) console.error('❌ Chyba ceník:', pErr);
  else console.log('✅ Ceník aktualizován.');

  console.log('\n✨ HOTOVO! Teď obnov Admin Panel a uvidíš tam svá data.');
}

seed();
