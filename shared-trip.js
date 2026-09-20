import {days,firebaseConfig} from './trip-data.js?v=vienna-rental-2';
const planKey='central-europe-2026-schedule-v3',key='central-europe-2026-expenses';
const readLocal=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}};
const legacyPlans=readLocal(planKey,{}),legacyExpenses=readLocal(key,[]);
const state=days.map(d=>({rows:d.rows.map(r=>({time:r[0],place:r[1],note:r[2]})),revision:0}));
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected=Number(new URLSearchParams(location.search).get('day')||localStorage.getItem('central-europe-2026-selected-day')||1);if(!Number.isInteger(selected)||selected<1||selected>9)selected=1;
const tabs=document.querySelector('#day-tabs'),planner=document.querySelector('#planner');
const form=document.querySelector('#expense-form'),day=document.querySelector('#expense-day'),amount=document.querySelector('#expense-amount'),person=document.querySelector('#expense-person'),note=document.querySelector('#expense-note'),list=document.querySelector('#expense-list');
const status=document.querySelector('#sync-status'),retry=document.querySelector('#retry-sync'),importButton=document.querySelector('#import-local');
const currencies=['KRW','EUR','CZK'];
const currency=document.querySelector('#expense-currency'),expenseFilter=document.querySelector('#expense-filter');
const money=(n,c='EUR')=>new Intl.NumberFormat('ko-KR',{style:'currency',currency:c,minimumFractionDigits:c==='KRW'?0:2,maximumFractionDigits:c==='KRW'?0:2}).format(n);
function amountSettings(){amount.step=currency.value==='KRW'?'1':'0.01';amount.min=currency.value==='KRW'?'1':'0.01';amount.max=currency.value==='KRW'?'1000000000':'1000000';amount.placeholder='금액';amount.setCustomValidity('')}
currency.addEventListener('change',amountSettings);amount.addEventListener('input',()=>amount.setCustomValidity(''));
expenseFilter.addEventListener('change',renderExpenses);
let expenses=[],db,api,ready=false,pending=0,failed=false,expenseReady=false,planReady=false,editing=null;
const planDocs=new Map();
function message(text,error=false){status.textContent=text;status.parentElement.dataset.error=String(error)}
function statusUpdate(){if(failed)return;message(!navigator.onLine?'인터넷 연결 끊김 · 다시 연결해 주세요':pending?'공유 저장 중…':ready?'● 실시간 공유 중 · 저장 완료':'공유 기록 불러오는 중…')}
function lock(){document.querySelectorAll('#expense-form input,#expense-form select,#expense-form button,#planner input,#planner textarea,#planner button,#expense-list button,#import-local').forEach(el=>el.disabled=!ready||pending>0||!navigator.onLine)}
function error(err){console.error(err);failed=true;message(err?.message==='conflict'?'다른 사람이 먼저 수정했어요. 최신 일정을 확인하고 다시 입력해 주세요.':'공유 저장에 실패했어요. 입력 내용은 남아 있습니다. 연결 상태를 확인해 주세요.',true);retry.hidden=false}
async function write(action){if(!ready||!navigator.onLine)return;pending++;lock();failed=false;statusUpdate();try{await action();retry.hidden=true}catch(e){error(e);throw e}finally{pending--;lock();statusUpdate()}}
function renderTabs(){tabs.innerHTML=days.map((d,i)=>`<button class="${selected===i+1?'active':''}" data-day="${i+1}">DAY ${i+1}<small>${d.date.replace('11월 ','')}</small></button>`).join('')}function renderDay(){const i=selected-1,d=days[i],s=state[i];planner.innerHTML=`<header class="day-head"><div><div class="day-kicker">DAY ${selected} · ${d.date}</div><h3>${d.title}</h3><p>시간과 장소를 직접 입력해 나만의 확정 일정으로 완성하세요.</p></div><a class="ghost-link" href="posters.html#all-days">전체 일정 ↗</a></header><div class="day-layout"><div><div class="schedule-label"><b>시간별 일정</b><span class="saved">● 함께 보는 일정</span></div><div class="rows">${s.rows.map((r,n)=>`<div class="plan-row" data-row="${n}"><input data-field="time" value="${escape(r.time)}" placeholder="시간"><input data-field="place" value="${escape(r.place)}" placeholder="장소"><textarea data-field="note" placeholder="일정 내용">${escape(r.note)}</textarea><button class="remove" title="일정 삭제" aria-label="일정 삭제">×</button></div>`).join('')}</div><button class="add-row" id="add-row">＋ 일정 추가</button><p class="hint">수정 후 다른 칸을 누르면 공유 저장됩니다. 같은 일정을 동시에 수정하면 먼저 저장된 내용을 확인해 주세요.</p></div><aside class="poster-pane"><img src="city-photos/${selected<=2?'vienna':selected<=5?'salzburg':'prague'}.jpg" alt="여행 지역 풍경"><h4>이번 여행의 숙박</h4><p>빈 11.13–15 · 2박<br>잘츠부르크 인근 11.15–18 · 3박<br>프라하 11.18–21 · 3박</p><p>15일 빈 렌터카 인수<br>18일 린츠 반납 → 기차로 프라하</p><a href="posters.html#reservations">예약 정보 보기 ↗</a></aside></div>`;document.querySelector('#all-posters').href='posters.html#all-days'}

