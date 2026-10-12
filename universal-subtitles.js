/* Kotoba universal subtitle adapter. Reads only player-exposed captions; no network interception. */
(function(global){
  'use strict';
  const japanese=/[\u3040-\u30ff\u3400-\u9fff]/u;
  const langJapanese=/^(?:ja(?:[-_].*)?|jpn)$/i;
  const captionSelector=[
    '.vjs-text-track-display', '.jw-text-track-display',
    '.plyr__captions', '.shaka-text-container',
    '.clappr-captions', '.mejs__captions-layer',
    '[data-testid="subtitle"]', '[data-testid="captions"]',
    '[class*="subtitle" i]', '[class*="caption" i]'
  ].join(',');
  function japaneseTrack(track){
    if(!track)return false;
    const language=String(track.language||track.srclang||'').trim();
    const label=String(track.label||'').trim();
    return langJapanese.test(language) || /日本語|japanese|にほんご/i.test(label);
  }
  function visibleVideo(doc){
    const list=[...(doc?.querySelectorAll?.('video')||[])];
    const scored=list.map(video=>{
      const r=video.getBoundingClientRect?.()||{width:0,height:0,top:0,left:0};
      const visible=r.width>100&&r.height>65&&r.top<(doc.defaultView?.innerHeight||99999)&&r.left<(doc.defaultView?.innerWidth||99999)&&r.bottom>0&&r.right>0;
      return {video,score:(visible?10000000:0)+Math.min(2000000,r.width*r.height)+(video.readyState>0?10000:0)+(video.paused?0:100000)};
    }).sort((a,b)=>b.score-a.score);
    return scored[0]?.video||null;
  }
  function selectTrack(video,auto=true){
    const tracks=[...(video?.textTracks||[])];
    let best=tracks.find(t=>japaneseTrack(t)&&t.mode==='showing')||tracks.find(japaneseTrack);
    if(!best)return null;
    if(auto && best.mode==='disabled'){
      try{best.mode='hidden';}catch{}
    }
    return best;
  }
  function cuesFromTrack(track,clean){
    if(!track?.cues)return [];
    return [...track.cues].slice(0,15000).map(c=>({start:c.startTime*1000,end:c.endTime*1000,text:clean(c.text||'')})).filter(c=>c.text);
  }
  function activeTrackText(track,clean){
    if(!track?.activeCues?.length)return '';
    return clean([...track.activeCues].map(c=>c.text||'').join(' '));
  }
  function playerCaption(doc,video,clean){
    if(!video)return '';
    const bounds=video.getBoundingClientRect();
    const roots=[video.parentElement,video.parentElement?.parentElement,video.closest('[class*="player" i]')].filter(Boolean);
    const seen=new Set();
    for(const base of roots){
      for(const node of base.querySelectorAll(captionSelector)){
        if(seen.has(node)||node.closest('#kotoba-root'))continue;seen.add(node);
        if(node.matches('input, textarea, [contenteditable]'))continue;
        const r=node.getBoundingClientRect();
        // Only subtitle overlays intersecting the player; never scrape page headings or unrelated prose.
        if(r.width<=0||r.height<=0||r.left>=bounds.right||r.right<=bounds.left||r.top>=bounds.bottom||r.bottom<=bounds.top)continue;
        const style=doc.defaultView?.getComputedStyle?.(node);
        if(style?.visibility==='hidden'||style?.display==='none'||Number(style?.opacity)===0)continue;
        const largeContainer=r.height>Math.max(220,bounds.height*.62);
        // Video.js and Shaka often use a full-screen caption *container*.
        // Inspect only a few short inner text spans, not the whole player.
        const choices=largeContainer?[...node.querySelectorAll('span, p, div')].slice(0,24).reverse():[node];
        for(const candidate of choices){
          const cr=candidate.getBoundingClientRect();
          if(cr.width<=0||cr.height<=0||cr.height>Math.max(160,bounds.height*.35))continue;
          const value=clean(candidate.innerText||candidate.textContent||'');
          if(value&&value.length<=260&&japanese.test(value)){
            // Mark the exact accessible Japanese cue; its paint can be hidden
            // without hiding the text node from the DOM-based collector.
            candidate.classList?.add('km-native-cue-node');
            return value;
          }
        }
      }
    }
    return '';
  }
  function probe(doc,opts={}){
    const video=visibleVideo(doc);
    if(!video)return {state:'no-video',video:false,japanese:false,source:'none',count:0};
    const track=selectTrack(video,opts.auto===true);
    const clean=opts.clean||((text)=>String(text).trim());
    const cues=track?cuesFromTrack(track,clean):[];
    const shown=activeTrackText(track,clean)||playerCaption(doc,video,clean);
    const recognized=!!track||!!shown;
    return {state:!recognized?'no-ja':cues.length?'full':'live',video:true,japanese:recognized,source:(track&&track.mode!=='disabled')?'html5-track':shown?'overlay':'none',count:cues.length,text:shown,track,cues};
  }
  global.KMUniversalSubtitle={japaneseTrack,visibleVideo,selectTrack,cuesFromTrack,activeTrackText,playerCaption,probe};
  if(typeof module!=='undefined'&&module.exports)module.exports=global.KMUniversalSubtitle;
})(typeof globalThis!=='undefined'?globalThis:this);
