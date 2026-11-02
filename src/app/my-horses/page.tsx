import Link from 'next/link';
import { redirect } from 'next/navigation';
import { HorseCard, Empty, PageHeading } from '@/components/ui';
import { currentUser, getHorses } from '@/lib/data';
import { configured } from '@/lib/supabase/config';

export default async function MyHorsesPage() {
  const user = await currentUser();
  if (!user && configured) redirect('/auth');
  const horses = await getHorses();
  const mine = user ? horses.filter(horse => horse.owner_id === user.id) : [];
  return <><PageHeading eyebrow="МИНИЙ БҮРТГЭЛ" title="Миний адуу" description="Өөрийн адууны бүртгэл, нийтлэл болон угшлын холбоог удирдана."><Link className="button" href="/horses/new">＋ Адуу бүртгэх</Link></PageHeading>{!configured?<Empty text="Туршилтын горимд адуу хадгалах боломжгүй. Supabase тохиргоог холбоно уу." href="/directory" label="Адууны сан үзэх"/>:mine.length?<div className="horse-grid">{mine.map(horse=><HorseCard key={horse.id} horse={horse}><Link className="button secondary" href={`/horses/${horse.id}/edit`}>Бүртгэл засах</Link></HorseCard>)}</div>:<Empty text="Танд бүртгэлтэй адуу алга." href="/horses/new" label="Адуу бүртгэх"/>}</>;
}