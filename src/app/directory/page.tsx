import { Directory } from '@/components/directory';
import { PageHeading } from '@/components/ui';
import { getHorses } from '@/lib/data';

export default async function DirectoryPage() {
  const horses = await getHorses();
  return <><PageHeading eyebrow="БҮРТГЭЛИЙН САН" title="Адуу хайх" description="Нийтэд нээлттэй бүртгэлүүдийг үүлдэр, байршил болон бусад үзүүлэлтээр шүүнэ."/><Directory horses={horses}/></>;
}