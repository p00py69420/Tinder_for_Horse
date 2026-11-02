import { redirect } from 'next/navigation';
import { HorseForm } from '@/components/horse-form';
import { PageHeading } from '@/components/ui';
import { currentUser, getHorses } from '@/lib/data';

export default async function NewHorsePage() {
  const user = await currentUser();
  if (!user) redirect('/auth');
  const horses = await getHorses();
  return <><PageHeading eyebrow="ШИНЭ БҮРТГЭЛ" title="Адуу бүртгэх" description="Мэдээллээ бүртгээд эцэг, эхийн холбоог сонгоно уу."/><HorseForm horses={horses.filter(horse => horse.owner_id === user.id || horse.published)}/></>;
}