'use strict';
/* =========================================================
   5장 · 작은 세계 — 손톱만 해진 채 돌아온 재울 마을
   평소 마을 지도의 한 칸을 8×8칸으로 키워서 만든다.
   ========================================================= */
T.TGRASS=30;T.BLADE=31;T.TDIRT=32;T.COBBLE=33;T.CHASM=34;T.WALLBIG=35;T.PLANK=36;T.PEB=37;T.RUG=38;
[T.BLADE,T.CHASM,T.WALLBIG,T.PEB].forEach(t=>SOLIDS.add(t));
const TP={g0:hex('#234a2a'),g1:hex('#2e6034'),g2:hex('#3a7640'),g3:hex('#4e9050'),d0:hex('#6a4c30'),d1:hex('#8a6642'),d2:hex('#a07a50'),d3:hex('#b8946a'),
  c0:hex('#3e3a4c'),c1:hex('#6e6a82'),c2:hex('#85819a'),c3:hex('#a29eb6'),ch:hex('#0e0a14'),w0:hex('#6b5a44'),w1:hex('#a8987a'),w2:hex('#c4b494'),w3:hex('#dccfae'),
  p0:hex('#3e2a1c'),p1:hex('#7a5634'),p2:hex('#8f6640'),p3:hex('#a67c4e'),r1:hex('#8a2a2a'),r2:hex('#a83a34'),r3:hex('#e8c45a')};
[[T.TGRASS,'#2e6034'],[T.BLADE,'#4e9050'],[T.TDIRT,'#8a6642'],[T.COBBLE,'#85819a'],[T.CHASM,'#0e0a14'],[T.WALLBIG,'#c4b494'],[T.PLANK,'#8f6640'],[T.PEB,'#6e6c80'],[T.RUG,'#a83a34']].forEach(([t,c])=>MCOL[t]=hex(c));
const tgrassPx=(X,Y)=>{const p=fbm(X*0.012,Y*0.012,111);let c=p>0.56?TP.g2:(p<0.42?TP.g0:TP.g1);if(Math.sin(X*0.11+fbm(X*0.01,Y*0.01,112)*10)>0.93)c=TP.g0;if(h2(X>>1,Y>>1,113)>0.97)c=TP.g3;return c};
TILEPX[T.TGRASS]=(tx,ty,lx,ly,X,Y)=>tgrassPx(X,Y);
TILEPX[T.BLADE]=(tx,ty,lx,ly,X,Y)=>{const dx=(lx-8)/6,dy=(ly-13)/2.5;return dx*dx+dy*dy<1?TP.g0:tgrassPx(X,Y)};
const tdirtPx=(X,Y)=>{const p=fbm(X*0.02,Y*0.02,114);let c=p>0.58?TP.d2:(p<0.4?TP.d0:TP.d1);if(h2(X>>2,Y>>2,115)>0.9)c=TP.d3;else if(h2(X>>1,Y>>1,116)>0.94)c=TP.d0;return c};
TILEPX[T.TDIRT]=(tx,ty,lx,ly,X,Y)=>tdirtPx(X,Y);
TILEPX[T.PEB]=(tx,ty,lx,ly,X,Y)=>{const dx=(lx-7.5)/6.5,dy=(ly-8)/5.5,d=dx*dx+dy*dy;if(d<1){if(d>0.72)return TP.c0;const q=dx+dy;return q<-0.6?TP.c3:(q<0.3?TP.c2:TP.c1)}return tdirtPx(X,Y)};
TILEPX[T.COBBLE]=(tx,ty,lx,ly,X,Y)=>{let c=fbm(X*0.03,Y*0.03,117)>0.52?TP.c2:TP.c1;if(h2(X,Y,118)>0.96)c=TP.c3;else if(h2(X>>1,Y>>1,119)>0.95)c=TP.c0;if((tile(tx,ty-1)===T.CHASM&&ly===0)||(tile(tx-1,ty)===T.CHASM&&lx===0))c=TP.c3;return c};
TILEPX[T.CHASM]=(tx,ty,lx,ly,X,Y)=>{if(tile(tx,ty-1)!==T.CHASM&&ly<9)return ly===8?TP.ch:((lx+ty)%7===0?TP.ch:TP.c0);return TP.ch};
TILEPX[T.WALLBIG]=(tx,ty,lx,ly,X,Y)=>{const row=Y>>5,off=(row&1)*32,bx=(X+off)&63,by=Y&31;if(by<2||bx<2)return TP.w0;let c=h2((X+off)>>6,row,120)>0.5?TP.w2:TP.w1;if(by<5)c=TP.w3;if(h2(X>>1,Y>>1,121)>0.93)c=TP.w1;const b=tile(tx,ty+1);if(!SOLIDS.has(b)&&ly>12)c=TP.w0;return c};
TILEPX[T.PLANK]=(tx,ty,lx,ly,X,Y)=>{const row=Y>>5,by=Y&31,off=(row*37)%96;if(by===0)return TP.p0;if(((X+off)%96)===0)return TP.p0;let c=h2(row,(X+off)/96|0,122)>0.5?TP.p2:TP.p1;if(Math.sin(by*0.9+fbm(X*0.02,row,123)*8)>0.9)c=TP.p3;return c};
TILEPX[T.RUG]=(tx,ty,lx,ly,X,Y)=>{const a=(X>>2)+(Y>>2),b=(X>>2)-(Y>>2);if(a%12===0||((b%12)+12)%12===0)return TP.r3;return ((X>>3)+(Y>>3))&1?TP.r1:TP.r2};

