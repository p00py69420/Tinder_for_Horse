import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { url, key } from './config';
export async function supabase() {
  if (!url || !key) throw new Error('Supabase тохиргоо дутуу байна. README зааврыг дагана уу.');
  const jar = await cookies();
  return createServerClient(url, key, { cookies: {
    getAll: () => jar.getAll(),
    setAll: (items) => { try { items.forEach(({name,value,options}) => jar.set(name,value,options)); } catch { /* Server components refresh through proxy. */ } }
  }});
}
