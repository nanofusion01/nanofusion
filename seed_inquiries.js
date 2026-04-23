
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

const inquiries = [
  { name: 'Pavel Novotný', email: 'pavel@email.cz', phone: '777123456', service: 'Čištění fasád', message: 'Mám zájem o vyčištění fasády rodinného domu.', status: 'new', source: 'form' },
  { name: 'Jana Modrá', email: 'jana@seznam.cz', phone: '608987654', service: 'Čištění střech', message: 'Potřebuji vyčistit střechu na chalupě.', status: 'in_progress', source: 'kalkulacka' }
];

async function seedInquiries() {
  console.log('📬 Nahrávám testovací poptávky...');
  const { error } = await supabase.from('inquiries').upsert(inquiries);
  if (error) console.error('Chyba poptávky:', error);
  else console.log('✅ Poptávky nahrány.');
}

seedInquiries();