/* ---------- 스프라이트 ---------- */
const mkBlade=v=>gridSprite(14,30,(x,y)=>{const c=7+Math.sin(y*0.12+v)*2.2*(1-y/30)+(v?1:-1)*(30-y)*0.06,w=0.6+y*0.09;if(Math.abs(x+.5-c)>w)return null;return x+.5<c?(y%7===0?'#8fd07a':'#5aa85a'):'#3a7a44'},'#16261a');
const BLADES=[mkBlade(0),mkBlade(1.7)];
TILESPR[T.BLADE]=(tx,ty)=>({s:BLADES[h2(tx,ty,124)>0.5?1:0],ox:1+Math.round((h2(tx,ty,125)-0.5)*4),oy:-15});
const GFLOWER=gridSprite(30,40,(x,y)=>{const px=x+.5,py=y+.5,d=Math.hypot(px-15,py-11);if(d<4)return d<2?'#e8a03a':'#f2c94c';if(d<11){const a=Math.atan2(py-11,px-15);if(Math.cos(a*6)>-0.25)return d>8?'#e07a9a':'#f2a8c0'}if(Math.abs(px-15)<1.6&&py>20)return px<15?'#5aa85a':'#3a7a44';if(py>26&&py<32&&Math.abs(px-(px<15?9:21))<5&&Math.abs(py-29)<2.2)return '#4a9a50';return null},'#16261a');
const SHOE=gridSprite(34,54,(x,y)=>{const px=x+.5,py=y+.5,hw=13-Math.max(0,(py-40))*0.5-Math.max(0,(8-py))*0.8;if(Math.abs(px-17)>hw||py<1||py>53)return null;
  if(py>30&&Math.hypot(px-17,py-42)<7.5)return Math.hypot(px-17,py-42)<5.5?'#5a9a4a':'#3a6e34';
  if(py<30&&py>10&&Math.abs(px-17)<5&&Math.floor(py)%5===0)return '#f2efe2';
  if(py<8)return '#5a3620';return Math.abs(px-17)>hw-2?'#5a3620':(px<17?'#a06a3c':'#8a5630')},'#1a1012');
const mkBigOwl=up=>gridSprite(46,30,(x,y)=>{const px=x+.5,py=y+.5;
  const wingY=up?8:17;for(const s of[-1,1]){const wx=23+s*14,d=((px-wx)/9.5)**2+((py-wingY-(Math.abs(px-23)-8)*(up?-0.25:0.3))/4.5)**2;if(d<1&&Math.abs(px-23)>6)return d>0.6?'#5a4030':((x+y)%4===0?'#a8845c':'#8a6a4a')}
  const body=((px-23)/8)**2+((py-16)/11)**2<1;if(!body)return null;
  for(const s of[-1,1]){const e=Math.hypot(px-(23+s*3.6),py-10);if(e<3)return e<1.3?'#1a1426':'#ffd36b'}
  if(Math.abs(px-23)<1.5&&py>11&&py<14.5)return '#eaa63a';
  if(py>15&&((px-23)/5.5)**2+((py-20)/6)**2<1)return (x+y)%3===0?'#c8b898':'#d8c8a8';
  return py<6?'#5a4030':'#8a6a4a'},'#1a1426');
const BIGOWL=[mkBigOwl(true),mkBigOwl(false)];
const RATKING=gridSprite(46,28,(x,y)=>{const px=x+.5,py=y+.5;
  if(py<6&&px>27&&px<37&&py>1&&(py>3.5||Math.floor(px)%3!==0))return '#e8c45a';
  if(Math.hypot(px-29,py-8)<3.4||Math.hypot(px-36,py-7)<3)return Math.hypot(px-29,py-8)<1.8?'#c88a9a':'#4a3c6e';
  const head=((px-35)/9)**2+((py-15)/7)**2<1,body=((px-18)/15)**2+((py-16)/9.5)**2<1;
  if(head){if(px>42)return '#e08a9a';if(Math.hypot(px-37,py-13)<1.6)return '#ff4a5a';return py<12?'#4a3c6e':'#3d3260'}
  if(body)return py>20?'#2a2246':((px-18)*0.3+(py-16)*0.9<-4?'#4a3c6e':'#3d3260');
  if(px<6&&Math.abs(py-(18+Math.sin(px*0.9)*2))<1.2)return '#6a5a90';
  if(py>24&&py<27.5&&[8,14,22,28].some(q=>Math.abs(px-q)<1.6))return '#2a2246';return null},'#120e1c');
const RATKINGL=flipH(RATKING);
const ANT_ROWS=["..o...o...",".o.o.o.o..","okkokkokko","okkokkokro",".oo.oo.oo.","o..o..o..o"];
const ANT_PAL={o:'#120e12',k:'#4a2a22',r:'#ff8a5a'};
const ANT=[spr(ANT_ROWS,ANT_PAL),spr(ANT_ROWS.map((r,i)=>i===5?".o..o..o..":r),ANT_PAL)],ANTL=ANT.map(flipH);
const TWIG=gridSprite(14,18,(x,y)=>{const px=x+.5;if(Math.abs(px-7)<1.4&&y>6)return '#7a5634';if(y<=8&&y>=1&&(Math.abs(px-(7-(8-y)*0.6))<1.2||Math.abs(px-(7+(8-y)*0.6))<1.2))return '#8f6640';if(y===16&&Math.abs(px-7)<4)return '#5a3e26';return null},'#1a1012');
const BOOKS=gridSprite(26,26,(x,y)=>{const cols=['#a83a34','#3a6aa0','#4a8a4a','#c9a24a'],k=Math.floor(y/6.5),ind=k*3;if(k>3||x<ind||x>25-((3-k)*1))return null;const by=y-k*6.5;if(by<1)return '#f2efe2';if(x===ind+2||x===ind+3)return '#f2e4b8';return cols[k]},'#1a1012');
const CRUMB=gridSprite(16,12,(x,y)=>{const d=((x+.5-8)/7.5)**2+((y+.5-7)/5)**2+(h2(x,y,126)-0.5)*0.3;if(d>1)return null;return y<5?'#f0d8a0':(h2(x,y,127)>0.8?'#b88a4a':'#d8b070')},'#3e2a1c');
PALS.master={o:'#1a1426',c:'#8a7a5a',C:'#6a5c42',w:'#c4b48a',s:'#e8c4a0',S:'#b8906e',e:'#1a1426',b:'#eaa63a',p:'#5a4a36',f:'#2e241c'};
NPCSPR.master=spr(DOWN,PALS.master);NPCSPR.ratking=cropFace(RATKING,24,2,22,20);
Object.assign(WHO,{master:{name:'스승 호롱'},ratking:{name:'찍찍왕'}});
EST.ant=lv=>({hp:10+4*lv,atk:3+Math.round(1.8*lv),spd:62,xp:6+2*lv});EHB.ant=10;
ENEMY_DRAW.ant=e=>{const s=(e.fx>0?ANT:ANTL)[Math.floor(e.t*12)%2],x=Math.round(e.x-5-cam.x),y=Math.round(e.y-6-cam.y);ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x+1,y+5,8,2);ctx.drawImage(s,x,y);if(e.flash>0){ctx.globalCompositeOperation='lighter';ctx.drawImage(s,x,y);ctx.globalCompositeOperation='source-over'}};
TRACKS.tiny={name:'콩알만 한 모험',bpm:96,wave:'triangle',mel:[72,74,76,79,81,84],rh:[0.8,0.2,0.5,0,0.7,0.3,0.4,0],arp:2,
  ch:[[48,55,60,64],[45,57,60,64],[41,57,60,65],[43,55,59,62],[48,55,60,64],[45,57,60,64],[38,57,62,65],[43,55,59,62]]};