const originalRenderDay=renderDay;
renderDay=function(){originalRenderDay();lock()};
function renderExpenses(){
 const shown=expenses.filter(x=>expenseFilter.value==='pre'?x.day==='pre':expenseFilter.value==='trip'?x.day!=='pre':true);
 const totals={KRW:0,EUR:0,CZK:0};shown.forEach(x=>{const c=x.currency||'EUR';if(currencies.includes(c))totals[c]+=Math.round(x.amount*(c==='KRW'?1:100))});
 document.querySelector('#spent').innerHTML=currencies.map(c=>'<div><small>'+({KRW:'원화',EUR:'유로',CZK:'체코 코루나'}[c])+'</small><strong>'+money(totals[c]/(c==='KRW'?1:100),c)+'</strong></div>').join('');
 document.querySelector('#count').textContent=shown.length+'건';
 list.innerHTML=shown.length?shown.map(x=>`<li><small>${x.day==='pre'?'여행 전':'DAY '+escape(x.day)}</small><small>${escape(x.person||'미지정')}</small><span>${escape(x.note||'기타 지출')}</span><b>${money(x.amount,x.currency||'EUR')}</b><button type="button" data-id="${escape(x.id)}">삭제</button></li>`).join(''):'<li class="empty">이 구분에 기록한 지출이 없어요.</li>';lock()
}

day.innerHTML='<option value="pre">여행 전 지출 · 항공권, 숙소 등</option>'+days.map((d,i)=>`<option value="${i+1}">DAY ${i+1} · ${d.date} · ${d.title}</option>`).join('');
tabs.addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(!b)return;selected=Number(b.dataset.day);localStorage.setItem('central-europe-2026-selected-day',selected);editing=null;renderTabs();renderDay()});
planner.addEventListener('focusin',e=>{if(e.target.matches('input,textarea'))editing={day:selected,revision:state[selected-1].revision,rows:structuredClone(state[selected-1].rows)}});
async function saveDay(n,rows,revision){await write(()=>api.runTransaction(db,async tx=>{const ref=api.doc(db,'trips','europe-2026','days',String(n));const snapshot=await tx.get(ref);if((snapshot.data()?.revision||0)!==revision)throw new Error('conflict');tx.set(ref,{rows,revision:revision+1});}));}
planner.addEventListener('change',async e=>{const row=e.target.closest('.plan-row');if(!row||!editing)return;const draft=editing;draft.rows[Number(row.dataset.row)][e.target.dataset.field]=e.target.value;try{await saveDay(draft.day,draft.rows,draft.revision);editing=null;renderDay()}catch{editing=null;if(failed&&status.textContent.startsWith('다른 사람'))renderDay()}});
planner.addEventListener('click',async e=>{const row=e.target.closest('.plan-row');if(!e.target.closest('#add-row')&&!(row&&e.target.closest('.remove')))return;const n=selected,base=state[n-1],rows=structuredClone(base.rows);if(e.target.closest('#add-row')){if(rows.length>=60){message('하루 일정은 60개까지 추가할 수 있어요.',true);return}rows.push({time:'',place:'',note:''})}else rows.splice(Number(row.dataset.row),1);try{await saveDay(n,rows,base.revision);renderDay()}catch{}});
form.addEventListener('submit',async e=>{e.preventDefault();if(!ready||pending||!navigator.onLine)return;const value=Number(amount.value),c=currency.value,scale=c==='KRW'?1:100;
 if(!currencies.includes(c)||!['pre','1','2','3','4','5','6','7','8','9'].includes(day.value)||!Number.isFinite(value)||value<=0||value>(c==='KRW'?1000000000:1000000)||Math.abs(value*scale-Math.round(value*scale))>0.00001){amount.setCustomValidity(c==='KRW'?'원화는 1원 단위로 입력해 주세요.':'금액은 소수점 둘째 자리까지 입력해 주세요.');amount.reportValidity();return}
 if(!['천가네','문가네'].includes(person.value)||!form.reportValidity())return;
 const selectedDay=day.value,record={day:selectedDay,currency:c,amount:Math.round(value*scale)/scale,person:person.value,note:note.value.trim(),createdAt:Date.now(),deleted:false};
 try{await write(()=>api.setDoc(api.doc(api.collection(db,'trips','europe-2026','expenses')),record));form.reset();day.value=selectedDay;currency.value=c;amountSettings();expenseFilter.value=selectedDay==='pre'?'pre':'trip';renderExpenses()}catch{}});

