'use strict';
/* =========================================================
   4장 · 잿빛 사막 — 낮과 밤, 모래폭풍, 더위, 거대 보스 '모래 고래 바하르'
   ========================================================= */
T.SAND=21;T.SROCK=23;T.RUIN=24;T.RFLOOR=25;T.CACTUS=26;T.PALM=27;T.QSAND=28;T.SGATE=29;
[T.SROCK,T.RUIN,T.CACTUS,T.PALM,T.QSAND,T.SGATE].forEach(t=>SOLIDS.add(t));
const SP={s0:hex('#a8884e'),s1:hex('#bc9c5c'),s2:hex('#ccac6a'),s3:hex('#dcc084'),rk0:hex('#4a3826'),rk1:hex('#7a5e3e'),rk2:hex('#a08052'),rk3:hex('#c4a474'),
  ru0:hex('#2e2a36'),ru1:hex('#5e5868'),ru2:hex('#7e788a'),ru3:hex('#a29cae'),rf0:hex('#5e5646'),rf1:hex('#7e7460'),rf2:hex('#948a74'),q1:hex('#9a7a44'),q2:hex('#7e6236'),q3:hex('#b8985a')};
[[T.SAND,'#c8a868'],[T.SROCK,'#7a5e3e'],[T.RUIN,'#6a6474'],[T.RFLOOR,'#948a74'],[T.CACTUS,'#4a8a4a'],[T.PALM,'#3a7a3a'],[T.QSAND,'#8a6a3a'],[T.SGATE,'#5a4630']].forEach(([t,c])=>MCOL[t]=hex(c));
function sandPx(X,Y){const p=fbm((X>>1)*0.03,(Y>>1)*0.03,71);let c=p>0.58?SP.s2:(p<0.4?SP.s0:SP.s1);const r=Math.sin(Y*0.5+fbm(X*0.02,Y*0.02,72)*14+X*0.06);if(r>0.88)c=SP.s3;else if(r<-0.92)c=SP.s0;if(h2(X,Y,73)>0.985)c=SP.s0;return c}
TILEPX[T.SAND]=(tx,ty,lx,ly,X,Y)=>sandPx(X,Y);
TILEPX[T.CACTUS]=TILEPX[T.PALM]=(tx,ty,lx,ly,X,Y)=>{const dx=(lx-8)/6.5,dy=(ly-13)/2.4;return dx*dx+dy*dy<1?SP.s0:sandPx(X,Y)};
const rockPx=(pal,brick)=>(tx,ty,lx,ly,X,Y)=>{const me=tile(tx,ty),b=tile(tx,ty+1),face=!(b===me||b===T.SROCK||b===T.RUIN||b===T.SGATE);
  if(face&&ly>=7){if(ly===7)return pal[3];if(ly===15)return pal[0];if(brick?((ly-8)%4===3||(lx+((ly-8)>>2)*4)%8===0):((lx+ty*3)%6===0||h2(X,Y,74)>0.9))return pal[0];return ly<11?pal[2]:pal[1]}
  let c=h2(X>>1,Y>>1,75)>0.6?pal[2]:pal[1];if(h2(X,Y,76)>0.95)c=pal[3];if(brick&&((ly&7)===0||(lx+((ly>>3)&1)*4)%8===0))c=pal[0];
  const l=tile(tx-1,ty),r=tile(tx+1,ty);if((lx===0&&!SOLIDS.has(l))||(lx===15&&!SOLIDS.has(r)))c=pal[0];return c};
TILEPX[T.SROCK]=rockPx([SP.rk0,SP.rk1,SP.rk2,SP.rk3],false);
TILEPX[T.SGATE]=rockPx([SP.rk0,SP.rk1,SP.rk2,SP.rk3],true);
TILEPX[T.RUIN]=rockPx([SP.ru0,SP.ru1,SP.ru2,SP.ru3],true);
TILEPX[T.RFLOOR]=(tx,ty,lx,ly,X,Y)=>{if(h2(X>>1,Y>>1,77)>0.86)return sandPx(X,Y);if((lx&7)===0||(ly&7)===0)return SP.rf0;return h2(X>>3,Y>>3,78)>0.5?SP.rf1:SP.rf2};
TILEPX[T.QSAND]=(tx,ty,lx,ly,X,Y)=>{const v=Math.sin((X*0.35+Math.sin(Y*0.2)*3))+Math.sin(Y*0.4+X*0.1);return v>1?SP.q3:(v<-0.6?SP.q2:SP.q1)};

/* ---------- 스프라이트 ---------- */
const CACTUS=gridSprite(12,20,(x,y)=>{const trunk=x>=4&&x<=7&&y>=1,la=(x>=1&&x<=2&&y>=6&&y<=11)||(y>=10&&y<=11&&x>=1&&x<=4),ra=(x>=9&&x<=10&&y>=4&&y<=9)||(y>=8&&y<=9&&x>=7&&x<=10);if(!(trunk||la||ra))return null;if((x+y)%5===0)return '#d8f0a0';return (x===4||x===1||x===9)?'#6ab45a':'#3e8a44'},'#16261a');
const PALM=gridSprite(28,36,(x,y)=>{const px=x+.5,py=y+.5;
  for(let k=0;k<6;k++){const a=-2.9+k*0.55+(k>2?0.35:0),dx=px-14,dy=py-11,u=dx*Math.cos(a)+dy*Math.sin(a),v=-dx*Math.sin(a)+dy*Math.cos(a)+u*u*0.03;if(u>0&&u<13&&Math.abs(v)<2.2-u*0.11)return v<0?'#6ab45a':'#3a8444'}
  const tc=14+Math.sin(y*0.16)*2;if(y>=11&&y<35&&Math.abs(px-tc)<1.8)return y%4===0?'#5a3e26':(px<tc?'#a8825a':'#8a6640');
  if((px-13)**2+(py-12)**2<5)return '#7a4a2a';return null},'#16261a');
