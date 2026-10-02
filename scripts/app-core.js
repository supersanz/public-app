'use strict';
// Start the public release independently of earlier developer/test progress.
const KEY='daily-quest-vercel-20261002014848487', cats=['자기계발','건강','생활력','휴식','카페인'];
const acts=[['학원',0,'academy'],['공부',0,'study'],['독서',0,'book'],['코딩',0,'computer'],['러닝',1,'running'],['근력운동',1,'dumbbell'],['요리',2,'food'],['청소',2,'home'],['산책',3,'leaf'],['게임',3,'game'],['영화',3,'film'],['커피',4,'coffee'],['에너지드링크',4,'energyCan'],['박카스',4,'tonicBottle'],['음악 감상',3,'headphones'],['노래 부르기',3,'mic'],['필라테스',1,'pilates']];
// Stable activity IDs: append new quests without changing historical records.
const QuestCatalog={};
[
 ['스트레칭',1,'heart','몸을 부드럽게 풀기','스트레칭 5분 하기',15,'daily'],
 ['외국어 공부',0,'book','새로운 표현 배우기','외국어 단어나 표현 5개 익히기',25,'daily'],
 ['하루 계획',2,'history','하루의 방향 정하기','오늘 할 일 3가지 적기',15,'daily'],
 ['감사 일기',3,'leaf','좋았던 순간 남기기','감사했던 일 한 가지 적기',15,'daily'],
 ['물 마시기',4,'coffee','물 한 잔의 여유','물 한 잔 마시기',10,'daily'],
 ['디지털 휴식',3,'moon','잠깐 화면 내려놓기','화면 없이 15분 쉬기',20,'daily'],
 ['생활비 기록',2,'history','오늘의 지출 살피기','지출을 기록하고 확인하기',20,'daily'],
 ['주간 독서',0,'book','한 주의 독서','이번 주 책 50쪽 읽기',100,'weekly'],
 ['주간 운동',1,'dumbbell','세 번의 움직임','이번 주 운동 3회 마치기',120,'weekly'],
 ['주간 정리',2,'home','한 공간 새로 정리하기','방이나 책상 한 곳을 꼼꼼히 정리하기',80,'weekly'],
 ['주간 회고',0,'history','이번 주 돌아보기','배운 점과 다음 주 목표 적기',80,'weekly'],
 ['주간 요리',2,'food','직접 차린 세 끼','이번 주 직접 요리 3회 하기',100,'weekly'],
 ['주간 취미',3,'headphones','취미에 몰입하기','좋아하는 취미를 한 주 합계 1시간 즐기기',80,'weekly'],
 ['주간 산책',1,'leaf','세 번의 바깥 공기','이번 주 산책 3회 다녀오기',90,'weekly'],
 ['주간 안부',3,'heart','소중한 사람에게 안부','가족이나 친구에게 안부 전하기',60,'weekly']
].forEach(([name,category,icon,title,detail,xp,period])=>{const id=acts.length;acts.push([name,category,icon]);QuestCatalog[id]={title,detail,xp,period};});
const WeeklyQuestRules={};
[
 ['지식은 힘이야',0,'book',[2],3,100],
 ['어제보다 강하게',1,'dumbbell',[4,5,16,17],5,150],
 ['청소왕',2,'home',[7],3,80],
 ['지식을 쌓자',0,'book',[0,1,3,18],5,120],
 ['우리 집 요리사',2,'food',[6],3,100],
 ['음악에 미치는 내가',3,'headphones',[9,10,14,15],5,80],
 ['좀 더 빠르게',3,'leaf',[8],3,90],
 ['사람이 물을 마셔야지',2,'coffee',[21],5,60]
].forEach(([title,category,icon,activities,target,xp])=>{const id=acts.length;acts.push([title,category,icon]);QuestCatalog[id]={title,xp,period:'weekly'};WeeklyQuestRules[id]={activities,target,xp};});
// Append to preserve all existing saved activity IDs.
QuestCatalog[acts.length]={title:'수면 8시간',xp:30,period:'daily'};
acts.push(['수면 8시간',3,'moon']);
// Append specialized study quests without shifting existing saved IDs.
[
 ['자격증 공부','book',50],
 ['프로젝트 개발','computer',60],
 ['외국어 문법·독해','book',35],
 ['외국어 회화 연습','mic',35]
].forEach(([title,icon,xp])=>{QuestCatalog[acts.length]={title,xp,period:'daily'};acts.push([title,0,icon]);});

