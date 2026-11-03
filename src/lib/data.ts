import { supabase } from './supabase/server';
import { configured } from './supabase/config';
import { demoHorses } from './demo';
import type { Horse } from './types';

type HorseTable = 'horses' | 'pedigree_relationships' | 'breeding_listings';
type QueryError = { code: string; message: string; details: string; hint: string };

export function horseQueryFailureCode(error: Pick<QueryError, 'code' | 'message'>) {
 if(error.code==='42501'||/permission denied|row-level security|insufficient privilege/i.test(error.message)) return 'HORSE_DATA_PERMISSION_ERROR';
 if(['42P01','42703','PGRST200','PGRST204','PGRST205'].includes(error.code)) return 'HORSE_DATA_SCHEMA_ERROR';
 return 'HORSE_DATA_QUERY_ERROR';
}

function logHorseQueryFailure(operation:string,error:QueryError) {
 console.error('[AduuMatch] Supabase horse data query failed', {
  operation,
  code:error.code,
  message:error.message,
  details:error.details,
  hint:error.hint,
 });
}

export async function currentUser() {
 if(!configured) return null;
 const db=await supabase(); const {data:{user}}=await db.auth.getUser(); return user;
}
export async function getHorses(): Promise<Horse[]> {
 if(!configured) return demoHorses;
 const db=await supabase();
 // Paginate past Supabase's default 1000-row response limit.
 async function rows(table:HorseTable, order:string) {
  const all: Record<string,unknown>[]=[];
  for(let start=0;;start+=1000){
   let result;
   try {
    result=await db.from(table).select('*').order(order).range(start,start+999);
   } catch(error) {
    console.error('[AduuMatch] Supabase horse data request failed before a response', {
     operation:`select ${table}`,
     errorName:error instanceof Error?error.name:'unknown',
    });
    throw new Error('HORSE_DATA_QUERY_ERROR');
   }
   const {data,error}=result;
   if(error) {
    logHorseQueryFailure(`select ${table}`,error);
    throw new Error(horseQueryFailureCode(error));
   }
   if(!data) {
    console.error('[AduuMatch] Supabase horse data query returned no data payload', {operation:`select ${table}`});
    throw new Error('HORSE_DATA_QUERY_ERROR');
   }
   all.push(...data); if(data.length<1000) return all;
  }
 }
 const [horses,relations,listings]=await Promise.all([rows('horses','id'),rows('pedigree_relationships','horse_id'),rows('breeding_listings','horse_id')]);
 return horses.map(h=>{
  const sire=relations.find(r=>r.horse_id===h.id&&r.role==='sire');
  const dam=relations.find(r=>r.horse_id===h.id&&r.role==='dam');
  const listing=listings.find(l=>l.horse_id===h.id);
  return {...h,sire:sire?.parent_id,dam:dam?.parent_id,sire_verified:sire?.verified,dam_verified:dam?.verified,available:listing?.available??false,preferred_breed_id:listing?.preferred_breed_id} as Horse;
 });
}
export async function photos(horse:Horse) {
 if(!configured) return [];
 const db=await supabase(); const prefix=`${horse.owner_id}/${horse.id}`;
 const {data,error}=await db.storage.from('horse-photos').list(prefix,{limit:20,sortBy:{column:'created_at',order:'desc'}});
 if(error) throw new Error('Зураг ачаалж чадсангүй. Storage тохиргоог шалгана уу.');
 const paths=(data??[]).map(file=>`${prefix}/${file.name}`);
 if(!paths.length) return [];
 const signed=await db.storage.from('horse-photos').createSignedUrls(paths,300);
 if(signed.error) throw new Error('Зургийн эрхийг шалгана уу.');
 return (signed.data??[]).filter(v=>v.signedUrl).map(v=>({path:v.path!,url:v.signedUrl}));
}
