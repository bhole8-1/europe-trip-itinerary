(()=>{
 const dock=document.querySelector('.mobile-dock');if(!dock)return;
 const links=[...dock.querySelectorAll('a')],planner=location.pathname.endsWith('planner.html');
 const targets=planner?[['planner','schedule'],['expenses','expenses']]:[['home','home'],['map-title','map'],['all-days','schedule'],['reservations','reservations']];
 function active(key){links.forEach(a=>{if(a.dataset.nav===key)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
 let queued=false;function update(){queued=false;let key=planner?'schedule':'home';for(const [id,k] of targets){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=innerHeight*.42)key=k}active(key)}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);addEventListener('hashchange',update);update();
})();
