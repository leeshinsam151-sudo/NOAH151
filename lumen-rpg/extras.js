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
function giveTrinket(id){if(S.trk.includes(id))return;S.trk.push(id);if(S.eq.length<2)S.eq.push(id);recalcMod();sfx('lvl');toast(`장신구 ‘${TRK[id].n}’을(를) 얻었다! (I키로 확인)`,'gold')}
function toggleTrinket(id){const i=S.eq.indexOf(id);if(i>=0)S.eq.splice(i,1);else{if(S.eq.length>=2){toast('장신구는 2개까지 낄 수 있어요. 하나를 먼저 빼 주세요');return}S.eq.push(id)}recalcMod();S.hp=Math.min(S.hp,st.maxHp());sfx('pick');saveGame()}

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
function setWeapon(k,quiet){if(k==='spear'&&!spearOK())k='sword';S.wpn=k;WPN=WEAPONS[k];if(!quiet){sfx('pick');toast(`무기를 ${WEAPONS[k].name}(으)로 바꿨다 · ${WEAPONS[k].desc}`)}}

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
  else{skCd.plant=8;PLANT={x:P.x+v[0]*10,y:P.y+v[1]*8,t:25};if(solidAt(PLANT.x,PLANT.y-3)){PLANT.x=P.x;PLANT.y=P.y}sfx('fire')}
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

