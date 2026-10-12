/* Kotoba v2.4: conservative sentence boundaries and subtitle-aligned audio windows. Pure, offline helpers. */
(function(global){
  'use strict';
  const endMarks=/[。！？!?]+[」』）】]?/u;
  const strip=s=>String(s||'').replace(/\s+/g,' ').trim();
  function recentCaption(text){
    let s=strip(text);
    // Live caption windows sometimes accumulate a whole paragraph. Keep the
    // latest two short spoken sentences; never put a paragraph on the player.
    const parts=s.split(/(?<=[。！？!?])/u).map(strip).filter(Boolean);
    if(parts.length>2)s=parts.slice(-2).join('');
    if(s.length>150){const bits=[...s];s=bits.slice(-150).join('');}
    return s;
  }
  function appendLive(existing,text,time){
    const value=recentCaption(text);
    const previous=existing.at(-1);
    if(!value)return {changed:false,replaced:false};
    const now=Math.max(0,Number(time)||0);
    if(previous){
      const gap=now-previous.end;
      const extendsPrevious=value.startsWith(previous.text)&&value.length>previous.text.length;
      const equivalent=previous.text===value;
      // Streaming CC changes every few hundred milliseconds as words appear.
      if(gap<1400 && (equivalent||extendsPrevious)){
        previous.text=value;previous.end=Math.max(previous.end,now+350);
        return {changed:!equivalent,replaced:true};
      }
      // A rolling transcript has *shrunk* to the last part of the current line.
      if(gap<700 && previous.text.endsWith(value))return {changed:false,replaced:true};
    }
    existing.push({start:now,end:now+1300,text:value});
    if(existing.length>2500)existing.shift();
    return {changed:true,replaced:false};
  }
  function partsForWord(text,word){
    const s=strip(text);
    if(!word || !s.includes(word))return s;
    const chunks=s.match(/[^。！？!?]*[。！？!?]+[」』）】]?|[^。！？!?]+$/gu)||[s];
    const matched=chunks.find(x=>x.includes(word));
    return strip(matched||s);
  }
  function choose(cues,cue,word){
    const list=Array.isArray(cues)?cues:[];
    const original=cue||null;
    if(!original)return {sentence:'',start:0,end:0,sourceCue:null,segments:[]};
    const at=list.findIndex(c=>c===original || (Math.abs(c.start-original.start)<30 && c.text===original.text));
    const raw=strip(original.text);
    let text=partsForWord(raw,word), start=original.start, end=original.end;
    const segmentList=[original];
    // Short incomplete utterances can belong to a preceding unfinished subtitle.
    // Avoid adding a finished unrelated sentence to a complete target sentence.
    const likelyStandAlone=/^(?:はい|いいえ|うん|ええ|そう|ありがとう|おはよう|こんにちは|さようなら)[。！？!?]?$/u.test(text);
    if(at>0 && text.length<55 && !likelyStandAlone){
      const prev=list[at-1],pText=strip(prev.text),gap=start-prev.end;
      const grammaticalContinuation=/(?:に|を|が|は|で|へ|と|も|から|ので|けど|て|し|や|か|の)$/u.test(pText);
      if(gap>=-100 && gap<900 && !/[。！？!?]$/.test(pText) &&
         (!endMarks.test(text)||grammaticalContinuation) &&
         pText.length+text.length<115 && pText!==text && !text.includes(pText)){
        text=pText+text;start=prev.start;segmentList.unshift(prev);
      }
    }
    // If a subtitle splits mid-sentence, add at most the next *contiguous*
    // fragment until the sentence closes, never the next unrelated sentence.
    for(let i=at+1;i>0 && i<list.length && segmentList.length<3 && !endMarks.test(text);i++){
      const next=list[i],gap=next.start-end,frag=strip(next.text);
      if(gap>850||gap< -250||text.length+frag.length>130||!frag||text.includes(frag))break;
      text+=frag;end=next.end;segmentList.push(next);
    }
    return {sentence:text.slice(0,240),start,end,sourceCue:original,segments:segmentList};
  }
  function audioWindow(plan,offset=0){
    const shift=Number(offset)||0;
    let start=Math.max(0,(Number(plan?.start)||0)+shift),end=Math.max(start+350,(Number(plan?.end)||0)+shift);
    // Pad natural speech to reduce clipped consonants; provide >= 5s for a short
    // one-word response, without extending long sentences unnecessarily.
    const duration=end-start;
    let pre=duration<4000?Math.max(.6,(5000-duration)/2000):.65;
    let post=duration<4000?Math.max(.7,(5000-duration)/2000):.7;
    start=Math.max(0,start-pre*1000);end+=post*1000;
    if(end-start<5000 && duration<4000)end=start+5000;
    return {start:Math.round(start),end:Math.round(end)};
  }
  const api={appendLive,recentCaption,choose,audioWindow};
  global.KMCueContext=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
