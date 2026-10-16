'use strict';
(() => {
 const home = pages.home;
 pages.home = function () {
  const html = home();
  if (travelerState().background !== 'runFrontier' || data.magicBroom?.acquired) return html;
 const prop = '<button type="button" class="snow-broom-discovery" data-broom-discover aria-label="눈 속에 묻힌 빗자루 꺼내기" title="눈 속에 무언가 묻혀 있어요" style="visibility:hidden"><img src="assets/props/old-magic-broom-buried-v9.png" alt="" draggable="false"><span class="broom-glint" aria-hidden="true"></span><span class="broom-dust broom-dust-one" aria-hidden="true"></span><span class="broom-dust broom-dust-two" aria-hidden="true"></span></button>';
  return html.replace(/(<section\b[^>]*>)/, '$1' + prop);
 };
 // Anchor to one point in the panorama loop, not to a separate animation clock.
 // The discovery enters from the left with the ground and returns next lap if missed.
 let origin = null;
 window.addEventListener('magic-broom-reset', () => { origin = null; });
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const hints = new WeakMap();
 let lastHintTime = 0;
 function syncBroom(now) {
  const elapsed = lastHintTime ? Math.min(50, now-lastHintTime) : 0;
  lastHintTime = now;
  requestAnimationFrame(syncBroom);
  const prop = document.querySelector('[data-broom-discover]');
  if (!prop) return;
  const scene = prop.closest('.traveler-home');
  const track = scene?.querySelector('.desert-pan-track');
  if (!track) return;
  const repeat = travelerTrackRepeat(track);
  if (!(repeat > 0)) return;
  if (data.magicBroom?.acquired) { prop.remove(); return; }
  const translation = new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
  const distance = ((translation + 2 * repeat) % repeat + repeat) % repeat;
  if (origin === null) origin = distance - scene.clientWidth * .72;
  const x = reduced.matches ? scene.clientWidth * .72 : ((distance-origin+100)%repeat+repeat)%repeat-100;
  // Match the full flight broom's length at the grounded character scale.
  const broomWidth = scene.clientHeight * .52;
  prop.style.width = broomWidth + 'px';
  prop.style.height = broomWidth * .37 + 'px';
  const half = prop.offsetWidth / 2;
  const visible = x + half > 0 && x - half < scene.clientWidth;
  prop.style.left = x + 'px';
  prop.style.visibility = visible ? 'visible' : 'hidden';
  let hint = hints.get(prop);
  if (!hint) { hint = {wait:1000+Math.random()*1000, active:0}; hints.set(prop,hint); }
  if (!visible || document.hidden || reduced.matches) {
   prop.classList.remove('is-glinting');
   if (hint.active) { hint.active=0; hint.wait=1000+Math.random()*1000; }
  } else if (hint.active > 0) {
   hint.active -= elapsed;
   if (hint.active <= 0) { prop.classList.remove('is-glinting'); hint.wait=1000+Math.random()*1000; }
  } else {
   hint.wait -= elapsed;
   if (hint.wait <= 0) { hint.active=1200; prop.classList.add('is-glinting'); }
  }
  prop.tabIndex = visible ? 0 : -1;
  prop.disabled = !visible;
  prop.style.pointerEvents = visible ? 'auto' : 'none';
  prop.style.clipPath = 'inset(0 ' + Math.max(0,x+half-scene.clientWidth) + 'px 0 ' + Math.max(0,half-x) + 'px)';
 }
 requestAnimationFrame(syncBroom);
 document.addEventListener('click', event => {
  const prop = event.target.closest('[data-broom-discover]');
  if (!prop) return;
  const scene = prop.closest('.traveler-home'), bounds = scene?.getBoundingClientRect(), rect = prop.getBoundingClientRect();
  if (!bounds || prop.disabled || getComputedStyle(prop).visibility !== 'visible' || rect.right <= bounds.left || rect.left >= bounds.right) return;
  if (event.detail && (event.clientX < Math.max(rect.left,bounds.left) || event.clientX >= Math.min(rect.right,bounds.right) || event.clientY < Math.max(rect.top,bounds.top) || event.clientY >= Math.min(rect.bottom,bounds.bottom))) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (data.magicBroom?.acquired || travelerState().background !== 'runFrontier') return;
  if (travelerForestPreview()) {
   toast('미리보기예요. 실제 설산에서 빗자루를 획득할 수 있어요.');
   return;
  }
  const previous = data.magicBroom;
  data.magicBroom = { acquired: true, acquiredAt: new Date().toISOString() };
  if (!persist()) {
   if (previous === undefined) delete data.magicBroom;
   else data.magicBroom = previous;
   return;
  }
  prop.remove();
  // Preserve the current panorama and character animation clocks on discovery.
 }, true);
 if (page === 'home') render();
})();
