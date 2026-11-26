export const houses = [
 {id:1,name:'Сосновый',description:'Тихий дом среди сосен, терраса и камин.',capacity:2,price:3900,x:13,y:24,busy:false},
 {id:2,name:'Лисий',description:'Компактный дом с панорамным окном.',capacity:2,price:4500,x:32,y:18,busy:false},
 {id:3,name:'Берёзовый',description:'Светлый семейный дом с кухней.',capacity:4,price:5900,x:51,y:22,busy:true},
 {id:4,name:'Озёрный',description:'Дом с видом на воду и большой террасой.',capacity:4,price:6900,x:69,y:29,busy:false},
 {id:5,name:'Моховой',description:'Уединённый дом для небольшой компании.',capacity:4,price:4900,x:13,y:70,busy:false},
 {id:6,name:'Кедровый',description:'Просторная гостиная и три спальни.',capacity:6,price:7900,x:32,y:68,busy:false},
 {id:7,name:'Северный',description:'Большой дом для семейного отдыха.',capacity:6,price:8900,x:51,y:76,busy:true},
 {id:8,name:'Лесная усадьба',description:'Четыре спальни, веранда и зона отдыха.',capacity:8,price:11900,x:69,y:66,busy:false}
];
export const KEY='lesnoe.bookings.v1';
export function validInteger(value,min,max){return Number.isInteger(value)&&value>=min&&value<=max;}
export function validBookings(value){if(!Array.isArray(value))return false;const ids=new Set(),numbers=new Set();return value.every(b=>{if(!b||typeof b!=='object')return false;const h=houses.find(h=>h.id===b.houseId);if(!h||h.busy||ids.has(h.id)||typeof b.number!=='string'||!b.number||numbers.has(b.number)||!validInteger(b.guests,1,h.capacity)||!validInteger(b.nights,1,30)||b.total!==h.price*b.nights)return false;ids.add(h.id);numbers.add(b.number);return true;});}
