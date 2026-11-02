import { notFound, redirect } from 'next/navigation';
import { HorseForm } from '@/components/horse-form';
import { PageHeading } from '@/components/ui';
import { currentUser, getHorses } from '@/lib/data';

export default async function EditHorsePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user, horses] = await Promise.all([params, currentUser(), getHorses()]);
  if (!user) redirect('/auth');
  const horse = horses.find(item => item.id === id && item.owner_id === user.id);
  if (!horse) notFound();
  return <><PageHeading eyebrow="БҮРТГЭЛ ЗАСАХ" title={horse.name} description="Өөрийн адууны мэдээллийг шинэчилнэ үү."/><HorseForm horse={horse} horses={horses.filter(item => item.owner_id === user.id || item.published)}/></>;
}