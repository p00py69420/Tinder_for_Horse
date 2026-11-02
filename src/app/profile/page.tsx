import { redirect } from 'next/navigation';
import { saveProfile, signOut } from '@/app/actions';
import { PageHeading, Notice } from '@/components/ui';
import { currentUser } from '@/lib/data';
import { configured, } from '@/lib/supabase/config';
import { supabase } from '@/lib/supabase/server';
import { provinces } from '@/lib/types';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const user = await currentUser();
  if (!user && configured) redirect('/auth');
  if (!user) return <><PageHeading title="Миний профайл"/><div className="empty">Профайл удирдахын тулд Supabase бүртгэлээр нэвтэрнэ үү.</div></>;
  const db = await supabase();
  const [{ data: profile }, { data: contact }, query] = await Promise.all([db.from('profiles').select('*').eq('id',user.id).single(), db.from('profile_contacts').select('*').eq('user_id',user.id).maybeSingle(), searchParams]);
  return <><PageHeading eyebrow="ХУВИЙН МЭДЭЭЛЭЛ" title="Миний профайл" description="Нийтэд харагдах мэдээлэл болон хувийн холбоо барих дугаарыг тусад нь хадгална."/><Notice error={query.error} message={query.message}/><form action={saveProfile} className="panel profile-grid"><label>Харагдах нэр<input name="display_name" required maxLength={100} defaultValue={profile?.display_name ?? ''}/></label><label>Аймаг / хот<select name="province" defaultValue={profile?.province ?? ''}><option value="">Сонгох</option>{provinces.map(province=><option key={province}>{province}</option>)}</select></label><label>Товч танилцуулга<textarea name="bio" rows={4} maxLength={2000} defaultValue={profile?.bio ?? ''}/></label><label>Утас · зөвхөн танд харагдана<input name="phone" type="tel" maxLength={50} defaultValue={contact?.phone ?? ''}/></label><label className="check"><input type="checkbox" name="published" defaultChecked={profile?.published ?? false}/>Профайлыг нийтэд харуулах</label><button className="button" type="submit">Хадгалах</button></form><form action={signOut} className="signout-form"><button className="button secondary" type="submit">Системээс гарах</button></form></>;
}