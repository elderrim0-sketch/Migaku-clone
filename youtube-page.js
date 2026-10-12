/* Page-world bridge: reads public YouTube caption metadata, and optionally tries
   selecting an available Japanese track. YouTube's live caption API is unstable;
   failure is reported and falls back to transcript/file import. */
(() => {
  if (window.__kotobaYTBridge08) return;
  window.__kotobaYTBridge08 = true;
  const activeVideoId = () => {
    try { return document.getElementById('movie_player')?.getPlayerResponse?.()?.videoDetails?.videoId || window.ytInitialPlayerResponse?.videoDetails?.videoId || ''; }
    catch { return ''; }
  };
  function playerAndTracks() {
    const player=document.getElementById('movie_player');
    const response=player?.getPlayerResponse?.() || window.ytInitialPlayerResponse;
    const tracks=(response?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [])
      .slice(0,30).map(t=>({lang:String(t.languageCode||'').slice(0,12),
        label:String(t.name?.simpleText || t.name?.runs?.map(x=>x.text).join('') || t.languageCode||'').slice(0,90),
        url:String(t.baseUrl||'').slice(0,4000),auto:t.kind==='asr'})).filter(t=>t.url);
    return {player,tracks,videoId:String(response?.videoDetails?.videoId || '')};
  }
  function sendTracks() {
    try {
      const {tracks,videoId}=playerAndTracks();
      window.postMessage({type:'KOTOBA_YT_TRACKS_V03',videoId,tracks},location.origin);
    } catch {}
  }
  function chooseJapanese(requestId) {
    const {player,videoId,tracks}=playerAndTracks();
    if(requestId && requestId!==videoId)return;
    const japanese=tracks.filter(t=>/^ja(?:-|$)/i.test(t.lang)).sort((a,b)=>Number(a.auto)-Number(b.auto));
    const reply={type:'KOTOBA_YT_SELECTED_JP_V08',videoId,ok:false,reason:'Japanese captions unavailable'};
    if(japanese.length && player?.setOption) {
      const track=japanese[0];
      try {
        const current=player.getOption?.('captions','track');
        if(!/^ja(?:-|$)/i.test(current?.languageCode || '')) {
          // The internal player interface is best-effort, not an official public API.
          if(player.loadModule)player.loadModule('captions');
          player.setOption('captions','track',{languageCode:track.lang,...(track.auto?{kind:'asr'}:{})});
        }
        reply.ok=true;
        reply.reason='Requested '+track.lang+' player captions';
      } catch(e) {reply.reason='Player captions API unavailable';}
    }
    window.postMessage(reply,location.origin);
  }
  window.addEventListener('message',e=>{
    if(e.source!==window || e.origin!==location.origin)return;
    if(e.data?.type==='KOTOBA_YT_REQUEST_V03')sendTracks();
    if(e.data?.type==='KOTOBA_YT_SELECT_JP_V08')chooseJapanese(String(e.data.videoId || ''));
  });
  document.addEventListener('yt-navigate-finish',()=>setTimeout(sendTracks,350));
  setTimeout(sendTracks,700);
})();
