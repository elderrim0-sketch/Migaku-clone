/* Kotoba v1.4: video-content-aware caption anchor. Pure geometry + optional occlusion sampling. */
(function(global){
  const finite=n=>Number.isFinite(n)?n:0;
  const box=r=>r?({left:finite(r.left),top:finite(r.top),right:finite(r.right),bottom:finite(r.bottom),width:finite(r.width)||Math.max(0,r.right-r.left),height:finite(r.height)||Math.max(0,r.bottom-r.top)}):null;
  const clip=(rect,v)=>{
    const left=Math.max(0,rect.left),top=Math.max(0,rect.top),right=Math.min(v.width,rect.right),bottom=Math.min(v.height,rect.bottom);
    return right>left&&bottom>top?{left,top,right,bottom,width:right-left,height:bottom-top}:null;
  };
  function letterboxedPicture(video,player){
    const el=video||player;
    if(!el||typeof el.getBoundingClientRect!=='function')return null;
    const bounds=box(el.getBoundingClientRect());
    if(!bounds||bounds.width<120||bounds.height<100)return null;
    // <video> can have letterboxing inside a CSS contain box.
    if(video?.videoWidth>0&&video?.videoHeight>0){
      const style=typeof getComputedStyle==='function'?getComputedStyle(video):{objectFit:'contain'};
      const fit=style.objectFit||'contain';
      if(fit==='contain'||fit==='scale-down'){
        const ratio=Math.min(bounds.width/video.videoWidth,bounds.height/video.videoHeight);
        const w=ratio*video.videoWidth,h=ratio*video.videoHeight;
        return {left:bounds.left+(bounds.width-w)/2,top:bounds.top+(bounds.height-h)/2,right:bounds.right-(bounds.width-w)/2,bottom:bounds.bottom-(bounds.height-h)/2,width:w,height:h};
      }
    }
    return bounds;
  }
  function visiblePicture({video,player,sidebar,viewport,elementFromPoint}){
    const v=viewport||{width:innerWidth,height:innerHeight};
    const measured=letterboxedPicture(video,player);
    let rect=measured?clip(measured,v):null;
    if(!rect)return null;
    if(sidebar&&typeof sidebar.getBoundingClientRect==='function'){
      const dock=sidebar.getBoundingClientRect();
      if(dock.left>rect.left+150&&dock.left<rect.right){
        rect=clip({...rect,right:Math.max(rect.left+120,dock.left-12)},v);
      }
    }
    if(!rect || rect.width<120)return rect;
    // Sample the middle of the player, above captions/controls. If another app
    // (e.g. a statistics overlay) covers its right part, crop that obstruction.
    // Only crop after multiple *adjacent* obscured samples to avoid transient UI.
    if(player&&typeof elementFromPoint==='function'){
      const n=Math.max(9,Math.min(40,Math.floor(rect.width/28)));
      const y=rect.top+rect.height*.48;
      let visibleSeen=0,blocked=0,blockStart=null,cut=null;
      for(let i=0;i<n;i++){
        const x=rect.left+(i+.5)*rect.width/n;
        const top=elementFromPoint(x,y);
        // Null means the inspector can't identify the target; don't guess.
        if(!top)continue;
        // Our own bubble/coverage might briefly overlap the sampling line.
        if(top.closest?.('#kotoba-root'))continue;
        const onPlayer=top===video||top===player||(typeof player.contains==='function'&&player.contains(top));
        if(onPlayer){visibleSeen++;blocked=0;blockStart=null;continue;}
        if(visibleSeen>=3){if(blocked===0)blockStart=x;blocked++;
          if(blocked>=3){cut=blockStart;break;}}
      }
      if(cut!==null && cut>rect.left+Math.max(115,rect.width*.3)){
        rect={...rect,right:cut-8,width:cut-8-rect.left};
      }
    }
    return rect;
  }
  // In an approved cross-origin player the <video> lives inside an iframe,
  // so the top page has no video element to anchor interactive captions to.
  // Use a visible, video-sized iframe as the bounding picture, not arbitrary
  // page content; prefer the actual frame host validated by the background.
  function embeddedPlayerFrame(doc,{host='',viewport}={}){
    const view=viewport||{width:doc?.defaultView?.innerWidth||0,height:doc?.defaultView?.innerHeight||0};
    const wanted=String(host||'').toLowerCase();
    const candidates=[...(doc?.querySelectorAll?.('iframe,frame')||[])].map(frame=>{
      if(typeof frame.getBoundingClientRect!=='function')return null;
      const r=box(frame.getBoundingClientRect());
      if(!r||r.width<240||r.height<130||r.right<20||r.bottom<20||r.left>=view.width-20||r.top>=view.height-20)return null;
      const visible=clip(r,view);
      if(!visible||visible.width<200||visible.height<110)return null;
      let frameHost='';
      try{frameHost=new URL(frame.getAttribute?.('src')||frame.src||'',doc.baseURI||doc.URL).hostname.toLowerCase();}catch{}
      const matches=!!wanted && frameHost===wanted;
      // Tiny ad, chat and tracking frames are not plausible video anchors.
      const area=visible.width*visible.height;
      const ratio=r.width/r.height;
      const plausible=area>=42000 && ratio>=1.05 && ratio<=3.7;
      if(!plausible)return null;
      return {frame,matches,area,ratio};
    }).filter(Boolean).sort((a,b)=>Number(b.matches)-Number(a.matches)||b.area-a.area);
    // An iframe may redirect so that its src hostname differs from the final
    // approved origin. In that case fall back to the largest visible player.
    return candidates[0]?.frame||null;
  }
  global.KMVideoLayout={visiblePicture,letterboxedPicture,embeddedPlayerFrame};
})(globalThis);
