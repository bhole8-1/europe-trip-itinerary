/* Geographic overview of the user's planned journey, not turn-by-turn routing. */
(()=>{
const el=document.querySelector('#journey-map'),message=document.querySelector('#map-message');
if(!window.L){message.textContent='지도를 불러오지 못했어요. 아래 이동 순서 또는 지도 원본 링크를 확인해 주세요.';return}
const L=window.L;
const points={vienna:[48.2082,16.3738],linz:[48.3069,14.2858],gosau:[47.584,13.534],hallstatt:[47.5622,13.6493],prague:[50.0755,14.4378]};
const legs=[
{points:[points.vienna,points.linz],color:'#245b43',label:'16일 · 기차',dash:null},
{points:[points.linz,points.gosau,points.hallstatt],color:'#267a98',label:'16–17일 · 렌터카',dash:null},
{points:[points.hallstatt,points.vienna],color:'#795c9c',label:'18일 · 렌터카 반납 후 기차 (반납 위치 미정)',dash:'9 7'},
{points:[points.vienna,points.prague],color:'#b37925',label:'비엔나 → 프라하 · 이동 날짜·교통편 미정',dash:'3 10'}
];
const map=L.map(el,{scrollWheelZoom:false,zoomControl:true});
map.zoomControl.setPosition('topright');
const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
tiles.on('tileerror',()=>{message.textContent='배경 지도 연결이 원활하지 않아요. 이동 지점과 연결선은 계속 표시됩니다.'});
tiles.on('load',()=>{message.textContent='도시를 누르면 방문 날짜를 볼 수 있어요. 확대해서 호수 지역도 살펴보세요.'});
const lines=legs.map(leg=>L.polyline(leg.points,{color:leg.color,weight:4,opacity:.85,dashArray:leg.dash}).addTo(map).bindPopup(leg.label));
const labels=[
{p:points.vienna,number:'1 · 4',name:'빈 · 비엔나',detail:'11월 13–15일 도시 여행<br>16일 기차로 린츠 이동<br>18일 렌터카 반납 후 기차로 복귀',day:1,direction:'right'},
{p:points.linz,number:'2',name:'린츠',detail:'11월 16일 · 기차 도착 후 렌터카 인수<br>인수 업체·장소·시간 미정',day:4,direction:'top'},
{p:points.hallstatt,number:'3',name:'고사우 · 할슈타트',detail:'11월 16–17일 · 렌터카로 호수 지역 여행<br>18일 반납 위치와 출발역은 미정',day:5,direction:'bottom'},
{p:points.prague,number:'5',name:'프라하',detail:'11월 19–21일 · 기존 프라하 일정<br>비엔나에서 넘어오는 교통편·날짜 미정',day:7,direction:'right'}
];
labels.forEach(stop=>L.marker(stop.p,{icon:L.divIcon({className:'journey-pin',html:`<span>${stop.number}</span>`,iconSize:[36,36],iconAnchor:[18,18]}),title:stop.name,alt:stop.name}).addTo(map).bindTooltip(stop.name,{permanent:true,direction:stop.direction,offset:[0,stop.direction==='bottom'?14:0],className:'journey-label'}).bindPopup(`<strong>${stop.name}</strong><p>${stop.detail}</p><a href="planner.html?day=${stop.day}">상세 일정 보기 ↗</a>`));
const gosau=L.circleMarker(points.gosau,{radius:5,color:'#267a98',fillColor:'#fff',fillOpacity:1,weight:2}).bindTooltip('고사우',{direction:'left'}).bindPopup('고사우 · 11월 17일 호수 산책');
map.on('zoomend',()=>{if(map.getZoom()>=9)gosau.addTo(map);else map.removeLayer(gosau)});
const bounds=L.latLngBounds(Object.values(points));
function fit(){map.fitBounds(bounds,{paddingTopLeft:[38,45],paddingBottomRight:[95,55],maxZoom:8})}
fit();
document.querySelectorAll('[data-map-leg]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.mapLeg),leg=legs[index];map.fitBounds(L.latLngBounds(leg.points),{padding:[65,65],maxZoom:9});lines[index].openPopup();document.querySelectorAll('[data-map-leg]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
document.querySelector('#map-reset').addEventListener('click',()=>{map.closePopup();fit();document.querySelectorAll('[data-map-leg]').forEach(b=>b.setAttribute('aria-pressed','false'))});
document.querySelector('#map-lakes').addEventListener('click',()=>{map.fitBounds(L.latLngBounds([points.gosau,points.hallstatt]),{padding:[70,70],maxZoom:11})});
if(window.ResizeObserver)new ResizeObserver(()=>map.invalidateSize()).observe(el);
message.textContent='도시를 누르면 방문 날짜를 볼 수 있어요. 확대해서 호수 지역도 살펴보세요.';
})();
