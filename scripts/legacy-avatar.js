'use strict';
// Generated pixel artwork is stored locally. Each garment is fitted to the
// character's 316 x 440 coordinate system, independent of viewport size.
const pixelAtlas='assets/pixel-wardrobe-v2.png';
const pixelCrops={
 black:[317,88,304,250],lilac:[632,89,313,260],hoodie:[953,76,300,280],
 shorts:[10,457,302,208],skirt:[322,452,308,223],whiteShoes:[637,455,295,228],blackShoes:[958,451,284,232],
 headset:[14,681,292,273],darkHeadset:[335,679,290,273],cap:[628,735,298,202],glasses:[945,786,299,150],
 bag:[13,947,291,274],apron:[315,946,318,294],game:[636,1010,307,204],book:[973,960,280,274]
};
const pixelFits={
 black:[78,232,168,100],lilac:[78,232,168,100],hoodie:[75,230,174,103],
 shorts:[121,309,84,48],skirt:[110,307,107,57],whiteShoes:[123,380,83,53],blackShoes:[123,380,83,53],
 headset:[48,30,218,205],darkHeadset:[48,30,218,205],cap:[51,4,222,161],glasses:[84,171,152,67],
 bag:[68,251,182,114],apron:[83,232,157,122],game:[211,288,70,46],book:[220,282,54,63]
};
const pixelItems={0:'lilac',1:'black',2:'apron',3:'headset',4:'glasses',5:'whiteShoes',6:'bag',7:'shorts',8:'hoodie',9:'black',10:'whiteShoes',11:'cap',12:'hoodie',14:'skirt',15:'black',16:'book',19:'game'};
clothes[0]='라일락 윈드브레이커';clothes[3]='실버 라일락 헤드셋';clothes[7]='라인 트랙 쇼츠';clothes[8]='크림 스웻 후디';clothes[9]='라인 트랙 재킷';clothes[5]='라일락 러닝 스니커즈';
const sportItems=[
 ['모노 트랙 재킷','outer',1,5,'black',0],
 ['에어 크림 후디','outer',3,5,'hoodie',0],
 ['차콜 러닝 스니커즈','feet',1,5,'blackShoes',1],
 ['미드나잇 헤드셋','head',3,10,'darkHeadset',1]
];
sportItems.forEach(([name,slot,category,lv,art,tab])=>{const id=clothes.length;clothes.push(name);slots.push(slot);unlocks.push([category,lv]);pixelItems[id]=art;wardrobeGroups[tab].unshift(id)});
function pixelKey(id){const source=variantSource[id]??id;return pixelItems[id]??pixelItems[source]}
function pixelTint(id){if(id===12)return 'hue-rotate(315deg) saturate(1.25)';if(id===15)return 'brightness(.85)';if(variantSource[id]!==undefined)return `hue-rotate(${rewardSteps.indexOf(unlocks[id][1])*19}deg)`;return ''}
function pixelSprite(key,cls='',id=-1){const [x,y,w,h]=pixelCrops[key];return `<svg class="${cls}" viewBox="${pixelCrops[key].join(' ')}" preserveAspectRatio="xMidYMid meet" style="filter:${pixelTint(id)||'none'}" aria-hidden="true"><defs><clipPath id="item-clip-${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image href="${pixelAtlas}" width="1254" height="1254" clip-path="url(#item-clip-${id})"/></svg>`}
const vectorItemImage=itemImage;
itemImage=function(id){const key=pixelKey(id);return key?pixelSprite(key,'inventory-sprite pixel-item',id):vectorItemImage(id)};
avatarLayers=function(){
 const equipped=data.equipped.filter(i=>clothes[i]&&unlocked(i));
 const headsetLayer=(id,key)=>{const crops=key==='headset'?[[35,683,240,145],[17,802,132,150],[159,793,146,160]]:[[352,685,264,137],[337,805,132,148],[488,797,137,158]],fits=[[49,18,225,119],[39,151,59,81],[222,151,61,82]];return `<g data-equipped-layer="${id}">${crops.map((crop,n)=>`<svg x="${fits[n][0]}" y="${fits[n][1]}" width="${fits[n][2]}" height="${fits[n][3]}" viewBox="${crop.join(' ')}" preserveAspectRatio="none" style="filter:${pixelTint(id)||'none'}"><image href="${pixelAtlas}" width="1254" height="1254"/></svg>`).join('')}</g>`};
 const overlay=(id)=>{const key=pixelKey(id);if(key==='headset'||key==='darkHeadset')return headsetLayer(id,key);if(key){const fit=pixelFits[key],[x,y,w,h]=pixelCrops[key];return `<svg data-equipped-layer="${id}" x="${fit[0]}" y="${fit[1]}" width="${fit[2]}" height="${fit[3]}" viewBox="${pixelCrops[key].join(' ')}" preserveAspectRatio="none" style="filter:${pixelTint(id)||'none'}"><defs><clipPath id="item-clip-${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image href="${pixelAtlas}" width="1254" height="1254" clip-path="url(#item-clip-${id})"/></svg>`}
   if(id===13)return `<g data-equipped-layer="13" fill="#efd38a" stroke="#ab8748" stroke-width="1.5"><path d="M140 242q21 23 43 0" fill="none"/><path d="m161 253 5 6-5 6-5-6Z"/></g>`;
   return `<svg data-equipped-layer="${id}" x="221" y="285" width="58" height="66" viewBox="95 118 51 55">${outfitShape(id)}</svg>`;
 };
 const order=['legs','top','outer','feet','neck','eyes','head','prop'];
 return `<div class="dressed-avatar pixel-avatar" role="img" aria-label="하늘 · ${equipped.map(i=>esc(clothes[i])).join(', ')||'기본 옷차림'}"><svg viewBox="0 0 316 440" aria-hidden="true"><ellipse cx="164" cy="427" rx="68" ry="10" fill="#78609220"/>${equipped.filter(i=>slots[i]==='bag').map(overlay).join('')}<svg x="0" y="0" width="316" height="440" viewBox="0 0 316 440"><image href="${pixelAtlas}" width="1254" height="1254"/></svg>${equipped.filter(i=>slots[i]!=='bag').sort((a,b)=>order.indexOf(slots[a])-order.indexOf(slots[b])).map(overlay).join('')}</svg></div>`;
};
data.equipped=data.equipped.filter(i=>clothes[i]&&unlocked(i));
persist();render();
