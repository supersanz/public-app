// Individual square assets share a 24px transparent margin on a 256px canvas.
function activityIcon(name,id){
 const keys=['academy','book','computer','language','certificate','running','dumbbell','pilates','heart','swimming','cycling','hiking','food','home','history','coffee','energyCan','tonicBottle','water','leaf','game','film','headphones','mic','moon'];
 const assetKey=id===18?'language':id===41?'certificate':id===21||id===39?'water':name;
 if(keys.includes(assetKey))return `<img class="activity-image" src="assets/activity-icons/fitted-v6/${assetKey}.png" alt="" aria-hidden="true" width="58" height="58" draggable="false">`;
 const drawings={
  running:'<circle cx="14" cy="4" r="2"/><path d="m7 10 4-3 4 3 4 1m-8-4-2 7 5 3 1 5M9 14l-3 5H2"/>',
  pilates:'<path d="M2 21h20M5 17h8l4-6m-4 6 5 3M8 17l-2-5 4-4 5 2"/><circle cx="12" cy="4" r="2"/>',
  heart:'<circle cx="12" cy="4" r="2"/><path d="M3 8h18M12 6v8m0 0-5 7m5-7 5 7"/>',
  leaf:'<path d="M5 20c-3-8 1-15 15-16 0 12-6 18-15 16ZM5 20 16 9m-6 6v-4m0 4h4"/>',
  game:'<path d="M7 7h10c3 0 4 3 5 10 .4 3-2 4-4 2l-3-3H9l-3 3c-2 2-4.4 1-4-2 1-7 2-10 5-10Z"/><path d="M6 10v5m-2.5-2.5h5M16 11h.01M19 14h.01"/>',
  film:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 8V4l17-2 1 5M8 3l3 4m4-5 3 4m-8 6 5 3-5 3Z"/>',
  mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M6 10v2a6 6 0 0 0 12 0v-2m-6 8v4m-4 0h8M10 6h4m-4 3h4"/>',
  food:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v19M18 22V3c-4 2-4 9 0 10"/>',
  energyCan:'<rect x="6" y="3" width="12" height="19" rx="3"/><path d="M6 7h12M9 3V1h6m-2 9-4 5h4l-2 5 5-7h-4Z"/>',
  tonicBottle:'<path d="M9 2h6v5l3 4v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9l3-4ZM9 5h6M6 12h12m-12 6h12m-6-5v4m-2-2h4"/>',
  water:'<path d="m5 3 2 18h10l2-18ZM6 10c4-3 8 3 12 0"/>',
  history:'<rect x="5" y="3" width="14" height="19" rx="2"/><path d="M9 1v4m6-4v4M9 10h6m-6 4h6m-6 4h4"/>',
  swimming:'<path d="m3 12 7-4 6 4m-6-4 3-4 5 1M2 17q2-3 5 0t5 0 5 0 5 0M2 21q2-3 5 0t5 0 5 0 5 0"/><circle cx="19" cy="10" r="2"/>',
  cycling:'<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-9 5 9H5m10 0 3-12h3M8 5h5m-3 0v3"/>',
  hiking:'<path d="m2 21 7-14 4 7 3-5 6 12ZM7 11l2 2 2-2m3 3 2 2 2-2"/>',
  academy:'<path fill="var(--activity-fill)" d="M4 9h16v12H4z"/><path d="m3 9 9-6 9 6M4 9v12h16V9M10 21v-6h4v6M7 11h1m8 0h1M7 14h1m8 0h1"/><path d="M12 3V1h4v3"/>',
  computer:'<rect x="3" y="4" width="18" height="13" rx="2" fill="var(--activity-fill)"/><path d="m9 8-2 2 2 2m6-4 2 2-2 2M12 17v4m-5 0h10"/>',
  book:'<path fill="var(--activity-fill)" d="M12 6C9 4 5 4 3 5v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Z"/><path d="M12 6v15M6 9h3m-3 4h3m6-4h3m-3 4h3"/>',
  home:'<path fill="var(--activity-fill)" d="m8 11 7 3-3 7H3z"/><path d="m11 12 6-9M7 16l-2 4m5-3-1 4M18 9v4m-2-2h4M5 3v4M3 5h4"/>',
  language:'<rect x="2" y="3" width="15" height="12" rx="3" fill="var(--activity-fill)"/><path d="m6 15-2 3v-3m14-9h1a3 3 0 0 1 3 3v9l-3-2h-7a3 3 0 0 1-3-3M6 11l2-5 2 5m-3-2h2"/>',
  certificate:'<rect x="5" y="2" width="14" height="16" rx="2" fill="var(--activity-fill)"/><path d="M8 6h8M8 9h5"/><circle cx="13" cy="15" r="3" fill="var(--activity-fill)"/><path d="m11 18-1 4 3-1 3 1-1-4"/>',
  coffee:'<path fill="var(--activity-fill)" d="M4 8h12v7a6 6 0 0 1-12 0z"/><path d="M16 9h2a3 3 0 0 1 0 6h-2M3 22h16M7 2v3m5-3v3"/>',
  dumbbell:'<rect x="7" y="10" width="10" height="4" rx="1" fill="var(--activity-fill)"/><rect x="3" y="6" width="4" height="12" rx="1.5" fill="var(--activity-fill)"/><rect x="17" y="6" width="4" height="12" rx="1.5" fill="var(--activity-fill)"/><path d="M1 10v4m22-4v4"/>',
  headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="5" height="9" rx="2" fill="var(--activity-fill)"/><rect x="16" y="12" width="5" height="9" rx="2" fill="var(--activity-fill)"/>',
  moon:'<path fill="var(--activity-fill)" d="M19 16A9 9 0 0 1 8 4a9 9 0 1 0 11 12Z"/><path d="M17 3v4m-2-2h4M21 10v2"/>'
 };
 const key=id===18?'language':id===41?'certificate':id===21?'water':name;
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[key]||`<path d="${paths[name]||paths.book}"/>`}</svg>`;
}