TILESPR[T.CACTUS]=()=>({s:CACTUS,ox:2,oy:-5});
TILESPR[T.PALM]=()=>({s:PALM,ox:-6,oy:-20});
const TENT=gridSprite(32,26,(x,y)=>{const hw=(y-2)*0.72;if(y<2||y>24||Math.abs(x+.5-16)>hw+1)return null;if(y>12&&Math.abs(x+.5-16)<3.5)return '#1a1426';const st=Math.floor((x+.5-16)/(hw/3+0.01));return (st&1)?'#b4583a':'#e8dcc0'},'#2a1a10');
const SCORP_ROWS=["....oooo......","...okkkko.....","..oko..oko....","..oko...oyo...","..oko....o....",".okkkooooo.o.o","okkkkkkkkkoko.","okKKKKKKkkko.o",".oooooooooo...",".o.o.o.o.o...."];
const SCORP_PAL={o:'#1a1012',k:'#8a6248',K:'#5e4032',y:'#c8ff6a'};
const SCORP=[spr(SCORP_ROWS,SCORP_PAL),spr(SCORP_ROWS.map((r,i)=>i===9?"..o.o.o.o.o...":r),SCORP_PAL)],SCORPL=SCORP.map(flipH);
PALS.pilgrim={o:'#141018',c:'#5a5460',C:'#3a3640',w:'#8a8490',s:'#e4dccc',S:'#b0a696',e:'#c0392b',b:'#7a2a2a',p:'#3a3640',f:'#1a161c'};
PALS.orban={o:'#141018',c:'#34303a',C:'#201c26',w:'#5e5866',s:'#ece4d4',S:'#bab0a0',e:'#e04a3a',b:'#8a2a2a',p:'#201c26',f:'#100e14'};
PALS.harin={o:'#1a1426',c:'#c8b48a',C:'#a08a60',w:'#e8dcb8',s:'#c89870',S:'#a07850',e:'#1a1426',b:'#4a8aa0',p:'#6a5a44',f:'#3a2e22'};
PALS.jeti={o:'#1a1426',c:'#4a8aa0',C:'#2e6278',w:'#8ac4d8',s:'#d8a880',S:'#b08460',e:'#1a1426',b:'#e8c45a',p:'#5a4a3a',f:'#2e241c'};
const PILGRIM=charSet(PALS.pilgrim);
NPCSPR.orban=spr(DOWN,PALS.orban);NPCSPR.harin=spr(DOWN,PALS.harin);NPCSPR.jeti=spr(DOWN,PALS.jeti);
const WHALE=gridSprite(96,44,(x,y)=>{const px=x+.5,py=y+.5;
  const tail=px>70?Math.max(3,15-(px-70)*0.75):15;
  const body=((px-44)/42)**2+((py-27)/tail)**2<1&&px<86;
  const fluke=px>=82&&((px-90)/7)**2+((py-18)/7)**2<1||px>=82&&((px-90)/7)**2+((py-34)/6)**2<1;
  const fin=px>30&&px<46&&py>36&&py<43&&(py-36)<(px-30)*0.6&&(py-36)<(46-px)*0.9;
  if(!(body||fluke||fin))return null;
  if(x>=13&&x<=15&&y>=24&&y<=26)return (x===13&&y===24)?'#f4f4ff':'#1a1426';
  if(y===32&&x>=5&&x<=26)return '#3a3028';
  if(body&&py>31-(px-44)*0.02)return (x+y)%7===0?'#d8c8a0':'#e8dcb8';
  if(body&&h2(x>>1,y>>1,91)>0.82)return '#8a7a5e';
  return py<20?'#c0ae88':'#a89672'},'#1a1426');
const FIN=gridSprite(16,14,(x,y)=>{if(y>12)return null;const w=(y)*0.55;return (x+.5>8-w*0.5&&x+.5<8+w)?(x<8?'#c0ae88':'#8a7a5e'):null},'#1a1426');
const STAKE=spr(["ooooo","okKko",".oko.",".oko.",".oko.",".oko.",".oko.",".oko.",".oko.",".oko.","..o.."],{o:'#0e0a12',k:'#4a4252',K:'#8a7a9a'});
const cropFace=(src,sx,sy,sw,sh)=>{const c=mk(16,16),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(src,sx,sy,sw,sh,0,0,16,15);return c};
NPCSPR.bahar=cropFace(WHALE,2,12,30,26);
const TGATE=gridSprite(32,34,(x,y)=>{const px=x+.5;if(y<2||Math.abs(px-16)>15)return null;if(y<8&&(px-16)**2+(y-10)**2>180)return null;
  if(x>=8&&x<=23&&y>=10){if(x===15||x===16)return '#1a1426';if((x-16)**2+(y-20)**2<10)return '#ffe08a';return y%6===0?'#3a3650':'#5a5878'}
  return (x+y*2)%7===0?'#4a4658':'#77738a'},'#0e0a12');
Object.assign(WHO,{harin:{name:'모래지기 하린'},jeti:{name:'상인 재티'},orban:{name:'오르반'},bahar:{name:'바하르'}});
EST.scorp=lv=>({hp:22+7*lv,atk:5+Math.round(2.3*lv),spd:44,xp:14+4*lv});
EST.pilgrim=lv=>({hp:30+8*lv,atk:6+Math.round(2.4*lv),spd:40,xp:16+4*lv});
EHB.scorp=14;EHB.pilgrim=25;
TRACKS.desert={name:'잿빛 모래의 노래',bpm:66,wave:'triangle',mel:[62,63,66,67,69,70,72,74],rh:[0.8,0,0.35,0.2,0.6,0.15,0.3,0],arp:1,
  ch:[[38,57,62,66],[38,57,62,66],[39,58,63,67],[38,57,62,66],[36,55,60,63],[38,57,62,66],[39,58,63,67],[38,57,62,69]]};

/* ---------- 위치 ---------- */
const BASIN={x0:280,y0:4,x1:310,y1:24};
const inBasin=(tx,ty)=>tx>BASIN.x0+1&&tx<BASIN.x1-1&&ty>BASIN.y0+1&&ty<BASIN.y1-1;
const OASIS={x:250,y:32},PLAZA={x:325*16,y:34*16},DCAVE={x:230*16,y:34*16+4},BACKEXIT={x:187*16,y:58*16+10};
BEACONS.push({tx:268,ty:12,name:'북쪽 모래 등대',wave:8,lv:12,ch:4,req:20,types:['scorp','pilgrim']},{tx:262,ty:52,name:'뼈 무덤 등대',wave:9,lv:12,ch:4,req:20,types:['scorp','scorp','wraith']},{tx:294,ty:38,name:'무너진 길 등대',wave:10,lv:13,ch:4,req:20,types:['pilgrim','scorp']});
const B4=BEACONS.length-3;
NPCS.push({id:'harin',x:252*16+8,y:35*16+12,spr:'harin',name:'모래지기 하린'},{id:'jeti',x:245*16+8,y:37*16+12,spr:'jeti',name:'상인 재티'},{id:'orban',x:PLAZA.x,y:PLAZA.y,spr:'orban',name:'오르반',cond:()=>S.q===24});
let dnight=0,storm=0,stormT=50,heat=0,heatTick=0,poisonT=0,poisonTick=0,DPROJ=[],orbanBusy=false;
const nightK=()=>{const t=(S.dtime||0)%200;return t<110?0:t<125?(t-110)/15:t<185?1:1-(t-185)/15};
function setGate4(open){for(let x=294;x<=296;x++)for(const y of[BASIN.y1-1,BASIN.y1])setT(x,y,open?T.SAND:T.SGATE);repaintArea(295,BASIN.y1,2)}

