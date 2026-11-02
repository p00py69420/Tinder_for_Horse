export type Horse = {
 id: string; owner_id: string; name: string; breed_id: string;
 sex: 'stallion' | 'mare' | 'gelding'; birth_year: number; province: string;
 description: string; achievements: string; published: boolean; verified: boolean;
 sire?: string; dam?: string; sire_verified?: boolean; dam_verified?: boolean;
 available: boolean; preferred_breed_id?: string | null; photo?: string;
};
export const breeds: Record<string,string> = {mongolian:'Монгол',thoroughbred:'Цэвэр цусны англи',arabian:'Араб',imported:'Бусад импортын',crossbreed:'Эрлийз'};
export const sexes = {stallion:'Азарга',mare:'Гүү',gelding:'Агт'};
export const provinces = ['Улаанбаатар','Архангай','Баян-Өлгий','Баянхонгор','Булган','Говь-Алтай','Говьсүмбэр','Дархан-Уул','Дорноговь','Дорнод','Дундговь','Завхан','Орхон','Өвөрхангай','Өмнөговь','Сүхбаатар','Сэлэнгэ','Төв','Увс','Ховд','Хөвсгөл','Хэнтий'];
