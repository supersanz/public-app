/* Adventure journal presentation; existing record/alarm actions stay intact. */
(()=>{
 const history=pages.history,alarm=pages.alarm;
 const decor=name=>`<span class="journal-art decor-${name}" aria-hidden="true"></span>`;
 const header=(title,subtitle,night=false)=>`<header class="journal-heading ${night?'journal-heading-night':''}"><div><h1>${title}</h1><p>${subtitle}</p></div>${decor(night?'night':'reader')}</header>`;
 const corners='<i class="journal-corner tl"></i><i class="journal-corner tr"></i><i class="journal-corner bl"></i><i class="journal-corner br"></i>';
 pages.history=()=>{
  const doc=new DOMParser().parseFromString(history(),'text/html'),root=doc.querySelector('.record-history');
  root.querySelector('.heading')?.remove();root.querySelector('.intro')?.remove();
  const calendar=root.querySelector('.calendar'),month=root.querySelector('.calendar-heading');
  const all=calendar.querySelector('[data-date=""]');all.classList.add('journal-all');month.appendChild(all);
  const first=new Date(historyMonth.getFullYear(),historyMonth.getMonth(),1).getDay();
  calendar.insertAdjacentHTML('afterbegin',Array(first).fill('<span aria-hidden="true"></span>').join(''));
  calendar.querySelectorAll('button').forEach(b=>{b.setAttribute('aria-label',b.dataset.date);b.querySelector('small')?.remove();});
  const cal=doc.createElement('div');cal.className='journal-calendar';month.before(cal);cal.append(month);
  cal.insertAdjacentHTML('beforeend','<div class="journal-weekdays" aria-hidden="true">'+['일','월','화','수','목','금','토'].map(d=>`<span>${d}</span>`).join('')+'</div>');cal.append(calendar);cal.insertAdjacentHTML('beforeend',corners+decor('castle'));
  const list=doc.createElement('div');list.className='journal-records';list.tabIndex=0;list.setAttribute('role','region');list.setAttribute('aria-label','기록한 활동 목록, 세로 스크롤');
  root.querySelectorAll(':scope > article,:scope > .empty').forEach(e=>list.append(e));root.append(list);
  list.querySelectorAll('.record-activity-icon').forEach(b=>{const span=doc.createElement('span');span.className='journal-activity-name';span.textContent=b.getAttribute('aria-label')||'';b.querySelector('.record-count')?.remove();b.append(span);});
  list.querySelectorAll('.record-category').forEach(row=>{const i=[0,1,2,3,4].find(n=>row.classList.contains('category-'+n));row.insertAdjacentHTML('afterbegin',decor(['book','heart','house','headphones','coffee'][i]));});
  list.querySelectorAll('article').forEach(article=>{const sum=article.querySelector('.summary b'),date=article.querySelector('.date');if(sum&&date){date.querySelector('small')?.remove();const pill=doc.createElement('span');pill.className='journal-xp-pill';pill.textContent='총 '+sum.textContent;date.append(pill);}});
  root.insertAdjacentHTML('afterbegin',header('기록','차곡차곡 쌓이는 나의 하루'));
  root.insertAdjacentHTML('beforeend','<button class="primary journal-record-button" data-page="touch">＋ 오늘 기록하기</button>');
  return root.outerHTML;
 };
 pages.alarm=()=>{
  const doc=new DOMParser().parseFromString(alarm(),'text/html'),root=doc.querySelector('.alarm-page');root.querySelector('.heading')?.remove();
  root.insertAdjacentHTML('afterbegin',header('알람','좋은 하루가 좋은 내일을 만든다',true));
  const note=root.querySelector('.note');note.insertAdjacentHTML('afterbegin',decor('moon'));note.insertAdjacentHTML('beforeend',corners);
  root.querySelectorAll('.alarm-card').forEach(card=>card.insertAdjacentHTML('beforeend',corners));
  root.querySelectorAll('.alarm-label').forEach((label,i)=>{label.querySelector('svg')?.remove();label.insertAdjacentHTML('afterbegin',i%2?icon('moon'):'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>');});
  root.querySelectorAll('.alarm-time-button strong').forEach(el=>{const [period,...time]=el.textContent.trim().split(/\s+/);el.innerHTML='<span class="alarm-period">'+period+'</span><span class="alarm-digits">'+time.join('')+'</span>';});
  return root.outerHTML;
 };
 const rewardPage=pages.rewards;
 pages.rewards=()=>{
  const doc=new DOMParser().parseFromString(rewardPage(),'text/html'),root=doc.querySelector('.journey-pass');
  if(!root)return rewardPage();
  const title=root.querySelector('.heading'),intro=root.querySelector('.journey-intro');
  const headingEl=doc.createElement('header');headingEl.className='journal-heading journal-heading-rewards';
  const copy=doc.createElement('div'),h=doc.createElement('h1'),p=doc.createElement('p');
  h.textContent='성장 보상';if(intro)p.append(...Array.from(intro.childNodes,node=>node.cloneNode(true)));copy.append(h,p);headingEl.append(copy);
  title?.remove();intro?.remove();root.prepend(headingEl);return root.outerHTML;
 };
 const touchPage=pages.touch;
 pages.touch=()=>{
  const doc=new DOMParser().parseFromString(touchPage(),'text/html'),root=doc.querySelector('.record-page'),grid=root.querySelector('.touch-grid');
  const buttons=Array.from(grid.querySelectorAll('[data-act]'));grid.replaceChildren();grid.classList.add('grouped-activities');
  const descriptions=['배우고 생각하는 힘','튼튼한 몸을 만드는 습관','일상을 스스로 돌보는 힘','마음을 쉬게 하는 시간','오늘 마신 음료 기록'];
  cats.forEach((name,i)=>{const section=doc.createElement('section');section.className='activity-group activity-group-'+i;section.innerHTML=`<header><span>${decor(['book','heart','house','headphones','coffee'][i])}</span><div><h2>${name}</h2><p>${descriptions[i]}</p></div></header><div class="activity-group-grid"></div>`;buttons.filter(b=>acts[Number(b.dataset.act)][1]===i).forEach(b=>section.lastElementChild.append(b));grid.append(section);});
  return root.outerHTML;
 };
 const journalRender=render;
 const navPaths={home:'M3 11 12 3l9 8v10h-6v-7H9v7H3Z M8 5V3H5v5',history:'M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-1-7-2-10 1Zm0 0v16M5 8l4 1m-4 3 4 1m6-4 4-1m-4 5 4-1',rewards:'M12 21v-8M12 15C4 16 2 11 3 7c6-1 10 2 9 8Zm0-3C11 5 15 2 21 3c1 6-3 10-9 9Z M7 21h10',alarm:'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm5 3a2 2 0 0 0 4 0M12 2v2'};
 render=function(){const scroll=document.querySelector('.grouped-activities')?.scrollTop||0;journalRender();const list=document.querySelector('.grouped-activities');if(list)list.scrollTop=scroll;document.querySelectorAll('.nav [data-page]').forEach(button=>{const path=navPaths[button.dataset.page];if(!path)return;button.querySelector('svg')?.remove();button.insertAdjacentHTML('afterbegin',`<svg class="journal-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`);});};
 render();
})();