EXT.save.push(()=>({ash:0,boss4:0,dtime:20}));
EXT.build.push(MB=>{
  const A=AR.desert;
  for(let y=0;y<MH;y++)for(let x=A.x0;x<A.x1;x++){let t=T.SAND;const e=Math.min(x-A.x0,y,A.x1-1-x,MH-1-y);
    if(e<2+Math.floor(vnoise(x*0.3,y*0.3,81)*2.2))t=T.SROCK;else if(fbm(x*0.11,y*0.11,82)>0.7)t=T.SROCK;else if(h2(x,y,83)>0.988)t=T.CACTUS;setT(x,y,t)}
  for(let y=2;y<MH-2;y++)for(let x=312;x<=314;x++)setT(x,y,T.QSAND);
  for(let y=22;y<=46;y++)for(let x=316;x<=333;x++){const edge=x===316||x===333||y===22||y===46;setT(x,y,edge?T.RUIN:(h2(x,y,84)>0.84?T.SAND:T.RFLOOR))}
  for(let y=33;y<=35;y++){setT(316,y,T.RFLOOR);setT(315,y,T.SAND)}
  for(const[x0,y0,w,h]of[[319,25,4,3],[327,25,4,4],[319,40,5,3],[328,41,3,3],[320,31,2,2],[329,37,2,2]])for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)setT(x,y,T.RUIN);
  for(let y=BASIN.y0;y<=BASIN.y1;y++)for(let x=BASIN.x0;x<=BASIN.x1;x++){const e=Math.min(x-BASIN.x0,y-BASIN.y0,BASIN.x1-x,BASIN.y1-y);setT(x,y,e<2?T.SROCK:T.SAND)}
  const sand=()=>T.SAND,open=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=tile(x,y);if(t===T.SROCK||t===T.CACTUS)setT(x,y,T.SAND)}};
  MB.disc(OASIS.x,OASIS.y,9.5,sand);
  open(232,31,311,35);open(293,25,297,31);open(266,14,270,31);open(260,34,264,50);open(292,35,296,40);open(226,33,234,36);
  for(let x=233;x<=306;x++)for(const y of[32,33])if(tile(x,y)===T.SAND&&h2(x,y,85)>0.5)setT(x,y,T.RFLOOR);
  for(let y=-3;y<=3;y++)for(let x=-4;x<=4;x++)if((x/4.2)**2+(y/2.7)**2<1)setT(OASIS.x+x,OASIS.y-2+y,T.WATER);
  for(const[x,y]of[[244,29],[256,29],[247,26],[253,26],[257,34],[243,35]])setT(x,y,T.PALM);
  for(let i=B4;i<B4+3;i++)MB.disc(BEACONS[i].tx,BEACONS[i].ty,4,sand);
  for(let x=294;x<=296;x++)for(const y of[BASIN.y1-1,BASIN.y1])setT(x,y,T.SGATE);
  for(let y=30;y<=32;y++)for(let x=228;x<=232;x++)setT(x,y,T.SROCK);
  for(let j=OBJS.length-1;j>=0;j--)if(OBJS[j].k==='beacon'&&BEACONS[OBJS[j].i].ch>=4)OBJS.splice(j,1);
  for(let i=B4;i<B4+3;i++)MB.place({k:'beacon',tx:BEACONS[i].tx,ty:BEACONS[i].ty,i});
  MB.place({k:'dcave',tx:229,ty:31},2,2);
  MB.place({k:'tent',tx:243,ty:37},2,1);MB.place({k:'tent',tx:255,ty:37},2,1);
  MB.place({k:'fire',tx:250,ty:36});
  MB.place({k:'ferry',tx:311,ty:33,side:'W'});MB.place({k:'ferry',tx:315,ty:32,side:'E'});
  MB.place({k:'tgate',tx:331,ty:33},2,2);
  CHESTS.push({tx:322,ty:43});MB.place({k:'chest',tx:322,ty:43,i:CHESTS.length-1});
  MB.place({k:'backExit',tx:186,ty:59},2,2);
});
Object.assign(AR.desert,{
  music:'desert',
  dark:()=>0.1+0.78*nightK()+(storm>0?0.12:0),
  region:(tx,ty)=>tx>=315?'폐허 도시':inBasin(tx,ty)?'바하르의 분지':Math.hypot(tx-OASIS.x,ty-OASIS.y)<10?'오아시스 마을 물그림자':ty<22?'북쪽 모래 언덕':ty>44?'뼈 무덤':'잿빛 사막',
  spawn:(x,y,tx,ty)=>{if(S.q<19||inBasin(tx,ty)||(S.q===24&&tx>=315))return null;const night=nightK()>0.5||storm>0,lv=clamp(11+Math.floor((tx-228)/28),11,14)+(night?1:0);if(tx>=315)return['pilgrim',lv];const r=Math.random();return[night&&r<0.3?'wraith':(r<0.68?'scorp':'pilgrim'),lv]},
  respawn:()=>({x:OASIS.x*16+8,y:38*16,msg:'오아시스 모닥불 곁에서 정신을 차렸다'}),
});
EXT.safe.push(L=>L.push({x:OASIS.x*16,y:33*16,r:150}));
ROUTES.mine.desert=ROUTES.mine.tower=()=>BACKEXIT;
ROUTES.over.desert=ROUTES.over.tower=ROUTES.over['*'];
ROUTES.desert={'*':()=>DCAVE};

