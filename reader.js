/* Kotoba Reader v1.10.1 — Japanese article/headline hover on Wikimedia or user-approved sites.
   The page text stays on the page. Only clicked/opted-in external lookup requests
   are made; no scraping, crawling, or automatic translation without permission. */
(()=>{
  'use strict';
  if (globalThis.__kotobaReaderLoaded) return;
  globalThis.__kotobaReaderLoaded=true;
  const JP=/[\u3040-\u30ff\u3400-\u9fff]/u;
  const IS_WIKI=/(^|\.)(wikipedia|wiktionary)\.org$/i.test(location.hostname);
  const DEMO=document.documentElement.dataset.kotobaReaderDemo==='true';
  const parser=globalThis.KMWordParser;
  if(!parser)return;
  const $=(selector,root=document)=>root.querySelector(selector);
  let enabled=false,autoTranslate=false,autoSpeak=false,theme='cotton-candy',selected=null,hovered=null;
  const LookupHover=globalThis.KMLookupHover;
  let lookupHoverMode='alt';
  let hoverTimer=0,hideTimer=0,speakTimer=0,lookupCounter=0,currentLookup=null;
  let audioNonce=0,activeAudio=null,activeAudioUrl=null;
  let currentView='word',pinned=false,loadedSettings=false;
  let statuses={},knownWords=new Set(),ankiKnown=new Set(),ankiLearning=new Set(),hotkeys=globalThis.KMShortcuts?.validate({})||{};
  const covered=new Set(), translated=new Map();
  const UI=document.createElement('div');
  UI.id='km-reader-root';UI.dataset.theme=theme;
  UI.innerHTML=`
  <button class="kmr-launcher" type="button" title="Kotoba website reader" aria-label="Open Kotoba Reader controls">語</button>
  <div class="kmr-menu" hidden>
   <div class="kmr-menu-title"><strong>Kotoba Reader</strong><button class="kmr-close-menu" aria-label="Close">×</button></div>
   <div class="kmr-menu-host"></div>
   <button type="button" class="kmr-toggle">Reader <span>On</span></button>
   <button type="button" class="kmr-auto-speak" aria-pressed="false">♫ Speak on hover <span>Off</span></button>
   <button type="button" class="kmr-setting">⚙ Full settings</button>
   <div class="kmr-help">Hold your lookup modifier over Japanese words. Click a word to pin the dictionary.</div>
  </div>
  <section class="kmr-card" role="dialog" aria-label="Kotoba word dictionary" hidden>
    <div class="kmr-card-top"><div><div class="kmr-eyebrow">KOTOBA · WEBSITE READER</div><div class="kmr-title-row"><strong class="kmr-term"></strong><button type="button" class="kmr-audio" title="Hear Japanese pronunciation" aria-label="Speak word">▶</button></div><div class="kmr-reading"></div></div><button type="button" class="kmr-close" aria-label="Close dictionary">×</button></div>
    <div class="kmr-card-tabs" role="tablist"><button type="button" class="kmr-tab is-selected" data-tab="word" role="tab">Word</button><button type="button" class="kmr-tab" data-tab="sentence" role="tab">Sentence / title</button></div>
    <div class="kmr-pane kmr-word-pane"><div class="kmr-label">Most common meaning</div><div class="kmr-primary">Looking up…</div><div class="kmr-label kmr-other-label">Other meanings</div><div class="kmr-other"></div><div class="kmr-meta"></div></div>
    <div class="kmr-pane kmr-sentence-pane" hidden><div class="kmr-label">Text from this page</div><p class="kmr-context"></p><div class="kmr-label">English translation</div><div class="kmr-translation">Click Translate to translate this line.</div><button type="button" class="kmr-translate">✦ Translate this line</button><div class="kmr-privacy">The line is sent to MyMemory only when translation is enabled in settings.</div></div>
    <div class="kmr-card-actions"><button type="button" class="kmr-save">✦ Save to Anki</button><button type="button" class="kmr-dict">↗ Jisho</button><button type="button" class="kmr-pin" title="Keep popup open">Pin</button></div>
    <div class="kmr-feedback" role="status" aria-live="polite"></div>
  </section>`;
  document.documentElement.append(UI);
  const card=$('.kmr-card',UI),launcher=$('.kmr-launcher',UI),menu=$('.kmr-menu',UI);
  $('.kmr-menu-host',UI).textContent=location.hostname||'Demo';
  function showMessage(msg){$('.kmr-feedback',UI).textContent=String(msg||'').slice(0,250);}
  function syncSpeakToggle(){const b=$('.kmr-auto-speak',UI);b.setAttribute('aria-pressed',String(autoSpeak));b.querySelector('span').textContent=autoSpeak?'On':'Off';}
  function showMenu(){menu.hidden=!menu.hidden;$('.kmr-toggle span',UI).textContent=enabled?'On':'Off';syncSpeakToggle();}
  launcher.addEventListener('click',showMenu);
  $('.kmr-close-menu',UI).addEventListener('click',()=>{menu.hidden=true;});
  $('.kmr-setting',UI).addEventListener('click',async()=>{const result=await chrome.runtime.sendMessage({type:'OPEN_SETTINGS'});if(!result?.ok)showMessage(result?.error||'Could not open settings.');});
  $('.kmr-toggle',UI).addEventListener('click',async()=>{
    const sites=(await chrome.storage.local.get({kotobaReaderSites:{}})).kotobaReaderSites||{};
    sites[location.hostname]=!enabled;
    await chrome.storage.local.set({kotobaReaderSites:sites});
    if(enabled)stop();else start();menu.hidden=true;
  });
  $('.kmr-auto-speak',UI).addEventListener('click',async()=>{autoSpeak=!autoSpeak;syncSpeakToggle();clearTimeout(speakTimer);await chrome.storage.local.set({kotobaReaderAutoSpeak:autoSpeak});});
  function clearTimers(){clearTimeout(hideTimer);clearTimeout(hoverTimer);clearTimeout(speakTimer);}
  function closeCard(){clearTimers();card.hidden=true;selected=null;hovered=null;pinned=false;currentLookup=null;audioNonce++;releaseAudio();}
  function scheduleHide(){clearTimeout(hideTimer);if(!pinned)hideTimer=setTimeout(()=>{if(!hovered&&!card.matches(':hover'))closeCard();},440);}
  $('.kmr-close',UI).addEventListener('click',closeCard);
  $('.kmr-pin',UI).addEventListener('click',()=>{pinned=!pinned;$('.kmr-pin',UI).textContent=pinned?'Unpin':'Pin';});
  card.addEventListener('pointerenter',()=>{clearTimeout(hideTimer);});
  card.addEventListener('pointerleave',scheduleHide);
  UI.addEventListener('pointerover',e=>{if(e.target.closest('.kmr-card'))clearTimeout(hideTimer);});
  function setView(view){
    currentView=view==='sentence'?'sentence':'word';
    $('.kmr-word-pane',UI).hidden=currentView!=='word';
    $('.kmr-sentence-pane',UI).hidden=currentView!=='sentence';
    UI.querySelectorAll('.kmr-tab').forEach(b=>{const active=b.dataset.tab===currentView;b.classList.toggle('is-selected',active);b.setAttribute('aria-selected',String(active));});
  }
  UI.querySelectorAll('.kmr-tab').forEach(b=>b.addEventListener('click',()=>{setView(b.dataset.tab);pinned=true;$('.kmr-pin',UI).textContent='Unpin';}));
  function releaseAudio(){
    if(activeAudio){try{activeAudio.pause();}catch{}activeAudio=null;}
    if(activeAudioUrl){URL.revokeObjectURL(activeAudioUrl);activeAudioUrl=null;}
  }
  // Native extension TTS is preferred; if unavailable, an optional locally running
  // VOICEVOX engine can provide an actual WAV file. No cloud speech service is used.
  async function speakWord(item,{quiet=false}={}){
    if(!item?.word)return;
    const nonce=++audioNonce,button=$('.kmr-audio',UI);
    const word=item.reading||item.word;
    releaseAudio();button.classList.add('is-speaking');button.textContent='♫';
    if(!quiet)showMessage('Starting Japanese pronunciation…');
    try{
      const res=await chrome.runtime.sendMessage({type:'SPEAK_JA',word});
      if(nonce!==audioNonce)return;
      if(res?.ok){if(!quiet)showMessage('▶ Japanese voice started');return;}
      const nativeError=res?.error||'Japanese voice unavailable';
      const wav=await chrome.runtime.sendMessage({type:'WORD_TTS',word});
      if(nonce!==audioNonce)return;
      if(!wav?.ok||!wav.audio?.data)throw Error(nativeError+(wav?.error?' · VOICEVOX: '+wav.error:''));
      const bytes=Uint8Array.from(atob(wav.audio.data),c=>c.charCodeAt(0));
      activeAudioUrl=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));
      activeAudio=new Audio(activeAudioUrl);
      activeAudio.addEventListener('ended',()=>{if(nonce===audioNonce){releaseAudio();button.classList.remove('is-speaking');button.textContent='▶';}},{once:true});
      await activeAudio.play();
      if(nonce!==audioNonce)return;
      if(!quiet)showMessage('▶ Playing locally generated Japanese audio');
    }catch(e){if(nonce===audioNonce)showMessage('Audio unavailable: '+(e?.message||'Check the Japanese voice settings.'));}
    finally{if(nonce===audioNonce){button.classList.remove('is-speaking');button.textContent='▶';}}
  }
  $('.kmr-audio',UI).addEventListener('click',()=>{if(selected)speakWord({...selected,reading:currentLookup?.reading||selected.reading});});
  $('.kmr-dict',UI).addEventListener('click',()=>{if(selected)window.open('https://jisho.org/search/'+encodeURIComponent(selected.word),'_blank','noopener');});
  $('.kmr-translate',UI).addEventListener('click',async()=>{
    if(!selected)return;
    if(!autoTranslate){showMessage('Enable “Translate article text” in Kotoba settings first.');return;}
    await translateSelected(selected);
  });
  $('.kmr-save',UI).addEventListener('click',()=>saveCard());
  function contextFor(token){
    const block=token.closest('h1,h2,h3,h4,h5,h6,p,blockquote,figcaption,li,dd,dt,td,th')||token.parentElement;
    const raw=(block?.textContent||'').replace(/\s+/gu,' ').trim();
    const cleaned=raw.slice(0,500);
    if(/^H[1-6]$/.test(block?.tagName||''))return cleaned.slice(0,180);
    const sentences=cleaned.match(/[^。！？!?\n]+[。！？!?]?/gu)||[cleaned];
    return (sentences.find(s=>s.includes(token.dataset.word))||cleaned).trim().slice(0,180);
  }
  function chooseToken(token){return {word:token.dataset.word||token.textContent,lemma:token.dataset.lemma||'',reading:token.dataset.reading||'',context:contextFor(token),el:token};}
  function placePopup(token){
    const rect=token.getBoundingClientRect();
    card.hidden=false;
    const w=Math.min(card.offsetWidth||338,innerWidth-20),h=card.offsetHeight||350;
    let x=Math.min(Math.max(10,rect.left),Math.max(10,innerWidth-w-10));
    let y=rect.bottom+12;
    if(y+h>innerHeight-10)y=Math.max(10,rect.top-h-12);
    if(y+h>innerHeight-8)y=Math.max(8,innerHeight-h-8);
    card.style.left=x+'px';card.style.top=y+'px';
  }
  async function lookupWord(item){
    const id=++lookupCounter;
    $('.kmr-primary',UI).textContent='Looking up…';$('.kmr-other',UI).replaceChildren();$('.kmr-meta',UI).textContent='';
    try{
      const response=await chrome.runtime.sendMessage({type:'LOOKUP',query:item.word,lemma:item.lemma});
      if(id!==lookupCounter||!selected||selected.word!==item.word)return;
      if(!response?.ok)throw Error(response?.error||'Lookup failed');
      const entry=response.results?.[0];
      currentLookup=entry||null;
      if(!entry){$('.kmr-primary',UI).textContent='No matching dictionary entry found.';return;}
      $('.kmr-primary',UI).textContent=entry.meanings?.[0]||'Meaning unavailable';
      $('.kmr-reading',UI).textContent=entry.reading||item.reading||'';
      const meanings=(entry.meanings||[]).slice(1,7);
      $('.kmr-other',UI).replaceChildren(...meanings.map(m=>{const d=document.createElement('div');d.textContent='• '+m;return d;}));
      $('.kmr-other-label',UI).hidden=!meanings.length;
      $('.kmr-meta',UI).textContent=[entry.common?'Common word':'',entry.pos?.slice(0,2).join(' / ')||'',entry.jlpt||''].filter(Boolean).join(' · ');
    }catch(e){if(id===lookupCounter)$('.kmr-primary',UI).textContent=e.message||'Dictionary unavailable';}
  }
  async function translateSelected(item){
    if(!item?.context)return;
    const key=item.context;
    const field=$('.kmr-translation',UI);
    if(translated.has(key)){field.textContent=translated.get(key);return;}
    field.textContent='Translating…';
    try{const res=await chrome.runtime.sendMessage({type:'TRANSLATE',sentence:key.slice(0,200)});
      if(!res?.ok)throw Error(res?.error||'Translation unavailable');
      const text=String(res.text||'');translated.set(key,text);
      if(selected?.context===key)field.textContent=text;
    }catch(e){if(selected?.context===key)field.textContent=e.message||'Translation unavailable';}
  }
  function openWord(token,forcePin=false){
    if(!enabled)return;
    const item=chooseToken(token);if(pinned&&!forcePin&&selected?.el!==token)return;
    selected=item;hovered=token;currentLookup=null;
    $('.kmr-term',UI).textContent=item.word;
    $('.kmr-reading',UI).textContent=item.reading;
    $('.kmr-context',UI).textContent=item.context;
    $('.kmr-translation',UI).textContent=translated.get(item.context)||(autoTranslate?'Translation loading…':'Translate this line when needed.');
    $('.kmr-pin',UI).textContent=forcePin?'Unpin':'Pin';
    if(forcePin)pinned=true;
    showMessage('');setView('word');placePopup(token);
    lookupWord(item);
    // Wait for a deliberate hover, not a passing cursor, before speaking.
    if(autoSpeak && !forcePin){clearTimeout(speakTimer);speakTimer=setTimeout(()=>{if(selected?.el===token && hovered===token && !card.hidden)speakWord(selected,{quiet:true});},520);}
    if(autoTranslate&&item.context&&/^(H[1-6])$/.test(token.closest('h1,h2,h3,h4,h5,h6')?.tagName||''))translateSelected(item);
  }
  function mayReadNode(node){
    const parent=node.parentElement;
    if(!parent||!JP.test(node.nodeValue||''))return false;
    if(parent.closest('#km-reader-root,.kmr-word,script,style,noscript,textarea,input,button,select,option,pre,code,kbd,samp,svg,math,rt,rp,iframe,[contenteditable],nav,header,footer,.mw-editsection,.mw-cite-backlink,.reference,.noprint'))return false;
    if(parent.closest('[aria-hidden="true"],[hidden]'))return false;
    return Boolean(node.nodeValue?.trim());
  }
  function candidates(){
    const article=document.querySelector('#mw-content-text, .mw-parser-output, #bodyContent, main, article, [role="main"]')||document.body;
    const blocks=new Set();
    for(const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6,figcaption'))blocks.add(h);
    for(const el of article.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,dt,dd,blockquote,figcaption,td,th'))blocks.add(el);
    return [...blocks].slice(0,850);
  }
  function vocabularyState(word,lemma=''){
    for(const key of [word,lemma].filter(Boolean))if(['unknown','track','learning','known','ignore'].includes(statuses[key]))return statuses[key];
    if([word,lemma].some(x=>knownWords.has(x)||ankiKnown.has(x)))return 'known';
    if([word,lemma].some(x=>ankiLearning.has(x)))return 'track';
    return 'unknown';
  }
  function refreshTokenStatuses(){document.querySelectorAll('.kmr-word').forEach(el=>{el.dataset.learning=vocabularyState(el.dataset.word,el.dataset.lemma);});}
  function markNode(node){
    if(!mayReadNode(node))return;
    const text=node.nodeValue||'';
    if(text.length>1200)return;
    const tokens=parser.tokenize(text);if(!tokens.some(t=>t.word&&JP.test(t.surface||t.segment)))return;
    const fragment=document.createDocumentFragment();let marked=0;
    for(const token of tokens){
      if(!token.word||!JP.test(token.surface||token.segment))fragment.append(document.createTextNode(token.segment));
      else{
        const el=document.createElement('span');el.className='kmr-word';el.textContent=token.segment;
        el.dataset.word=(token.surface||token.segment).slice(0,80);
        if(token.reading)el.dataset.reading=token.reading;
        if(token.lemma&&token.lemma!==el.dataset.word)el.dataset.lemma=token.lemma;
        el.dataset.learning=vocabularyState(el.dataset.word,el.dataset.lemma);
        el.tabIndex=0;
        fragment.append(el);marked++;
      }
    }
    if(marked){node.replaceWith(fragment);}
  }
  let processing=false;
  function scan(){
    if(!enabled||processing)return;processing=true;
    try{
      let count=0;
      const seen=new Set();
      for(const block of candidates()){
        if(block.closest('#km-reader-root'))continue;
        const walker=document.createTreeWalker(block,NodeFilter.SHOW_TEXT);
        const todo=[];let node;
        while((node=walker.nextNode())&&count<5000){
          if(seen.has(node))continue;seen.add(node);
          if(mayReadNode(node)){todo.push(node);count++;}
        }
        todo.forEach(markNode);
        if(count>=5000)break;
      }
    }finally{processing=false;}
  }
  function clearMarkups(){
    document.querySelectorAll('.kmr-word').forEach(span=>span.replaceWith(document.createTextNode(span.textContent||'')));
    covered.clear();
  }
  let rescanTimer=0;
  const observer=new MutationObserver(records=>{
    if(!enabled)return;
    const addedArticle=records.some(record=>[...record.addedNodes].some(node=>
      node.nodeType===1 && !node.matches?.('#km-reader-root,.kmr-word') &&
      !node.closest?.('#km-reader-root') && JP.test((node.textContent||'').slice(0,280))
    ));
    if(addedArticle){clearTimeout(rescanTimer);rescanTimer=setTimeout(scan,550);}
  });
  observer.observe(document.body,{childList:true,subtree:true});
  function start(){enabled=true;launcher.hidden=false;launcher.classList.remove('is-disabled');clearTimeout(hideTimer);scan();}
  function stop(){enabled=false;launcher.classList.add('is-disabled');closeCard();clearMarkups();}
  function overHandler(e){
    const token=e.target?.closest?.('.kmr-word');
    if(!token||!enabled)return;
    if(hovered===token)return;
    hovered=token;clearTimers();
    if(LookupHover.matches(lookupHoverMode,e)){
      hoverTimer=setTimeout(()=>{if(hovered===token)openWord(token);},175);
    }
  }
  function outHandler(e){
    const token=e.target?.closest?.('.kmr-word');
    if(!token||!enabled)return;
    if(e.relatedTarget&&token.contains(e.relatedTarget))return;
    hovered=null;clearTimeout(hoverTimer);clearTimeout(speakTimer);scheduleHide();
  }
  document.addEventListener('pointerover',overHandler);
  document.addEventListener('pointerout',outHandler);
  // Modifier press AFTER the cursor is already over a word also opens the lookup.
  // The delay prevents Alt+Shift status shortcuts from launching an accidental popup.
  document.addEventListener('keydown',event=>{
    if(!enabled)return;
    if(!LookupHover.isModifierKey(event)){
      clearTimeout(hoverTimer);
      return;
    }
    if(event.repeat || event.isComposing || event.target?.isContentEditable ||
       /^(INPUT|TEXTAREA|SELECT)$/i.test(event.target?.tagName||''))return;
    if(!hovered || !LookupHover.matches(lookupHoverMode,event))return;
    clearTimeout(hoverTimer);
    const token=hovered;
    hoverTimer=setTimeout(()=>{if(hovered===token && enabled)openWord(token);},190);
  },true);
  document.addEventListener('keyup',event=>{
    if(LookupHover.isModifierKey(event))clearTimeout(hoverTimer);
  },true);
  window.addEventListener('blur',()=>clearTimeout(hoverTimer));
  document.addEventListener('focusin',e=>{const t=e.target?.closest?.('.kmr-word');if(t&&enabled)openWord(t);});
  document.addEventListener('click',e=>{const t=e.target?.closest?.('.kmr-word');if(t&&enabled){clearTimers();openWord(t,true);}});
  async function saveCard(){
    if(!selected)return;
    const {deck}=await chrome.storage.local.get({deck:''});
    if(!deck){showMessage('Choose an Anki deck in Kotoba settings first.');return;}
    const btn=$('.kmr-save',UI);btn.disabled=true;showMessage('Saving to Anki…');
    try{
      const item=selected,meaning=currentLookup?.meanings?.[0]||'';
      if(!meaning)throw Error('Wait for a dictionary meaning before saving.');
      const cardData={word:item.word,reading:currentLookup?.reading||item.reading,meaning,sentence:item.context,translation:translated.get(item.context)||'',title:document.title,url:location.href};
      const res=await chrome.runtime.sendMessage({type:'ANKI_ADD',deck,card:cardData});
      if(!res?.ok)throw Error(res?.error||'Anki save failed');
      showMessage('✓ Saved to '+res.deck);
    }catch(e){showMessage(e.message||'Could not save');}finally{btn.disabled=false;}
  }
  document.addEventListener('keydown',e=>{
    if(!enabled||!hovered&&!pinned||e.repeat||e.isComposing||e.target?.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/i.test(e.target?.tagName||''))return;
    const code=globalThis.KMShortcuts?.fromEvent(e);if(!code)return;
    const action=Object.keys(hotkeys).find(k=>hotkeys[k]===code);
    if(action==='capture'){
      e.preventDefault();if(!card.hidden)saveCard();return;
    }
    if(!['known','learning','unknown','track','ignore'].includes(action))return;
    const item=hovered?chooseToken(hovered):selected;if(!item)return;
    e.preventDefault();statuses[item.word]=action;
    document.querySelectorAll('.kmr-word').forEach(el=>{if(el.dataset.word===item.word)el.dataset.learning=action;});
    chrome.storage.local.set({wordStatuses:statuses});showMessage(item.word+' → '+action);
  });
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=='local')return;
    if(changes.kotobaTheme){theme=changes.kotobaTheme.newValue;UI.dataset.theme=theme;}
    if(changes.kotobaReaderAutoTranslate){autoTranslate=!!changes.kotobaReaderAutoTranslate.newValue;}
    if(changes.kotobaReaderAutoSpeak){autoSpeak=!!changes.kotobaReaderAutoSpeak.newValue;syncSpeakToggle();if(!autoSpeak)clearTimeout(speakTimer);}
    if(changes.kotobaHotkeys)hotkeys=globalThis.KMShortcuts?.validate(changes.kotobaHotkeys.newValue)||hotkeys;
    if(changes.kotobaLookupHoverModifier){lookupHoverMode=LookupHover.normalize(changes.kotobaLookupHoverModifier.newValue);clearTimeout(hoverTimer);if(!pinned)card.hidden=true;}
    if(changes.wordStatuses){statuses={...(changes.wordStatuses.newValue||{})};refreshTokenStatuses();}
    if(changes.ankiVocabularyKnown){ankiKnown=new Set(changes.ankiVocabularyKnown.newValue||[]);refreshTokenStatuses();}
    if(changes.ankiVocabularyLearning){ankiLearning=new Set(changes.ankiVocabularyLearning.newValue||[]);refreshTokenStatuses();}
    if(changes.knownWords){knownWords=new Set(changes.knownWords.newValue||[]);refreshTokenStatuses();}
    if(changes.kotobaReaderSites){const sites=changes.kotobaReaderSites.newValue||{};const should=sites[location.hostname]!==undefined?!!sites[location.hostname]:IS_WIKI||DEMO;if(should&&!enabled)start();else if(!should&&enabled)stop();}
  });
  async function init(){
    const cfg=await chrome.storage.local.get({kotobaTheme:'cotton-candy',kotobaReaderSites:{},kotobaReaderAutoTranslate:false,kotobaReaderAutoSpeak:false,kotobaLookupHoverModifier:'alt',kotobaHotkeys:{},wordStatuses:{},knownWords:[],ankiVocabularyKnown:[],ankiVocabularyLearning:[]});
    theme=cfg.kotobaTheme;UI.dataset.theme=theme;
    statuses=cfg.wordStatuses||{};knownWords=new Set(cfg.knownWords||[]);ankiKnown=new Set(cfg.ankiVocabularyKnown||[]);ankiLearning=new Set(cfg.ankiVocabularyLearning||[]);
    hotkeys=globalThis.KMShortcuts?.validate(cfg.kotobaHotkeys)||{};
    autoTranslate=!!cfg.kotobaReaderAutoTranslate;autoSpeak=!!cfg.kotobaReaderAutoSpeak;syncSpeakToggle();
    lookupHoverMode=LookupHover.normalize(cfg.kotobaLookupHoverModifier);
    const allowed=cfg.kotobaReaderSites?.[location.hostname];
    const should=allowed===undefined?IS_WIKI||DEMO:!!allowed;
    if(should)start();else {launcher.hidden=true;}
    loadedSettings=true;
  }
  // Dashboard: count estimated active reading time, never background/idle page time.
  // We store durations, not article text or the URLs of every page visited.
  let kmReaderLastInteraction=0;
  const kmReaderTouch=()=>{kmReaderLastInteraction=Date.now();};
  document.addEventListener('pointerdown',kmReaderTouch,{passive:true});
  document.addEventListener('keydown',kmReaderTouch,{passive:true});
  document.addEventListener('scroll',kmReaderTouch,{passive:true});
  document.addEventListener('pointermove',()=>{if(Date.now()-kmReaderLastInteraction>15000)kmReaderTouch();},{passive:true});
  setInterval(()=>{
    if(!enabled || document.visibilityState!=='visible' || !document.hasFocus() || Date.now()-kmReaderLastInteraction>65000) return;
    chrome.runtime.sendMessage({type:'ACTIVITY_TICK',kind:'read',seconds:30}).catch(()=>{});
  },30000);
  init().catch(()=>{});
})();
