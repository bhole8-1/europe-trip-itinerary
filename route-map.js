/* Geographic overview of the user's planned journey, not turn-by-turn routing. */
(()=>{
const el=document.querySelector('#journey-map'),message=document.querySelector('#map-message');
if(!window.L){message.textContent='지도를 불러오지 못했어요. 아래 이동 순서 또는 지도 원본 링크를 확인해 주세요.';return}
const L=window.L;
// Mondsee regional marker: official tourism coordinates, not an exact accommodation pin.
const points={mondsee:[47.86,13.35],salzburg:[47.8095,13.055],vienna:[48.2082,16.3738],linz:[48.3069,14.2858],gosau:[47.584,13.534],hallstatt:[47.5622,13.6493],prague:[50.0755,14.4378]};
const legs=[
{points:[points.vienna,points.mondsee],color:'#245b43',label:'15일 12:00 · 빈 중앙역 Hertz 인수 → 몬드제 숙소',dash:null},
{points:[points.mondsee,points.salzburg,points.mondsee,points.gosau,points.hallstatt,points.mondsee],color:'#267a98',label:'16일 몬드제 ↔ 잘츠부르크 · 17일 몬드제 → 고사우 → 할슈타트 → 몬드제 (관광 초안)',dash:null},
{points:[points.mondsee,points.linz],color:'#795c9c',label:'18일 · 몬드제 → 린츠 Hertz 반납 (Wiener Strasse 280) → 중앙역 이동',dash:'9 7'},
{points:[points.linz,points.prague],color:'#b37925',label:'18일 EC 334 · 린츠 중앙역 11:54 → 프라하 중앙역 15:39 · 예약 완료',dash:null}
];
const map=L.map(el,{scrollWheelZoom:false,zoomControl:true});
map.zoomControl.setPosition('topright');
const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
tiles.on('tileerror',()=>{message.textContent='배경 지도 연결이 원활하지 않아요. 이동 지점과 연결선은 계속 표시됩니다.'});
tiles.on('load',()=>{message.textContent='도시를 누르면 방문 날짜를 볼 수 있어요. 확대해서 호수 지역도 살펴보세요.'});
const lines=legs.map(leg=>L.polyline(leg.points,{color:leg.color,weight:4,opacity:.85,dashArray:leg.dash}).addTo(map).bindPopup(leg.label));
const labels=[
{p:points.vienna,number:'1',name:'빈 · 비엔나',detail:'11월 13–15일 · 빈 2박<br>15일 12:00 빈 중앙역 Hertz 인수 → 몬드제',day:1,direction:'right'},
{p:points.linz,number:'3',name:'린츠',detail:'11월 18일 · Hertz Wiener Strasse 280 반납<br>린츠 중앙역 11:54 EC 334 탑승<br>예약상 반납 종료 12:00 · 열차 탑승을 위해 일찍 반납하고 역 이동 필요',day:6,direction:'top'},
{p:points.mondsee,number:'2',name:'몬드제 · 숙박 거점',detail:'11월 15–18일 · 예약한 숙소 3박<br>Herzog Odilo-Straße 84, Mondsee<br>표시는 몬드제 지역의 대략적 위치입니다.',day:3,direction:'top'},
{p:points.salzburg,number:'관광',name:'잘츠부르크',detail:'16일 몬드제 숙소에서 출발 · 주차 후 도보 관광<br>관광 후 몬드제 숙소 복귀',day:4,direction:'left'},
{p:points.hallstatt,number:'2',name:'고사우 · 할슈타트',detail:'11월 17일 · 렌터카로 호수 지역 여행<br>18일 린츠로 돌아가 렌터카 반납',day:5,direction:'bottom'},
{p:points.prague,number:'4',name:'프라하',detail:'11월 18일 EC 334 · 15:39 프라하 중앙역 도착<br>18–21일 3박 · 숙소 예약 전',day:6,direction:'right'}
];
labels.forEach(stop=>L.marker(stop.p,{icon:L.divIcon({className:'journey-pin',html:`<span>${stop.number}</span>`,iconSize:[36,36],iconAnchor:[18,18]}),title:stop.name,alt:stop.name}).addTo(map).bindTooltip(stop.name,{permanent:true,direction:stop.direction,offset:[0,stop.direction==='bottom'?14:0],className:'journey-label'}).bindPopup(`<strong>${stop.name}</strong><p>${stop.detail}</p><a href="planner.html?day=${stop.day}">상세 일정 보기 ↗</a>`));
const gosau=L.circleMarker(points.gosau,{radius:5,color:'#267a98',fillColor:'#fff',fillOpacity:1,weight:2}).bindTooltip('고사우',{direction:'left'}).bindPopup('고사우 · 11월 17일 호수 산책');
map.on('zoomend',()=>{if(map.getZoom()>=9)gosau.addTo(map);else map.removeLayer(gosau)});
const bounds=L.latLngBounds(Object.values(points));
function fit(){map.fitBounds(bounds,{paddingTopLeft:[38,45],paddingBottomRight:[95,55],maxZoom:8})}
fit();
document.querySelectorAll('[data-map-leg]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.mapLeg),leg=legs[index];map.fitBounds(L.latLngBounds(leg.points),{padding:[65,65],maxZoom:9});lines[index].openPopup();document.querySelectorAll('[data-map-leg]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
document.querySelector('#map-reset').addEventListener('click',()=>{map.closePopup();fit();document.querySelectorAll('[data-map-leg]').forEach(b=>b.setAttribute('aria-pressed','false'))});
document.querySelector('#map-lakes').addEventListener('click',()=>{map.fitBounds(L.latLngBounds([points.mondsee,points.salzburg,points.gosau,points.hallstatt]),{padding:[70,70],maxZoom:10})});
if(window.ResizeObserver)new ResizeObserver(()=>map.invalidateSize()).observe(el);
message.textContent='도시를 누르면 방문 날짜를 볼 수 있어요. 확대해서 호수 지역도 살펴보세요.';
})();
