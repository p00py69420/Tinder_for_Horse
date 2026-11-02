'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PedigreeTree } from './pedigree';
import { Empty } from './ui';
import { analyzeMating } from '@/lib/analysis';
import { breeds, type Horse } from '@/lib/types';

export function BreedingAnalysis({horses,ownerId}:{horses:Horse[];ownerId?:string}) {
 const mares=horses.filter(horse=>horse.sex==='mare'&&(horse.published||horse.owner_id===ownerId));
 const [mareId,setMareId]=useState(mares[0]?.id??'');
 const [breed,setBreed]=useState('');
 const [province,setProvince]=useState('');
 const [availableOnly,setAvailableOnly]=useState(true);
 const [stallionId,setStallionId]=useState('');
 const [report,setReport]=useState<{mareId:string;stallionId:string}|null>(null);
 const stallions=horses.filter(horse=>horse.sex==='stallion'&&horse.published&&(!availableOnly||horse.available)&&(!breed||horse.breed_id===breed)&&(!province||horse.province===province));
 const mare=horses.find(horse=>horse.id===report?.mareId);
 const stallion=horses.find(horse=>horse.id===report?.stallionId);
 const result=mare&&stallion?analyzeMating(mare,stallion,horses):null;
 if(!mares.length)return <Empty text="Шинжилгээнд ашиглах гүү бүртгэл алга." href={ownerId?'/horses/new':'/auth'} label={ownerId?'Адуу бүртгэх':'Нэвтрэх'}/>;
 return <>
  <form className="panel form-stack" onSubmit={event=>{event.preventDefault();if(mareId&&stallionId)setReport({mareId,stallionId});}}>
   <div className="form-grid"><label>Гүү<select value={mareId} onChange={event=>setMareId(event.target.value)}>{mares.map(horse=><option key={horse.id} value={horse.id}>{horse.name} · {horse.province}</option>)}</select></label><label>Азарганы үүлдэр<select value={breed} onChange={event=>{setBreed(event.target.value);setStallionId('');}}><option value="">Бүх үүлдэр</option>{Object.entries(breeds).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Байршил<select value={province} onChange={event=>{setProvince(event.target.value);setStallionId('');}}><option value="">Бүх аймаг / хот</option>{[...new Set(horses.map(horse=>horse.province))].sort().map(item=><option key={item}>{item}</option>)}</select></label><label>Нээлттэй азарга<select value={stallionId} onChange={event=>setStallionId(event.target.value)} required><option value="">Азарга сонгох</option>{stallions.map(horse=><option key={horse.id} value={horse.id}>{horse.name} · {horse.province}</option>)}</select></label><label className="check"><input type="checkbox" checked={availableOnly} onChange={event=>{setAvailableOnly(event.target.checked);setStallionId('');}}/>Зөвхөн үржилд нээлттэй</label></div>
   <p className="muted text-sm">Үйлчилгээний үнэ бүртгэгдээгүй. Нийтэд нээлттэй, сонгосон шүүлтүүрт таарсан азаргуудыг харуулна.</p>
   <button className="button" type="submit" disabled={!stallionId}>Угшлын тайлан гаргах</button>
  </form>
  {result&&mare&&stallion&&<section className="analysis-report">
   <div className="result-bar"><div><p className="eyebrow">АДУУMATCH BREEDING ANALYSIS</p><h2>{mare.name} × {stallion.name}</h2></div><span className="badge">Угшилд суурилсан тайлан</span></div>
   <div className="horse-detail-grid"><article className="panel"><p className="eyebrow">ГҮҮ</p><h3><Link href={`/horses/${mare.id}`}>{mare.name} ↗</Link></h3><p>{breeds[mare.breed_id]} · {mare.birth_year} · {mare.province}</p><p className="muted">{mare.verified?'Баталгаажуулалтын тэмдэглэгээтэй бүртгэл':'Эзэмшигчийн мэдээлэл'}</p><p>Угшлын бүрэн байдал: <strong>{result.marePedigree.filled}/62</strong></p></article><article className="panel"><p className="eyebrow">АЗАРГА</p><h3><Link href={`/horses/${stallion.id}`}>{stallion.name} ↗</Link></h3><p>{breeds[stallion.breed_id]} · {stallion.birth_year} · {stallion.province}</p><p className="muted">{stallion.verified?'Баталгаажуулалтын тэмдэглэгээтэй бүртгэл':'Эзэмшигчийн мэдээлэл'}</p><p>Угшлын бүрэн байдал: <strong>{result.stallionPedigree.filled}/62</strong></p></article></div>
   <div className="analysis-section"><h3>Дундын өвөг</h3>{result.common.length?<div className="panel">{result.common.map(ancestor=><article className="inquiry" key={ancestor.id}><strong><Link href={`/horses/${ancestor.id}`}>{ancestor.name} ↗</Link></strong><p>Гүүний угшилд {ancestor.mareAppearances} удаа (үе: {ancestor.mareGenerations.join(', ')}); азарганы угшилд {ancestor.stallionAppearances} удаа (үе: {ancestor.stallionGenerations.join(', ')}).</p><p className="muted">Мэдээлэл: {ancestor.verified?'Баталгаажуулалтын тэмдэглэгээтэй бүртгэл':'Эзэмшигчийн мэдээлэл'}. Энэ давтамж нь амжилтад нөлөөлөх нотолгоо биш.</p></article>)}</div>:<p className="notice">Бүртгэлд дундын өвөг илрээгүй. Угшил дутуу байж болох тул энэ нь төрөлгүйг батлахгүй.</p>}</div>
   <div className="horse-detail-grid"><article className="panel"><h3>Угшлын ойртолтын тооцоо</h3>{result.inbreedingCoefficient===null?<p className="notice">Угшлын бүртгэл 5 үеийн бүх 62 байрлалыг хамраагүй тул коэффициент тооцоогүй.</p>:<><p><strong>{(result.inbreedingCoefficient*100).toFixed(2)}%</strong> · бүртгэгдсэн угшлын коэффициентийн тооцоо</p><p className="muted text-sm">Таван үеэс цааш бүртгэгдээгүй өвгийг хамааралгүй гэж үзсэн доод түвшний тооцоо; генетикийн шинжилгээ биш.</p></>}</article><article className="panel"><h3>Түүхэн хосын гүйцэтгэл</h3><p><strong>{result.performance.status}</strong></p><p className="muted">{result.performance.detail}</p><p className="muted text-sm">Одоогоор унага, гараа, ялалт, томоохон амжилтын тоо болон мэдээллийн эх сурвалж бүртгэгдээгүй. Хуурамч үнэлгээ, рейтинг харуулахгүй.</p></article></div>
   <div className="analysis-section"><h3>Таван үеийн угшил</h3><div className="horse-detail-grid"><PedigreeTree horse={mare} horses={horses}/><PedigreeTree horse={stallion} horses={horses}/></div></div>
   <p className="notice">Тайлан нь бүртгэгдсэн мэдээлэлд тулгуурлана. Албан ёсны бүртгэл, баримт шалгалт, үүлдрийн дүрэм болон мал эмнэлгийн зөвлөгөөг орлохгүй.</p>
  </section>}
  {!stallions.length&&<Empty text="Эдгээр шүүлтүүрт тохирох нийтэд нээлттэй азарга алга."/>}
 </>;
}