/* ---------- 위치 ---------- */
const TX0=AR.tiny.x0,RX0=AR.room.x0;AR.room.h=44;
const TSTART={x:(TX0+4)*16+8,y:28*16},THOLE={tx:TX0+84,ty:7},RENTRY={x:(RX0+24)*16,y:40*16},RBOOKS={tx:RX0+38,ty:10};
const TLAMPS=[[TX0+11.5,35.5],[TX0+67.5,35.5]];
let STOMP=null,bigOwl={x:0,y:0},ratIntro=false;

EXT.save.push(()=>({dew:0,boss5:0}));
EXT.build.push(MB=>{
  const SX=14,SY=40;
  const kindAt=(x,y)=>{const t=tile(x,y);if(t!==T.SOLID)return{t};const o=OBJS.find(o=>(o.k==='house'&&x>=o.tx&&x<o.tx+3&&y>=o.ty&&y<o.ty+3)||((o.k==='lamp'||o.k==='well')&&o.tx===x&&o.ty===y));return{t,o:o?o.k:'solid',u:under[y*MW+x]}};
  const flowers=[];
  for(let sy=0;sy<8;sy++)for(let sx=0;sx<12;sx++){const K=kindAt(SX+sx,SY+sy),barrier=sx===7,base=K.t===T.SOLID?K.u:K.t;
    if(base===T.FLOWER&&!barrier&&!K.o)flowers.push([TX0+sx*8+6,sy*8+6]);
    for(let ly=0;ly<8;ly++)for(let lx=0;lx<8;lx++){const x=TX0+sx*8+lx,y=sy*8+ly,lane=lx===3||lx===4||ly===3||ly===4;let t;
      if(K.o==='house'||K.o==='well')t=T.WALLBIG;
      else if(K.o==='lamp'&&(lx-3.5)**2+(ly-3.5)**2<9)t=T.WALLBIG;
      else if(base===T.STONE)t=barrier?T.CHASM:((lx===0||ly===0)&&!lane?T.CHASM:T.COBBLE);
      else if(base===T.PATH)t=barrier?T.BLADE:(h2(x,y,101)>0.96&&!lane?T.PEB:T.TDIRT);
      else t=(barrier||!lane)&&h2(x,y,102)<(barrier?2:(base===T.TALL?0.34:0.2))?T.BLADE:T.TGRASS;
      if((x===TX0||x===TX0+95||y===0||y===63)&&t!==T.WALLBIG)t=base===T.STONE?T.CHASM:T.BLADE;
      setT(x,y,t)}}
  for(const[x,y]of flowers){setT(x,y,T.TGRASS);MB.place({k:'gflower',tx:x,ty:y})}
  for(const[dx,dy]of[[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1]])if(tile(TX0+4+dx,27+dy)===T.BLADE)setT(TX0+4+dx,27+dy,T.TGRASS);
  MB.place({k:'hole',tx:THOLE.tx,ty:THOLE.ty});
  setT(TX0+52,28,T.COBBLE);MB.place({k:'perch',tx:TX0+52,ty:28,to:[TX0+76,37]});
  setT(TX0+76,36,T.TDIRT);MB.place({k:'perch',tx:TX0+76,ty:36,to:[TX0+52,29]});
  setT(TX0+12,20,T.TGRASS);MB.place({k:'crumb',tx:TX0+12,ty:20});
  // 스승의 방
  for(let y=0;y<44;y++)for(let x=0;x<48;x++){let t=T.PLANK;if(x<2||x>45||y<2||y>41)t=T.WALLBIG;else if(y<=8&&x>=6&&x<=41)t=T.WALLBIG;else if(((x-24)/13)**2+((y-26)/8)**2<1)t=T.RUG;
    for(const[cx,cy]of[[12,19],[36,19],[12,33],[36,33]])if((x-cx)**2+(y-cy)**2<6.5)t=T.WALLBIG;setT(RX0+x,y,t)}
  MB.place({k:'holeOut',tx:RX0+24,ty:42});
  MB.place({k:'books',tx:RBOOKS.tx,ty:RBOOKS.ty});
});
const tinyLv=()=>Math.max(6,S.lv-5);
Object.assign(AR.tiny,{noOwl:true,music:'tiny',dark:()=>0.8,
  region:(tx,ty)=>{const t=tile(tx,ty);return ty<10&&tx>TX0+70?'스승의 집 문턱':t===T.COBBLE||t===T.CHASM?'돌판 협곡':t===T.TDIRT||t===T.PEB?'흙길 평원':'풀잎 밀림'},
  spawn:(x,y,tx,ty)=>{if(S.q<26)return null;const t=tile(tx,ty);return[t===T.COBBLE?'spider':'ant',tinyLv()]},
  respawn:()=>({x:TSTART.x,y:TSTART.y,msg:'풀잎 그늘에서 정신을 차렸다'})});
Object.assign(AR.room,{noOwl:true,music:'tiny',dark:()=>0.86,region:()=>'스승 호롱의 방',spawn:()=>null,
  respawn:()=>({x:RENTRY.x,y:RENTRY.y,msg:'문틈 앞에서 정신을 차렸다'})});
