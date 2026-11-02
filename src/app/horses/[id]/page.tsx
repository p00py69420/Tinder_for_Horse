import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PedigreeTree } from '@/components/pedigree';
import { HorseArt, PageHeading } from '@/components/ui';
import { currentUser, getHorses, photos } from '@/lib/data';
import { breeds, sexes } from '@/lib/types';

export default async function HorseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, horses, user] = await Promise.all([params, getHorses(), currentUser()]);
  const horse = horses.find(item => item.id === id);
  if (!horse) notFound();
  const images = horse.owner_id === user?.id ? await photos(horse) : [];
  return <><PageHeading eyebrow={`${breeds[horse.breed_id] ?? horse.breed_id} · ${horse.province}`} title={horse.name} description={horse.verified ? 'Баримтжуулсан мэдээлэл' : 'Эзэмшигчийн мэдээлэл'}>{horse.owner_id === user?.id && <Link className="button secondary" href={`/horses/${horse.id}/edit`}>Бүртгэл засах</Link>}</PageHeading><div className="horse-detail-grid"><section className="panel"><HorseArt name={horse.name}/><dl className="data-list"><div><dt>Хүйс</dt><dd>{sexes[horse.sex]}</dd></div><div><dt>Төрсөн он</dt><dd>{horse.birth_year}</dd></div><div><dt>Үүлдэр</dt><dd>{breeds[horse.breed_id] ?? horse.breed_id}</dd></div><div><dt>Байршил</dt><dd>{horse.province}</dd></div><div><dt>Үржлийн төлөв</dt><dd>{horse.available ? 'Нээлттэй' : 'Нээлттэй биш'}</dd></div><div><dt>Бүртгэлийн эх сурвалж</dt><dd>{horse.verified ? 'Баримтаар баталгаажсан' : 'Эзэмшигчийн мэдээлэл'}</dd></div></dl><p>{horse.description || 'Нэмэлт тайлбар оруулаагүй.'}</p><p><strong>Амжилт:</strong> {horse.achievements || 'Бүртгээгүй'}</p></section><section>{images.length>0&&<div className="panel mb-5">{images.map(image=>image.url&&<img key={image.path} src={image.url} alt={`${horse.name} адуу`} style={{width:'100%',height:'auto'}}/> )}</div>}<PedigreeTree horse={horse} horses={horses}/></section></div></>;
}