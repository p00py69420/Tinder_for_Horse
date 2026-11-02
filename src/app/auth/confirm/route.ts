import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest,NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
export async function GET(request:NextRequest) {
 const token_hash=request.nextUrl.searchParams.get('token_hash');const type=request.nextUrl.searchParams.get('type');
 if(token_hash && type==='signup') {
  const db=await supabase();const {error}=await db.auth.verifyOtp({token_hash,type:type as EmailOtpType});
  if(!error) return NextResponse.redirect(new URL('/my-horses',request.url));
 }
 return NextResponse.redirect(new URL('/auth?error='+encodeURIComponent('Баталгаажуулах холбоос хүчингүй эсвэл хугацаа дууссан.'),request.url));
}