EXT.safe.push(L=>{for(const[x,y]of TLAMPS)L.push({x:x*16,y:y*16,r:120})});
ROUTES.tiny={'*':()=>({x:THOLE.tx*16+8,y:THOLE.ty*16+20})};ROUTES.room={'*':()=>({x:(RX0+24)*16+8,y:41*16})};

/* ---------- 오브젝트 ---------- */
OBJK.gflower={draw:(o,ox,oy)=>ctx.drawImage(GFLOWER,ox-7,oy-26),y:o=>o.ty*16+14};
OBJK.perch={draw:(o,ox,oy)=>ctx.drawImage(TWIG,ox+1,oy-3),act:o=>({x:o.tx*16+8,y:o.ty*16+14,fn:()=>say([['owl','횃대다! 꽉 잡아, 날아간다!']],()=>{sfx('dash');P.auto={x0:P.x,y0:P.y,x1:o.to[0]*16+8,y1:o.to[1]*16+8,t:0,dur:2.6,draw:drawOwlRide,done:()=>{sfx('pick');saveGame()}}})})};
OBJK.hole={draw:(o,ox,oy)=>{ctx.fillStyle='#07060c';ctx.fillRect(ox-6,oy+4,28,12);ctx.fillRect(ox-3,oy,22,5);ctx.fillRect(ox+1,oy-3,14,4)},y:o=>o.ty*16+17,act:o=>({x:o.tx*16+8,y:o.ty*16+22,fn:()=>say([['sys','문 밑의 틈으로 기어 들어간다.']],()=>{warp(RENTRY.x,RENTRY.y,'up');
  if(S.q===26){S.q=27;saveGame();say([['owl','스승님 방이야! 저 위 산처럼 높은 게 침대고… 별의 이슬은 머리맡에 있을 거야.'],['owl','쉿. 탁자 밑에서 뭔가 긁는 소리가 들려…']])}})})};
OBJK.holeOut={draw:(o,ox,oy)=>{ctx.fillStyle='#07060c';ctx.fillRect(ox-6,oy-2,28,10);ctx.fillRect(ox-2,oy-6,20,5)},y:o=>o.ty*16-20,act:o=>({x:o.tx*16+8,y:o.ty*16-4,fn:()=>{if(BOSS)return;say([['sys','문 밑의 틈으로 밖에 나간다.']],()=>warp(THOLE.tx*16+8,THOLE.ty*16+26,'down'))}})};
OBJK.books={draw:(o,ox,oy)=>{ctx.drawImage(BOOKS,ox-5,oy-9);if(S.q===29&&Math.floor(time*3)%2){ctx.fillStyle='#ffe08a';ctx.fillRect(ox+7,oy-14,2,2)}},act:o=>({x:o.tx*16+8,y:o.ty*16+20,fn:()=>{if(S.q<29)return say([['sys','책이 계단처럼 쌓여 있다. 침대 머리맡까지 올라갈 수 있을 것 같다.'],['owl','근데 탁자 밑의 저 녀석이 가만둘까…?']]);if(S.q===29)dreamScene()}})};
OBJK.crumb={draw:(o,ox,oy)=>{if(!S.flags.crumb)ctx.drawImage(CRUMB,ox,oy+3)},act:o=>S.flags.crumb?null:{x:o.tx*16+8,y:o.ty*16+14,fn:()=>{S.flags.crumb=1;S.potions=Math.min(5,(S.potions||0)+2);S.coins+=40;sfx('lvl');say([['sys','산만 한 빵 부스러기다! 한 귀퉁이를 떼어 먹었다. 회복약 2개 분량과 은화 40을 얻었다.']],saveGame)}}};
function drawOwlRide(){const x=Math.round(P.x-cam.x),y=Math.round(P.y-cam.y),k=P.auto?Math.sin(Math.min(1,P.auto.t/P.auto.dur)*Math.PI):0,h=Math.round(k*26);
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(x,y,12-k*4,4-k,0,0,6.283);ctx.fill();
  ctx.drawImage(BIGOWL[Math.floor(time*7)%2],x-23,y-34-h);ctx.drawImage(MINI.down[0],x-4,y-39-h)}

