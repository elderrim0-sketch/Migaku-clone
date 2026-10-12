/* Subtitle language visibility: purely local state; never auto-translates. */
(function(global){
  'use strict';
  const MODES=Object.freeze(['ja','dual','en']);
  const NAMES=Object.freeze({ja:'日本語 only',dual:'日本語 + English',en:'English only'});
  function normalize(value){return MODES.includes(value)?value:'ja';}
  function cycle(value){return MODES[(MODES.indexOf(normalize(value))+1)%MODES.length];}
  function active(cues,milliseconds){
    const list=Array.isArray(cues)?cues:[];
    const time=Number(milliseconds);
    if(!Number.isFinite(time))return '';
    // Timed cues should be ordered but can overlap and sometimes be sparse.
    for(let i=list.length-1;i>=0;i--){const cue=list[i];if(time>=Number(cue.start)&&time<Number(cue.end))return String(cue.text||'').trim();}
    return '';
  }
  function isEnglishTrack(track){
    return /^(?:en(?:[-_].*)?|eng)$/i.test(String(track?.language||track?.srclang||'').trim()) || /\bEnglish\b/i.test(String(track?.label||''));
  }
  global.KMSubtitleModes={MODES,NAMES,normalize,cycle,active,isEnglishTrack};
  if(typeof module!=='undefined'&&module.exports)module.exports=global.KMSubtitleModes;
})(typeof globalThis!=='undefined'?globalThis:this);
