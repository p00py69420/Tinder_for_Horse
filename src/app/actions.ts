'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase/server';
import { breeds, provinces } from '@/lib/types';
function value(f:FormData,k:string) {return String(f.get(k)??'').trim();}
function fail(path:string,message:string):never {redirect(`${path}?error=${encodeURIComponent(message)}`);}
async function authenticated() {
 const db=await supabase();const {data:{user}}=await db.auth.getUser();
 if(!user) redirect('/auth'); return {db,user};
}
export async function signIn(form:FormData) {
 const db=await supabase(); const {error}=await db.auth.signInWithPassword({email:value(form,'email'),password:value(form,'password')});
 if(error) fail('/auth','Нэвтрэх боломжгүй. Имэйл, нууц үг болон имэйл баталгаажуулалтаа шалгана уу.');
 redirect('/my-horses');
}
export async function signUp(form:FormData) {
 const db=await supabase();const password=value(form,'password');
 if(password.length<8) fail('/auth','Нууц үг хамгийн багадаа 8 тэмдэгт байна.');
 const {error}=await db.auth.signUp({email:value(form,'email'),password,options:{data:{display_name:value(form,'display_name').slice(0,100)||'Адуу сонирхогч'}}});
 if(error) fail('/auth','Бүртгэх боломжгүй. Мэдээллээ шалгаж дахин оролдоно уу.');
 redirect('/auth?message='+encodeURIComponent('Имэйлээ шалгаж бүртгэлээ баталгаажуулаад нэвтэрнэ үү.'));
}
export async function signOut(){const db=await supabase();await db.auth.signOut();redirect('/');}
export async function saveHorse(form:FormData) {
 const {db}=await authenticated(); const id=value(form,'id');const back=id?`/horses/${id}/edit`:'/horses/new';
 const payload: Record<string,string|boolean|number>={};
 for(const field of ['id','name','breed_id','sex','province','description','achievements','sire','dam','preferred_breed_id']) payload[field]=value(form,field);
 payload.birth_year=Number(value(form,'birth_year'));payload.published=form.has('published');payload.available=form.has('available');
 if(!payload.name || String(payload.name).length>100 || !breeds[String(payload.breed_id)] || !provinces.includes(String(payload.province)) || !['stallion','mare','gelding'].includes(String(payload.sex)) || !Number.isInteger(payload.birth_year) || Number(payload.birth_year)<1950 || Number(payload.birth_year)>new Date().getFullYear()) fail(back,'Нэр, үүлдэр, хүйс, төрсөн он, байршлаа шалгана уу.');
 if(payload.sex==='gelding') payload.available=false;
 const {data,error}=await db.rpc('save_horse',{payload});
 if(error) fail(back,'Хадгалж чадсангүй. Эцэг, эхийн нас, хүйс, угшлын холбоо болон эзэмших эрхээ шалгана уу.');
 revalidatePath('/','layout');redirect(`/horses/${data}`);
}
export async function saveCandidate(form:FormData) {
 const {db,user}=await authenticated(); const id=value(form,'horse_id');
 const result=form.has('remove')?await db.from('saved_candidates').delete().eq('user_id',user.id).eq('horse_id',id):await db.from('saved_candidates').upsert({user_id:user.id,horse_id:id},{onConflict:'user_id,horse_id'});
 if(result.error) fail('/saved','Хадгалах боломжгүй. Адуу нийтлэгдсэн эсэхийг шалгана уу.');
 revalidatePath('/saved');redirect('/saved');
}
export async function sendInquiry(form:FormData) {
 const {db,user}=await authenticated();const id=value(form,'horse_id');const message=value(form,'message');
 if(message.length<10||message.length>2000) fail(`/horses/${id}`,'Зурвас 10–2000 тэмдэгт байна.');
 const {data:horse}=await db.from('horses').select('owner_id').eq('id',id).eq('published',true).single();
 if(!horse||horse.owner_id===user.id) fail(`/horses/${id}`,'Энэ адуунд хүсэлт илгээх боломжгүй.');
 const {error}=await db.from('inquiries').insert({horse_id:id,sender_id:user.id,recipient_id:horse.owner_id,message});
 if(error) fail(`/horses/${id}`,'Хүсэлт илгээж чадсангүй.');
 revalidatePath('/inquiries');redirect('/inquiries?sent=1');
}
export async function saveProfile(form:FormData) {
 const {db,user}=await authenticated();const name=value(form,'display_name');
 if(!name||name.length>100) fail('/profile','Нэр 1–100 тэмдэгт байна.');
 const {error}=await db.from('profiles').update({display_name:name,province:value(form,'province'),bio:value(form,'bio'),published:form.has('published')}).eq('id',user.id);
 if(error) fail('/profile','Профайл хадгалж чадсангүй.');
 const contact=await db.from('profile_contacts').upsert({user_id:user.id,phone:value(form,'phone')});
 if(contact.error) fail('/profile','Профайл хадгалагдсан боловч утас хадгалж чадсангүй.');
 revalidatePath('/profile');redirect('/profile?message='+encodeURIComponent('Хадгалагдлаа.'));
}
export async function uploadPhoto(form:FormData) {
 const {db,user}=await authenticated();const id=value(form,'horse_id');const file=form.get('photo');
 const back=`/horses/${id}`;
 if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5242880||file.size===0) fail(back,'JPG, PNG, WebP зураг сонгоно уу. Дээд хэмжээ 5 MB.');
 const {data:horse}=await db.from('horses').select('id').eq('id',id).eq('owner_id',user.id).single();if(!horse) fail(back,'Зөвхөн өөрийн адуунд зураг нэмнэ.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 const valid=file.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:file.type==='image/png'?[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v):String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 if(!valid) fail(back,'Зургийн төрөл тохирохгүй байна.');
 const ext={ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
 const {error}=await db.storage.from('horse-photos').upload(`${user.id}/${id}/${crypto.randomUUID()}.${ext}`,file,{contentType:file.type,upsert:false});
 if(error) fail(back,'Зураг байршуулж чадсангүй. Storage migration болон эрхийг шалгана уу.');
 revalidatePath(back);redirect(back);
}
export async function deletePhoto(form:FormData) {
 const {db,user}=await authenticated();const id=value(form,'horse_id'),path=value(form,'path');
 if(!path.startsWith(`${user.id}/${id}/`)) fail(`/horses/${id}`,'Зургийн зам буруу байна.');
 const {error}=await db.storage.from('horse-photos').remove([path]);if(error) fail(`/horses/${id}`,'Зураг устгаж чадсангүй.');
 revalidatePath(`/horses/${id}`);redirect(`/horses/${id}`);
}
