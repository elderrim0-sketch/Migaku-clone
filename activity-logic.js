/* Pure local study statistics helpers. Also used in regression tests. */
(function (scope) {
  'use strict';
  function dateKey(value=new Date()) {
    const date=value instanceof Date?value:new Date(value);
    return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  }
  function shiftDay(key,offset) {
    const [y,m,d]=String(key).split('-').map(Number);
    const day=new Date(y,m-1,d,12,0,0);
    day.setDate(day.getDate()+offset);
    return dateKey(day);
  }
  function empty() {return {version:1,days:{},totals:{cards:0,watchSeconds:0,readSeconds:0},recent:[]};}
  function record(stats,entry,now=Date.now()) {
    const result=stats&&typeof stats==='object'?stats:empty();
    result.days ||= {};result.totals ||= {cards:0,watchSeconds:0,readSeconds:0};result.recent ||= [];
    const key=dateKey(now),day=result.days[key]||{cards:0,watchSeconds:0,readSeconds:0};
    if(entry.kind==='card'){
      day.cards+=1;result.totals.cards+=1;
      const item={kind:'card',at:now,word:String(entry.word||'').slice(0,90),deck:String(entry.deck||'').slice(0,100)};
      result.recent.unshift(item);
    } else if(entry.kind==='watch'||entry.kind==='read') {
      const seconds=Math.max(0,Math.min(30,Math.round(Number(entry.seconds)||0)));
      if(seconds<=0)return result;
      const field=entry.kind==='watch'?'watchSeconds':'readSeconds';
      day[field]+=seconds;result.totals[field]+=seconds;
    }
    result.days[key]=day;
    result.recent=result.recent.slice(0,80);
    const cutoff=shiftDay(key,-400);
    for(const old of Object.keys(result.days))if(old<cutoff)delete result.days[old];
    return result;
  }
  function streak(stats,today=dateKey()) {
    const days=stats?.days||{};
    const active=key=>{const day=days[key]||{};return Number(day.cards||0)>0 || Number(day.watchSeconds||0)>=60 || Number(day.readSeconds||0)>=60;};
    let start=today;
    // A streak remains visible throughout an unstudied day after yesterday's activity.
    if(!active(start))start=shiftDay(start,-1);
    let count=0;
    while(count<401&&active(shiftDay(start,-count)))count++;
    return count;
  }
  scope.KotobaActivity={dateKey,shiftDay,empty,record,streak};
  if(typeof module!=='undefined'&&module.exports) module.exports=scope.KotobaActivity;
})(typeof globalThis!=='undefined'?globalThis:this);
