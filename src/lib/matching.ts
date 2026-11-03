import type { Horse } from './types';
// Five generations contain 62 ancestor positions. Repeated ancestors count
// as filled positions, while each unique identity is indexed once.
export function pedigree(horse: Horse, horses: Horse[]) {
 const index = new Map(horses.map(h => [h.id,h]));
 const ancestors = new Map<string,number>();
 const occurrences = new Map<string,number[]>();
 let filled = 0;
 function walk(h: Horse, depth: number, path: Set<string>) {
    if(depth>5) return;
  for(const id of [h.sire,h.dam]) {
   if(!id || path.has(id)) continue;
   const parent=index.get(id); if(!parent) continue;
   filled++;
   ancestors.set(id,Math.min(depth,ancestors.get(id)??Infinity));
     occurrences.set(id,[...(occurrences.get(id)??[]),depth]);
   walk(parent,depth+1,new Set([...path,id]));
  }
 }
 walk(horse,1,new Set([horse.id]));
 return { ancestors, occurrences, filled, total:62 };
}
export function matchPartners(source: Horse, horses: Horse[], preferredBreed?: string) {
 if(source.sex==='gelding') return [];
 const a=pedigree(source,horses);
 return horses.filter(h => h.id!==source.id && h.published && h.available && h.sex===(source.sex==='mare'?'stallion':'mare')).map(horse => {
  const b=pedigree(horse,horses);
  const shared=[...a.ancestors.keys()].filter(id=>b.ancestors.has(id));
  const direct=a.ancestors.has(horse.id)||b.ancestors.has(source.id);
  const close=direct||shared.some(id=>a.ancestors.get(id)!<=2 && b.ancestors.get(id)!<=2);
  const sameBreed=horse.breed_id===(preferredBreed||source.preferred_breed_id||source.breed_id);
  const reciprocal=!horse.preferred_breed_id || horse.preferred_breed_id===source.breed_id;
  const local=horse.province===source.province;
  // Internal sorting points, never a genetic probability or safety metric.
  const score=(sameBreed?30:0)+(reciprocal?10:0)+(local?15:0)+Math.min(a.filled,b.filled)-(shared.length?50:0)-(close?1000:0);
  const reasons=[sameBreed?'Сонгосон үүлдрийн хүсэлтэд нийцсэн':'Үүлдрийн хүсэлтээс өөр',reciprocal?'Нөгөө талын үүлдрийн хүсэлтэд нийцсэн':'Нөгөө талын үүлдрийн хүсэлтээс өөр',local?'Ижил аймаг / хотод байрладаг':'Өөр аймаг / хотод байрладаг',`Угшлын бүртгэл: таны адуу ${a.filled}/62, нэр дэвшигч ${b.filled}/62`];
  const warning=close?'Ойрын төрөл эсвэл шууд өвөг–үр төл холбоо бүртгэгдсэн. Үржлийн сонголт гэж зөвлөхгүй.':shared.length?'Дундын өвөг бүртгэгдсэн. Мэргэжлийн үнэлгээ шаардлагатай.':'Бүртгэлд дундын өвөг олдоогүй. Энэ нь төрөлгүйг нотлохгүй.';
  return {horse,score,reasons,warning,shared,close,completeness:b.filled};
 }).sort((a,b)=>a.score===b.score?a.horse.name.localeCompare(b.horse.name):b.score-a.score);
}

export function inbreedingCoefficient(mare: Horse, stallion: Horse, horses: Horse[]) {
 const index=new Map(horses.map(h=>[h.id,h]));
 const cache=new Map<string,number>();
 function kinship(first:string,second:string,active=new Set<string>()):number {
  const [a,b]=first<second?[first,second]:[second,first];
  const key=`${a}:${b}`;
  const cached=cache.get(key); if(cached!==undefined) return cached;
  if(active.has(key)) return 0;
  const next=new Set(active); next.add(key);
  const firstHorse=index.get(first),secondHorse=index.get(second);
  const firstParents=[firstHorse?.sire,firstHorse?.dam].filter((id):id is string=>Boolean(id));
  const secondParents=[secondHorse?.sire,secondHorse?.dam].filter((id):id is string=>Boolean(id));
  let value:number;
  if(first===second) value=(1+(firstParents.length===2?kinship(firstParents[0],firstParents[1],next):0))/2;
  else if(firstParents.length) value=firstParents.reduce((sum,parent)=>sum+kinship(parent,second,next)/2,0);
  else if(secondParents.length) value=secondParents.reduce((sum,parent)=>sum+kinship(first,parent,next)/2,0);
  else value=0;
  cache.set(key,value);
  return value;
 }
 return kinship(mare.id,stallion.id);
}
