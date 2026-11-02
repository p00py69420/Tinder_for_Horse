import Link from 'next/link';
import type { Horse } from '@/lib/types';
import { breeds, sexes } from '@/lib/types';
export function HorseArt({name='Адуу',className=''}:{name?:string;className?:string}) {
 return <div className={`horse-art ${className}`} role="img" aria-label={`${name} — зураг оруулаагүй`}><svg viewBox="0 0 480 300" aria-hidden="true"><circle cx="367" cy="73" r="38" fill="currentColor" opacity=".12"/><path d="M0 236 Q120 176 248 228 T480 210 V300 H0Z" fill="currentColor" opacity=".06"/><path d="m134 211 10-67 20-26 98 2 25-42 15-29 17-18 1 24 21 9 26 33-9 14-31-10-11 35-19 21-3 53 12 43h-17l-17-42-2-35-22 1-19 37-8 39h-15l2-43 13-40-49-7-16 41-4 49h-16l-4-52 10-41-13-22-12 66-14 20-10-7Z" fill="currentColor" opacity=".72"/><path d="m294 81 6-36 16-15-11 38-22 48-22 14 10-24Z" fill="currentColor"/><circle cx="330" cy="77" r="3" fill="#faf7ef"/></svg><span>ЗУРАГ ОРУУЛААГҮЙ</span></div>;
}
export function HorseCard({horse,children}:{horse:Horse;children?:React.ReactNode}) {
 return <article className="horse-card"><Link href={`/horses/${horse.id}`} aria-label={`${horse.name} дэлгэрэнгүй`}><HorseArt name={horse.name}/></Link><div className="card-body"><div className="flex items-center justify-between gap-2"><span className="eyebrow">{breeds[horse.breed_id]}</span>{horse.available&&<span className="badge">Үржилд нээлттэй</span>}</div><Link href={`/horses/${horse.id}`}><h3>{horse.name}</h3></Link><p className="muted">{sexes[horse.sex]} · {new Date().getFullYear()-horse.birth_year} нас · {horse.province}</p><div className="card-foot"><span>{horse.verified?'✓ Баталгаажсан':'Эзэмшигчийн мэдээлэл'}</span><Link href={`/horses/${horse.id}`}>Үзэх ↗</Link></div>{children}</div></article>;
}
export function PageHeading({eyebrow='ADUUMATCH',title,description,children}:{eyebrow?:string;title:string;description?:string;children?:React.ReactNode}) {
 return <header className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description&&<p className="muted">{description}</p>}</div>{children}</header>;
}
export function Notice({error,message}:{error?:string;message?:string}) {return <>{error&&<p className="notice error" role="alert">{error}</p>}{message&&<p className="notice" role="status">{message}</p>}</>;}
export function Empty({text='Одоогоор бүртгэл алга.',href,label}:{text?:string;href?:string;label?:string}) {return <div className="empty"><span className="empty-symbol">♞</span><p>{text}</p>{href&&<Link className="button" href={href}>{label??'Эхлэх'}</Link>}</div>;}
export function BreedingDisclaimer(){return <p className="notice">Энэ нь бүртгэлд тулгуурласан хайлтын туслах юм. Угшил дутуу байх нь төрөлгүй гэсэн үг биш. Үржлийн аюулгүй байдал, үүлдрийн бүртгэл, төлийн амжилтыг батлахгүй. Шийдвэр гаргахын өмнө малын эмч болон угшлын мэргэжилтэнтэй зөвлөлдөнө үү.</p>;}
