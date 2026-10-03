// Activity-only illustrations; navigation keeps its compact outline icons.
function activityIcon(name,id){
 const drawings={
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
 const key=id===18?'language':id===41?'certificate':name;
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[key]||`<path d="${paths[name]||paths.book}"/>`}</svg>`;
}