const coffeeWeeklyId=acts.length;
acts.push(['카페인 누적',2,'coffee']);
QuestCatalog[coffeeWeeklyId]={title:'카페인 누적',xp:30,period:'weekly'};
WeeklyQuestRules[coffeeWeeklyId]={activities:[11,12,13],target:10,xp:30,countUnits:true,unit:'회'};
WeeklyQuestRules[32].description='이번 주 독서 활동을 3회 기록해 보세요.';
// Append activities so existing records keep their original IDs.
for(const [title,icon] of [['수영','swimming'],['자전거','cycling'],['등산','hiking']]){
 const id=acts.length;acts.push([title,1,icon]);
 QuestCatalog[id]={title,xp:30,period:'daily'};
 WeeklyQuestRules[33].activities.push(id);
}
WeeklyQuestRules[33].description='이번 주 운동 활동을 5회 기록해 보세요.';
WeeklyQuestRules[coffeeWeeklyId].description='커피·에너지 드링크·박카스 기록을 합쳐 10회.';
WeeklyQuestRules[36].description='이번 주 요리 활동을 3회 기록해 보세요.';
WeeklyQuestRules[37].activities=[14,15];
WeeklyQuestRules[37].target=3;
WeeklyQuestRules[37].description='이번 주 음악 활동을 3회 기록해 보세요.';
WeeklyQuestRules[38].description='이번 주 산책 활동을 3회 기록해 보세요.';
WeeklyQuestRules[39].description='이번 주 물 마시기를 5회 기록해 보세요.';
const paths={home:'M3 11 12 3l9 8v10h-6v-7H9v7H3Z',book:'M12 5v16M12 5C8 2 3 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-4-2-7-1-10 1',heart:'M20 4c-4-3-8 2-8 2S8 1 4 4c-7 6 8 17 8 17S27 10 20 4ZM3 12h5l2-4 4 8 2-4h5',leaf:'M3 21C0 6 8 3 21 3c0 14-7 19-18 18ZM3 21 17 7',coffee:'M3 7h14v8c0 8-14 8-14 0ZM17 8h3c5 0 3 7-3 7M6 2v2m5-2v2',laptop:'M4 3h16v14H4ZM1 21h22',game:'M7 7h10c5 0 8 15 3 13l-5-4H9l-5 4C-1 22 2 7 7 7ZM7 10v5m-2-3h4m7 0h1m2 2h1',film:'M3 8h18v13H3ZM3 8 2 3l18-2 1 5M7 3l3 4m5-5 3 4',bolt:'m14 2-9 12h6l-1 8 9-12h-6Z',bell:'M4 17h16l-3-4V8a5 5 0 0 0-10 0v5ZM10 21h4',shirt:'m7 3-5 4 3 5 3-2v12h8V10l3 2 3-5-5-4c-2 4-8 4-10 0',trophy:'M7 2h10v9c0 7-10 7-10 0ZM7 5H2v4c0 4 5 4 5 4m10-8h5v4c0 4-5 4-5 4M12 16v6m-5 0h10',history:'M5 2h14v20H5ZM8 7h8M8 12h8M8 17h5',mic:'M9 4a3 3 0 0 1 6 0v9a3 3 0 0 1-6 0ZM5 10v3a7 7 0 0 0 14 0v-3M12 20v3m-4 0h8',touch:'M10 13V4a2 2 0 0 1 4 0v7c9-2 8 7 4 11h-7L4 14c-2-4 3-4 6-1',moon:'M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12'};
paths.food='M4 12h16a8 8 0 0 1-16 0ZM7 21h10M8 3c-2 2 2 3 0 5m4-6c-2 2 2 4 0 6m4-5c-2 2 2 3 0 5';
paths.computer='M3 3h18v12H3ZM12 15v4m-4 0h8M2 22h20';
paths.muscle='M4 17.5 6.5 8l1-3.5a1.5 1.5 0 0 1 1.8-1l3.2.8a1.5 1.5 0 0 1 1 1.8l-.5 1.7-3-.6-.9 5.5c1.6-2.1 4.1-3 6.7-2.4 3.2.7 5.1 3.5 4.5 6.3-.7 3.4-4.3 4.9-8.1 4.4-3.3-.3-6.2-1.4-8.2-3.5ZM10 12.7l1.4 2.2m3.5-1.4c1.5-.2 2.5.6 2.8 1.8';
paths.academy='M3 21V9l9-6 9 6v12H3ZM9 21v-6h6v6M6 10h2m8 0h2M6 13h2m8 0h2M12 3V1h5v3';
paths.study='m14 4 3-3 5 5-3 3M4 14 14 4l5 5L9 19l-7 3 2-8Zm0 0 5 5M2 22h20';
paths.running='M3 7v9h17a1 1 0 0 0 1-1v-1.2a2 2 0 0 0-1.5-1.9L15 11l-4-5-3 3-5-2ZM3 16v3h18v-3M10 8l-2 2m4 0-2 2M4 13h3';
// Equipment silhouettes remain legible at activity-card and history-badge sizes.
paths.pilates='M4 15H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1M5 18h14M18 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM5 7h2v3H5ZM17 7h2v3h-2Z';
paths.runningShoe='M3 14V8l4 3 3-1 3 4 7 2a2 2 0 0 1 1 2v2H3a1 1 0 0 1-1-1v-3l1-2Zm-1 3h19M10 12l-2 2m4 0-2 2';
paths.dumbbell='M8 10h8v4H8ZM4 7h4v10H4ZM16 7h4v10h-4ZM2 10h2v4H2ZM20 10h2v4h-2Z';
paths.energyCan='M8 3h8m-9 3h10M8 3 7 6v14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6l-1-3M7 18h10m-4-10-4 6h3l-1 3 4-6h-3l1-3Z';
paths.tonicBottle='M9 2h6v4H9ZM9 6v2l-2 3v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-9l-2-3V6M7 12h10M7 18h10m-6-3h2';
paths.headphones='M3 13V11a9 9 0 0 1 18 0v2M3 12h4v8H5a2 2 0 0 1-2-2v-6Zm18 0h-4v8h2a2 2 0 0 0 2-2v-6Z';
paths.swimming='M16 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM4 13l5-5 5 3 3 3M9 8 6 5H3M2 17q2-2 4 0t4 0t4 0t4 0t4 0M2 21q2-2 4 0t4 0t4 0t4 0t4 0';
paths.cycling='M9 18a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm14 0a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM5 18l5-9 5 9H5m10 0 3-12h-3M8 6h4m6 0h2l1 3';
paths.hiking='M2 21 9 8l5 8 3-5 5 10H2ZM6 13l3 2 2-3M9 8V2l6 2-6 2';
function musicActivityIds(text){const compact=text.replace(/\s/g,'');const ids=[];if(/음악감상|음악듣|음악들|노래듣|노래들/.test(compact))ids.push(14);if(/노래부르|노래불|노래방/.test(compact))ids.push(15);return ids}
const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]||paths.book}"/></svg>`;
let saved;try{saved=JSON.parse(localStorage.getItem(KEY)||'null')}catch{}
let data=saved&&Array.isArray(saved.logs)?saved:{logs:[],worn:0,skin:2,friends:[],alarms:[['07:00','23:30',true,true],['09:00','00:30',true,true]],disableScenePreview:true,walkExp:0,playerResetEarned:0,levelBaseline:[0,0,0,0,0],levelCurveVersion:3,petProgressVersion:2};
let page='home',modal='',selected=new Set(),rankTab='친구',transcript='',recognition,recordDate='';
const recordingDate=()=>recordDate||today();
const today=()=>new Date().toLocaleDateString('sv-SE');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch{toast('저장 공간을 사용할 수 없습니다.');return false}}
function activityExp(log,id){const value=log.exp?.[id];return Number.isFinite(value)&&value>=0?value:20}
function totals(){const t=[0,0,0,0,0],seen=new Set();data.logs.filter(l=>l.date<=today()).forEach(l=>(l.ids||[]).forEach(id=>{const key=l.date+':'+id;if(Number.isInteger(id)&&acts[id]&&!seen.has(key)&&!(l.date===today()&&l.midnightIds?.includes(id))){seen.add(key);t[acts[id][1]]+=activityExp(l,id)}}));return t}
function categoryExp(i){return Math.max(0,totals()[i]-(data.levelBaseline?.[i]||0))}
function level(i){return (i<4?5:15)+Math.floor(categoryExp(i)/100)}
function migratePlayerCurve(){
 if(data.levelCurveVersion===3)return;
 const earned=totals().reduce((a,b)=>a+b,0)+Math.max(0,Number(data.walkExp)||0);
 const old=Math.max(0,earned-(data.playerResetEarned||0));
 const previous=data.levelCurveVersion===2?LevelCurve.v2Progress(old):data.levelCurveVersion===1?LevelCurve.previousProgress(old):{lv:1+Math.floor(old/1000),xp:old%1000,required:1000};
 data.playerResetEarned=earned-LevelCurve.total(previous.lv)-Math.floor(previous.xp/previous.required*LevelCurve.required(previous.lv));
 data.levelCurveVersion=3;persist();
}
function player(){migratePlayerCurve();const earned=totals().reduce((a,b)=>a+b,0)+Math.max(0,Number(data.walkExp)||0),growth=Math.max(0,earned-(data.playerResetEarned||0));return {...LevelCurve.progress(growth),earned,total:earned}}
// Requested one-time level restart. Historical activity and EXP remain intact.
if(data.petProgressVersion!==2){data.playerResetEarned=totals().reduce((a,b)=>a+b,0);data.petProgressVersion=2;persist()}
const bar=v=>`<div class="bar"><i style="width:${Math.max(0,Math.min(100,v))}%"></i></div>`;
const heading=(title,right='',back=false)=>`<div class="heading">${back?'<button class="icon" data-page="home" aria-label="홈으로">‹</button>':''}<h1>${title}</h1>${right}</div>`;
const skins=[['베이직',1],['브론즈',5],['실버',10],['골드',20],['모카',30],['오로라',50]];
function home(){let p=player(),penalty=data.logs.find(l=>l.date===today())?.penalty||0;return `<section class="hero"><header class="player"><h1>하늘 <small>PLAYER</small></h1><button class="icon" data-page="alarm" aria-label="알람">♧</button><div class="xp"><b>Lv. ${p.lv}</b>${bar(p.xp/LevelCurve.required(p.lv)*100)}<span>${p.xp} / ${LevelCurve.required(p.lv).toLocaleString()} EXP</span></div></header></section><section class="panel home-panel"><h2>오늘의 능력치</h2>${cats.slice(0,4).map((c,i)=>`<div class="stat">${icon(['book','heart','home','moon'][i])}<strong>${c}</strong><span>Lv. ${level(i)}</span>${bar((i===1?100-penalty:([52,38,30,63][i]+totals()[i])%100))}</div>`).join('')}<button class="caffeine" data-page="caffeine">${icon('coffee')}<div class="detail"><strong>카페인</strong><div>Lv. ${level(4)} · ${skins[data.skin][0]}</div>${bar(55+totals()[4]%40)}</div><span>›</span></button><button class="primary" style="margin-top:15px" data-modal="record">＋ 오늘 기록하기</button><button class="secondary" data-page="rewards">성장 보상 보기 ›</button></section>`}
function touch(){return `<section class="page record-page">${heading('','',true)}<h1>터치로 기록하기</h1><p>오늘 한 활동을 선택해 주세요.</p><div class="touch-grid">${acts.map((a,i)=>`<button class="activity ${selected.has(i)?'selected':''}" data-act="${i}" aria-pressed="${selected.has(i)}">${icon(a[2])}<span class="activity-name">${a[0]}</span>${selected.has(i)?'<span class="check">✓</span>':''}</button>`).join('')}</div><button class="primary activity-save" data-save>${selected.size?selected.size+'개 활동 기록 저장':'활동을 선택해 주세요'}</button></section>`}
function voice(){return `<section class="page record-page">${heading('','',true)}<h1>음성으로 기록하기</h1><p>잠들기 전, 오늘의 활동을 기록하세요.</p><button class="mic" data-mic aria-label="음성 인식 시작">${icon('mic')}</button><p id="voice-status">마이크를 누르고 이야기해 주세요.</p><textarea class="transcript" id="transcript" aria-label="인식된 문장" placeholder="인식된 문장을 확인하거나 직접 입력하세요.">${esc(transcript)}</textarea><div class="actions"><button data-mic>↻ 다시 말하기</button><button class="primary" data-voice-save>✓ 확인</button></div></section>`}
function history(){return `<section class="page">${heading('활동 기록','<button class="icon" data-modal="record" aria-label="기록 추가">＋</button>')}<p class="center">${new Date().getFullYear()}년 ${new Date().getMonth()+1}월</p>${data.logs.length?data.logs.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(l=>{let exp=0;return `<article class="panel"><div class="date"><h3>${new Date(l.date+'T12:00:00').toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'})}</h3><small>${l.ids.length}개 활동</small></div>${cats.map((c,i)=>{let ids=l.ids.filter(id=>acts[id][1]===i);if(!ids.length)return '';if(i<4)exp+=ids.length*20;return `<div class="history-row"><span><strong>${c}</strong><br>${ids.map(id=>acts[id][0]).join(' · ')}</span><b>+${ids.length*20} EXP</b></div>`}).join('')}${l.penalty?`<div class="history-row">건강 게이지 감소 <b>−${l.penalty}</b></div>`:''}<div class="summary"><strong>총 획득 경험치</strong><b>+${exp} EXP</b></div></article>`}).join(''):'<div class="panel empty">아직 기록한 활동이 없습니다.<p>오늘의 첫 활동을 기록해 보세요.</p><button class="primary" data-page="touch">오늘 기록하기</button></div>'}</section>`}
function ranking(){const names=rankTab==='친구'?['서연','지민','준호','민수','도현']:['아린','준호','서연','서우','나연'],levels=rankTab==='친구'?[52,49,46,43,41]:[62,59,56,53,51];return `<section class="page">${heading('랭킹','<button class="icon" data-modal="friend" aria-label="친구 추가">♙＋</button>')}<div class="tabs">${['친구','전체'].map(t=>`<button data-rank="${t}" class="${rankTab===t?'active':''}">${t}</button>`).join('')}</div><p class="muted center">미리보기 랭킹 · 레벨 / 누적 경험치 순</p><div class="podiums">${[1,0,2].map(i=>`<div class="podium"><div>♛ ${i+1}</div><div class="portrait ${['','man','blond'][i]}"></div><b>${names[i]}</b><small>Lv.${levels[i]}</small></div>`).join('')}</div>${[3,4].map(i=>`<div class="rank-row"><b>${i+1}</b><div class="avatar"></div><strong>${names[i]}</strong><span>Lv.${levels[i]}</span></div>`).join('')}<p class="center">···</p><div class="rank-row selected"><div class="avatar"></div><strong>하늘 (나)</strong><span>Lv.${player().lv}</span></div>${data.friends.length?`<p>추가한 친구: ${data.friends.map(esc).join(', ')}</p>`:''}</section>`}
const clothes=['라이트닝 윈드브레이커','블랙 후드티','키친 에이프런','감성 헤드폰','지적인 안경','스포티 스니커즈','데일리 백팩','카고 팬츠','베이직 티셔츠','트랙 재킷','코지 슬리퍼','커피 볼캡'];
function style(){return `<section class="page">${heading('캐릭터 꾸미기','<button style="padding:9px" data-basic>기본 착장</button>')}<div class="wardrobe"></div><p class="muted center">${clothes[data.worn]} · 선택한 아이템</p><p class="preview-note">캐릭터는 기본 미리보기입니다.</p><div class="items">${clothes.map((n,i)=>`<button class="item ${data.worn===i?'selected':''} ${([1,9,11].includes(i)&&player().lv<20)?'locked':''}" data-wear="${i}" aria-label="${n}"><div class="item-art" style="background-position:${[8.5,36.3,64,91.7][i%4]}% ${[57.8,72.5,86][Math.floor(i/4)]}%"></div><span>${n}</span>${data.worn===i?'<span class="check">✓</span><small>착용 중</small>':([1,9,11].includes(i)&&player().lv<20)?'<small>🔒 Lv.20</small>':''}</button>`).join('')}</div><button class="secondary" data-page="rewards">성장 보상 ›</button></section>`}
function caffeine(){return `<section class="page">${heading('카페인 테두리','',true)}<p>카페인 Lv.${level(4)} · 해금한 테두리를 누르면 적용돼요.</p>${skins.map((s,i)=>`<button class="skin ${data.skin===i?'selected':''} ${level(4)<s[1]?'locked':''}" data-skin="${i}"><strong>${i+1}. ${s[0]}</strong>　Lv.${s[1]} 해금 <span style="float:right">${data.skin===i?'✓ 적용 중':level(4)<s[1]?'🔒':'보유 중'}</span><div class="skin-art" style="background-position:15% ${[36,47,58,70,82,95][i]}%"></div></button>`).join('')}</section>`}
function rewards(){return `<section class="page">${heading('성장 보상','',true)}${cats.map((c,i)=>`<article class="panel"><h3>${c} · Lv.${level(i)}</h3><p class="muted">${level(i)>=15?'모든 단계 해금':'다음 보상 LV.'+[1,5,10,15].find(v=>v>level(i))}</p><div class="reward-grid">${[1,5,10,15].map((v,j)=>`<div><div class="reward-art" style="background-position:${[27,43,59,75][j]}% ${[13,31,49,66,84][i]}%"></div><small>LV.${v}</small>${bar(level(i)/v*100)}<small>${level(i)>=v?'✓':'🔒'}</small></div>`).join('')}</div></article>`).join('')}</section>`}
function alarm(){return `<section class="page">${heading('알람 설정')}${['평일','주말'].map((n,i)=>`<article class="panel"><div class="alarm-banner ${i?'night':''}"><h2>${n}</h2><p>${i?'토요일부터 일요일까지<br>조금 더 여유로운 시간을 즐겨보세요.':'월요일부터 금요일까지<br>규칙적인 하루를 만들어보세요.'}</p></div>${['기상시간','취침시간'].map((v,j)=>`<label class="time-row">${v}<input aria-label="${n} ${v}" type="time" data-time="${i},${j}" value="${data.alarms[i][j]}" required></label>`).join('')}<div class="switches">${['기상 알람','취침 알람'].map((n,j)=>`<label>${n}<input type="checkbox" data-toggle="${i},${j+2}" ${data.alarms[i][j+2]?'checked':''}></label>`).join('')}</div></article>`).join('')}<button class="primary" data-alarm-save>저장하기</button><p class="note">이 기기에 설정을 저장합니다. 브라우저를 닫은 동안 울리는 알람은 지원하지 않습니다.</p><button class="secondary" data-page="references">디자인 원본 이미지 보기</button></section>`}
const refs=['home-reference','record-modal','voice','touch','history','ranking-compare','ranking-friend-add','customize','rewards','caffeine','alarm'];
function references(){return `<section class="page">${heading('디자인 원본','',true)}<div class="references">${refs.map(n=>`<a href="assets/${n}.png" target="_blank" rel="noopener"><img src="assets/${n}.png" alt="${n} 디자인 원본" loading="lazy"></a>`).join('')}</div></section>`}
function dialog(){return `<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="heading"><h2 id="dialog-title">${modal==='record'?'활동 기록':'친구 추가'}</h2><button class="icon" data-close aria-label="닫기">×</button></div>${modal==='record'?'<p class="center">오늘의 순간을 기록해 주세요.<br>어떤 방식으로 기록할까요?</p><div class="actions"><button data-page="voice">'+icon('mic')+'음성</button><button data-page="touch">'+icon('touch')+'터치</button></div>':'<p class="muted">데모 친구 민지 또는 MJ2048을 검색하세요.</p><input id="friend-query" aria-label="친구 검색" placeholder="닉네임 또는 친구 코드"><button class="secondary" data-search>검색</button><div id="friend-result"></div><p class="center">내 친구 코드　<b>#HN0812</b></p>'}</section></div>`}
const pages={home,touch,voice,history,ranking,style,caffeine,rewards,alarm,references};
function render(){document.getElementById('app').innerHTML=`<div class="status"><span>${new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',hour12:false})}</span><span>▮▮▮　◉　▰</span></div>${pages[page]()}${['touch','voice'].includes(page)?'':`<nav class="nav" aria-label="주 메뉴">${[['home','홈','home'],['history','기록','history'],['ranking','랭킹','trophy'],['style','꾸미기','shirt'],['alarm','알람','bell']].map(([id,n,ic])=>`<button data-page="${id}" class="${page===id?'active':''}" ${page===id?'aria-current="page"':''}>${icon(ic)}${n}</button>`).join('')}</nav>`}${modal?dialog():''}`;if(modal)document.querySelector('.modal button')?.focus()}
function navigate(next){recognition?.abort();page=next;modal='';render();window.scrollTo(0,0)}
function toast(message){document.querySelector('.toast')?.remove();let el=document.createElement('div');el.className='toast';el.setAttribute('role','status');el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),3200)}
function saveActivities(ids,penalty=0){if(!ids.length&&!penalty){toast('기록할 활동을 선택하거나 입력해 주세요.');return}let l=data.logs.find(x=>x.date===today());if(!l){l={date:today(),ids:[],penalty:0};data.logs.push(l)}let fresh=ids.filter(id=>!l.ids.includes(id));l.ids=[...new Set([...l.ids,...ids])];l.penalty=Math.max(l.penalty||0,penalty);if(persist()){selected.clear();navigate('history');toast(fresh.length?`${fresh.length}개 활동을 저장했습니다.`:penalty?'건강 게이지에 반영했습니다.':'오늘 이미 기록한 활동입니다.')}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.page)return navigate(d.page);if(d.modal){modal=d.modal;render()}if('close'in d){modal='';render()}if('act'in d){let i=+d.act;selected.has(i)?selected.delete(i):selected.add(i);render()}if('save'in d)saveActivities([...selected]);if('rank'in d){rankTab=d.rank;render()}if('wear'in d){const i=+d.wear;if([1,9,11].includes(i)&&player().lv<20){toast('플레이어 Lv.20에 해금됩니다.');return}data.worn=i;persist();render()}if('basic'in d){data.worn=0;persist();render()}if('skin'in d){const i=+d.skin;if(level(4)<skins[i][1]){toast(`카페인 Lv.${skins[i][1]}에 해금됩니다.`);return}data.skin=i;persist();render()}if('alarmSave'in d){if(persist())toast('알람 설정을 저장했습니다.')}if('mic'in d)startVoice();if('voiceSave'in d){transcript=document.getElementById('transcript').value;let ids=acts.flatMap((a,i)=>(transcript.includes(a[0])||(i===4&&/달리기|런닝/.test(transcript)))?[i]:[]);if(/운동/.test(transcript)&&!ids.some(i=>acts[i]?.[1]===1))ids.push(5);saveActivities(ids,(/술|음주/.test(transcript)?15:0)+(/담배|흡연/.test(transcript)?15:0))}if('search'in d){let q=document.getElementById('friend-query').value.trim();document.getElementById('friend-result').innerHTML=['민지','MJ2048','#MJ2048'].includes(q)?'<div class="rank-row"><div class="avatar"></div><strong>민지<br><small>Lv.12 · #MJ2048</small></strong><button data-add-friend>＋ 추가</button></div>':'<p>검색 결과가 없습니다.</p>'}if('addFriend'in d){if(!data.friends.includes('민지'))data.friends.push('민지');persist();modal='';render();toast('민지를 데모 친구 목록에 추가했습니다.')}});
document.addEventListener('change',e=>{const d=e.target.dataset;if(d.time){let [i,j]=d.time.split(',').map(Number);if(e.target.value)data.alarms[i][j]=e.target.value}if(d.toggle){let [i,j]=d.toggle.split(',').map(Number);data.alarms[i][j]=e.target.checked}});
document.addEventListener('input',e=>{if(e.target.id==='transcript')transcript=e.target.value});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal){modal='';render()}if(e.key==='Tab'&&modal){let list=[...document.querySelectorAll('.modal button,.modal input')];let first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
function startVoice(){const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Speech){toast('이 브라우저에서는 문장을 직접 입력해 주세요.');return}recognition?.abort();recognition=new Speech();recognition.lang='ko-KR';recognition.onresult=e=>{transcript=e.results[0][0].transcript;if(page==='voice')document.getElementById('transcript').value=transcript};recognition.onerror=()=>toast('마이크 권한을 확인하거나 직접 입력해 주세요.');recognition.onend=()=>{let el=document.getElementById('voice-status');if(el)el.textContent='인식된 문장을 확인해 주세요.'};recognition.start();document.getElementById('voice-status').textContent='듣고 있어요…'}
render();

