(() => {
  const studio=globalThis.KMSubtitleStyle;
  const mount=document.querySelector('.km-popup-studio-mount');
  if(!mount||!studio)return;
  let style=studio.normalize(),pending=0;
  mount.innerHTML=studio.markup();
  function redraw(){
    mount.querySelectorAll('[data-km-style-key]').forEach(el=>{
      const key=el.dataset.kmStyleKey;
      if(el.type==='checkbox')el.checked=style[key];else el.value=style[key];
      const out=mount.querySelector(`[data-km-output="${key}"]`);
      if(out)out.textContent=String(style[key])+(key==='targetLineHeight'?'×':key==='targetSize'||key==='targetOutlineWidth'||key==='secondarySize'||key==='targetSpacing'?'px':key==='targetOpacity'||key==='targetPosition'||key==='targetWidth'||key==='secondaryOpacity'?'%':'');
    });
    const preview=mount.querySelector('.km-style-example');
    const jp=mount.querySelector('.km-style-example-jp'),en=mount.querySelector('.km-style-example-en');
    jp.style.fontSize=Math.round(style.targetSize*.55)+'px';jp.style.fontWeight=String(style.targetWeight);jp.style.color=style.targetColor;
    jp.style.lineHeight=String(style.targetLineHeight);jp.style.letterSpacing=style.targetSpacing+'px';
    jp.style.webkitTextStroke=(style.targetOutline==='uniform'?style.targetOutlineWidth*.4:0)+'px #070817';jp.style.paintOrder='stroke fill';
    jp.style.textShadow=style.targetOutline==='shadow'?'0 2px 7px #000':'';
    preview.style.background=style.targetBackground?`rgba(15,10,26,${style.targetOpacity/100})`:'transparent';
    en.style.color=style.secondaryColor;en.style.fontSize=Math.round(style.secondarySize*.85)+'px';en.hidden=style.secondaryMode==='off';
  }
  mount.querySelectorAll('[data-km-style-key]').forEach(el=>el.addEventListener('input',()=>{
    style=studio.normalize({...style,[el.dataset.kmStyleKey]:el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value});
    redraw();clearTimeout(pending);pending=setTimeout(()=>chrome.storage.local.set({kotobaSubtitleStyle:style}),200);
  }));
  mount.querySelectorAll('.km-studio-tab').forEach(button=>button.addEventListener('click',()=>{
    mount.querySelectorAll('.km-studio-tab').forEach(b=>b.classList.toggle('is-active',b===button));
    mount.querySelectorAll('[data-km-panel]').forEach(p=>p.hidden=p.dataset.kmPanel!==button.dataset.kmTab);
  }));
  mount.querySelector('.km-studio-reset').addEventListener('click',async()=>{style=studio.normalize();redraw();await chrome.storage.local.set({kotobaSubtitleStyle:style});});
  chrome.storage.local.get({kotobaSubtitleStyle:{}}).then(r=>{style=studio.normalize(r.kotobaSubtitleStyle);redraw();});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.kotobaSubtitleStyle){style=studio.normalize(changes.kotobaSubtitleStyle.newValue);redraw();}});
})();