/* ---------- 가방 · 캐릭터 화면 ---------- */
{const st_=document.createElement('style');st_.textContent=`
#inv .card{max-width:min(96%,calc(var(--u)*270));max-height:94%;overflow:auto;text-align:left;gap:calc(var(--u)*3)}
#inv h2{text-align:center}
.invgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:calc(var(--u)*3)}
@media (max-width:640px){.invgrid{grid-template-columns:minmax(0,1fr)}}
.invsec{background:var(--panel-2);border:1px solid var(--line);padding:calc(var(--u)*2.5) calc(var(--u)*3);min-width:0}
.invsec h3{margin:0 0 4px;font-weight:400;color:var(--accent);font-size:max(12px,calc(var(--u)*4.4));letter-spacing:.08em}
.invsec dl{display:grid;grid-template-columns:auto 1fr;gap:1px 10px;margin:0;font-size:max(11px,calc(var(--u)*3.8))}
.invsec dt{color:var(--muted)} .invsec dd{margin:0;text-align:right}
.invrow{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 0;border-bottom:1px dotted var(--line);font-size:max(11px,calc(var(--u)*3.8))}
.invrow:last-child{border-bottom:0}
.invrow small{display:block;color:var(--muted);font-family:var(--f-text)}
.invrow button{flex:none;background:var(--panel);border:1px solid var(--line);padding:2px 8px;font-size:max(10px,calc(var(--u)*3.4))}
.invrow button.on{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
.invnone{color:var(--muted);font-family:var(--f-text);font-size:max(11px,calc(var(--u)*3.6))}`;document.head.appendChild(st_);
const ov=document.createElement('div');ov.id='inv';ov.className='overlay';ov.hidden=true;ov.innerHTML='<div class="card px"><h2>가방 · 캐릭터</h2><div class="invgrid" id="invBody"></div><div class="btns"><button class="btn primary" id="invClose">닫기 (I)</button></div></div>';$('wrap').appendChild(ov);
const pb=document.createElement('button');pb.className='btn';pb.id='invBtn';pb.textContent='가방 · 캐릭터';$('saveBtn').after(pb);
pb.onclick=()=>{togglePause();openInv()};$('invClose').onclick=()=>closeInv();
$('invBody').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.trk)toggleTrinket(b.dataset.trk);if(b.dataset.wpn){setWeapon(b.dataset.wpn);saveGame()}renderInv()});}
function renderInv(){
  const row=(a,b,btn)=>`<div class="invrow"><div>${a}<small>${b}</small></div>${btn||''}</div>`;
  const sec=(t,h)=>`<div class="invsec"><h3>${t}</h3>${h}</div>`;
  const stats=`<dl><dt>레벨</dt><dd>${S.lv} (다음까지 ${need(S.lv)-S.xp})</dd><dt>HP / MP</dt><dd>${Math.ceil(S.hp)}/${st.maxHp()} · ${Math.floor(S.mp)}/${st.maxMp()}</dd><dt>공격력</dt><dd>${Math.round(st.atk()*WPN.mul)}</dd><dt>섬광 피해</dt><dd>${st.flare()}</dd><dt>치명타</dt><dd>${Math.round(MOD.crit*100)}%</dd><dt>힘 · 체력 · 지혜</dt><dd>${S.str} · ${S.vit} · ${S.wis}</dd><dt>등불</dt><dd>Lv ${lanLv()} (조각 ${S.shards})</dd></dl>`;
  const equip=Object.keys(WEAPONS).map(k=>k==='spear'&&!spearOK()?row('창','2장에서 모루가 만들어 줘요'):row(WEAPONS[k].name+(k==='sword'?` +${S.swordLv}`:''),WEAPONS[k].desc,`<button data-wpn="${k}" class="${S.wpn===k?'on':''}">${S.wpn===k?'사용 중':'바꾸기'}</button>`)).join('')+row(`갑옷 +${S.armorLv}`,`최대 HP +${S.armorLv*15}`)+(S.charm?row('버들의 부적','최대 HP +20 (항상 적용)'):'');
  const trk=S.trk.length?S.trk.map(id=>row(TRK[id].n,TRK[id].d,`<button data-trk="${id}" class="${has(id)?'on':''}">${has(id)?'착용 중':'착용'}</button>`)).join(''):'<div class="invnone">아직 장신구가 없어요. 부탁을 들어주거나 숨은 곳의 보랏빛 반짝임을 찾아보세요.</div>';
  const sk=row('등불 섬광 (D)',S.lv>=2?'주변 적을 기절시킨다 · MP 6':'Lv 2에 배워요')+SKILLS.map(s=>row(`${s.name} (${s.key})`,S.q>=s.min?`${s.d} · MP ${s.mp}`:'아직 배우지 못했어요')).join('')+row('모아 베기','A를 길게 눌렀다 떼기 · 검은 회전 베기, 창은 꿰뚫기');
  const col=`<dl><dt>은화</dt><dd>${S.coins}</dd><dt>회복약</dt><dd>${S.potions||0} / 5</dd><dt>재 수정</dt><dd>${S.ash||0}</dd><dt>별의 이슬</dt><dd>${S.dew||0}</dd><dt>달빛 버섯</dt><dd>${shroomCount()} / 4</dd><dt>일지 조각</dt><dd>${pageCount()} / 3</dd><dt>보물 상자</dt><dd>${CHESTS.filter((c,i)=>S.chests&(1<<i)).length} / ${CHESTS.length}</dd><dt>밝힌 봉화</dt><dd>${S.beacons.reduce((a,b)=>a+b,0)} / ${BEACONS.length}</dd><dt>처치</dt><dd>${S.kills}</dd></dl>`;
  const qs=SIDEQ.filter(q=>S.sq[q.id]).map(q=>row((S.sq[q.id]===2?'✔ ':'')+q.title,S.sq[q.id]===2?'완료':(q.kill?`${Math.min(q.n,S.sqn[q.id]||0)} / ${q.n} · `:(q.item?(S.picks[q.item]?'찾았다 · ':'찾는 중 · '):''))+(sqDone(q)||q.to?`${WHO[q.to||q.giver].name}에게 가기`:`${WHO[q.giver].name}의 부탁`))).join('')+(S.sideQ?row((S.sideQ===2?'✔ ':'')+'달빛 버섯 모으기',S.sideQ===2?'완료':`${shroomCount()} / 4 · 숲지기 버들의 부탁`):'');
  $('invBody').innerHTML=sec('능력치',stats)+sec('무기와 갑옷',equip)+sec(`장신구 (${S.eq.length}/2 착용)`,trk)+sec('기술',sk)+sec('수집품',col)+sec('부탁',qs||'<div class="invnone">받은 부탁이 없어요. 마을 사람들에게 말을 걸어 보세요.</div>');
}
function openInv(){if(mode!=='play')return;mode='inv';renderInv();$('inv').hidden=false;setTimeout(()=>$('invClose').focus(),30)}
function closeInv(){if(mode!=='inv')return;$('inv').hidden=true;mode='play'}
function extPress(a){
  if(mode==='inv'){if(a==='inv'||a==='pause')closeInv();return true}
  if(a==='inv'){if(mode==='play')openInv();return true}
  if(a==='weapon'){if(mode==='play'){if(!spearOK())toast('아직 다른 무기가 없어요');else setWeapon(S.wpn==='sword'?'spear':'sword')}return true}
  return false;
}
EXT.load.push(()=>{for(const k of['trk','eq'])if(!Array.isArray(S[k]))S[k]=[];for(const k of['sq','sqn','picks'])if(!S[k]||typeof S[k]!=='object')S[k]={};setWeapon(S.wpn||'sword',true);recalcMod();EMB=[];PLANT=null;P.shield=0;P.chg=0;P.chgReady=false;skT=2});
if(typeof isTouch!=='undefined'&&isTouch){
  $('tAtk').addEventListener('pointerdown',()=>hold.attack=true);for(const ev of['pointerup','pointercancel','pointerleave'])$('tAtk').addEventListener(ev,()=>hold.attack=false);
  const mkb=(t,l,r,b)=>{const e=document.createElement('button');e.className='tb';e.textContent=l;e.style.cssText=`right:${r}px;bottom:${b}px;width:40px;height:40px;font-size:11px`;e.addEventListener('pointerdown',ev=>{ev.preventDefault();press(t)});$('tbtns').appendChild(e)};
  mkb('ember','불씨',150,56);mkb('shield','방패',150,102);mkb('plant','심기',104,128);mkb('inv','가방',196,6);
}
