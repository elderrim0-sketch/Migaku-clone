/* Kotoba Miner v2.0: Anki study sync, i+1 sentences, focused menu and furigana.
   Captions are read only when made available by the page or an imported file.
   Media capture only from player-exposed tracks; no DRM circumvention. */
(() => {
  if (document.getElementById('kotoba-root')) return;
  const U = globalThis.KMTranscript;
  const Icons = globalThis.KMIcons;
  const CueContext = globalThis.KMCueContext;
  if (!U) return;
  const isDemo = location.protocol === 'chrome-extension:' || Boolean(document.querySelector('#demo-caption'));
  const isYT = /(^|\.)youtube\.com$/i.test(location.hostname);
  const isNetflix = /(^|\.)netflix\.com$/i.test(location.hostname);
  const isGenericVideoSite = !isDemo && !isYT && !isNetflix;
  const site = isDemo ? 'demo' : location.hostname;
  const root = document.createElement('div');
  root.id = 'kotoba-root';
  root.innerHTML = `
    <button class="km-launcher" type="button" aria-label="Kotoba site controls" title="Kotoba controls · drag to move" aria-expanded="false" hidden>語<span class="km-indicator"></span></button>
    <div class="km-quickmenu km-study-menu" hidden role="dialog" aria-label="Kotoba study controls">
      <div class="km-menu-heading"><div class="km-menu-logo">語</div><div><strong>Kotoba Study</strong><small class="km-host">Focus on what you're watching</small></div><button type="button" class="km-menu-dismiss" aria-label="Close study controls"><i data-km-icon="x"></i></button></div>
      <div class="km-v22-menu-content">
        <div class="km-v22-switches">
          <button class="km-menu-item km-show-rail" type="button"><span><i data-km-icon="captions"></i><span class="km-v22-menu-copy"><strong>Transcript</strong><small>Show or hide the subtitle list</small></span></span><span class="km-plain-icon" data-km-icon="arrow-right"></span></button>
          <button class="km-menu-item km-coverage-toggle" type="button" aria-pressed="false"><span><i data-km-icon="chart"></i><span class="km-v22-menu-copy"><strong>Comprehension tracker</strong><small>Vocabulary coverage estimate</small></span></span><span class="km-coverage-value km-v22-switch">OFF</span></button>
        </div>
        <div class="km-v24-sync" role="group" aria-label="Subtitle timing adjustment">
          <div><strong><i data-km-icon="clock"></i> Subtitle timing</strong><small>Adjust when text appears · auto by default</small></div>
          <div class="km-v24-sync-controls"><button type="button" class="km-offset-earlier" aria-label="Subtitles 0.25 seconds earlier" title="Show subtitles earlier">−</button><output class="km-offset-value" aria-live="polite">Auto</output><button type="button" class="km-offset-later" aria-label="Subtitles 0.25 seconds later" title="Show subtitles later">+</button><button type="button" class="km-offset-reset" title="Return to automatic timing" aria-label="Reset subtitle timing">↺</button></div>
        </div>
        <div class="km-v22-theme-section">
          <div class="km-v22-section-label"><strong>Choose a theme</strong><span class="km-theme-current">Cotton Candy</span></div>
          <div class="km-menu-themes" role="group" aria-label="Kotoba appearance">
            <button data-theme-choice="cotton-candy" type="button" aria-label="Cotton Candy" title="Cotton Candy"><span class="km-v22-swatch" aria-hidden="true"></span><small>Cotton</small></button>
            <button data-theme-choice="matcha-cream" type="button" aria-label="Matcha Garden" title="Matcha Garden"><span class="km-v22-swatch" aria-hidden="true"></span><small>Matcha</small></button>
            <button data-theme-choice="sunset-pop" type="button" aria-label="Bubblegum Pop" title="Bubblegum Pop"><span class="km-v22-swatch" aria-hidden="true"></span><small>Pop</small></button>
            <button data-theme-choice="midnight-neon" type="button" aria-label="Midnight Neon" title="Midnight Neon"><span class="km-v22-swatch" aria-hidden="true"></span><small>Neon</small></button>
            <button data-theme-choice="black-gold" type="button" aria-label="Black & Gold" title="Black & Gold"><span class="km-v22-swatch" aria-hidden="true"></span><small>Gold</small></button>
            <button data-theme-choice="study-classic" type="button" aria-label="Immersion Classic" title="Immersion Classic"><span class="km-v22-swatch" aria-hidden="true"></span><small>Classic</small></button>
          </div>
        </div>
        <div class="km-v22-menu-links">
          <button class="km-menu-item km-studio-page" type="button"><span><i data-km-icon="library"></i><span class="km-v22-menu-copy"><strong>Kotoba Studio</strong><small>Words, reading & learning</small></span></span><span class="km-plain-icon" data-km-icon="arrow-right"></span></button>
          <button class="km-menu-item km-dashboard-page" type="button"><span><i data-km-icon="chart"></i><span class="km-v22-menu-copy"><strong>My dashboard</strong><small>Streaks and cards</small></span></span><span class="km-plain-icon" data-km-icon="arrow-right"></span></button>
          <button class="km-menu-item km-settings-page" type="button"><span><i data-km-icon="settings"></i><span class="km-v22-menu-copy"><strong>All settings</strong><small>Shortcuts, Anki and subtitles</small></span></span><span class="km-plain-icon" data-km-icon="arrow-right"></span></button>
        </div>
      </div>
      <div class="km-hidden-controls" hidden>
        <button class="km-menu-item km-site-toggle"><span class="km-site-toggle-label">Kotoba disabled</span><span class="km-switch">OFF</span></button>
        <button class="km-menu-item km-language-cycle"><span>Subtitle language</span><span class="km-language-label km-switch">日本語</span></button>
        <button class="km-menu-item km-original-toggle"><span>Hide original captions</span><span class="km-switch">ON</span></button>
        <button class="km-menu-item km-play-mode-cycle"><span class="km-play-mode-description">Free watch</span><span class="km-play-mode-label km-switch">PLAY</span></button>
        <button class="km-menu-item km-open-recs"><span>i+1</span></button>
        <button class="km-menu-item km-replay-now"><span>Replay</span></button>
        <button class="km-menu-item km-loop-now"><span>Loop</span><span class="km-loop-label km-switch">OFF</span></button>
        <button class="km-auto-jp"><span>Auto Japanese captions</span><span class="km-switch">ON</span></button>
        <button class="km-pause-hover"><span>Pause on hover</span><span class="km-switch">ON</span></button>
        <button class="km-video-toggle"><span>Show subs</span><span class="km-video-value">ON</span></button>
        <button class="km-pitch-toggle"><span>Pitch</span><span class="km-pitch-value">Always</span></button>
        <button class="km-translation-toggle"><span>Translation</span><span class="km-translation-value">OFF</span></button>
        <button class="km-test-speech"></button><button class="km-reset-position"></button>
        <div class="km-studio-mount"></div><div class="km-shortcut-live"></div>
      </div>
    </div>
    <div class="km-coverage" aria-label="Approximate vocabulary coverage" hidden>
      <div class="km-cloud-scene" aria-hidden="true"><div class="km-cloud-clouds km-cloud-back"></div><div class="km-cloud-clouds km-cloud-mid"></div><div class="km-cloud-clouds km-cloud-front"></div><span class="km-cloud-star star-one">✦</span><span class="km-cloud-star star-two">✧</span></div>
      <div class="km-coverage-head"><span><span class="km-coverage-sparkle" aria-hidden="true">✦</span> <strong class="km-unique">0</strong> words <span class="km-level">—</span> <span class="km-coverage-label">Comprehension estimate</span></span><strong class="km-coverage-percent">—</strong></div><div class="km-coverage-sub"><strong class="km-recommended">0</strong> recommended sentences · <span class="km-coverage-reliability">Waiting for transcript</span></div>
      <div class="km-coverage-meter"><div class="km-coverage-fill"></div></div>
      <div class="km-coverage-description">Load a Japanese transcript to estimate coverage</div>
    </div>
    <div class="km-video-subs" aria-label="Interactive Japanese subtitles" hidden>
      <div class="km-video-japanese"></div>
      <div class="km-video-translation" aria-live="polite" hidden></div>
    </div>
    <div class="km-floating-gloss" role="dialog" aria-label="Japanese word lookup" hidden></div><div class="km-voice-feedback" role="status" aria-live="polite" hidden></div>
    <div class="km-rail-cloud-frame" aria-hidden="true" hidden>
      <span class="km-rail-cloud-edge km-rail-cloud-top"></span>
      <span class="km-rail-cloud-edge km-rail-cloud-right"></span>
      <span class="km-rail-cloud-edge km-rail-cloud-bottom"></span>
      <span class="km-rail-cloud-edge km-rail-cloud-left"></span>
      <span class="km-rail-cloud-corner km-rail-cloud-tl"></span>
      <span class="km-rail-cloud-corner km-rail-cloud-tr"></span>
      <span class="km-rail-cloud-corner km-rail-cloud-br"></span>
      <span class="km-rail-cloud-corner km-rail-cloud-bl"></span>
      <span class="km-rail-cloud-sparkle km-sparkle-a">✦</span>
      <span class="km-rail-cloud-sparkle km-sparkle-b">✧</span>
    </div>
    <aside class="km-sidebar" aria-label="Kotoba Japanese transcript sidebar" hidden>
      <header class="km-head">
        <span class="km-brand">語</span>
        <span class="km-brand-copy"><strong>Kotoba Miner</strong><small>Japanese immersion · v2.4</small></span>
        <button class="km-icon-btn km-close" aria-label="Close transcript sidebar" title="Close sidebar"><i data-km-icon="x"></i></button>
      </header>
      
      <div class="km-rail-head">
        
        <div class="km-rail-title"><strong>Transcript</strong><span class="km-rail-actions"><span class="km-count">0 lines</span><button class="km-small-btn km-tools-toggle" type="button" aria-expanded="false" aria-controls="km-tools-panel" title="Transcript tools" aria-label="Transcript tools"><i data-km-icon="settings"></i></button></span></div>
        <div class="km-status" role="status" aria-live="polite" title="Subtitle source status">Looking for Japanese subtitles…</div>
        <div class="km-study-tabs" role="group" aria-label="Transcript view">
          <button class="km-tab-lines is-active" type="button" aria-pressed="true">All lines</button>
          <button class="km-tab-recs" type="button" aria-pressed="false"><i data-km-icon="target"></i> i+1 picks <span class="km-rec-count">0</span></button>
        </div>
        <div class="km-recommend-summary" hidden></div>
        <div class="km-filter-row">
          <button class="km-follow is-on" type="button" aria-pressed="true" title="Auto-follow video playback">◎ Follow</button>
          <span class="km-pitch-chip" title="Number of unique words with verified pitch-accent matches" hidden>Pitch —</span>
        </div>
        <div class="km-tools" id="km-tools-panel" role="region" aria-label="Transcript tools" hidden>
          <div class="km-tools-heading"><strong>Transcript tools</strong><button class="km-tools-close" type="button" title="Close transcript tools" aria-label="Close transcript tools"><i data-km-icon="x"></i></button></div>
          <input class="km-filter" placeholder="Search transcript" aria-label="Filter transcript" />
          <div class="km-control-row">
            <button class="km-small-btn km-read-yt" type="button" title="Read YouTube's visible transcript panel">↻ Read YouTube</button>
            <label class="km-small-btn km-file-label" title="Import a Japanese .srt or .vtt subtitle file">＋ Import SRT/VTT<input class="km-file" type="file" accept=".srt,.vtt,text/vtt,text/plain" hidden /></label>
          </div>
          <div class="km-pitch-legend"><span class="km-pitch-heiban">● Heiban</span><span class="km-pitch-atamadaka">● Atamadaka</span><span class="km-pitch-nakadaka">● Nakadaka</span><span class="km-pitch-odaka">● Odaka</span></div>
          <div class="km-pitch-status" role="status" aria-live="polite">Checking pitch dictionary…</div>
          <div class="km-tools-hint">Coloured words have a supported Tokyo accent pattern. Words with several valid accents are not guessed.</div>
          <button class="km-small-btn km-pitch-install" type="button">↓ Install / retry full pitch dictionary</button>
          <button class="km-small-btn km-ai-summary" type="button">✦ Summarise loaded transcript (local AI)</button>
          <label class="km-file-upload km-pitch-import">Import complete Kanjium accents.txt<input class="km-pitch-file" type="file" accept=".txt,text/plain" hidden></label>
          <div class="km-pitch-import-status" aria-live="polite">Source: Kanjium by Uros O. (CC BY-SA 4.0). If download fails, import accents.txt from the official GitHub repository.</div>
        </div>
      </div>
      <div class="km-ai-summary-result" hidden role="status" aria-live="polite"></div>
      <div class="km-list-wrap">
        <div class="km-list" role="list" aria-label="Clickable Japanese subtitle lines"></div>
        <div class="km-empty">Waiting for subtitles. Turn on Japanese CC or import a transcript.</div>
      </div>
      <div class="km-miner" hidden>
        <div class="km-miner-head"><strong><i data-km-icon="book-open"></i> Word explorer</strong><button class="km-icon-btn km-miner-close" type="button" aria-label="Close dictionary"><i data-km-icon="x"></i></button></div>
        <div class="km-miner-scroll">
          <div class="km-context"></div>
          <form class="km-search-row"><input class="km-query km-input" placeholder="Search 猫, ねこ, cat…" aria-label="Dictionary lookup" maxlength="80"/><button class="km-btn" type="submit">Search</button></form>
          <div class="km-results" aria-live="polite"></div>
          <div class="km-card-section" hidden>
            <div class="km-status-title" hidden>Learning status</div>
            <div class="km-learning-status" hidden role="group" aria-label="Vocabulary learning status">
              <button type="button" class="km-state" data-word-status="track">◎ Track</button>
              <button type="button" class="km-state" data-word-status="ignore">⊖ Ignore</button>
              <button type="button" class="km-state" data-word-status="learning">◉ Learning</button>
              <button type="button" class="km-state" data-word-status="unknown">? Unknown</button>
              <button type="button" class="km-state" data-word-status="known">✓ Known</button>
            </div>
            <div class="km-actionbar"><button class="km-btn km-open-card" type="button"><i data-km-icon="plus"></i> Create Anki card</button><button class="km-btn km-known-toggle" type="button" hidden>Mark word known</button></div>
            
            <div class="km-card-creator" hidden>
              <div class="km-creator-title"><strong><i data-km-icon="layers"></i> Make a flashcard</strong><div class="km-creator-top-actions"><button class="km-btn km-generate-all" type="button">Generate all</button><button class="km-icon-btn km-close-card" type="button" aria-label="Close card creator">×</button></div></div>
              <div class="km-creator-intro">A little memory from what you watched. Edit anything before saving.</div>
              <div class="km-creator-grid">
                <label>Word<input class="km-field-word" placeholder="Japanese word"></label>
                <label>Reading<input class="km-field-reading" placeholder="Kana reading"></label>
              </div>
              <label>Generated English meaning<textarea class="km-textarea" id="km-definition" spellcheck="false" placeholder="Generated from the most common dictionary meaning"></textarea></label>
              <div class="km-text-fields"><label>Original sentence<textarea class="km-field-sentence" rows="2" spellcheck="false" placeholder="Subtitle sentence"></textarea></label>
              <label>English sentence translation<textarea class="km-field-translation" rows="2" placeholder="Generate to add translation"></textarea></label></div>
              <div class="km-creator-hotkey"><div><strong>One-key Anki card</strong><small>Press Q to create an Anki card with a screenshot, accessible sentence audio, and generated fields; the optional recording button below still captures full scenes.</small></div><kbd class="km-record-shortcut">Q</kbd><button type="button" class="km-btn km-quick-save">Quick create</button></div>
              <details class="km-media-disclosure"><summary><span><strong>Media attachments</strong><small>Screenshot · source audio · video (manual) · word audio</small></span><span class="km-media-chevron">⌄</span></summary>
              <button type="button" class="km-btn km-record-scene">● Record source scene (optional)</button><div class="km-media-grid">
                <div class="km-media-tile"><strong>Scene screenshot</strong><div class="km-scene-preview">No screenshot yet</div><button type="button" class="km-btn km-grab-frame">Capture current frame</button><label class="km-file-upload">Upload screenshot<input type="file" class="km-upload-image" accept="image/png,image/jpeg,image/webp" hidden></label></div>
                <div class="km-media-tile"><strong>Original video clip</strong><div class="km-clip-state km-media-status">Not recorded</div><video class="km-clip-preview" controls playsinline hidden></video><label class="km-file-upload">Upload video clip<input type="file" class="km-upload-clip" accept="video/webm,video/mp4" hidden></label><small class="km-media-hint">Attached as an optional video in the back of your Anki card. Playback support varies by Anki device.</small></div>
                <div class="km-media-tile"><strong>Original sentence audio</strong><div class="km-audio-state km-media-status">No source recording</div><audio class="km-source-audio" controls hidden></audio><label class="km-file-upload">Upload original audio<input type="file" class="km-upload-audio" accept="audio/*" hidden></label><small class="km-media-hint">Real voices and sounds from the selected scene. Separate from synthesized pronunciation.</small></div>
                <div class="km-media-tile"><strong>Generated Japanese word audio</strong><div class="km-word-audio-state km-media-status">No generated audio attached</div><audio class="km-word-audio-player" controls hidden></audio><div class="km-tts-actions"><button type="button" class="km-btn km-generate-voice">Generate WAV</button><button type="button" class="km-btn km-word-voice">Play Japanese</button></div><label class="km-file-upload">Upload native word recording<input class="km-upload-word-audio" type="file" accept="audio/*" hidden></label><small class="km-media-hint">Generate and attach with free local VOICEVOX; Play Japanese uses your browser voice when VOICEVOX is unavailable.</small></div>
              </div>
              <div class="km-media-warning">Capture is supported only when the video exposes ordinary browser media tracks. DRM-protected streams may block recording. Downloadable word audio requires a local VOICEVOX engine.</div></details>
              <div class="km-creator-actions"><button class="km-btn km-generate" type="button">Refresh fields</button><button class="km-btn km-clear-media" type="button">Clear media</button></div>
              <label class="km-edit-label" for="km-deck">Choose destination Anki deck</label>
              <div class="km-deck-row"><select class="km-deck" id="km-deck" aria-label="Anki destination deck" disabled><option value="">Open Anki to load decks…</option></select><button class="km-btn km-refresh-decks" type="button" title="Refresh decks">↻</button></div>
              <div class="km-notice km-deck-notice" role="status">Open Anki Desktop to load decks.</div>
              <button class="km-btn km-save" type="button" disabled>Select an Anki deck to save</button>
              <div class="km-notice km-save-notice" role="status" aria-live="polite"></div>

            </div>
          </div>
        </div>
      </div>
      <footer class="km-footer"><button class="km-open-dict" type="button"><i data-km-icon="book-open"></i> Open dictionary</button></footer>
    </aside>`;
  document.documentElement.appendChild(root);
  Icons?.hydrate(root);
  const $ = selector => root.querySelector(selector);
  // Move studio outside the dock stacking context so video and coverage never obscure it.
  root.appendChild($('.km-card-creator'));
  // Dictionary floats independently of the sidebar and is draggable.
  root.appendChild($('.km-miner'));
  const sidebar = $('.km-sidebar');
  const launcher = $('.km-launcher');
  const menu = $('.km-quickmenu');
  const deckSelect = $('.km-deck');
  $('.km-host').textContent = site;
  const wordParser = globalThis.KMWordParser;
  const learningEngine=globalThis.KMLearning;
  const subtitleSettings = globalThis.KMSubtitleStyle;
  const subtitleModes = globalThis.KMSubtitleModes;
  let subtitleStyle=subtitleSettings.normalize();
  let styleSaveTimer=null;
  const studioMount=$('.km-studio-mount');
  studioMount.innerHTML=subtitleSettings.markup();
  let masterEnabled = true;
  let siteEnabled = false;
  let railOpen = true;
  let follow = true; // Playback always follows the current subtitle. The legacy button is hidden.
  let previousVideoId = '';
  let cues = [];
  let cueSource = '';
  let active = -1;
  let filter = '';
  let lastCaption = '';
  let trackedCaptions = [];
  let lastTrackError = '';
  let lookupId = 0;
  let deckLoadId = 0;
  let candidates = [];
  let candidateIndex = 0;
  let selected = '';
  let lastMiningTarget = null;
  let quickSaveBusy = false;
  // null uses intelligent defaults (350ms later for live DOM captions, 0ms for timed tracks).
  let subtitleOffsetMs = null;
  const offsetForSource=()=>subtitleOffsetMs===null?(cueSource==='Live capture'?350:0):subtitleOffsetMs;
  function offsetLabel(){return subtitleOffsetMs===null?'Auto':(subtitleOffsetMs>0?'+':'')+(subtitleOffsetMs/1000).toFixed(2)+'s';}
  function applyOffset(){
    $('.km-offset-value').textContent=offsetLabel();
    syncActive(true);renderVideoSubtitle();
  }
  async function changeOffset(delta){
    const base=subtitleOffsetMs===null?offsetForSource():subtitleOffsetMs;
    subtitleOffsetMs=Math.max(-2500,Math.min(2500,base+delta));
    applyOffset();await chrome.storage.local.set({kotobaSubtitleOffsetMs:subtitleOffsetMs});
  }
  $('.km-offset-earlier').addEventListener('click',()=>changeOffset(-250));
  $('.km-offset-later').addEventListener('click',()=>changeOffset(250));
  $('.km-offset-reset').addEventListener('click',()=>{subtitleOffsetMs=null;applyOffset();chrome.storage.local.set({kotobaSubtitleOffsetMs:null});});
  let context = null;
  let currentTrackRequest = 0;
  let lastRequestedKey = '';
  let lastAutoScroll = 0;
  let manualScrollUntil = 0;
  let loadingTrack = false;
  function renderSubtitleExample() {
    const preview=$('.km-style-example');
    if(!preview)return;
    const jp=$('.km-style-example-jp'), en=$('.km-style-example-en');
    jp.style.cssText=`font-family:${subtitleFont(subtitleStyle.targetFont)};font-size:${Math.round(subtitleStyle.targetSize*.6)}px;font-weight:${subtitleStyle.targetWeight};line-height:${subtitleStyle.targetLineHeight};letter-spacing:${subtitleStyle.targetSpacing}px;color:${subtitleStyle.targetColor};-webkit-text-stroke:${subtitleStyle.targetOutline==='uniform'?subtitleStyle.targetOutlineWidth*.45:0}px #10101d;paint-order:stroke fill;text-shadow:${subtitleStyle.targetOutline==='shadow'?'0 2px 8px #000,0 1px 2px #000':''}`;
    preview.style.background=subtitleStyle.targetBackground?`rgba(13,14,27,${subtitleStyle.targetOpacity/100})`:'transparent';
    en.style.fontSize=Math.max(11,Math.round(subtitleStyle.secondarySize*.82))+'px';
    en.style.color=subtitleStyle.secondaryColor;en.hidden=subtitleStyle.secondaryMode==='off';
  }
  function subtitleFont(key) {
    const fonts={rounded:'"Hiragino Maru Gothic ProN", "Yu Gothic UI", "Meiryo", "Noto Sans JP", sans-serif',gothic:'"Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif',serif:'"Noto Serif JP", "Yu Mincho", "Hiragino Mincho ProN", serif',mono:'"Noto Sans Mono CJK JP", "MS Gothic", monospace'};
    return fonts[key]||fonts.rounded;
  }
  function applySubtitleStyle() {
    const s=subtitleStyle, parent=$('.km-video-subs');
    parent.style.setProperty('--km-sub-font',subtitleFont(s.targetFont));
    parent.style.setProperty('--km-sub-size',s.targetSize+'px');
    parent.style.setProperty('--km-sub-weight',String(s.targetWeight));
    parent.style.setProperty('--km-sub-color',s.targetColor);
    parent.style.setProperty('--km-sub-line-height',String(s.targetLineHeight));
    parent.style.setProperty('--km-sub-spacing',s.targetSpacing+'px');
    parent.style.setProperty('--km-sub-stroke',s.targetOutline==='uniform'?s.targetOutlineWidth+'px':'0px');
    parent.style.setProperty('--km-sub-shadow',s.targetOutline==='shadow'?'0 2px 6px #05030cf0,0 0 16px #000':'none');
    parent.style.setProperty('--km-sub-bg',s.targetBackground?`rgba(8,10,20,${s.targetOpacity/100})`:'transparent');
    parent.style.setProperty('background',s.targetBackground?`rgba(8,10,20,${s.targetOpacity/100})`:'transparent','important');
    parent.style.setProperty('--km-secondary-size',s.secondarySize+'px');
    parent.style.setProperty('--km-secondary-color',s.secondaryColor);
    parent.style.setProperty('--km-secondary-bg',s.secondaryBackground?`rgba(8,10,20,${s.secondaryOpacity/100})`:'transparent');
    $('.km-video-translation').style.setProperty('background',s.secondaryBackground?`rgba(8,10,20,${s.secondaryOpacity/100})`:'transparent','important');
    parent.dataset.outline=s.targetOutline;parent.dataset.background=String(s.targetBackground);
    renderSubtitleExample();
    if(s.secondaryMode==='off')$('.km-video-translation').hidden=true;
  }
  function syncStudioInputs() {
    root.querySelectorAll('[data-km-style-key]').forEach(el=>{
      const key=el.dataset.kmStyleKey;
      if(el.type==='checkbox')el.checked=!!subtitleStyle[key];else el.value=String(subtitleStyle[key]);
      const out=root.querySelector(`[data-km-output="${key}"]`);
      if(out)out.textContent=String(subtitleStyle[key])+(key==='targetLineHeight'?'×':key==='targetSize'||key==='targetOutlineWidth'||key==='secondarySize'||key==='targetSpacing'?'px':key==='targetOpacity'||key==='targetPosition'||key==='targetWidth'||key==='secondaryOpacity'?'%':'');
    });
    applySubtitleStyle();
  }
  root.querySelectorAll('[data-km-style-key]').forEach(el=>el.addEventListener('input',()=>{
    const key=el.dataset.kmStyleKey; const next={...subtitleStyle,[key]:el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value};
    subtitleStyle=subtitleSettings.normalize(next);
    syncStudioInputs();
    updateDisplay();
    if(subtitleStyle.secondaryMode==='always')showAlwaysSubtitleTranslation();
    clearTimeout(styleSaveTimer);styleSaveTimer=setTimeout(()=>chrome.storage.local.set({kotobaSubtitleStyle:subtitleStyle}),220);
  }));
  root.querySelectorAll('.km-studio-tab').forEach(button=>button.addEventListener('click',()=>{
    const tab=button.dataset.kmTab;
    root.querySelectorAll('.km-studio-tab').forEach(b=>b.classList.toggle('is-active',b===button));
    root.querySelectorAll('[data-km-panel]').forEach(panel=>panel.hidden=panel.dataset.kmPanel!==tab);
  }));
  $('.km-studio-reset').addEventListener('click',async()=>{subtitleStyle=subtitleSettings.normalize();syncStudioInputs();await chrome.storage.local.set({kotobaSubtitleStyle:subtitleStyle});});
  syncStudioInputs();

  let onVideoEnabled = true;
  let coverageEnabled = false;
  let pitchMode = 'always';
  let sentenceTranslation = false;
  let subtitleLanguageMode='ja';
  let englishCues=[];
  let englishSource='';
  let lastEnglishTrack=null;
  let lastEnglishTrackSignature='';
  let englishLastRequestKey='';
  let englishRequestSerial=0;
  let displayedEnglishText='';
  let autoJapaneseSubtitles = true;
  let pauseOnHover = true;
  let dictionaryPositions = {};
  let dictionaryPosition = null;
  let hoverPausedVideo = false;
  let jpAutoRequestedFor = '';
  let lastCaptionFallback = '';
  let lastSelectedTrack = null;
  const THEMES = Object.freeze({
    'cotton-candy':'Cotton Candy',
    'matcha-cream':'Matcha Garden',
    'sunset-pop':'Bubblegum Pop',
    'midnight-neon':'Midnight Neon',
    'black-gold':'Black & Gold',
    'study-classic':'Immersion Classic'
  });
  let theme = 'cotton-candy';
  let launcherPositions = {};
  let customLauncherPosition = null; // Normalised to the visible viewport, by site.
  let draggingLauncher = false;
  let suppressLauncherClick = false;
  function applyTheme(next) {
    theme = Object.hasOwn(THEMES, next) ? next : 'cotton-candy';
    root.dataset.theme = theme;
    if (isDemo) document.documentElement.dataset.kmTheme = theme;
    $('.km-theme-current').textContent = THEMES[theme];
    root.querySelectorAll('[data-theme-choice]').forEach(button => {
      const selected = button.dataset.themeChoice === theme;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-selected', selected);
    });
  }
  root.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', async () => {
    applyTheme(button.dataset.themeChoice);
    await chrome.storage.local.set({ kotobaTheme: theme });
  }));
  let knownWords = new Set();
  let ankiVocabularyKnown=new Set();
  let ankiVocabularyLearning=new Set();
  let combinedKnownWords=new Set();
  function refreshCombinedKnown(){combinedKnownWords=new Set([...knownWords,...ankiVocabularyKnown]);}
  let analysis=null;
  let transcriptView='all';
  let furiganaMode='unknown';
  let sentenceLoop=false;let sentenceAutoPause=false;let playMode='normal';let loopCueStart=null;let lastPlaybackCueStart=null;
  let wordStatuses = {};
  let capturedImage=null;
  let capturedAudio=null;
  let capturedWordAudio=null;
  let capturedClip=null;
  let capturedCueStart=null;
  let captureBusy=false;
  let autoGenerateWordAudio=true;
  const KMKeys=globalThis.KMShortcuts;
  let hotkeys={...KMKeys.DEFAULTS};
  function redrawShortcuts() {
    const grid=$('.km-shortcut-live');grid.replaceChildren();
    Object.entries(KMKeys.LABELS).forEach(([key,label])=>{
      const left=document.createElement('span');left.textContent=label;
      const right=document.createElement('kbd');right.textContent=KMKeys.format(hotkeys[key]);
      grid.append(left,right);
    });
    $('.km-record-shortcut').textContent=KMKeys.format(hotkeys.capture);
  }
  redrawShortcuts();
  const pitchCache = new Map();
  const pitchApprox = new Set();
  let pitchDatasetIsFull=false;
  let pitchRequestId = 0;
  let pitchLoading=false;
  let hideOriginalCaptions=true;
  const suppressedLocalTracks=new Set();
  let lastOriginalCaptionCommand={frameId:null,hidden:null,at:0};
  function syncOriginalCaptions(){
    const hidden=!!(isGenericVideoSite&&hideOriginalCaptions&&displayEnabled()&&onVideoEnabled);
    document.documentElement.classList.toggle('km-hide-original-captions',hidden);
    const control=$('.km-original-toggle');
    control.hidden=!isGenericVideoSite;
    control.setAttribute('aria-pressed',String(hidden));
    control.querySelector('.km-switch').textContent=hidden?'ON':'OFF';
    if(embeddedCurrent() && (lastOriginalCaptionCommand.frameId!==embeddedPlayer.frameId ||
        lastOriginalCaptionCommand.hidden!==hidden)){
      lastOriginalCaptionCommand={frameId:embeddedPlayer.frameId,hidden,at:Date.now()};
      chrome.runtime.sendMessage({type:'KOTOBA_FRAME_CONTROL',action:'original-captions',hidden}).catch(()=>{});
    }
    // HTML5 tracks remain readable in hidden mode. Only restore ones Kotoba
    // actually changed so the site's own caption preferences are respected.
    if(isGenericVideoSite){
      const v=video();
      if(hidden){
        for(const track of [...(v?.textTracks||[])]){
          if(globalThis.KMUniversalSubtitle?.japaneseTrack(track)&&track.mode==='showing'){
            try{track.mode='hidden';suppressedLocalTracks.add(track);}catch{}
          }
        }
      }else{
        for(const track of suppressedLocalTracks){
          try{if(track.mode==='hidden')track.mode='showing';}catch{}
        }
        suppressedLocalTracks.clear();
      }
    }
  }
  $('.km-original-toggle').addEventListener('click',()=>{
    hideOriginalCaptions=!hideOriginalCaptions;
    syncOriginalCaptions();
    chrome.storage.local.set({kotobaHideOriginalCaptions:hideOriginalCaptions});
  });
  let shownVideoText = '';
  let hoverSerial = 0;
  let translationSerial = 0;
  const subtitleTranslateCache=new Map();
  let alwaysTranslateInFlight='';
  let hoverTranslationVisible=false;
  const translationRetryAfter=new Map();
  const demoTranslations = new Map([
    ['今日はいい天気ですね。','The weather is nice today, isn’t it?'],
    ['私は日本語を勉強しています。','I’m studying Japanese.'],
    ['この映画はとても面白いです。','This movie is really interesting.'],
    ['猫は家族と一緒に寝ています。','The cat sleeps with the family.'],
    ['明日、友達と学校へ行きます。','I’ll go to school with my friend tomorrow.']
  ]);


  // Some sites put the entire player (including Japanese CC) in another origin's
  // iframe. The frame bridge sends exposed subtitle cues into this top-page UI.
  let embeddedPlayer={video:false,time:0,paused:true,text:'',englishText:'',updated:0,frameId:null,frameHost:''};
  function embeddedCurrent(){return embeddedPlayer.video && Date.now()-embeddedPlayer.updated<4500;}
  function controlEmbedded(action,seconds){
    if(!embeddedCurrent())return;
    chrome.runtime.sendMessage({type:'KOTOBA_FRAME_CONTROL',action,seconds}).catch(()=>{});
  }
  function video() { return (isGenericVideoSite && globalThis.KMUniversalSubtitle?.visibleVideo(document)) || document.querySelector('video'); }
  function demoSeconds() { return isDemo ? Number(window.__kotobaDemoTime || 0) : Number((isGenericVideoSite && embeddedCurrent() ? embeddedPlayer.time : video()?.currentTime) || 0); }
  function onWatchPage() { return isDemo || (isYT && location.pathname === '/watch') || (isNetflix && /^\/watch\//.test(location.pathname)) || (isGenericVideoSite && (!!video() || embeddedCurrent())); }
  function timestampUrl(sec) {
    if (!isYT && !isGenericVideoSite && !isNetflix) return '';
    try { const url = new URL(location.href); if (isYT) url.searchParams.set('t', Math.floor(sec) + 's'); return url.href; }
    catch { return ''; }
  }
  const KM_PLAY_MODES=['normal','focus','audio-first','step'];
  const KM_PLAY_LABELS={normal:'Free watch',focus:'New-word focus','audio-first':'Listen first',step:'Sentence steps'};
  function setPlayMode(mode){
    playMode=KM_PLAY_MODES.includes(mode)?mode:'normal';
    root.dataset.kmPlayMode=playMode;
    const desc=$('.km-play-mode-description'),label=$('.km-play-mode-label');
    if(desc)desc.textContent=KM_PLAY_LABELS[playMode];
    if(label)label.textContent=playMode==='normal'?'PLAY':playMode==='focus'?'FOCUS':playMode==='step'?'STEP':'LISTEN';
    renderPlayModeVisual();
  }
  function renderPlayModeVisual(){
    const player=video();
    const activeEmbed=isGenericVideoSite && embeddedCurrent();
    const playing=activeEmbed?!embeddedPlayer.paused:!!(player&&!player.paused);
    root.dataset.kmPlaying=String(playing);
    const cue=currentCue();
    const index=cue?cues.findIndex(c=>c.start===cue.start):-1;
    const line=index>=0?analysis?.lines?.[index]:null;
    root.dataset.kmFocusHidden=String(playMode==='focus' && line?.kind==='comfortable');
  }
  function displayEnabled() { return masterEnabled && siteEnabled && onWatchPage(); }
  function updateDisplay() {
    const showLauncher = masterEnabled && siteEnabled && onWatchPage();
    launcher.hidden = !showLauncher;
    launcher.classList.toggle('is-disabled', !siteEnabled);
    $('.km-indicator').textContent = siteEnabled ? '•' : '×';
    $('.km-site-toggle').setAttribute('aria-pressed', String(siteEnabled));
    $('.km-site-toggle-label').textContent = siteEnabled ? 'Kotoba enabled' : 'Kotoba disabled';
    $('.km-site-toggle .km-switch').textContent = siteEnabled ? 'ON' : 'OFF';
    $('.km-auto-jp').setAttribute('aria-pressed', String(autoJapaneseSubtitles));
    $('.km-auto-jp .km-switch').textContent = autoJapaneseSubtitles ? 'ON' : 'OFF';
    $('.km-pause-hover').setAttribute('aria-pressed', String(pauseOnHover));
    $('.km-pause-hover .km-switch').textContent = pauseOnHover ? 'ON' : 'OFF';
    $('.km-show-rail').disabled = !siteEnabled;
    $('.km-show-rail .km-v22-menu-copy strong').textContent = railOpen ? 'Hide transcript' : 'Show transcript';
    sidebar.hidden = !(displayEnabled() && railOpen);
    $('.km-rail-cloud-frame').hidden = sidebar.hidden;
    $('.km-video-value').textContent=onVideoEnabled?'ON':'OFF';
    $('.km-coverage-value').textContent=coverageEnabled?'ON':'OFF';
    $('.km-coverage-toggle').setAttribute('aria-pressed',String(coverageEnabled));
    $('.km-pitch-value').textContent=({always:'Always',hover:'Hover',off:'OFF'})[pitchMode] || 'Always';
    $('.km-translation-value').textContent=sentenceTranslation?'ON':'OFF';
    $('.km-language-label').textContent=({ja:'日本語',dual:'JP + EN',en:'English'})[subtitleLanguageMode];
    for(const key of ['video','coverage','translation']) {
      const v=$(`.km-${key}-value`); if(v) v.dataset.off=v.textContent==='OFF'?'true':'false';
    }
    const hasRenderedLanguage=(subtitleLanguageMode==='en')?Boolean(displayedEnglishText):Boolean(shownVideoText);
    $('.km-video-subs').hidden=!(displayEnabled() && onVideoEnabled && hasRenderedLanguage);
    $('.km-coverage').hidden=!(displayEnabled() && coverageEnabled);
    document.documentElement.classList.toggle('km-captions-active',displayEnabled() && onVideoEnabled && (hasRenderedLanguage || (subtitleLanguageMode==='en' && !!shownVideoText)));
    syncOriginalCaptions();
    root.dataset.pitchMode=pitchMode;

    if (sidebar.hidden) document.documentElement.classList.remove('km-docked');
    else document.documentElement.classList.add('km-docked');
    if (!showLauncher) {
      menu.hidden = true;
      $('.km-floating-gloss').hidden = true;
      $('.km-miner').hidden = true;
      $('.km-card-creator').hidden = true;
    }
    placeLauncher();
  }
  async function saveSite(enabled) {
    const settings = await chrome.storage.local.get({siteEnabledV3:{}});
    const sites = settings.siteEnabledV3 && typeof settings.siteEnabledV3 === 'object' ? settings.siteEnabledV3 : {};
    sites[site] = enabled;
    await chrome.storage.local.set({siteEnabledV3: sites});
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function placeLauncher() {
    if (launcher.hidden) return;
    const embeddedFrame=isGenericVideoSite && embeddedCurrent()
      ? globalThis.KMVideoLayout.embeddedPlayerFrame(document,{
          host:embeddedPlayer.frameHost,viewport:{width:innerWidth,height:innerHeight}
        }) : null;
    // A host page can also contain a small ad <video>; it must not displace
    // the approved caption-producing iframe from the subtitle anchor.
    const vid=embeddedFrame?null:video();
    // For remote videos the visible iframe is the player. A generic `.player`
    // element on the host page might be unrelated to the actual video.
    const player=embeddedFrame || document.querySelector('.html5-video-player, #movie_player, .player') || vid;
    const rect = player?.getBoundingClientRect();
    const width = window.innerWidth;
    if (customLauncherPosition) {
      launcher.style.left = `${clamp(customLauncherPosition.x, 0, 1) * Math.max(0, width - launcher.offsetWidth - 8) + 4}px`;
      launcher.style.top = `${clamp(customLauncherPosition.y, 0, 1) * Math.max(0, window.innerHeight - launcher.offsetHeight - 8) + 4}px`;
    } else if (rect && rect.width > 100 && rect.bottom > 50 && rect.top < window.innerHeight) {
      launcher.style.left = `${Math.min(width - 55, Math.max(10, rect.right - 56))}px`;
      launcher.style.top = `${Math.max(8, rect.top + (coverageEnabled ? 91 : 13))}px`;
    } else {
      launcher.style.left = `${Math.max(8, width - (sidebar.hidden ? 66 : 439))}px`;
      launcher.style.top = '76px';
    }
    // Centre captions within the *visible video picture*, not the viewport or a
    // potentially obscured player. Sidebars, third-party overlays and letterboxes
    // shouldn't move the sentence away from the video the learner can actually see.
    const subtitles=$('.km-video-subs');
    const coverage=$('.km-coverage');
    const picture=globalThis.KMVideoLayout.visiblePicture({
      video:vid,
      player,
      sidebar:sidebar.hidden?null:sidebar,
      viewport:{width:window.innerWidth,height:window.innerHeight},
      elementFromPoint:(x,y)=>document.elementFromPoint(x,y)
    });
    if (picture) {
      const maxWidth=Math.max(120,Math.min(picture.width*(subtitleStyle.targetWidth/100),1050));
      const center=picture.left+picture.width/2;
      subtitles.style.left=center+'px';
      subtitles.style.bottom=Math.max(14,window.innerHeight-picture.bottom+picture.height*(subtitleStyle.targetPosition/100))+'px';
      subtitles.style.width='max-content';
      subtitles.style.maxWidth=maxWidth+'px';
      subtitles.dataset.centered='true';
      const barLeft=Math.max(8,picture.left+Math.min(12,picture.width*.03));
      const coverageWidth=Math.max(206, Math.min(358, Math.round(picture.width*0.46)));
      coverage.style.left='0px';
      coverage.style.top='0px';
      coverage.style.width=window.innerWidth+'px';
    } else if (isDemo && rect && rect.width > 100) {
      // The demo is a painted mock player rather than a <video>. Keep its
      // interactive subtitles and coverage anchored inside that mock player.
      subtitles.style.left=(rect.left+rect.width/2)+'px';
      subtitles.style.bottom=Math.max(14,window.innerHeight-rect.bottom+rect.height*.12)+'px';
      subtitles.style.width='max-content';
      subtitles.style.maxWidth=Math.max(180,rect.width*.86)+'px';
      const demoWidth=Math.min(358,Math.max(206,rect.width*.46));
      coverage.style.left='0px';
      coverage.style.top='0px';
      coverage.style.width=window.innerWidth+'px';
    } else if (isGenericVideoSite && embeddedCurrent()) {
      // The embedded frame can disappear briefly during a player reload.
      // Don't let an unpositioned fixed element jump to page (0,0).
      const visibleRight=sidebar.hidden?window.innerWidth:Math.min(window.innerWidth,sidebar.getBoundingClientRect().left-12);
      subtitles.style.left=Math.max(100,visibleRight/2)+'px';
      subtitles.style.bottom=Math.max(20,Math.round(window.innerHeight*.19))+'px';
      subtitles.style.maxWidth=Math.max(180,Math.round(visibleRight*.80))+'px';
      subtitles.style.width='max-content';
      subtitles.dataset.centered='fallback';
    }
    coverage.style.left='0px';coverage.style.top='0px';coverage.style.width=window.innerWidth+'px';
    if (!menu.hidden) {
      const b = launcher.getBoundingClientRect();
      menu.style.left = `${clamp(b.left - 6, 8, Math.max(8, width - (menu.offsetWidth || 302) - 8))}px`;
      menu.style.top = `${b.bottom + 10 + Math.max(0, Math.min(0, window.innerHeight - (b.bottom + 10 + menu.offsetHeight + 12)))}px`;
      if (b.bottom + 12 + menu.offsetHeight > innerHeight && b.top > menu.offsetHeight + 12) menu.style.top = `${b.top - menu.offsetHeight - 10}px`;
      if (b.bottom + 12 + menu.offsetHeight > innerHeight && b.top <= menu.offsetHeight + 12) menu.style.top = '8px';
      menu.style.top = clamp(parseFloat(menu.style.top)||8,8,Math.max(8,innerHeight-menu.offsetHeight-8))+'px';
    }
  }
  const cloudRail=$('.km-rail-cloud-frame');
  let lastRailMove=0;
  sidebar.addEventListener('pointermove', event => {
    if(theme!=='cotton-candy' || cloudRail.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(performance.now()-lastRailMove<35)return;
    lastRailMove=performance.now();
    const rect=sidebar.getBoundingClientRect();
    const x=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*9;
    const y=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*9;
    cloudRail.style.setProperty('--km-rail-parallax-x',x.toFixed(2)+'px');
    cloudRail.style.setProperty('--km-rail-parallax-y',y.toFixed(2)+'px');
  });
  sidebar.addEventListener('pointerleave',()=>{
    cloudRail.style.removeProperty('--km-rail-parallax-x');
    cloudRail.style.removeProperty('--km-rail-parallax-y');
  });
  const cloudPanel=$('.km-coverage');
  cloudPanel.addEventListener('pointermove',event=>{
    if(theme!=='cotton-candy')return;
    const r=cloudPanel.getBoundingClientRect();
    const x=(event.clientX-r.left)/Math.max(1,r.width)-.5;
    const y=(event.clientY-r.top)/Math.max(1,r.height)-.5;
    cloudPanel.style.setProperty('--km-cloud-x',(x*12).toFixed(2)+'px');
    cloudPanel.style.setProperty('--km-cloud-y',(y*12).toFixed(2)+'px');
    cloudPanel.style.setProperty('--km-cloud-rotate-x',(-y*3).toFixed(2)+'deg');
    cloudPanel.style.setProperty('--km-cloud-rotate-y',(x*4).toFixed(2)+'deg');
  });
  cloudPanel.addEventListener('pointerleave',()=>{
    ['--km-cloud-x','--km-cloud-y','--km-cloud-rotate-x','--km-cloud-rotate-y'].forEach(k=>cloudPanel.style.removeProperty(k));
  });

  // Pointer Events work with a mouse, stylus, or touch. A drag never activates the button.
  // Position is saved by hostname; a new video on the same site keeps the chosen placement.
  let dragStart = null;
  launcher.addEventListener('pointerdown', event => {
    if (event.button !== 0 || launcher.hidden) return;
    dragStart = {pointerId:event.pointerId, clientX:event.clientX, clientY:event.clientY,
      left:launcher.getBoundingClientRect().left, top:launcher.getBoundingClientRect().top, moved:false};
    launcher.setPointerCapture(event.pointerId);
  });
  launcher.addEventListener('pointermove', event => {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;
    const dx = event.clientX - dragStart.clientX, dy = event.clientY - dragStart.clientY;
    if (!dragStart.moved && Math.hypot(dx,dy) < 5) return;
    dragStart.moved = true;
    draggingLauncher = true;
    menu.hidden = true;
    launcher.setAttribute('aria-expanded','false');
    const maxX = Math.max(1, innerWidth - launcher.offsetWidth - 8);
    const maxY = Math.max(1, innerHeight - launcher.offsetHeight - 8);
    const px = clamp(dragStart.left + dx, 4, maxX + 4);
    const py = clamp(dragStart.top + dy, 4, maxY + 4);
    customLauncherPosition = {x:(px-4)/maxX, y:(py-4)/maxY};
    placeLauncher();
  });
  async function finishLauncherDrag(event) {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;
    const moved = dragStart.moved;
    dragStart = null;
    draggingLauncher = false;
    if (launcher.hasPointerCapture(event.pointerId)) launcher.releasePointerCapture(event.pointerId);
    if (!moved) return;
    suppressLauncherClick = true;
    // Consume the next synthesized click after dragging; keyboard activation still works.
    setTimeout(() => { suppressLauncherClick = false; }, 250);
    launcherPositions[site] = customLauncherPosition;
    await chrome.storage.local.set({kotobaLauncherPositions: launcherPositions});
  }
  launcher.addEventListener('pointerup',finishLauncherDrag);
  launcher.addEventListener('pointercancel',finishLauncherDrag);
  launcher.addEventListener('click', () => {
    if (suppressLauncherClick || draggingLauncher) return;
    menu.hidden = !menu.hidden; launcher.setAttribute('aria-expanded',String(!menu.hidden));placeLauncher();
  });
  $('.km-reset-position').addEventListener('click', async () => {
    delete launcherPositions[site]; customLauncherPosition=null; menu.hidden=true;
    await chrome.storage.local.set({kotobaLauncherPositions: launcherPositions});
    placeLauncher();
  });
  function setTranscriptToolsOpen(open) {
    const tools=$('.km-tools');
    tools.hidden=!open;
    $('.km-tools-toggle').setAttribute('aria-expanded',String(open));
    $('.km-tools-toggle').classList.toggle('is-on',open);
  }
  $('.km-tools-toggle').addEventListener('click', () => setTranscriptToolsOpen($('.km-tools').hidden));
  function switchTranscriptView(view){
    transcriptView=view==='recommendations'?'recommendations':'all';
    $('.km-tab-lines').classList.toggle('is-active',transcriptView==='all');
    $('.km-tab-recs').classList.toggle('is-active',transcriptView==='recommendations');
    $('.km-tab-lines').setAttribute('aria-pressed',String(transcriptView==='all'));
    $('.km-tab-recs').setAttribute('aria-pressed',String(transcriptView==='recommendations'));
    renderCues();
    if(transcriptView==='all')syncActive(true);
  }
  $('.km-tab-lines').addEventListener('click',()=>switchTranscriptView('all'));
  $('.km-tab-recs').addEventListener('click',()=>switchTranscriptView('recommendations'));
  $('.km-open-recs').addEventListener('click',()=>{railOpen=true;switchTranscriptView('recommendations');menu.hidden=true;updateDisplay();});
  $('.km-settings-page').addEventListener('click',()=>{chrome.runtime.sendMessage({type:'OPEN_SETTINGS'}).catch(()=>{});menu.hidden=true;});
  $('.km-dashboard-page').addEventListener('click',()=>{chrome.runtime.sendMessage({type:'OPEN_DASHBOARD'}).catch(()=>{});menu.hidden=true;});

  $('.km-tools-close').addEventListener('click', () => setTranscriptToolsOpen(false));
  document.addEventListener('pointerdown', event => {
    if (!$('.km-tools').hidden && !$('.km-tools').contains(event.target) && !$('.km-tools-toggle').contains(event.target)) {
      setTranscriptToolsOpen(false);
    }
  }, true);
  $('.km-site-toggle').addEventListener('click', async () => {
    siteEnabled = !siteEnabled;
    if (siteEnabled) { railOpen = true; requestTrackInfo(); }
    menu.hidden = true;
    await saveSite(siteEnabled);
    updateDisplay();
  });
  $('.km-show-rail').addEventListener('click', () => { railOpen = !railOpen; menu.hidden = true; updateDisplay(); });
  $('.km-menu-dismiss').addEventListener('click',()=>{menu.hidden=true;launcher.setAttribute('aria-expanded','false');});
  $('.km-auto-jp').addEventListener('click',async()=>{
    autoJapaneseSubtitles=!autoJapaneseSubtitles;
    await chrome.storage.local.set({autoJapaneseSubtitles});
    if(autoJapaneseSubtitles){jpAutoRequestedFor='';requestTrackInfo();requestNativeJapaneseCaptions();}
    updateDisplay();
  });
  $('.km-pause-hover').addEventListener('click',async()=>{
    pauseOnHover=!pauseOnHover;await chrome.storage.local.set({pauseOnHover});updateDisplay();
  });
  $('.km-video-toggle').addEventListener('click',async()=>{onVideoEnabled=!onVideoEnabled;await chrome.storage.local.set({onVideoEnabled});updateDisplay();});
  $('.km-coverage-toggle').addEventListener('click',async()=>{coverageEnabled=!coverageEnabled;await chrome.storage.local.set({coverageEnabled});updateDisplay();});
  $('.km-pitch-toggle').addEventListener('click',async()=>{pitchMode=({always:'hover',hover:'off',off:'always'})[pitchMode];await chrome.storage.local.set({pitchMode});updateDisplay();});
  $('.km-test-speech').addEventListener('click',()=>speakJapanese('こんにちは'));
  $('.km-translation-toggle').addEventListener('click',async()=>{sentenceTranslation=!sentenceTranslation;await chrome.storage.local.set({sentenceTranslation});renderEnglishSubtitle();updateDisplay();});
  function setSubtitleLanguage(value){
    subtitleLanguageMode=subtitleModes.normalize(value);
    chrome.storage.local.set({kotobaSubtitleMode:subtitleLanguageMode}).catch(()=>{});
    renderVideoSubtitle();updateDisplay();
  }
  $('.km-language-cycle').addEventListener('click',()=>setSubtitleLanguage(subtitleModes.cycle(subtitleLanguageMode)));
  $('.km-play-mode-cycle').addEventListener('click',()=>chrome.storage.local.set({kotobaPlayMode:KM_PLAY_MODES[(KM_PLAY_MODES.indexOf(playMode)+1)%KM_PLAY_MODES.length]}));
  $('.km-studio-page').addEventListener('click',()=>chrome.runtime.sendMessage({type:'OPEN_STUDIO'}).catch(()=>{}));

  $('.km-close').addEventListener('click', () => { railOpen = false; updateDisplay(); });
  document.addEventListener('pointerdown', e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== launcher && !launcher.contains(e.target)) { menu.hidden=true; launcher.setAttribute('aria-expanded','false'); } }, true);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') { menu.hidden=true; launcher.setAttribute('aria-expanded','false'); setTranscriptToolsOpen(false); } });
  window.addEventListener('resize', placeLauncher);
  window.addEventListener('scroll', placeLauncher, {passive:true});

  function status(text, isError = false) {
    const el = $('.km-status'); el.textContent = text; el.classList.toggle('is-error', isError);
  }
  function japaneseSegments(text) {
    return wordParser ? wordParser.tokenize(text) : [{segment:text,word:true,lemma:text}];
  }
  function vocabularyState(part){
    if(!learningEngine)return 'unknown';
    return learningEngine.vocabularyState(part,{known:combinedKnownWords,learning:ankiVocabularyLearning,statuses:wordStatuses});
  }
  function updateLearningReport(){
    const known=ankiVocabularyKnown.size,learning=ankiVocabularyLearning.size;
    const description=$('.km-coverage-description');
    if(description)description.dataset.anki=`${known} mature known and ${learning} tracked Anki terms synced`;
  }
  function paintPitch(btn,word) {
    const type=pitchCache.get(word) || '';
    btn.dataset.pitch=type;
    if(type) btn.title += ` · Tokyo accent: ${type}`;
    const state=vocabularyState({surface:word,lemma:btn.dataset.lemma||word});
    btn.dataset.learning=state;
    if(state==='known') btn.classList.add('km-known-word');
  }
  function pauseOnInteraction() {
    if (!pauseOnHover || captureBusy) return;
    const player=video(); if(player && !player.paused) {player.pause();hoverPausedVideo=true;}
  }
  let glossTimer=null;
  let hoverTarget=null;
  let hoveredStudyWord=null; // The current hover/focus target for status shortcuts.
  // Dictionary display is deliberately separate from hover-only word status actions.
  const LookupHover=globalThis.KMLookupHover;
  let lookupHoverMode='alt';
  let hoveredLookupToken=null;
  let hoverLookupKeyTimer=0;
  // Preserve the selected tab while async word/kanji requests complete.
  let glossActiveWord='';
  let glossActiveTab='meaning';
  let glossPointerInside=false;
  // Play Japanese in the extension's audio engine, not inside the media website.
  // Explicitly report failures (the old player returned true even if nothing was audible).
  async function speakJapanese(text) {
    const word=String(text||'').trim();
    if(!word){voiceStatus('Select a word to hear it.',true);return false;}
    voiceStatus('♫ Connecting to Japanese voice…');
    try {
      const reply=await chrome.runtime.sendMessage({type:'SPEAK_JA',word});
      if(!reply?.ok)throw Error(reply?.error||'Japanese voice could not start.');
      voiceStatus(`▶ Playing with ${reply.voice||'Japanese voice'}`);
      return true;
    } catch(nativeError) {
      // VOICEVOX fallback produces an actual playable WAV, not a browser speech indicator.
      try {
        const wav=await chrome.runtime.sendMessage({type:'WORD_TTS',word});
        if(!wav?.ok||!wav.audio?.data)throw Error(wav?.error||'Local VOICEVOX engine unavailable.');
        const sound=new Audio(`data:audio/wav;base64,${wav.audio.data}`);
        sound.volume=1;window.__kmSpeechAudio=sound;
        await sound.play();voiceStatus('▶ Playing generated Japanese (VOICEVOX)');return true;
      }catch(error){
        voiceStatus(`${nativeError.message||nativeError} · VOICEVOX fallback: ${error.message||error}`,true);
        return false;
      }
    }
  }
  let voiceFeedbackTimer=null;
  function voiceStatus(message,isError=false) {
    const el=$('.km-voice-feedback');
    if(!el)return;el.textContent=message;el.classList.toggle('is-error',isError);el.hidden=false;
    clearTimeout(voiceFeedbackTimer);voiceFeedbackTimer=setTimeout(()=>{el.hidden=true;},isError?12000:4500);
  }
  function hideGlossSoon() {
    clearTimeout(glossTimer);
    glossTimer=setTimeout(()=>{
      const popup=$('.km-floating-gloss');
      // A tab switch can reflow its contents. Do not close while focus stays
      // inside the dictionary or the pointer is physically over its bounds.
      const focusedInside=popup.contains(document.activeElement);
      const r=popup.getBoundingClientRect();
      const x=lastGlossPointer.x,y=lastGlossPointer.y;
      const cursorInside=Number.isFinite(x)&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
      if(focusedInside||cursorInside)return;
      popup.hidden=true;hoverTarget=null;hoveredStudyWord=null;glossPointerInside=false;glossActiveWord='';glossActiveTab='meaning';++hoverSerial;
    },320);
  }
  const lastGlossPointer={x:NaN,y:NaN};
  function glossButton(parent,label,cls,title,action) {
    const b=addText(parent,'km-gloss-btn '+cls,label,'button');
    b.type='button';b.title=title;b.addEventListener('click',event=>{event.stopPropagation();clearTimeout(glossTimer);action();});return b;
  }
  function renderGloss(entry,word,lemma,cue) {
    const tooltip=$('.km-floating-gloss'); tooltip.replaceChildren();
    const header=addText(tooltip,'km-gloss-top','');
    const label=addText(header,'km-gloss-label','KOTOBA · WORD LOOKUP','span');
    if(entry?.common)addText(header,'km-gloss-common','COMMON','span');
    const title=addText(tooltip,'km-gloss-title','');
    addText(title,'km-gloss-jp',word,'strong');
    const actions=addText(title,'km-gloss-title-actions','');
    const creatorIcon=glossButton(actions,'','km-gloss-creator','Send to card creator',async()=>{
      tooltip.hidden=true;await selectWord(word,cue,lemma);if(candidates[candidateIndex])$('.km-open-card').click();
    }); Icons?.mount(creatorIcon,'external');
    const quickIcon=glossButton(actions,'','km-gloss-quick','Create Anki card now (Q)',()=>quickCreateCard({word,lemma,cue,entry}));Icons?.mount(quickIcon,'arrow-right');
    if(entry?.reading && entry.reading!==word)addText(tooltip,'km-gloss-reading',entry.reading);
    const accent=pitchCache.get(word);
    if(accent){
      const pitchBadge=addText(tooltip,'km-gloss-pitch','', 'span');
      pitchBadge.dataset.pitch=accent;
      const names={heiban:'Heiban · flat',atamadaka:'Atamadaka · first-mora drop',nakadaka:'Nakadaka · middle drop',odaka:'Odaka · end drop',variable:'Multiple pitch patterns'};
      pitchBadge.textContent=(names[accent]||'Pitch unavailable')+(pitchApprox.has(word)?' · base-form estimate':'');
      pitchBadge.title='Tokyo accent from Kanjium. Conjugated words and regional dialects may have different patterns.';
    }
    const definitions=entry?.meanings?.filter(Boolean)||[];
    const tabs=addText(tooltip,'km-gloss-tabs','');
    const views=[['meaning','book-open','Definitions and senses'],['kanji','word','Kanji meanings and readings'],['sound','volume','Japanese pronunciation'],['image','image','Source scene image'],['examples','list','Examples in transcript'],['context','sparkle','Meaning in context'],['links','external','Other dictionaries']];
    const body=addText(tooltip,'km-gloss-tab-body','');
    function tabButton(item){const b=addText(tabs,'km-gloss-tab','','button');Icons?.mount(b,item[1]);b.type='button';b.dataset.glossTab=item[0];b.title=item[2];b.setAttribute('aria-label',item[2]);b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{clearTimeout(glossTimer);glossPointerInside=true;showTab(item[0]);});return b;}
    views.forEach(tabButton);
    function showTab(name){
      glossActiveTab=name;
      tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.glossTab===name)));
      body.replaceChildren();
      if(name==='meaning'){
        addText(body,'km-gloss-section','MOST COMMON DICTIONARY MEANING');
        addText(body,'km-gloss-primary',definitions[0]||'Looking for a dictionary definition…');
        if(definitions.length>1){
          addText(body,'km-gloss-section','OTHER MEANINGS');
          definitions.slice(1,6).forEach((m,i)=>addText(body,'km-gloss-secondary',`${i+2}. ${m}`));
        }
        if(entry?.senses?.length>1){
          const senses=document.createElement('details');senses.className='km-gloss-extra-senses';
          const summary=document.createElement('summary');summary.textContent=`View ${entry.senses.length} dictionary senses + grammar labels`;senses.append(summary);
          entry.senses.slice(0,12).forEach((sense,index)=>{
            const row=addText(senses,'km-gloss-sense','');
            addText(row,'km-gloss-sense-label',`${index+1}. ${(sense.pos||[]).join(', ')||'Meaning'}`);
            addText(row,'km-gloss-secondary',(sense.meanings||[]).join(' · '));
          });
          body.append(senses);
        }
        if(entry?.variants?.length>1){
          const distinct=[...new Set(entry.variants.filter(v=>v.word||v.reading).map(v=>`${v.word||v.reading} · ${v.reading||''}`))];
          if(distinct.length>1){
            const details=document.createElement('details');details.className='km-gloss-extra-senses';
            const summary=document.createElement('summary');summary.textContent='Alternative written forms and readings';details.append(summary);
            distinct.slice(0,10).forEach(form=>addText(details,'km-gloss-secondary',form));body.append(details);
          }
        }
      } else if(name==='kanji'){
        addText(body,'km-gloss-section','KANJI IN THIS WORD · KANJIDIC');
        const area=addText(body,'km-gloss-kanji-grid','');
        area.textContent='Loading kanji readings…';
        chrome.runtime.sendMessage({type:'KANJI_DETAILS',word}).then(r=>{
          if(!area.isConnected)return;area.replaceChildren();
          if(!r?.ok){addText(area,'km-gloss-tab-hint',r?.error||'Kanji details unavailable.');return;}
          if(!r.kanji?.length){addText(area,'km-gloss-tab-hint','This word has no kanji characters.');return;}
          for(const k of r.kanji){
            const card=addText(area,'km-gloss-kanji-card','');addText(card,'km-gloss-kanji-symbol',k.character,'strong');
            addText(card,'km-gloss-primary',(k.meanings||[]).join(', ')||k.error||'No meaning available');
            addText(card,'km-gloss-tab-hint','On: '+(k.on||[]).join(' / ')+' · Kun: '+(k.kun||[]).join(' / '));
            if(k.strokes)addText(card,'km-gloss-tab-hint',k.strokes+' strokes');
          }
        }).catch(()=>{if(area.isConnected)area.textContent='Kanji data unavailable.';});
      } else if(name==='sound'){
        addText(body,'km-gloss-section','JAPANESE WORD AUDIO');
        const voiceButton=glossButton(body,'Play pronunciation','km-gloss-audio-play','Play with Japanese system voice',()=>speakJapanese(entry?.reading||word));Icons?.mount(voiceButton,'volume');
        addText(body,'km-gloss-tab-hint','Change installed Windows voices or VOICEVOX speaker in Kotoba extension settings.');
      } else if(name==='image'){
        addText(body,'km-gloss-section','SCENE FRAME');
        const pane=addText(body,'km-gloss-scene','');
        try {const player=video();if(!player?.videoWidth)throw Error('No accessible video.');
          const canvas=document.createElement('canvas');const sc=Math.min(1,440/player.videoWidth);
          canvas.width=Math.round(player.videoWidth*sc);canvas.height=Math.round(player.videoHeight*sc);
          canvas.getContext('2d',{alpha:false}).drawImage(player,0,0,canvas.width,canvas.height);
          const img=document.createElement('img');img.alt='Current video frame';img.src=canvas.toDataURL('image/jpeg',.65);pane.appendChild(img);
        }catch{addText(pane,'km-gloss-tab-hint','This scene cannot be previewed (protected video or no accessible frame).');}
        addText(body,'km-gloss-tab-hint','The screenshot is of the current video frame, not a web image search.');
      } else if(name==='examples'){
        addText(body,'km-gloss-section','SENTENCES FROM THIS VIDEO');
        const found=cues.filter(c=>c.text.includes(word)||(lemma&&lemma!==word&&c.text.includes(lemma))).slice(0,5);
        if(!found.length)addText(body,'km-gloss-tab-hint','No other matching sentence is available in the loaded transcript.');
        for(const example of found){const b=addText(body,'km-gloss-example',example.text,'button');b.type='button';b.title='Seek to this sentence';b.addEventListener('click',()=>seekCue(example));}
      } else if(name==='context'){
        addText(body,'km-gloss-section','IN THIS SENTENCE');
        addText(body,'km-gloss-context-sentence',cue?.text||currentCue()?.text||'No active subtitle context.');
        addText(body,'km-gloss-primary',definitions[0]||'Select a word to see its primary sense.');
        addText(body,'km-gloss-tab-hint','Dictionary-based sense. Local AI can also explain this in context when requested.');
        const aiBtn=glossButton(body,'✦ Explain with local AI','km-gloss-ai','Explain this subtitle using your selected Ollama model',async()=>{
          const area=addText(body,'km-gloss-ai-result','Thinking locally…');
          try{const r=await chrome.runtime.sendMessage({type:'AI_ASSIST',mode:'explain',word,text:cue?.text||currentCue()?.text||word});
            area.textContent=r?.ok?r.text:r?.error||'Local AI unavailable. Configure Ollama in the popup.';
          }catch(err){area.textContent=err.message;}
          if(hoverTarget)placeGloss(hoverTarget);
        });
        const span=addText(body,'km-gloss-translation','');
        if(sentenceTranslation && (cue?.text||currentCue()?.text)){
          span.textContent='Translating…';
          chrome.runtime.sendMessage({type:'TRANSLATE',sentence:cue?.text||currentCue()?.text}).then(r=>{
            if(body.isConnected&&r?.ok)span.textContent=r.text||'';
            else if(body.isConnected)span.textContent='Translation unavailable.';
          }).catch(()=>{if(body.isConnected)span.textContent='Translation unavailable.';});
        }
      } else if(name==='links'){
        addText(body,'km-gloss-section','OPEN A DICTIONARY');
        const q=encodeURIComponent(word);
        const providers=[['Jisho · Japanese/English','https://jisho.org/search/'+q],['Weblio · Japanese dictionary','https://www.weblio.jp/content/'+q],['Wiktionary · English','https://en.wiktionary.org/wiki/'+q],['Wiktionary · Japanese','https://ja.wiktionary.org/wiki/'+q],['Wikipedia · Japanese','https://ja.wikipedia.org/wiki/'+q],['Wikipedia · English','https://en.wikipedia.org/wiki/'+q],['Verbix · conjugations','https://www.verbix.com/languages/japanese']];
        for(const [name,url] of providers){const a=addText(body,'km-gloss-link',name+' ↗','a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
        glossButton(body,'✦ Wikipedia article preview','km-gloss-wiki','Read a short Japanese Wikipedia preview',async()=>{
          const area=addText(body,'km-gloss-wiki-extract','Looking for a Japanese Wikipedia article…');
          try{const r=await chrome.runtime.sendMessage({type:'WIKI_SUMMARY',word});
            area.textContent=r?.ok?r.summary:r?.error||'Wikipedia preview unavailable.';
          }catch(e){area.textContent=e.message;}
        });
      }
      // Don't move the card out from under the user's pointer during tab clicks.
      if(hoverTarget && !glossPointerInside)placeGloss(hoverTarget);
    }
    showTab(glossActiveTab);
    const foot=addText(tooltip,'km-gloss-actions','');
    const status=vocabularyState({surface:word,lemma});
    addText(foot,'km-gloss-current-status','● '+status.toUpperCase(),'span'); // Visually hidden in v2.2; keyboard status shortcuts still work.
    glossButton(foot,'✓ Known','km-gloss-known','Mark this word known',async()=>{selected=word;await setWordStatus('known');renderGloss(entry,word,lemma,cue);});
    const dictionaryLink=glossButton(foot,'Dictionary','km-gloss-details','Open full dictionary',()=>{tooltip.hidden=true;selectWord(word,cue,lemma);});Icons?.mount(dictionaryLink,'external');
  }
  function placeGloss(target) {
    const tooltip=$('.km-floating-gloss');if(tooltip.hidden)return;
    const rect=target.getBoundingClientRect();
    const w=tooltip.offsetWidth||320,h=tooltip.offsetHeight||230;
    const sidebarEdge=sidebar.hidden?innerWidth:sidebar.getBoundingClientRect().left;
    const right=Math.max(180,sidebarEdge-12);
    const left=Math.max(8,Math.min(rect.left+rect.width/2-w/2,right-w,innerWidth-w-8));
    const gap=12,above=rect.top-h-gap,below=rect.bottom+gap;
    const maxTop=Math.max(8,innerHeight-h-8);
    // Keep the lookup close to its token, without shifting the underlying cue.
    const roomAbove=rect.top-8,roomBelow=innerHeight-rect.bottom-8;
    let top,placement;
    if(roomAbove>=h+gap || (roomAbove>=roomBelow && roomAbove>80)){
      top=Math.max(8,rect.top-h-gap);placement='top';
    }else if(roomBelow>=h+gap){
      top=below;placement='bottom';
    }else{
      top=clamp(rect.top-h/2,8,maxTop);placement='side';
    }
    tooltip.style.left=clamp(left,8,Math.max(8,innerWidth-w-8))+'px';
    tooltip.style.top=clamp(top,8,maxTop)+'px';
    tooltip.dataset.placement=placement;
  }
  function showWordGloss(word,target,lemma=word,cue=null) {
    if(glossActiveWord!==word){glossActiveWord=word;glossActiveTab='meaning';glossPointerInside=false;}
    hoveredStudyWord={word,lemma,cue,target};
    lastMiningTarget={word,lemma,cue,entry:null,at:Date.now()};
    clearTimeout(glossTimer);
    hoverTarget=target;
    const id=++hoverSerial;
    const tooltip=$('.km-floating-gloss'); tooltip.hidden=false;
    renderGloss(null,word,lemma,cue);placeGloss(target);
    chrome.runtime.sendMessage({type:'LOOKUP',query:word,lemma}).then(res=>{
      if(id!==hoverSerial)return;
      const matching=res?.results?.[0]||null;
      if(lastMiningTarget?.word===word)lastMiningTarget.entry=matching;
      renderGloss(matching,word,lemma,cue);
      if(hoverTarget && !glossPointerInside)placeGloss(hoverTarget);
    }).catch(()=>{
      if(id===hoverSerial){renderGloss(null,word,lemma,cue);if(hoverTarget && !glossPointerInside)placeGloss(hoverTarget);}
    });
  }
  // Holding the configured modifier over a word opens its dictionary, including
  // when the cursor was already over that word before the key was pressed.
  // A short delay avoids flashing the dictionary while completing Alt+Shift+1…5.
  document.addEventListener('keydown',event=>{
    clearTimeout(hoverLookupKeyTimer);
    if(!LookupHover?.isModifierKey(event) || event.repeat || event.isComposing ||
       event.target?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/i.test(event.target?.tagName||''))return;
    if(!displayEnabled() || !hoveredLookupToken || !LookupHover.matches(lookupHoverMode,event))return;
    const token=hoveredLookupToken;
    hoverLookupKeyTimer=setTimeout(()=>{
      if(hoveredLookupToken!==token || !token.target.isConnected ||
         document.activeElement?.isContentEditable)return;
      pauseOnInteraction();showWordGloss(token.word,token.target,token.lemma,token.cue);
    },190);
  },true);
  document.addEventListener('keyup',event=>{
    if(LookupHover?.isModifierKey(event))clearTimeout(hoverLookupKeyTimer);
  },true);
  window.addEventListener('blur',()=>clearTimeout(hoverLookupKeyTimer));
  const gloss=$('.km-floating-gloss');
  document.addEventListener('pointermove',e=>{lastGlossPointer.x=e.clientX;lastGlossPointer.y=e.clientY;},{passive:true});
  gloss.addEventListener('mouseenter',()=>{glossPointerInside=true;clearTimeout(glossTimer);});
  gloss.addEventListener('mouseleave',()=>{glossPointerInside=false;hideGlossSoon();});
  gloss.addEventListener('focusin',()=>clearTimeout(glossTimer));
  gloss.addEventListener('focusout',()=>{if(!gloss.contains(document.activeElement))hideGlossSoon();});
  // Host players can scroll or resize independently after the lookup opens.
  const refreshGlossPosition=()=>{
    if(gloss.hidden || !hoverTarget)return;
    if(!hoverTarget.isConnected){gloss.hidden=true;hoverTarget=null;return;}
    if(!glossPointerInside)placeGloss(hoverTarget);
  };
  window.addEventListener('scroll',refreshGlossPosition,true);
  window.addEventListener('resize',refreshGlossPosition);
  function tokens(text, cue, container, mode='rail') {
    for (const part of japaneseSegments(text)) {
      if(part.word) {
        const btn=document.createElement('button');btn.type='button';btn.className='km-word-token';
        const targetWord=part.surface||part.segment;
        btn.dataset.word=targetWord;btn.dataset.lemma=part.lemma||targetWord;
        if(part.reading && part.kind==='furigana' && furiganaMode!=='off'){
          const ruby=document.createElement('ruby');ruby.textContent=targetWord;
          const rt=document.createElement('rt');rt.textContent=part.reading;ruby.appendChild(rt);
          btn.appendChild(ruby);
          btn.dataset.furigana=furiganaMode;
          btn.dataset.knownReading=vocabularyState(part)==='known'?'true':'false';
        }else btn.textContent=(part.kind==='furigana'?targetWord:part.segment);
        if(part.reading)btn.dataset.reading=part.reading;
        btn.title=`${mode==='rail'?'Jump to line and look up':'Look up'} ${targetWord}`;
        paintPitch(btn,targetWord);
        btn.addEventListener('mouseenter',event=>{
          hoveredLookupToken={word:targetWord,lemma:part.lemma||targetWord,cue,target:btn};
          hoveredStudyWord={word:targetWord,lemma:part.lemma||targetWord,cue,target:btn};
          if(LookupHover.matches(lookupHoverMode,event)){
            pauseOnInteraction();showWordGloss(targetWord,btn,part.lemma||targetWord,cue);
          }
        });
        btn.addEventListener('mouseleave',()=>{
          if(hoveredLookupToken?.target===btn)hoveredLookupToken=null;
          clearTimeout(hoverLookupKeyTimer);
          hideGlossSoon();
        });
        // Keyboard focus and clicking remain accessible without a modifier.
        btn.addEventListener('focus',()=>showWordGloss(targetWord,btn,part.lemma||targetWord,cue));
        btn.addEventListener('click', e=>{e.stopPropagation();clearTimeout(glossTimer);gloss.hidden=true;if(cue && mode==='rail')seekCue(cue);selectWord(targetWord,cue,part.lemma||targetWord);});
        container.appendChild(btn);
      } else container.appendChild(document.createTextNode(part.segment));
    }
  }
  function currentCue() {
    const idx=U.activeIndex(cues,Math.max(0,demoSeconds()*1000-offsetForSource()));
    return idx>=0 ? cues[idx] : null;
  }
  function refreshPitchCounts(){
    const nodes=[...root.querySelectorAll('.km-word-token')];
    const unique=new Map(nodes.map(node=>[node.dataset.word,node]));
    const verified=[...unique].filter(([word])=>pitchCache.get(word)&&pitchCache.get(word)!=='variable').length;
    const variable=[...unique].filter(([word])=>pitchCache.get(word)==='variable').length;
    const chip=$('.km-pitch-chip');
    if(chip){chip.textContent=`♫ ${verified}/${unique.size} pitch`;
      chip.title=`${verified} of ${unique.size} unique subtitle words have a mapped accent · ${variable} have multiple accents · ${pitchDatasetIsFull?'full Kanjium dictionary':'starter sample only'}`;
      chip.dataset.pitchReady=pitchDatasetIsFull?'yes':'no';}
    const summary=$('.km-pitch-status');
    if(summary && pitchSourceInfo){
      summary.textContent=`${pitchDatasetIsFull?'✓ Full dictionary':'⚠ Sample only'} · ${pitchSourceInfo.terms||0} entries · ${verified}/${unique.size} words matched${variable?' · '+variable+' have multiple patterns':''}.`;
    }
  }
  let pitchSourceInfo=null;
  async function requestPitchForVisible() {
    if(pitchLoading)return;
    pitchLoading=true;
    const id=++pitchRequestId;
    const nodes=[...root.querySelectorAll('.km-word-token')];
    const forms={},readings={};
    for(const node of nodes){
      const w=node.dataset.word;
      if(w&&node.dataset.lemma&&node.dataset.lemma!==w)forms[w]=node.dataset.lemma;
      if(w&&node.dataset.reading)readings[w]=node.dataset.reading;
    }
    const unique=[...new Set(nodes.map(x=>x.dataset.word))].filter(w=>w&&!pitchCache.has(w));
    if(!unique.length) {applyPitchStyles();pitchLoading=false;return;}
    for(let i=0;i<Math.min(unique.length,3000);i+=250) {
      const batch=unique.slice(i,i+250);
      try {
        const reply=await chrome.runtime.sendMessage({type:'PITCH_BATCH',words:batch,forms,readings});
        if(id!==pitchRequestId){pitchLoading=false;return;}
        if(reply?.ok){
          for(const w of batch){
            pitchCache.set(w,reply.results?.[w]||'');
            if(reply.details?.[w]?.approximate)pitchApprox.add(w);
            else pitchApprox.delete(w);
          }
          pitchSourceInfo=reply;pitchDatasetIsFull=reply.full===true;
          const legend=$('.km-pitch-legend');
          legend.title=`Pitch: ${reply.source} · Kanjium CC BY-SA 4.0`;
          $('.km-tools-hint').textContent=reply.error||'Accent colours show confident matches; accent changes in conjugated forms may be approximated.';
          applyPitchStyles();
        }
      }catch(err){$('.km-pitch-status').textContent='Pitch lookup error: '+err.message;break;}
    }
    pitchLoading=false;
    refreshPitchCounts();
  }
  function applyPitchStyles() {
    root.querySelectorAll('.km-word-token').forEach(node=>{
      const word=node.dataset.word||'';
      node.dataset.pitch=pitchCache.get(word)||'';
      node.dataset.pitchApprox=pitchApprox.has(word)?'true':'false';
      const state=vocabularyState({surface:word,lemma:node.dataset.lemma||word});
      node.dataset.learning=state;
      node.classList.toggle('km-known-word',state==='known');
      const type=pitchCache.get(word);
      if(type&&type!=='variable')node.title=(node.title.split(' · Tokyo accent:')[0])+` · Tokyo accent: ${type}${pitchApprox.has(word)?' (base-form estimate)':''}`;
    });
    refreshPitchCounts();
  }
  async function installPitchDictionary(){
    const button=$('.km-pitch-install'),notice=$('.km-pitch-status');
    button.disabled=true;notice.textContent='Downloading full Kanjium pitch dictionary… this can take a moment.';
    try{
      const reply=await chrome.runtime.sendMessage({type:'PITCH_INSTALL'});
      if(!reply?.ok)throw Error(reply?.error||'Install failed');
      pitchSourceInfo=reply;pitchDatasetIsFull=reply.full===true;
      if(!reply.full)throw Error(reply.error||'Full dictionary unavailable: import accents.txt from GitHub.');
      pitchCache.clear();pitchApprox.clear();notice.textContent=`✓ Installed ${reply.terms.toLocaleString()} accent entries. Updating subtitles…`;
      await requestPitchForVisible();
    }catch(e){notice.textContent='⚠ '+e.message;}
    finally{button.disabled=false;}
  }
  $('.km-pitch-install').addEventListener('click',installPitchDictionary);
  function updateCoverage() {
    if(!learningEngine)return;
    analysis=learningEngine.analyze(cues,japaneseSegments,{
      known:combinedKnownWords,learning:ankiVocabularyLearning,statuses:wordStatuses
    });
    const t=analysis.totals;
    $('.km-coverage-percent').textContent=t.total?t.percent+'%':'—';
    $('.km-coverage-fill').style.width=t.percent+'%';
    $('.km-unique').textContent=t.unique.toLocaleString();
    $('.km-recommended').textContent=String(t.iPlusOne);
    $('.km-rec-count').textContent=String(t.iPlusOne);
    $('.km-level').textContent=!t.total?'Waiting':t.percent>=85?'Excellent':t.percent>=65?'Comfortable':t.percent>=40?'Moderate':'Difficult';
    const full=cueSource && cueSource!=='Live capture';
    $('.km-coverage-reliability').textContent=full?'loaded captions':'partial / observed captions';
    $('.km-coverage').title=`${t.known}/${t.total} known occurrences. ${t.iPlusOne} i+1 sentences. Estimate, not comprehension testing.`;
    $('.km-coverage-description').textContent=t.total?`${t.known}/${t.total} known occurrences · ${ankiVocabularyKnown.size} mature Anki terms · ${full?'full transcript':'partial captions'}`:'Load subtitles for a vocabulary estimate';
    updateLearningReport();
    if(transcriptView==='recommendations')renderCues();
  }
  function playerMillis(){return Math.max(0,demoSeconds()*1000);}
  function updateEnglishHTML5(){
    if(isDemo || (isGenericVideoSite && embeddedCurrent()))return;
    const player=video();
    const tracks=[...(player?.textTracks||[])];
    const track=tracks.find(t=>subtitleModes.isEnglishTrack(t));
    if(!track)return;
    // Hidden keeps WebVTT cues readable but does not display duplicate native CC.
    if(track.mode==='disabled')try{track.mode='hidden';}catch{}
    const raw=track.cues;
    const signature=raw ? [raw.length,raw[0]?.startTime,raw[raw.length-1]?.endTime].join(':') : 'none';
    if(track===lastEnglishTrack && signature===lastEnglishTrackSignature)return;
    lastEnglishTrack=track;lastEnglishTrackSignature=signature;
    const found=[...(raw||[])].slice(0,15000).map(c=>({start:c.startTime*1000,end:c.endTime*1000,text:U.clean(c.text||'')})).filter(c=>c.text);
    if(found.length && (englishSource!=='HTML5 English track' || englishCues.length!==found.length || englishCues[0]?.start!==found[0]?.start || englishCues.at(-1)?.end!==found.at(-1)?.end)){
      englishCues=U.normalize(found);englishSource='HTML5 English track';
    }
  }
  function englishAtCurrentTime(){
    if(isDemo)return demoTranslations.get(shownVideoText)||'';
    const fromCues=subtitleModes.active(englishCues,Math.max(0,playerMillis()-offsetForSource()));
    if(englishCues.length)return fromCues;
    if(isGenericVideoSite && embeddedCurrent() && embeddedPlayer.englishText)return embeddedPlayer.englishText;
    const track=[...(video()?.textTracks||[])].find(t=>subtitleModes.isEnglishTrack(t));
    return track?.activeCues?.length ? U.clean([...track.activeCues].map(c=>c.text||'').join(' ')) : '';
  }
  // English track text is local; optional machine translation is opt-in only.
  async function requestEnglishTranslation(japanese){
    if(!sentenceTranslation || !japanese || subtitleLanguageMode==='ja')return;
    if(subtitleTranslateCache.has(japanese))return;
    if(alwaysTranslateInFlight===japanese || Date.now()<(translationRetryAfter.get(japanese)||0))return;
    translationRetryAfter.set(japanese,Date.now()+60000);
    alwaysTranslateInFlight=japanese;
    const serial=++translationSerial;
    try{
      const result=await chrome.runtime.sendMessage({type:'TRANSLATE',sentence:japanese});
      if(result?.ok && result.text){
        subtitleTranslateCache.set(japanese,String(result.text));
        if(subtitleTranslateCache.size>80)subtitleTranslateCache.delete(subtitleTranslateCache.keys().next().value);
        if(serial===translationSerial && shownVideoText===japanese)renderEnglishSubtitle();
      }
    }catch{}finally{if(alwaysTranslateInFlight===japanese)alwaysTranslateInFlight='';}
  }
  function renderEnglishSubtitle(){
    const japan=$('.km-video-japanese'), english=$('.km-video-translation');
    const oldEnglishVisible=!english.hidden;
    const oldJapaneseVisible=!japan.hidden;
    const oldHasDisplay=!!displayedEnglishText;
    const jpVisible=subtitleLanguageMode!=='en';
    let text='';
    if(subtitleLanguageMode==='ja'){
      if(sentenceTranslation && shownVideoText && subtitleStyle.secondaryMode==='always'){
        text=subtitleTranslateCache.get(shownVideoText)|| (isDemo?demoTranslations.get(shownVideoText):'') || '';
        if(!text)requestEnglishTranslationForJP(shownVideoText);
      }else if(sentenceTranslation && subtitleStyle.secondaryMode==='hover' && hoverTranslationVisible){
        text=subtitleTranslateCache.get(shownVideoText)|| (isDemo?demoTranslations.get(shownVideoText):'') || '';
      }
    }else{
      const fromTrack=englishAtCurrentTime();
      const fromCache=sentenceTranslation?subtitleTranslateCache.get(shownVideoText)||'':'';
      text=fromTrack||fromCache;
      if(!text && sentenceTranslation && shownVideoText)requestEnglishTranslation(shownVideoText);
    }
    displayedEnglishText=text;
    japan.hidden=!jpVisible;
    if(english.textContent!==text)english.textContent=text;
    english.hidden=!text;
    if(oldEnglishVisible!==!!text || oldJapaneseVisible!==jpVisible || oldHasDisplay!==!!text)updateDisplay();
  }
  function requestEnglishTranslationForJP(text){
    if(!sentenceTranslation||!text)return;
    if(subtitleTranslateCache.has(text)||alwaysTranslateInFlight===text || Date.now()<(translationRetryAfter.get(text)||0))return;
    translationRetryAfter.set(text,Date.now()+60000);
    // In Japanese-only mode legacy hover translation is still explicit/opt-in.
    alwaysTranslateInFlight=text;
    chrome.runtime.sendMessage({type:'TRANSLATE',sentence:text}).then(r=>{
      if(r?.ok&&r.text){subtitleTranslateCache.set(text,String(r.text));if(shownVideoText===text && subtitleLanguageMode==='ja' && subtitleStyle.secondaryMode==='always')renderEnglishSubtitle();}
    }).catch(()=>{}).finally(()=>{if(alwaysTranslateInFlight===text)alwaysTranslateInFlight='';});
  }
  function renderVideoSubtitle() {
    const cue=currentCue();
    const text=cue?.text || (cueSource==='Live capture' ? '' : (!isDemo?liveCaption():''));
    if(text!==shownVideoText) {
      shownVideoText=text;
      const line=$('.km-video-japanese');line.replaceChildren();
      if(text)tokens(text,cue || {text,start:demoSeconds()*1000,end:demoSeconds()*1000+2400},line,'video');
      $('.km-video-translation').hidden=true;
      $('.km-video-translation').textContent='';
      ++translationSerial;
      requestPitchForVisible();
      updateDisplay();
    }
    if(subtitleLanguageMode!=='ja')updateEnglishHTML5();
    renderEnglishSubtitle();
  }
  async function showSubtitleTranslation() {
    // A hover never displays settings instructions. Translate only when opted in.
    if(subtitleLanguageMode!=='ja'||subtitleStyle.secondaryMode==='off'||!shownVideoText||!sentenceTranslation)return;
    hoverTranslationVisible=true;
    pauseOnInteraction();
    const target=$('.km-video-translation');
    const text=shownVideoText;
    const cached=subtitleTranslateCache.get(text)|| (isDemo?demoTranslations.get(text):'') || '';
    if(cached){subtitleTranslateCache.set(text,cached);renderEnglishSubtitle();return;}
    const id=++translationSerial;
    try{
      const reply=await chrome.runtime.sendMessage({type:'TRANSLATE',sentence:text});
      if(id!==translationSerial || shownVideoText!==text || subtitleLanguageMode!=='ja')return;
      if(reply?.ok&&reply.text){subtitleTranslateCache.set(text,String(reply.text));renderEnglishSubtitle();}
    }catch{/* No pop-up errors or nags over the video. */}
  }
  $('.km-video-subs').addEventListener('mouseenter',showSubtitleTranslation);
  function showAlwaysSubtitleTranslation(){renderEnglishSubtitle();}
  $('.km-video-subs').addEventListener('mouseleave',()=>{hoverTranslationVisible=false;if(subtitleLanguageMode==='ja' && subtitleStyle.secondaryMode!=='always')renderEnglishSubtitle();++translationSerial;hideGlossSoon();});

  function renderCues() {
    const holder=$('.km-list');holder.replaceChildren();
    const recommendations=transcriptView==='recommendations';
    const rows=recommendations
      ?(analysis?.recommendations||[]).map(x=>({cue:cues[x.index],i:x.index,recommendation:x}))
      :cues.map((cue,i)=>({cue,i}));
    const matches=filter?rows.filter(x=>x.cue?.text.toLowerCase().includes(filter)):rows;
    const frag=document.createDocumentFragment();
    for(const {cue,i,recommendation} of matches.slice(0,10000)){
      if(!cue)continue;
      const row=document.createElement('div');row.className='km-cue'+(i===active?' is-current':'')+(recommendation?' km-recommendation':'');
      row.dataset.index=String(i);row.setAttribute('role','listitem');
      if(recommendation){
        const top=document.createElement('div');top.className='km-recommend-top';
        const label=document.createElement('span');label.textContent='✦ One target · '+recommendation.target.word;
        const count=document.createElement('span');count.textContent=recommendation.frequency+'× in transcript';
        top.append(label,count);row.appendChild(top);
      }
      const line=document.createElement('div');line.className='km-cue-text';tokens(cue.text,cue,line);
      row.addEventListener('click',()=>seekCue(cue));row.appendChild(line);
      if(cue.text.length>62){
        row.classList.add('km-cue-collapsible');
        const expand=document.createElement('button');expand.type='button';expand.className='km-cue-expand';expand.textContent='More';expand.setAttribute('aria-label','Expand long transcript line');
        expand.addEventListener('click',e=>{e.stopPropagation();const expanded=row.classList.toggle('km-cue-expanded');expand.textContent=expanded?'Less':'More';expand.setAttribute('aria-expanded',String(expanded));});
        row.appendChild(expand);
      }
      if(recommendation){
        const actions=document.createElement('div');actions.className='km-recommend-actions';
        const mine=document.createElement('button');mine.type='button';mine.className='km-mine-target';mine.textContent='Mine '+recommendation.target.word+' ↗';
        mine.addEventListener('click',event=>{
          event.stopPropagation();seekCue(cue);
          selectWord(recommendation.target.word,cue,recommendation.target.lemma||recommendation.target.word);
        });
        actions.appendChild(mine);row.appendChild(actions);
      }
      frag.appendChild(row);
    }
    holder.appendChild(frag);
    $('.km-count').textContent=`${cues.length.toLocaleString()} ${cues.length===1?'line':'lines'}`;
    const summary=$('.km-recommend-summary');summary.hidden=!recommendations;
    if(recommendations){summary.textContent=`${analysis?.recommendations?.length||0} sentences with one unseen or tracked/learning word · Ranked by review status and repetition. ${cueSource==='Live capture'?'Partial capture: scores will change as you watch.':''}`;}
    $('.km-empty').hidden=matches.length>0;
    if(filter&&!matches.length)$('.km-empty').textContent='No lines match your search.';
    else if(recommendations&&!matches.length)$('.km-empty').textContent='No i+1 lines yet. Study more vocabulary in Anki, or load a fuller transcript.';
    else if(!cues.length)$('.km-empty').textContent='No Japanese transcript yet. Enable captions or import SRT/VTT.';
    requestPitchForVisible();
  }
  function setCues(next, source) {
    cues = U.normalize(next);
    cueSource = source;
    active = -1;
    if (cues.length) status(`${source} · ${cues.length} lines`);
    renderCues();
    syncActive(true);
    updateCoverage();
    renderVideoSubtitle();
  }
  function seekCue(cue) {
    const player=video();
    if (isGenericVideoSite && embeddedCurrent()) { embeddedPlayer.time=Math.max(0,cue.start/1000); controlEmbedded('seek',cue.start/1000); }
    else if (player) { player.currentTime=Math.max(0, cue.start/1000); player.dispatchEvent(new Event('timeupdate')); }
    else if (isDemo) { window.__kotobaDemoTime=Math.max(0,cue.start/1000); const display=document.querySelector('#demo-caption'); if (display) display.textContent=cue.text; }
    syncActive(true);
    renderVideoSubtitle();
  }
  function replaySentence(){
    const cue=currentCue()||cues.find(x=>x.start===loopCueStart);
    if(!cue)return;
    seekCue(cue);const player=video();if(isGenericVideoSite&&embeddedCurrent())controlEmbedded('play');else if(player)player.play().catch(()=>{});
  }
  function toggleSentenceLoop(){
    sentenceLoop=!sentenceLoop;
    loopCueStart=sentenceLoop?(currentCue()?.start??null):null;
    $('.km-loop-label').textContent=sentenceLoop?'ON':'OFF';
    $('.km-loop-now').setAttribute('aria-pressed',String(sentenceLoop));
  }
  $('.km-replay-now').addEventListener('click',()=>{replaySentence();menu.hidden=true;});
  $('.km-loop-now').addEventListener('click',toggleSentenceLoop);
  function syncActive(force = false) {
    if (!cues.length || !displayEnabled()) return;
    const seconds = Math.max(0,demoSeconds()*1000-offsetForSource());
    const idx = U.activeIndex(cues,seconds);
    if (idx !== active || force) {
      const previous = $('.km-cue.is-current');
      previous?.classList.remove('is-current');
      active=idx;
      const row = idx < 0 ? null : $('.km-cue[data-index="'+idx+'"]');
      if (row) {
        row.classList.add('is-current');
        if (follow && !filter && (Date.now() > manualScrollUntil || force) && (force || Date.now()-lastAutoScroll>800)) {
          lastAutoScroll=Date.now(); row.scrollIntoView({block:'center',behavior: force?'instant':'smooth'});
        }
      }
    }
  }
  // Follow is always enabled. Manual scrolling gets a short grace period.
  $('.km-list-wrap').addEventListener('wheel',()=>{manualScrollUntil=Date.now()+8000;},{passive:true});
  $('.km-filter').addEventListener('input',e=>{filter=e.target.value.trim().toLowerCase(); renderCues(); syncActive(true);});

  function liveCaption() {
    if(isGenericVideoSite && embeddedCurrent() && embeddedPlayer.text)return embeddedPlayer.text;
    if(isGenericVideoSite && globalThis.KMUniversalSubtitle){
      const player=video(), adapter=globalThis.KMUniversalSubtitle;
      const track=adapter.selectTrack(player,autoJapaneseSubtitles);
      return U.clean(adapter.activeTrackText(track,U.clean)||adapter.playerCaption(document,player,U.clean));
    }
    const elements=[...new Set(document.querySelectorAll(isNetflix
      ? '.player-timedtext-text-container span, .player-timedtext span'
      : '.ytp-caption-window-container .ytp-caption-segment, .ytp-caption-segment'))];
    let text=elements.map(el=>el.textContent||'').join('').trim();
    if (text) return U.clean(text);
    const tracks=video()?.textTracks;
    if (tracks) for (const track of tracks) {
      if (track.activeCues?.length && (/^ja/i.test(track.language || '') || isDemo)) {
        text=[...track.activeCues].map(c=>c.text||'').join(' '); if(text.trim()) return U.clean(text);
      }
    }
    return '';
  }
  function checkNativeTracks() {
    if (cueSource && cueSource !== 'Live capture') return;
    if(isGenericVideoSite && globalThis.KMUniversalSubtitle){
      const player=video();
      const adapter=globalThis.KMUniversalSubtitle;
      const track=adapter.selectTrack(player,autoJapaneseSubtitles);
      if(track){
        const all=adapter.cuesFromTrack(track,U.clean);
        if(all.length>2){setCues(all,'HTML5 Japanese track');return;}
      }
      return;
    }
    const tracks=video()?.textTracks;
    if (!tracks) return;
    for (const track of tracks) {
      if (!/^ja/i.test(track.language || '') || !track.cues?.length) continue;
      const all=[...track.cues].map(c=>({start:c.startTime*1000,end:c.endTime*1000,text:c.text||''}));
      if (all.length > 3) { setCues(all,'HTML5 Japanese track'); return; }
    }
  }
  function captureLive() {
    if (!displayEnabled()) return;
    if (!cueSource || cueSource === 'Live capture') {
      const line=liveCaption();
      if (line && line !== lastCaption) {
        lastCaption=line;
        const change=CueContext.appendLive(trackedCaptions,line,Math.floor(demoSeconds()*1000));
        if(change.changed){
          setCues(trackedCaptions,'Live capture');
          status('Live capture · only lines seen so far. For all lines, import a transcript.');
        }
      } else if(line && cueSource==='Live capture') {
        // A stable caption may remain on-screen for several seconds. Keep its
        // actual active window alive without duplicating transcript rows.
        const now=demoSeconds()*1000;
        const last=trackedCaptions.at(-1),displayLast=cues.at(-1);
        if(last?.text===CueContext.recentCaption(line)){
          last.end=Math.max(last.end,now+650);
          if(displayLast?.text===last.text)displayLast.end=Math.max(displayLast.end,last.end);
        }
      }
    }
    checkNativeTracks();
    syncActive();
    renderVideoSubtitle();
  }

  // YouTube's in-page player metadata advertises caption tracks; signed URLs may be unavailable.
  // We never bypass access restrictions. An empty response falls back to on-page transcript / file import.
  function requestTrackInfo() { if (isYT && onWatchPage()) window.postMessage({type:'KOTOBA_YT_REQUEST_V03'},location.origin); }
  function requestNativeJapaneseCaptions() {
    if(!autoJapaneseSubtitles || !isYT || !onWatchPage() || !siteEnabled) return;
    const videoId=new URL(location.href).searchParams.get('v') || '';
    if(!videoId || jpAutoRequestedFor===videoId) return;
    jpAutoRequestedFor=videoId;
    window.postMessage({type:'KOTOBA_YT_SELECT_JP_V08',videoId},location.origin);
  }
  window.addEventListener('message', e=>{
    if(!isYT || e.source!==window || e.origin!==location.origin || e.data?.type!=='KOTOBA_YT_SELECTED_JP_V08') return;
    const videoId=new URL(location.href).searchParams.get('v') || '';
    if(e.data.videoId!==videoId)return;
    if(!e.data.ok && !cues.length)status('Japanese captions found, but YouTube player did not expose them. Import a subtitle file or open the transcript panel.',true);
    if(e.data.ok && !cues.length)status('Japanese CC selected automatically · collecting subtitles as they play.');
  });
  window.addEventListener('message', async e => {
    if (!isYT || e.source!==window || e.origin!==location.origin || e.data?.type!=='KOTOBA_YT_TRACKS_V03') return;
    if (!displayEnabled()) return;
    const videoId = new URL(location.href).searchParams.get('v') || '';
    if (!videoId || (e.data.videoId && e.data.videoId!==videoId)) return;
    const tracks=Array.isArray(e.data.tracks) ? e.data.tracks : [];
    const en=tracks.filter(t=>/^en(?:-|$)/i.test(t.lang)).sort((a,b)=>Number(a.auto)-Number(b.auto));
    if(en.length){
      const englishTrack=en[0], key=videoId+'|'+englishTrack.url;
      if(key!==englishLastRequestKey){
        englishLastRequestKey=key;const serial=++englishRequestSerial;
        chrome.runtime.sendMessage({type:'YT_CAPTIONS',url:englishTrack.url}).then(reply=>{
          if(serial!==englishRequestSerial || !reply?.ok)return;
          englishCues=U.normalize(reply.cues||[]);englishSource='YouTube English track';renderEnglishSubtitle();
        }).catch(()=>{});
      }
    }
    if(cueSource && cueSource!=='Live capture')return;
    const jp=tracks.filter(t=>/^ja(?:-|$)/i.test(t.lang)).sort((a,b)=>Number(a.auto)-Number(b.auto));
    if (!jp.length) {
      if (!cues.length) status('No original Japanese caption track found for this video. Try importing Japanese SRT/VTT.',true);
      return;
    }
    const track=jp[0];
    lastSelectedTrack = track;
    const key=videoId+'|'+track.url;
    if (key===lastRequestedKey || loadingTrack) return;
    lastRequestedKey=key; loadingTrack=true;
    const serial=++currentTrackRequest;
    if (!cues.length) status('Loading Japanese subtitle track…');
    try {
      const reply=await chrome.runtime.sendMessage({type:'YT_CAPTIONS',url:track.url});
      if (serial!==currentTrackRequest) return;
      if(!reply?.ok) throw Error(reply?.error || 'Unable to load subtitles.');
      const parsed=U.normalize(reply.cues || []);
      if(!parsed.length) throw Error('The YouTube caption track returned no lines.');
      setCues(parsed,'Complete Japanese subtitle track');
      lastTrackError='';
    } catch(err) {
      lastTrackError=err.message;
      if (!cues.length) status('Full track unavailable · trying Japanese CC automatically (if enabled)…');
      requestNativeJapaneseCaptions();
    } finally {loadingTrack=false;}
  });

  function scrapeYouTubePanel() {
    const segments=[...document.querySelectorAll('ytd-transcript-segment-renderer, ytd-transcript-segment-view-model')];
    const lines=[];
    for(const element of segments) {
      const ts=element.querySelector('.segment-timestamp, [class*="segment-timestamp"], .timestamp')?.textContent?.trim();
      const textEl=element.querySelector('.segment-text, [class*="segment-text"], yt-formatted-string');
      const text=U.clean(textEl?.textContent || '');
      const start=U.parseClock(ts);
      if(Number.isFinite(start) && text) lines.push({start,end:start+2900,text});
    }
    return U.normalize(lines);
  }
  async function readYouTubeTranscript() {
    if (!isYT || isDemo) { status('Use the demo sample lines or import a subtitle file.'); return; }
    status('Reading YouTube transcript panel…');
    let found=scrapeYouTubePanel();
    if (!found.length) {
      // Native YouTube controls are used; no undocumented transcript API calls.
      const button=document.querySelector('ytd-video-description-transcript-section-renderer button, ytd-engagement-panel-section-list-renderer[target-id*="transcript"] button');
      if(button) button.click();
      const deadline=Date.now()+5500;
      while(Date.now()<deadline) {
        await new Promise(resolve=>setTimeout(resolve,250));
        found=scrapeYouTubePanel();
        if(found.length) break;
      }
    }
    if(found.length) {
      setCues(found,'YouTube transcript panel');
      status(`YouTube transcript · ${found.length} lines. Ensure the selected language is Japanese.`);
    } else status('Open YouTube’s “Show transcript” panel, select Japanese, then click this button again.',true);
  }
  $('.km-read-yt').addEventListener('click',readYouTubeTranscript);
  $('.km-file').addEventListener('change', async e => {
    const file=e.target.files?.[0]; if (!file) return;
    if (file.size>3_000_000) {status('Subtitle file exceeds 3 MB.',true); return;}
    try {
      const lines=U.parseFile(await file.text());
      if (!lines.length) throw Error('No valid SRT/VTT timed subtitle lines found.');
      ++currentTrackRequest;
      setCues(lines,`Imported ${file.name.slice(0,80)}`);
      status(`${lines.length} lines imported locally · no upload`);
    } catch(err) {status(err.message,true);}
    e.target.value='';
  });

  // The mining panel keeps the selected sentence and time independent of playback.
  function miningPlan(cue,word){
    return CueContext.choose(cues,cue||currentCue(),word||selected);
  }
  function sourceSnapshot(cue,word='') {
    const plan=miningPlan(cue,word);
    const seconds=(plan.start||cue?.start||demoSeconds()*1000)/1000;
    return {sentence: plan.sentence || cue?.text || liveCaption() || '',seconds:Math.floor(seconds),cueStart:plan.start ?? cue?.start ?? null,cueEnd:plan.end ?? cue?.end ?? null,url:timestampUrl(seconds),title:document.title.replace(' - YouTube','') || site};
  }
  function addText(parent,cls,text,tag='div') {
    const item=document.createElement(tag); item.className=cls; item.textContent=text; parent.appendChild(item); return item;
  }
  function link(label,url) { const a=document.createElement('a'); a.textContent=label+' ↗'; a.href=url; a.target='_blank'; a.rel='noopener noreferrer'; return a; }
  function showCandidate(index) {
    candidateIndex=index;
    const entry=candidates[index]; const area=$('.km-results'); area.replaceChildren(); if(!entry) return;
    const res=addText(area,'km-result',''); const first=addText(res,'km-result-first','');
    addText(first,'km-word',selected || entry.word,'span');
    const voice=addText(first,'km-word-pronounce','▶','button');voice.type='button';voice.title='Listen in Japanese';voice.setAttribute('aria-label','Play Japanese pronunciation');
    voice.addEventListener('click',()=>speakJapanese(entry.reading||selected||entry.word));
    if(entry.reading && entry.reading!==(selected||entry.word)) addText(first,'km-reading',entry.reading,'span');
    addText(res,'km-definition-label','01  ·  PRIMARY DICTIONARY MEANING');
    addText(res,'km-meaning km-primary-meaning',entry.meanings[0] || 'No definition returned.');
    if(entry.meanings.length>1){
      addText(res,'km-definition-label','OTHER MEANINGS');
      const other=addText(res,'km-dictionary-secondary','');
      entry.meanings.slice(1,5).forEach((meaning,i)=>addText(other,'km-extra-meaning',(i+2)+'. '+meaning));
    }
    if(entry.matchNote)addText(res,'km-match-note',entry.matchNote);
    addText(res,'km-meta',[entry.pos.join(', '),entry.jlpt,entry.common?'Common word':''].filter(Boolean).join(' · '));
    if (candidates.length>1) {
      const choices=addText(area,'km-candidates','');
      candidates.slice(0,6).forEach((candidate,i)=>{
        const b=document.createElement('button'); b.type='button'; b.className='km-chip'+(i===index?' active':''); b.textContent=candidate.word;
        b.addEventListener('click',()=>showCandidate(i)); choices.appendChild(b);
      });
    }
    const external=addText(area,'km-external',''); const q=encodeURIComponent(selected || entry.word);
    external.append(link('Jisho','https://jisho.org/search/'+q),link('Weblio','https://ejje.weblio.jp/content/'+q),link('Wiktionary','https://en.wiktionary.org/wiki/'+q));
    $('.km-card-section').hidden=false;
    $('.km-textarea').value=entry.meanings[0] || ''; // User can edit this for the target context.
    $('.km-field-word').value=selected || entry.word;
    $('.km-field-reading').value=entry.reading || '';
    $('.km-field-sentence').value=context?.sentence || '';
    updateWordStatusButtons();
  }
  async function selectWord(word, cue=null, lemma=null) {
    const q=String(word||'').trim().slice(0,80); if(!q) return;
    selected=q; const lookupLemma=lemma||q; context=sourceSnapshot(cue,q);
    lastMiningTarget={word:q,lemma:lookupLemma,cue,entry:null,at:Date.now()};updateKnownButton();
    const v=video(); if (v && !v.paused) v.pause();
    siteEnabled=true; railOpen=true; updateDisplay();
    $('.km-miner').hidden=false;placeDictionary();
    $('.km-context').textContent = cue ? `${U.clock(cue.start)} · ${cue.text}` : (context.sentence || 'Manual dictionary search');
    $('.km-query').value=q;
    $('.km-card-section').hidden=true;
    $('.km-card-creator').hidden=true;
    if (capturedCueStart === null || capturedCueStart !== (cue?.start ?? currentCue()?.start)) clearMedia();
    const area=$('.km-results'); area.replaceChildren(); addText(area,'km-loading','Looking up '+q+'…');
    $('.km-save-notice').textContent='';
    loadDecks();
    const id=++lookupId;
    try {
      const reply=await chrome.runtime.sendMessage({type:'LOOKUP',query:q,lemma:lookupLemma||q});
      if(id!==lookupId) return;
      if(!reply?.ok) throw Error(reply?.error || 'Dictionary lookup failed.');
      candidates=reply.results || [];
      if(candidates.length) {if(lastMiningTarget?.word===q)lastMiningTarget.entry=candidates[0];showCandidate(0);}
      else {
        area.replaceChildren(); addText(area,'km-notice','No matching word. Try its dictionary form.');
        const external=addText(area,'km-external',''); external.append(link('Jisho search','https://jisho.org/search/'+encodeURIComponent(q)));
      }
      if(!reply.online) addText(area,'km-notice',reply.warning || 'Using offline dictionary backup.');
    } catch(err) {area.replaceChildren(); addText(area,'km-notice error',err.message || 'Lookup failed.');}
  }
  $('.km-open-dict').addEventListener('click',()=>{ $('.km-miner').hidden=false;placeDictionary(); loadDecks(); $('.km-query').focus(); });
  function updateWordStatusButtons() {
    const status=vocabularyState({surface:selected});
    root.querySelectorAll('[data-word-status]').forEach(b=>{b.classList.toggle('is-selected',b.dataset.wordStatus===status);b.setAttribute('aria-pressed',String(b.dataset.wordStatus===status));});
  }
  function updateKnownButton() {
    $('.km-known-toggle').textContent=knownWords.has(selected)?'✓ Known':'✓ Mark word known';
    updateWordStatusButtons();
  }
  async function setWordStatus(status, targetWord=selected) {
    const word=String(targetWord||'').trim();
    if(!word)return;
    wordStatuses[word]=status;
    if(status==='known')knownWords.add(word);else knownWords.delete(word);
    refreshCombinedKnown();
    await chrome.storage.local.set({knownWords:[...knownWords],wordStatuses});
    // A shortcut should act on the hovered word without changing the word in the editor.
    // Refresh both the in-video/sidebar highlights and the visible hover popup.
    updateKnownButton();updateCoverage();applyPitchStyles();
    if(hoveredStudyWord?.word===word && !gloss.hidden){
      const state=gloss.querySelector('.km-gloss-current-status');
      if(state)state.textContent='● '+status.toUpperCase();
    }
  }
  function setHoveredWordStatus(status){
    const target=hoveredStudyWord?.word || selected;
    if(!target){voiceStatus('Hover over a Japanese word before changing its status.',true);return;}
    return setWordStatus(status,target);
  }
  root.querySelectorAll('[data-word-status]').forEach(b=>b.addEventListener('click',()=>setWordStatus(b.dataset.wordStatus)));
  $('.km-known-toggle').addEventListener('click',()=>setWordStatus(knownWords.has(selected)?'learning':'known'));
  $('.km-open-card').addEventListener('click',()=>{$('.km-card-creator').hidden=false;loadDecks();if(selected&&candidates[candidateIndex]) generateCardFields(); else if(autoGenerateWordAudio && !capturedWordAudio && ($('.km-field-word').value.trim()||selected)) $('.km-generate-voice').click();});
  $('.km-close-card').addEventListener('click',()=>{$('.km-card-creator').hidden=true;});

  const dictionary=$('.km-miner');
  function placeDictionary() {
    const w=Math.min(Math.max(300,Math.min(460,innerWidth-24)),innerWidth-12);
    const h=Math.max(120,dictionary.offsetHeight || 360);
    if(dictionaryPosition){
      dictionary.style.left=(6+clamp(dictionaryPosition.x,0,1)*Math.max(0,innerWidth-w-12))+'px';
      dictionary.style.top=(6+clamp(dictionaryPosition.y,0,1)*Math.max(0,innerHeight-h-12))+'px';
    } else {
      const playerFrame=isGenericVideoSite&&embeddedCurrent()
        ?globalThis.KMVideoLayout.embeddedPlayerFrame(document,{host:embeddedPlayer.frameHost,viewport:{width:innerWidth,height:innerHeight}})
        :null;
      const box=playerFrame?.getBoundingClientRect()||video()?.getBoundingClientRect();
      const availableRight=sidebar.hidden?innerWidth:sidebar.getBoundingClientRect().left;
      const viewLeft=box&&box.width>=300?Math.max(0,box.left):0;
      const viewRight=box&&box.width>=300?Math.min(availableRight,box.right):availableRight;
      const midpoint=viewRight>viewLeft+140?(viewLeft+viewRight)/2:availableRight/2;
      dictionary.style.left=clamp(Math.round(midpoint-w/2),8,Math.max(8,innerWidth-w-8))+'px';
      dictionary.style.top=clamp(Math.round((innerHeight-h)/2),8,Math.max(8,innerHeight-h-8))+'px';
    }
  }
  const minerHead=$('.km-miner-head');
  minerHead.title='Drag to move dictionary';
  let dictionaryDrag=null;
  minerHead.addEventListener('pointerdown',e=>{
    if(e.button!==0 || e.target.closest('button,input'))return;
    const r=dictionary.getBoundingClientRect();
    dictionaryDrag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};
    minerHead.setPointerCapture(e.pointerId);e.preventDefault();
  });
  minerHead.addEventListener('pointermove',e=>{
    if(!dictionaryDrag || dictionaryDrag.id!==e.pointerId)return;
    const width=dictionary.offsetWidth,height=dictionary.offsetHeight;
    const x=clamp(dictionaryDrag.left+e.clientX-dictionaryDrag.x,6,Math.max(6,innerWidth-width-6));
    const y=clamp(dictionaryDrag.top+e.clientY-dictionaryDrag.y,6,Math.max(6,innerHeight-height-6));
    dictionary.style.left=x+'px';dictionary.style.top=y+'px';
    dictionaryPosition={x:(x-6)/Math.max(1,innerWidth-width-12),y:(y-6)/Math.max(1,innerHeight-height-12)};
  });
  async function stopDictionaryDrag(e){
    if(!dictionaryDrag || dictionaryDrag.id!==e.pointerId)return;
    dictionaryDrag=null;
    if(minerHead.hasPointerCapture(e.pointerId))minerHead.releasePointerCapture(e.pointerId);
    if(dictionaryPosition){dictionaryPositions[site]=dictionaryPosition;await chrome.storage.local.set({kotobaDictionaryPositions:dictionaryPositions});}
  }
  minerHead.addEventListener('pointerup',stopDictionaryDrag);
  minerHead.addEventListener('pointercancel',stopDictionaryDrag);
  window.addEventListener('resize',placeDictionary);
  if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(!dictionary.hidden&&!dictionaryDrag)placeDictionary();}).observe(dictionary);
  $('.km-miner-close').addEventListener('click',()=>{$('.km-miner').hidden=true;});
  $('.km-search-row').addEventListener('submit',e=>{e.preventDefault();selectWord($('.km-query').value);});
  function updateSaveTarget() {
    const deck=deckSelect.value, button=$('.km-save'); button.disabled=!deck || deckSelect.disabled;
    button.textContent=deck?`＋ Add to “${deck}”`:'Select an Anki deck to save';
  }
  async function loadDecks() {
    const id=++deckLoadId;
    const notice=$('.km-deck-notice'); deckSelect.disabled=true; notice.classList.remove('error'); notice.textContent='Loading decks from Anki…';updateSaveTarget();
    try {
      const reply=await chrome.runtime.sendMessage({type:'ANKI_DECKS'});
      if(id!==deckLoadId)return;
      if(!reply?.ok || !Array.isArray(reply.decks)) throw Error(reply?.error || 'Could not fetch decks.');
      const {deck:saved=''}=await chrome.storage.local.get({deck:''}); if(id!==deckLoadId)return;
      const decks=[...new Set(reply.decks)].sort((a,b)=>a.localeCompare(b));
      deckSelect.replaceChildren(); const blank=document.createElement('option');blank.value='';blank.textContent='— Choose a deck —';deckSelect.append(blank);
      for(const name of decks) { const option=document.createElement('option'); option.value=name;option.textContent=name;deckSelect.append(option); }
      deckSelect.value=decks.includes(saved)?saved:'';deckSelect.disabled=!decks.length;
      notice.textContent=deckSelect.value?`Destination: ${deckSelect.value}`:'Choose an Anki deck before saving.';
    } catch(err) {
      if(id!==deckLoadId)return;
      deckSelect.replaceChildren(); const option=document.createElement('option'); option.value='';option.textContent='Anki offline — retry ↻';deckSelect.append(option);
      notice.classList.add('error');notice.textContent=err.message || 'Open Anki Desktop and retry.';
    }
    updateSaveTarget();
  }
  $('.km-refresh-decks').addEventListener('click',loadDecks);
  deckSelect.addEventListener('change',async ()=>{
    const deck=deckSelect.value;await chrome.storage.local.set({deck});
    $('.km-deck-notice').textContent=deck?`Destination: ${deck}`:'Choose a deck to save.';
    $('.km-save-notice').textContent='';updateSaveTarget();
  });
  async function summariseSubtitles(){
    const text=cues.map(c=>c.text).join('\n').slice(0,7900);
    if(!text){voiceStatus('Load a transcript before asking the AI to summarise.',true);return;}
    const button=$('.km-menu-dismiss');
    voiceStatus('✦ Asking your local AI to summarise the loaded subtitles…');
    try{
      const r=await chrome.runtime.sendMessage({type:'AI_ASSIST',mode:'summary',text});
      const pane=$('.km-ai-summary-result');pane.replaceChildren();pane.hidden=false;
      addText(pane,'km-ai-summary-title','✦ Local AI · transcript summary');
      addText(pane,'km-ai-summary-text',r?.ok?r.text:r?.error||'Install Ollama and choose a model in Settings.');
      pane.scrollIntoView({block:'nearest'});
    }catch(err){voiceStatus(err.message||'Local AI failed',true);}
  }
  root.querySelectorAll('.km-ai-summary').forEach(b=>b.addEventListener('click',summariseSubtitles));

  // A true one-key card workflow: no timed video recording, no hidden save on failure.
  // Uses the last hovered/selected word; a Japanese word must be chosen explicitly.
  async function captureQuickFrame(){
    const player=video();
    if(!player || !player.videoWidth || !player.videoHeight)throw Error('No accessible video frame. Choose a playable HTML5 video.');
    const canvas=document.createElement('canvas');
    const scale=Math.min(1,960/player.videoWidth);
    canvas.width=Math.max(1,Math.round(player.videoWidth*scale));
    canvas.height=Math.max(1,Math.round(player.videoHeight*scale));
    canvas.getContext('2d',{alpha:false}).drawImage(player,0,0,canvas.width,canvas.height);
    try {
      const data=canvas.toDataURL('image/jpeg',.76);
      return {data:data.slice(data.indexOf(',')+1),ext:'jpg'};
    } catch {
      // The ordinary canvas path may be tainted. Chrome can capture the visible
      // YouTube tab with the appropriate permission; crop to the player only.
      if(!isYT)throw Error('Protected or cross-origin video frame; no screenshot available.');
      const reply=await chrome.runtime.sendMessage({type:'CAPTURE_VISIBLE_FRAME'});
      if(!reply?.ok || !reply.dataUrl)throw Error(reply?.error||'Tab screenshot permission unavailable.');
      const source=new Image();
      await new Promise((resolve,reject)=>{source.onload=resolve;source.onerror=()=>reject(Error('Cannot decode screenshot'));source.src=reply.dataUrl;});
      const rect=player.getBoundingClientRect();
      const zoom=source.naturalWidth/Math.max(1,innerWidth);
      const sx=Math.max(0,rect.left*zoom),sy=Math.max(0,rect.top*zoom);
      const sw=Math.min(source.naturalWidth-sx,rect.width*zoom);
      const sh=Math.min(source.naturalHeight-sy,rect.height*zoom);
      if(sw<10||sh<10)throw Error('The video is outside the visible browser window.');
      const cropped=document.createElement('canvas');
      const shrink=Math.min(1,960/sw);cropped.width=Math.round(sw*shrink);cropped.height=Math.round(sh*shrink);
      cropped.getContext('2d',{alpha:false}).drawImage(source,sx,sy,sw,sh,0,0,cropped.width,cropped.height);
      const data=cropped.toDataURL('image/jpeg',.72);
      return {data:data.slice(data.indexOf(',')+1),ext:'jpg'};
    }
  }
  // Q audio-only capture, user-triggered. Only MediaStream audio from accessible HTML5 players.
  // No tab audio interception or DRM circumvention. Keeps the screenshot separate.
  async function captureQuickSourceAudio(cue,word=''){
    if(!cue)throw Error('A timed subtitle is required for source audio.');
    const player=video();const span=CueContext.audioWindow(miningPlan(cue,word),offsetForSource());
    const start=span.start/1000,end=Math.min(span.end/1000,Number.isFinite(player?.duration)?Math.max(0,player.duration-.06):Infinity);
    if(!player || !Number.isFinite(start)||!Number.isFinite(end) || !(end-start>=.35 && end-start<=18))throw Error('Timed subtitle audio unavailable.');
    if(typeof player.captureStream!=='function' || typeof MediaRecorder==='undefined')throw Error('This player does not expose recordable audio.');
    const mime=['audio/webm;codecs=opus','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));
    if(!mime)throw Error('Audio-only WebM encoding unavailable.');
    const before={time:player.currentTime,paused:player.paused,rate:player.playbackRate};
    let stream=null,recorder=null;
    try{
      player.pause();player.playbackRate=1;
      player.currentTime=Math.max(0,start);
      await new Promise((resolve,reject)=>{
        if(Math.abs(player.currentTime-start)<.2){resolve();return;}
        const timer=setTimeout(()=>{player.removeEventListener('seeked',onSeek);reject(Error('Could not seek to the subtitle start.'));},2600);
        function onSeek(){clearTimeout(timer);player.removeEventListener('seeked',onSeek);resolve();}
        player.addEventListener('seeked',onSeek);
      });
      stream=player.captureStream();
      const tracks=stream?.getAudioTracks()||[];
      if(!tracks.length)throw Error('The player exposes no audio track (often due to DRM).');
      const chunks=[];recorder=new MediaRecorder(new MediaStream(tracks),{mimeType:mime,audioBitsPerSecond:64000});
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.start(200);
      await player.play();
      await new Promise((resolve,reject)=>{
        const deadline=Date.now()+Math.ceil((end-start)*1000)+6500;
        const watch=setInterval(()=>{
          if(player.currentTime>=end-.045){clearInterval(watch);resolve();}
          else if(Date.now()>deadline||player.ended||player.error){clearInterval(watch);reject(Error('Audio playback did not reach the sentence end.'));}
        },70);
      });
      await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(Error('Audio recording timeout.')),3800);
        recorder.addEventListener('stop',()=>{clearTimeout(timer);resolve();},{once:true});
        recorder.addEventListener('error',()=>{clearTimeout(timer);reject(Error('MediaRecorder failed.'));},{once:true});
        recorder.stop();
      });
      const blob=new Blob(chunks,{type:'audio/webm'});
      return await blobMedia(blob,'webm',5500000);
    } finally {
      if(recorder && recorder.state!=='inactive')try{recorder.stop();}catch{}
      stream?.getTracks().forEach(t=>t.stop());
      try{player.pause();player.currentTime=before.time;player.playbackRate=before.rate;
        if(!before.paused)await player.play();}catch{}
    }
  }

  async function quickCreateCard(target=lastMiningTarget){
    if(quickSaveBusy)return;
    if(!target?.word){voiceStatus('Hover or click a Japanese word first, then press Q.',true);return;}
    const word=String(target.word).trim().slice(0,80);
    if(!word){voiceStatus('Select a Japanese word first.',true);return;}
    quickSaveBusy=true;
    voiceStatus(`🪄 Creating ${word}…`);
    try {
      const stored=await chrome.storage.local.get({deck:'',sentenceTranslation:false});
      const deck=stored.deck;
      if(!deck)throw Error('Choose an Anki deck in the Kotoba popup before pressing Q.');
      // Check deck before doing any more work, so the fast path cannot make a silent destination.
      const decks=await chrome.runtime.sendMessage({type:'ANKI_DECKS'});
      if(!decks?.ok||!decks.decks?.includes(deck))throw Error('Anki is offline or the selected deck no longer exists. Open Anki and refresh decks.');
      const source=sourceSnapshot(target.cue || currentCue(),word);
      if(!source.sentence)throw Error('No Japanese subtitle sentence selected. Load subtitles first.');
      const picture=await captureQuickFrame();
      let entry=target.entry;
      if(!entry){
        const reply=await chrome.runtime.sendMessage({type:'LOOKUP',query:word,lemma:target.lemma||word});
        if(!reply?.ok)throw Error(reply?.error||'Dictionary lookup failed.');
        entry=reply.results?.[0];
      }
      if(!entry?.meanings?.length)throw Error('No Japanese meaning found for the selected word. Open the editor to supply one.');
      let translation='';
      if(stored.sentenceTranslation===true){
        try {const response=await chrome.runtime.sendMessage({type:'TRANSLATE',sentence:source.sentence});if(response?.ok)translation=response.text||'';}catch{}
      }
      let sourceAudio=null;let audioWarning='';
      try{
        voiceStatus('♫ Recording original subtitle audio…');
        sourceAudio=await captureQuickSourceAudio(target.cue||currentCue(),word);
      }catch(err){audioWarning=err.message||'Original audio unavailable';}
      let wordAudio=null;
      if(autoGenerateWordAudio){
        try {const response=await chrome.runtime.sendMessage({type:'WORD_TTS',word:entry.reading||word});if(response?.ok&&response.audio)wordAudio=response.audio;}catch{}
      }
      const card={...source,word,reading:entry.reading||'',meaning:entry.meanings[0],sentence:source.sentence,translation,image:picture,audio:sourceAudio,wordAudio};
      const saved=await chrome.runtime.sendMessage({type:'ANKI_ADD',deck,card});
      if(!saved?.ok)throw Error(saved?.error||'Anki rejected this card.');
      voiceStatus(sourceAudio?`✓ Saved ${word} with screenshot + original audio to ${saved.deck}.`:`✓ Saved ${word} with screenshot; no source audio (${audioWarning}).`,!sourceAudio);
      $('.km-save-notice').textContent=`✓ Quick saved ${word} to ${saved.deck}. ${sourceAudio?'Original sentence audio attached.':'Original audio unavailable: '+audioWarning}`;
    }catch(err){voiceStatus(`Quick create: ${err.message||'Failed'}`,true);}
    finally{quickSaveBusy=false;}
  }
  $('.km-quick-save').addEventListener('click',()=>quickCreateCard());
  $('.km-save').addEventListener('click', async ()=>{
    const entry=candidates[candidateIndex], deck=deckSelect.value;
    if (!entry || !deck || deckSelect.disabled) return;
    const notice=$('.km-save-notice');const button=$('.km-save');button.disabled=true;notice.classList.remove('error');notice.textContent='Sending to Anki…';
    try {
      const reply=await chrome.runtime.sendMessage({type:'ANKI_ADD',deck,card:{word:$('.km-field-word').value.trim()||selected||entry.word,reading:$('.km-field-reading').value.trim(),meaning:$('.km-textarea').value.trim(),...context,sentence:$('.km-field-sentence').value.trim(),translation:$('.km-field-translation').value.trim(),image:capturedImage,audio:capturedAudio,wordAudio:capturedWordAudio,clip:capturedClip}});
      if(!reply?.ok) throw Error(reply?.error || 'Could not save card.');
      notice.textContent=`✓ Saved to “${reply.deck}” (Anki note ${reply.noteId}). The word is now tracked; it becomes known when marked or mature.`;
    } catch(err) {notice.classList.add('error');notice.textContent=err.message || 'Anki connection failed.';}
    finally {updateSaveTarget();}
  });
  $('.km-pitch-file').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    const notice=$('.km-pitch-import-status');
    try{
      if(file.size<50000 || file.size>9500000)throw Error('Choose the original accents.txt (50 KB–9.5 MB).');
      const raw=await file.text();
      if(!raw.includes('\t') || raw.split('\n').length<1000)throw Error('File does not look like a pitch-accent TSV.');
      await chrome.storage.local.set({pitchDataset:raw});
      const reply=await chrome.runtime.sendMessage({type:'PITCH_RESET'});
      if(!reply?.ok)throw Error(reply?.error || 'Unable to load imported dataset');
      pitchCache.clear();pitchApprox.clear();notice.textContent='✓ Local accent list loaded. Refreshing pitch colours…';
      await requestPitchForVisible();
    } catch(err){notice.textContent=err.message;}
    e.target.value='';
  });
  // Media is captured only on direct user action. Nothing is uploaded until Save to Anki.
  function clearMedia() {
    capturedImage=null; capturedAudio=null; capturedWordAudio=null;capturedClip=null;capturedCueStart=null;
    $('.km-scene-preview').replaceChildren(document.createTextNode('No screenshot yet'));
    $('.km-audio-state').textContent='No source recording';
    $('.km-word-audio-state').textContent='No generated audio attached';
    $('.km-clip-state').textContent='Not recorded';
    for(const selector of ['.km-word-audio-player','.km-source-audio','.km-clip-preview']){const node=$(selector);node.pause();node.removeAttribute('src');node.hidden=true;}
  }
  function previewMedia(selector,media,type) {
    const node=$(selector);node.pause();
    node.src=`data:${type};base64,${media.data}`;node.hidden=false;node.load();
  }
  async function blobMedia(blob,ext,limit=5500000){
    if(blob.size<120)throw Error('No usable media frames recorded.');
    if(blob.size>limit)throw Error(`Capture is too big (${(blob.size/1e6).toFixed(1)} MB). Try a shorter line or upload a compressed clip.`);
    const text=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(Error('Could not read media'));r.readAsDataURL(blob);});
    return {data:text.slice(text.indexOf(',')+1),ext};
  }
  $('.km-clear-media').addEventListener('click',clearMedia);
  $('.km-grab-frame').addEventListener('click',()=>{
    const player=video();const box=$('.km-scene-preview');
    if(!player || !player.videoWidth) {box.textContent='No video frame available';return;}
    try {
      const canvas=document.createElement('canvas');
      const scale=Math.min(1,960/player.videoWidth);
      canvas.width=Math.max(1,Math.round(player.videoWidth*scale));
      canvas.height=Math.max(1,Math.round(player.videoHeight*scale));
      canvas.getContext('2d',{alpha:false}).drawImage(player,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/jpeg',.78); // Throws on cross-origin/DRM media.
      capturedImage={data:data.slice(data.indexOf(',')+1),ext:'jpg'};
      const img=document.createElement('img');img.alt='Captured subtitle scene';img.src=data;
      box.replaceChildren(img);
    } catch(err) {box.textContent='Protected or cross-origin video: use Upload image instead.';}
  });
  async function readMedia(file,kind) {
    if(!file || file.size>(kind==='clip'?12_000_000:kind==='image'?3_000_000:5_500_000)) throw Error('Media exceeds size limit for '+kind+'.');
    const allowed=kind==='image' ? /^image\/(?:jpeg|png|webp)$/ : kind==='clip'?/^video\/(?:webm|mp4)$/:/^audio\/(?:webm|ogg|wav|mpeg|mp4|x-m4a)$/;
    if(!allowed.test(file.type))throw Error('Unsupported media format.');
    const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(Error('Read failed'));r.readAsDataURL(file);});
    return {data:data.slice(data.indexOf(',')+1),ext:(file.name.split('.').pop()||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,5)||'bin'};
  }
  $('.km-upload-image').addEventListener('change',async e=>{
    try {const file=e.target.files[0];capturedImage=await readMedia(file,'image');const img=document.createElement('img');img.alt='Uploaded frame';img.src=URL.createObjectURL(file);$('.km-scene-preview').replaceChildren(img);} catch(err){$('.km-scene-preview').textContent=err.message;}e.target.value='';
  });
  $('.km-upload-audio').addEventListener('change',async e=>{
    try {capturedAudio=await readMedia(e.target.files[0],'audio');$('.km-audio-state').textContent='✓ Original audio attached';previewMedia('.km-source-audio',capturedAudio,'audio/'+(capturedAudio.ext==='wav'?'wav':'webm'));} catch(err){$('.km-audio-state').textContent=err.message;}e.target.value='';
  });
  // Browser speech is preview-only: Chrome does not expose its samples to save.
  $('.km-word-voice').addEventListener('click',async()=>{
    if(capturedWordAudio){const player=$('.km-word-audio-player');player.currentTime=0;player.play().catch(err=>{$('.km-word-audio-state').textContent='Audio preview failed: '+err.message;});return;}
    const ok=await speakJapanese($('.km-field-word').value.trim());
    $('.km-word-audio-state').textContent=ok?'▶ Spoken pronunciation preview. For an attachable WAV, generate with VOICEVOX.':'Pronunciation unavailable. See voice troubleshooting notice.';
  });
  $('.km-upload-word-audio').addEventListener('change',async e=>{
    try {capturedWordAudio=await readMedia(e.target.files[0],'audio');$('.km-word-audio-state').textContent='✓ Word recording attached';previewMedia('.km-word-audio-player',capturedWordAudio,'audio/'+(capturedWordAudio.ext==='wav'?'wav':'webm'));}
    catch(err){$('.km-word-audio-state').textContent=err.message;}e.target.value='';
  });
  $('.km-upload-clip').addEventListener('change',async e=>{
    try {capturedClip=await readMedia(e.target.files[0],'clip');$('.km-clip-state').textContent='✓ Uploaded scene clip';previewMedia('.km-clip-preview',capturedClip,'video/'+capturedClip.ext);}
    catch(err){$('.km-clip-state').textContent=err.message;} e.target.value='';
  });
  $('.km-generate-voice').addEventListener('click',async()=>{
    const btn=$('.km-generate-voice'),label=$('.km-word-audio-state'),word=$('.km-field-word').value.trim()||selected;
    if(!word){label.textContent='Choose a Japanese word first';return;}
    btn.disabled=true;label.textContent='Generating Japanese WAV with local VOICEVOX…';
    try {const reply=await chrome.runtime.sendMessage({type:'WORD_TTS',word});
      if(!reply?.ok || !reply.audio)throw Error(reply?.error||'VOICEVOX unavailable');
      capturedWordAudio=reply.audio;
      previewMedia('.km-word-audio-player',capturedWordAudio,'audio/wav');
      label.textContent=`✓ Generated WAV attached · ${reply.voice} (synthetic Japanese)`;
    }catch(e){label.textContent=e.message||'VOICEVOX not running';}finally{btn.disabled=false;}
  });
  function pickCaptureCue() {
    const current=currentCue();if(current)return current;
    if(context?.cueStart!==null && context?.cueStart!==undefined) {
      const matched=cues.find(c=>c.start===context.cueStart);if(matched)return matched;
    }
    return null;
  }
  // User-triggered recording only. No tabAudio interception, microphone access, or DRM bypass.
  async function captureSentence() {
    if(captureBusy)return;
    const btn=$('.km-record-scene'), audioLabel=$('.km-audio-state'), clipLabel=$('.km-clip-state'),player=video();
    const cue=pickCaptureCue();
    if(!cue){clipLabel.textContent='No timed Japanese subtitle selected. Load a transcript and seek to a line first.';$('.km-card-creator').hidden=false;return;}
    if(!player || typeof player.captureStream!=='function' || typeof MediaRecorder==='undefined'){
      clipLabel.textContent='This player does not expose recordable media. Import your own video/audio instead.';$('.km-card-creator').hidden=false;return;
    }
    const span=CueContext.audioWindow(miningPlan(cue,selected),offsetForSource());
    const start=span.start/1000,end=Math.min(span.end/1000,Number.isFinite(player?.duration)?Math.max(0,player.duration-.06):Infinity);
    if(!(end>start && end-start<=90)) {clipLabel.textContent='Subtitle timing is missing or longer than 90 seconds. Use an imported timed track.';return;}
    const before={paused:player.paused,time:player.currentTime,rate:player.playbackRate};
    let stream=null,videoRec=null,audioRec=null,recordingError='';
    const all=[];
    captureBusy=true;btn.disabled=true;btn.classList.add('is-recording');
    $('.km-card-creator').hidden=false;
    if(!selected) $('.km-save-notice').textContent='Capturing this sentence. Click a vocabulary word afterwards to create its Anki card.';
    capturedCueStart=cue.start;
    const audioChunks=[],videoChunks=[];
    try {
      player.pause();player.playbackRate=1;player.currentTime=start;
      await new Promise((resolve,reject)=>{
        let timeout=setTimeout(()=>reject(Error('Video could not seek to this subtitle.')),2500);
        if(Math.abs(player.currentTime-start)<0.15){clearTimeout(timeout);resolve();return;}
        player.addEventListener('seeked',function done(){player.removeEventListener('seeked',done);clearTimeout(timeout);resolve();},{once:false});
      });
      await player.play();
      await new Promise(r=>setTimeout(r,150));
      // Screenshot at the beginning of this specific subtitle scene.
      try {
        const canvas=document.createElement('canvas');
        if(player.videoWidth<2 || player.videoHeight<2)throw Error('Video frame unavailable');
        const scale=Math.min(1,900/player.videoWidth);
        canvas.width=Math.round(player.videoWidth*scale);canvas.height=Math.round(player.videoHeight*scale);
        canvas.getContext('2d').drawImage(player,0,0,canvas.width,canvas.height);
        const data=canvas.toDataURL('image/jpeg',.73);
        capturedImage={data:data.split(',')[1],ext:'jpg'};
        const image=document.createElement('img');image.alt='Scene frame';image.src=data;$('.km-scene-preview').replaceChildren(image);
      }catch{ $('.km-scene-preview').textContent='Screenshot blocked by this player (can upload one).'; }
      stream=player.captureStream();
      if(!stream.getTracks().length)throw Error('Video has no exposed recordable tracks. This can happen with protected players.');
      const videoMime=['video/webm;codecs=vp8,opus','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
      const audioMime=['audio/webm;codecs=opus','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));
      if(stream.getVideoTracks().length && videoMime){
        videoRec=new MediaRecorder(stream,{mimeType:videoMime,videoBitsPerSecond:1_000_000,audioBitsPerSecond:64000});
        videoRec.ondataavailable=e=>{if(e.data.size)videoChunks.push(e.data);};
        videoRec.start(250);all.push(videoRec);
      }
      if(stream.getAudioTracks().length && audioMime){
        audioRec=new MediaRecorder(new MediaStream(stream.getAudioTracks()),{mimeType:audioMime,audioBitsPerSecond:64000});
        audioRec.ondataavailable=e=>{if(e.data.size)audioChunks.push(e.data);};
        audioRec.start(250);all.push(audioRec);
      }
      if(!all.length)throw Error('This browser cannot encode the player tracks into WebM.');
      audioLabel.textContent=audioRec?'● Recording original source sound…':'No original audio track exposed by this player';
      clipLabel.textContent=`● Recording ${((end-start)).toFixed(1)} seconds from subtitle timeline…`;
      // Stop according to video playback time rather than a fixed 4-second wall clock.
      await new Promise((resolve,reject)=>{
        const deadline=Date.now()+Math.ceil((end-start)*1000)+11000;
        const watcher=setInterval(()=>{
          if(player.currentTime>=end-.045){clearInterval(watcher);resolve();}
          else if(Date.now()>deadline || player.ended){clearInterval(watcher);reject(Error('Playback stopped before subtitle end. Try again.'));}
        },60);
      });
      await Promise.all(all.map(rec=>new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(Error('Encoding timed out')),3500);
        rec.addEventListener('stop',()=>{clearTimeout(timeout);resolve();},{once:true});
        rec.addEventListener('error',()=>{clearTimeout(timeout);reject(Error('Recorder failed'));},{once:true});
        if(rec.state!=='inactive')rec.stop();else{clearTimeout(timeout);resolve();}
      })));
      if(videoChunks.length){
        const clip=new Blob(videoChunks,{type:'video/webm'});capturedClip=await blobMedia(clip,'webm',12_000_000);
        previewMedia('.km-clip-preview',capturedClip,'video/webm');
        clipLabel.textContent=`✓ Scene video attached · ${(clip.size/1e6).toFixed(2)} MB`;
      }else clipLabel.textContent='No video track was available; audio capture attempted.';
      if(audioChunks.length){
        const blob=new Blob(audioChunks,{type:'audio/webm'});capturedAudio=await blobMedia(blob,'webm',5_500_000);
        previewMedia('.km-source-audio',capturedAudio,'audio/webm');
        audioLabel.textContent=`✓ Original sentence audio attached · ${(blob.size/1000).toFixed(0)} KB`;
      } else audioLabel.textContent='Player provided no audio track. Upload source audio if available.';
      const cardSource=sourceSnapshot(cue,selected);
      if(!selected){context=cardSource;}else{$('.km-field-sentence').value=cardSource.sentence;}
      $('.km-save-notice').textContent='✓ Subtitle-timed capture finished. Screenshot, clip and audio are separate fields; review before saving.';
    }catch(err){recordingError=err.message||'Scene recording failed';clipLabel.textContent=recordingError;
      $('.km-save-notice').textContent='Recording unavailable: '+recordingError+' — upload media instead.';
    }finally{
      for(const rec of all)if(rec.state==='recording')try{rec.stop();}catch{}
      stream?.getTracks().forEach(t=>t.stop());
      try{player.pause();player.currentTime=before.time;player.playbackRate=before.rate;if(!before.paused)await player.play();}catch{}
      captureBusy=false;btn.disabled=false;btn.classList.remove('is-recording');
    }
  }
  $('.km-record-scene').addEventListener('click',captureSentence);
  async function generateCardFields(){
    const entry=candidates[candidateIndex];
    if(!entry){$('.km-save-notice').textContent='Choose a word from the subtitle or dictionary first.';return;}
    $('.km-field-word').value=selected || entry.word;
    $('.km-field-reading').value=entry.reading || '';
    $('.km-textarea').value=(entry.meanings||[]).slice(0,4).join('; ');
    $('.km-field-sentence').value=context?.sentence || $('.km-field-sentence').value || '';
    $('.km-field-translation').value='';
    if(!context?.sentence){$('.km-save-notice').textContent='✓ Meaning generated. Select or capture a subtitle line to also generate the sentence translation.';return;}
    $('.km-save-notice').textContent='Generating English meaning and sentence translation…';
    try {
      const res=await chrome.runtime.sendMessage({type:'TRANSLATE',sentence:context.sentence});
      if(res?.ok && res.text){
        $('.km-field-translation').value=res.text;
        $('.km-save-notice').textContent='✓ Meaning, sentence and English translation generated. Review before saving.';
      } else {
        $('.km-save-notice').textContent='✓ Meaning generated. Sentence translation is unavailable right now.';
      }
    } catch(err){
      $('.km-save-notice').textContent='✓ Meaning generated. Sentence translation failed: '+(err.message||'Unavailable');
    }
    if(autoGenerateWordAudio && !capturedWordAudio) setTimeout(()=>$('.km-generate-voice')?.click(),120);
  }
  $('.km-generate').addEventListener('click',generateCardFields);
  $('.km-generate-all').addEventListener('click',generateCardFields);
  // Shortcuts only run while immersion is active; never steal keystrokes from text fields.
  function cycleSubtitle(direction) {
    if(!cues.length)return;
    const now=U.activeIndex(cues,demoSeconds()*1000);
    const next=clamp((now<0?0:now)+direction,0,cues.length-1);
    seekCue(cues[next]);
  }
  const hotkeyActions={
    toggleTranscript:()=>$('.km-show-rail').click(),previous:()=>cycleSubtitle(-1),next:()=>cycleSubtitle(1),
    replay:()=>replaySentence(),loop:()=>toggleSentenceLoop(),subtitles:()=>$('.km-video-toggle').click(),
    pauseHover:()=>$('.km-pause-hover').click(),subtitleLanguage:()=>setSubtitleLanguage(subtitleModes.cycle(subtitleLanguageMode)),dictionary:()=>$('.km-open-dict').click(),
    card:()=>{if(selected&&candidates[candidateIndex])$('.km-open-card').click();else{$('.km-open-dict').click();status('Choose a Japanese word to make a card.');}},
    capture:()=>quickCreateCard(),known:()=>setHoveredWordStatus('known'),learning:()=>setHoveredWordStatus('learning'),
    unknown:()=>setHoveredWordStatus('unknown'),track:()=>setHoveredWordStatus('track'),ignore:()=>setHoveredWordStatus('ignore')
  };
  document.addEventListener('keydown',e=>{
    if(!displayEnabled() || e.repeat || e.isComposing)return;
    const t=e.target;
    if(t?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/i.test(t?.tagName||''))return;
    const key=KMKeys.fromEvent(e);if(!key)return;
    const match=Object.keys(hotkeyActions).find(action=>hotkeys[action]===key);
    if(!match)return;
    e.preventDefault();e.stopPropagation();hotkeyActions[match]();
  },true);
  document.addEventListener('mouseup',e=>{
    if(!displayEnabled() || root.contains(e.target)) return;
    const text=String(window.getSelection() || '').trim();
    if(text && text.length<=80 && !text.includes('\n')) selectWord(text);
  });

  function resetForNavigation() {
    previousVideoId = location.pathname + location.search;
    ++currentTrackRequest; lastRequestedKey='';loadingTrack=false;englishCues=[];englishSource='';lastEnglishTrack=null;lastEnglishTrackSignature='';englishLastRequestKey='';++englishRequestSerial;displayedEnglishText=''; jpAutoRequestedFor=''; lastSelectedTrack=null;
    cues=[]; trackedCaptions=[]; cueSource='';lastCaption='';active=-1; filter='';$('.km-filter').value='';
    selected='';context=null;candidates=[];candidateIndex=0;lastMiningTarget=null;hoveredStudyWord=null;hoveredLookupToken=null;clearTimeout(hoverLookupKeyTimer);
    loopCueStart=null;lastPlaybackCueStart=null;sentenceLoop=false;$('.km-loop-label').textContent='OFF';switchTranscriptView('all');
    shownVideoText='';hoverTranslationVisible=false;$('.km-video-japanese').replaceChildren();$('.km-video-translation').hidden=true;
    updateCoverage();
    renderCues();status('Looking for Japanese subtitles…');
    updateDisplay();
    if(displayEnabled()) { requestTrackInfo(); setTimeout(requestTrackInfo,950); setTimeout(requestTrackInfo,2600); }
  }
  // Only extension-internal frame reports arrive here. Page scripts cannot
  // spoof chrome.runtime messages. The background validates both permissions.
  chrome.runtime.onMessage.addListener((message)=>{
    if(!isGenericVideoSite || message?.type!=='KOTOBA_EMBEDDED_CAPTIONS')return;
    const p=message.report;
    if(!p?.video)return;
    const switchFrame=embeddedPlayer.frameId!==message.frameId;
    if(switchFrame && embeddedCurrent() && (cues.length||embeddedPlayer.text) && !p.hasCaptions)return;
    embeddedPlayer={video:true,time:Number(p.time)||0,paused:!!p.paused,text:String(p.text||''),englishText:String(p.englishText||''),updated:Date.now(),frameId:message.frameId,frameHost:String(message.frameHost||'')};
    if(switchFrame && cueSource?.startsWith('Embedded')){
      trackedCaptions=[];cues=[];cueSource='';lastCaption='';
    }
    if(Array.isArray(p.cues)&&p.cues.length){
      const source='Embedded HTML5 Japanese track';
      if(cueSource!==source || cues.length!==p.cues.length || cues[0]?.start!==p.cues[0]?.start || cues.at(-1)?.end!==p.cues.at(-1)?.end){
        setCues(p.cues,source);
      }
    }
    if(Array.isArray(p.englishCues)&&p.englishCues.length){englishCues=U.normalize(p.englishCues);englishSource='Embedded HTML5 English track';}
    updateDisplay();
    if(displayEnabled() && !cues.length && embeddedPlayer.text)captureLive();
    syncActive();renderVideoSubtitle();
  });
  let lastUniversalVideo=null;
  function tick() {
    if(isGenericVideoSite){
      const next=video();
      if(lastUniversalVideo && next && next!==lastUniversalVideo)resetForNavigation();
      lastUniversalVideo=next;
    }
    const id=location.pathname+location.search;
    if(id!==previousVideoId) resetForNavigation();
    if(displayEnabled()){
      const player=video(),current=currentCue();
      if(sentenceLoop && isGenericVideoSite && embeddedCurrent() && loopCueStart!==null && !captureBusy){
        const cue=cues.find(x=>x.start===loopCueStart);
        if(cue && embeddedPlayer.time*1000 >= cue.end-80 && !embeddedPlayer.paused)seekCue(cue);
      }else if(sentenceLoop && player && loopCueStart!==null && !captureBusy){
        const cue=cues.find(x=>x.start===loopCueStart);
        if(cue && player.currentTime*1000 >= cue.end-80 && !player.paused)player.currentTime=cue.start/1000;
      }else if((sentenceAutoPause||playMode==='step') && isGenericVideoSite && embeddedCurrent() && !embeddedPlayer.paused && current && lastPlaybackCueStart!==null && current.start!==lastPlaybackCueStart && !captureBusy){
        controlEmbedded('pause');
      }else if((sentenceAutoPause||playMode==='step') && player && !player.paused && current && lastPlaybackCueStart!==null && current.start!==lastPlaybackCueStart && !captureBusy){
        player.pause();player.currentTime=Math.max(0,(current.start-50)/1000);
      }
      if(current)lastPlaybackCueStart=current.start;
    }
    if(displayEnabled()) captureLive();
    if(isGenericVideoSite && onWatchPage() && displayEnabled()){
      const hasJapanese=Boolean(cues.length || liveCaption());
      launcher.title=hasJapanese?'語 Kotoba · Japanese captions detected · click for controls':'語 Kotoba · waiting for accessible Japanese captions · import SRT/VTT in transcript tools';
      launcher.dataset.captionStatus=hasJapanese?'detected':'waiting';
    }
    if(displayEnabled()) renderVideoSubtitle();
    renderPlayModeVisual();
    placeLauncher();
  }
  chrome.storage.local.get({enabled:true,siteEnabledV3:{},onVideoEnabled:true,coverageEnabled:false,pitchMode:'always',sentenceTranslation:false,kotobaSubtitleMode:'ja',autoJapaneseSubtitles:true,pauseOnHover:true,kotobaLookupHoverModifier:'alt',autoGenerateWordAudio:true,kotobaHotkeys:{},kotobaDictionaryPositions:{},knownWords:[],wordStatuses:{},kotobaTheme:'cotton-candy',kotobaLauncherPositions:{},kotobaSubtitleStyle:{},kotobaHideOriginalCaptions:true,kotobaFuriganaMode:'unknown',kotobaSentenceAutoPause:false,ankiVocabularyKnown:[],ankiVocabularyLearning:[],kotobaPlayMode:'normal',kotobaSubtitleOffsetMs:null}).then(settings=>{
    subtitleStyle=subtitleSettings.normalize(settings.kotobaSubtitleStyle);syncStudioInputs();
    subtitleOffsetMs=Number.isFinite(settings.kotobaSubtitleOffsetMs)?Math.max(-2500,Math.min(2500,settings.kotobaSubtitleOffsetMs)):null;
    $('.km-offset-value').textContent=offsetLabel();
    autoGenerateWordAudio=settings.autoGenerateWordAudio!==false;
    hideOriginalCaptions=settings.kotobaHideOriginalCaptions!==false;
    hotkeys=KMKeys.validate(settings.kotobaHotkeys);redrawShortcuts();
    lookupHoverMode=LookupHover.normalize(settings.kotobaLookupHoverModifier);
    masterEnabled=settings.enabled!==false;
    // Opt-in per site: an absent entry means OFF, including YouTube and Netflix.
    siteEnabled=isDemo || settings.siteEnabledV3?.[site]===true;
    onVideoEnabled=settings.onVideoEnabled!==false;coverageEnabled=settings.coverageEnabled===true;
    pitchMode=['always','hover','off'].includes(settings.pitchMode)?settings.pitchMode:'always';
    sentenceTranslation=!!settings.sentenceTranslation;subtitleLanguageMode=subtitleModes.normalize(settings.kotobaSubtitleMode);autoJapaneseSubtitles=settings.autoJapaneseSubtitles!==false;pauseOnHover=settings.pauseOnHover!==false;
    dictionaryPositions=settings.kotobaDictionaryPositions || {}; dictionaryPosition=dictionaryPositions[site] || null;placeDictionary();
    knownWords=new Set(settings.knownWords || []);wordStatuses=settings.wordStatuses||{};
    ankiVocabularyKnown=new Set(settings.ankiVocabularyKnown||[]);
    ankiVocabularyLearning=new Set(settings.ankiVocabularyLearning||[]);refreshCombinedKnown();
    furiganaMode=['off','all','unknown','hover'].includes(settings.kotobaFuriganaMode)?settings.kotobaFuriganaMode:'unknown';
    sentenceAutoPause=!!settings.kotobaSentenceAutoPause;setPlayMode(settings.kotobaPlayMode);
    applyTheme(settings.kotobaTheme);
    launcherPositions=settings.kotobaLauncherPositions && typeof settings.kotobaLauncherPositions==='object'?settings.kotobaLauncherPositions:{};
    customLauncherPosition=launcherPositions[site] || null;
    updateDisplay(); resetForNavigation();
    if(isDemo && !cues.length) setCues([
      {start:0,end:4500,text:'今日はいい天気ですね。'},
      {start:4500,end:9000,text:'私は日本語を勉強しています。'},
      {start:9000,end:13500,text:'この映画はとても面白いです。'},
      {start:13500,end:18000,text:'猫は家族と一緒に寝ています。'},
      {start:18000,end:23500,text:'明日、友達と学校へ行きます。'},
      {start:23500,end:28000,text:'どうぞよろしくお願いします。'}
    ],'Demo full transcript');
  });
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=='local')return;
    if(changes.kotobaSubtitleStyle){subtitleStyle=subtitleSettings.normalize(changes.kotobaSubtitleStyle.newValue);syncStudioInputs();updateDisplay();if(subtitleStyle.secondaryMode==='always')showAlwaysSubtitleTranslation();}
    if(changes.autoGenerateWordAudio) autoGenerateWordAudio=changes.autoGenerateWordAudio.newValue!==false;
    if(changes.kotobaHotkeys){hotkeys=KMKeys.validate(changes.kotobaHotkeys.newValue);redrawShortcuts();}
    if(changes.kotobaLookupHoverModifier){lookupHoverMode=LookupHover.normalize(changes.kotobaLookupHoverModifier.newValue);clearTimeout(hoverLookupKeyTimer);if(!glossPointerInside)gloss.hidden=true;}
    if(changes.enabled) {masterEnabled=changes.enabled.newValue!==false;updateDisplay();}
    if(changes.siteEnabledV3) {siteEnabled=isDemo || changes.siteEnabledV3.newValue?.[site]===true;updateDisplay();}
    if(changes.onVideoEnabled) {onVideoEnabled=changes.onVideoEnabled.newValue!==false;updateDisplay();}
    if(changes.kotobaHideOriginalCaptions){hideOriginalCaptions=changes.kotobaHideOriginalCaptions.newValue!==false;syncOriginalCaptions();}
    if(changes.coverageEnabled) {coverageEnabled=changes.coverageEnabled.newValue!==false;updateDisplay();}
    if(changes.pitchMode) {pitchMode=changes.pitchMode.newValue;updateDisplay();}
    if(changes.sentenceTranslation){sentenceTranslation=!!changes.sentenceTranslation.newValue;renderEnglishSubtitle();}
    if(changes.kotobaSubtitleMode){subtitleLanguageMode=subtitleModes.normalize(changes.kotobaSubtitleMode.newValue);renderVideoSubtitle();updateDisplay();}
    if(changes.kotobaSubtitleOffsetMs){subtitleOffsetMs=Number.isFinite(changes.kotobaSubtitleOffsetMs.newValue)?changes.kotobaSubtitleOffsetMs.newValue:null;applyOffset();}
    if(changes.autoJapaneseSubtitles){autoJapaneseSubtitles=changes.autoJapaneseSubtitles.newValue!==false;if(autoJapaneseSubtitles){jpAutoRequestedFor='';requestTrackInfo();}updateDisplay();}
    if(changes.pauseOnHover){pauseOnHover=changes.pauseOnHover.newValue!==false;updateDisplay();}
    if(changes.wordStatuses) {wordStatuses=changes.wordStatuses.newValue||{};updateCoverage();applyPitchStyles();updateWordStatusButtons();}
    if(changes.knownWords) {knownWords=new Set(changes.knownWords.newValue || []);refreshCombinedKnown();updateCoverage();applyPitchStyles();updateKnownButton();}
    if(changes.ankiVocabularyKnown||changes.ankiVocabularyLearning){
      if(changes.ankiVocabularyKnown)ankiVocabularyKnown=new Set(changes.ankiVocabularyKnown.newValue||[]);
      if(changes.ankiVocabularyLearning)ankiVocabularyLearning=new Set(changes.ankiVocabularyLearning.newValue||[]);
      refreshCombinedKnown();updateCoverage();renderCues();applyPitchStyles();
    }
    if(changes.kotobaFuriganaMode){furiganaMode=changes.kotobaFuriganaMode.newValue||'unknown';renderCues();shownVideoText='';renderVideoSubtitle();}
    if(changes.kotobaSentenceAutoPause)sentenceAutoPause=!!changes.kotobaSentenceAutoPause.newValue;
    if(changes.kotobaPlayMode)setPlayMode(changes.kotobaPlayMode.newValue);
    if (changes.kotobaTheme) applyTheme(changes.kotobaTheme.newValue);
    if(changes.kotobaLauncherPositions) {
      launcherPositions=changes.kotobaLauncherPositions.newValue || {};
      if (!draggingLauncher) {customLauncherPosition=launcherPositions[site] || null;placeLauncher();}
    }
    if(changes.deck && !deckSelect.disabled) {
      const desired=changes.deck.newValue;
      deckSelect.value=[...deckSelect.options].some(o=>o.value===desired)?desired:'';updateSaveTarget();
    }
  });
  // A conservative active-watching estimate for the study dashboard.
  // Only count foreground playback with actual progress; seek/paused time is excluded.
  let kmWatchLastTime=null;
  setInterval(()=>{
    const player=video();
    if(!player || isDemo || !displayEnabled() || document.visibilityState!=='visible' || !document.hasFocus() || player.paused || player.ended || captureBusy){
      kmWatchLastTime=null;return;
    }
    const now=Number(player.currentTime);
    if(kmWatchLastTime!==null && now>kmWatchLastTime+2 && now<kmWatchLastTime+65){
      chrome.runtime.sendMessage({type:'ACTIVITY_TICK',kind:'watch',seconds:20}).catch(()=>{});
    }
    kmWatchLastTime=now;
  },20000);
  setInterval(tick,600);
})();
