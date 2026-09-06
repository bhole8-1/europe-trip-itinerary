import {days,firebaseConfig} from './trip-data.js?v=overview-1';
const grid=document.querySelector('#days-grid'),status=document.querySelector('#overview-status'),statusWrap=document.querySelector('.sync');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const meta=[['vienna','항공 · 도착','VIENNA','plane'],['vienna','도보 · 문화','VIENNA','walk'],['vienna','궁전 · 공연','VIENNA','walk'],['lakes','기차 → 렌터카','LINZ / LAKES','train'],['lakes','렌터카 · 호수','SALZKAMMERGUT','car'],['vienna','반납 → 기차','VIENNA','train'],['prague','도보 · 구시가지','PRAGUE','walk'],['prague','산책 · 자유시간','PRAGUE','walk'],['prague','항공 · 귀국','PRAGUE → INCHEON','plane']];
const icons={plane:'<path d="m3 15 7-4-5-7 2-1 9 6 5-2c2-1 3 1 1 2l-6 3-1 8-2 1-2-7-5 3z"/>',train:'<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 10h14M9 3v7M5 22l4-4m6 0 4 4M8 14h1m6 0h1"/>',car:'<path d="m4 10 2-6h12l2 6M3 10h18v9H3zM6 19v2m12-2v2M6 14h2m8 0h2"/>',walk:'<circle cx="13" cy="4" r="2"/><path d="m8 11 4-4 4 5 4 1M12 8l-2 7-4 6m4-6 5 2 1 5"/>'};
let current=days.map(d=>d.rows.map(([time,place,note])=>({time,place,note}))),live=false;
export function renderCards(rowsByDay=current){return days.map((d,i)=>{const [region,mode,city,icon]=meta[i];const rows=(rowsByDay[i]||[]).filter(r=>r&&(r.time||r.place||r.note));const shown=rows.slice(0,4);return `<a class="day-card" data-region="${region}" href="planner.html?day=${i+1}" aria-label="11월 ${i+13}일, ${escape(d.title)} 상세 일정"><div class="day-head"><div class="day-number">${String(i+1).padStart(2,'0')}<small>DAY</small></div><div class="day-info"><time datetime="2026-11-${i+13}">${escape(d.date)}</time><span class="mode"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg>${mode}</span></div></div><h3>${escape(d.title)}</h3>${shown.length?`<ul class="schedule">${shown.map(r=>`<li><time>${escape(r.time||'미정')}</time><span>${escape(r.place||r.note||'세부 일정 미정')}</span></li>`).join('')}</ul>`:'<p class="empty-schedule">아직 등록한 일정이 없어요.</p>'}${rows.length>4?`<p class="more-rows">외 ${rows.length-4}개 일정</p>`:''}<div class="card-bottom"><span>${city}</span><span class="open-day">상세 일정 <b aria-hidden="true">↗</b></span></div></a>`}).join('')}
function render(){const focused=document.activeElement?.closest?.('.day-card')?.getAttribute('href');grid.innerHTML=renderCards();if(focused)Array.from(grid.querySelectorAll('a')).find(a=>a.getAttribute('href')===focused)?.focus({preventScroll:true})}
function setStatus(text,state){status.textContent=text;statusWrap.dataset.state=state}
render();
document.querySelector('#reload-overview').addEventListener('click',()=>location.reload());
window.addEventListener('offline',()=>setStatus('연결 끊김 · 마지막 일정 표시','error'));
window.addEventListener('online',()=>setStatus('공유 일정 다시 연결 중','loading'));
try{
const [{initializeApp},{getFirestore,collection,onSnapshot}]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);
const db=getFirestore(initializeApp(firebaseConfig));
onSnapshot(collection(db,'trips','europe-2026','days'),{includeMetadataChanges:true},snapshot=>{
current=days.map(d=>d.rows.map(([time,place,note])=>({time,place,note})));
snapshot.docs.forEach(doc=>{const i=Number(doc.id)-1;const rows=doc.data().rows;if(i>=0&&i<9&&Array.isArray(rows))current[i]=rows});render();
live=!snapshot.metadata.fromCache;setStatus(live?'공유 일정과 실시간 연결':'공유 일정 불러오는 중',live?'live':'loading');
document.querySelector('#reload-overview').hidden=true;
},()=>{setStatus(live?'연결 오류 · 마지막 일정 표시':'연결 오류 · 기본 일정 표시','error');document.querySelector('#reload-overview').hidden=false});
}catch{setStatus('연결 오류 · 기본 일정 표시','error');document.querySelector('#reload-overview').hidden=false}
