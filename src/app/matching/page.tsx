import { Matching } from '@/components/matching';
import { PageHeading } from '@/components/ui';
import { currentUser, getHorses } from '@/lib/data';
import { configured } from '@/lib/supabase/config';

export default async function MatchingPage() {
  const [horses, user] = await Promise.all([getHorses(), currentUser()]);
  return <><PageHeading eyebrow="ҮРЖЛИЙН ХАЙЛТ" title="Боломжит хосууд" description="Бүртгэлийн тохирлыг харьцуулна. Энэ нь гүйцэтгэлд суурилсан үржлийн дүгнэлт биш."/><Matching horses={horses} ownerId={user?.id} demo={!configured}/></>;
}