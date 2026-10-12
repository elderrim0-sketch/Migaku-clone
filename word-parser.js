/* Kotoba Japanese word grouping 1.0.
 * Based on Intl.Segmenter + conservative phrase/auxiliary repair rules.
 * Not a complete linguistic morphological parser: users can edit the mined word.
 * Standalone, dependency-free, works in Chromium extensions and Node tests.
 */
(function(scope) {
  'use strict';
  const KNOWN_PHRASES = new Map([
    ['お願いします','お願いする'],['おねがいします','お願いする'],
    ['お願いいたします','お願いする'],['おねがいいたします','お願いする'],
    ['ありがとうございました','ありがとう'],['ありがとうございます','ありがとう'],
    ['どういたしまして','どういたしまして'],['おはようございます','おはよう'],
    ['すみませんでした','すみません'],['すみません','すみません'],
    ['ごめんなさい','ごめんなさい'],['お疲れ様でした','お疲れ様'],
    ['お疲れ様です','お疲れ様'],['おつかれさまです','お疲れ様'],
    ['いただきます','いただく'],['ごちそうさまでした','ごちそうさま'],
    ['行ってきます','行ってくる'],['いってきます','行ってくる'],
    ['行ってらっしゃい','行ってらっしゃい'],['いってらっしゃい','行ってらっしゃい'],
    ['失礼します','失礼する'],['申し訳ありません','申し訳ない'],
    ['かしこまりました','かしこまる'],['よろしく','よろしく'],
    ['こんにちは','こんにちは'],['こんばんは','こんばんは'],
    ['おやすみなさい','おやすみなさい']
  ]);
  const patterns = [...KNOWN_PHRASES.keys()].sort((a,b)=>b.length-a.length);
  const particles = new Set(['は','が','を','に','で','と','も','へ','の','よ','ね','か','や','さ','から','まで','だけ','など','より','でも','しか','こそ','って','ば','し']);
  const verbAux = new Set(['し','しま','した','して','て','で','てい','でい','てる','でる','ます','ま','ました','ません','ましたら','ない','なかった','たい','たく','た','だ','いる','ある','れる','られる','せる','させる','よう','う','ん','ちゃう','じゃう','そう','れば','れば']);
  const verbStems = new Map([
    ['見せ','見せる'],['食べ','食べる'],['考え','考える'],['起き','起きる'],
    ['聞き','聞く'],['行き','行く'],['歩き','歩く'],['書き','書く'],
    ['飲み','飲む'],['読み','読む'],['休み','休む'],['遊び','遊ぶ'],
    ['話し','話す'],['待ち','待つ'],['作り','作る'],['分かり','分かる'],
    ['わかり','わかる'],['会い','会う'],['買い','買う'],['使い','使う'],
    ['思い','思う'],['寝','寝る'],['見','見る'],['来','来る'],
    ['やり','やる'],['なり','なる'],['帰り','帰る']
  ]);
  const suruBases = new Set(['勉強','練習','確認','連絡','説明','約束','準備','旅行','仕事','掃除','注文','紹介','相談','結婚','研究','運動','卒業','参加','電話','質問','安心','心配','お願い','おねがい']);
  const japanese = /[\u3040-\u30ff\u3400-\u9fff]/u;
  function naive(text) {
    const output=[]; let buffer='';let word=null;
    function flush(){ if(buffer){output.push({segment:buffer,isWordLike:word});buffer='';} }
    for(const ch of text){const now=japanese.test(ch);if(word!==null&&now!==word)flush();buffer+=ch;word=now;}flush();return output;
  }
  function coarse(text) {
    if(typeof Intl!=='undefined' && Intl.Segmenter){
      return [...new Intl.Segmenter('ja',{granularity:'word'}).segment(text)].map(x=>({segment:x.segment,isWordLike:!!x.isWordLike}));
    }
    return naive(text);
  }
  // Only join Japanese auxiliary forms after plausible verb stems, not nouns, particles or adjectives.
  function isVerbStem(token,next) {
    if(!token || particles.has(token) || !next) return false;
    if(suruBases.has(token) && /^(し|しま|して|さ|でき)/.test(next))return true;
    if(verbStems.has(token) && isAux(next))return true;
    if(/(?:し|い|き|ぎ|ち|に|び|み|り|っ|え|け|せ|て|ね|べ|め|れ)$/.test(token) && verbAux.has(next))return true;
    if(/[一-龯々]+[るうくぐすつぬぶむ]$/.test(token)&&verbAux.has(next))return true;
    if(token.length===1&&/[一-龯]/.test(token)&&/^(て|た|ま|ます|ない|られ|れる)/.test(next))return true;
    return false;
  }
  function isAux(t){return verbAux.has(t)|| /^(?:ました|ません|てい|でい|てる|でる|てお|てく|ない|なかった|たかった|ています|でした|ちゃった)$/.test(t);}
  function isPunctuation(raw) { return !raw.isWordLike || !japanese.test(raw.segment); }
  function tokenize(text) {
    const initial=coarse(String(text||'')); const result=[];
    for(let i=0;i<initial.length;){
      const one=initial[i];
      if(isPunctuation(one)) {result.push({segment:one.segment,word:false});i++;continue;}
      // Preserve set phrases across whatever boundaries Intl.Segmenter chose.
      let phrase='';let phraseEnd=i; let lemma='';
      for(const p of patterns){
        let gathered=''; let j=i;
        while(j<initial.length && gathered.length<p.length && !isPunctuation(initial[j])){gathered+=initial[j].segment;j++;}
        if(gathered===p){phrase=p;phraseEnd=j;lemma=KNOWN_PHRASES.get(p);break;}
      }
      if(phrase){result.push({segment:phrase,word:true,lemma,kind:'expression'});i=phraseEnd;continue;}
      let surface=one.segment, j=i+1;
      if(j<initial.length && !isPunctuation(initial[j]) && isVerbStem(surface,initial[j].segment)){
        let count=0;
        while(j<initial.length && count<5 && !isPunctuation(initial[j]) && isAux(initial[j].segment)){
          const next=initial[j].segment;
          // A trailing し can be the connective particle after an already complete expression.
          surface+=next;j++;count++;
        }
      }
      // A conservative lemma override for noun+suru forms; other conjugations
      // are kept as written unless a dictionary supplies a better base form.
      let base=surface;
      for(const noun of suruBases){if(surface.startsWith(noun) && surface!==noun && /^(?:し|さ)/.test(surface.slice(noun.length))){base=noun==='おねがい'?'お願いする':noun+'する';break;}}
      if(base===surface){
        for(const [stem,root] of [...verbStems].sort((a,b)=>b[0].length-a[0].length)){
          if(surface.startsWith(stem) && surface!==stem && /^(?:て|で|ます|ま|た|ない|なかった|ちゃ|られ|れ|せ)/.test(surface.slice(stem.length))){base=root;break;}
        }
      }
      result.push({segment:surface,word:true,lemma:base,kind:j>i+1?'inflected':'word'});
      i=j;
    }
    // Some educational subtitles embed furigana in parentheses: 箸(はし).
    // Mine the kanji surface once, retain its exact reading for homograph/pitch
    // disambiguation, and preserve the caption's original visible spelling.
    const merged=[];
    for(let k=0;k<result.length;){
      const one=result[k],left=result[k+1];
      if(one?.word&&/[一-龯々]/u.test(one.segment)&&left&&!left.word&&/^[（(]$/.test(left.segment)){
        let j=k+2,reading='';
        while(j<result.length&&result[j].word&&/^[ぁ-んァ-ヶー]+$/u.test(result[j].segment)&&reading.length<16){
          reading+=result[j].segment;j++;
        }
        if(reading&&reading.length<=15&&result[j]&&!result[j].word&&/^[）)]$/.test(result[j].segment)){
          const surface=one.segment;
          merged.push({...one,segment:surface+left.segment+reading+result[j].segment,
            surface,reading,lemma:one.lemma||surface,kind:'furigana'});
          k=j+1;continue;
        }
      }
      merged.push(one);k++;
    }
    // Honorific prefixes usually belong to the noun in expressions such as
    // お箸 / お金 / ご家族. Keep them as one mining target when adjacent.
    const prefixed=[];
    for(let k=0;k<merged.length;k++){
      const one=merged[k],next=merged[k+1];
      if(one?.word&&['お','ご'].includes(one.segment)&&next?.word&&/[一-龯々]/u.test(next.surface||next.segment)){
        const surface=one.segment+(next.surface||next.segment);
        prefixed.push({...next,segment:one.segment+next.segment,surface,
          lemma:surface,reading:next.reading?one.segment+next.reading:undefined,
          kind:'honorific'});
        k++;continue;
      }
      prefixed.push(one);
    }
    return prefixed;
  }
  scope.KMWordParser={tokenize,KNOWN_PHRASES,version:'1.1'};
  if(typeof module!=='undefined'&&module.exports)module.exports=scope.KMWordParser;
})(typeof globalThis!=='undefined'?globalThis:this);