/* ---------- 오브젝트 ---------- */
OBJK.dcave={draw:(o,ox,oy)=>ctx.drawImage(DOOR_SPR[1],ox,oy+4),y:o=>(o.ty+2)*16-1,act:o=>({x:o.tx*16+16,y:(o.ty+2)*16+4,fn:()=>say([['sys','광산으로 이어지는 동굴로 들어간다.']],()=>{warp(187*16,57*16+8,'up');banner('두더지왕의 굴')})})};
OBJK.backExit={draw:(o,ox,oy)=>ctx.drawImage(DOOR_SPR[S.boss3?1:0],ox,oy+4),y:o=>(o.ty+2)*16-1,act:o=>({x:o.tx*16+16,y:o.ty*16-4,fn:()=>{
  if(S.q<18)return say([['sys','무너진 돌 더미가 통로를 막고 있다. 두더지왕이 지키고 있는 것 같다.']]);
  say([['sys','두더지왕이 파 놓은 긴 굴을 따라 걸었다. 저 끝에서 뜨거운 바람이 불어온다…']],()=>{warp(DCAVE.x,DCAVE.y,'down');
    if(S.q===18){S.q=19;banner('잿빛 사막','4장');saveGame();say([['seha','여기가 잿빛 사막이야. 낮엔 햇볕이 뜨겁고, 밤엔 그림자가 깊어. 바위 그늘에서 쉬면서 가야 해.'],['moru','으으, 벌써 신발에 모래가 다 들어왔어…'],['seha','동쪽에 오아시스 마을 ‘물그림자’가 있어. 순례자를 떠난 사람들이 사는 곳이야. 옛길의 돌바닥을 따라가면 돼.']])}else banner('잿빛 사막')})}})};
OBJK.tent={draw:(o,ox,oy)=>ctx.drawImage(TENT,ox,oy-10),y:o=>o.ty*16+15};
OBJK.ferry={draw:(o,ox,oy)=>{if(S.boss4)ctx.drawImage(SIGNS.r,ox+1,oy+1)},act:o=>S.boss4?{x:o.tx*16+8,y:o.ty*16+14,fn:()=>say([['sys','바하르의 등에 올라탔다. 고래가 유사 위를 천천히 헤엄친다…']],()=>{
  if(o.side==='W'){warp(317*16+8,34*16+8,'right');if(S.q===23){S.q=24;banner('폐허 도시');saveGame();say([['seha','여기가 폐허 도시야. 별등탑으로 가는 마지막 길목이지.'],['seha','저기 광장에… 누가 서 있어. 오르반이야.']])}else banner('폐허 도시')}
  else{warp(310*16+8,34*16+8,'left');banner('잿빛 사막')}})}:null};
OBJK.tgate={draw:(o,ox,oy)=>ctx.drawImage(TGATE,ox,oy-2),y:o=>(o.ty+2)*16-1,act:o=>({x:o.tx*16-2,y:o.ty*16+18,fn:()=>{if(typeof enterTower==='function')enterTower();else say([['sys','별등탑으로 가는 거대한 문. 굳게 닫혀 있다.']])}})};

/* ---------- 몬스터 ---------- */
ENEMY_AI.scorp=(e,dt,c)=>{e.cd-=dt;
  if(e.st==='wind'){e.st_t-=dt;moveBody(e,c.kx,c.ky,5,3,false);if(e.st_t<=0){e.st='';e.cd=rand(1.8,2.6);if(c.d<26){hurtPlayer(Math.round(e.atk*1.3),e.x,e.y);if(P.inv>0.85){poisonT=4;poisonTick=1;toast('독에 걸렸다!')}}}return true}
  if(c.chase&&c.d<22&&e.cd<=0){e.st='wind';e.st_t=0.45;e.fx=c.dx>0?1:-1;return true}
  return false};
ENEMY_DRAW.scorp=e=>{const s=(e.fx>0?SCORP:SCORPL)[e.st==='wind'?0:Math.floor(e.t*9)%2],x=Math.round(e.x-7-cam.x),y=Math.round(e.y-10-cam.y)-(e.st==='wind'?1:0);ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x+2,y+9,10,2);ctx.drawImage(s,x,y);if(e.flash>0||(e.st==='wind'&&Math.floor(time*16)%2)){ctx.globalCompositeOperation='lighter';ctx.drawImage(s,x,y);ctx.globalCompositeOperation='source-over'}};
ENEMY_AI.pilgrim=(e,dt,c)=>{e.noTouch=true;e.cd-=dt;e.dir=Math.abs(c.dx)>Math.abs(c.dy)?(c.dx<0?'left':'right'):(c.dy<0?'up':'down');
  if(e.st==='swing'){e.st_t-=dt;moveBody(e,c.kx,c.ky,5,3,false);if(e.st_t<=0){if(c.d<28)hurtPlayer(Math.round(e.atk*rand(0.9,1.1)),e.x,e.y);e.st='open';e.st_t=1.1;sfx('swing')}return true}
  if(e.st==='open'){e.st_t-=dt;moveBody(e,c.kx,c.ky,5,3,false);if(e.st_t<=0){e.st='';e.cd=rand(1.2,2)}return true}
  if(c.chase&&c.d<22&&e.cd<=0){e.st='swing';e.st_t=0.55;return true}
  return false};
ENEMY_HIT.pilgrim=(e,r,dx,dy)=>{if(e.st==='open'||e.st==='swing'||e.stun>0)return true;e.kx=dx*80;e.ky=dy*80;e.flash=0.06;tone('square',1400,900,0.05,0.03);FLOATS.push({x:e.x,y:e.y-24,n:0,col:'#a99cc2',t:0});if(!S.flags.blockTip){S.flags.blockTip=1;toast('방패에 막혔다! 지팡이를 휘두른 직후를 노리자','gold')}return false};
ENEMY_DRAW.pilgrim=e=>{const d=e.dir||'down',s=PILGRIM[d][e.st?0:Math.floor(e.t*7)%4],x=Math.round(e.x-8-cam.x),y=Math.round(e.y-20-cam.y);ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(x+4,y+19,8,2);ctx.drawImage(s,x,y);
  const v=DIRV[d];if(e.st==='swing'){ctx.fillStyle=Math.floor(time*14)%2?'#fff2b0':'#c8b48a';ctx.fillRect(x+7+v[0]*6,y-5,2,9)}else if(e.st==='open'){ctx.fillStyle='#c8b48a';ctx.fillRect(x+7+v[0]*9,y+10+v[1]*6,2,8)}
  else{ctx.fillStyle='#1a1426';ctx.fillRect(x+4+v[0]*7,y+9+v[1]*5,8,8);ctx.fillStyle='#8a8490';ctx.fillRect(x+5+v[0]*7,y+10+v[1]*5,6,6);ctx.fillStyle='#c0392b';ctx.fillRect(x+7+v[0]*7,y+12+v[1]*5,2,2)}
  if(e.flash>0){ctx.globalCompositeOperation='lighter';ctx.drawImage(s,x,y);ctx.globalCompositeOperation='source-over'}};