/* ---------- 보스: 찍찍왕 ---------- */
function spawnRatKing(){BOSS={kind:'ratking',name:'그림자 쥐 우두머리 찍찍왕',x:(RX0+24)*16,y:24*16,hp:700,max:700,st:'rise',t:0,cd:1.6,flash:0,stun:0,dizzy:0,fx:1,vx:0,vy:0,hw:18,hh:11,hcy:12,under:false,phase:1,squeak:6}}
BOSSES.ratking={
  mult:b=>b.st==='dizzy'?1.8:1,
  upd(b,dt){
    b.t+=dt;if(b.flash>0)b.flash-=dt;
    if(b.hp<=0)return ratDone();
    if(b.st==='dizzy'){b.label='비틀거림!';b.dizzy-=dt;if(b.dizzy<=0){b.st='idle';b.cd=1;b.label=''}return}
    if(b.stun>0){b.stun-=dt;return}
    if(b.phase===1&&b.hp<b.max/2){b.phase=2;shake=6;toast('찍찍왕이 화가 났다!','gold');sfx('boss')}
    const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy)||1;
    if(b.st==='rise'){if(b.t>1.2){b.st='idle';b.t=0}return}
    if(b.st==='idle'){b.fx=dx>0?1:-1;moveBody(b,dx/d*30*dt,dy/d*30*dt,12,6,false);b.cd-=dt;b.squeak-=dt;
      if(d<44&&b.cd<0.8){b.st='tailW';b.t=0}
      else if(b.squeak<=0){b.squeak=b.phase===2?9:13;b.st='squeak';b.t=0}
      else if(b.cd<=0){b.st='tele';b.t=0}}
    else if(b.st==='tele'){if(b.t>0.65){b.st='charge';b.t=0;const s=b.phase===2?215:185;b.vx=dx/d*s;b.vy=dy/d*s;b.fx=dx>0?1:-1;sfx('dash')}}
    else if(b.st==='charge'){const ox=b.x,oy=b.y;moveBody(b,b.vx*dt,b.vy*dt,12,6,false);const stuck=Math.hypot(b.x-ox,b.y-oy)<0.4;
      if(stuck||b.t>1.3){let leg=false;const cx=Math.floor(b.x/16),cy=Math.floor((b.y-3)/16);for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++){const X=cx+xx-RX0,Y=cy+yy;if(tile(cx+xx,cy+yy)===T.WALLBIG&&X>4&&X<44&&Y>10&&Y<40)leg=true}
        if(stuck){b.st='dizzy';b.dizzy=leg?2.8:0.8;shake=leg?7:3;sfx('rock');if(leg)toast('찍찍왕이 탁자 다리에 머리를 박았다!','gold')}else{b.st='idle';b.cd=1.3}b.t=0}}
    else if(b.st==='tailW'){if(b.t>0.5){if(Math.hypot(P.x-b.x,P.y-b.y)<46)hurtPlayer(14,b.x,b.y);for(let k=0;k<24;k++){const a=k/24*6.283;PARTS.push({x:b.x,y:b.y-4,vx:Math.cos(a)*130,vy:Math.sin(a)*80,life:0.3,max:0.3,col:'#6a5a90',sz:2})}b.st='idle';b.cd=1.4;sfx('swing')}}
    else if(b.st==='squeak'){if(b.t>0.6){sfx('boss');for(let k=0;k<3;k++){const e=spawnEnemy('rat',b.x+rand(-40,40),b.y+rand(-30,30),Math.max(3,tinyLv()-3),'boss');e.born=0.4+k*0.2}b.st='idle';b.cd=1.5}}
    if(b.st!=='rise'&&overlap(P.x,P.y-8,5,7,b.x,b.y-10,16,9))hurtPlayer(b.st==='charge'?18:11,b.x,b.y);
  },
  draw(b){const s=b.fx>0?RATKING:RATKINGL;let x=Math.round(b.x-23-cam.x),y=Math.round(b.y-27-cam.y);if(b.st==='tele'||b.st==='tailW'||b.st==='squeak')x+=Math.round(rand(-1,1));
    if(b.st==='rise')ctx.globalAlpha=clamp(b.t/1.2,0,1);
    ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(Math.round(b.x-16-cam.x),Math.round(b.y-2-cam.y),32,3);ctx.drawImage(s,x,y);
    if(b.flash>0||((b.st==='tele'||b.st==='tailW')&&Math.floor(time*16)%2)){ctx.globalCompositeOperation='lighter';ctx.drawImage(s,x,y);ctx.globalCompositeOperation='source-over'}
    ctx.globalAlpha=1;
    if(b.st==='tailW'){ctx.fillStyle='#c06aff';for(let a=0;a<6.28;a+=0.12)ctx.fillRect(Math.round(b.x-cam.x+Math.cos(a)*46),Math.round(b.y-cam.y+Math.sin(a)*28),1,1)}
    if(b.st==='dizzy'){ctx.fillStyle='#ffe08a';for(let k=0;k<3;k++){const a=time*5+k*2.1;ctx.fillRect(Math.round(b.x+b.fx*12-cam.x+Math.cos(a)*8),Math.round(b.y-30-cam.y+Math.sin(a)*3),2,2)}}}
};
function ratDone(){
  const b=BOSS;BOSS=null;E=E.filter(e=>e.wave!=='boss');shake=7;flash=0.8;sfx('fire');
  for(let k=0;k<50;k++)PARTS.push({x:b.x+rand(-14,14),y:b.y-rand(0,20),vx:rand(-80,80),vy:rand(-110,10),life:rand(0.6,1.3),max:1.3,col:k%3?'#3d2a5c':'#e8c45a',sz:k%4?1:2});
  for(let k=0;k<6;k++)dropItem('coin',b.x+rand(-16,16),b.y+8,15);
  S.boss5=1;gainXP(420);
  setTimeout(()=>say([['ratking','찍… 찍찍! 왕관은 두고 간다! 이 방은 원래 내 구역이었는데…!'],['owl','도망갔어! 평소엔 한 대 치면 끝나던 쥐가 저렇게 무서울 줄이야…'],['owl','이제 책 계단을 올라가자. 스승님 머리맡이야!']],()=>{S.q=29;saveGame()}),1200);
}
function dreamScene(){
  flash=1;sfx('heal');
  say([
    ['sys','책을 계단 삼아 침대 머리맡에 올랐다. 스승 호롱의 숨소리가 바람처럼 크게 들린다.'],
    ['sys','감긴 눈꺼풀 사이로 꿈이 새어 나온다… 주위가 하얗게 물든다.'],
    ['master',`…오, ${S.name}이냐. 꿈에서라도 얼굴을 보니 좋구나. 많이 걸었지?`],
    ['master','작아졌다고 겁낼 것 없다. 등불은 원래 작은 것이란다. 온 세상을 밝히려 든 건 별등이었지, 등불이 아니야.'],
    ['master','등불은 제 발밑과, 곁에 선 한 사람을 비출 만큼이면 된다. 그런 빛은 아무것도 태우지 않아.'],
    ['me','스승님, 오르반이 별등탑을 무너뜨리려 해요.'],
    ['master','오르반… 그 아이도 내 스승의 제자였지. 미워하지 말거라. 그 아이는 너무 큰 빛에 데었을 뿐이야.'],
    ['master','머리맡 병에 별의 이슬이 두 방울 남았다. 한 방울은 지금 쓰고, 한 방울은 정말로 커져야 할 때 쓰거라.'],
    ['sys','별의 이슬 한 방울을 삼켰다. 몸이 커진다… 눈을 뜨니 스승의 집 앞이다.'],
  ],()=>{S.dew=1;S.flags.apart=0;S.q=30;flash=1;warp(24*16+16,42*16+6,'down');P.mini=false;P.shr={t:0,dur:1.6,from:0.5,to:1};banner('재울 마을','원래 크기로');saveGame();
    say([['moru','찾았다!! 바하르가 사막 끝까지 태워다 줘서 봉화를 타고 왔어! 얼마나 걱정했는지 알아?!'],['seha','오르반은 폐허 도시 동쪽의 문으로 별등탑에 들어갔어. 서둘러야 해.'],['owl','켜 둔 봉화에서 E를 누르면 다른 봉화로 갈 수 있어. 사막 등대로 가면 금방이야!'],['sys','별의 이슬이 한 방울 남았다.']],()=>showEnd(5))});
}
function startTiny(){
  S.flags.apart=1;S.q=25;warp(TSTART.x,TSTART.y,'down');P.shr={t:0,dur:1.6,from:1,to:0.5};banner('작은 세계','5장');bigOwl.x=P.x-30;bigOwl.y=P.y-50;saveGame();
  say([
    ['owl','부엉?! 어디 갔어?! …어? 발밑에서 소리가… 너야?! 왜 이렇게 작아졌어!'],
    ['me','오르반의 재 때문이야… 심지, 너 엄청 커 보여.'],
    ['owl','내가 큰 게 아니라 네가 콩알만 한 거야! 그런데 여기… 재울 마을이잖아? 저 기둥은 광장 등불이고!'],
    ['owl','스승님 댁에 ‘별의 이슬’이 있어. 작아진 몸을 되돌리는 약이야. 동쪽 흙길 끝, 스승님 집 문 밑 틈으로 들어가자!'],
    ['owl','길이 끊긴 곳은 내가 태워 줄게. 나뭇가지 횃대를 찾으면 E를 눌러! 그리고… 위에서 그림자가 지면 얼른 피해. 꼬마 콩의 발이야!'],
  ],()=>{S.q=26;saveGame()});
}
QX[25]={text:()=>'주변 살펴보기'};
QX[26]={text:()=>'동쪽 흙길 끝, 스승의 집 문 밑 틈으로 가기',target:()=>({x:THOLE.tx*16+8,y:THOLE.ty*16+20})};
QX[27]={text:()=>'방 안쪽, 침대 머리맡으로 가기',target:()=>({x:RBOOKS.tx*16+8,y:RBOOKS.ty*16+10})};
QX[28]={text:()=>'찍찍왕 물리치기 (탁자 다리에 부딪히게 하자)',target:()=>BOSS?{x:BOSS.x,y:BOSS.y-34}:null};
QX[29]={text:()=>'책 계단을 올라 스승의 머리맡으로',target:()=>({x:RBOOKS.tx*16+8,y:RBOOKS.ty*16+10})};
QX[30]={text:()=>'폐허 도시 동쪽, 별등탑의 문으로 가기\n· 켜 둔 봉화에서 E로 이동',target:()=>({x:331*16,y:35*16})};
ENDS[5]=['5장 완료','작은 세계','콩알만 해진 몸으로 재울 마을을 건너 스승의 꿈에 닿았어요. 등불은 발밑과 곁에 선 한 사람을 비출 만큼이면 된다는 말을 들었어요. 별의 이슬 한 방울이 남았어요. 이제 별등탑이에요.'];

