import Link from 'next/link';
import { getHorses } from '@/lib/data';
import { HorseCard, PageHeading } from '@/components/ui';

export default async function HomePage() {
  const horses = await getHorses();
  return <>
    <section className="hero"><div><p className="eyebrow">МОНГОЛ АДУУНЫ БҮРТГЭЛ · УГШИЛ · ҮРЖЛИЙН САН</p><h1>Адууны түүхийг нэг дор бүртгэе.</h1><p>Адуу бүртгэж угшлыг нь холбох, нээлттэй үржлийн бүртгэлүүдийг хайх нэг талбар.</p><div className="hero-actions"><Link className="button" href="/directory">Адууны сан үзэх →</Link><Link className="button secondary" href="/auth">Бүртгэл үүсгэх</Link></div></div><div className="hero-mark" aria-hidden="true"><span>А</span></div></section>
    <section className="home-section"><PageHeading eyebrow="ТАНИЛЦАХ" title="Бүртгэлээс эхэл" description="Одоо байгаа бүртгэл, угшил болон үржлийн хайлтын хэрэгслийг нээнэ үү."/><div className="shortcut-grid"><Link className="shortcut" href="/directory"><strong>Адууны сан ↗</strong><span>Үүлдэр, хүйс, аймаг болон үржлийн нээлттэй төлөвөөр шүүх</span></Link><Link className="shortcut" href="/pedigree"><strong>Угшлын мод ↗</strong><span>Бүртгэгдсэн эцэг, эхийн холбоог харах</span></Link><Link className="shortcut" href="/matching"><strong>Хос хайх ↗</strong><span>Нээлттэй бүртгэл болон угшлын давхцлыг нягтлах</span></Link></div></section>
    <section className="home-section"><div className="result-bar"><h2>Сүүлд нэмэгдсэн адуу</h2><Link href="/directory">Бүгдийг үзэх →</Link></div><div className="horse-grid">{horses.slice(0,3).map(horse=><HorseCard key={horse.id} horse={horse}/>)}</div></section>
  </>;
}