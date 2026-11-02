import type { Horse } from './types';
const base = {owner_id:'demo',description:'Зөвхөн туршилтад зориулсан зохиомол бүртгэл.',achievements:'Зохиомол сумын наадам — айргийн тав',published:true,verified:false,available:true};
export const demoHorses: Horse[] = [
 {...base,id:'demo-1',name:'Талын Салхи',breed_id:'mongolian',sex:'stallion',birth_year:2019,province:'Төв',sire:'demo-7',dam:'demo-8'},
 {...base,id:'demo-2',name:'Саран Гуа',breed_id:'mongolian',sex:'mare',birth_year:2020,province:'Төв',sire:'demo-9',dam:'demo-10'},
 {...base,id:'demo-3',name:'Хээрийн Од',breed_id:'mongolian',sex:'mare',birth_year:2018,province:'Хэнтий',sire:'demo-7'},
 {...base,id:'demo-4',name:'Алтан Туяа',breed_id:'arabian',sex:'mare',birth_year:2021,province:'Сэлэнгэ'},
 {...base,id:'demo-5',name:'Хурдны Жигүүр',breed_id:'thoroughbred',sex:'stallion',birth_year:2017,province:'Улаанбаатар'},
 {...base,id:'demo-6',name:'Хангайн Үүр',breed_id:'crossbreed',sex:'mare',birth_year:2020,province:'Архангай',sire:'demo-5'},
 {...base,id:'demo-7',name:'Буурал Хаан',breed_id:'mongolian',sex:'stallion',birth_year:2008,province:'Хэнтий',available:false},
 {...base,id:'demo-8',name:'Цагаан Сувд',breed_id:'mongolian',sex:'mare',birth_year:2010,province:'Төв',available:false},
 {...base,id:'demo-9',name:'Говийн Зэрэглээ',breed_id:'mongolian',sex:'stallion',birth_year:2009,province:'Өмнөговь',available:false},
 {...base,id:'demo-10',name:'Эрдэнийн Гуа',breed_id:'mongolian',sex:'mare',birth_year:2011,province:'Булган',available:false},
 {...base,id:'demo-11',name:'Холын Зочин',breed_id:'imported',sex:'stallion',birth_year:2018,province:'Дархан-Уул'},
];
