'use client';
import { createBrowserClient } from '@supabase/ssr';
import { url, key } from './config';
export function browserSupabase() {
  if (!url || !key) throw new Error('Supabase configuration missing');
  return createBrowserClient(url, key);
}
