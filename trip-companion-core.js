export function travelDay(now=new Date()) {
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const offset=Math.round((Date.parse(date+'T00:00:00Z')-Date.UTC(2026,10,13))/86400000);
  return {day:Math.max(1,Math.min(9,offset+1)),phase:offset<0?'before':offset>8?'after':'during'};
}
export const directions=(destination)=>'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(destination);
export const preparation=[
 ['passport','여권 · 항공권 확인'],['license','운전자 면허증 · 국제운전면허증 준비'],
 ['booking','숙소 · 기차 · 렌터카 예약 확인'],['insurance','여행자보험 준비'],
 ['roaming','로밍 / eSIM 준비'],['money','해외 결제 카드 · 현금 준비'],
 ['charger','충전기 · 어댑터 · 보조배터리'],['clothes','방한복 · 편한 신발'],
 ['medicine','개인 상비약 챙기기'],['copies','예약 티켓 · 주소 사본 저장']
];
export function relevantTickets(tickets,day){
 const date=`2026-11-${day+12}`;
 return tickets.filter(t=>!t.deleted&&(t.date===date||({ 'stay-vienna':[1,2],'stay-lakes':[3,4,5],'stay-prague':[6,7,8],rental:[3,4,5,6]}[t.id]||[]).includes(day)));
}