/* ---------- 매 프레임 ---------- */
EXT.update.push((dt,tx,ty)=>{
  const id=curArea.id;
  if(id==='room'){if(S.q===27&&ty<=34&&mode==='play'){S.q=28;spawnRatKing();sfx('boss');shake=5;say([['ratking','찍찍찍! 감히 콩알만 한 것이 내 구역에 들어와?!'],['owl','그림자 쥐 우두머리야! 지금은 쟤가 우리보다 스무 배는 커! 돌진을 탁자 다리 쪽으로 유인해!']])}return}
  if(id!=='tiny'){STOMP=null;return}
  if(S.q<26)return;
  if(!STOMP)STOMP={i:0,dir:1,foot:0,t:0,st:'wait',x:0,y:0};
  const s=STOMP;s.t+=dt;
  if(s.st==='wait'&&s.t>0.7){s.i+=s.dir;if(s.i>=5||s.i<=0)s.dir*=-1;s.foot^=1;s.x=(TX0+40)*16+(s.foot?16:-16);s.y=(6+s.i*10.5)*16;s.st='warn';s.t=0}
  else if(s.st==='warn'&&s.t>1.35){s.st='down';s.t=0;const on=Math.abs(s.x-P.x)<240&&Math.abs(s.y-P.y)<150;if(on){shake=5;sfx('rock')}if(((P.x-s.x)/19)**2+((P.y-4-s.y)/27)**2<1&&!P.auto)hurtPlayer(24,s.x,s.y);for(const e of E.slice())if(((e.x-s.x)/19)**2+((e.y-s.y)/27)**2<1)killEnemy(e,false);
    if(on&&!S.flags.stompTip){S.flags.stompTip=1;toast('쿵! 꼬마 콩이 지나간다. 그림자를 보고 피하자','gold')}}
  else if(s.st==='down'&&s.t>0.9){s.st='wait';s.t=0}
});
EXT.ambient.push(dt=>{if(curArea&&(curArea.id==='tiny'||curArea.id==='room')){const gx=P.x-34,gy=P.y-52;bigOwl.x+=(gx-bigOwl.x)*Math.min(1,dt*2.5);bigOwl.y+=(gy-bigOwl.y)*Math.min(1,dt*2.5)}});
EXT.ground.push(()=>{const s=STOMP;if(!s||curArea.id!=='tiny'||s.st!=='warn')return;const k=s.t/1.35,x=Math.round(s.x-cam.x),y=Math.round(s.y-cam.y);ctx.fillStyle=`rgba(0,0,0,${0.15+k*0.4})`;ctx.beginPath();ctx.ellipse(x,y,6+k*13,9+k*18,0,0,6.283);ctx.fill()});
EXT.sorted.push(D=>{
  const id=curArea.id;if(id!=='tiny'&&id!=='room')return;
  const s=STOMP;if(s&&id==='tiny'&&(s.st==='down'||s.st==='warn')){const up=s.st==='warn'?Math.round((1-s.t/1.35)**2*150):0;if(up<120)D.push({y:s.y+28,f:()=>ctx.drawImage(SHOE,Math.round(s.x-17-cam.x),Math.round(s.y-27-up-cam.y))})}
  if(!P.auto&&mode!=='title')D.push({y:1e9,f:()=>ctx.drawImage(BIGOWL[Math.floor(time*6)%2],Math.round(bigOwl.x-23-cam.x),Math.round(bigOwl.y-15-cam.y+Math.sin(time*3)*2))});
});
EXT.lights.push((L,warm)=>{
  const id=curArea.id;
  if(id==='tiny'){for(const[x,y]of TLAMPS){L.push([x*16,y*16,150]);warm.push([x*16,y*16,110,0.2])}L.push([THOLE.tx*16+8,THOLE.ty*16+12,26]);L.push([bigOwl.x,bigOwl.y,26])}
  if(id==='room'){L.push([(RX0+24)*16,26*16,96]);L.push([RBOOKS.tx*16+8,RBOOKS.ty*16-20,S.q>=29?70:30]);L.push([bigOwl.x,bigOwl.y,26]);if(BOSS&&BOSS.kind==='ratking')L.push([BOSS.x,BOSS.y-10,40])}
});
EXT.post.push(()=>{if(BOSS&&BOSS.kind==='ratking'){ctx.fillStyle='#ff4a5a';ctx.fillRect(Math.round(BOSS.x+BOSS.fx*14-cam.x),Math.round(BOSS.y-14-cam.y),2,1)}});
EXT.die.push(()=>{STOMP=null;if(S.q===28)S.q=27});
EXT.load.push(()=>{STOMP=null;if(S.q===28)S.q=27;if(S.q===25)S.q=26;bigOwl.x=P.x-34;bigOwl.y=P.y-52});

