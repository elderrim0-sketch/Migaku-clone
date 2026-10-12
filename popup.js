const $ = selector => document.querySelector(selector);
const THEMES = ['cotton-candy', 'matcha-cream', 'sunset-pop', 'midnight-neon', 'black-gold'];
function applyTheme(value) {
  const theme = THEMES.includes(value) ? value : 'cotton-candy';
  document.body.dataset.theme = theme;
  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    const selected = button.dataset.themeChoice === theme;
    button.setAttribute('aria-pressed', String(selected));
  });
}
document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', async () => {
  applyTheme(button.dataset.themeChoice);
  await chrome.storage.local.set({kotobaTheme: button.dataset.themeChoice});
}));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.kotobaTheme) applyTheme(changes.kotobaTheme.newValue);
});
let refreshSequence = 0;
async function saveSettings(key, value) {
  await chrome.storage.local.set({ [key]: value });
  $('#saved').textContent = '✓ Settings saved locally';
}
async function refreshDecks(preferredDeck = null) {
  const id = ++refreshSequence;
  const status = $('#connection');
  const selector = $('#deck');
  selector.disabled = true;
  status.className = 'status';
  status.textContent = 'Loading your Anki decks…';
  try {
    const reply = await chrome.runtime.sendMessage({ type: 'ANKI_DECKS' });
    if (id !== refreshSequence) return;
    if (!reply?.ok || !Array.isArray(reply.decks)) throw new Error(reply?.error || 'No AnkiConnect response.');
    const { deck: savedDeck = '' } = await chrome.storage.local.get({ deck: '' });
    if (id !== refreshSequence) return;
    selector.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '— Select an Anki deck —';
    selector.append(placeholder);
    const decks = [...new Set(reply.decks)].sort((a, b) => a.localeCompare(b));
    for (const name of decks) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      selector.append(option);
    }
    const desired = preferredDeck ?? savedDeck;
    selector.value = decks.includes(desired) ? desired : '';
    selector.disabled = !decks.length;
    const filter=$('#km-anki-sync-decks');
    const settings=await chrome.storage.local.get({ankiVocabularySyncDecks:[]});
    const picked=new Set(settings.ankiVocabularySyncDecks||[]);
    filter.replaceChildren();
    for(const name of decks){const option=new Option(name,name,false,picked.has(name));filter.add(option);}

    status.classList.add('ok');
    status.textContent = `✓ Connected to Anki · ${decks.length} deck(s) found`;
    $('#saved').textContent = selector.value
      ? `Cards will go to: ${selector.value}`
      : 'Choose a destination deck before saving a card.';
    if (preferredDeck && selector.value) await chrome.storage.local.set({ deck: selector.value });
  } catch (err) {
    if (id !== refreshSequence) return;
    selector.replaceChildren();
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Anki unavailable — click Refresh';
    selector.append(option);
    status.textContent = err.message || 'Could not reach AnkiConnect';
    status.classList.add('error');
    $('#saved').textContent = 'Open Anki Desktop, then refresh decks.';
  }
}
async function restore() {
  const config = await chrome.storage.local.get({ enabled: true, ankiKey: '', onVideoEnabled:true,coverageEnabled:false,pitchMode:'always',sentenceTranslation:false,autoJapaneseSubtitles:true,pauseOnHover:true,kotobaLookupHoverModifier:'alt',autoGenerateWordAudio:true,kotobaTheme:'cotton-candy',kotobaFuriganaMode:'unknown',kotobaSentenceAutoPause:false,ankiVocabularySyncEnabled:false,ankiVocabularySyncReport:null });
  applyTheme(config.kotobaTheme);
  $('#enabled').checked = config.enabled;
  $('#anki-key').value = config.ankiKey;
  $('#video-subs').checked=config.onVideoEnabled;$('#coverage').checked=config.coverageEnabled;
  $('#pitch-mode').value=config.pitchMode;$('#translation').checked=config.sentenceTranslation;
  $('#km-auto-tts').checked=config.autoGenerateWordAudio!==false;
  $('#auto-ja').checked=config.autoJapaneseSubtitles!==false;$('#pause-hover').checked=config.pauseOnHover!==false;
  $('#km-dictionary-hover-modifier').value=globalThis.KMLookupHover.normalize(config.kotobaLookupHoverModifier);
  $('#km-furigana-mode').value=config.kotobaFuriganaMode||'unknown';
  $('#km-sentence-autopause').checked=!!config.kotobaSentenceAutoPause;
  $('#km-anki-sync-enabled').checked=!!config.ankiVocabularySyncEnabled;
  showAnkiSyncStatus(config.ankiVocabularySyncReport);
  await refreshDecks();
}
function showAnkiSyncStatus(report){
  const el=$('#km-anki-sync-status');
  if(!report?.lastSync){el.textContent='Not synced yet. Open Anki and click Sync now.';return;}
  const date=new Date(report.lastSync);
  el.textContent=`✓ ${report.known} mature words · ${report.learning} tracked · ${report.recognized} Japanese cards checked · ${date.toLocaleString()}${report.truncated?' · first 6,000 cards only':''}`;
}
$('#km-furigana-mode').addEventListener('change',()=>saveSettings('kotobaFuriganaMode',$('#km-furigana-mode').value));
$('#km-sentence-autopause').addEventListener('change',()=>saveSettings('kotobaSentenceAutoPause',$('#km-sentence-autopause').checked));
$('#km-anki-sync-enabled').addEventListener('change',async()=>{
  const checked=$('#km-anki-sync-enabled').checked;
  await saveSettings('ankiVocabularySyncEnabled',checked);
  if(checked)$('#km-sync-collection').click();
});
$('#km-anki-sync-decks').addEventListener('change',()=>saveSettings('ankiVocabularySyncDecks',[...$('#km-anki-sync-decks').selectedOptions].map(x=>x.value)));
$('#km-sync-collection').addEventListener('click',async()=>{
  const button=$('#km-sync-collection'),el=$('#km-anki-sync-status');
  button.disabled=true;el.textContent='Scanning Japanese cards across Anki decks, including new cards…';
  try{
    const reply=await chrome.runtime.sendMessage({type:'ANKI_COLLECTION_SYNC'});
    if(!reply?.ok)throw Error(reply?.error||'Anki sync failed');
    showAnkiSyncStatus(reply);
  }catch(err){el.textContent='Could not sync: '+(err.message||err);}
  finally{button.disabled=false;}
});
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==='local' && changes.ankiVocabularySyncReport)showAnkiSyncStatus(changes.ankiVocabularySyncReport.newValue);
});
$('#km-auto-tts').addEventListener('change',()=>saveSettings('autoGenerateWordAudio',$('#km-auto-tts').checked));
$('#auto-ja').addEventListener('change',()=>saveSettings('autoJapaneseSubtitles',$('#auto-ja').checked));
$('#pause-hover').addEventListener('change',()=>saveSettings('pauseOnHover',$('#pause-hover').checked));
$('#km-dictionary-hover-modifier').addEventListener('change',()=>saveSettings('kotobaLookupHoverModifier',globalThis.KMLookupHover.normalize($('#km-dictionary-hover-modifier').value)));
$('#video-subs').addEventListener('change',()=>saveSettings('onVideoEnabled',$('#video-subs').checked));
$('#coverage').addEventListener('change',()=>saveSettings('coverageEnabled',$('#coverage').checked));
$('#pitch-mode').addEventListener('change',()=>saveSettings('pitchMode',$('#pitch-mode').value));
$('#translation').addEventListener('change',()=>saveSettings('sentenceTranslation',$('#translation').checked));
$('#enabled').addEventListener('change', () => saveSettings('enabled', $('#enabled').checked));
$('#deck').addEventListener('change', () => {
  const deck = $('#deck').value;
  chrome.storage.local.set({ deck });
  $('#saved').textContent = deck ? `Cards will go to: ${deck}` : 'Choose a destination deck before saving.';
});
$('#anki-key').addEventListener('change', async () => {
  await saveSettings('ankiKey', $('#anki-key').value.trim());
  await refreshDecks();
});
$('#test').addEventListener('click', () => refreshDecks());
$('#create-deck').addEventListener('click', async () => {
  const name = $('#new-deck').value.trim();
  if (!name) { $('#saved').textContent = 'Type a name for the new deck first.'; return; }
  const button = $('#create-deck');
  button.disabled = true;
  $('#saved').textContent = `Creating ${name}…`;
  try {
    const reply = await chrome.runtime.sendMessage({ type: 'ANKI_CREATE_DECK', deck: name });
    if (!reply?.ok) throw new Error(reply?.error || 'Unable to create deck.');
    $('#new-deck').value = '';
    await refreshDecks(reply.deck);
  } catch (err) {
    $('#saved').textContent = err.message || 'Could not create deck';
  } finally { button.disabled = false; }
});
$('#sync-known')?.addEventListener('click',async()=>{
  const deck=$('#deck').value;
  if(!deck) {$('#saved').textContent='Choose an Anki deck before syncing.';return;}
  const btn=$('#sync-known');btn.disabled=true;$('#saved').textContent='Reading mature cards from Anki…';
  try {const reply=await chrome.runtime.sendMessage({type:'ANKI_MATURE_WORDS',deck});
    if(!reply?.ok)throw Error(reply?.error || 'Anki sync failed');
    $('#saved').textContent=`Synced ${reply.added} mature terms from ${reply.scanned} cards. ${reply.knownTotal} marked known total${reply.truncated?' (scan capped at 1,500 cards)':''}.`;
  } catch(e){$('#saved').textContent=e.message || 'Could not sync.';}finally{btn.disabled=false;}
});
// The subtitle language choice is stored separately from optional translation permission.
const languageSelect=$('#km-subtitle-language');
chrome.storage.local.get({kotobaSubtitleMode:'ja'}).then(s=>{languageSelect.value=['ja','dual','en'].includes(s.kotobaSubtitleMode)?s.kotobaSubtitleMode:'ja';});
languageSelect.addEventListener('change',()=>chrome.storage.local.set({kotobaSubtitleMode:languageSelect.value}));
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.kotobaSubtitleMode)languageSelect.value=changes.kotobaSubtitleMode.newValue;});
$('#demo').addEventListener('click', () => chrome.tabs.create({ url: chrome.runtime.getURL('demo.html') }));
restore();

