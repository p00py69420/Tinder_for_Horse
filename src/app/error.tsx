'use client';

export default function AppError({error,reset}:{error:Error & {digest?:string};reset:()=>void}) {
  const message=error.message==='HORSE_DATA_PERMISSION_ERROR'
    ?'Таны эрхээр бүртгэл унших боломжгүй байна. Нэвтэрч дахин оролдох эсвэл админ RLS болон SELECT эрхийг шалгана уу.'
    :error.message==='HORSE_DATA_SCHEMA_ERROR'
      ?'Адууны хүснэгт эсвэл багана олдсонгүй. Админ Supabase migration амжилттай хэрэгжсэн эсэхийг шалгана уу.'
      :error.message==='Supabase тохиргоо дутуу байна. README зааврыг дагана уу.'
        ?'Supabase холболтын тохиргоо дутуу байна. Админ Vercel Production environment variables-ийг шалгана уу.'
        :'Мэдээллийн сангийн хүсэлт амжилтгүй боллоо. Энэ нь бүртгэл хоосон гэсэн үг биш; админ Vercel server logs-оос хүснэгт болон алдааны кодыг шалгана уу.';
  return <section className="panel error-page" role="alert"><p className="eyebrow">ӨГӨГДӨЛ АЧААЛАХ АЛДАА</p><h1>Адууны бүртгэл ачаалсангүй.</h1><p className="muted">{message}</p><button className="button" onClick={reset}>Дахин оролдох</button></section>;
}