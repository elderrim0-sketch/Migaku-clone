/* Kotoba Studio 2.0 — original UI over the existing browser extension. */
(async()=>{
 'use strict';
 const L=globalThis.KotobaStudioLogic, $=id=>document.getElementById(id);
 const views=['home','words','reader','video','backup'];
 const state={vocab:[],books:[],active:null,word:null,lookup:null,deck:'',mode:'normal',language:'ja',pageSize:90,readerFont:23,theme:'midnight-neon',latest:{},readingStart:0};
 const cfgKeys=['knownWords','wordStatuses','ankiVocabularyKnown','ankiVocabularyLearning','kotobaReaderDocuments','kotobaReaderLastId','kotobaActivity','kotobaTheme','kotobaPlayMode','kotobaSubtitleMode','deck'];
 let config=await chrome.storage.local.get(cfgKeys);
 function flash(message){const t=$('toast');t.textContent=message;t.hidden=false;clearTimeout(flash.timer);flash.timer=setTimeout(()=>{t.hidden=true},3300)}
 function button(label,onclick,className=''){const b=document.createElement('button');b.textContent=label;b.className=className;b.type='button';b.addEventListener('click',onclick);return b;}
 function element(type,text,className=''){const n=document.createElement(type);n.textContent=text;n.className=className;return n;}
 function go(view){if(!views.includes(view))view='home';for(const v of views)$('view-'+v).classList.toggle('current',v===view);document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false')});$('location-label').textContent=({home:'Overview',words:'Vocabulary',reader:'Reader',video:'Video modes',backup:'Backups'})[view];history.replaceState(null,'','#'+view);if(view==='reader')renderLibrary();if(view==='words')renderWords();}
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
 document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
 $('settings-link').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('popup.html')});
 $('dashboard-link').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('dashboard.html')});
 $('open-demo').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('demo.html')});
 $('today').textContent=new Intl.DateTimeFormat('en-AU',{dateStyle:'full'}).format(new Date()).toUpperCase();
 function applyTheme(theme){state.theme=theme;$('theme-choice').value=theme;document.body.dataset.theme=theme;}
 $('theme-choice').addEventListener('change',async e=>{applyTheme(e.target.value);await chrome.storage.local.set({kotobaTheme:e.target.value});});
 function statusOf(word){return L.vocab({knownWords:config.knownWords,ankiVocabularyKnown:config.ankiVocabularyKnown,ankiVocabularyLearning:config.ankiVocabularyLearning,wordStatuses:{[word]:config.wordStatuses?.[word]}}).find(x=>x.word===word)?.status||'unknown'}
 function refreshOverview(){
   state.vocab=L.vocab(config);
   const counts=Object.fromEntries(L.STATES.map(s=>[s,state.vocab.filter(w=>w.status===s).length]));
   $('nav-word-count').textContent=state.vocab.length.toLocaleString();
   $('home-known').textContent=(counts.known||0).toLocaleString();
   $('home-track').textContent=((counts.known||0)+(counts.track||0)).toLocaleString();
   $('home-cards').textContent=Number(config.kotobaActivity?.totals?.cards||0).toLocaleString();
   $('home-streak').textContent=globalThis.KotobaActivity?.streak(config.kotobaActivity)||0;
   for(const s of ['known','track','learning'])$('count-'+s).textContent=(counts[s]||0).toLocaleString();
   $('count-familiar').textContent=((counts.known||0)+(counts.track||0)).toLocaleString();
   const holder=$('home-recent');holder.replaceChildren();const latest=(config.kotobaActivity?.recent||[]).filter(e=>e.kind==='card'&&e.word).slice(0,8);
   if(!latest.length){holder.textContent='Your mined words will appear here after successful Anki saves.';return;}
   for(const item of latest)holder.append(element('span',item.word,'recent-chip'));
 }
 function renderWords(){
   const query=$('word-search').value.trim().toLowerCase(), filter=$('word-filter').value;
   let words=state.vocab.filter(x=>(filter==='all'||(filter==='familiar'?['known','track'].includes(x.status):x.status===filter))&&(!query||x.word.toLowerCase().includes(query)));
   if($('word-sort').value==='status')words=words.sort((a,b)=>a.status.localeCompare(b.status)||a.word.localeCompare(b.word,'ja'));else words=words.sort((a,b)=>a.word.localeCompare(b.word,'ja'));
   const list=$('word-list');list.replaceChildren();for(const item of words.slice(0,state.pageSize)){
     const row=element('div','','word-row');row.append(element('strong',item.word,'jp-word'),element('span',item.source,'source-pill'));
     const select=document.createElement('select');select.setAttribute('aria-label','Status for '+item.word);
     for(const [value,label]of [['known','Known'],['track','Tracked'],['learning','Learning'],['unknown','Unknown'],['ignore','Ignore'],['auto','Use Anki status']]){const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.append(opt);}
     select.value=item.status;select.addEventListener('change',()=>updateStatus(item.word,select.value));row.append(select);list.append(row);
   }
   $('word-shown').textContent=`Showing ${Math.min(words.length,state.pageSize).toLocaleString()} of ${words.length.toLocaleString()} words`;
   $('more-words').disabled=words.length<=state.pageSize;
 }
 async function updateStatus(word,next){
  const statuses={...(config.wordStatuses||{})}, known=new Set(config.knownWords||[]);
  if(next==='auto'){delete statuses[word];known.delete(word);}
  else {statuses[word]=next;if(next==='known')known.add(word);else known.delete(word);}
  config={...config,wordStatuses:statuses,knownWords:[...known]};
  await chrome.storage.local.set({wordStatuses:statuses,knownWords:[...known]});
  refreshOverview();renderWords();if(state.active)renderReading();
 }
 for(const k of ['word-search','word-filter','word-sort'])$(k).addEventListener(k==='word-search'?'input':'change',()=>{state.pageSize=90;renderWords()});
 $('more-words').onclick=()=>{state.pageSize+=90;renderWords()};
 $('bulk-import').onclick=async()=>{
  const words=L.cleanArray($('bulk-input').value.split(/[\s,、，;；]+/).slice(0,600));
  if(!words.length){flash('Enter Japanese words first.');return;}
  const status=$('bulk-status').value, statuses={...(config.wordStatuses||{})},known=new Set(config.knownWords||[]);
  for(const word of words){statuses[word]=status;if(status==='known')known.add(word);else known.delete(word);}
  config={...config,wordStatuses:statuses,knownWords:[...known]};
  await chrome.storage.local.set({wordStatuses:statuses,knownWords:[...known]});
  $('bulk-input').value='';refreshOverview();renderWords();flash(`${words.length} words marked ${status}.`);
 };
 function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
 function csvCell(s){return '"'+String(s||'').replaceAll('"','""')+'"';}
 $('word-export').onclick=()=>{const rows=[['word','status','familiar','source'],...state.vocab.map(w=>[w.word,w.status,['known','track'].includes(w.status)?'yes':'no',w.source])];download('kotoba-vocabulary.csv','\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');};
 // Reader: only plain text enters the DOM. Imported HTML is converted to text, never inserted as markup.
 const READER_PAGE=1900;
 function renderLibrary(){const root=$('book-list');root.replaceChildren();$('book-count').textContent=state.books.length;
   if(!state.books.length)root.append(element('span','No documents yet','library-tip'));
   for(const book of [...state.books].reverse()){
     const b=button(book.title,()=>openBook(book.id),'book-item'+(book.id===state.active?' active':''));b.replaceChildren();b.append(element('strong',book.title),element('small',`${book.text.length.toLocaleString()} characters`));root.append(b);
   }
 }
 function openBook(id){state.active=id;state.word=null;state.lookup=null;const book=state.books.find(b=>b.id===id);$('reader-book-title').textContent=book?.title||'No document selected';$('reader-progress').textContent=book?`${book.text.length.toLocaleString()} characters · Page ${Math.floor((book.position||0)/READER_PAGE)+1}/${Math.max(1,Math.ceil(book.text.length/READER_PAGE))}`:'Choose a document or paste text';$('lookup-inner').textContent='Click a Japanese word to look it up.';renderLibrary();renderReading();}
 function readingWordSegment(segment){const value=String(segment.surface||segment.segment||'');return value.replace(/[（(][ぁ-んァ-ンー]{1,15}[)）]$/,'');}
 function renderReading(){const book=state.books.find(b=>b.id===state.active);const area=$('reader-text');area.replaceChildren();if(!book){const p=element('p','このページから、あなたの物語が始まる。','reading-placeholder');p.append(element('small','Your Japanese reading space is ready.'));area.append(p);return;}
   const pageStart=Math.max(0,Math.floor((book.position||0)/READER_PAGE)*READER_PAGE);
   const text=book.text.slice(pageStart,pageStart+READER_PAGE), pieces=globalThis.KMWordParser.tokenize(text);
   $('reader-progress').textContent=`${book.text.length.toLocaleString()} characters · Page ${Math.floor(pageStart/READER_PAGE)+1}/${Math.max(1,Math.ceil(book.text.length/READER_PAGE))}`;
   $('reader-prev').disabled=pageStart===0;$('reader-next').disabled=pageStart+READER_PAGE>=book.text.length;
   area.style.fontSize=state.readerFont+'px';const known=new Set([...(config.knownWords||[]),...(config.ankiVocabularyKnown||[])]),tracking=new Set(config.ankiVocabularyLearning||[]);
   let offset=0;for(const piece of pieces){const pieceStart=offset;offset+=String(piece.segment||'').length;if(!piece.word||!/[\u3040-\u30ff\u3400-\u9fff]/.test(piece.surface||piece.segment)){area.append(document.createTextNode(piece.segment||''));continue;}
     const surface=readingWordSegment(piece), lemma=piece.lemma||surface;
     const stateWord=globalThis.KMLearning.vocabularyState({surface,lemma},{known,learning:tracking,statuses:config.wordStatuses||{}});
     const contextStart=Math.max(0,text.lastIndexOf('。',pieceStart-1)+1,text.lastIndexOf('！',pieceStart-1)+1,text.lastIndexOf('？',pieceStart-1)+1,text.lastIndexOf('\n',pieceStart-1)+1);
     const after=text.slice(pieceStart+String(piece.segment||'').length);const nextEnd=after.search(/[。！？\n]/);const context=text.slice(contextStart,Math.min(text.length,pieceStart+String(piece.segment||'').length+ (nextEnd>=0?nextEnd+1:120))).trim().slice(0,450);
     const target=button(piece.segment||surface,()=>lookup(surface,lemma,context||text.slice(pieceStart,pieceStart+120)),'rw');target.dataset.status=stateWord;target.title='Look up '+surface;target.setAttribute('aria-label','Look up '+surface);if(state.word===surface)target.classList.add('active');area.append(target);
   }
 }
 async function createDocument(title,text,type){const clean=L.readText(text,type);if(!clean){flash('Document has no readable text.');return;}
   if(state.books.length>=L.MAX_LIBRARY){flash('Library full (20 documents). Delete or back up old documents first.');return;}
   const doc={id:'doc_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),title:String(title||'Untitled reading').slice(0,120),text:clean,created:Date.now(),position:0};
   const next=[...state.books,doc];try{await chrome.storage.local.set({kotobaReaderDocuments:next,kotobaReaderLastId:doc.id});state.books=next;openBook(doc.id);go('reader');flash('Document saved to your local reading library.');}catch(err){flash('Storage error: '+err.message);}
 }
 $('reader-add').onclick=()=>{const value=$('reader-paste').value;createDocument($('reader-new-title').value.trim()||'Pasted text',value,'txt');};
 $('reader-file').addEventListener('change',async e=>{
   const file=e.target.files?.[0];e.target.value='';if(!file)return;
   if(file.size>500000){flash('Please choose a document under 500 KB.');return;}
   const ext=(file.name.split('.').at(-1)||'').toLowerCase();if(!['txt','html','htm','srt','vtt'].includes(ext)){flash('Supports TXT, HTML, SRT and VTT for now.');return;}
   await createDocument(file.name,await file.text(),ext);
 });
 async function readerTurn(direction){const book=state.books.find(b=>b.id===state.active);if(!book)return;const next=Math.max(0,Math.min(Math.max(0,book.text.length-1),Math.max(0,(book.position||0)+direction*READER_PAGE)));book.position=Math.floor(next/READER_PAGE)*READER_PAGE;try{await chrome.storage.local.set({kotobaReaderDocuments:state.books});}catch{}renderReading();$('reader-text').scrollTop=0;}
 $('reader-prev').onclick=()=>readerTurn(-1);$('reader-next').onclick=()=>readerTurn(1);
 $('reader-delete').onclick=async()=>{const book=state.books.find(b=>b.id===state.active);if(!book)return;if(!confirm('Delete the local reading document "'+book.title+'"?'))return;const list=state.books.filter(b=>b.id!==book.id);await chrome.storage.local.set({kotobaReaderDocuments:list,kotobaReaderLastId:list.at(-1)?.id||null});state.books=list;openBook(list.at(-1)?.id||null);flash('Document deleted from Kotoba Reader.');};
  $('reader-small').onclick=()=>{state.readerFont=Math.max(16,state.readerFont-2);$('reader-text').style.fontSize=state.readerFont+'px';};
 $('reader-large').onclick=()=>{state.readerFont=Math.min(38,state.readerFont+2);$('reader-text').style.fontSize=state.readerFont+'px';};
 $('reader-speak').onclick=async()=>{const b=state.books.find(d=>d.id===state.active);const sentence=(state.word||b?.text?.slice(0,90)||'').slice(0,120);if(!sentence){flash('Select some Japanese text first.');return;}try{const r=await chrome.runtime.sendMessage({type:'SPEAK_JA',word:sentence});if(!r?.ok)flash(r?.error||'Japanese voice unavailable');}catch(e){flash('Audio: '+e.message);}};
 async function lookup(word,lemma,context){state.word=word;state.lookup=null;const box=$('lookup-inner');box.replaceChildren(element('div','Searching dictionary…','empty-lookup'));$('reader-notice').textContent='';renderActiveReadingWords(word);
   try{const reply=await chrome.runtime.sendMessage({type:'LOOKUP',query:word,lemma});if(state.word!==word)return;if(!reply?.ok)throw Error(reply?.error||'Dictionary error');const entry=reply.results?.[0];state.lookup=entry;if(!entry){box.replaceChildren(element('div','No dictionary entry found. Try another inflection.','empty-lookup'));return;}
     box.replaceChildren(element('div',word,'lookup-heading'),element('div',entry.reading||'','lookup-reading'));
     box.append(element('p',entry.meanings?.[0]||'No English definition available.','lookup-definition'));
     const more=element('ol','','lookup-more');for(const def of (entry.meanings||[]).slice(1,7)){more.append(element('li',def));}box.append(more);
     const select=document.createElement('select');select.className='lookup-select';for(const v of L.STATES){const opt=document.createElement('option');opt.value=v;opt.textContent=({known:'✓ Known',track:'◌ Track',learning:'◉ Learning',unknown:'? Unknown',ignore:'⊘ Ignore'})[v];select.append(opt);}select.value=statusOf(word);box.append(select);
     const actions=element('div','','lookup-actions');actions.append(button('♫ Speak',async()=>{const r=await chrome.runtime.sendMessage({type:'SPEAK_JA',word:entry.reading||word});if(!r?.ok)flash('Japanese voice unavailable.');},'outline'));
     actions.append(button('＋ Save to Anki',async()=>{const {deck=''}=await chrome.storage.local.get({deck:''});if(!deck){flash('Select your Anki deck in Settings first.');return;}const card={word,reading:entry.reading||'',meaning:entry.meanings?.[0]||'',sentence:context.slice(0,450),title:state.books.find(b=>b.id===state.active)?.title||'Kotoba Reader'};
       try{const res=await chrome.runtime.sendMessage({type:'ANKI_ADD',deck,card});if(!res?.ok)throw Error(res?.error||'Card save rejected');flash('Card saved to Anki: '+word);}catch(err){flash('Anki error: '+err.message);}
     },'primary'));
     actions.append(button('Translate paragraph',async()=>{if(!confirm('Send the selected text to MyMemory for English translation?'))return;const res=await chrome.runtime.sendMessage({type:'TRANSLATE',sentence:context.slice(0,450)});$('reader-notice').textContent=res?.ok?res.text:(res?.error||'Translation unavailable');},'outline'));
     box.append(actions);select.onchange=()=>updateStatus(word,select.value);
   }catch(err){box.replaceChildren(element('div','Lookup unavailable: '+err.message,'empty-lookup'));}
 }
 function renderActiveReadingWords(word){for(const el of $('reader-text').querySelectorAll('.rw'))el.classList.toggle('active',el.textContent===word);}
 // Active reading time: no background-tab counting; do not claim it if reader is hidden.
 let lastReadTick=Date.now();setInterval(async()=>{const now=Date.now(),delta=Math.round((now-lastReadTick)/1000);lastReadTick=now;if(delta<1||delta>31||document.hidden||!document.hasFocus()||!$('view-reader').classList.contains('current')||!state.active)return;
   const data=await chrome.storage.local.get({kotobaActivity:null});const next=globalThis.KotobaActivity.record(data.kotobaActivity,{kind:'read',seconds:Math.min(delta,20)});await chrome.storage.local.set({kotobaActivity:next});},20000);
 // Video settings: existing content scripts respond to storage updates.
 async function setPlayMode(mode){if(!['normal','focus','audio-first','step'].includes(mode))return;state.mode=mode;document.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===mode;b.classList.toggle('active',yes);b.querySelector('.selected-text').textContent=yes?'Selected':'Choose mode';});await chrome.storage.local.set({kotobaPlayMode:mode});flash('Video mode: '+({normal:'Free watch',focus:'New-word focus','audio-first':'Listen first',step:'Sentence steps'})[mode]);}
 document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setPlayMode(b.dataset.mode)));
 async function setLanguage(lang){state.language=lang;document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));await chrome.storage.local.set({kotobaSubtitleMode:lang});}
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
 // Backup only study fields, never private API credentials, cookies or site permissions.
 $('backup-export').onclick=async()=>{const cfg=await chrome.storage.local.get(L.SAFE_KEYS);const data=L.backupFrom(cfg);download('kotoba-study-backup-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(data,null,2),'application/json');flash('Local study backup exported.');};
 $('backup-import').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>3_000_000){$('backup-result').textContent='Backup too large (3 MB max).';return;}
   try{const parsed=JSON.parse(await file.text());const current=await chrome.storage.local.get(L.SAFE_KEYS);const patch=L.restoreFrom(parsed,current);if(!Object.keys(patch).length)throw Error('No supported study records found.');if(!confirm('Restore '+Object.keys(patch).length+' Kotoba data fields? Existing vocabulary and documents will be merged.'))return;
      await chrome.storage.local.set(patch);config={...config,...patch};state.books=L.safeLibrary(config.kotobaReaderDocuments);refreshOverview();renderWords();renderLibrary();$('backup-result').textContent='Study data restored successfully.';flash('Kotoba backup restored.');
   }catch(err){$('backup-result').textContent='Cannot restore: '+err.message;}
 });
 chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local')return;for(const [key,v] of Object.entries(changes))if(cfgKeys.includes(key))config[key]=v.newValue;
   if(changes.kotobaTheme)applyTheme(changes.kotobaTheme.newValue);
   if(changes.kotobaPlayMode){state.mode=changes.kotobaPlayMode.newValue;document.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===state.mode;b.classList.toggle('active',yes);b.querySelector('.selected-text').textContent=yes?'Selected':'Choose mode';});}
   if(changes.kotobaSubtitleMode)document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===changes.kotobaSubtitleMode.newValue));
   if(changes.kotobaReaderDocuments)state.books=L.safeLibrary(changes.kotobaReaderDocuments.newValue);
   refreshOverview();if($('view-words').classList.contains('current'))renderWords();
 });
 applyTheme(config.kotobaTheme||'midnight-neon');state.books=L.safeLibrary(config.kotobaReaderDocuments);state.active=config.kotobaReaderLastId||state.books.at(-1)?.id||null;
 state.mode=config.kotobaPlayMode||'normal';state.language=config.kotobaSubtitleMode||'ja';refreshOverview();renderWords();renderLibrary();openBook(state.active);
 document.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===state.mode;b.classList.toggle('active',yes);b.querySelector('.selected-text').textContent=yes?'Selected':'Choose mode';});
 document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.language));
 go(location.hash.slice(1)||'home');
})();

KMIcons.hydrate(document);
