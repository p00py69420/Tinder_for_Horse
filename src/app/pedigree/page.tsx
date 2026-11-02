import { PedigreeExplorer } from '@/components/pedigree';
import { PageHeading } from '@/components/ui';
import { getHorses } from '@/lib/data';

export default async function PedigreePage() {
  const horses = await getHorses();
  return <><PageHeading eyebrow="УГШИЛ" title="Угшлын бүртгэл" description="Бүртгэгдсэн эцэг, эхийн холбоог тав хүртэлх үеэр харна. Дутуу холбоог ил тод тэмдэглэнэ."/><PedigreeExplorer horses={horses}/></>;
}