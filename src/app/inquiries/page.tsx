import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeading } from '@/components/ui';
import { currentUser, getHorses } from '@/lib/data';
import { configured } from '@/lib/supabase/config';
import { supabase } from '@/lib/supabase/server';

export default async function InquiriesPage() {
  const user = await currentUser();
  if (!user && configured) redirect('/auth');
  if (!user) return <><PageHeading title="Хүсэлтүүд"/><p className="empty">Туршилтын горимд хүсэлт илгээх боломжгүй.</p></>;
  const db = await supabase();
  const [{ data: inquiries }, horses] = await Promise.all([db.from('inquiries').select('*').order('created_at',{ascending:false}), getHorses()]);
  return <><PageHeading eyebrow="ХОЛБОО БАРИХ" title="Үржлийн хүсэлтүүд" description="Танд ирсэн болон таны илгээсэн адууны хүсэлтүүд."/>{inquiries?.length ? <section className="panel">{inquiries.map(item=><article className="inquiry" key={item.id}><div className="section-title"><strong>{item.sender_id === user.id ? 'Таны илгээсэн хүсэлт' : 'Танд ирсэн хүсэлт'}</strong><time className="muted" dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString('mn-MN')}</time></div><Link href={`/horses/${item.horse_id}`}>{horses.find(horse=>horse.id===item.horse_id)?.name ?? 'Адууны бүртгэл'}</Link><p>{item.message}</p></article>)}</section> : <div className="empty">Одоогоор хүсэлт алга.</div>}</>;
}