'use strict';
/* =========================================================
   추가 요소: 가방·캐릭터 화면, 장신구, 서브 퀘스트(부탁),
   모아 베기, 등불 기술 3종, 무기 종류(검·창)
   ========================================================= */
EXT.save.push(()=>({trk:[],eq:[],sq:{},sqn:{},wpn:'sword',sk:0,picks:{}}));

/* ---------- 장신구 ---------- */
const TRK={
  ribbon:{n:'연 꼬리 리본',d:'구르기 거리 +30%'},
  fang:{n:'늑대 송곳니',d:'치명타 확률 +10%'},
  teabag:{n:'단비의 보리차 주머니',d:'MP 회복 속도 2배'},
  minerlamp:{n:'광부의 등',d:'등불 범위 +15%'},
  scale:{n:'상인의 저울',d:'줍는 은화 +50%'},
  hood:{n:'사막 두건',d:'더위를 먹지 않음 · 독 지속 절반'},
  button:{n:'허수아비 단추',d:'최대 HP +25'},
  mask:{n:'금 간 재의 가면',d:'어두운 곳에서 공격력 +15%'},
  feather:{n:'심지의 깃털',d:'얻는 경험치 +20%'},
};
const has=id=>!!(S.eq&&S.eq.includes(id));
const st0={atk:st.atk,maxHp:st.maxHp};
st.atk=()=>Math.round(st0.atk()*(has('mask')&&darkCur>0.6?1.15:1));
st.maxHp=()=>st0.maxHp()+(has('button')?25:0);
function recalcMod(){MOD.dash=has('ribbon')?1.3:1;MOD.crit=0.1+(has('fang')?0.1:0);MOD.mp=has('teabag')?2:1;MOD.lan=has('minerlamp')?1.15:1;MOD.coin=has('scale')?1.5:1;MOD.xp=has('feather')?1.2:1}
function giveTrinket(id){if(S.trk.includes(id))return;S.trk.push(id);if(S.eq.length<2)S.eq.push(id);recalcMod();sfx('lvl');toast(`장신구 ‘${TRK[id].n}’을(를) 얻었다! (K키로 확인)`,'gold')}
function toggleTrinket(id){const i=S.eq.indexOf(id);if(i>=0)S.eq.splice(i,1);else{if(S.eq.length>=2){toast('장신구는 2개까지 낄 수 있어요. 하나를 먼저 빼 주세요');return}S.eq.push(id)}recalcMod();S.hp=Math.min(S.hp,st.maxHp());sfx('equip');saveGame()}

/* ---------- 무기: 검 · 창 ---------- */
function drawThrust(){
  const prog=1-P.atkT/WPN.dur,K=P.mini?0.6:1,v=DIRV[P.dir],len=Math.sin(Math.min(1,prog*1.2)*Math.PI)*30*K+6*K,cx=P.x-cam.x,cy=P.y-8*K-cam.y;
  for(let r=2;r<len;r++){ctx.fillStyle=r>len-5?'#f4f8ff':(r>len-8?'#a8b4c8':'#8f6640');ctx.fillRect(Math.round(cx+v[0]*r-(v[1]?0.5:0)),Math.round(cy+v[1]*r-(v[0]?0.5:0)),v[1]?2:1,v[0]?2:1)}
  ctx.fillStyle='#fff2b0';ctx.fillRect(Math.round(cx+v[0]*len),Math.round(cy+v[1]*len),1,1);
}
const WEAPONS={
  sword:{kind:'sword',name:'검',desc:'빠르고 넓게 벤다',dur:0.26,cd:0.34,reach:12,box:dx=>dx?[11,11]:[13,9],mul:1,draw:null},
  spear:{kind:'spear',name:'창',desc:'길고 느리다 · 피해 +45% · 폭이 좁다',dur:0.34,cd:0.56,reach:20,box:dx=>dx?[18,5]:[5,18],mul:1.45,draw:drawThrust},
};
const spearOK=()=>S.q>=7;
function setWeapon(k,quiet){if(k==='spear'&&!spearOK())k='sword';S.wpn=k;WPN=WEAPONS[k];if(!quiet){sfx('equip');toast(`무기를 ${WEAPONS[k].name}(으)로 바꿨다 · ${WEAPONS[k].desc}`)}}

/* ---------- 모아 베기 ---------- */
function chargeAttack(){
  if(P.giant||P.auto)return;
  const v=DIRV[P.dir],K=P.mini?0.7:1,a=st.atk();P.atkCd=0.5;P.chg=0;P.chgReady=false;sfx('swing');sfx('dash');shake=Math.max(shake,2);
  if(S.wpn==='spear'){
    P.dvx=v[0];P.dvy=v[1];P.dashT=0.16;P.dashCd=0.3;P.fxT=0.28;P.fxK='thrust';
    const cx=P.x+v[0]*30*K,cy=P.y-7*K+v[1]*30*K,hw=(v[0]?36:8)*K,hh=(v[0]?8:36)*K;
    for(const e of E.slice())if(e.born<=0&&e.st!=='fade'&&overlap(cx,cy,hw,hh,e.x,e.y-4,6,5))hitEnemy(e,rollDmg(a*2.4),v[0],v[1]);
    if(BOSS&&BOSS.st!=='rise'&&overlap(cx,cy,hw,hh,BOSS.x,BOSS.y-BOSS.hcy,BOSS.hw,BOSS.hh))hitBoss(rollDmg(a*2.4));
  }else{
    P.fxT=0.32;P.fxK='spin';const R=30*K;
    for(const e of E.slice())if(e.born<=0&&e.st!=='fade'&&Math.hypot(e.x-P.x,e.y-4-(P.y-7*K))<R+5){const an=Math.atan2(e.y-P.y,e.x-P.x);hitEnemy(e,rollDmg(a*1.7),Math.cos(an),Math.sin(an))}
    if(BOSS&&BOSS.st!=='rise'&&Math.hypot(BOSS.x-P.x,BOSS.y-BOSS.hcy-(P.y-7))<R+Math.max(BOSS.hw,BOSS.hh))hitBoss(rollDmg(a*1.7));
    for(const p of PROJ)if(Math.hypot(p.x-P.x,p.y-P.y)<R+4)p.dead=true;
  }
}