/* =========================================================
   작아진 주인공 (절반 크기 전용 도트) · 위장 몬스터
   ========================================================= */
const MINI_D=["..oooo..",".owccco.",".ocssco.",".oesseo.",".occcco.","owccccco","oSbbbbSo",".occcco.",".op..po.",".oo..oo."];
const MINI_U=MINI_D.map((r,i)=>i===2||i===3?".occcco.":r);
const MINI_S=["..oooo..",".occcwo.",".occsso.",".occseo.",".occcco.",".occccSo",".obbbbo.",".occcco.","..oppo..","..oooo.."];
const miniB=(r,a,b)=>r.map((q,i)=>i===8?a:(i===9?b:q));
const MINI=(()=>{const d=[spr(MINI_D,PALS.hero),spr(miniB(MINI_D,".op..oo.",".oo....."),PALS.hero)],u=[spr(MINI_U,PALS.hero),spr(miniB(MINI_U,".oo..po.",".....oo."),PALS.hero)],r=[spr(MINI_S,PALS.hero),spr(miniB(MINI_S,".op.po..",".oo.oo.."),PALS.hero)];return{down:d,up:u,right:r,left:r.map(flipH)}})();
function drawMiniHero(lp){
  if(P.inv>0&&P.dashT<=0&&Math.floor(time*20)%2===0)return;
  const x=Math.round(P.x-cam.x),y=Math.round(P.y-cam.y);
  if(P.shr){const k=Math.min(1,P.shr.t/P.shr.dur),e=k*k*(3-2*k),sc=P.shr.from+(P.shr.to-P.shr.from)*e,w=Math.max(8,Math.round(16*sc)),h=Math.max(10,Math.round(20*sc));
    ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x-(w>>2),y-1,w>>1,2);ctx.drawImage(HERO[P.dir][0],x-(w>>1),y-h,w,h);
    if(Math.random()<0.6)PARTS.push({x:P.x+rand(-8,8),y:P.y-rand(0,18),vx:rand(-14,14),vy:rand(-30,-8),life:0.5,max:0.5,col:P.shr.to<1?'#8a8490':'#ffe08a',sz:1});return}
  const s=MINI[P.dir][P.moving?Math.floor(P.walkT*9)%2:0];
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x-2,y-1,5,1);
  if(P.dashT>0){ctx.globalAlpha=0.35;ctx.drawImage(s,x-4-Math.round(P.dvx*6),y-10-Math.round(P.dvy*6));ctx.globalAlpha=1}
  ctx.drawImage(s,x-4,y-10);
  const lx=x+(P.dir==='left'?-6:(P.dir==='up'?-5:4)),ly=y-5;ctx.fillStyle='#2a1e14';ctx.fillRect(lx,ly,3,4);ctx.fillStyle=Math.floor(time*8)%2?'#fff2b0':'#ffb44a';ctx.fillRect(lx+1,ly+1,1,2);
}
EXT.ambient.push(dt=>{if(P.shr){P.shr.t+=dt;if(P.shr.t>=P.shr.dur)P.shr=null}P.mini=!!curArea&&(curArea.id==='tiny'||curArea.id==='room')});

/* ---------- 위장 몬스터: 돌인 척하는 돌등벌레, 풀잎인 척하는 풀잎 사마귀 ---------- */
const PEBSPR=gridSprite(16,16,(x,y)=>{const dx=(x-7.5)/6.5,dy=(y-8)/5.5,d=dx*dx+dy*dy;if(d>=1)return null;if(d>0.72)return '#3e3a4c';const q=dx+dy;return q<-0.6?'#a29eb6':(q<0.3?'#85819a':'#6e6a82')});
EST.mimicPeb=lv=>({hp:26+6*lv,atk:5+Math.round(2.2*lv),spd:52,xp:12+3*lv});
EST.mimicBlade=lv=>({hp:18+5*lv,atk:6+Math.round(2.4*lv),spd:72,xp:12+3*lv});
EHB.mimicPeb=18;EHB.mimicBlade=30;
const AMB=[];let ambT=0;
function revealMimic(e){e.hide=false;e.st='pop';e.st_t=0.45;sfx('hurt');
  if(!S.flags.mimicTip){S.flags.mimicTip=1;toast(e.type==='mimicPeb'?'돌인 줄 알았는데 벌레였다! 가끔 눈을 깜빡이는 돌을 조심하자':'풀잎이 움직였다! 혼자 살랑거리는 풀잎을 조심하자','gold')}}
const mimicAI=(range,lunge)=>(e,dt,c)=>{
  if(e.hide){e.noTouch=true;moveBody(e,0,0,5,3,false);e.kx=e.ky=0;if(c.d<range&&!P.auto)revealMimic(e);return true}
  if(e.st==='pop'){e.st_t-=dt;if(e.st_t<=0){e.st='strike';e.st_t=0.24;e.ldx=c.dx/c.d;e.ldy=c.dy/c.d;e.fx=c.dx>0?1:-1;sfx('dash')}return true}
  if(e.st==='strike'){e.st_t-=dt;moveBody(e,e.ldx*lunge*dt,e.ldy*lunge*dt,5,3,false);if(Math.hypot(P.x-e.x,P.y-4-e.y)<11)hurtPlayer(Math.round(e.atk*1.3),e.x,e.y);if(e.st_t<=0){e.st='';e.noTouch=false}return true}
  return false};