/* ---------- 보스: 모래 고래 바하르 ---------- */
const STAKE_HP=170,STAKE_X=[-24,-4,16];
function spawnWhale(){BOSS={kind:'whale',name:'모래 고래 바하르',cam:true,x:295*16,y:12*16,ang:1.5,hp:STAKE_HP*3,max:STAKE_HP*3,st:'swim',t:0,cd:3.5,flash:0,stakes:[STAKE_HP,STAKE_HP,STAKE_HP],shield:true,under:true,stun:0,hw:34,hh:13,hcy:30,gx:0,gy:0,sx:0,sy:0,phase:0,label:'모래 속'}}
function whaleDone(){
  const b=BOSS;BOSS=null;DPROJ=[];HAZ=[];shake=8;flash=1;sfx('fire');
  for(let k=0;k<70;k++)PARTS.push({x:b.x+rand(-40,40),y:b.y-rand(0,40),vx:rand(-80,80),vy:rand(-120,10),life:rand(0.8,1.6),max:1.6,col:k%3?'#c8a868':'#ffe08a',sz:k%4?1:2});
  for(let k=0;k<5;k++)dropItem('shard',b.x+rand(-30,30),b.y+14);for(let k=0;k<8;k++)dropItem('coin',b.x+rand(-30,30),b.y+14,22);
  S.boss4=1;S.ash=(S.ash||0)+2;gainXP(520);setGate4(true);
  setTimeout(()=>{banner('모래 고래 바하르','말뚝이 뽑히다');say([
    ['bahar','…후우우우… 등이… 가볍구나.'],
    ['bahar','재의 말뚝이 박힌 뒤로 나는 내 사막을 알아보지 못했다. 고맙다, 작은 빛들아.'],
    ['seha','바하르, 우리는 유사 너머 폐허 도시로 가야 해요. 오르반을 막아야 해요.'],
    ['bahar','유사는 발 디딘 것을 모두 삼킨다. 하지만 내 등은 삼키지 못하지. 동쪽 옛길 끝에서 기다리마. 등에 타거라.'],
    ['sys','재 수정 2개를 얻었다! 모루의 대장간에서 +6, +7 강화에 쓸 수 있다.'],
  ],()=>{S.q=23;saveGame();showEnd(4)})},1300);
}
BOSSES.whale={
  upd(b,dt){
    b.t+=dt;if(b.flash>0)b.flash-=dt;
    const X0=(BASIN.x0+3)*16,X1=(BASIN.x1-3)*16,Y0=(BASIN.y0+3)*16,Y1=(BASIN.y1-3)*16;
    if(b.st==='swim'){b.under=true;b.label='모래 속';
      let da=Math.atan2(P.y-b.y,P.x-b.x)-b.ang;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;b.ang+=clamp(da,-1.5*dt,1.5*dt);
      const sp=58+b.phase*14;b.x=clamp(b.x+Math.cos(b.ang)*sp*dt,X0,X1);b.y=clamp(b.y+Math.sin(b.ang)*sp*dt,Y0,Y1);
      if(Math.random()<0.8)PARTS.push({x:b.x+rand(-5,5),y:b.y+rand(-2,2),vx:-Math.cos(b.ang)*30+rand(-20,20),vy:rand(-30,-5),life:0.5,max:0.5,col:'#dcc084',sz:k2()});
      if(Math.hypot(P.x-b.x,P.y-4-b.y)<12)hurtPlayer(12,b.x,b.y);
      b.cd-=dt;if(b.cd<=0){b.t=0;if(b.phase>=1&&Math.random()<0.4)b.st='spout';else{b.st='warn';b.gx=clamp(P.x,X0,X1);b.gy=clamp(P.y,Y0,Y1)}}}
    else if(b.st==='warn'){if(b.t>(b.phase>=2?0.8:1.05)){b.st='jump';b.t=0;b.sx=b.x;b.sy=b.y;sfx('boss')}}
    else if(b.st==='jump'){const k=Math.min(1,b.t/0.6);b.x=b.sx+(b.gx-b.sx)*k;b.y=b.sy+(b.gy-b.sy)*k;
      if(k>=1){b.st='beached';b.t=0;b.under=false;b.label='좌초!';b.y=b.gy+12;shake=8;sfx('rock');if(((P.x-b.gx)/46)**2+((P.y-b.gy)/30)**2<1)hurtPlayer(20,b.gx,b.gy);
        for(let i=0;i<40;i++){const a=i/40*6.283;PARTS.push({x:b.gx,y:b.gy,vx:Math.cos(a)*150,vy:Math.sin(a)*90,life:0.45,max:0.45,col:'#dcc084',sz:2})}}}
    else if(b.st==='beached'){if(b.t>5.6-b.phase*0.8){b.st='dive';b.t=0;b.under=true;b.label='모래 속'}}
    else if(b.st==='dive'){if(b.t>0.6){b.st='swim';b.cd=rand(2.6,4)-b.phase*0.4;b.ang=Math.atan2(P.y-b.y,P.x-b.x)+Math.PI}}
    else if(b.st==='spout'){b.label='모래 뿜기';if(b.t>0.7&&!b.fired){b.fired=true;const n=5+b.phase*2,a0=Math.atan2(P.y-8-(b.y-10),P.x-b.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.2;DPROJ.push({x:b.x,y:b.y-10,vx:Math.cos(a)*85,vy:Math.sin(a)*85,life:2.6,dmg:12})}sfx('spore')}
      if(b.t>1.3){b.fired=false;b.st='swim';b.cd=rand(2,3)}}
  },
  hit(b,r){
    const i=b.stakes.findIndex(h=>h>0);if(i<0)return;const sx=b.x+STAKE_X[i],sy=b.y-34;
    if(i===2&&b.shield){FLOATS.push({x:sx,y:sy-8,n:0,col:'#a99cc2',t:0});tone('square',1400,900,0.05,0.03);if(!b.hinted){b.hinted=1;toast('마지막 말뚝은 재에 싸여 있다! 등불 섬광(D)으로 태우자','gold')}return}
    b.stakes[i]-=r.d;b.hp=b.stakes.reduce((a,h)=>a+Math.max(0,h),0);b.flash=0.12;hitstop=0.05;shake=2;sfx('hit');
    FLOATS.push({x:sx,y:sy-8,n:r.d,col:r.crit?'#ffd36b':'#fff',t:0});for(let k=0;k<6;k++)PARTS.push({x:sx,y:sy,vx:rand(-60,60),vy:rand(-70,10),life:0.3,max:0.3,col:'#8a7a9a',sz:1});
    if(b.stakes[i]<=0){b.phase++;shake=7;sfx('rock');for(let k=0;k<30;k++)PARTS.push({x:sx,y:sy,vx:rand(-90,90),vy:rand(-130,0),life:rand(0.5,1),max:1,col:k%2?'#4a4252':'#c8b0d0',sz:2});
      if(b.phase>=3)return whaleDone();toast(`말뚝을 뽑았다! (${b.phase}/3)`,'gold');b.st='dive';b.t=0;b.under=true}
  },
  flare(b){if(!b.under&&b.shield&&b.stakes[0]<=0&&b.stakes[1]<=0){b.shield=false;toast('말뚝을 감싼 재가 타 버렸다! 지금이야!','gold')}},
  draw(b){
    const sx=Math.round(b.x-cam.x),sy=Math.round(b.y-cam.y);
    if(b.st==='swim'){ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(sx-7,sy,14,2);const f=Math.cos(b.ang)<0?flipFin:FIN;ctx.drawImage(f,sx-8,sy-13+Math.round(Math.sin(time*8)));return}
    if(b.st==='warn'){const gx=Math.round(b.gx-cam.x),gy=Math.round(b.gy-cam.y),k=b.t;ctx.fillStyle=`rgba(0,0,0,${0.15+k*0.3})`;ctx.beginPath();ctx.ellipse(gx,gy,10+k*34,6+k*22,0,0,6.283);ctx.fill();
      ctx.fillStyle=Math.floor(time*12)%2?'#ffb44a':'#8a5a2a';for(let a=0;a<6.28;a+=0.1)ctx.fillRect(Math.round(gx+Math.cos(a)*46),Math.round(gy+Math.sin(a)*30),1,1);return}
    if(b.st==='jump'){const k=Math.min(1,b.t/0.6),h=Math.sin(k*Math.PI)*60;const gx=Math.round(b.gx-cam.x),gy=Math.round(b.gy-cam.y);ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.ellipse(gx,gy,44,26,0,0,6.283);ctx.fill();ctx.drawImage(WHALE,sx-48,Math.round(sy-28-h));return}
    let al=1,dy=0;if(b.st==='dive'){al=1-b.t/0.6;dy=Math.round(b.t*20)}
    if(b.st==='spout'){ctx.save();ctx.beginPath();ctx.rect(sx-50,sy-50,44,50);ctx.clip();ctx.drawImage(WHALE,sx-48,sy-34+Math.round(Math.max(0,(0.4-b.t))*30));ctx.restore();return}
    ctx.globalAlpha=Math.max(0,al);ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(sx,sy+2,44,7,0,0,6.283);ctx.fill();
    ctx.drawImage(WHALE,sx-48,sy-40+dy+Math.round(Math.sin(time*2)));
    if(b.flash>0){ctx.globalCompositeOperation='lighter';ctx.drawImage(WHALE,sx-48,sy-40+dy);ctx.globalCompositeOperation='source-over'}
    b.stakes.forEach((h,i)=>{if(h<=0)return;const x=sx+STAKE_X[i]-2,y=sy-40+dy;ctx.drawImage(STAKE,x,y);if(i===2&&b.shield){ctx.fillStyle=Math.floor(time*8)%2?'#c8b0d0':'#6a5a7a';for(let a=0;a<6.28;a+=0.7)ctx.fillRect(Math.round(x+2+Math.cos(a+time*3)*6),Math.round(y+5+Math.sin(a+time*3)*7),1,1)}
      else if(i===b.stakes.findIndex(q=>q>0)&&Math.floor(time*4)%2){ctx.fillStyle='#ffb44a';ctx.fillRect(x+1,y-4,3,2);ctx.fillRect(x+2,y-2,1,1)}});
    ctx.globalAlpha=1;
  }
};
const flipFin=flipH(FIN);

