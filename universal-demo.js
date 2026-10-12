(()=>{
  const status=document.getElementById('status'),lines=document.getElementById('lines');
  const video=document.getElementById('sample');
  function scan(){
    const result=KMUniversalSubtitle.probe(document,{auto:true,clean:KMTranscript.clean});
    if(result.state==='no-video'){status.textContent='No video detected.';return;}
    if(result.source==='html5-track')status.textContent=`✓ Japanese HTML5 track detected · ${result.count} timed lines`;
    else status.textContent='Looking for readable Japanese captions…';
    lines.replaceChildren();
    if(!result.cues?.length){lines.textContent='Cues are still loading. Press play, or scan again.';return;}
    result.cues.forEach(cue=>{
      const item=document.createElement('div');item.className='cue';item.textContent=cue.text;
      item.title='Jump to '+KMTranscript.clock(cue.start);item.style.cursor='pointer';
      item.addEventListener('click',()=>{video.currentTime=cue.start/1000;video.play().catch(()=>{});});
      lines.appendChild(item);
    });
  }
  document.getElementById('scan').addEventListener('click',scan);
  video.addEventListener('loadedmetadata',scan);
  const track=video.querySelector('track');track?.addEventListener('load',scan);
  setTimeout(scan,350);setTimeout(scan,1600);
})();