ENEMY_AI.mimicPeb=mimicAI(26,170);ENEMY_AI.mimicBlade=mimicAI(34,210);
ENEMY_HIT.mimicPeb=ENEMY_HIT.mimicBlade=(e,r)=>{if(e.hide){e.hide=false;e.st='';e.noTouch=false;e.stun=0.7;r.d=Math.round(r.d*1.5);r.crit=true;toast('숨어 있던 몬스터를 먼저 찾아냈다!','good')}return true};
ENEMY_DRAW.mimicPeb=e=>{const x=Math.round(e.x-8-cam.x),y=Math.round(e.y-14-cam.y);
  if(e.hide){ctx.drawImage(PEBSPR,x,y);if((e.t%4.2)<0.16){ctx.fillStyle='#ffd23a';ctx.fillRect(x+9,y+8,1,1);ctx.fillRect(x+12,y+8,1,1)}return}
  const sh=e.st==='pop'?Math.round(rand(-1,1)):0,up=e.st==='pop'?3:2+(Math.floor(e.t*10)%2);
  ctx.fillStyle='#1a1012';for(const lx of[2,6,10,13])ctx.fillRect(x+lx+sh,y+13-up+((lx+Math.floor(e.t*10))%2),1,up+1);
  ctx.drawImage(PEBSPR,x+sh,y-up);ctx.fillStyle='#ff4a5a';const ex=e.fx>0?9:4;ctx.fillRect(x+ex+sh,y+7-up,2,2);ctx.fillRect(x+ex+4+sh,y+7-up,2,2);
  if(e.st==='pop'){ctx.fillStyle='#fff2b0';ctx.fillRect(x+7,y-8-up,2,4);ctx.fillRect(x+7,y-3-up,2,1)}
  if(e.flash>0){ctx.globalCompositeOperation='lighter';ctx.drawImage(PEBSPR,x+sh,y-up);ctx.globalCompositeOperation='source-over'}};
ENEMY_DRAW.mimicBlade=e=>{const s=BLADES[e.v||0],sw=e.hide?Math.round(Math.sin(e.t*1.7)*1.2):Math.round(Math.sin(e.t*12)*1.5),x=Math.round(e.x-7-cam.x)+sw,y=Math.round(e.y-29-cam.y)-(e.hide?0:2);
  ctx.drawImage(s,x,y);
  if(e.hide)return;
  ctx.fillStyle='#ffd23a';ctx.fillRect(x+5,y+9,2,2);ctx.fillRect(x+9,y+9,2,2);ctx.fillStyle='#1a1426';ctx.fillRect(x+6,y+10,1,1);ctx.fillRect(x+10,y+10,1,1);
  const up=e.st==='pop'||e.st==='strike';ctx.fillStyle='#8fd07a';for(const sd of[-1,1]){const ax=x+7+sd*5;for(let k=0;k<6;k++)ctx.fillRect(ax+sd*(up?k:Math.min(k,3)),y+15-(up?k:0)+(up?0:k),1,1);ctx.fillStyle='#e8f8c0';ctx.fillRect(ax+sd*(up?6:3),y+15-(up?6:-5),1,2);ctx.fillStyle='#8fd07a'}
  ctx.fillStyle='#1a1012';ctx.fillRect(x+4,y+28,2,2);ctx.fillRect(x+9,y+28,2,2);
  if(e.st==='pop'){ctx.fillStyle='#fff2b0';ctx.fillRect(x+7,y-7,2,4);ctx.fillRect(x+7,y-2,2,1)}
  if(e.flash>0){ctx.globalCompositeOperation='lighter';ctx.drawImage(s,x,y);ctx.globalCompositeOperation='source-over'}};
EXT.build.push(()=>{
  let np=0,nb=0;
  for(let y=4;y<60;y++)for(let x=TX0+4;x<TX0+92;x++){const t=tile(x,y),far=Math.hypot(x-(TX0+4),y-28)>9&&Math.hypot(x-(TX0+52),y-28)>3&&Math.hypot(x-(TX0+76),y-36)>3&&Math.hypot(x-THOLE.tx,y-THOLE.ty)>5;if(!far)continue;
    const lx=(x-TX0)&7,ly=y&7,lane=lx===3||lx===4||ly===3||ly===4;
    if((t===T.TDIRT||t===T.COBBLE)&&np<9&&h2(x,y,141)>(lane?0.93:0.985)&&!AMB.some(a=>Math.hypot(a.tx-x,a.ty-y)<7)){AMB.push({type:'mimicPeb',tx:x,ty:y});np++}
    else if(t===T.TGRASS&&lane&&nb<9&&h2(x,y,142)>0.9&&!AMB.some(a=>Math.hypot(a.tx-x,a.ty-y)<7)){AMB.push({type:'mimicBlade',tx:x,ty:y});nb++}}
});
EXT.update.push(dt=>{
  if(curArea.id!=='tiny'||S.q<26)return;
  ambT-=dt;if(ambT>0)return;ambT=0.8;
  AMB.forEach((a,i)=>{
    if((S.flags.ambDead||0)&(1<<i))return;
    if(a.e&&!E.includes(a.e)){if(a.e.hp<=0){S.flags.ambDead=(S.flags.ambDead||0)|(1<<i);a.e=null;return}a.e=null}
    if(a.e)return;
    if(Math.hypot(a.tx*16+8-P.x,a.ty*16+14-P.y)<70)return;
    const n=PARTS.length,e=spawnEnemy(a.type,a.tx*16+8,a.ty*16+14,tinyLv(),'amb');PARTS.length=n;
    e.born=0;e.hide=true;e.noTouch=true;e.v=h2(a.tx,a.ty,124)>0.5?1:0;a.e=e});
});
EXT.load.push(()=>{for(const a of AMB)a.e=null;ambT=0});
EXT.die.push(()=>{for(const a of AMB)a.e=null;ambT=0});
