import {days,firebaseConfig} from './trip-data.js?v=vienna-rental-2';
import {escapeHTML as esc,safeLink} from './travel-extras-core.js?v=2';
import {travelDay,directions,preparation,relevantTickets} from './trip-companion-core.js?v=1';
const $=s=>document.querySelector(s),select=$('#companion-day');
let automatic=true,selected=travelDay().day,schedules=days.map(d=>({...d,rows:d.rows.map(([time,place,note])=>({time,place,note}))})),tickets=[],daysLive=false,ticketsLive=false;
select.innerHTML=days.map((d,i)=>`<option value="${i+1}">11.${i+13} · ${esc(d.title)}</option>`).join('');
const routeLink=(label,address)=>`<a class="companion-link" href="${esc(directions(address))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
function render(){
 const now=travelDay();if(automatic)selected=now.day;select.value=String(selected);
 $('#companion-mode').textContent=!automatic?'선택한 날짜 미리보기':now.phase==='before'?'출발 전 · 첫날 미리보기':now.phase==='after'?'여행의 마지막 날':'오늘의 여행';
 $('#companion-title').textContent=`DAY ${String(selected).padStart(2,'0')} · ${schedules[selected-1].title}`;
 $('#companion-sync').textContent=`일정 ${daysLive?'실시간 연결':'기본/마지막 기록'} · 예약 ${ticketsLive?'실시간 연결':'연결 확인 중'}`;
 $('#companion-rows').innerHTML=schedules[selected-1].rows.map(r=>`<li><time>${esc(r.time||'시간 미정')}</time><div><strong>${esc(r.place||'장소 미정')}</strong>${r.note?`<p>${esc(r.note)}</p>`:''}</div></li>`).join('')||'<li>아직 등록한 일정이 없어요.</li>';
 const relevant=relevantTickets(tickets,selected);
 $('#companion-tickets').innerHTML=relevant.map(t=>`<article><span class="companion-badge" data-done="${t.status==='예약 완료'}">${esc(t.status)}</span><h4>${esc(t.title)}</h4><p>${esc(t.time)}</p><p>${esc(t.place)}</p>${safeLink(t.url)?`<a href="${esc(safeLink(t.url))}" target="_blank" rel="noopener noreferrer">예약 열기 ↗</a>`:'<a href="#reservations">예약 정보 확인 ↓</a>'}</article>`).join('')||'<p>이 날짜에 등록한 예약이 없어요. 아래 예약 모음에서 추가할 수 있어요.</p>';
 $('#companion-detail').href=`planner.html?day=${selected}`;
 const links=[];
 if(selected<=2)links.push(['빈 숙소','Leonardo Hotel Vienna Hauptbahnhof, Gerhard-Bronner-Straße 5, Vienna, Austria']);
 if(selected===3)links.push(['빈 렌터카 인수','Hertz, Am Hauptbahnhof 1, Vienna, Austria']);
 if(selected>=3&&selected<=5)links.push(['몬드제 숙소','Herzog Odilo-Straße 84, 5310 Mondsee, Österreich']);
 if(selected===4)links.push(['잘츠부르크 도심','Salzburg Altstadt, Austria']);
 if(selected===5)links.push(['고사우 호수','Gosausee, Austria'],['할슈타트','Hallstatt, Austria']);
 if(selected===6)links.push(['린츠 렌터카 반납','Hertz, Wiener Straße 280, Linz, Austria'],['린츠 중앙역','Linz Hauptbahnhof, Austria'],['프라하 중앙역','Praha hlavní nádraží, Czechia']);
 if(selected>=6&&selected<=8){const stay=tickets.find(t=>t.id==='stay-prague'&&!t.deleted&&t.status==='예약 완료');if(stay?.place)links.push(['프라하 숙소 (예약 장소)',stay.place+', Prague, Czechia']);}
 if(selected===9)links.push(['프라하 공항','Václav Havel Airport Prague, Czechia']);
 $('#companion-directions').innerHTML=links.map(x=>routeLink(...x)).join('')||'<p>숙소 예약에 장소를 입력하면 길찾기가 표시돼요.</p>';
 $('#companion-transfer').hidden=selected!==6;
}
select.addEventListener('change',()=>{automatic=false;selected=+select.value;render()});
$('#companion-today').addEventListener('click',()=>{automatic=true;render()});
window.addEventListener('journey-schedule',e=>{schedules=e.detail;render()});
// Producers retain the latest snapshot so module load order cannot lose an update.
function receiveSchedule(){if(window.journeySchedule){schedules=window.journeySchedule;daysLive=!!window.journeyScheduleLive;}render()}
window.addEventListener('journey-schedule-state',receiveSchedule);receiveSchedule();
function receiveTickets(){if(window.journeyTickets){tickets=window.journeyTickets;ticketsLive=!!window.journeyTicketsLive;}render()}
window.addEventListener('journey-tickets',receiveTickets);receiveTickets();
setInterval(()=>{if(automatic)render()},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&automatic)render()});
const families=[['cheon','천가네'],['moon','문가네']];let checks={},ready=false,api,db,stop;const saving=new Set();
function checklist(){
 const focused=document.activeElement?.dataset?.check;
 $('#preparation-grid').innerHTML=families.map(([id,name])=>{const done=preparation.filter(([key])=>checks[id+'_'+key]===true).length;return `<article class="family-preparation"><header><h3>${name}</h3><span>${done} / ${preparation.length} 준비 완료</span></header><progress max="${preparation.length}" value="${done}" aria-label="${name} 준비 진행률"></progress>${preparation.map(([key,label])=>{const doc=id+'_'+key;return `<label><input type="checkbox" data-check="${doc}" ${checks[doc]?'checked':''} ${!ready||saving.has(doc)||!navigator.onLine?'disabled':''}><span>${esc(label)}</span>${saving.has(doc)?'<small>저장 중</small>':''}</label>`}).join('')}</article>`}).join('');
 if(focused)$('#preparation-grid').querySelector(`[data-check="${focused}"]`)?.focus();
}
const checkStatus=text=>$('#preparation-status').textContent=text;
$('#preparation-grid').addEventListener('change',async e=>{
 const input=e.target,id=input.dataset.check;if(!id||!ready||saving.has(id)||!navigator.onLine)return;
 const value=input.checked;saving.add(id);checklist();checkStatus('가족에게 공유 저장 중…');
 try{await api.setDoc(api.doc(db,'trips','europe-2026','preparation',id),{done:value,updatedAt:Date.now()});checkStatus('공유 저장 완료 · 다른 가족 화면에도 반영돼요');}
 catch{checkStatus('저장하지 못했어요. 연결을 확인하고 다시 체크해 주세요.');}
 finally{saving.delete(id);checklist();$('#preparation-grid').querySelector(`[data-check="${id}"]`)?.focus();}
});
function connect(){stop?.();ready=false;checklist();checkStatus('가족별 준비 상황 불러오는 중…');stop=api.onSnapshot(api.collection(db,'trips','europe-2026','preparation'),{includeMetadataChanges:true},s=>{checks=Object.fromEntries(s.docs.map(d=>[d.id,d.data().done]));ready=!s.metadata.fromCache;checklist();if(!saving.size)checkStatus(ready?'실시간 공유 중 · 각 가족 칸에서 준비 완료를 체크하세요':'연결 중 · 마지막 준비 상황 표시');},()=>{ready=false;checklist();checkStatus('공유 연결 실패 · 다시 연결을 눌러 주세요.');});}
$('#preparation-retry').addEventListener('click',()=>db?connect():location.reload());
window.addEventListener('offline',()=>{ready=false;checklist();checkStatus('인터넷 연결 끊김 · 연결 후 체크할 수 있어요');});
window.addEventListener('online',()=>{if(db)connect()});
checklist();
try{const [app,firestore]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);api=firestore;db=api.getFirestore(app.getApps().length?app.getApp():app.initializeApp(firebaseConfig));connect();}catch{checkStatus('공유 연결 실패 · 인터넷 연결을 확인해 주세요.');}
