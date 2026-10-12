/* Shared, page-level remappable hotkeys. No browser-global interception. */
(() => {
  'use strict';
  const DEFAULTS = Object.freeze({
    toggleTranscript:'Alt+Shift+KeyK', previous:'Alt+Shift+KeyJ', next:'Alt+Shift+KeyL',
    replay:'Alt+Shift+KeyR', subtitles:'Alt+Shift+KeyS', dictionary:'Alt+Shift+KeyD',
    card:'Alt+Shift+KeyC', known:'Alt+Shift+Digit1', learning:'Alt+Shift+Digit2',
    unknown:'Alt+Shift+Digit3', track:'Alt+Shift+Digit4', ignore:'Alt+Shift+Digit5',
    pauseHover:'Alt+Shift+KeyP', capture:'KeyQ', loop:'Alt+Shift+KeyB', subtitleLanguage:'Alt+KeyT'
  });
  const LABELS = Object.freeze({
    toggleTranscript:'Toggle transcript', previous:'Previous subtitle', next:'Next subtitle',
    replay:'Replay sentence', subtitles:'Show/hide subtitles', dictionary:'Open dictionary',
    card:'Open card creator', known:'Mark known', learning:'Mark learning',
    unknown:'Mark unknown', track:'Track word', ignore:'Ignore word',
    pauseHover:'Toggle pause on hover', capture:'Quick create Anki card + screenshot', loop:'Loop current sentence', subtitleLanguage:'Cycle Japanese / both / English subtitles'
  });
  const modifierCodes=new Set(['ShiftLeft','ShiftRight','AltLeft','AltRight','ControlLeft','ControlRight','MetaLeft','MetaRight']);
  function fromEvent(e) {
    if(modifierCodes.has(e.code) || e.key==='Escape' || e.key==='Dead' || !/^(Key[A-Z]|Digit[0-9]|F(?:[1-9]|1[0-2])|Space|Arrow(?:Up|Down|Left|Right))$/.test(e.code||''))return '';
    return [e.ctrlKey?'Ctrl':'',e.altKey?'Alt':'',e.shiftKey?'Shift':'',e.metaKey?'Meta':'',e.code].filter(Boolean).join('+');
  }
  function format(binding) {
    if(!binding)return 'Not set';
    return binding.split('+').map(x => x.replace(/^Key([A-Z])$/,'$1').replace(/^Digit(\d)$/,'$1').replace(/^Arrow/,'').replace(/^Space$/,'Space')).join(' + ');
  }
  function validate(mapping) {
    const result={...DEFAULTS};
    if(mapping && typeof mapping==='object')for(const name of Object.keys(DEFAULTS)){
      const value=mapping[name];
      if(typeof value==='string' && value.length<70 && /^(?:(?:Ctrl|Alt|Shift|Meta)\+)*(?:Key[A-Z]|Digit[0-9]|F(?:[1-9]|1[0-2])|Space|Arrow(?:Up|Down|Left|Right))$/.test(value))result[name]=value;
    }
    return result;
  }
  // Duplicate bindings aren't dispatched twice; the first is kept and editor disallows duplicates.
  globalThis.KMShortcuts={DEFAULTS,LABELS,fromEvent,format,validate};
})();