/* ---------- 등불 기술 ---------- */
const SKILLS=[{k:'ember',name:'불씨 던지기',key:'Z',mp:4,min:8,d:'앞으로 불씨를 던진다 (원거리)'},{k:'shield',name:'빛의 방패',key:'X',mp:8,min:14,d:'2초 동안 어떤 공격도 맞지 않는다'},{k:'plant',name:'등불 심기',key:'C',mp:10,min:20,d:'바닥에 등불을 심는다. 그림자가 다가오지 못하고 천천히 회복된다'}];
want.ember=false;want.shield=false;want.plant=false;
Object.assign(KEYMAP,{z:'ember',x:'shield',c:'plant',i:'inv',r:'weapon'});
let EMB=[],PLANT=null,skCd={ember:0,shield:0,plant:0},skT=0;
function castSkill(sk){
  if(S.q<sk.min){toast(`${sk.name}은(는) 아직 배우지 못했어요`);return}
  if(skCd[sk.k]>0)return;
  if(S.mp<sk.mp){toast('MP가 부족해요');return}
  S.mp-=sk.mp;const v=DIRV[P.dir],lp=lanternPos();
  if(sk.k==='ember'){skCd.ember=0.45;EMB.push({x:lp.x,y:lp.y,vx:v[0]*210,vy:v[1]*210,life:0.9});sfx('spore')}
  else if(sk.k==='shield'){skCd.shield=6;P.shield=2.2;sfx('heal');for(let k=0;k<20;k++){const a=k/20*6.283;PARTS.push({x:P.x+Math.cos(a)*10,y:P.y-8+Math.sin(a)*10,vx:Math.cos(a)*30,vy:Math.sin(a)*30,life:0.4,max:0.4,col:'#fff2b0',sz:1})}}
  else{skCd.plant=8;PLANT={x:P.x+v[0]*10,y:P.y+v[1]*8,t:25};if(solidAt(PLANT.x,PLANT.y-3)){PLANT.x=P.x;PLANT.y=P.y}sfx('plant')}
}
EXT.player.push(dt=>{for(const k in skCd)if(skCd[k]>0)skCd[k]-=dt;if(P.shield>0)P.shield-=dt;if(P.fxT>0)P.fxT-=dt;for(const sk of SKILLS)if(want[sk.k])castSkill(sk)});
EXT.update.push(dt=>{
  for(const b of EMB){b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.life<=0||solidAt(b.x,b.y+3)){b.dead=true;continue}
    if(Math.random()<0.6)PARTS.push({x:b.x,y:b.y,vx:rand(-10,10),vy:rand(-10,10),life:0.25,max:0.25,col:'#ffb44a',sz:1});
    for(const e of E){if(e.born>0||e.st==='fade')continue;if(overlap(b.x,b.y,3,3,e.x,e.y-4,6,6)){b.dead=true;hitEnemy(e,{d:Math.round(st.flare()*0.9),crit:false},b.vx/420,b.vy/420);break}}
    if(!b.dead&&BOSS&&BOSS.st!=='rise'&&!BOSS.under&&overlap(b.x,b.y,3,3,BOSS.x,BOSS.y-BOSS.hcy,BOSS.hw,BOSS.hh)){b.dead=true;hitBoss({d:Math.round(st.flare()*0.9),crit:false})}}
  EMB=EMB.filter(b=>!b.dead);
  if(PLANT){PLANT.t-=dt;if(PLANT.t<=0||areaAt(PLANT.x)!==curArea)PLANT=null}
  if(has('hood')){if(typeof heat!=='undefined')heat=0;if(typeof poisonT!=='undefined'&&poisonT>2)poisonT=2}
  skT-=dt;if(skT<=0){skT=1;SKILLS.forEach((sk,i)=>{if(S.q>=sk.min&&!(S.sk&(1<<i))){S.sk|=1<<i;sfx('lvl');toast(`새 등불 기술: ${sk.name} (${sk.key}키) · ${sk.d}`,'good')}});
    if(spearOK()&&!S.flags.spearTip){S.flags.spearTip=1;toast('모루가 창을 만들어 줬다! R키로 검과 창을 바꿀 수 있다','good')}}
});
EXT.safe.push(L=>{if(PLANT)L.push({x:PLANT.x,y:PLANT.y,r:70})});
EXT.lights.push((L,warm)=>{for(const b of EMB)L.push([b.x,b.y,22]);if(PLANT){L.push([PLANT.x,PLANT.y-6,(PLANT.t<3?PLANT.t/3:1)*84]);warm.push([PLANT.x,PLANT.y-6,50,0.2])}if(P.shield>0)L.push([P.x,P.y-8,30]);for(const w of WITEMS)if(w.vis())L.push([w.x,w.y-4,14])});
EXT.sorted.push(D=>{if(PLANT)D.push({y:PLANT.y,f:()=>{const x=Math.round(PLANT.x-cam.x),y=Math.round(PLANT.y-cam.y);ctx.fillStyle='#2a1e14';ctx.fillRect(x,y-3,1,4);if(PLANT.t>3||Math.floor(time*8)%2)ctx.drawImage(LANTERN,x-2,y-10)}});
  for(const w of WITEMS)if(w.vis()&&areaAt(w.x)===curArea&&Math.abs(w.x-cam.x-VW/2)<VW&&Math.abs(w.y-cam.y-VH/2)<VH)D.push({y:w.y,f:()=>ctx.drawImage(w.s,Math.round(w.x-w.s.width/2-cam.x),Math.round(w.y-w.s.height-cam.y+Math.sin(time*3+w.x)*1.5))})});
