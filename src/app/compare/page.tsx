import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HorseCard, PageHeading } from '@/components/ui';
import { getHorses } from '@/lib/data';

export default async function ComparePage({searchParams}:{searchParams:Promise<{ids?:string}>}) {
  const [{ids},horses]=await Promise.all([searchParams,getHorses()]);
  const selectedIds=[...new Set((ids??'').split(',').filter(Boolean))].slice(0,3);
  const selected=selectedIds.map(id=>horses.find(horse=>horse.id===id)).filter((horse)=>horse!==undefined);
  if(!selected.length)notFound();
  return <><PageHeading eyebrow="БҮРТГЭЛ ХАРЬЦУУЛАХ" title="Сонгосон адуу" description="Бүртгэлд байгаа үндсэн мэдээллийг зэрэгцүүлэн харна."><Link className="button secondary" href="/directory">Адууны санд буцах</Link></PageHeading><div className="horse-grid">{selected.map(horse=><HorseCard key={horse.id} horse={horse}/>)}</div></>;
}