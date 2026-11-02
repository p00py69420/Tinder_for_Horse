import Link from 'next/link';
import { redirect } from 'next/navigation';
import { HorseCard, Empty, PageHeading } from '@/components/ui';
import { currentUser, getHorses } from '@/lib/data';
import { configured } from '@/lib/supabase/config';
import { supabase } from '@/lib/supabase/server';

export default async function SavedPage() {
  const user = await currentUser();
  if (!user && configured) redirect('/auth');
  const horses = await getHorses();
  if (!user) return <><PageHeading title="Хадгалсан адуу"/><Empty text="Туршилтын горимд хадгалсан жагсаалт байхгүй." href="/directory" label="Адууны сан үзэх"/></>;
  const db = await supabase();
  const { data } = await db.from('saved_candidates').select('horse_id').eq('user_id', user.id);
  const ids = new Set((data ?? []).map(item => item.horse_id));
  const selected = horses.filter(horse => ids.has(horse.id));
  return <><PageHeading eyebrow="МИНИЙ ЖАГСААЛТ" title="Хадгалсан адуу" description="Дараа харьцуулахын тулд сонгосон бүртгэлүүд."/><div className="horse-grid">{selected.map(horse=><HorseCard key={horse.id} horse={horse}><Link className="button secondary" href={`/horses/${horse.id}`}>Дэлгэрэнгүй</Link></HorseCard>)}</div>{!selected.length&&<Empty text="Одоогоор хадгалсан адуу алга." href="/directory" label="Адуу хайх"/>}</>;
}