EXT.post.push(()=>{
  const x=Math.round(P.x-cam.x),K=P.mini?0.6:1,y=Math.round(P.y-8*K-cam.y);
  for(const b of EMB){const bx=Math.round(b.x-cam.x),by=Math.round(b.y-cam.y);ctx.fillStyle='#ffb44a';ctx.fillRect(bx-1,by-1,3,3);ctx.fillStyle='#fff8d8';ctx.fillRect(bx,by,1,1)}
  if(P.shield>0&&!CINE){ctx.fillStyle=P.shield<0.5&&Math.floor(time*14)%2?'#ffb44a':'#fff2b0';for(let a=0;a<6.28;a+=0.3)ctx.fillRect(Math.round(x+Math.cos(a+time*3)*12*K),Math.round(y+Math.sin(a+time*3)*13*K),1,1)}
  if(P.chg>0.15&&mode==='play'&&!P.giant){const k=Math.min(1,P.chg/0.55);ctx.fillStyle=P.chgReady?(Math.floor(time*16)%2?'#ffffff':'#ffd36b'):'#ffb44a';const r=(P.chgReady?9:16-k*8)*K;for(let a=0;a<6.28;a+=P.chgReady?0.5:0.9)ctx.fillRect(Math.round(x+Math.cos(a+time*6)*r),Math.round(y+Math.sin(a+time*6)*r),1,1)}
  if(P.fxT>0){const pr=1-P.fxT/(P.fxK==='spin'?0.32:0.28),v=DIRV[P.dir];
    if(P.fxK==='spin'){const a1=pr*6.9+DIRA[P.dir];for(let a=a1-3.6;a<a1;a+=0.05){const age=(a1-a)/3.6;for(let r=22;r<=30;r++){if(r<26&&age>0.3)continue;ctx.fillStyle=r>=29?'#ffffff':(age<0.25?'#fff2b0':'#ffb44a');ctx.fillRect(Math.round(x+Math.cos(a)*r*K),Math.round(y+Math.sin(a)*r*K),1,1)}}}
    else for(let r=0;r<62*K;r++){const q=r/(62*K);if(q>pr*1.6)break;ctx.fillStyle=q>0.8?'#ffffff':'#ffe08a';ctx.fillRect(Math.round(x-v[0]*20*K+v[0]*r-(v[1]?1:0)),Math.round(y-v[1]*20*K+v[1]*r-(v[0]?1:0)),v[1]?3:1,v[0]?3:1)}}
});
EXT.die.push(()=>{EMB=[];PLANT=null;P.shield=0;P.chg=0;P.chgReady=false});

