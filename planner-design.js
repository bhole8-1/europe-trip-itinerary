// Keep the selected day visible without moving the page vertically.
const dayRail=document.querySelector('#day-tabs');
function revealSelectedDay(){const active=dayRail?.querySelector('.active');if(active)dayRail.scrollLeft=Math.max(0,active.offsetLeft-dayRail.offsetLeft-dayRail.clientWidth/2+active.clientWidth/2)}
if(dayRail){new MutationObserver(revealSelectedDay).observe(dayRail,{childList:true});window.addEventListener('resize',revealSelectedDay);revealSelectedDay()}
