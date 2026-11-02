'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const links=[['/my-horses','♞','Миний адуу'],['/directory','⊞','Адууны сан'],['/pedigree','⌘','Угшил'],['/matching','◇','Хос хайх'],['/analysis','≋','Угшлын тайлан'],['/saved','♡','Хадгалсан адуу'],['/inquiries','✉','Хүсэлтүүд'],['/profile','◎','Миний профайл']];
export function Navigation(){const pathname=usePathname();return <nav aria-label="Үндсэн цэс">{links.map(([href,icon,label])=><Link className={pathname===href?'active':''} href={href} key={href}><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav>;}