/* User-defined, locally stored page shortcuts. Capture runs only while editor is focused. */
const KMKeys = globalThis.KMShortcuts;
let customHotkeys = {...KMKeys.DEFAULTS};
let capturingHotkey = '';
function renderHotkeys() {
  const list=$('#km-hotkeys');list.replaceChildren();
  for(const [action,label] of Object.entries(KMKeys.LABELS)) {
    const row=document.createElement('div');row.className='km-hotkey-row';
    const span=document.createElement('span');span.textContent=label;
    const button=document.createElement('button');button.type='button';button.className='km-hotkey-bind';
    button.textContent = capturingHotkey===action?'Press keys…':KMKeys.format(customHotkeys[action]);
    button.setAttribute('aria-label',`${label}: ${button.textContent}. Click to change.`);
    button.addEventListener('click',()=>{capturingHotkey=action;renderHotkeys();document.querySelector(`[data-shortcut-id="${action}"]`)?.focus();});
    button.dataset.shortcutId=action;
    row.append(span,button);list.append(row);
  }
}
$('#km-hotkeys').addEventListener('keydown',async e=>{
  if(!capturingHotkey)return;
  e.preventDefault();e.stopPropagation();
  if(e.key==='Escape'){capturingHotkey='';renderHotkeys();return;}
  const binding=KMKeys.fromEvent(e);
  if(!binding)return;
  if(Object.entries(customHotkeys).some(([key,value])=>key!==capturingHotkey && value===binding)){
    $('#km-hotkeys-notice').textContent=`${KMKeys.format(binding)} is already assigned to another action. Choose different keys.`;
    return;
  }
  customHotkeys[capturingHotkey]=binding;
  capturingHotkey='';renderHotkeys();
  await chrome.storage.local.set({kotobaHotkeys:customHotkeys});
  $('#km-hotkeys-notice').textContent='✓ Shortcuts updated — active YouTube tabs update automatically.';
},true);
$('#km-reset-hotkeys').addEventListener('click',async()=>{
  customHotkeys={...KMKeys.DEFAULTS};capturingHotkey='';renderHotkeys();
  await chrome.storage.local.set({kotobaHotkeys:customHotkeys});
  $('#km-hotkeys-notice').textContent='✓ Default shortcuts restored.';
});
chrome.storage.local.get({kotobaHotkeys:{}}).then(({kotobaHotkeys})=>{
  customHotkeys=KMKeys.validate(kotobaHotkeys);renderHotkeys();
});


