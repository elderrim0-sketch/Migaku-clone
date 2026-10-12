/* Shared dictionary-hover activation, independent from vocabulary status shortcuts. */
((root, factory) => {
  const api=factory();
  if(typeof module==='object' && module.exports)module.exports=api;
  root.KMLookupHover=api;
})(typeof globalThis!=='undefined'?globalThis:this, () => {
  'use strict';
  const modes=new Set(['none','alt','ctrl','shift','alt+shift','ctrl+shift','ctrl+alt']);
  function normalize(value){return modes.has(value)?value:'alt';}
  function isModifierKey(event){
    const key=String(event?.key||'').toLowerCase();
    return ['alt','altgraph','control','ctrl','shift'].includes(key);
  }
  function matches(setting,event){
    const mode=normalize(setting);
    if(mode==='none')return true;
    const key=String(event?.key||'').toLowerCase();
    const current={
      alt:!!event?.altKey || key==='alt',
      ctrl:!!event?.ctrlKey || key==='control'||key==='ctrl',
      shift:!!event?.shiftKey || key==='shift'
    };
    const chosen=new Set(mode.split('+'));
    // Exact modifiers prevent Alt+Shift+1–5 status shortcuts from opening
    // the dictionary when the configured lookup trigger is just Alt.
    return ['alt','ctrl','shift'].every(part=>current[part]===chosen.has(part));
  }
  function label(setting){
    const mode=normalize(setting);
    return mode==='none'?'Hover':mode.split('+').map(part=>({alt:'Alt',ctrl:'Ctrl',shift:'Shift'})[part]).join(' + ')+' + hover';
  }
  return Object.freeze({normalize,matches,isModifierKey,label});
});
