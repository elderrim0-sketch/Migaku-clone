/* Kotoba subtitle studio: local settings, no external dependencies. */
(() => {
  const defaults=Object.freeze({
    targetFont:'rounded',targetSize:34,targetWeight:750,targetColor:'#ffffff',
    targetOutline:'uniform',targetOutlineWidth:2,targetBackground:true,targetOpacity:68,
    targetPosition:12,targetWidth:78,targetLineHeight:1.55,targetSpacing:2,
    secondaryMode:'hover',secondarySize:17,secondaryColor:'#fff0cb',secondaryBackground:false,
    secondaryOpacity:58
  });
  const limits={targetSize:[16,70],targetWeight:[400,900],targetOutlineWidth:[0,5],targetOpacity:[0,100],targetPosition:[0,40],targetWidth:[40,100],targetLineHeight:[1,2.5],targetSpacing:[0,10],secondarySize:[10,36],secondaryOpacity:[0,100]};
  const options={targetFont:['rounded','gothic','serif','mono'],targetOutline:['uniform','shadow','none'],secondaryMode:['hover','always','off']};
  const fields=[
    {group:'target',key:'targetFont',label:'Japanese font',type:'select',values:[['rounded','Rounded Japanese'],['gothic','Clean Gothic'],['serif','Mincho / serif'],['mono','Monospaced']]},
    {group:'target',key:'targetSize',label:'Text size',type:'range',min:16,max:70,step:1,unit:'px'},
    {group:'target',key:'targetWeight',label:'Weight',type:'range',min:400,max:900,step:50},
    {group:'target',key:'targetColor',label:'Text colour',type:'color'},
    {group:'target',key:'targetOutline',label:'Outline style',type:'select',values:[['uniform','Uniform outline'],['shadow','Soft shadow'],['none','None']]},
    {group:'target',key:'targetOutlineWidth',label:'Outline thickness',type:'range',min:0,max:5,step:.5,unit:'px'},
    {group:'target',key:'targetBackground',label:'Subtitle background',type:'checkbox'},
    {group:'target',key:'targetOpacity',label:'Background opacity',type:'range',min:0,max:100,step:5,unit:'%'},
    {group:'target',key:'targetPosition',label:'Height above video bottom',type:'range',min:0,max:40,step:1,unit:'%'},
    {group:'target',key:'targetWidth',label:'Maximum line width',type:'range',min:40,max:100,step:2,unit:'%'},
    {group:'target',key:'targetLineHeight',label:'Line spacing',type:'range',min:1,max:2.5,step:.05,unit:'×'},
    {group:'target',key:'targetSpacing',label:'Letter spacing',type:'range',min:0,max:10,step:1,unit:'px'},
    {group:'secondary',key:'secondaryMode',label:'Translation display',type:'select',values:[['hover','Only on hover'],['always','Always (when translation enabled)'],['off','Never']]},
    {group:'secondary',key:'secondarySize',label:'Translation size',type:'range',min:10,max:36,step:1,unit:'px'},
    {group:'secondary',key:'secondaryColor',label:'Translation colour',type:'color'},
    {group:'secondary',key:'secondaryBackground',label:'Translation background',type:'checkbox'},
    {group:'secondary',key:'secondaryOpacity',label:'Translation background opacity',type:'range',min:0,max:100,step:5,unit:'%'}
  ];
  function normalize(raw){
    const result={...defaults};
    if(!raw || typeof raw!=='object')return result;
    for(const f of fields){const value=raw[f.key];
      if(f.type==='range'){if(Number.isFinite(Number(value)) && value!==null && value!==undefined){const [min,max]=limits[f.key];result[f.key]=Math.min(max,Math.max(min,Number(value)));}}
      else if(f.type==='checkbox'){if(typeof value==='boolean')result[f.key]=value;}
      else if(f.type==='color'){if(typeof value==='string' && /^#[a-f0-9]{6}$/i.test(value))result[f.key]=value;}
      else if(f.type==='select' && options[f.key]?.includes(value))result[f.key]=value;
    }return result;
  }
  function markup(){return `
    <div class="km-studio-intro">Design subtitles your way. Every change updates the player instantly.</div>
    <div class="km-style-example" aria-label="Subtitle style preview"><span class="km-style-example-jp">今日はいい天気ですね。</span><span class="km-style-example-en">It's a lovely day, isn't it?</span></div>
    <div class="km-studio-tabs" role="tablist" aria-label="Subtitle styling section"><button type="button" class="km-studio-tab is-active" data-km-tab="target">あ Japanese</button><button type="button" class="km-studio-tab" data-km-tab="secondary">A Translation</button></div>
    ${['target','secondary'].map(group=>`<div class="km-style-controls" data-km-panel="${group}" ${group==='secondary'?'hidden':''}>${fields.filter(f=>f.group===group).map(f=>`<label class="km-style-field ${f.type==='checkbox'?'is-check':''}"><span>${f.label}</span>${f.type==='select'?`<select data-km-style-key="${f.key}">${f.values.map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select>`:f.type==='checkbox'?`<input type="checkbox" data-km-style-key="${f.key}"/>`:`<span class="km-style-control-pair"><input type="${f.type}" data-km-style-key="${f.key}" ${f.type==='range'?`min="${f.min}" max="${f.max}" step="${f.step}"`:''}/>${f.type==='range'?`<output data-km-output="${f.key}"></output>`:''}</span>`}</label>`).join('')}</div>`).join('')}
    <div class="km-studio-actions"><button type="button" class="km-studio-reset">↺ Reset subtitle style</button><small>Saved per browser · No reload needed</small></div>`;}
  globalThis.KMSubtitleStyle={defaults,fields,normalize,markup};
})();
