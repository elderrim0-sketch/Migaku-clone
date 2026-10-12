/* Visible per-site opt-in for YouTube and Netflix. Generic sites use existing permission flow. */
(async()=>{
  const button=document.getElementById('km-v22-site-enable'),label=document.getElementById('km-v22-site-title'),hint=document.getElementById('km-v22-site-hint');
  if(!button)return;
  let tab;try{[tab]=await chrome.tabs.query({active:true,currentWindow:true});}catch{}
  let url;try{url=new URL(tab?.url||'');}catch{}
  if(!url||!['https:','http:'].includes(url.protocol)){
    label.textContent='Open a video website';hint.textContent='Then enable Kotoba here';return;
  }
  const host=url.hostname, builtin=/(^|\.)(youtube\.com|netflix\.com)$/i.test(host);
  label.textContent=host;
  const universal=document.getElementById('km-universal-enable');
  async function paint(){
    const store=await chrome.storage.local.get({siteEnabledV3:{},kotobaUniversalSites:{}});
    const allowed=builtin?store.siteEnabledV3?.[host]===true:(store.kotobaUniversalSites?.[host]===true && store.siteEnabledV3?.[host]===true);
    button.disabled=false;button.textContent=allowed?'Disable':'Enable';button.setAttribute('aria-pressed',String(allowed));
    hint.textContent=allowed?'Active on this site':'Disabled by default · click Enable to start';
  }
  button.addEventListener('click',async()=>{
    if(!builtin){
      const store=await chrome.storage.local.get({kotobaUniversalSites:{},siteEnabledV3:{}});
      if(store.kotobaUniversalSites?.[host]===true && store.siteEnabledV3?.[host]!==true){
        await chrome.storage.local.set({siteEnabledV3:{...(store.siteEnabledV3||{}),[host]:true}});
        await paint();return;
      }
      if(universal && !universal.disabled){
        universal.click(); // Existing scoped-permission and safe disable flow.
        hint.textContent=store.kotobaUniversalSites?.[host]===true?'Disabling this site…':'Approve access for this site in Opera';
      }else{
        universal?.scrollIntoView({behavior:'smooth',block:'center'});
        hint.textContent='Use Universal Subtitle Reader below to manage this site';
      }
      return;
    }
    button.disabled=true;
    try{
      const store=await chrome.storage.local.get({siteEnabledV3:{}});
      const existing=store.siteEnabledV3||{};
      await chrome.storage.local.set({siteEnabledV3:{...existing,[host]:existing[host]!==true}});
      await paint();
    }catch(err){hint.textContent='Could not change site: '+String(err?.message||err);button.disabled=false;}
  });
  chrome.storage.onChanged.addListener((c,area)=>{if(area==='local'&&(c.siteEnabledV3||c.kotobaUniversalSites))paint();});
  await paint();
})();