/* ---------- 이야기 ---------- */
const nearUnlit=(a,z)=>{let best=null,bd=1e9;for(let i=a;i<z;i++){if(S.beacons[i])continue;const b=BEACONS[i],x=b.tx*16+8,y=b.ty*16,d=Math.hypot(x-P.x,y-P.y);if(d<bd){bd=d;best={x,y:y-8}}}return best};
QX[18]={text:()=>'두더지왕의 굴 남쪽, 무너진 통로로 나가기',target:()=>BACKEXIT};
QX[19]={text:()=>'옛길을 따라 동쪽 오아시스 마을 찾기',target:()=>({x:NPCS.find(n=>n.id==='harin').x,y:35*16})};
QX[20]={text:()=>`사막 등대 밝히기 (${S.beacons.slice(B4,B4+3).reduce((a,b)=>a+b,0)}/3)`,target:()=>nearUnlit(B4,B4+3)};
QX[21]={text:()=>'북동쪽 바하르의 분지로 가기',target:()=>({x:295*16+8,y:26*16})};
QX[22]={text:()=>'바하르가 좌초했을 때 등의 말뚝 뽑기',target:()=>BOSS?{x:BOSS.x,y:BOSS.y-50}:null};
QX[23]={text:()=>'옛길 동쪽 끝에서 바하르를 타고 유사 건너기',target:()=>({x:311*16+8,y:33*16})};
QX[24]={text:()=>'폐허 도시 광장에서 오르반 찾기',target:()=>({x:PLAZA.x,y:PLAZA.y-24})};
ENDS[4]=['4장 완료','잿빛 사막','모래 고래 바하르의 등에서 재의 말뚝을 모두 뽑았어요. 바하르가 유사를 건너게 해 줄 거예요. 옛길 동쪽 끝에서 바하르를 타고 폐허 도시로 가서 오르반을 만나세요.'];
TALK.harin=function(){
  if(S.q===19)return say([
    ['harin','세하… 살아 있었구나. 가면이 깨졌네. 잘됐다, 정말 잘됐어.'],
    ['harin','나는 하린. 우리도 한때는 순례자였단다. 오르반이 봉화를 끄고 다니라 했을 때 가면을 벗고 떠났지.'],
    ['harin','사막의 등대 셋이 꺼진 뒤로 수호자 바하르가 미쳐 날뛴다. 모래 속을 헤엄치는 큰 고래 말이다. 오르반이 그 등에 재의 말뚝을 박았어.'],
    ['harin','등대를 모두 밝히면 바하르의 분지로 가는 바위문이 열린다. 유사 너머 폐허 도시로 가려면 바하르의 등을 타는 수밖에 없단다.'],
    ['harin','낮엔 바위나 야자수 그늘에서 쉬어 가거라. 더위를 먹으면 몸이 축난다. 밤과 모래폭풍 때는 그림자가 사나워지니 조심하고.'],
    ['harin','재티에게서 회복약을 사 두면 좋을 게다. Q를 누르면 마실 수 있지.'],
  ],()=>{S.q=20;toast('새 목표: 사막 등대 밝히기','gold');toast('세하가 할 말이 있는 것 같다 (세하 곁에서 E)','good');saveGame()});
  if(S.q>=23)return say([['harin','바하르가 다시 노래를 부르는구나. 사막에 물이 돌아올 게다.']]);
  say([['harin','모닥불 곁에서 쉬어 가거라. 오아시스 근처에서는 더위도 금방 가신단다.']]);
};
function jetiShop(){choose('상인 재티',`가진 은화 ${S.coins} · 회복약 ${S.potions||0}개 · 재 수정 ${S.ash||0}개`,[
  {label:'회복약 (은화 25) · 체력 40% 회복',fn:()=>{if((S.potions||0)>=5)toast('회복약은 5개까지 들 수 있어요');else if(S.coins<25)toast('은화가 부족해요');else{S.coins-=25;S.potions=(S.potions||0)+1;sfx('pick')}jetiShop()}},
  {label:'재 수정 (은화 70) · +6, +7 강화 재료',fn:()=>{if(S.coins<70)toast('은화가 부족해요');else{S.coins-=70;S.ash=(S.ash||0)+1;sfx('pick')}jetiShop()}},
  {label:'그만두기',fn:saveGame}])}
