/* Kotoba v1.9: vocabulary coverage and i+1 recommendations.
   Deterministic heuristics, no claims of measured language comprehension. */
(function(scope){
  'use strict';
  const jp=/[\u3040-\u30ff\u3400-\u9fff]/u;
  function surface(part){return String(part?.surface||part?.segment||'').trim();}
  function keys(part){return [...new Set([surface(part),String(part?.lemma||'').trim()].filter(Boolean))];}
  function vocabularyState(part,{known=[],learning=[],statuses={}}={}){
    const words=keys(part),manual=words.map(x=>statuses[x]).find(x=>x==='known'||x==='learning'||x==='unknown'||x==='track'||x==='ignore');
    if(manual)return manual;
    const asSet=x=>x instanceof Set?x:new Set(x||[]);
    if(words.some(w=>asSet(known).has(w)))return 'known';
    if(words.some(w=>asSet(learning).has(w)))return 'track';
    return 'unknown';
  }
  function analyze(cues,tokenize,vocab={}){
    const lines=[],frequency=new Map(),unique=new Set();let total=0,known=0,ignored=0;
    for(const [index,cue] of (Array.isArray(cues)?cues:[]).entries()){
      const segments=tokenize(String(cue.text||''));
      const tokens=segments.filter(x=>x.word&&jp.test(surface(x)));
      const missing=new Map(),learning=new Map();let knownInLine=0,relevant=0;
      for(const word of tokens){
        const key=surface(word),state=vocabularyState(word,vocab);
        if(state==='ignore'){ignored++;continue;}
        relevant++;total++;unique.add(key);
        frequency.set(key,(frequency.get(key)||0)+1);
        const lemma=String(word.lemma||key).trim();
        if(state==='known'){known++;knownInLine++;}
        else if(state==='learning'||state==='track')learning.set(lemma,{word:key,lemma,state});
        else missing.set(lemma,{word:key,lemma,state});
      }
      const targets=[...missing.values(),...learning.values()];
      const uniqueMissing=targets.length;
      lines.push({index, ...cue, tokenCount:relevant,knownCount:knownInLine,
        unknownCount:uniqueMissing,unknown:targets,
        coverage:relevant?Math.round(knownInLine/relevant*100):0,
        kind:relevant===0?'empty':uniqueMissing===0?'comfortable':uniqueMissing===1?'i+1':uniqueMissing===2?'i+2':'hard'});
    }
    const recommendations=lines.filter(x=>x.kind==='i+1').map(x=>{
      const word=x.unknown[0];
      const repetitions=frequency.get(word.word)||1;
      const score=(word.state==='learning'||word.state==='track'?12:0)+Math.min(repetitions,12)*3+Math.min(x.knownCount,14)*2-Math.max(0,x.tokenCount-18)*2;
      return {...x,target:word,frequency:repetitions,score};
    }).sort((a,b)=>b.score-a.score||a.index-b.index);
    const near=lines.filter(x=>x.kind==='i+2').sort((a,b)=>b.knownCount-a.knownCount||a.index-b.index);
    return {lines,recommendations,near,totals:{total,known,ignored,unique:unique.size,
      percent:total?Math.round(known*100/total):0, iPlusOne:recommendations.length,
      fullyKnown:lines.filter(x=>x.kind==='comfortable').length, partial:lines.filter(x=>x.kind==='i+2').length,
      hard:lines.filter(x=>x.kind==='hard').length}};
  }
  const API={analyze,vocabularyState,surface};
  scope.KMLearning=API;
  if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
