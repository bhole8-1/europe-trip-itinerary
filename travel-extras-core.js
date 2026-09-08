export function countdown(now=new Date()) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part=t=>parts.find(p=>p.type===t).value;
  const today=Date.UTC(+part('year'),+part('month')-1,+part('day'));
  const delta=Math.round((Date.UTC(2026,10,13)-today)/86400000);
  return delta>0?{label:`D-${delta}`,message:'우리의 유럽 여행까지'}:delta===0?{label:'D-DAY',message:'오늘, 유럽으로 출발해요'}:delta>=-8?{label:`DAY ${1-delta}`,message:'지금은 여행 중'}:{label:'OUR MEMORIES',message:'함께 다녀온 유럽, 오래 남을 추억'};
}
export const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeLink(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:''}catch{return ''}}
export const categories=['항공','숙소','기차','렌터카','입장권 · 공연','기타'];
export const statuses=['확인 필요','예약 전','예약 완료'];
export const ticketDefaults=[
  ['flight-out','항공','인천 → 빈','2026-11-13','11:55 → 16:55','인천공항 → 빈 공항','확인 필요','기존 일정의 대한항공 직항 · 각 공항 현지 시각. 예약 여부를 확인해 주세요.'],
  ['stay-vienna','숙소','빈에서 3박','2026-11-13','11.13 체크인 · 11.16 체크아웃','빈','예약 전','숙소명과 체크인 정보를 적어주세요.'],
  ['train-linz','기차','빈 → 린츠','2026-11-16','','출발역 · 도착역 미정','예약 전','열차 편명과 출발 시간을 확인해 주세요.'],
  ['rental','렌터카','린츠 인수 · 린츠 반납','2026-11-16','11.16 인수 · 11.18 반납','린츠 · 지점 미정','예약 전','인수·반납 지점과 운영 시간을 적어주세요.'],
  ['stay-lakes','숙소','잘츠부르크 인근에서 2박','2026-11-16','11.16 체크인 · 11.18 체크아웃','잘츠부르크 인근','예약 전','주차 가능한 숙소 · 호수 여행의 거점. 숙소 미정.'],
  ['train-prague','기차','린츠 → 프라하','2026-11-18','','출발역 · 도착역 미정','예약 전','린츠에서 렌터카 반납 후 기차로 이동해요.'],
  ['stay-prague','숙소','프라하에서 3박','2026-11-18','11.18 체크인 · 11.21 체크아웃','프라하','예약 전','숙소명과 체크인 정보를 적어주세요.'],
  ['flight-home','항공','프라하 → 인천','2026-11-21','18:30 → 13:50 +1','프라하 공항 → 인천공항','확인 필요','기존 일정의 대한항공 직항 · 11.22 인천 도착. 예약 여부를 확인해 주세요.']
].map(([id,category,title,date,time,place,status,memo])=>({id,category,title,date,time,place,status,memo,url:'',revision:0,deleted:false,updatedAt:0}));
export function mergeTickets(docs){const all=new Map(ticketDefaults.map(x=>[x.id,{...x}]));for(const d of docs)all.set(d.id,d);return [...all.values()].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.title.localeCompare(b.title,'ko'))}
export function validateTicket(t){return categories.includes(t.category)&&statuses.includes(t.status)&&typeof t.title==='string'&&t.title.trim().length>0&&t.title.length<=100&&/^2026-\d{2}-\d{2}$/.test(t.date)&&!isNaN(Date.parse(t.date))&&['time','place','memo','url'].every(k=>typeof t[k]==='string'&&t[k].length<=({time:100,place:200,memo:1000,url:2000}[k]))&&(!t.url||!!safeLink(t.url))}
