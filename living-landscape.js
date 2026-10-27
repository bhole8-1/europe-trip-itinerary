(()=>{
 const scene=document.querySelector('#home'),button=document.querySelector('#scene-motion');if(!scene||!button)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let choice=null;
 try{choice=localStorage.getItem('europe-landscape-motion')}catch{}
 function stopped(){return choice==='pause'||(reduced.matches&&choice!=='play')}
 function update(){const paused=stopped();scene.classList.toggle('scene-paused',paused);scene.classList.toggle('scene-opt-in',choice==='play');scene.classList.toggle('scene-resting',document.hidden||(document.body.dataset.screen&&document.body.dataset.screen!=='home'));button.textContent=paused?'▶':'Ⅱ';button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'풍경 움직임 재생':'풍경 움직임 멈추기');button.title=paused&&reduced.matches?'동작 줄이기 적용 중 · 누르면 이 풍경만 재생':button.getAttribute('aria-label');}
 button.addEventListener('click',()=>{choice=stopped()?'play':'pause';try{localStorage.setItem('europe-landscape-motion',choice)}catch{}update()});
 reduced.addEventListener('change',()=>{choice=null;try{localStorage.removeItem('europe-landscape-motion')}catch{}update()});document.addEventListener('visibilitychange',update);window.addEventListener('travel-screen',update);update();
})();