/* ---------- 월드에 놓인 물건 (부탁 물건 · 숨은 장신구) ---------- */
const ICON=(a,b,c)=>gridSprite(9,10,(x,y)=>{const d=Math.abs(x-4)+Math.abs(y-4.5)*0.9;return d<1.2?c:(d<2.6?b:(d<4.2?a:null))},'#1a1426');
const KITE=gridSprite(11,14,(x,y)=>{const d=Math.abs(x-5)+Math.abs(y-5)*0.8;if(d<4.6)return x<5?(y<5?'#e0503a':'#ffd36b'):(y<5?'#ffd36b':'#4a8fe0');if(x===5&&y>9)return '#f2efe2';if(y===12&&(x===4||x===6))return '#e07a9a';return null},'#1a1426');
const PICKAXE=gridSprite(12,12,(x,y)=>{if(Math.abs(x-y)<1&&x>2)return '#8f6640';if(Math.abs((x-3)**2+(y-3)**2-16)<5&&x+y<8)return '#a8b4c8';return null},'#1a1426');
const TSPARK=ICON('#b48aff','#e8d8ff','#ffffff');
const WITEMS=[];
function findFree(tx,ty){for(let r=0;r<6;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(!SOLIDS.has(tile(tx+dx,ty+dy)))return[(tx+dx)*16+8,(ty+dy)*16+12];return[tx*16+8,ty*16+12]}
EXT.build.push(()=>{
  const add=(id,tx,ty,s,vis,pick)=>{const[x,y]=findFree(tx,ty);WITEMS.push({id,x,y,s,vis:()=>!S.picks[id]&&vis(),pick})};
  add('kite',20,26,KITE,()=>S.sq.kite===1,()=>toast('콩의 연을 찾았다! 콩에게 돌려주자','good'));
  add('pick',215,10,PICKAXE,()=>S.sq.pick===1,()=>toast('쇠돌 할아버지의 곡괭이를 찾았다!','good'));
  add('t_button',84,57,TSPARK,()=>S.q>=3,()=>giveTrinket('button'));
  add('t_mask',329,44,TSPARK,()=>S.q>=24||S.q>=30,()=>giveTrinket('mask'));
  add('t_feather',AR.tiny.x0+90,58,TSPARK,()=>S.q>=26,()=>giveTrinket('feather'));
});

/* ---------- 서브 퀘스트 (부탁) ---------- */
const SIDEQ=[
  {id:'kite',giver:'kid',min:2,title:'콩의 잃어버린 연',item:'kite',
   offer:[['kid','등불지기님! 제 연이 바람에 날아가 버렸어요…'],['kid','북쪽 숲길 쪽으로 날아갔는데, 그림자가 무서워서 못 가겠어요. 찾아 주실 수 있어요?']],
   hint:[['kid','연은 마을 북쪽 문을 나가서 숲길을 따라가면 있을 거예요!']],
   done:[['kid','와아, 제 연! 고맙습니다! 이건 연 꼬리에 달던 리본이에요. 달고 뛰면 바람처럼 빨라져요!']],reward:{trk:'ribbon'}},
  {id:'rats',giver:'elder',min:3,title:'촌장의 쥐 걱정',kill:'rat',n:8,
   offer:[['elder','요즘 그림자 쥐가 밭을 자꾸 헤집어 놓는구나. 여덟 마리만 쫓아 주겠니?']],
   hint:[['elder','그림자 쥐는 마을 밖 어두운 들판에 많단다.']],
   done:[['elder','고맙구나. 이제 밭일을 마음 놓고 하겠어. 이거 받아 두렴.']],reward:{coins:40,potions:1}},
  {id:'wolves',giver:'herb',min:9,title:'늑대 무리 쫓기',kill:'wolf',n:6,
   offer:[['herb','가시 늑대 무리가 약초밭까지 내려온다네. 여섯 마리만 쫓아 주게.']],
   hint:[['herb','늑대는 웅크렸다가 덮치니, 웅크릴 때 옆으로 구르게나.']],
   done:[['herb','숲이 한결 조용해졌구먼. 이 송곳니는 늑대 우두머리가 흘린 걸세. 지니고 있으면 칼끝이 매서워진다네.']],reward:{trk:'fang'}},
  {id:'letter',giver:'herb',min:9,title:'재울로 보내는 편지',to:'elder',
   offer:[['herb','재울의 단비 할멈에게 편지를 전해 주겠나? 삼십 년 된 벗이라네. 안개 때문에 소식이 끊겼지.'],['sys','버들의 편지를 받았다. 재울 마을 촌장 단비에게 전하자. (봉화 이동을 쓰면 빨라요)']],
   hint:[['herb','편지는 재울 마을의 단비 할멈에게 전해 주게.']],
   done:[['elder','버들 영감의 편지라고? 아이고, 그 영감 아직 살아 있었구나!'],['elder','먼 길 와 줘서 고맙다. 내가 끓인 보리차 주머니란다. 품고 다니면 기운이 금방 돌아올 게다.']],reward:{trk:'teabag'}},
  {id:'pick',giver:'grandpa',min:14,title:'잃어버린 곡괭이',item:'pick',
   offer:[['grandpa','갱도가 무너지던 날 내 곡괭이를 놓치고 왔다네. 녹슨 레일 갱도 동쪽, 금 간 벽 너머 방에 있을 게야.']],
   hint:[['grandpa','금 간 벽은 모루 망치로 부술 수 있다네. 녹슨 레일 갱도 동쪽이야.']],
   done:[['grandpa','허허, 삼십 년을 쓴 내 곡괭이! 답례로 내 등을 주지. 광부의 등은 보통 등불보다 멀리 비춘다네.']],reward:{trk:'minerlamp'}},
  {id:'spiders',giver:'grandpa',min:14,title:'수정 거미 퇴치',kill:'spider',n:8,
   offer:[['grandpa','수정 거미가 야영지 근처까지 내려온다네. 여덟 마리만 잡아 주면 발 뻗고 자겠어.']],
   hint:[['grandpa','수정 거미는 툭툭 끊어서 달려온다네. 멈췄을 때 치게.']],
   done:[['grandpa','고맙네! 이건 갱도에서 모아 둔 걸세. 요긴하게 쓰게나.']],reward:{coins:80,potions:2}},
  {id:'parcel',giver:'jeti',min:20,title:'재티의 배달',to:'herb',
   offer:[['jeti','부탁 하나만! 안개 숲 숲지기 영감이 사막 약초를 주문했거든. 나는 가게를 비울 수가 없어서…'],['sys','약초 꾸러미를 받았다. 안개 숲 숲지기 버들에게 전하자. (봉화 이동을 쓰면 빨라요)']],
   hint:[['jeti','꾸러미는 안개 숲 숲지기 오두막으로 부탁해!']],
   done:[['herb','오, 사막 약초가 왔구먼! 재티 그 녀석이 값은 이걸로 치르라더군. 장사꾼의 저울이라네.']],reward:{trk:'scale'}},
  {id:'scorps',giver:'harin',min:20,title:'전갈 사냥',kill:'scorp',n:8,
   offer:[['harin','재 전갈이 오아시스로 내려와 아이들이 물을 못 긷는단다. 여덟 마리만 잡아 다오.']],
   hint:[['harin','전갈이 꼬리를 치켜들면 독침이 온다. 옆으로 피하거라.']],
   done:[['harin','고맙다. 이 두건을 쓰거라. 사막 사람들이 대대로 쓰던 것이라 더위와 독을 막아 준단다.']],reward:{trk:'hood'}},
];
const sqDone=q=>q.item?!!S.picks[q.item]:q.kill?(S.sqn[q.id]||0)>=q.n:false;
const mainWants=id=>(id==='elder'&&S.q===1)||(id==='herb'&&S.q===8)||(id==='grandpa'&&S.q===13)||(id==='harin'&&S.q===19);
function sqReward(q){
  S.sq[q.id]=2;const r=q.reward;if(r.coins)S.coins+=r.coins;if(r.potions)S.potions=Math.min(5,(S.potions||0)+r.potions);
  sfx('lvl');toast(`부탁 완료: ${q.title}`+(r.coins?` · 은화 +${r.coins}`:'')+(r.potions?` · 회복약 +${r.potions}`:''),'gold');if(r.trk)giveTrinket(r.trk);gainXP(30+q.min*4);saveGame();
}
function sideTalk(id,orig){
  if(mainWants(id))return orig();
  const del=SIDEQ.find(q=>q.to===id&&S.sq[q.id]===1);
  if(del)return say(del.done,()=>sqReward(del));
  const mine=SIDEQ.filter(q=>q.giver===id&&S.sq[q.id]!==2&&S.q>=q.min);
  const ready=mine.find(q=>S.sq[q.id]===1&&sqDone(q));
  if(ready)return say(ready.done,()=>sqReward(ready));
  const act=mine.find(q=>S.sq[q.id]===1);
  if(act)return say(act.hint,orig);
  const nw=mine.find(q=>!S.sq[q.id]);
  if(nw)return say(nw.offer,()=>{S.sq[nw.id]=1;S.sqn[nw.id]=0;toast(`새 부탁: ${nw.title} (I키로 확인)`,'good');saveGame()});
  orig();
}
for(const id of['kid','elder','herb','grandpa','jeti','harin']){const orig=TALK[id];TALK[id]=function(){sideTalk(id,()=>orig.call(TALK))}}
EXT.kill.push(e=>{for(const q of SIDEQ)if(q.kill===e.type&&S.sq[q.id]===1&&(S.sqn[q.id]||0)<q.n){S.sqn[q.id]=(S.sqn[q.id]||0)+1;if(S.sqn[q.id]>=q.n)toast(`부탁 달성: ${q.title} · ${WHO[q.giver].name}에게 돌아가자`,'good')}});
EXT.update.push(()=>{for(const w of WITEMS)if(w.vis()&&areaAt(w.x)===curArea&&Math.hypot(P.x-w.x,P.y-w.y)<12&&mode==='play'){S.picks[w.id]=1;sfx('pick');for(let k=0;k<12;k++)PARTS.push({x:w.x,y:w.y-4,vx:rand(-30,30),vy:rand(-50,-10),life:0.6,max:0.6,col:'#e8d8ff',sz:1});w.pick();saveGame()}});
{const qt0=questText;questText=function(){let t=qt0();const n=SIDEQ.filter(q=>S.sq[q.id]===1).length;if(n)t+=`\n· 부탁 ${n}개 진행 중 (I)`;return t}}

/* ---------- 캐릭터 일러스트 (128×160, 지금 상태를 반영해서 그린다) ---------- */
const segD=(px,py,x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,t=clamp(((px-x1)*dx+(py-y1)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(px-x1-dx*t,py-y1-dy*t)};
function heroArt(x,y){
  const px=x+.5,py=y+.5;
  {const ox=93,oy=86,body=((px-ox)/10)**2+((py-oy)/12.5)**2<1,tuft=Math.abs(Math.abs(px-ox)-7)<2&&py>oy-17&&py<oy-9;
   if(body||tuft){for(const sd of[-1,1]){const e=Math.hypot(px-(ox+sd*4.2),py-(oy-4));if(e<3.6)return e<1.5?'#1a1426':(e<2.9?'#ffd36b':'#eaa63a')}
     if(Math.abs(px-ox)<1.6&&py>oy-2&&py<oy+2.5)return '#eaa63a';
     if(((px-ox)/6.5)**2+((py-(oy+5))/6.5)**2<1)return (x+y)%3===0?'#c8b898':'#d8c8a8';
     return px<ox-3?'#a8845c':(px>ox+5?'#5a4030':'#8a6a4a')}}
  {const lx=21,ly=116;
   if(Math.abs(px-lx)<8&&py>ly-12&&py<ly+12){if(py<ly-9.5||py>ly+9.5||Math.abs(px-lx)>6.2||Math.abs(px-lx)<0.6&&py>ly+6)return '#2a1e14';const d=Math.hypot(px-lx,(py-ly)*0.8);return d<2.6?'#fffbe6':(d<4.8?'#ffe9a0':'#ffc45a')}
   if(Math.abs(px-lx)<3.6&&py>=ly-16&&py<=ly-12)return (Math.abs(px-lx)>1.8||py<ly-14.5)?'#2a1e14':null;
   if(Math.hypot(px-23,py-98)<4.8)return py>99.5?'#c98f6e':'#f2c6a0';
   const sd=segD(px,py,25,102,40,134);if(sd<6.2)return sd>4.8?'#1f4a5e':(px<31+ (py-102)*0.45?'#7fc4d4':'#2f6f86')}
  const hx=58,hy=62,r=((px-hx)/26)**2+((py-hy)/28)**2;
  if(r<1){
    const fx=62,fy=67,fr=((px-fx)/16.5)**2+((py-fy)/18.5)**2;
    if(fr<1&&py<88){
      if(py<51.5+Math.abs(((x+2)%8)-4)*1.3-(px<54?2:0))return (x>>1)%3===0?'#7a5238':'#5a3a2a';
      for(const ex of[54,69]){if(px>ex-2.2&&px<ex+2.2&&py>64.5&&py<71)return (x===ex-2&&y===65)?'#ffffff':((y===70&&x===ex+1)?'#ffb44a':'#1a1426');if(y===62&&px>ex-3&&px<ex+3)return '#5a3a2a'}
      if(x===62&&(y===73||y===74))return '#c98f6e';
      if((y===79&&x>=59&&x<=64)||(y===78&&(x===58||x===65)))return '#b06a5a';
      if(py>73&&py<77&&(Math.abs(px-51)<2.5||Math.abs(px-72.5)<2.5))return '#e8a08a';
      if((fr>0.8&&px>fx)||py>83)return '#c98f6e';if(px<53&&py>69)return '#ffe0b8';return '#f2c6a0'}
    if(r>0.84&&px<hx+4)return '#b8e6ee';
    const t=(px-hx)+(py-hy)*0.4;return t<-17?'#7fc4d4':(t<0?'#3d8298':(t<15?'#2f6f86':'#1f4a5e'))}
  if(py>=86&&py<95&&Math.abs(px-60)<23-(py-86)*0.3){if(Math.abs(px-61)<2.6&&py>88&&py<93)return (x===59&&y===89)?'#fff8d8':'#ffd36b';return py<88?'#b8e6ee':'#7fc4d4'}
  if(py>=90){const hw=27+(py-90)*0.3;if(Math.abs(px-60)<hw){const rel=(px-60)/hw,fold=Math.sin(px*0.42+Math.sin(py*0.05)*2);if(rel<-0.84)return '#7fc4d4';if(fold>0.86)return '#1a3e50';if(fold<-0.9)return '#3d8298';if(rel>0.55)return '#1f4a5e';if(py>152&&(x+y)%2===0)return '#1a3e50';return rel>0.2?'#27586c':'#2f6f86'}}
  if(S.wpn==='spear'){const d=segD(px,py,105,152,113,24);if(d<1.4)return '#8f6640';if(py<24&&py>8&&Math.abs(px-114.2+(24-py)*0.06)<(24-py)*0.22+0.4)return px<114?'#f4f8ff':'#a8b4c8'}
  else{const d=segD(px,py,84,58,99,36);if(d<2)return (Math.floor((px+py)/3)%2)?'#6b4a2e':'#8f6640';if(Math.hypot(px-101,py-33)<3)return '#ffd36b';if(segD(px,py,78,52,90,64)<1.8)return '#eaa63a'}
  return null;
}
function drawIllust(cv){
  const W=128,H=160,x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  const sky=['#0b0a1c','#141230','#1e1a44','#2a2254','#3a2a58'];
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const t=j/118*4,k=Math.min(3,Math.floor(t)),f=t-k;let c=sky[k];if(k<4&&f>0.5&&((i+j)&1)&&f>0.5+(h2(i,j,180)-0.5)*0.4)c=sky[k+1];x.fillStyle=c;x.fillRect(i,j,1,1)}
  for(let k=0;k<70;k++){const sx=Math.floor(h2(k,1,181)*W),sy=Math.floor(h2(k,2,181)*96),b=h2(k,3,181);x.fillStyle=b>0.8?'#ffffff':(b>0.4?'#c8ccff':'#6a68a8');x.fillRect(sx,sy,1,1);if(b>0.93){x.fillStyle='#c8ccff';x.fillRect(sx-1,sy,3,1);x.fillRect(sx,sy-1,1,3)}}
  const lit=S.ending===1||S.ending===3;
  x.fillStyle='#120f26';x.fillRect(106,34,7,84);x.fillRect(103,28,13,8);x.fillRect(107,22,5,6);x.fillStyle=lit?'#ffe9a0':'#2a2648';x.fillRect(108,30,3,4);
  if(lit){const g=x.createRadialGradient(109.5,32,0,109.5,32,26);g.addColorStop(0,'rgba(255,220,140,0.55)');g.addColorStop(1,'rgba(255,220,140,0)');x.fillStyle=g;x.fillRect(80,4,60,60)}
  for(let i=0;i<W;i++){const hgt=104+Math.round(Math.sin(i*0.07)*5+Math.sin(i*0.19+1)*3);x.fillStyle='#16122c';x.fillRect(i,hgt,1,H-hgt);x.fillStyle='#1e1838';x.fillRect(i,hgt+10+Math.round(Math.sin(i*0.11+2)*3),1,H)}
  const nb=S.beacons.reduce((a,b)=>a+b,0);[[8,108],[30,112],[76,110],[122,104],[48,104],[118,116]].slice(0,Math.min(6,Math.ceil(nb/2))).forEach(([bx,by])=>{const g=x.createRadialGradient(bx,by,0,bx,by,7);g.addColorStop(0,'rgba(255,180,74,0.7)');g.addColorStop(1,'rgba(255,180,74,0)');x.fillStyle=g;x.fillRect(bx-7,by-7,14,14);x.fillStyle='#fff2b0';x.fillRect(bx,by,1,1);x.fillStyle='#ffb44a';x.fillRect(bx,by-1,1,1)});
  x.drawImage(gridSprite(W,H,heroArt,'#120e1c'),0,0);
  const lr=30+lanLv()*7;x.globalCompositeOperation='lighter';let g=x.createRadialGradient(21,116,2,21,116,lr);g.addColorStop(0,'rgba(255,190,90,0.6)');g.addColorStop(0.4,'rgba(255,160,70,0.22)');g.addColorStop(1,'rgba(255,160,70,0)');x.fillStyle=g;x.fillRect(0,116-lr,21+lr,lr*2);x.globalCompositeOperation='source-over';
  for(let k=0;k<10;k++){const a=h2(k,5,182)*6.28,rr=10+h2(k,6,182)*lr*0.7;x.fillStyle=k%2?'#fff2b0':'#ffb44a';x.fillRect(Math.round(21+Math.cos(a)*rr),Math.round(116+Math.sin(a)*rr*0.9),1,1)}
}

/* ---------- 캐릭터 화면 (K) · 가방 화면 (I) ---------- */
{const st_=document.createElement('style');st_.textContent=`
.scr .card{max-width:min(97%,calc(var(--u)*330));max-height:94%;overflow:auto;text-align:left;gap:calc(var(--u)*3)}
.scr .card:focus{outline:none}
.scrtabs{display:flex;gap:6px;justify-content:center}
.scrtabs button{background:var(--panel-2);border:2px solid var(--line);padding:calc(var(--u)*1.5) calc(var(--u)*5);font-size:max(12px,calc(var(--u)*4.6))}
.scrtabs button.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.chargrid{display:grid;grid-template-columns:calc(var(--u)*76) minmax(0,1fr);gap:calc(var(--u)*4);align-items:start}
.invgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(var(--u)*3)}
@media (max-width:680px){.chargrid,.invgrid{grid-template-columns:minmax(0,1fr)}.charleft{max-width:260px;margin:0 auto}}
.charleft{display:grid;gap:calc(var(--u)*2);min-width:0}
#illust{width:100%;aspect-ratio:128/160;image-rendering:pixelated;border:2px solid var(--edge);box-shadow:0 0 0 2px var(--line);display:block}
.charname{text-align:center;font-size:max(15px,calc(var(--u)*6.4));color:var(--accent)}
.charname small{display:block;color:var(--muted);font-size:.6em;letter-spacing:.14em}
.prev{display:flex;align-items:center;gap:10px;background:var(--panel-2);border:1px solid var(--line);padding:6px 10px;font-size:max(10px,calc(var(--u)*3.4));color:var(--muted);font-family:var(--f-text)}
#prevCv{width:calc(var(--u)*16);height:calc(var(--u)*20);image-rendering:pixelated;flex:none}
.charright{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(var(--u)*3);min-width:0;align-items:start}
@media (max-width:900px){.charright{grid-template-columns:minmax(0,1fr)}}
.invsec{background:var(--panel-2);border:1px solid var(--line);padding:calc(var(--u)*2.5) calc(var(--u)*3);min-width:0}
.invsec h3{margin:0 0 4px;font-weight:400;color:var(--accent);font-size:max(12px,calc(var(--u)*4.4));letter-spacing:.08em}
.invsec dl{display:grid;grid-template-columns:auto 1fr;gap:1px 10px;margin:0;font-size:max(11px,calc(var(--u)*3.8))}
.invsec dt{color:var(--muted)} .invsec dd{margin:0;text-align:right}
.invrow{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 0;border-bottom:1px dotted var(--line);font-size:max(11px,calc(var(--u)*3.8))}
.invrow:last-child{border-bottom:0}
.invrow small{display:block;color:var(--muted);font-family:var(--f-text)}
.invrow button{flex:none;background:var(--panel);border:1px solid var(--line);padding:2px 8px;font-size:max(10px,calc(var(--u)*3.4))}
.invrow button.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.invnone,.pagetext{color:var(--muted);font-family:var(--f-text);font-size:max(11px,calc(var(--u)*3.6));line-height:1.6}
.pagetext{color:var(--ink);border-left:2px solid var(--accent);padding-left:8px;margin-top:6px}`;document.head.appendChild(st_);
const tabs=w=>`<div class="scrtabs"><button data-tab="char" class="${w==='char'?'on':''}">캐릭터 (K)</button><button data-tab="inv" class="${w==='inv'?'on':''}">가방 (I)</button></div>`;
const mkOv=(id,inner)=>{const ov=document.createElement('div');ov.id=id;ov.className='overlay scr';ov.hidden=true;ov.innerHTML=`<div class="card px">${inner}<div class="btns"><button class="btn primary" data-close="1">닫기 (Esc)</button></div></div>`;$('wrap').appendChild(ov);
  ov.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.close)return closeScr();if(b.dataset.tab)return openScr(b.dataset.tab,true);if(b.dataset.trk)toggleTrinket(b.dataset.trk);if(b.dataset.wpn){setWeapon(b.dataset.wpn);saveGame()}if(b.dataset.page)pageOpen=pageOpen===+b.dataset.page?-1:+b.dataset.page;renderScr()});return ov};