TALK.jeti=function(){if(!S.flags.jeti){S.flags.jeti=1;return say([['jeti','어서 와! 가면을 벗고 장사꾼이 된 재티야. 재를 뒤집어쓰는 것보다 은화를 세는 게 훨씬 즐겁더라고.'],['jeti','회복약은 Q로 마시면 돼. 재 수정은 솜씨 좋은 대장장이한테 가져가 봐.']],jetiShop)}jetiShop()};
TALK.orban=function(){};
{const old=TALK.seha;TALK.seha=function(){
  if(S.q>=20&&S.q<=24&&!S.flags.sehaChoice)return say([
    ['seha','…있잖아. 계속 생각했어. 나는 십 년을 그 가면을 쓰고 살았어.'],
    ['seha','기록대로라면 별등이 그림자를 태운 건 사실이야. 순례자들이 본 건 거짓이 아니었어. 그럼 우리는… 틀렸던 걸까?'],
  ],()=>choose('세하의 물음','어떻게 대답할까요?',[
    {label:'틀린 게 아니야. 다시는 태우지 않겠다는 마음은 옳았어.',fn:()=>{S.flags.sehaChoice=1;say([['seha','…고마워. 방법이 틀렸을 뿐이구나. 그럼 다른 방법을 찾으면 돼.'],['seha','태우지 않는 빛. 그런 게 있다면 좋겠다.']],saveGame)}},
    {label:'틀렸어. 그래도 넌 돌아왔잖아.',fn:()=>{S.flags.sehaChoice=2;say([['seha','…그래. 틀렸지. 그러니까 이번엔 끝까지 바로잡을 거야.']],saveGame)}}]));
  const l={19:'옛길의 돌바닥을 따라 동쪽으로 가면 오아시스야.',20:'등대는 북쪽 모래 언덕, 남쪽 뼈 무덤, 동쪽 무너진 길에 있어.',21:'바하르의 분지는 북동쪽이야.',22:'뛰어오른 뒤 누워 있을 때 말뚝을 쳐!',23:'옛길 동쪽 끝으로 가자. 바하르가 기다려.',24:'오르반은 광장에 있어. …조심해.'};
  if(l[S.q])return say([['seha',l[S.q]]]);old()}}
AFTER_BEACON[4]=function(i){
  const lit=S.beacons.slice(B4,B4+3).reduce((a,b)=>a+b,0);
  if(lit===1)say([['seha','등대 불빛이 모래 위로 길게 뻗어. 사막에서는 이 빛이 길잡이였대.'],['moru','밤에도 이쪽은 안전하겠다!']]);
  else if(lit===2)say([['owl','하나 남았어! 저 멀리 모래가 크게 출렁이는 게 보여… 엄청 큰 무언가야.']]);
  else say([['seha','세 등대가 다 켜졌어. 북동쪽 분지의 바위문이 열렸을 거야.'],['moru','모래 고래라니… 내 망치가 통할까?']],()=>{S.q=21;setGate4(true);toast('바하르의 분지로 가는 바위문이 열렸다','gold');saveGame()});
};
function orbanScene(){
  if(orbanBusy)return;orbanBusy=true;E=[];
  say([
    ['orban','세하. 가면을 벗었구나. 그리고… 호롱의 제자로군.'],
    ['orban','봉화를 켜고 다닌 게 너였나. 불을 붙일 때마다 그림자가 우는 소리, 정말 듣지 못했느냐.'],
    ['me','기록을 봤어요. 별등은 벌을 내린 게 아니에요. 균형을 위해 스스로 꺼진 거예요.'],
    ['orban','…그 기록이라면 나도 안다. 백 년 전 그 탑에, 내가 있었으니까.'],
    ['orban','빛은 반드시 무언가를 태운다. 나는 그 광경을 두 번 다시 보지 않겠다. 별등탑은 내 손으로 무너뜨린다.'],
    ['seha','오르반, 그만둬요! 태우지 않는 방법이 있을지도 몰라요!'],
    ['orban','너희는 빛을 든 채로 너무 크게 자랐구나. …작아져라. 처음 등불을 들던 그날처럼.'],
    ['sys','오르반이 한 줌의 재를 불었다. 몸이 줄어든다. 손바닥만큼, 손톱만큼, 모래알만큼…'],
    ['sys','모래바람이 작아진 몸을 휘감아 서쪽 하늘로 날려 보냈다.'],
  ],()=>{orbanBusy=false;if(typeof startTiny==='function')startTiny();else{S.q=25;saveGame()}});
}

