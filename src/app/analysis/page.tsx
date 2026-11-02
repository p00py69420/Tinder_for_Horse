import { BreedingAnalysis } from '@/components/breeding-analysis';
import { PageHeading } from '@/components/ui';
import { currentUser, getHorses } from '@/lib/data';

export default async function AnalysisPage() {
  const [horses,user]=await Promise.all([getHorses(),currentUser()]);
  return <><PageHeading eyebrow="АДУУMATCH BREEDING ANALYSIS" title="Хосын угшлын тайлан" description="Таван үеийн бүртгэл, дундын өвөг болон мэдээллийн хязгаарыг харьцуулна."/><BreedingAnalysis horses={horses} ownerId={user?.id}/></>;
}