mkOv('charS',tabs('char')+'<div class="chargrid"><div class="charleft"><canvas id="illust" width="128" height="160"></canvas><div class="charname" id="charName"></div><div class="prev"><canvas id="prevCv" width="16" height="20"></canvas><span>게임 속 모습</span></div></div><div class="charright" id="charBody"></div></div>');
mkOv('inv',tabs('inv')+'<div class="invgrid" id="invBody"></div>');
for(const[id,label,w]of[['charBtn','캐릭터','char'],['invBtn','가방','inv']]){const pb=document.createElement('button');pb.className='btn';pb.id=id;pb.textContent=label;$('saveBtn').after(pb);pb.onclick=()=>{togglePause();openScr(w)}}}
let pageOpen=-1,scrWhich='char',prevTimer=null;
const irow=(a,b,btn)=>`<div class="invrow"><div>${a}<small>${b}</small></div>${btn||''}</div>`,isec=(t,h)=>`<div class="invsec"><h3>${t}</h3>${h}</div>`;
function renderScr(){
  if(scrWhich==='char'){
    drawIllust($('illust'));
    $('charName').innerHTML=`${S.name}<small>Lv ${S.lv} · ${chapterLabel(S.q)}</small>`;
    const stats=`<dl><dt>다음 레벨까지</dt><dd>경험치 ${need(S.lv)-S.xp}</dd><dt>HP</dt><dd>${Math.ceil(S.hp)} / ${st.maxHp()}</dd><dt>MP</dt><dd>${Math.floor(S.mp)} / ${st.maxMp()}</dd><dt>공격력</dt><dd>${Math.round(st.atk()*WPN.mul)}</dd><dt>섬광 피해</dt><dd>${st.flare()}</dd><dt>치명타</dt><dd>${Math.round(MOD.crit*100)}%</dd><dt>힘 · 체력 · 지혜</dt><dd>${S.str} · ${S.vit} · ${S.wis}</dd><dt>등불</dt><dd>Lv ${lanLv()}</dd></dl>`;
    const equip=Object.keys(WEAPONS).map(k=>k==='spear'&&!spearOK()?irow('창','2장에서 모루가 만들어 줘요'):irow(WEAPONS[k].name+(k==='sword'?` +${S.swordLv}`:''),WEAPONS[k].desc,`<button data-wpn="${k}" class="${S.wpn===k?'on':''}">${S.wpn===k?'사용 중':'바꾸기'}</button>`)).join('')+irow(`갑옷 +${S.armorLv}`,`최대 HP +${S.armorLv*15}`)+(S.charm?irow('버들의 부적','최대 HP +20 (항상 적용)'):'');
    const trk=S.trk.length?S.trk.map(id=>irow(TRK[id].n,TRK[id].d,`<button data-trk="${id}" class="${has(id)?'on':''}">${has(id)?'착용 중':'착용'}</button>`)).join(''):'<div class="invnone">아직 장신구가 없어요. 부탁을 들어주거나 숨은 곳의 보랏빛 반짝임을 찾아보세요.</div>';
    const sk=irow('등불 섬광 (D)',S.lv>=2?'주변 적을 기절시킨다 · MP 6':'Lv 2에 배워요')+SKILLS.map(q=>irow(`${q.name} (${q.key})`,S.q>=q.min?`${q.d} · MP ${q.mp}`:'아직 배우지 못했어요')).join('')+irow('모아 베기','A를 길게 눌렀다 떼기 · 검은 회전 베기, 창은 꿰뚫기');
    $('charBody').innerHTML=`<div style="display:grid;gap:calc(var(--u)*3);min-width:0">${isec('능력치',stats)+isec('무기와 갑옷',equip)}</div><div style="display:grid;gap:calc(var(--u)*3);min-width:0">${isec(`장신구 (${S.eq.length}/2 착용)`,trk)+isec('기술',sk)}</div>`;
  }else{
    const items=`<dl><dt>은화</dt><dd>${S.coins}</dd><dt>회복약 (Q)</dt><dd>${S.potions||0} / 5</dd><dt>빛의 조각</dt><dd>${S.shards}</dd><dt>재 수정</dt><dd>${S.ash||0}</dd><dt>별의 이슬</dt><dd>${S.dew||0}</dd></dl>`;
    const col=`<dl><dt>달빛 버섯</dt><dd>${shroomCount()} / 4</dd><dt>보물 상자</dt><dd>${CHESTS.filter((c,i)=>S.chests&(1<<i)).length} / ${CHESTS.length}</dd><dt>장신구</dt><dd>${S.trk.length} / ${Object.keys(TRK).length}</dd><dt>밝힌 봉화</dt><dd>${S.beacons.reduce((a,b)=>a+b,0)} / ${BEACONS.length}</dd><dt>처치한 몬스터</dt><dd>${S.kills}</dd></dl>`;
    const pages=[0,1,2].map(i=>S.pages&(1<<i)?irow(PAGE_TEXT[i][0].replace(/—/g,'').trim(),pageOpen===i?'':'눌러서 다시 읽기',`<button data-page="${i}" class="${pageOpen===i?'on':''}">${pageOpen===i?'접기':'읽기'}</button>`)+(pageOpen===i?`<div class="pagetext">${PAGE_TEXT[i][1]}</div>`:''):irow('???','아직 찾지 못한 일지 조각')).join('');
    const qs=SIDEQ.filter(q=>S.sq[q.id]).map(q=>irow((S.sq[q.id]===2?'✔ ':'')+q.title,S.sq[q.id]===2?'완료':(q.kill?`${Math.min(q.n,S.sqn[q.id]||0)} / ${q.n} · `:(q.item?(S.picks[q.item]?'찾았다 · ':'찾는 중 · '):''))+(sqDone(q)||q.to?`${WHO[q.to||q.giver].name}에게 가기`:`${WHO[q.giver].name}의 부탁`))).join('')+(S.sideQ?irow((S.sideQ===2?'✔ ':'')+'달빛 버섯 모으기',S.sideQ===2?'완료':`${shroomCount()} / 4 · 숲지기 버들의 부탁`):'');
    $('invBody').innerHTML=isec('소지품',items)+isec('수집품',col)+isec('별등지기 일지',pages)+isec('부탁',qs||'<div class="invnone">받은 부탁이 없어요. 마을 사람들에게 말을 걸어 보세요.</div>');
  }
}
function openScr(w,sw){if(!sw&&mode!=='play')return;if(sw&&mode!=='scr')return;mode='scr';scrWhich=w;$('charS').hidden=w!=='char';$('inv').hidden=w!=='inv';renderScr();
  clearInterval(prevTimer);if(w==='char'){let f=0;const pc=$('prevCv').getContext('2d');prevTimer=setInterval(()=>{f++;const d=['down','right','up','left'][Math.floor(f/8)%4];pc.clearRect(0,0,16,20);pc.drawImage(HERO[d][f%4],0,0)},160)}
  const cd=$(w==='char'?'charS':'inv').querySelector('.card');cd.scrollTop=0;cd.tabIndex=-1;setTimeout(()=>cd.focus({preventScroll:true}),30)}
