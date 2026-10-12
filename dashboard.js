/* Dashboard: offline/local Kotoba activity + optional read-only Anki statistics. */
(()=>{
  'use strict';
  const $=s=>document.querySelector(s);
  const {dateKey,shiftDay,streak,empty}=globalThis.KotobaActivity;
  let activity=empty(),anki=null,goals={cards:5,minutes:20},syncing=false;
  const localDay=dateKey();
  const toMin=seconds=>Math.floor((Number(seconds)||0)/60);
  const nfmt=n=>new Intl.NumberFormat().format(Math.max(0,Math.round(Number(n)||0)));
  const el=(tag,cls,content)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(content!==undefined)node.textContent=String(content);return node;};
  const dayData=key=>activity.days?.[key]||{cards:0,watchSeconds:0,readSeconds:0};
  const hasStudy=day=>Number(day.cards||0)>0 || Number(day.watchSeconds||0)>=60 || Number(day.readSeconds||0)>=60;
  const mins=day=>toMin(Number(day.watchSeconds||0)+Number(day.readSeconds||0));
  function render(){
    const today=dayData(localDay),minutes=mins(today),cardCount=Number(today.cards||0),total=activity.totals||{};
    $('#cards-today').textContent=nfmt(cardCount);
    $('#cards-total').textContent=nfmt(total.cards)+' recorded total';
    $('#minutes-today').textContent=nfmt(minutes)+'m';
    $('#minutes-detail').textContent=toMin(today.watchSeconds)+'m watching · '+toMin(today.readSeconds)+'m reading';
    const currentStreak=streak(activity,localDay);
    $('#streak-count').textContent=nfmt(currentStreak);
    $('#streak-hint').textContent=currentStreak===0?'Mine a card or study for a minute to begin.':
      hasStudy(today)?'You showed up today. That is what counts. ✦':'Yesterday counts—come back today to keep going.';
    $('#today-date').textContent=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date());
    const dots=$('#streak-dots');dots.replaceChildren();
    for(let i=6;i>=0;i--){const key=shiftDay(localDay,-i);const date=new Date(key+'T12:00:00');const box=el('div','streak-day');const dot=el('div','streak-dot'+(hasStudy(dayData(key))?' active':''));box.title=key+(hasStudy(dayData(key))?' • activity logged':' • no activity logged');box.append(dot,el('span','',new Intl.DateTimeFormat(undefined,{weekday:'short'}).format(date).slice(0,2)));dots.append(box);}
    $('#cards-progress-label').textContent=nfmt(cardCount)+' / '+goals.cards+' cards';
    $('#minutes-progress-label').textContent=nfmt(minutes)+' / '+goals.minutes+' min';
    $('#cards-progress').style.width=Math.min(100,cardCount/goals.cards*100)+'%';
    $('#minutes-progress').style.width=Math.min(100,minutes/goals.minutes*100)+'%';
    $('#goal-cards').value=goals.cards;$('#goal-minutes').value=goals.minutes;
    renderWeek();renderCalendar();renderRecent();renderAnki();
    $('#tracked-total').textContent=nfmt(total.cards||0)+' cards logged';
  }
  function renderWeek(){
    const days=Array.from({length:7},(_,i)=>{const key=shiftDay(localDay,i-6);return {key,...dayData(key)};});
    const max=Math.max(12,...days.map(d=>mins(d)));
    const parent=$('#week-chart');parent.replaceChildren();
    for(const day of days){
      const item=el('div','daybar'),track=el('div','bar-track'),watch=el('div','bar-watch'),read=el('div','bar-read');
      const watchMin=toMin(day.watchSeconds),readMin=toMin(day.readSeconds);
      watch.style.height=(watchMin/max*120)+'px';read.style.height=(readMin/max*120)+'px';
      if(watchMin>0&&watchMin/max*120<5)watch.style.height='5px';
      if(readMin>0&&readMin/max*120<5)read.style.height='5px';
      track.append(watch,read);
      const dot=el('div','bar-card'+(day.cards?'':' inactive'));
      item.append(track,dot,el('small','',new Intl.DateTimeFormat(undefined,{weekday:'short'}).format(new Date(day.key+'T12:00:00'))));
      item.title=day.key+' • '+watchMin+'m watching, '+readMin+'m reading, '+Number(day.cards||0)+' cards';
      parent.append(item);
    }
  }
  function renderCalendar(){
    const parent=$('#study-calendar');parent.replaceChildren();
    for(let i=20;i>=0;i--){const key=shiftDay(localDay,-i),day=dayData(key),score=mins(day)+Number(day.cards||0)*5;
      const level=score>=50?4:score>=25?3:score>=10?2:score>0?1:0;
      const box=el('div','heatday');box.dataset.intensity=String(level);box.title=key+' — '+Number(day.cards||0)+' cards, '+mins(day)+'m';parent.append(box);
    }
  }
  function renderRecent(){
    const parent=$('#recent-list');parent.replaceChildren();const items=(activity.recent||[]).filter(e=>e.kind==='card').slice(0,6);
    if(!items.length){parent.append(el('p','muted','No cards mined yet in this dashboard version. Hover a word and press Q.'));return;}
    for(const item of items){const row=el('div','recent-row');row.append(el('div','recent-avatar','語'));
      const info=el('div',''),word=el('span','recent-word',item.word||'Japanese vocabulary'),deck=el('span','recent-deck',item.deck||'Anki');info.append(word,deck);
      const when=el('span','recent-time',new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(item.at)));
      row.append(info,when);parent.append(row);
    }
  }
  function renderAnki(){
    $('#reviews-today').textContent=anki?nfmt(anki.todayReviews):'—';
    $('#anki-added').textContent=anki?nfmt(anki.todayAdded):'—';
    const days=new Set((anki?.history||[]).filter(pair=>pair?.[0]>=shiftDay(localDay,-6) && Number(pair?.[1])>0).map(pair=>pair[0]));
    $('#anki-review-days').textContent=anki?days.size+' / 7':'—';
  }
  async function loadAnki(force=false){
    if(syncing)return;
    const cache=await chrome.storage.local.get({kotobaAnkiDashboard:null});
    if(!anki && cache.kotobaAnkiDashboard)anki=cache.kotobaAnkiDashboard;
    renderAnki();
    const status=$('#anki-status'),button=$('#refresh-anki');
    syncing=true;button.disabled=true;button.textContent='↻ Checking…';
    status.textContent='Checking AnkiConnect for current review statistics…';
    try{
      const reply=await chrome.runtime.sendMessage({type:'ANKI_DASHBOARD'});
      if(!reply?.ok)throw Error(reply?.error||'Anki unavailable');
      anki=reply;
      status.textContent='✓ Anki connected · Updated '+new Date(anki.at).toLocaleTimeString();
      renderAnki();
    }catch(err){
      const previous=anki?.at?' Last saved Anki stats: '+new Date(anki.at).toLocaleString()+'.':'';
      status.textContent='Anki offline or unsupported action: '+(err.message||String(err))+'.'+previous;
    }finally{syncing=false;button.disabled=false;button.textContent='↻ Refresh Anki';}
  }
  async function restore(){
    const cfg=await chrome.storage.local.get({kotobaActivity:null,kotobaTheme:'midnight-neon',kotobaAnkiDashboard:null,kotobaDashboardGoals:{cards:5,minutes:20},ankiVocabularyKnown:[],ankiVocabularyLearning:[],ankiVocabularySyncReport:null});
    const themes=new Set(['midnight-neon','cotton-candy','matcha-cream','sunset-pop','black-gold']);
    document.body.dataset.theme=themes.has(cfg.kotobaTheme)?cfg.kotobaTheme:'midnight-neon';
    activity=cfg.kotobaActivity||empty();anki=cfg.kotobaAnkiDashboard||null;
    goals={cards:Number(cfg.kotobaDashboardGoals?.cards)||5,minutes:Number(cfg.kotobaDashboardGoals?.minutes)||20};
    goals.cards=Math.max(1,Math.min(100,goals.cards));goals.minutes=Math.max(1,Math.min(240,goals.minutes));
    const known=Array.isArray(cfg.ankiVocabularyKnown)?cfg.ankiVocabularyKnown.length:0;
    $('#known-count').textContent=cfg.ankiVocabularySyncReport?.lastSync?nfmt(known):'—';
    $('#known-detail').textContent=cfg.ankiVocabularySyncReport?.lastSync?
      `${nfmt((cfg.ankiVocabularyLearning||[]).length)} tracked · synced ${new Date(cfg.ankiVocabularySyncReport.lastSync).toLocaleDateString()}`:
      'Enable vocabulary sync in settings';
    render();await loadAnki();
  }
  $('#refresh-anki').addEventListener('click',()=>loadAnki(true));
  $('#open-settings').addEventListener('click',()=>chrome.tabs.create({url:chrome.runtime.getURL('popup.html')}));
  for(const [id,key,max] of [['#goal-cards','cards',100],['#goal-minutes','minutes',240]]){
    $(id).addEventListener('change',async()=>{
      goals[key]=Math.max(1,Math.min(max,Math.round(Number($(id).value)||1)));
      await chrome.storage.local.set({kotobaDashboardGoals:goals});
      $('#goal-notice').textContent='✓ Goal saved locally';render();
    });
  }
  $('#export-csv').addEventListener('click',()=>{
    const keys=Object.keys(activity.days||{}).sort();
    const rows=[['Date','Kotoba cards mined','Watching minutes','Reading minutes'],...keys.map(key=>{const day=dayData(key);return[key,day.cards||0,(Number(day.watchSeconds||0)/60).toFixed(2),(Number(day.readSeconds||0)/60).toFixed(2)];})];
    const body=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
    const objectUrl=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=objectUrl;anchor.download='kotoba-study-activity-'+dateKey()+'.csv';anchor.click();
    setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
  });
  chrome.storage.onChanged.addListener(async(changes,area)=>{
    if(area!=='local')return;
    if(changes.kotobaActivity){activity=changes.kotobaActivity.newValue||empty();render();}
    if(changes.kotobaAnkiDashboard){anki=changes.kotobaAnkiDashboard.newValue||null;renderAnki();}
    if(changes.kotobaTheme)document.body.dataset.theme=changes.kotobaTheme.newValue;
    if(changes.ankiVocabularyKnown||changes.ankiVocabularyLearning||changes.ankiVocabularySyncReport){
      const cfg=await chrome.storage.local.get({ankiVocabularyKnown:[],ankiVocabularyLearning:[],ankiVocabularySyncReport:null});
      $('#known-count').textContent=cfg.ankiVocabularySyncReport?.lastSync?nfmt(cfg.ankiVocabularyKnown.length):'—';
      $('#known-detail').textContent=cfg.ankiVocabularySyncReport?.lastSync?`${nfmt(cfg.ankiVocabularyLearning.length)} tracked · synced ${new Date(cfg.ankiVocabularySyncReport.lastSync).toLocaleDateString()}`:'Enable vocabulary sync in settings';
    }
  });
  restore().catch(error=>{$('#anki-status').textContent='Dashboard setup failed: '+(error?.message||error);});
})();