// Explicit Japanese voice diagnostic: reports failed speech engines instead of a silent speaker indicator.
document.querySelector('#km-test-native-tts')?.addEventListener('click',async()=>{
  const result=document.querySelector('#km-tts-status');
  result.textContent='Checking Japanese speech engine…';
  try {const r=await chrome.runtime.sendMessage({type:'SPEAK_JA',word:'こんにちは'});
    result.textContent=r?.ok?`▶ ${r.voice||'Japanese speech engine'} reported ${r.status||'playback'} · Check your speakers.`:(r?.error||'Unable to play Japanese.');}
  catch(e){result.textContent='Speech test failed: '+e.message;}
});

// Voice choice and optional locally-hosted study assistant.
const $kmVoice = selector=>document.querySelector(selector);
async function loadKotobaVoices(){
  const message=$kmVoice('#km-tts-status');message.textContent='Checking Japanese system voices and VOICEVOX…';
  try{
    const r=await chrome.runtime.sendMessage({type:'TTS_VOICES'});
    if(!r?.ok)throw Error(r?.error||'Voices unavailable');
    const store=await chrome.storage.local.get({kotobaVoiceName:'',kotobaVoicevoxSpeaker:null});
    const system=$kmVoice('#km-system-voice'),synth=$kmVoice('#km-voicevox-speaker');
    system.replaceChildren(new Option('Automatic Japanese voice',''));
    for(const v of r.systemVoices)system.add(new Option(v.name+(v.lang?' ('+v.lang+')':''),v.name));
    system.value=store.kotobaVoiceName||'';
    synth.replaceChildren(new Option('First available speaker',''));
    for(const v of r.synthVoices)synth.add(new Option(v.name,String(v.id)));
    synth.value=store.kotobaVoicevoxSpeaker==null?'':String(store.kotobaVoicevoxSpeaker);
    message.textContent=`${r.systemVoices.length} installed Japanese system voices · ${r.synthVoices.length} VOICEVOX voice styles. ${r.synthesisStatus}`;
  }catch(e){message.textContent=e.message;}
}
$kmVoice('#km-check-tts')?.addEventListener('click',loadKotobaVoices);
$kmVoice('#km-system-voice')?.addEventListener('change',e=>chrome.storage.local.set({kotobaVoiceName:e.target.value}));
$kmVoice('#km-voicevox-speaker')?.addEventListener('change',e=>chrome.storage.local.set({kotobaVoicevoxSpeaker:e.target.value===''?null:Number(e.target.value)}));
$kmVoice('#km-check-ai')?.addEventListener('click',async()=>{
  const status=$kmVoice('#km-ai-status');status.textContent='Connecting to Ollama…';
  try{
    const r=await chrome.runtime.sendMessage({type:'OLLAMA_MODELS'});
    if(!r?.ok)throw Error(r?.error||'No Ollama response. Start Ollama on 127.0.0.1:11434.');
    const select=$kmVoice('#km-ai-model');const prev=(await chrome.storage.local.get({kotobaAiModel:''})).kotobaAiModel;
    select.replaceChildren(new Option('Select a local model',''));
    for(const model of r.models)select.add(new Option(model,model));
    select.value=r.models.includes(prev)?prev:'';
    status.textContent=`${r.models.length} local models found. Choose one to enable Explain and Summarise.`;
  }catch(e){status.textContent=e.message;}
});
$kmVoice('#km-ai-model')?.addEventListener('change',e=>chrome.storage.local.set({kotobaAiModel:e.target.value}));
chrome.storage.local.get({kotobaAiModel:''}).then(({kotobaAiModel})=>{
  if(kotobaAiModel){const el=$kmVoice('#km-ai-model');el.add(new Option(kotobaAiModel,kotobaAiModel));el.value=kotobaAiModel;}
});