function closeScr(){if(mode!=='scr')return;clearInterval(prevTimer);$('charS').hidden=true;$('inv').hidden=true;mode='play'}
KEYMAP.k='char';
function extPress(a){
  if(mode==='scr'){if(a==='pause'||(a==='inv'&&scrWhich==='inv')||(a==='char'&&scrWhich==='char'))closeScr();else if(a==='inv'||a==='char')openScr(a,true);return true}
  if(a==='inv'||a==='char'){if(mode==='play')openScr(a);return true}
  if(a==='weapon'){if(mode==='play'){if(!spearOK())toast('아직 다른 무기가 없어요');else setWeapon(S.wpn==='sword'?'spear':'sword')}return true}
  return false;
}
EXT.load.push(()=>{for(const k of['trk','eq'])if(!Array.isArray(S[k]))S[k]=[];for(const k of['sq','sqn','picks'])if(!S[k]||typeof S[k]!=='object')S[k]={};setWeapon(S.wpn||'sword',true);recalcMod();EMB=[];PLANT=null;P.shield=0;P.chg=0;P.chgReady=false;skT=2});
if(typeof isTouch!=='undefined'&&isTouch){
  $('tAtk').addEventListener('pointerdown',()=>hold.attack=true);for(const ev of['pointerup','pointercancel','pointerleave'])$('tAtk').addEventListener(ev,()=>hold.attack=false);
  const mkb=(t,l,r,b)=>{const e=document.createElement('button');e.className='tb';e.textContent=l;e.style.cssText=`right:${r}px;bottom:${b}px;width:40px;height:40px;font-size:11px`;e.addEventListener('pointerdown',ev=>{ev.preventDefault();press(t)});$('tbtns').appendChild(e)};
  mkb('ember','불씨',150,56);mkb('shield','방패',150,102);mkb('plant','심기',104,128);mkb('inv','가방',196,6);mkb('char','캐릭',196,52);
}
