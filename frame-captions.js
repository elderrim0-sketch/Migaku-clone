/* Kotoba v1.12.2 embedded-player subtitle bridge. No private network or DRM access.
   Installed ONLY on an explicitly approved embedded video host. */
(()=>{
  'use strict';
  if(window===window.top || globalThis.__kotobaFrameCaptionsInstalled)return;
  globalThis.__kotobaFrameCaptionsInstalled=true;
  const adapter=globalThis.KMUniversalSubtitle;
  if(!adapter)return;
  const japanese=/[\u3040-\u30ff\u3400-\u9fff]/u;
  const clean=text=>String(text||'').replace(/<[^>]*>/g,'').replace(/[\u200b\u200e\u200f]/g,'').replace(/\s+/g,' ').trim().slice(0,300);
  let signature='',lastText='',lastSend=0,lastFull=0,previousVideo=null;
  let enSignature='',lastEnglishText='',lastEnglishFull=0;
  let hideOriginal=false;
  const suppressedTracks=new Set();
  function nativeCaptionVisibility(hidden){
    hideOriginal=!!hidden;
    document.documentElement.classList.toggle('km-hide-original-captions',hideOriginal);
    // With normal WebVTT tracks, hidden mode keeps activeCues readable
    // while eliminating the browser's duplicate rendering.
    const video=adapter.visibleVideo(document);
    if(hideOriginal&&video){
      for(const track of [...(video.textTracks||[])])if(adapter.japaneseTrack(track)&&track.mode==='showing'){
        try{track.mode='hidden';suppressedTracks.add(track);}catch{}
      }
    }else if(!hideOriginal){
      for(const track of suppressedTracks){
        try{if(track.mode==='hidden')track.mode='showing';}catch{}
      }
      suppressedTracks.clear();
    }
  }
  function report(){
    try{
      const p=adapter.probe(document,{auto:true,clean});
      if(hideOriginal)nativeCaptionVisibility(true);
      if(!p.video)return;
      const video=adapter.visibleVideo(document);
      if(!video)return;
      if(previousVideo!==video){signature='';lastText='';lastFull=0;enSignature='';lastEnglishText='';lastEnglishFull=0;previousVideo=video;}
      const time=Number(video.currentTime)||0;
      const cueSignature=p.cues.length ? [p.cues.length,p.cues[0]?.start,p.cues.at(-1)?.end].join(':'):'';
      const full=!!cueSignature && (cueSignature!==signature || Date.now()-lastFull>30000);
      const text=clean(p.text);
      const enTrack=[...(video.textTracks||[])].find(t=>/^(?:en(?:[-_].*)?|eng)$/i.test(t.language||'') || /\bEnglish\b/i.test(t.label||''));
      if(enTrack?.mode==='disabled')try{enTrack.mode='hidden';}catch{}
      const enCues=enTrack?.cues ? [...enTrack.cues].slice(0,12000).map(c=>({start:c.startTime*1000,end:c.endTime*1000,text:clean(c.text||'')})).filter(c=>c.text) : [];
      const nextEnSignature=enCues.length?[enCues.length,enCues[0]?.start,enCues.at(-1)?.end].join(':'):'';
      const englishText=clean(enTrack?.activeCues?.length ? [...enTrack.activeCues].map(c=>c.text||'').join(' '):'');
      const now=Date.now();
      const fullEnglish=!!nextEnSignature && (enSignature!==nextEnSignature || now-lastEnglishFull>30000);
      // Keep the top-page playback clock synced for word highlighting.
      if(!full && !fullEnglish && text===lastText && englishText===lastEnglishText && now-lastSend<1000)return;
      signature=cueSignature;
      lastText=text;lastEnglishText=englishText;lastSend=now;
      enSignature=nextEnSignature;if(fullEnglish)lastEnglishFull=now;
      if(full)lastFull=now;
      const report={video:true,hasCaptions:!!p.japanese,source:p.source,
        time:Math.max(0,Math.min(time,60*60*24)),paused:!!video.paused,
        text:japanese.test(text)?text:'',englishText,englishCues:fullEnglish?enCues:[],
        cues:full?p.cues.slice(0,12000).map(c=>({start:c.start,end:c.end,text:clean(c.text)})).filter(c=>japanese.test(c.text)):[]};
      chrome.runtime.sendMessage({type:'KOTOBA_FRAME_REPORT',report}).catch(()=>{});
    }catch{/* Page may be replacing the video or captions. Retry on next tick. */}
  }
  chrome.runtime.onMessage.addListener((message)=>{
    if(message?.type!=='KOTOBA_FRAME_CONTROL')return;
    const v=adapter.visibleVideo(document);
    if(!v)return;
    if(message.action==='original-captions'){nativeCaptionVisibility(message.hidden===true);return;}
    if(message.action==='seek' && Number.isFinite(Number(message.seconds)))v.currentTime=Math.max(0,Math.min(Number(message.seconds),24*60*60));
    else if(message.action==='pause')v.pause();
    else if(message.action==='play')v.play().catch(()=>{});
  });
  document.addEventListener('visibilitychange',report);
  setInterval(report,450);
  report();
})();
