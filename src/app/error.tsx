'use client';

export default function AppError({reset}:{error:Error & {digest?:string};reset:()=>void}) {
  return <section className="panel error-page" role="alert"><p className="eyebrow">ӨГӨГДЛИЙН САНТАЙ ХОЛБОГДОХГҮЙ БАЙНА</p><h1>Адууны бүртгэл ачаалсангүй.</h1><p className="muted">Supabase төслийн холболт, migrations болон хүснэгтийн эрхийг шалгана уу. Алдаа зассаны дараа дахин оролдоорой.</p><button className="button" onClick={reset}>Дахин оролдох</button></section>;
}