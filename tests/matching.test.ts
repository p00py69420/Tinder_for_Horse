import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeMating } from '../src/lib/analysis';
import { horseQueryFailureCode } from '../src/lib/data';
import { inbreedingCoefficient, matchPartners, pedigree } from '../src/lib/matching';
import type { Horse } from '../src/lib/types';

function makeHorse(id:string,sex:Horse['sex'],sire?:string,dam?:string):Horse {
 return {id,owner_id:'test',name:id,breed_id:'mongolian',sex,birth_year:2000,province:'Төв',description:'',achievements:'',published:true,verified:false,sire,dam,available:false};
}

test('five-generation completeness counts all 62 ancestor positions',()=>{
 const horses:Horse[]=[];
 let serial=0;
 function fullTree(depth:number,sex:Horse['sex']):Horse {
  const horse=makeHorse(`horse-${serial++}`,sex);
  horses.push(horse);
  if(depth>0) {
   const sire=fullTree(depth-1,'stallion');
   const dam=fullTree(depth-1,'mare');
   horse.sire=sire.id;
   horse.dam=dam.id;
  }
  return horse;
 }
 const subject=fullTree(5,'mare');
 const result=pedigree(subject,horses);
 assert.equal(result.total,62);
 assert.equal(result.filled,62);
});

test('unknown parents reduce pedigree completeness rather than implying no relatedness',()=>{
 const mare=makeHorse('mare','mare','sire','dam');
 const result=pedigree(mare,[mare,makeHorse('sire','stallion'),makeHorse('dam','mare')]);
 assert.equal(result.filled,2);
 assert.equal(result.total,62);
});

test('breeding match reasons use the five-generation ancestor total',()=>{
 const mare=makeHorse('mare','mare','sire');
 const sire=makeHorse('sire','stallion');
 const candidate=makeHorse('candidate','stallion');
 candidate.available=true;
 const [match]=matchPartners(mare,[mare,sire,candidate]);
 assert.match(match.reasons[3],/1\/62/);
 assert.match(match.reasons[3],/0\/62/);
});

test('half-sibling mating coefficient is calculated from their shared sire',()=>{
 const horses=[
  makeHorse('shared-sire','stallion'),
  makeHorse('mare-dam','mare'),
  makeHorse('stallion-dam','mare'),
  makeHorse('mare','mare','shared-sire','mare-dam'),
  makeHorse('stallion','stallion','shared-sire','stallion-dam'),
 ];
 assert.equal(inbreedingCoefficient(horses[3],horses[4],horses),0.125);
});

test('analysis reports shared ancestors but withholds unsupported ratings',()=>{
 const horses=[
  makeHorse('shared-sire','stallion'),
  makeHorse('mare-dam','mare'),
  makeHorse('stallion-dam','mare'),
  makeHorse('mare','mare','shared-sire','mare-dam'),
  makeHorse('stallion','stallion','shared-sire','stallion-dam'),
 ];
 const result=analyzeMating(horses[3],horses[4],horses);
 assert.equal(result.common[0].id,'shared-sire');
 assert.equal(result.common[0].mareAppearances,1);
 assert.equal(result.common[0].stallionAppearances,1);
 assert.equal(result.inbreedingCoefficient,null);
 assert.equal(result.performance.status,'Insufficient statistical evidence.');
});

test('horse query failures distinguish permission, schema, and other database errors',()=>{
 assert.equal(horseQueryFailureCode({code:'42501',message:'permission denied'}),'HORSE_DATA_PERMISSION_ERROR');
 assert.equal(horseQueryFailureCode({code:'42P01',message:'relation does not exist'}),'HORSE_DATA_SCHEMA_ERROR');
 assert.equal(horseQueryFailureCode({code:'08006',message:'connection failure'}),'HORSE_DATA_QUERY_ERROR');
});