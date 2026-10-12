/* Kotoba Line Icons — original lightweight SVG set, bundled locally. */
(()=>{
 const paths={
  'book':'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v14"/>',
  'book-open':'<path d="M3 5.5h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6v13h-6a3 3 0 0 0-3 2 3 3 0 0 0-3-2H3Z"/><path d="M12 8.5v12"/>',
  'volume':'<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a5 5 0 0 1 0 6M17 6a9 9 0 0 1 0 12"/>',
  'image':'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.4"/><path d="m4 17 5-5 4 3 3-3 4 4"/>',
  'list':'<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
  'sparkle':'<path d="m12 3 1.6 6.4L20 11l-6.4 1.6L12 19l-1.6-6.4L4 11l6.4-1.6L12 3ZM19 18l.6 1.5L21 20l-1.4.5L19 22l-.6-1.5L17 20l1.4-.5L19 18Z"/>',
  'external':'<path d="M13 4h7v7M20 4l-10 10"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/>',
  'arrow-right':'<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" opacity=".085"/><path d="M6.5 12h11m-4.5-4.5L17.5 12 13 16.5" stroke-width="2.3"/>',
  'arrow-left':'<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" opacity=".085"/><path d="M17.5 12h-11m4.5-4.5L6.5 12 11 16.5" stroke-width="2.3"/>',
  'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  'settings':'<circle cx="12" cy="12" r="3.2"/><path d="M10 2.8h4l.8 2.5 2 1.1 2.5-.6 2 3.4-1.8 1.9v2l1.8 1.9-2 3.4-2.5-.6-2 1.1-.8 2.5h-4l-.8-2.5-2-1.1-2.5.6-2-3.4 1.8-1.9v-2L2.7 9.2l2-3.4 2.5.6 2-1.1.8-2.5Z"/>',
  'x':'<path d="M5 5l14 14M19 5 5 19"/>',
  'play':'<path d="m8 5 11 7-11 7Z"/>',
  'pause':'<path d="M8 5v14m8-14v14"/>',
  'repeat':'<path d="M17 3l4 4-4 4M3 10V8a1 1 0 0 1 1-1h17M7 21l-4-4 4-4m14 1v2a1 1 0 0 1-1 1H3"/>',
  'captions':'<rect x="2.5" y="4" width="19" height="16" rx="3"/><path d="M7 10h4M7 14h4M14 10h3M14 14h3"/>',
  'video':'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 9 5 3-5 3Z"/>',
  'target':'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  'chart':'<path d="M4 19V5m0 14h17M8 15v-4m5 4V7m5 8v-7"/>',
  'library':'<path d="M4 5h5v15H4zM9 3h6v17H9zM15 7h5v13h-5z"/>',
  'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 18v3h16v-3"/>',
  'upload':'<path d="M12 16V4m-5 5 5-5 5 5M4 18v3h16v-3"/>',
  'check':'<path d="m4 12 5 5L20 6"/>',
  'clock':'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  'flame':'<path d="M12 22c5 0 8-3.5 8-8 0-3-2-5-4.5-7.8.3 3-1 4-2 4.3-.5-3.5-2.5-6.1-5.4-8.2.3 5-2.6 7-3.6 10C2.5 18 7 22 12 22Z"/>',
  'layers':'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5"/>',
  'moon':'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>',
  'cloud':'<path d="M6 19h12a4 4 0 0 0 0-8 6 6 0 0 0-11.5-1.5A4.7 4.7 0 0 0 6 19Z"/>',
  'flower':'<circle cx="12" cy="12" r="2"/><path d="M12 10c-5-11 5-11 0 0Zm2 1c11-6 10 4 0 1Zm-1 3c5 11-5 11 0 0Zm-3-1c-11 6-10-4 0-1Z"/>',
  'heart':'<path d="M20 9c0 5-8 11-8 11S4 14 4 9a4.5 4.5 0 0 1 8-2.4A4.5 4.5 0 0 1 20 9Z"/>',
  'diamond':'<path d="m12 2 9 10-9 10L3 12 12 2Z"/>',
  'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2.1 2.1m9.8 9.8L19 19M19 5l-2.1 2.1m-9.8 9.8L5 19"/>',
  'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  'word':'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9h8m-4-3v11M8 14h8"/>',
  'mouse':'<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 6v5"/>',
  'folder':'<path d="M3 6h7l2 2h9v11H3Z"/>',
  'plus':'<path d="M12 4v16M4 12h16"/>',
  'headphones':'<path d="M4 14V12a8 8 0 0 1 16 0v2M4 14h4v7H6a2 2 0 0 1-2-2Zm16 0h-4v7h2a2 2 0 0 0 2-2Z"/>'
 };
 function svg(name){const path=paths[name]||paths.book;const ns='http://www.w3.org/2000/svg',s=document.createElementNS(ns,'svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','1.8');s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');s.setAttribute('aria-hidden','true');s.classList.add('km-line-svg');s.innerHTML=path;return s;}
 function mount(el,name){if(!el)return;el.append(svg(name));}
 function hydrate(root=document){root.querySelectorAll('[data-km-icon]').forEach(el=>{if(el.querySelector('svg'))return;mount(el,el.dataset.kmIcon);});}
 globalThis.KMIcons={svg,mount,hydrate,names:Object.keys(paths)};
})();