import type { Horse } from './types';
import { inbreedingCoefficient, pedigree } from './matching';

export function analyzeMating(mare: Horse, stallion: Horse, horses: Horse[]) {
 const marePedigree=pedigree(mare,horses);
 const stallionPedigree=pedigree(stallion,horses);
 const index=new Map(horses.map(horse=>[horse.id,horse]));
 const common=[...marePedigree.occurrences.keys()].filter(id=>stallionPedigree.occurrences.has(id)).map(id=>({
  id,
  name:index.get(id)?.name??'Нэр тодорхойгүй',
  mareAppearances:marePedigree.occurrences.get(id)!.length,
  stallionAppearances:stallionPedigree.occurrences.get(id)!.length,
  mareGenerations:marePedigree.occurrences.get(id)!,
  stallionGenerations:stallionPedigree.occurrences.get(id)!,
  verified:index.get(id)?.verified??false,
 })).sort((a,b)=>a.name.localeCompare(b.name));
 const complete=marePedigree.filled===marePedigree.total&&stallionPedigree.filled===stallionPedigree.total;
 return {
  marePedigree,
  stallionPedigree,
  common,
  inbreedingCoefficient:complete?inbreedingCoefficient(mare,stallion,horses):null,
  performance:{
   status:'Insufficient statistical evidence.',
   detail:'Бүртгэгдсэн хээлтүүлэг, унага, гараа, ялалт болон баталгаатай томоохон амжилтын популяцийн өгөгдөл байхгүй тул SII/BSII тооцохгүй.',
  },
 };
}