async function refreshPitchStatus(){
  const display=$('#km-pitch-manager-status');
  try{
    const response=await chrome.runtime.sendMessage({type:'PITCH_STATUS'});
    if(!response?.ok)throw Error(response?.error||'Cannot read pitch dictionary');
    display.textContent=response.full
      ? `✓ Full data ready · ${Number(response.terms||0).toLocaleString()} entries. Words with ambiguous patterns stay uncoloured.`
      : `⚠ Only ${response.terms||4} sample entries available. Install the full dictionary to colour more words. ${response.error||''}`;
    $('#km-install-pitch').textContent=response.full?'↻ Recheck / reinstall pitch data':'↓ Install full Kanjium dictionary';
  }catch(e){display.textContent='Pitch status unavailable: '+e.message;}
}
$('#km-install-pitch').addEventListener('click',async()=>{
  const button=$('#km-install-pitch'),status=$('#km-pitch-manager-status');
  button.disabled=true;status.textContent='Downloading and indexing the pitch dictionary…';
  try{
    const reply=await chrome.runtime.sendMessage({type:'PITCH_INSTALL'});
    if(!reply?.ok||!reply.full)throw Error(reply?.error||'Unable to download full pitch data');
    status.textContent=`✓ Full dictionary installed: ${Number(reply.terms||0).toLocaleString()} records. Refresh the video to recolour every word.`;
    button.textContent='✓ Installed';
  }catch(err){status.textContent='⚠ '+err.message+' · You can import accents.txt from transcript tools.';}
  finally{button.disabled=false;}
});
refreshPitchStatus();

// Open the full study dashboard in its own tab.
document.querySelector('#km-open-dashboard')?.addEventListener('click',()=>{
  chrome.tabs.create({url:chrome.runtime.getURL('dashboard.html')});
});
