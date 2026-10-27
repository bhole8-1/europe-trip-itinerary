import {travelDay} from './trip-companion-core.js?v=1';
import {days} from './trip-data.js?v=vienna-rental-2';
const main=document.querySelector('main'),q=s=>document.querySelector(s);
const definitions=[['home','홈'],['schedule','일정'],['map','지도'],['reservations','예약 지갑'],['expenses','여행 경비'],['preparation','출발 준비'],['overview','전체 일정'],['places','여행의 풍경']];
const panels=new Map(definitions.map(([key,title])=>{const el=document.createElement('section');el.className='app-screen';el.id='screen-'+key;el.dataset.screen=key;el.setAttribute('aria-label',title);el.hidden=true;return [key,el]}));
function move(screen,selector){document.querySelectorAll(selector).forEach(el=>panels.get(screen).append(el))}
move('home','#home');move('schedule','#today-trip');move('preparation','#preparation');move('overview','#all-days,.route-panel');move('places','#city-photos');move('map','.map-section');move('reservations','#reservations');
// Keep existing forms and shared subscriptions mounted when switching screens.
const dialogs=[...main.querySelectorAll('dialog')],install=q('.pwa-banner');
main.replaceChildren(...panels.values(),...dialogs,install);
install.hidden=true;
const hero=panels.get('home');
hero.insertAdjacentHTML('beforeend',`<div class="home-desk"><a class="home-next" href="#schedule"><div class="home-card-label">NEXT CHAPTER <span>일정 열기 ↗</span></div><h2 id="home-next-title">우리의 다음 여행</h2><p id="home-next-date"></p><div id="home-next-lines"></div></a><a href="#preparation" class="home-ready"><div class="home-card-label">READY TO GO <span>준비물 확인 ↗</span></div><h2>두 가족, 출발 준비</h2><div id="home-family-summary">준비 현황을 불러오는 중…</div></a><div class="home-actions"><a href="#map"><span>MAP</span><strong>어디로 갈까</strong><small>전체 동선과 목적지 ↗</small></a><a href="#reservations"><span>TICKETS</span><strong>예약 지갑</strong><small id="home-ticket-summary">항공 · 숙소 · 기차 ↗</small></a><a href="#expenses"><span>EXPENSES</span><strong>함께 쓴 경비</strong><small>지출 기록 · 통화별 합계 ↗</small></a></div><div class="home-more"><a href="#overview">9일 전체 일정 ↗</a><a href="#places">여행의 풍경 ↗</a></div></div>`);
panels.get('schedule').insertAdjacentHTML('afterbegin','<div class="screen-actions"><a href="#overview">9일 전체 일정 ↗</a><a href="planner.html">일정 수정 ↗</a></div>');
panels.get('expenses').innerHTML='<div class="expense-loading" role="status">공유 경비를 연결하고 있어요…</div><iframe id="expense-screen" title="함께 쓰는 여행 경비" data-src="planner.html?view=expenses&embed=1" loading="eager"></iframe><a class="expense-fallback" href="planner.html?view=expenses">경비 화면을 별도로 열기 ↗</a>';
const oldHeader=q('.site-header');oldHeader.innerHTML='<a class="app-brand" href="#home">우리의 유럽 <small>CHEON × MOON · 2026</small></a><div class="app-page-name"><button id="screen-back" type="button" hidden aria-label="홈으로">←</button><h1 id="screen-title">홈</h1></div><div id="app-install"></div>';
q('#app-install').append(q('#pwa-open'));
q('.footer').hidden=true;q('.skip').href='#schedule';
const nav=q('.mobile-dock');nav.setAttribute('aria-label','여행 화면 선택');
const destinations={home:'home',schedule:'schedule',map:'map',reservations:'reservations',expenses:'expenses'};
nav.querySelectorAll('a').forEach(a=>a.href='#'+destinations[a.dataset.nav]);
['home','schedule','map','reservations','expenses'].forEach(key=>nav.append(nav.querySelector(`[data-nav="${key}"]`)));
const aliases={'today-trip':'schedule','all-days':'overview','map-title':'map','city-photos':'places','planner':'schedule'};
let current='',scrolls={};
function show(){const raw=decodeURIComponent(location.hash.slice(1)||'home'),key=panels.has(raw)?raw:(aliases[raw]||'home');
 if(current)scrolls[current]=window.scrollY;
 for(const [name,panel] of panels){panel.hidden=name!==key;panel.inert=name!==key;}
 current=key;document.body.dataset.screen=key;
 const title=definitions.find(d=>d[0]===key)[1];q('#screen-title').textContent=title;document.title=title+' · 우리의 유럽';
 q('#screen-back').hidden=['home','schedule','map','reservations','expenses'].includes(key);
 const active=['overview','places'].includes(key)?'schedule':key==='preparation'?'home':key;
 nav.querySelectorAll('a').forEach(a=>{if(a.dataset.nav===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 if(key==='expenses'){const frame=q('#expense-screen');if(!frame.getAttribute('src'))frame.src=frame.dataset.src;}
 requestAnimationFrame(()=>{window.scrollTo({top:scrolls[key]||0,behavior:'instant'});window.dispatchEvent(new CustomEvent('travel-screen',{detail:key}));if(key==='schedule'){const rail=q('#companion-days'),active=rail.querySelector('[aria-pressed="true"]');if(active)rail.scrollLeft=Math.max(0,active.offsetLeft-rail.offsetLeft-rail.clientWidth/2+active.clientWidth/2);}q('#screen-title').setAttribute('tabindex','-1');q('#screen-title').focus({preventScroll:true});});
}
q('#screen-back').addEventListener('click',()=>location.hash='home');
window.addEventListener('hashchange',show);
// Same-screen links should also work after a previous scroll.
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||a.closest('.leaflet-container'))return;if(a.classList.contains('home-next'))q('#companion-today').click();const key=aliases[a.hash.slice(1)]||a.hash.slice(1);if(panels.has(key)){e.preventDefault();if(location.hash==='#'+key){window.scrollTo({top:0,behavior:'instant'})}else location.hash=key;}});
q('#expense-screen').addEventListener('load',()=>q('.expense-loading').hidden=true);
function homeSummary(){const trip=travelDay(),i=trip.day-1,live=window.journeySchedule?.[i],fallback=days[i];q('#home-next-title').textContent=live?.title||fallback.title;q('#home-next-date').textContent=(trip.phase==='before'?'출발 첫날 · ':trip.phase==='after'?'여행의 마지막 날 · ':'오늘 · ')+fallback.date;
 const rows=live?.rows||fallback.rows.map(([time,place])=>({time,place}));q('#home-next-lines').replaceChildren(...rows.slice(0,2).map(r=>{const p=document.createElement('p'),t=document.createElement('time'),s=document.createElement('span');t.textContent=r.time||'미정';s.textContent=r.place||'일정 확인';p.append(t,s);return p}));
 const tickets=(window.journeyTickets||[]).filter(t=>!t.deleted);if(tickets.length)q('#home-ticket-summary').textContent=`${tickets.filter(t=>t.status==='예약 완료').length} / ${tickets.length}건 예약 완료 ↗`;
}
function familySummary(){const cards=[...q('#preparation-grid').querySelectorAll('[data-family]')];q('#home-family-summary').replaceChildren(...cards.map(card=>{const line=document.createElement('div'),name=document.createElement('span'),count=document.createElement('b');name.textContent=card.dataset.family==='cheon'?'천가네':'문가네';count.textContent=card.querySelector('.family-copy>span')?.textContent||'연결 중';line.append(name,count);return line}));}
new MutationObserver(familySummary).observe(q('#preparation-grid'),{childList:true,subtree:true});
window.addEventListener('journey-schedule-state',homeSummary);window.addEventListener('journey-tickets',homeSummary);setInterval(homeSummary,60000);
document.body.classList.add('screen-app');homeSummary();familySummary();show();