list.addEventListener('click',async e=>{const b=e.target.closest('[data-id]');if(!b)return;try{await write(()=>api.updateDoc(api.doc(db,'trips','europe-2026','expenses',b.dataset.id),{deleted:true}))}catch{}});
importButton.hidden=!(legacyExpenses.length||Object.keys(legacyPlans).length)||readLocal('central-europe-2026-imported',false);
importButton.addEventListener('click',async()=>{try{await write(async()=>{for(let i=0;i<legacyExpenses.length;i++){const x=legacyExpenses[i];if(!Number.isFinite(x.amount)||x.amount<=0)continue;const record={day:String(x.day),amount:x.amount,person:String(x.person||'미지정').slice(0,30),note:String(x.note||'').slice(0,80),createdAt:i,deleted:false};const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(record)));const id='import-'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');await api.runTransaction(db,async tx=>{const ref=api.doc(db,'trips','europe-2026','expenses',id);if(!(await tx.get(ref)).exists())tx.set(ref,record)})}for(const [n,value]of Object.entries(legacyPlans)){if(!/^[1-9]$/.test(n)||!Array.isArray(value.rows))continue;await api.runTransaction(db,async tx=>{const ref=api.doc(db,'trips','europe-2026','days',n);if(!(await tx.get(ref)).exists())tx.set(ref,{rows:value.rows.slice(0,60),revision:1})})}localStorage.setItem('central-europe-2026-imported','true');importButton.hidden=true});message('기존 기록을 가져왔어요. 이미 공유된 일정은 유지했습니다.')}catch{}});
retry.addEventListener('click',()=>location.reload());
window.addEventListener('offline',()=>{lock();statusUpdate()});window.addEventListener('online',()=>{lock();statusUpdate()});
renderTabs();renderDay();renderExpenses();lock();
try{
const [{initializeApp},firestore]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')]);api=firestore;
db=api.getFirestore(initializeApp(firebaseConfig));
const received=()=>{ready=expenseReady&&planReady;lock();statusUpdate()};
api.onSnapshot(api.collection(db,'trips','europe-2026','expenses'),{includeMetadataChanges:true},snap=>{expenses=snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>!x.deleted).sort((a,b)=>b.createdAt-a.createdAt||a.id.localeCompare(b.id));expenseReady=!snap.metadata.fromCache;renderExpenses();received()},error);
api.onSnapshot(api.collection(db,'trips','europe-2026','days'),{includeMetadataChanges:true},snap=>{snap.docs.forEach(d=>{const n=Number(d.id);if(n>=1&&n<=9){state[n-1]=d.data();planDocs.set(n,true)}});planReady=!snap.metadata.fromCache;if(!planner.contains(document.activeElement))renderDay();received()},error);
}catch(e){error(e)}
