/* Origin-scoped website reader permission and settings. Chrome MV3. */
(()=>{
  const label=document.getElementById('km-reader-site-name');if(!label)return;
  const hint=document.getElementById('km-reader-site-hint');
  const button=document.getElementById('km-reader-site-button');
  const notice=document.getElementById('km-reader-notice');
  const auto=document.getElementById('km-reader-auto-translate');
  const speak=document.getElementById('km-reader-auto-speak');
  let currentTab=null,siteOrigin='',hostname='',isWiki=false,approved=false;
  const message=text=>{notice.textContent=String(text).slice(0,300);};
  const scriptId=host=>'kotoba-reader-'+host.toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,120);
  const canRead=u=>['http:','https:'].includes(u.protocol);
  const isStreaming=host=>/(^|\.)(youtube\.com|netflix\.com)$/i.test(host);
  async function view(){
    const {kotobaReaderSites={}}=await chrome.storage.local.get({kotobaReaderSites:{}});
    approved=kotobaReaderSites[hostname]===undefined?isWiki:!!kotobaReaderSites[hostname];
    button.textContent=approved?'Disable':'Enable';
    hint.textContent=isWiki?'Available automatically on Wikipedia / Wiktionary':'Requires permission for this website only';
  }
  async function ready(){
    const config=await chrome.storage.local.get({kotobaReaderAutoTranslate:false,kotobaReaderAutoSpeak:false});
    speak.checked=!!config.kotobaReaderAutoSpeak;
    auto.checked=!!config.kotobaReaderAutoTranslate;
    let tabs=[];try{tabs=await chrome.tabs.query({active:true,currentWindow:true});}catch{}
    const tab=tabs[0];currentTab=tab;
    let url;try{url=new URL(tab?.url||'');}catch{}
    if(!url||!canRead(url)||isStreaming(url.hostname)){
      label.textContent='Open a webpage to use Reader';
      hint.textContent='YouTube and Netflix use Kotoba immersion mode.';
      button.disabled=true;return;
    }
    hostname=url.hostname;siteOrigin=url.origin;
    isWiki=/(^|\.)(wikipedia|wiktionary)\.org$/i.test(hostname);
    label.textContent=hostname;
    button.disabled=false;
    await view();
  }
  speak.addEventListener('change',()=>chrome.storage.local.set({kotobaReaderAutoSpeak:speak.checked}));
  auto.addEventListener('change',async()=>{
    await chrome.storage.local.set({kotobaReaderAutoTranslate:auto.checked,sentenceTranslation:auto.checked?true:(await chrome.storage.local.get({sentenceTranslation:false})).sentenceTranslation});
    const general=document.getElementById('translation');if(general&&auto.checked)general.checked=true;
    message(auto.checked?'Heading translation enabled. Hovered Japanese titles may be sent to MyMemory.':'Automatic article translation is off. Dictionary lookups still work.');
  });
  button.addEventListener('click',async()=>{
    if(!currentTab||!siteOrigin)return;
    const desired=!approved;
    button.disabled=true;message(desired?'Checking permission for '+hostname+'…':'Disabling reader…');
    try{
      const id=scriptId(hostname);
      if(!isWiki){
        const origin=siteOrigin+'/*';
        if(desired){
          const granted=await chrome.permissions.request({origins:[origin]});
          if(!granted)throw Error('Permission not granted.');
          const exists=await chrome.scripting.getRegisteredContentScripts({ids:[id]});
          if(!exists.length)await chrome.scripting.registerContentScripts([{id,matches:[origin],js:['word-parser.js','shortcuts.js','lookup-hover.js','reader.js'],css:['reader.css','reader-theme-v21.css'],runAt:'document_idle',persistAcrossSessions:true}]);
          await chrome.scripting.insertCSS({target:{tabId:currentTab.id},files:['reader.css','reader-theme-v21.css']});
          await chrome.scripting.executeScript({target:{tabId:currentTab.id},files:['word-parser.js','shortcuts.js','lookup-hover.js','reader.js']});
        }else{
          try{await chrome.scripting.unregisterContentScripts({ids:[id]});}catch{}
          const universal=await chrome.storage.local.get({kotobaUniversalSites:{}});
          if(universal.kotobaUniversalSites?.[hostname]!==true)await chrome.permissions.remove({origins:[origin]});
        }
      }
      const settings=await chrome.storage.local.get({kotobaReaderSites:{}});
      const sites={...(settings.kotobaReaderSites||{}),[hostname]:desired};
      await chrome.storage.local.set({kotobaReaderSites:sites});
      approved=desired;await view();
      message(desired?'✓ Reader enabled on '+hostname+'. Hold your lookup key and hover Japanese words.':'Reader disabled for '+hostname+'.');
    }catch(e){message('Could not change Reader access: '+(e.message||e));}
    finally{button.disabled=false;}
  });
  document.getElementById('km-reader-demo').addEventListener('click',()=>chrome.tabs.create({url:chrome.runtime.getURL('reader-demo.html')}));
  ready();
})();
