/* Optional per-origin permission and universal video-study activation. */
(()=>{
  'use strict';
  const name=document.getElementById('km-universal-domain');
  if(!name)return;
  const btn=document.getElementById('km-universal-enable');
  const refresh=document.getElementById('km-universal-scan');
  const status=document.getElementById('km-universal-status');
  const hint=document.getElementById('km-universal-hint');
  const frameSection=document.getElementById('km-embedded-access');
  const frameList=document.getElementById('km-universal-frame-list');
  const frameButton=document.getElementById('km-universal-frame-enable');
  const frameHint=document.getElementById('km-universal-frame-hint');
  const nativeCaptionToggle=document.getElementById('km-hide-original-captions');
  if(nativeCaptionToggle){
    chrome.storage.local.get({kotobaHideOriginalCaptions:true}).then(settings=>{
      nativeCaptionToggle.checked=settings.kotobaHideOriginalCaptions!==false;
    });
    nativeCaptionToggle.addEventListener('change',()=>chrome.storage.local.set({kotobaHideOriginalCaptions:nativeCaptionToggle.checked}));
    chrome.storage.onChanged.addListener((changes,area)=>{
      if(area==='local'&&changes.kotobaHideOriginalCaptions)nativeCaptionToggle.checked=changes.kotobaHideOriginalCaptions.newValue!==false;
    });
  }
  let tab=null, origin='',host='',enabled=false, busy=false;
  let frameCandidates=[];
  const builtin=h=>/(^|\.)(youtube\.com|netflix\.com)$/i.test(h);
  const scriptId=h=>'kotoba-video-'+h.toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,120);
  const frameScriptId=h=>'kotoba-frame-'+h.toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,120);
  const domain=url=>{try{const u=new URL(url);return ['https:','http:'].includes(u.protocol)?u.hostname:'';}catch{return '';}};
  async function updateFrames(list){
    frameCandidates=list.filter(c=>c&&domain(c.origin) && domain(c.origin)!=='').slice(0,15);
    const was=frameList.value;
    frameList.replaceChildren();
    for(const frame of frameCandidates){
      const o=document.createElement('option');o.value=frame.origin;
      o.textContent=frame.host;frameList.appendChild(o);
    }
    if(frameCandidates.some(f=>f.origin===was))frameList.value=was;
    frameSection.hidden=!enabled||!frameCandidates.length;
    await updateFrameState();
  }
  async function updateFrameState(){
    const frame=frameCandidates.find(f=>f.origin===frameList.value);
    if(!frame){frameButton.disabled=true;return;}
    const saved=await chrome.storage.local.get({kotobaUniversalFrameSites:{}});
    const approved=(saved.kotobaUniversalFrameSites?.[host]||[]).includes(frame.host);
    frameButton.disabled=approved||busy;
    frameButton.textContent=approved?'✓ Embedded player enabled':'Enable captions inside this player';
    frameHint.textContent=approved?'This player is approved. Reload the video page and press Check Japanese subtitles.':`Kotoba will ask Opera to access ${frame.host} specifically. No permission to all sites.`;
  }
  const getBundle=()=>{
    const spec=chrome.runtime.getManifest().content_scripts.find(s=>s.js?.includes('content.js'));
    return {js:spec.js,css:spec.css};
  };
  async function state(){
    const saved=await chrome.storage.local.get({kotobaUniversalSites:{}});
    enabled=saved.kotobaUniversalSites?.[host]===true;
    btn.textContent=enabled?'Disable on this site':'Enable on this site';
    btn.setAttribute('aria-pressed',String(enabled));
    refresh.disabled=!enabled;
    if(!enabled)frameSection.hidden=true;
    return enabled;
  }
  async function scan(){
    if(!enabled||!tab?.id){status.textContent='Enable the site to detect Japanese captions.';return;}
    status.textContent='Checking the current player and embedded frames…';
    try{
      const res=await chrome.scripting.executeScript({target:{tabId:tab.id,frameIds:[0]},func:()=>{
        const videos=[...document.querySelectorAll('video')].sort((a,b)=>{
          const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return y.width*y.height-x.width*x.height;
        });
        const v=videos.find(v=>v.getBoundingClientRect().width>100)||videos[0];
        const tracks=[...(v?.textTracks||[])];
        const jp=tracks.find(t=>/^(ja|jpn)([-_].*)?$/i.test(t.language||'') || /日本語|japanese/i.test(t.label||''));
        const overlay=document.querySelector('#kotoba-root .km-count')?.textContent||'';
        const frames=[...document.querySelectorAll('iframe[src]')].map(el=>{
          const rect=el.getBoundingClientRect();
          let url;try{url=new URL(el.src,location.href);}catch{return null;}
          if(!['http:','https:'].includes(url.protocol)||rect.width<240||rect.height<130)return null;
          return {origin:url.origin,host:url.hostname,size:rect.width*rect.height};
        }).filter(Boolean).sort((a,b)=>b.size-a.size);
        return {state:jp?'html5':/\d+\s+lines?/.test(overlay)&&!/0 lines?/.test(overlay)?'overlay':v?'waiting':'no-video',
          count:jp?.cues?.length||0,loaded:!!document.getElementById('kotoba-root'),frames};
      }});
      const info=res?.[0]?.result||{};
      await updateFrames(info.frames||[]);
      const message={
        'html5':`✓ Japanese HTML5 captions detected${info.count?` · ${info.count} timed lines`:''}`,
        'overlay':'✓ Captions collected from the player',
        'waiting':'No accessible Japanese captions in the main page yet.',
        'no-video':'No HTML5 video in the main page.'
      };
      const embed=frameCandidates.length&&info.state!=='html5'&&info.state!=='overlay';
      status.textContent=(message[info.state]||'Caption scan unavailable.')+
        (embed?' This video may be inside an embedded player — approve its domain below.':'')+
        (info.loaded?'':' Refresh the page if Kotoba is not visible.');
      status.dataset.state=embed?'embedded':info.state||'waiting';
    }catch(error){status.textContent='Unable to inspect this player: '+String(error.message||error);status.dataset.state='error';}
  }
  async function ready(){
    let tabs=[];try{tabs=await chrome.tabs.query({active:true,currentWindow:true});}catch{}
    tab=tabs[0]||null;
    let url;try{url=new URL(tab?.url||'');}catch{}
    if(!url||!['http:','https:'].includes(url.protocol)){
      name.textContent='Open a video website';hint.textContent='This feature works on ordinary http/https pages.';
      btn.disabled=true;refresh.disabled=true;return;
    }
    host=url.hostname;origin=url.protocol+'//'+url.hostname;name.textContent=host;
    if(builtin(host)){
      hint.textContent='Already integrated with Kotoba’s streaming mode.';
      status.textContent='Use the 語 button on the video to open Japanese subtitles.';
      btn.disabled=true;refresh.disabled=true;return;
    }
    btn.disabled=false;
    hint.textContent='Site-specific permission only · supports accessible Japanese captions';
    await state();
    if(enabled){
      await scan();
      // Some third-party players insert their iframe a few seconds after load.
      // Auto-detect it without asking the user to press Check twice.
      if(!frameCandidates.length){
        for(const delay of [800,2000,4000])setTimeout(()=>{
          if(enabled&&!busy&&!frameCandidates.length)scan().catch(()=>{});
        },delay);
      }
    }
  }
  // Permission bubbles may close the Opera/Chrome action popup. Persist the
  // user's click *before* requesting permission. The background service worker
  // completes the activation from permissions.onAdded even if this popup dies.
  const pendingKey=(kind,player='')=>`${kind}|${host}|${player}`;
  async function beginPermission(kind,match,player=''){
    const key=pendingKey(kind,player);
    const previous=await chrome.storage.local.get({kmPendingVideoActivations:{}});
    await chrome.storage.local.set({kmPendingVideoActivations:{
      ...previous.kmPendingVideoActivations,
      [key]:{kind,host,origin,player,match,tabId:tab.id,createdAt:Date.now()}
    }});
    try{
      const granted=await chrome.permissions.request({origins:[match]});
      if(!granted)throw Error('Site permission was not approved.');
      // Also covers previously granted permission (which fires no onAdded event).
      const result=await chrome.runtime.sendMessage({type:'KOTOBA_COMPLETE_PENDING',key});
      if(result?.ok===false)throw Error(result.error||'Activation failed.');
      return result;
    }catch(error){
      // If the popup survives denial, don't leave an activation queued.
      const saved=await chrome.storage.local.get({kmPendingVideoActivations:{}});
      const next={...saved.kmPendingVideoActivations};delete next[key];
      await chrome.storage.local.set({kmPendingVideoActivations:next});
      throw error;
    }
  }
  frameList.addEventListener('change',()=>updateFrameState());
  frameButton.addEventListener('click',async()=>{
    if(busy||!tab?.id||!enabled)return;
    const frame=frameCandidates.find(f=>f.origin===frameList.value);if(!frame)return;
    busy=true;frameButton.disabled=true;
    status.textContent=`Allowing captions from ${frame.host}…`;
    try{
      await beginPermission('frame',frame.origin+'/*',frame.host);
      status.textContent=`✓ ${frame.host} enabled. Refreshing the player automatically…`;
      await updateFrameState();
    }catch(error){status.textContent='Embedded player access failed: '+String(error.message||error);}
    finally{busy=false;await updateFrameState();}
  });
  btn.addEventListener('click',async()=>{
    if(busy||!host||!tab?.id)return;
    busy=true;btn.disabled=true;
    const desired=!enabled;
    status.textContent=desired?'Allowing Kotoba on this website…':'Disabling Kotoba on this website…';
    const match=origin+'/*',id=scriptId(host);
    try{
      if(desired){
        await beginPermission('site',match);
      } else {
        try{await chrome.scripting.unregisterContentScripts({ids:[id]});}catch{}
        const settings=await chrome.storage.local.get({kotobaUniversalSites:{},siteEnabledV3:{},kotobaReaderSites:{},kotobaUniversalFrameSites:{}});
        const approvedFrames=(settings.kotobaUniversalFrameSites||{})[host]||[];
        const nextFrames={...(settings.kotobaUniversalFrameSites||{})};delete nextFrames[host];
        await chrome.storage.local.set({
          kotobaUniversalSites:{...(settings.kotobaUniversalSites||{}),[host]:false},
          siteEnabledV3:{...(settings.siteEnabledV3||{}),[host]:false},
          kotobaUniversalFrameSites:nextFrames
        });
        for(const playerHost of approvedFrames){
          if(Object.values(nextFrames).some(domains=>domains.includes(playerHost)))continue;
          try{await chrome.scripting.unregisterContentScripts({ids:[frameScriptId(playerHost)]});}catch{}
          if(playerHost!==host && settings.kotobaReaderSites?.[playerHost]!==true){
            const scheme=frameCandidates.find(f=>f.host===playerHost)?.origin?.split('://')[0]||'https';
            try{await chrome.permissions.remove({origins:[scheme+'://'+playerHost+'/*']});}catch{}
          }
        }
        if(settings.kotobaReaderSites?.[host]!==true){
          try{await chrome.permissions.remove({origins:[match]});}catch{}
        }
      }
      await state();
      if(desired)await scan();else status.textContent='Kotoba disabled for this site. Refresh to clear its overlay.';
    }catch(error){status.textContent='Could not update site access: '+String(error.message||error);}
    finally{busy=false;btn.disabled=false;}
  });
  refresh.addEventListener('click',scan);
  document.getElementById('km-universal-demo').addEventListener('click',()=>chrome.tabs.create({url:chrome.runtime.getURL('universal-demo.html')}));
  ready();
})();
