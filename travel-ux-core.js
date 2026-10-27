export const places=[
 {name:'빈',keys:['비엔나','빈','vienna','wien'],point:[48.2082,16.3738]},
 {name:'몬드제',keys:['몬드제','몽드제','mondsee'],point:[47.86,13.35]},
 {name:'잘츠부르크',keys:['잘츠부르크','salzburg'],point:[47.8095,13.055]},
 {name:'린츠',keys:['린츠','linz'],point:[48.3069,14.2858]},
 {name:'고사우',keys:['고사우','gosau'],point:[47.584,13.534]},
 {name:'할슈타트',keys:['할슈타트','hallstatt'],point:[47.5622,13.6493]},
 {name:'프라하',keys:['프라하','prague','praha'],point:[50.0755,14.4378]}
];
export function findPlace(text){const s=String(text).toLowerCase();const matches=places.filter(p=>p.keys.some(k=>s.includes(k)));return matches.length===1?matches[0]:null}
export function expenseAmount(raw,currency){const amount=Number(raw),scale=currency==='KRW'?1:100;return ['KRW','EUR','CZK'].includes(currency)&&Number.isFinite(amount)&&amount>0&&amount<=(currency==='KRW'?1e9:1e6)&&Math.abs(amount*scale-Math.round(amount*scale))<1e-6?amount:null}
export function swipeDay(day,dx,dy){return Math.abs(dx)>=65&&Math.abs(dx)>Math.abs(dy)*1.7?Math.max(1,Math.min(9,day+(dx<0?1:-1))):day}
