(function(root){
 'use strict';
 const destinations={
  japan:{level:60,name:'일본 · 도쿄',file:'japan-travel-loop-v2.png',description:'배운 표현을 떠올리며 도쿄 거리를 걸어요.',kind:'activity',ids:[18,42,43],target:10,label:'외국어 공부 10회 완료',short:'외국어 공부'},
  italy:{level:70,name:'이탈리아 · 로마',file:'italy-travel-loop-v2.png',description:'에스프레소 향이 흐르는 로마의 골목을 걸어요.',kind:'weekly',ids:[45],target:3,label:'「내 몸엔 카페인이 흘러」 주간도전 3회 완료',short:'카페인 주간도전'},
  france:{level:80,name:'프랑스 · 파리',file:'france-travel-loop-v2.png',description:'직접 차린 식사의 즐거움을 파리의 거리로 이어가요.',kind:'weekly',ids:[36],target:3,label:'「우리 집 요리사」 주간도전 3회 완료',short:'요리 주간도전'},
  britain:{level:90,name:'영국 · 런던',file:'britain-travel-loop-v2.png',description:'책 속에서 만난 이야기를 런던의 책방 거리에서 찾아요.',kind:'weekly',ids:[32],target:3,label:'「지식은 힘이야」 주간도전 3회 완료',short:'독서 주간도전'},
  america:{level:100,name:'미국 · 뉴욕',file:'america-travel-loop-v2.png',description:'만드는 즐거움을 안고 새로운 아이디어가 모이는 도시로 떠나요.',kind:'activity',ids:[3],target:20,label:'코딩 활동 20회 완료',short:'코딩 활동'}
 };
 Object.assign(destinations,{
  "thailand": {
    "level": 110,
    "name": "태국 · 방콕",
    "file": "thailand-travel-loop-v2.png",
    "description": "강바람을 따라 황금빛 사원이 보이는 방콕의 거리를 걸어요.",
    "kind": "activity",
    "ids": [
      8
    ],
    "target": 20,
    "label": "가벼운 산책 20회 완료",
    "short": "가벼운 산책",
    "point": [
      81,
      48
    ],
    "shortName": "방콕",
    "outfit": "tropical"
  },
  "bali": {
    "level": 120,
    "name": "인도네시아 · 발리",
    "file": "bali-travel-loop-v2.png",
    "description": "느긋한 숨을 고르며 발리의 푸른 바다를 만나요.",
    "kind": "activity",
    "ids": [
      68
    ],
    "target": 15,
    "label": "명상 15회 완료",
    "short": "명상",
    "point": [
      85,
      62
    ],
    "shortName": "발리",
    "outfit": "tropical"
  },
  "singapore": {
    "level": 130,
    "name": "싱가포르",
    "file": "singapore-travel-loop-v2.png",
    "description": "작은 건강 습관을 모아 싱가포르의 수변 산책길로 떠나요.",
    "kind": "activity",
    "ids": [
      21
    ],
    "target": 30,
    "label": "물 한 잔 마시기 30회 완료",
    "short": "물 한 잔 마시기",
    "point": [
      82,
      56
    ],
    "shortName": "싱가포르",
    "outfit": "tropical"
  },
  "spain": {
    "level": 140,
    "name": "스페인 · 바르셀로나",
    "file": "spain-travel-loop-v2.png",
    "description": "색과 상상력이 가득한 바르셀로나의 거리를 걸어요.",
    "kind": "activity",
    "ids": [
      53
    ],
    "target": 15,
    "label": "그림 그리기 15회 완료",
    "short": "그림 그리기",
    "point": [
      45,
      36
    ],
    "shortName": "바르셀로나",
    "outfit": "city"
  },
  "greece": {
    "level": 150,
    "name": "그리스 · 산토리니",
    "file": "greece-travel-loop-v2.png",
    "description": "따뜻한 차 한 잔의 여유를 산토리니의 바다로 이어가요.",
    "kind": "activity",
    "ids": [
      66
    ],
    "target": 20,
    "label": "차 마시기 20회 완료",
    "short": "차 마시기",
    "point": [
      53,
      37
    ],
    "shortName": "산토리니",
    "outfit": "tropical"
  },
  "turkey": {
    "level": 160,
    "name": "튀르키예 · 이스탄불",
    "file": "turkey-travel-loop-v2.png",
    "description": "오늘의 이야기를 담아 두 대륙이 만나는 도시로 떠나요.",
    "kind": "activity",
    "ids": [
      50
    ],
    "target": 20,
    "label": "일기 쓰기 20회 완료",
    "short": "일기 쓰기",
    "point": [
      58,
      35
    ],
    "shortName": "이스탄불",
    "outfit": "city"
  },
  "egypt": {
    "level": 170,
    "name": "이집트 · 카이로",
    "file": "egypt-travel-loop-v2.png",
    "description": "책에서 만난 오랜 문명을 카이로의 풍경에서 찾아요.",
    "kind": "activity",
    "ids": [
      2
    ],
    "target": 25,
    "label": "독서 25회 완료",
    "short": "독서",
    "point": [
      55,
      44
    ],
    "shortName": "카이로",
    "outfit": "desert"
  },
  "dubai": {
    "level": 180,
    "name": "아랍에미리트 · 두바이",
    "file": "dubai-travel-loop-v2.png",
    "description": "꾸준히 쌓은 배움과 함께 두바이의 새로운 풍경을 만나요.",
    "kind": "activity",
    "ids": [
      41
    ],
    "target": 20,
    "label": "자격증 공부 20회 완료",
    "short": "자격증 공부",
    "point": [
      64,
      45
    ],
    "shortName": "두바이",
    "outfit": "desert"
  },
  "australia": {
    "level": 190,
    "name": "호주 · 시드니",
    "file": "australia-travel-loop-v2.png",
    "description": "힘찬 발걸음으로 시드니의 햇살 가득한 항구를 여행해요.",
    "kind": "activity",
    "ids": [
      4
    ],
    "target": 25,
    "label": "가벼운 러닝 25회 완료",
    "short": "가벼운 러닝",
    "point": [
      91,
      78
    ],
    "shortName": "시드니",
    "outfit": "city"
  },
  "brazil": {
    "level": 200,
    "name": "브라질 · 리우데자네이루",
    "file": "brazil-travel-loop-v2.png",
    "description": "음악의 리듬을 따라 리우의 해변 산책길을 걸어요.",
    "kind": "activity",
    "ids": [
      14
    ],
    "target": 30,
    "label": "음악 감상 30회 완료",
    "short": "음악 감상",
    "point": [
      35,
      76
    ],
    "shortName": "리우데자네이루",
    "outfit": "tropical"
  },
  "antarctica": {
    "level": 210,
    "name": "남극",
    "file": "antarctica-travel-loop-v2.png",
    "description": "차근차근 몸을 풀고 남극의 눈부신 빙산을 만나러 가요.",
    "kind": "activity",
    "ids": [
      17
    ],
    "target": 40,
    "label": "스트레칭 40회 완료",
    "short": "스트레칭",
    "point": [
      54,
      93
    ],
    "shortName": "남극",
    "outfit": "polar"
  }
});
 // Preserve planned destinations while hiding them from travel views.
 for(const [id,place] of Object.entries(destinations))place.hidden=id!=='japan';
 destinations.russia={level:70,name:'러시아 · 모스크바',file:'russia-travel-loop-v1.png',description:'따뜻한 겨울옷을 입고 눈 내린 모스크바 거리를 걸어요.',kind:'activity',ids:[8],target:20,label:'가벼운 산책 20회 완료',short:'가벼운 산책',point:[61,23],shortName:'모스크바',outfit:'russia',hidden:false};
 // Beyond Seoul, quests unlock destinations from level 50 onward.
 for(const [index,place] of Object.values(destinations).entries()){place.level=50;place.levelLabel='50+';place.exp=10+index*2;}
 Object.assign(destinations.japan,{kind:'quest-days',ids:[18,43,44,49],label:'외국어 퀘스트 누적 10일 완료 (하루 1회)',short:'외국어 퀘스트',exp:10});
 Object.assign(destinations.russia,{kind:'weekly',ids:[33],target:2,label:'「어제보다 강하게」 운동 주간도전 2회 완료',short:'운동 주간도전',exp:12});
 destinations.vietnam={level:50,levelLabel:'50+',name:'베트남',file:'',description:'',kind:'quest-days',ids:[61],target:10,label:'과일 먹기 누적 10일 완료 (하루 1회)',short:'과일 먹기',exp:10,hidden:false,pending:true};
 const requirements={...destinations,city:{level:50,name:'한국 · 서울',kind:'activity-days',ids:[50],target:7,unit:'일',label:'일기 누적 7일 작성',short:'일기 쓰기',exp:7},sky:{level:40,name:'하늘 성',kind:'weekly',ids:[32],target:2,label:'「지식은 힘이야」 독서 주간 도전 2회 완료',short:'독서 주간 도전',exp:5}};
 function count(logs,rule,today='9999-12-31'){
  const seen=new Map();
  for(const log of logs||[]){
   if(!/^\d{4}-\d{2}-\d{2}$/.test(log.date||'')||log.date>today)continue;
   if(rule.kind==='quest-days'&&log.source!=='daily-quest')continue;
   if(rule.kind==='weekly'&&log.source!=='weekly-quest')continue;
   if(rule.kind!=='weekly'&&log.source==='weekly-quest')continue;
   for(const id of rule.ids)if((log.ids||[]).includes(id)){
    if(rule.kind==='quest-days'||rule.kind==='activity-days'){seen.set(log.date,1);}
    else if(rule.kind==='weekly'){
     const d=new Date(log.date+'T12:00:00Z');if(!Number.isFinite(+d))continue;
     d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);seen.set(d.toISOString().slice(0,10),1);
    }else{
     const key=log.date+':'+id,units=Math.max(1,Math.floor(Number(log.counts?.[id])||1));
     seen.set(key,Math.max(seen.get(key)||0,units));
    }
   }
  }
  return [...seen.values()].reduce((a,b)=>a+b,0);
 }
 function status(id,level,logs,saved={},today){
  const rule=requirements[id];if(!rule)return null;
  const current=count(logs,rule,today),owned=(saved.claimed||[]).includes(id);
  return {...rule,count:current,levelMet:level>=rule.level,activityMet:current>=rule.target,owned,unlocked:!rule.pending&&(owned||(level>=rule.level&&current>=rule.target))};
 }
 const api={destinations,requirements,count,status};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TravelUnlocks=api;
})(typeof window==='undefined'?globalThis:window);
