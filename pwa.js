(()=>{
  const display=window.matchMedia('(display-mode: standalone)');
  const isStandalone=()=>display.matches||navigator.standalone===true;
  const banner=document.querySelector('.pwa-banner');
  const dialog=document.querySelector('#pwa-dialog');
  const open=document.querySelector('#pwa-open');
  const nativeInstall=document.querySelector('#pwa-native-install');
  const message=document.querySelector('#pwa-message');
  let installPrompt=null;
  function update(){if(banner)banner.hidden=isStandalone();if(isStandalone()&&dialog?.open)dialog.close()}
  update();
  display.addEventListener?.('change',update);
  if(dialog&&open){
    const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const android=/Android/.test(navigator.userAgent);
    if(ios)document.querySelector('#pwa-ios').open=true;
    else if(android)document.querySelector('#pwa-android').open=true;
    else{document.querySelector('#pwa-ios').open=true;document.querySelector('#pwa-android').open=true}
    open.addEventListener('click',()=>dialog.showModal());
    document.querySelector('#pwa-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
    window.addEventListener('beforeinstallprompt',event=>{
      event.preventDefault();installPrompt=event;nativeInstall.hidden=false;
    });
    nativeInstall.addEventListener('click',async()=>{
      if(!installPrompt)return;
      const prompt=installPrompt;installPrompt=null;nativeInstall.disabled=true;
      try{await prompt.prompt();const result=await prompt.userChoice;message.textContent=result.outcome==='accepted'?'설치 요청을 보냈어요. 설치가 끝나면 홈 화면에서 유럽여행 아이콘을 열어주세요.':'설치를 취소했어요. 아래 방법으로 나중에 추가할 수 있어요.'}
      catch{message.textContent='브라우저 메뉴의 앱 설치 또는 홈 화면에 추가를 이용해 주세요.'}
      finally{nativeInstall.hidden=true;nativeInstall.disabled=false}
    });
    window.addEventListener('appinstalled',()=>{installPrompt=null;nativeInstall.hidden=true;banner.hidden=true;if(dialog.open)dialog.close()});
  }
  if('serviceWorker' in navigator&&window.isSecureContext){
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(error=>console.warn('앱 연결 안내 등록 실패',error));
  }
})();
