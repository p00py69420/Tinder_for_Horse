'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Horse } from '@/lib/types';
import { pedigree } from '@/lib/matching';
export function PedigreeTree({horse,horses}:{horse:Horse;horses:Horse[]}) {
 const [generations,setGenerations]=useState(5);const index=new Map(horses.map(h=>[h.id,h]));const stats=pedigree(horse,horses);
 function branch(h:Horse|undefined,depth:number,label:string,verified?:boolean,path=new Set<string>()):React.ReactNode {
  if(!h) return <li className="tree-unknown"><span>{label} · Тодорхойгүй</span></li>;
  if(path.has(h.id)) return <li className="tree-unknown">Давталттай холбоо</li>;
  const next=new Set([...path,h.id]);
  return <li><div className="tree-node"><small>{label}{depth>0?verified?' · Баталгаажсан холбоо':' · Эзэмшигчийн мэдээлэл':''}</small><Link href={`/horses/${h.id}`}>{h.name} ↗</Link><span>{h.birth_year} · {h.province}</span></div>{depth<generations&&<ul>{branch(index.get(h.sire??''),depth+1,'Эцэг',h.sire_verified,next)}{branch(index.get(h.dam??''),depth+1,'Эх',h.dam_verified,next)}</ul>}</li>;
 }
 return <section className="panel"><div className="section-title"><div><h2>Угшлын мод</h2><p className="muted">5 үеийн {stats.filled}/62 өвгийн байрлал бүртгэлтэй.</p></div><label>Харах үе<select value={generations} onChange={e=>setGenerations(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} үе</option>)}</select></label></div><div className="tree-scroll"><ul className="tree">{branch(horse,0,'Сонгосон адуу')}</ul></div><p className="muted text-sm">Тодорхойгүй эсвэл нийтлээгүй өвөг харагдахгүй. Адууны нэр дээр дарж бүртгэлийг нээнэ.</p></section>;
}
export function PedigreeExplorer({horses}:{horses:Horse[]}) {const [id,setId]=useState(horses[0]?.id??'');const horse=horses.find(h=>h.id===id);return <><label className="panel block mb-5">Адуу сонгох<select value={id} onChange={e=>setId(e.target.value)}>{horses.map(h=><option key={h.id} value={h.id}>{h.name} · {h.province}</option>)}</select></label>{horse&&<PedigreeTree horse={horse} horses={horses}/>}</>;}
