/* Kotoba 2.0. Pure, reusable vocabulary, document and backup rules. */
(function(root){
 'use strict';
 const STATES=['known','track','learning','unknown','ignore'];
 const MAX_DOC=180000;
 const MAX_LIBRARY=20;
 const SAFE_KEYS=['knownWords','wordStatuses','ankiVocabularyKnown','ankiVocabularyLearning','kotobaActivity','kotobaTheme','kotobaReaderDocuments','kotobaReaderLastId','kotobaPlayMode','kotobaSubtitleMode','kotobaLookupHoverModifier','kotobaFuriganaMode','kotobaSubtitleStyle','kotobaHotkeys','kotobaSentenceAutoPause','pauseOnHover','pitchMode','onVideoEnabled','autoJapaneseSubtitles','kotobaHideOriginalCaptions'];
 const jp=/[\u3040-\u30ff\u3400-\u9fff]/u;
 function normalizeTerm(x){return String(x||'').normalize('NFC').trim().slice(0,80);}
 function cleanArray(a,limit=25000){return [...new Set((Array.isArray(a)?a:[]).map(normalizeTerm).filter(x=>x&&jp.test(x)))].slice(0,limit);}
 function vocab(cfg={}){
  const known=new Set(cleanArray(cfg.knownWords)); const fromAnkiKnown=new Set(cleanArray(cfg.ankiVocabularyKnown));
  const ankiTracked=new Set(cleanArray(cfg.ankiVocabularyLearning));
  const statuses=cfg.wordStatuses && typeof cfg.wordStatuses==='object'&&!Array.isArray(cfg.wordStatuses)?cfg.wordStatuses:{};
  const all=new Set([...known,...fromAnkiKnown,...ankiTracked,...Object.keys(statuses)]);
  const out=[];
  for(const word of all){
   if(!jp.test(word))continue;
   const manual=STATES.includes(statuses[word])?statuses[word]:null;
   const status=manual || (known.has(word)||fromAnkiKnown.has(word)?'known':ankiTracked.has(word)?'track':'unknown');
   const source=manual?'Manual':(ankiTracked.has(word)||fromAnkiKnown.has(word)?'Anki sync':'Kotoba');
   out.push({word,status,source});
  }
  return out;
 }
 function readText(raw,type='txt'){
   let text=String(raw||'').slice(0,MAX_DOC);
   if(type==='html'||type==='htm'){
     if(typeof DOMParser==='undefined')return text.replace(/<[^>]*>/g,' ');
     const doc=new DOMParser().parseFromString(text,'text/html');
     for(const e of doc.querySelectorAll('script,style,nav,head,iframe,svg,template,form'))e.remove();
     text=doc.body?.textContent||'';
   }
   if(type==='srt'||type==='vtt'){
     text=text.replace(/^WEBVTT.*$/gm,'').replace(/^\d+\s*$/gm,'')
       .replace(/^.*\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->.*$/gm,'')
       .replace(/^.*\d{2}:\d{2}[.,]\d{3}\s*-->.*$/gm,'').replace(/<[^>]*>/g,'');
   }
   return text.replace(/\r\n/g,'\n').replace(/\n{4,}/g,'\n\n\n').trim().slice(0,MAX_DOC);
 }
 function safeDoc(doc){
  if(!doc||typeof doc!=='object'||typeof doc.text!=='string'||doc.text.length>MAX_DOC)return null;
  const id=String(doc.id||'').slice(0,60);
  if(!/^[a-z0-9_-]{4,60}$/i.test(id))return null;
  return {id,title:String(doc.title||'Untitled reading').slice(0,120),text:doc.text,position:Math.max(0,Math.min(Number(doc.position)||0,MAX_DOC)),created:Number(doc.created)||Date.now()};
 }
 function safeLibrary(docs){return (Array.isArray(docs)?docs:[]).map(safeDoc).filter(Boolean).slice(0,MAX_LIBRARY);}
 function backupFrom(cfg){const data={};for(const k of SAFE_KEYS){if(Object.prototype.hasOwnProperty.call(cfg,k))data[k]=cfg[k];}return {format:'kotoba-study-backup',version:2,created:new Date().toISOString(),data};}
 function restoreFrom(input,existing={}){
  if(!input||input.format!=='kotoba-study-backup'||input.version!==2||!input.data||typeof input.data!=='object'||Array.isArray(input.data))throw Error('Not a Kotoba Studio 2.0 backup.');
  const data=input.data,patch={};
  if('knownWords' in data)patch.knownWords=cleanArray([...(existing.knownWords||[]),...(data.knownWords||[])]);
  if('ankiVocabularyKnown' in data)patch.ankiVocabularyKnown=cleanArray([...(existing.ankiVocabularyKnown||[]),...(data.ankiVocabularyKnown||[])]);
  if('ankiVocabularyLearning' in data)patch.ankiVocabularyLearning=cleanArray([...(existing.ankiVocabularyLearning||[]),...(data.ankiVocabularyLearning||[])]);
  if('wordStatuses' in data&&data.wordStatuses&&typeof data.wordStatuses==='object'&&!Array.isArray(data.wordStatuses)){
    const next={...existing.wordStatuses};
    for(const [word,status] of Object.entries(data.wordStatuses).slice(0,25000)){
      if(jp.test(word)&&STATES.includes(status)&&word.length<=80)next[word]=status;
    }
    patch.wordStatuses=next;
  }
  if('kotobaReaderDocuments' in data){
    const old=safeLibrary(existing.kotobaReaderDocuments),incoming=safeLibrary(data.kotobaReaderDocuments);
    const merged=new Map(old.map(d=>[d.id,d]));for(const d of incoming)merged.set(d.id,d);
    patch.kotobaReaderDocuments=[...merged.values()].slice(-MAX_LIBRARY);
  }
  const enumerations={kotobaTheme:['cotton-candy','matcha-cream','sunset-pop','midnight-neon','black-gold'],kotobaPlayMode:['normal','focus','audio-first','step'],kotobaSubtitleMode:['ja','dual','en'],kotobaFuriganaMode:['off','all','unknown','hover'],pitchMode:['always','hover','off'],kotobaLookupHoverModifier:['none','alt','ctrl','shift','ctrl+shift','alt+shift','ctrl+alt']};
  for(const [key,allowed]of Object.entries(enumerations))if(allowed.includes(data[key]))patch[key]=data[key];
  for(const k of ['kotobaSentenceAutoPause','pauseOnHover','onVideoEnabled','autoJapaneseSubtitles','kotobaHideOriginalCaptions'])if(typeof data[k]==='boolean')patch[k]=data[k];
  // Only restore plain settings objects; never import extension permissions or credentials.
  for(const k of ['kotobaSubtitleStyle','kotobaHotkeys'])if(data[k]&&typeof data[k]==='object'&&!Array.isArray(data[k])&&JSON.stringify(data[k]).length<10000)patch[k]=data[k];
  if(data.kotobaActivity&&typeof data.kotobaActivity==='object'&&JSON.stringify(data.kotobaActivity).length<150000)patch.kotobaActivity=data.kotobaActivity;
  return patch;
 }
 const API={STATES,MAX_DOC,MAX_LIBRARY,SAFE_KEYS,cleanArray,normalizeTerm,vocab,readText,safeDoc,safeLibrary,backupFrom,restoreFrom};
 root.KotobaStudioLogic=API;
 if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