/* ---------- 매 프레임 ---------- */
EXT.update.push((dt,tx,ty)=>{
  if(poisonT>0){poisonT-=dt;poisonTick-=dt;if(poisonTick<=0){poisonTick=1;if(S.hp>1){S.hp=Math.max(1,S.hp-2);FLOATS.push({x:P.x,y:P.y-26,n:2,col:'#c8ff6a',t:0})}}}
  for(const p of DPROJ){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.life<=0||solidAt(p.x,p.y))p.dead=true;else if(overlap(P.x,P.y-8,5,7,p.x,p.y,3,3)){hurtPlayer(p.dmg,p.x,p.y);p.dead=true}}
  DPROJ=DPROJ.filter(p=>!p.dead);
  if(curArea.id!=='desert'){heat=Math.max(0,heat-dt*0.2);storm=0;return}
  S.dtime=((S.dtime||0)+dt)%200;
  stormT-=dt;if(storm>0){storm-=dt;if(storm<=0)toast('모래폭풍이 지나갔다')}else if(stormT<=0&&S.q>=20&&!BOSS&&tx<315){storm=20;stormT=rand(70,100);toast('모래폭풍이 몰려온다!','gold')}
  let shade=nightK()>0.3||storm>0||BOSS||tile(tx,ty)===T.RFLOOR&&tx>=315||!!inSafeLight(P.x,P.y);
  if(!shade)for(let y=-2;y<=2&&!shade;y++)for(let x=-2;x<=2;x++){const t=tile(tx+x,ty+y);if(t===T.SROCK||t===T.RUIN||t===T.PALM||t===T.SGATE||t===T.WATER){shade=true;break}}
  heat=clamp(heat+(shade?-dt/5:dt/26),0,1);
  if(heat>=1){heatTick-=dt;if(heatTick<=0){heatTick=1.6;if(S.hp>1){S.hp=Math.max(1,S.hp-1);FLOATS.push({x:P.x,y:P.y-26,n:1,col:'#ffb44a',t:0})}if(!S.flags.heatTip){S.flags.heatTip=1;toast('더위를 먹었다! 바위나 야자수 그늘에서 쉬자','gold')}}}
  if(S.q===21&&inBasin(tx,ty)&&ty<BASIN.y1-3){S.q=22;setGate4(false);E=E.filter(e=>e.wave!==null);storm=0;spawnWhale();sfx('boss');shake=6;
    say([['sys','발밑의 모래가 크게 출렁인다…'],['seha','바하르야! 등에 말뚝 세 개가 박혀 있어. 뛰어올랐다가 떨어진 뒤 지쳐 누워 있을 때가 기회야!'],['owl','땅에 그림자가 커지면 바로 도망쳐! 등지느러미에 닿아도 다쳐!']])}
  if(S.q===24&&mode==='play'&&Math.hypot(P.x-PLAZA.x,P.y-PLAZA.y)<56)orbanScene();
});
EXT.die.push(()=>{poisonT=0;heat=0;DPROJ=[];orbanBusy=false;if(S.q===22){S.q=21;setGate4(true)}});
EXT.load.push(()=>{if(S.q===22)S.q=21;setGate4(S.q>=21);heat=0;storm=0;stormT=50;poisonT=0;DPROJ=[];orbanBusy=false});
EXT.hud.push(parts=>{if(poisonT>0)parts.push('중독');if(curArea&&curArea.id==='desert'){parts.push(nightK()>0.5?'밤':'낮');if(heat>0.2)parts.push('더위 '+'■'.repeat(Math.ceil(heat*5))+'□'.repeat(5-Math.ceil(heat*5)))}});
EXT.ground.push(()=>{for(const p of DPROJ){const x=Math.round(p.x-cam.x),y=Math.round(p.y-cam.y);ctx.fillStyle='#7e6236';ctx.fillRect(x-2,y-1,5,3);ctx.fillRect(x-1,y-2,3,5);ctx.fillStyle='#dcc084';ctx.fillRect(x-1,y-1,2,2)}});
EXT.sorted.push(D=>{if(S.boss4&&curArea.id==='desert'&&!BOSS){const wx=313*16+8,wy=35*16+12;D.push({y:wy,f:()=>ctx.drawImage(WHALE,Math.round(wx-48-cam.x),Math.round(wy-40-cam.y+Math.sin(time*1.5)))})}});
EXT.lights.push((L,warm)=>{if(curArea.id==='desert'&&BOSS&&BOSS.kind==='whale'&&!BOSS.under)L.push([BOSS.x,BOSS.y-20,70])});
EXT.over.push(()=>{
  if(curArea.id!=='desert')return;
  const dk=1-nightK();if(dk>0.05){ctx.fillStyle=`rgba(255,196,110,${0.07*dk})`;ctx.fillRect(0,0,VW,VH)}
  if(storm>0){const k=Math.min(1,storm/2,(20-storm)/2),px=P.x-cam.x,py=P.y-10-cam.y,g=ctx.createRadialGradient(px,py,26,px,py,120);g.addColorStop(0,'rgba(190,150,84,0.12)');g.addColorStop(1,`rgba(170,130,70,${0.82*k})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
    ctx.fillStyle=`rgba(236,208,150,${0.7*k})`;for(let i=0;i<46;i++){const x=(h2(i,1,5)*VW+time*(160+h2(i,2,5)*140))%VW,y=(h2(i,3,5)*VH+time*30)%VH;ctx.fillRect(Math.round(x),Math.round(y),3+(i&3),1)}}
  if(poisonT>0){ctx.fillStyle='rgba(140,220,90,0.07)';ctx.fillRect(0,0,VW,VH)}
});
