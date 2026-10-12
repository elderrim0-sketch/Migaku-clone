/* Shared, offline, pure subtitle utilities. No network or browser privileges. */
(function (global) {
  'use strict';
  function clean(value) {
    return String(value ?? '').replace(/<[^>]*>/g, '')
      .replace(/&(?:amp|lt|gt|quot|#39);/g, m => ({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[m]))
      .replace(/\u200b/g, '').replace(/[\t\r]+/g, ' ').replace(/\n+/g, ' ').trim();
  }
  function clock(ms) {
    let secs = Math.max(0, Math.floor(Number(ms) / 1000 || 0));
    const hours = Math.floor(secs / 3600); secs %= 3600;
    const mins = Math.floor(secs / 60); secs %= 60;
    return hours ? `${hours}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}` : `${mins}:${String(secs).padStart(2,'0')}`;
  }
  function parseClock(input) {
    const pieces = String(input || '').trim().replace(',', '.').split(':').map(Number);
    if (pieces.some(x => !Number.isFinite(x)) || pieces.length < 2 || pieces.length > 3) return NaN;
    return pieces.reduce((acc, n) => acc * 60 + n, 0) * 1000;
  }
  function normalize(cues) {
    if (!Array.isArray(cues)) return [];
    const result = [];
    for (const cue of cues.slice(0, 15000)) {
      const start = Number(cue.start);
      const end = Number(cue.end);
      const text = clean(cue.text).slice(0, 800);
      if (!Number.isFinite(start) || start < 0 || start > 86400000 || !text) continue;
      const stop = Number.isFinite(end) && end > start ? end : start + 2200;
      const prev = result[result.length - 1];
      if (prev && prev.text === text && Math.abs(prev.start - start) < 900) {
        prev.end = Math.max(prev.end, stop);
        continue;
      }
      result.push({ start, end: stop, text });
    }
    return result.sort((a, b) => a.start - b.start);
  }
  function parseJson3(data) {
    if (!data || !Array.isArray(data.events)) throw Error('Not a valid JSON3 subtitle track.');
    return normalize(data.events.filter(event => Array.isArray(event.segs)).map(event => ({
      start: Number(event.tStartMs),
      end: Number(event.tStartMs) + Number(event.dDurationMs || 2500),
      text: event.segs.map(s => s.utf8 || '').join('')
    })));
  }
  function parseFile(raw) {
    const text = String(raw || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const blocks = text.split(/\n\s*\n/);
    const cues = [];
    for (const block of blocks) {
      const lines = block.split('\n').filter(Boolean);
      const timeIdx = lines.findIndex(line => line.includes('-->'));
      if (timeIdx < 0) continue;
      const match = lines[timeIdx].match(/((?:\d{1,3}:)?\d{1,2}:\d{2}[,.]\d{1,3})\s*-->\s*((?:\d{1,3}:)?\d{1,2}:\d{2}[,.]\d{1,3})/);
      if (!match) continue;
      cues.push({start: parseClock(match[1]), end: parseClock(match[2]), text: lines.slice(timeIdx + 1).join(' ')});
    }
    return normalize(cues);
  }
  function activeIndex(cues, ms) {
    if (!cues.length) return -1;
    let low = 0, high = cues.length - 1, best = -1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (cues[mid].start <= ms) { best = mid; low = mid + 1; }
      else high = mid - 1;
    }
    return best >= 0 && ms <= cues[best].end + 350 ? best : -1;
  }
  global.KMTranscript = {clean, clock, parseClock, normalize, parseJson3, parseFile, activeIndex};
})(typeof globalThis === 'object' ? globalThis : this);
