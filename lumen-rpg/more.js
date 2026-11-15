'use strict';
/* =========================================================
   보강: 별등탑 퍼즐(거울 · 별의 인력), 새 몬스터 6종, 보스 새 공격,
   새 방식의 부탁 4개, 음량 조절
   ========================================================= */
(()=>{
const clink=e=>{e.flash=0.06;tone('square',1400,900,0.05,0.03);FLOATS.push({x:e.x,y:e.y-18,n:0,col:'#a99cc2',t:0})};
const ring=(x,y,n,col,sp=120)=>{for(let k=0;k<n;k++){const a=k/n*6.283;PARTS.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*0.65,life:0.35,max:0.35,col,sz:2})}};
const shadow=(x,y,w)=>{ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(Math.round(x-w/2-cam.x),Math.round(y-1-cam.y),w,2)};
const lit=(s,x,y,on)=>{ctx.drawImage(s,x,y);if(on){ctx.globalCompositeOperation='lighter';ctx.drawImage(s,x,y);ctx.globalCompositeOperation='source-over'}};
const flipV=src=>{const c=mk(src.width,src.height),x=c.getContext('2d');x.translate(0,src.height);x.scale(1,-1);x.drawImage(src,0,0);return c};
const tip=(k,msg)=>{if(!S.flags[k]){S.flags[k]=1;toast(msg,'gold')}};

/* =========================================================
   1. 별등탑: 거울 퍼즐 (1층 북쪽) · 별의 인력 방 (3층)
   ========================================================= */
T.GRAV=45;MCOL[T.GRAV]=hex('#161a3c');
{const g0=hex('#12142e'),g1=hex('#181c40'),g2=hex('#5a6ab8'),g3=hex('#c8ccff');
 TILEPX[T.GRAV]=(tx,ty,lx,ly,X,Y)=>{const n=h2(X,Y,301);if(n>0.992)return g3;if(n>0.975)return g2;if((lx===8&&(ly===3||ly===12))||(ly===8&&(lx===3||lx===12)))return g2;return ((tx+ty)&1)?g0:g1}}
const G4=rox(4);
const PIL=[[1,9],[2,5],[3,9],[5,6],[5,8],[6,7],[6,8],[8,8],[8,13],[9,2],[9,9],[12,9],[13,7],[14,11],[17,10],[18,9],[22,5],[22,10]];
const MIR=[[8,5],[8,3],[13,3],[18,3]],EMIT=[3,5],RECV=[18,5],MIR_INIT=[1,2,0,0];
const mst=()=>S.flags.ms||(S.flags.ms=MIR_INIT.slice());
EXT.build.push(MB=>{
  for(let y=0;y<18;y++)for(let x=0;x<26;x++)setT(G4+x,y,(x<1||x>24||y<2||y>16)?T.TWALL:(y<=13?T.GRAV:T.TFLOOR));
  for(const x of[12,13,14])setT(G4+x,1,T.TFLOOR);
  for(const[x,y]of PIL)setT(G4+x,y,T.TWALL);
  MB.place({k:'tstair',tx:G4+13,ty:0,up:1,room:4,to:2});MB.place({k:'tstair',tx:G4+13,ty:17,up:0,room:4,to:1,back:19});
  MIR.forEach(([x,y],i)=>MB.place({k:'mirror',tx:rox(0)+x,ty:y,i}));
  MB.place({k:'emit',tx:rox(0)+EMIT[0],ty:EMIT[1]});MB.place({k:'recv',tx:rox(0)+RECV[0],ty:RECV[1]});
});
/* 빛줄기 경로: 거울에서 꺾이고 벽에서 멈춘다 */
function beamPath(){
  const pts=[[EMIT[0],EMIT[1]]];let x=EMIT[0],y=EMIT[1],dx=1,dy=0,hit=false;const m=mst();
  for(let n=0;n<90;n++){x+=dx;y+=dy;
    if(x===RECV[0]&&y===RECV[1]){pts.push([x,y]);hit=true;break}
    const i=MIR.findIndex(q=>q[0]===x&&q[1]===y);
    if(i>=0){if(m[i]===2)continue;pts.push([x,y]);if(m[i]===0)[dx,dy]=[-dy,-dx];else[dx,dy]=[dy,dx];continue}
    if(x<1||x>24||y<1||y>16||(x===EMIT[0]&&y===EMIT[1])){pts.push([x-dx*0.5,y-dy*0.5]);break}}
  return{pts,hit};
}
const MIRSPR=[0,1,2].map(s=>gridSprite(14,18,(x,y)=>{if(y>=14)return x>=3&&x<=10?(y===14?'#8a88c0':'#3e3a66'):null;if(y>=11)return x>=5&&x<=8?'#5e5a8e':null;
  const fx=x-1,fy=y;if(fx<0||fx>11||fy>10)return null;const on=s===0?Math.abs(fx+fy-11)<=1:(s===1?Math.abs(fx-fy-0.5)<=1:(fy>=4&&fy<=6));if(!on)return null;
  return s===2?(fy===5?'#e8f4ff':'#8ab0d8'):((s===0?fx+fy-11:fx-fy)===0?'#e8f4ff':'#8ab0d8')},'#0e0c1c'));
const CRYS=gridSprite(12,18,(x,y)=>{if(y>=15)return x>=2&&x<=9?'#3e3a66':null;const w=y<5?y+1:(y<11?5:15-y);return Math.abs(x-5.5)<w*0.9?(x<5?'#e8fcff':(x<7?'#8ae0f4':'#4aa8c8')):null},'#0e0c1c');
OBJK.emit={draw:(o,ox,oy)=>drawBeacon(BEACON,ox+8,oy+16,'lit',5,7),y:o=>o.ty*16+15};
OBJK.recv={draw:(o,ox,oy)=>{ctx.drawImage(CRYS,ox+2,oy-3);if(S.flags.mir||beamPath().hit){ctx.globalCompositeOperation='lighter';ctx.drawImage(CRYS,ox+2,oy-3);ctx.globalCompositeOperation='source-over'}},y:o=>o.ty*16+15};
OBJK.mirror={draw:(o,ox,oy)=>ctx.drawImage(MIRSPR[mst()[o.i]],ox+1,oy-2),y:o=>o.ty*16+15,
  act:o=>S.flags.mir?null:{x:o.tx*16+8,y:o.ty*16+12,fn:()=>{const m=mst();m[o.i]=(m[o.i]+1)%3;sfx('equip');tip('mirTip','거울은 누를 때마다 ／ → ＼ → 눕히기 순서로 바뀐다. 빛줄기를 수정까지 이어 보자');
    if(beamPath().hit){S.flags.mir=1;flash=0.6;shake=3;sfx('beaconLit');say([['sys','빛줄기가 수정에 닿았다. 위층으로 가는 계단을 막고 있던 빛의 봉인이 풀린다!'],['owl','해냈다! 이제 올라갈 수 있어.']],saveGame)}}}};
EXT.sorted.push(D=>{
  if(curArea.id!=='tower'||roomOf(P.x)!==0)return;
  const{pts}=beamPath();D.push({y:-1e6,f:()=>{for(let i=0;i<pts.length-1;i++){const[ax,ay]=pts[i],[bx,by]=pts[i+1],n=Math.round(Math.hypot(bx-ax,by-ay)*8);
    for(let k=0;k<=n;k++){const px=Math.round((rox(0)+ax+(bx-ax)*k/n)*16+8-cam.x),py=Math.round((ay+(by-ay)*k/n)*16+5-cam.y);ctx.fillStyle=(k+Math.floor(time*20))%4?'#fff2b0':'#ffffff';ctx.fillRect(px,py,2,2)}}}});
});
EXT.lights.push(L=>{
  if(curArea.id!=='tower')return;const k=roomOf(P.x);
  if(k===0){const{pts}=beamPath();for(let i=0;i<pts.length-1;i++){const[ax,ay]=pts[i],[bx,by]=pts[i+1],n=Math.ceil(Math.hypot(bx-ax,by-ay));for(let j=0;j<=n;j++)L.push([(rox(0)+ax+(bx-ax)*j/n)*16+8,(ay+(by-ay)*j/n)*16+6,15])}L.push([(rox(0)+EMIT[0])*16+8,EMIT[1]*16,46])}
  if(k===4){L.push([(G4+13)*16+8,20,70]);L.push([(G4+13)*16,15*16,90])}
});
/* 별의 인력: 한 번 발을 떼면 벽에 닿을 때까지 떨어진다 */
function slideFrom(tx,ty,dx,dy){let x=tx,y=ty;for(let n=0;n<40;n++){const nx=x+dx,ny=y+dy,t=tile(nx,ny);if(SOLIDS.has(t))break;x=nx;y=ny;if(t!==T.GRAV)break}return[x,y]}
let slideCd=0,gravHint=0,lastRoom=-1;
EXT.update.push((dt,tx,ty)=>{
  if(curArea.id!=='tower'){lastRoom=-1;return}
  const k=roomOf(P.x);
  if(k!==lastRoom){lastRoom=k;if(S.q<34&&!BOSS&&mode==='play'){
    const put=(t,x,y)=>spawnEnemy(t,(rox(k)+x)*16+8,y*16+8,16);
    if(k===0){put('sentinel',5,3);put('sentinel',20,3);put('wisp',12,5)}
    if(k===1){put('wisp',10,9);put('wisp',16,4)}
    if(k===4&&!S.flags.grav)tip('gravTip','별의 인력: 별무늬 바닥에서는 한 방향으로 벽에 닿을 때까지 떨어진다. 기둥을 디딤돌 삼아 위쪽 계단까지 가자')}}
  if(k!==4||S.flags.grav||P.auto||mode!=='play')return;
  slideCd-=dt;
  if(tile(tx,ty)===T.TFLOOR&&ty===1){S.flags.grav=1;sfx('beaconLit');flash=0.5;toast('별의 인력이 잠잠해졌다. 이제 이 방은 자유롭게 걸을 수 있다','gold');saveGame();return}
  if(tile(tx,ty)!==T.GRAV)return;
  let dx=0,dy=0;const ix=joy.x+(keys.arrowright?1:0)-(keys.arrowleft?1:0),iy=joy.y+(keys.arrowdown?1:0)-(keys.arrowup?1:0);
  if(Math.abs(ix)>0.3||Math.abs(iy)>0.3){if(Math.abs(ix)>Math.abs(iy))dx=ix>0?1:-1;else dy=iy>0?1:-1}
  if((!dx&&!dy)||slideCd>0)return;
  const[gx,gy]=slideFrom(tx,ty,dx,dy);P.dir=dx?(dx>0?'right':'left'):(dy>0?'down':'up');
  if(gx===tx&&gy===ty){slideCd=0.25;return}
  const x1=gx*16+8,y1=gy*16+10,dist=Math.hypot(x1-P.x,y1-P.y);sfx('dash');
  P.auto={t:0,dur:Math.max(0.12,dist/230),x0:P.x,y0:P.y,x1,y1,done:()=>{slideCd=0.12;sfx('thud');shake=1.5;P.kx=P.ky=0;for(let i=0;i<6;i++)PARTS.push({x:P.x+rand(-4,4),y:P.y,vx:rand(-30,30),vy:rand(-30,-5),life:0.35,max:0.35,col:'#c8ccff',sz:1})}};
});
EXT.load.push(()=>{if(S.q>=32){S.flags.mir=1;S.flags.grav=1}lastRoom=-1});
EXT.die.push(()=>{lastRoom=-1});

/* =========================================================
   2. 새 몬스터 (4장 이후)
   ========================================================= */
const VULT=[0,1].map(f=>gridSprite(18,11,(x,y)=>{const px=x-8.5,py=y-6;if(((px)/3.2)**2+((py)/2.6)**2<1){if(px>1.5&&py<0)return x===12&&y===5?'#ffd36b':'#d8d0c0';return py>0.8?'#3a3440':'#57505e'}
  if(x>=13&&x<=14&&y===6)return '#e0a040';const wy=f?(Math.abs(px)*0.55):(-Math.abs(px)*0.5),d=py-wy+ (f?-1:1);if(Math.abs(px)>2&&Math.abs(px)<8.5&&Math.abs(d)<1.3)return Math.abs(px)>6?'#2a2630':'#46404e';return null},'#14101a'));
const VULTL=VULT.map(flipH);
const MOUND=gridSprite(14,6,(x,y)=>{const h=5-Math.abs(x-6.5)*0.75;return 5-y<h?(y<3&&x<7?'#e8cc90':(h2(x,y,311)>0.7?'#b08a50':'#d0aa68')):null},'#6a5030');
const LURK=gridSprite(14,18,(x,y)=>{const px=x-6.5;if(y>=14)return Math.abs(px)<6.5-(y-14)*0.2?'#d0aa68':null;if(y<5){if(Math.abs(px)>2&&Math.abs(px)<5.5-y*0.4&&y<4)return '#f4ecdc';if(Math.abs(px)<=4.5&&y>=2)return y===3&&Math.abs(Math.abs(px)-2)<0.8?'#ff5a4a':'#7a4a5a';return null}
  if(Math.abs(px)<4.6+Math.sin(y*1.3)*0.5)return (y%3===0)?'#5a3444':(px<-1.5?'#b07088':'#8a5068');return null},'#2a1420');
const BEET=[0,1].map(f=>gridSprite(14,10,(x,y)=>{const px=x-6.5,py=y-4.5;if(y>=8)return ((x+f)%4===1&&x>1&&x<12)?'#1a1426':null;if((px/6)**2+(py/4)**2<1){if(x>=11)return y===4?'#ffd36b':'#2a2438';if(Math.abs(px+1)<0.6)return '#1a3a30';return py<-1.5?'#6ac8a0':(py<1?'#3a9a78':'#266a54')}
  if(x>=12&&y>=1&&y<=3)return '#c8c0d8';return null},'#0e1a16'));
const BEETL=BEET.map(flipH),BEETF=flipV(BEET[0]);
const FLEA=gridSprite(8,8,(x,y)=>{const px=x-3.5,py=y-3.5;if((px/3.2)**2+(py/2.8)**2<1)return x>=5&&y===3?'#ff6a5a':(py<0?'#8a5a3a':'#5e3a24');if(y>=6&&(x===1||x===2||x===5||x===6))return '#2a1a10';return null},'#140c08');
const SENT=[0,1].map(aw=>gridSprite(14,22,(x,y)=>{const px=x-6.5;if(y>=19)return Math.abs(px)<6.5?'#3e3a66':null;if(y<7){if((px/3.6)**2+((y-3.5)/3.6)**2<1){if(y===3&&Math.abs(Math.abs(px)-1.5)<0.6)return aw?'#ffe08a':'#2a2648';return px<-1?'#a8a4c8':'#77738a'}return null}
  if(y<19&&Math.abs(px)<(y<9?2.5:5.2)){if(y===12&&Math.abs(px)<1.2)return aw?'#ffe08a':'#55516a';return px<-2?'#a8a4c8':(px>2.5?'#55516a':'#77738a')}if(y>=9&&y<15&&Math.abs(Math.abs(px)-6)<0.8)return '#77738a';return null},'#0e0c1c'));
Object.assign(EST,{
  vulture:lv=>({hp:18+6*lv,atk:5+Math.round(2.3*lv),spd:50,xp:15+4*lv}),lurker:lv=>({hp:26+7*lv,atk:6+Math.round(2.4*lv),spd:40,xp:16+4*lv}),
  beetle:lv=>({hp:20+6*lv,atk:5+Math.round(2.2*lv),spd:30,xp:12+3*lv}),flea:lv=>({hp:9+4*lv,atk:4+Math.round(2*lv),spd:40,xp:8+2*lv}),
  wisp:lv=>({hp:20+6*lv,atk:5+Math.round(2.2*lv),spd:36,xp:16+4*lv}),sentinel:lv=>({hp:60+12*lv,atk:6+Math.round(2.6*lv),spd:30,xp:26+5*lv})});
Object.assign(EHB,{vulture:22,lurker:20,beetle:13,flea:11,wisp:20,sentinel:26});
/* 재 독수리: 주위를 돌다가 일직선으로 내리꽂는다 */
ENEMY_AI.vulture=(e,dt,c)=>{e.noTouch=e.st!=='dive';e.cd-=dt;
  if(e.st==='aim'){e.st_t-=dt;if(e.st_t<=0){e.st='dive';e.st_t=0.75;sfx('dash')}return true}
  if(e.st==='dive'){e.st_t-=dt;e.x+=e.ldx*190*dt;e.y+=e.ldy*190*dt;if(e.st_t<=0){e.st='';e.cd=rand(2.2,3.4)}return true}
  if(!c.chase)return false;
  e.orb=e.orb||(Math.random()<0.5?1:-1);const a=Math.atan2(-c.dy,-c.dx)+0.5*e.orb,gx=P.x+Math.cos(a)*66,gy=P.y-8+Math.sin(a)*46,ux=gx-e.x,uy=gy-e.y,ud=Math.hypot(ux,uy)||1,s=Math.min(78,ud*4);
  e.x+=ux/ud*s*dt+c.kx;e.y+=uy/ud*s*dt+c.ky;e.fx=c.dx>0?1:-1;
  if(e.cd<=0&&c.d<120){e.st='aim';e.st_t=0.5;e.ldx=c.dx/c.d;e.ldy=(c.dy-6)/c.d;tip('vultTip','재 독수리가 날개를 접으면 곧 내리꽂는다! 옆으로 피한 뒤에 치자')}
  return true};
ENEMY_DRAW.vulture=e=>{const dive=e.st==='dive',s=(e.fx>0?VULT:VULTL)[dive?1:Math.floor(e.t*7)%2],h=dive?4:14,x=Math.round(e.x-9-cam.x),y=Math.round(e.y-6-h-cam.y)+(e.st==='aim'?Math.round(rand(-1,1)):0);
  shadow(e.x,e.y+2,8);lit(s,x,y,e.flash>0||(e.st==='aim'&&Math.floor(time*16)%2))};
/* 모래 잠복충: 모래 속으로 다가와 발밑에서 솟는다. 솟아 있을 때만 맞는다 */
ENEMY_AI.lurker=(e,dt,c)=>{if(!e.st)e.st='under';
  if(e.st==='under'){e.noTouch=true;if(c.chase){moveBody(e,c.dx/c.d*64*dt,c.dy/c.d*64*dt,5,3,false);if(Math.random()<0.5)PARTS.push({x:e.x+rand(-5,5),y:e.y,vx:rand(-15,15),vy:rand(-25,-5),life:0.4,max:0.4,col:'#dcc084',sz:1});if(c.d<13){e.st='rise';e.st_t=0.6}}return true}
  if(e.st==='rise'){e.noTouch=true;e.st_t-=dt;if(e.st_t<=0){e.st='out';e.st_t=2.4;sfx('burst');shake=Math.max(shake,2);ring(e.x,e.y,14,'#dcc084',90);if(Math.hypot(P.x-e.x,P.y-e.y)<20)hurtPlayer(Math.round(e.atk*1.3),e.x,e.y)}return true}
  e.noTouch=false;e.st_t-=dt;moveBody(e,c.kx,c.ky,5,3,false);if(e.st_t<=0)e.st='under';return true};
ENEMY_HIT.lurker=e=>{if(e.st==='out')return true;tip('lurkTip','모래 속에 있을 때는 닿지 않는다! 솟아오른 직후를 노리자');return false};
ENEMY_DRAW.lurker=e=>{const x=Math.round(e.x-7-cam.x),y=Math.round(e.y-cam.y);
  if(e.st==='out'){lit(LURK,x,y-17,e.flash>0);return}
  ctx.drawImage(MOUND,x+(e.st==='rise'?Math.round(rand(-1,1)):0),y-5);if(e.st==='rise'){ctx.fillStyle=Math.floor(time*14)%2?'#ffb44a':'#8a5a2a';for(let a=0;a<6.28;a+=0.35)ctx.fillRect(Math.round(e.x-cam.x+Math.cos(a)*18),Math.round(e.y-cam.y+Math.sin(a)*11),1,1)}};
/* 풍뎅이: 단단한 등딱지. 돌진을 피하면 지쳐서 빈틈이 생긴다 */
ENEMY_AI.beetle=(e,dt,c)=>{e.cd-=dt;
  if(e.st==='aim'){e.st_t-=dt;moveBody(e,c.kx,c.ky,5,3,false);if(e.st_t<=0){e.st='charge';e.st_t=1.1;sfx('dash')}return true}
  if(e.st==='charge'){e.st_t-=dt;const ox=e.x,oy=e.y;moveBody(e,e.ldx*165*dt,e.ldy*165*dt,5,3,false);const stuck=Math.hypot(e.x-ox,e.y-oy)<0.4;
    if(stuck||e.st_t<=0){e.st='tired';e.st_t=stuck?2.4:1.3;e.flip=stuck;if(stuck){shake=Math.max(shake,2);sfx('thud')}}return true}
  if(e.st==='tired'){e.st_t-=dt;moveBody(e,c.kx,c.ky,5,3,false);if(e.st_t<=0){e.st='';e.flip=false;e.cd=rand(1,1.8)}return true}
  if(c.chase&&c.d<110&&e.cd<=0){e.st='aim';e.st_t=0.45;e.ldx=c.dx/c.d;e.ldy=c.dy/c.d;e.fx=c.dx>0?1:-1;return true}
  return false};
ENEMY_HIT.beetle=(e,r,dx,dy)=>{if(e.st==='tired'||e.stun>0){if(e.flip)r.d=Math.round(r.d*1.5);return true}e.kx=dx*60;e.ky=dy*60;clink(e);tip('beetTip','등딱지에 막혔다! 돌진을 피해서 지치게 만들자. 벽에 박으면 뒤집힌다');return false};
ENEMY_DRAW.beetle=e=>{const x=Math.round(e.x-7-cam.x),y=Math.round(e.y-9-cam.y);shadow(e.x,e.y,10);
  if(e.st==='tired'&&e.flip){lit(BEETF,x,y+Math.round(Math.sin(time*18)),e.flash>0);return}
  lit((e.fx>0?BEET:BEETL)[e.st==='tired'?0:Math.floor(e.t*(e.st==='charge'?18:8))%2],x+(e.st==='aim'?Math.round(rand(-1,1)):0),y,e.flash>0||(e.st==='aim'&&Math.floor(time*16)%2))};
/* 벼룩: 높이 뛰어올라 발밑으로 떨어진다. 공중에서는 맞지 않는다 */
ENEMY_AI.flea=(e,dt,c)=>{
  if(e.st==='air'){e.noTouch=true;e.st_t-=dt;const k=clamp(1-e.st_t/0.7,0,1);e.x=e.sx+(e.gx-e.sx)*k;e.y=e.sy+(e.gy-e.sy)*k;e.h=Math.sin(k*Math.PI)*24;
    if(k>=1){e.st='';e.h=0;e.cd=rand(0.9,1.5);if(solidAt(e.x,e.y-3)){e.x=e.sx;e.y=e.sy}else if(Math.hypot(P.x-e.x,P.y-e.y)<12)hurtPlayer(e.atk,e.x,e.y)}return true}
  e.noTouch=false;e.cd-=dt;moveBody(e,c.kx,c.ky,4,3,false);
  if(c.chase&&c.d<130&&e.cd<=0){e.st='air';e.st_t=0.7;e.sx=e.x;e.sy=e.y;e.gx=P.x+rand(-8,8);e.gy=P.y+rand(-6,6);e.fx=c.dx>0?1:-1}
  return true};
ENEMY_HIT.flea=e=>e.st!=='air';
ENEMY_DRAW.flea=e=>{const h=e.h||0;if(e.st==='air'){ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(Math.round(e.gx-3-cam.x),Math.round(e.gy-1-cam.y),6,2)}else shadow(e.x,e.y,6);
  lit(FLEA,Math.round(e.x-4-cam.x),Math.round(e.y-8-h-cam.y),e.flash>0)};
/* 재 도깨비불: 거리를 두고 떠다니며 네 방향으로 재를 쏜다 */
ENEMY_AI.wisp=(e,dt,c)=>{e.shootT-=dt;
  if(c.chase){const s=c.d<56?-40:(c.d>96?40:0),o=e.orb||(e.orb=Math.random()<0.5?1:-1);moveBody(e,(c.dx/c.d*s-c.dy/c.d*22*o)*dt+c.kx,(c.dy/c.d*s+c.dx/c.d*22*o)*dt+c.ky,4,3,false);
    if(e.shootT<=0&&c.d<170){e.shootT=2.6;e.alt=!e.alt;e.glow=0.3;for(let k=0;k<4;k++){const a=k*1.5708+(e.alt?0.7854:0);DPROJ.push({x:e.x,y:e.y-10,vx:Math.cos(a)*72,vy:Math.sin(a)*72,life:2.4,dmg:e.atk})}sfx('spore')}
    return true}
  return false};
ENEMY_DRAW.wisp=e=>{const x=Math.round(e.x-cam.x),y=Math.round(e.y-12-cam.y+Math.sin(e.t*3)*2);if(e.glow>0)e.glow-=0.016;shadow(e.x,e.y,6);
  const hot=e.flash>0||e.glow>0||(e.shootT<0.45&&Math.floor(time*16)%2);ctx.fillStyle='#3a3444';ctx.fillRect(x-4,y-3,8,7);ctx.fillRect(x-3,y-4,6,9);ctx.fillStyle=hot?'#fff2b0':'#8a8490';ctx.fillRect(x-3,y-3,6,6);
  ctx.fillStyle=hot?'#ffffff':'#c8b8e8';ctx.fillRect(x-1,y-1,2,2);ctx.fillStyle='#6a6470';for(let k=0;k<3;k++)ctx.fillRect(x-2+k*2,y-6-Math.floor((e.t*6+k*2)%4),1,1)};
/* 별 석상: 가까이 가면 깨어난다. 내려찍기 전에 바닥이 빛난다 */
ENEMY_AI.sentinel=(e,dt,c)=>{
  if(!e.awake){e.noTouch=true;if(c.d<46){e.awake=1;e.st='wake';e.st_t=0.7;sfx('thud');shake=Math.max(shake,2);tip('sentTip','석상이 깨어났다! 바닥이 빛나면 원 밖으로 물러나자')}return true}
  if(e.st==='wake'){e.st_t-=dt;if(e.st_t<=0)e.st='';return true}
  if(e.st==='slamW'){e.st_t-=dt;moveBody(e,c.kx*0.3,c.ky*0.3,5,3,false);if(e.st_t<=0){if(Math.hypot(P.x-e.x,P.y-e.y)<30)hurtPlayer(Math.round(e.atk*1.4),e.x,e.y);shake=Math.max(shake,4);sfx('slam');ring(e.x,e.y,20,'#c8ccff');e.st='rest';e.st_t=1.4}return true}
  if(e.st==='rest'){e.st_t-=dt;moveBody(e,c.kx*0.3,c.ky*0.3,5,3,false);if(e.st_t<=0){e.st='';e.cd=rand(0.8,1.4)}return true}
  e.noTouch=false;e.cd-=dt;if(c.chase&&c.d<26&&e.cd<=0){e.st='slamW';e.st_t=0.8;return true}return false};
ENEMY_HIT.sentinel=(e,r,dx,dy)=>{if(!e.awake){clink(e);return false}e.kx=0;e.ky=0;return true};
ENEMY_DRAW.sentinel=e=>{const x=Math.round(e.x-7-cam.x),y=Math.round(e.y-21-cam.y);shadow(e.x,e.y,12);
  if(e.st==='slamW'){const k=1-e.st_t/0.8;ctx.fillStyle=Math.floor(time*12)%2?'#ffe08a':'#8a88c0';for(let a=0;a<6.28;a+=0.16)ctx.fillRect(Math.round(e.x-cam.x+Math.cos(a)*30),Math.round(e.y-cam.y+Math.sin(a)*19),1,1);ctx.fillStyle=`rgba(200,204,255,${0.1+k*0.25})`;ctx.beginPath();ctx.ellipse(e.x-cam.x,e.y-cam.y,30*k,19*k,0,0,6.283);ctx.fill()}
  lit(SENT[e.awake?1:0],x+(e.st==='wake'?Math.round(rand(-1,1)):0),y-(e.st==='slamW'?2:0),e.flash>0)};
/* 등장 장소 */
{const d0=AR.desert.spawn;AR.desert.spawn=(x,y,tx,ty)=>{const r=d0(x,y,tx,ty);if(r&&r[0]==='scorp'&&Math.random()<0.5)r[0]=Math.random()<0.5?'vulture':'lurker';return r};
 const t0=AR.tiny.spawn;AR.tiny.spawn=(x,y,tx,ty)=>{const r=t0(x,y,tx,ty);if(r&&r[0]==='ant'){const q=Math.random();if(q<0.24)r[0]='beetle';else if(q<0.46)r[0]='flea'}return r};
 BEACONS[B4].types.push('vulture');BEACONS[B4+1].types.push('lurker');BEACONS[B4+2].types.push('vulture','lurker')}

/* =========================================================
   3. 보스 새 공격: 바닥 경고 구역(원 · 고리 · 띠 · 퍼지는 물결)
   ========================================================= */
let ZN=[];
const zone=o=>ZN.push(Object.assign({t:0,warn:0.9,dmg:14,hit:false},o));
const inZone=z=>{const dx=P.x-z.x,dy=(P.y-z.y)/0.65,d=Math.hypot(dx,dy);return z.k==='rect'?(P.x>z.x&&P.x<z.x+z.w&&P.y>z.y&&P.y<z.y+z.h):(d<z.r&&d>=(z.r0||0))};
function updZones(dt){
  for(const z of ZN){z.t+=dt;
    if(z.k==='wave'){if(z.t<0)continue;z.r=z.t*z.sp;const d=Math.hypot(P.x-z.x,(P.y-z.y)/0.65);if(!z.hit&&Math.abs(d-z.r)<6){z.hit=true;hurtPlayer(z.dmg,z.x,z.y);if(P.inv<0.85)z.hit=false}if(z.r>z.max)z.dead=true;continue}
    if(!z.hit&&z.t>=z.warn){z.hit=true;if(inZone(z))hurtPlayer(z.dmg,z.k==='rect'?P.x:z.x,z.k==='rect'?P.y+20:z.y);shake=Math.max(shake,4);sfx('slam');
      if(z.k==='rect')for(let i=0;i<24;i++)PARTS.push({x:z.x+Math.random()*z.w,y:z.y+Math.random()*z.h,vx:rand(-20,20),vy:rand(-70,-20),life:0.45,max:0.45,col:z.col||'#8a8490',sz:2});else ring(z.x,z.y,24,z.col||'#ffb44a',z.r*2.4)}
    if(z.t>z.warn+0.25)z.dead=true}
  ZN=ZN.filter(z=>!z.dead);
}
function drawZones(){
  for(const z of ZN){if(z.t<0)continue;const x=z.x-cam.x,y=z.y-cam.y,bl=Math.floor(time*12)%2,k=clamp(z.t/z.warn,0,1);
    if(z.k==='wave'){ctx.fillStyle=bl?'#ffe08a':'#c06a2a';for(let a=0;a<6.283;a+=3/Math.max(8,z.r))for(const w of[0,2])ctx.fillRect(Math.round(x+Math.cos(a)*(z.r-w)),Math.round(y+Math.sin(a)*(z.r-w)*0.65),2,2);continue}
    if(z.hit){ctx.fillStyle='rgba(255,240,200,0.5)';if(z.k==='rect')ctx.fillRect(x,y,z.w,z.h);continue}
    if(z.k==='rect'){ctx.fillStyle=`rgba(200,80,60,${0.1+k*0.22})`;ctx.fillRect(Math.round(x),Math.round(y),z.w,z.h);ctx.fillStyle=bl?'#ffb44a':'#8a3a2a';ctx.fillRect(Math.round(x),Math.round(y),z.w,1);ctx.fillRect(Math.round(x),Math.round(y+z.h-1),z.w,1);ctx.fillRect(Math.round(x),Math.round(y),1,z.h);ctx.fillRect(Math.round(x+z.w-1),Math.round(y),1,z.h);continue}
    ctx.fillStyle=`rgba(200,80,60,${0.1+k*0.22})`;ctx.beginPath();ctx.ellipse(x,y,z.r,z.r*0.65,0,0,6.283);if(z.r0)ctx.ellipse(x,y,z.r0,z.r0*0.65,0,0,6.283,true);ctx.fill('evenodd');
    ctx.fillStyle=bl?'#ffb44a':'#8a3a2a';for(const r of z.r0?[z.r,z.r0]:[z.r])for(let a=0;a<6.283;a+=3/r)ctx.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*0.65),1,1)}
}
EXT.sorted.push(D=>{if(ZN.length)D.push({y:-1e5,f:drawZones})});
const hazLine=(ang,n,gap,delay)=>{for(let k=-n;k<=n;k++){const hx=P.x+Math.cos(ang)*k*gap,hy=P.y+Math.sin(ang)*k*gap;if(!solidAt(hx,hy))HAZ.push({x:hx,y:hy,t:-(k+n)*delay,warn:0.85,dur:0.35,hit:false})}};
/* idle: 이 상태일 때만 새 공격을 시작한다 · cast: 시전(멈춰 서는 시간을 돌려준다) */
const BX={
  scare:{idle:['move'],first:7,cast:b=>{zone({k:'circ',x:b.x,y:b.y,r:46,warn:0.85,dmg:14,col:'#b06ae0'});if(b.phase===2)zone({k:'circ',x:b.x,y:b.y,r:96,r0:46,t:-0.75,warn:1,dmg:14,col:'#b06ae0'});toast(b.phase===2?'허수아비가 낫을 휘두른다! 물러났다가 곧바로 파고들자':'허수아비가 낫을 크게 휘두른다!');return b.phase===2?2:1}},
  root:{idle:['idle'],first:8,cast:b=>{const a=Math.random()*3.14;hazLine(a,6,13,0.06);if(b.phase===2)hazLine(a+1.57,6,13,0.06);return 0.6}},
  mole:{idle:['idle'],first:8,cast:b=>{zone({k:'wave',x:b.x,y:b.y,sp:78,max:170,dmg:14});if(b.phase===2)zone({k:'wave',x:b.x,y:b.y,sp:78,max:170,dmg:14,t:-0.7});shake=5;sfx('quake');toast('땅울림이 퍼져 온다! 구르기(S)로 뚫고 지나가자');return b.phase===2?1.6:1}},
  whale:{idle:['swim'],first:9,cast:b=>{const n=5+b.phase;b.xq=[];for(let i=0;i<n;i++)b.xq.push({at:i*0.32,fn:()=>{HAZ.push({x:P.x,y:P.y,t:0,warn:0.7,dur:0.35,hit:false,dmg:13});sfx('tele')}});return n*0.32+0.3}},
  ratking:{idle:['idle'],first:7,cast:b=>{const X0=(RX0+2)*16,w=44*16,safe=Math.random()<0.5?-1:1;for(const o of[-safe,0])zone({k:'rect',x:X0,y:P.y-15+o*30,w,h:30,warn:1.1,dmg:13,col:'#6a5a90'});if(b.phase===2)zone({k:'rect',x:X0,y:P.y-15+safe*60,w,h:30,warn:1.1,dmg:13,col:'#6a5a90'});sfx('squeak');toast('그림자 쥐 떼가 줄지어 달려온다! 빈 줄로 피하자');return 1.3}},
  orban:{idle:['idle'],first:7,cast:b=>{const wall=(down)=>{const gap=3+Math.floor(Math.random()*18);for(let x=2;x<=23;x++)if(x<gap||x>gap+2)DPROJ.push({x:(rox(2)+x)*16+8,y:(down?2.5:15.5)*16,vx:0,vy:down?62:-62,life:3.4,dmg:12});sfx('spore')};
    wall(true);b.xq=b.phase===2?[{at:1.5,fn:()=>wall(false)}]:[];toast('재의 벽이 밀려온다! 빈틈으로 빠져나가자');return b.phase===2?1.7:0.7}},
  ashgiant:{idle:['idle'],first:8,cast:b=>{const R=rox(2)*16,strip=t=>zone({k:'rect',x:clamp(P.x-36,R+16,R+25*16-72),y:20,w:72,h:15*16,t,warn:1.35,dmg:20});strip(0);b.xq=b.phase===2?[{at:1.2,fn:()=>strip(0)}]:[];sfx('tele');return b.phase===2?1.6:0.8}},
};
{const u0=updBoss;updBoss=function(dt){const b=BOSS,X=BX[b.kind];
  if(X&&b.hp>0){
    if(b.xs>0){if(b.flash>0)b.flash-=dt;if(b.stun>0)b.stun-=dt;b.xt+=dt;if(b.xq)for(const q of b.xq)if(!q.done&&b.xt>=q.at){q.done=true;q.fn()}b.xs-=dt;if(b.xs<=0){b.xs=0;b.xq=null;b.xcd=rand(7,10)/(b.phase>=2?1.3:1)}return}
    b.xcd=(b.xcd===undefined?X.first:b.xcd)-dt;
    if(b.xcd<=0&&X.idle.includes(b.st)&&!(b.stun>0)){b.xt=0;b.xs=X.cast(b);return}}
  u0(dt)}}
EXT.update.push(dt=>{if(!BOSS&&ZN.length)ZN=[];if(ZN.length)updZones(dt)});
EXT.die.push(()=>{ZN=[]});

/* =========================================================
   4. 새 방식의 부탁: 달리기 시합 · 길 잃은 정령 · 수수께끼 · 별자리
   ========================================================= */
const Q={};let race=null,pet=null,petHp=0;
const RACE_T=32;
const mkq=o=>{SIDEQ.push(o);Q[o.id]=o};
mkq({id:'race',giver:'kid',min:2,title:'콩과 달리기 시합',item:'race_ok',
  offer:[['kid','등불지기님, 저랑 시합해요! 마을에 깃발 세 개를 꽂아 놨어요.'],['kid','제 옆 출발 깃발을 밟으면 시작이에요. 서른두 번 셀 동안 깃발을 차례대로 다 밟고 돌아오면 등불지기님 승리!']],
  hint:[['kid','출발 깃발은 바로 제 옆에 있어요! 구르기를 쓰면 더 빨라요.']],
  done:[['kid','우와, 진짜 빠르다! 제가 졌어요. 이건 제가 모은 용돈이에요!']],reward:{coins:60,potions:1}});
mkq({id:'escort',giver:'herb',min:9,title:'길 잃은 아기 정령',item:'escort_ok',
  offer:[['herb','아기 포자 정령 하나가 무리에서 떨어져 숲 동남쪽 깊은 곳에서 울고 있다네.'],['herb','착한 녀석이라 등불을 보면 따라올 걸세. 다만 겁이 많아서, 자네가 다치면 놀라 도망갈 게야. 이 야영지까지 데려와 주게.']],
  hint:[['herb','아기 정령은 숲 동남쪽에 있다네. 다치지 않게 조심해서 데려오게.']],
  done:[['herb','오오, 무사히 왔구먼! 녀석이 자네 등불이 마음에 든 모양이야. 고맙네, 이건 답례일세.']],reward:{coins:90,potions:2}});
mkq({id:'quiz',giver:'grandpa',min:14,title:'쇠돌의 수수께끼',item:'quiz_ok',
  offer:[['grandpa','광부들은 갱도에서 심심하면 수수께끼를 냈지. 자네가 걸어온 길을 얼마나 눈여겨봤는지 볼까?'],['grandpa','준비되면 다시 말을 걸게. 세 문제를 모두 맞히면 상을 주지.']],
  hint:[['grandpa','수수께끼는 세 문제라네.']],
  done:[['grandpa','허허, 다 맞혔구먼! 눈 밝은 등불지기야. 약속한 상일세.']],reward:{coins:120,potions:1},
  talk(){const QS=[['별등이 꺼진 지 몇 해가 지났을까?',['서른 해','백 해','천 해'],1],['내 손자 모루의 망치로 부술 수 있는 것은?',['수정 기둥','금 간 벽','무쇠 문'],1],['울림뿌리의 단단한 껍질을 벗긴 것은?',['등불 섬광','화살','망치'],0]];
    const ask=i=>{if(i>=QS.length)return say(Q.quiz.done,()=>{S.picks.quiz_ok=1;sqReward(Q.quiz)});const[q,as,ok]=QS[i];
      choose(`수수께끼 ${i+1} / 3`,q,as.map((a,j)=>({label:a,fn:()=>j===ok?(sfx('coin'),say([['grandpa','옳거니!']],()=>ask(i+1))):say([['grandpa','허허, 틀렸네. 다시 생각해 보고 오게나.']])})))};
    say([['grandpa','자, 수수께끼를 내겠네.']],()=>ask(0))}});
mkq({id:'stars',giver:'harin',min:20,title:'사막의 별자리',item:'stars_ok',
  offer:[['harin','사막의 밤하늘에는 옛 별등지기들이 길잡이로 삼던 별자리가 셋 있단다.'],['harin','북서쪽 언덕, 남쪽 뼈 무덤, 동쪽 옛길. 밤에 그 세 곳에 서서 하늘을 올려다보고 오너라. 낮에는 보이지 않는단다.']],
  hint:[['harin','별자리는 밤에만 보인다. 북서쪽 언덕, 남쪽 뼈 무덤, 동쪽 옛길이다.']],
  done:[['harin','세 별자리를 다 보았구나. 이제 너도 사막에서 길을 잃지 않을 게다. 받아 두거라.']],reward:{coins:130,potions:2}});
let RACE_P=[],LOST=null,STARS=[];
EXT.build.push(()=>{const f=(x,y)=>{const[a,b]=findFree(x,y);return{x:a,y:b}};
  RACE_P=[f(22,48),f(9,39),f(28,56),f(9,57)];LOST=f(140,40);STARS=[f(240,14),f(272,47),f(300,31)]});
const near=(p,r)=>Math.hypot(P.x-p.x,P.y-p.y)<r;
const sparkle=(p,col)=>{for(let k=0;k<12;k++)PARTS.push({x:p.x,y:p.y-4,vx:rand(-30,30),vy:rand(-50,-10),life:0.6,max:0.6,col,sz:1})};
EXT.update.push(dt=>{
  if(mode!=='play')return;
  /* 달리기 */
  if(S.sq.race===1&&!S.picks.race_ok&&curArea.id==='over'){
    if(!race){if(near(RACE_P[0],10)){race={i:1,t:RACE_T};sfx('chapter');toast('시작! 깃발을 차례대로 밟고 돌아오자','gold')}}
    else{race.t-=dt;const tg=RACE_P[race.i%4];
      if(near(tg,12)){sparkle(tg,'#ffd36b');sfx('coin');race.i++;if(race.i>4){S.picks.race_ok=1;race=null;sfx('lvl');toast('시합 승리! 콩에게 말을 걸자','gold');saveGame()}}
      else if(race.t<=0){race=null;sfx('hurt');toast('시간이 다 됐다… 출발 깃발을 밟으면 다시 도전할 수 있다')}}}
  else race=null;
  /* 아기 정령 */
  if(S.sq.escort===1&&!S.picks.escort_ok&&curArea.id==='over'){
    if(!pet){if(near(LOST,22)){pet={x:LOST.x,y:LOST.y};petHp=S.hp;sfx('pick');toast('아기 정령이 등불을 보고 따라온다. 다치지 않게 야영지까지 데려가자','good')}}
    else{if(S.hp<petHp-0.5){pet=null;sfx('hurt');toast('아기 정령이 놀라서 숲 속으로 달아났다… 다시 찾으러 가자');return}petHp=S.hp;
      const dx=P.x-pet.x,dy=P.y-10-pet.y,d=Math.hypot(dx,dy);if(d>18){const s=Math.min(110,d*3);pet.x+=dx/d*s*dt;pet.y+=dy/d*s*dt}
      if(Math.hypot(P.x-CAMP.x*16,P.y-CAMP.y*16)<56){S.picks.escort_ok=1;pet=null;sfx('lvl');toast('아기 정령이 무리 곁으로 돌아갔다! 버들에게 말을 걸자','gold');saveGame()}}}
  else pet=null;
  /* 별자리 */
  if(S.sq.stars===1&&!S.picks.stars_ok&&curArea.id==='desert'&&nightK()>0.5){
    STARS.forEach((p,i)=>{if(!((S.flags.stars||0)>>i&1)&&near(p,14)){S.flags.stars=(S.flags.stars||0)|1<<i;sparkle(p,'#c8ccff');sfx('beaconLit');const n=[0,1,2].filter(j=>S.flags.stars>>j&1).length;
      toast(`${['등불자리','고래자리','부엉이자리'][i]}를 찾았다 (${n} / 3)`,'gold');if(n===3){S.picks.stars_ok=1;toast('세 별자리를 모두 보았다! 하린에게 돌아가자','gold')}saveGame()}})}
});
EXT.sorted.push(D=>{
  const flag=(p,col,on)=>D.push({y:p.y,f:()=>{const x=Math.round(p.x-cam.x),y=Math.round(p.y-cam.y);ctx.fillStyle='#5a3e26';ctx.fillRect(x,y-14,1,14);ctx.fillStyle=on?col:'#6a6470';const w=Math.round(Math.sin(time*6)*1);ctx.fillRect(x+1,y-14,6+w,2);ctx.fillRect(x+1,y-12,4+w,2);ctx.fillRect(x+1,y-10,2,1)}});
  if(curArea.id==='over'&&S.sq.race===1&&!S.picks.race_ok){flag(RACE_P[0],'#ff6a5a',!race||race.i===4);for(let i=1;i<4;i++)flag(RACE_P[i],'#ffd36b',race&&race.i===i)}
  if(curArea.id==='over'&&S.sq.escort===1&&!S.picks.escort_ok){const q=pet||LOST;D.push({y:q.y+12,f:()=>ctx.drawImage(SPORE,Math.round(q.x-SPORE.width/2-cam.x),Math.round(q.y-SPORE.height+Math.sin(time*4)*2-cam.y))})}
  if(curArea.id==='desert'&&S.sq.stars===1&&!S.picks.stars_ok&&nightK()>0.5)STARS.forEach((p,i)=>{if((S.flags.stars||0)>>i&1)return;D.push({y:p.y,f:()=>{const x=Math.round(p.x-cam.x),y=Math.round(p.y-8-cam.y);for(let k=0;k<5;k++){const a=time*1.5+k*1.256;ctx.fillStyle=k%2?'#ffffff':'#c8ccff';ctx.fillRect(Math.round(x+Math.cos(a)*7),Math.round(y+Math.sin(a)*4),1,1)}ctx.fillStyle='#fff2b0';ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3)}})});
});
EXT.lights.push(L=>{if(pet)L.push([pet.x,pet.y-6,22]);else if(LOST&&S.sq.escort===1&&!S.picks.escort_ok&&curArea.id==='over')L.push([LOST.x,LOST.y-6,22]);
  if(curArea.id==='desert'&&S.sq.stars===1&&!S.picks.stars_ok&&nightK()>0.5)STARS.forEach((p,i)=>{if(!((S.flags.stars||0)>>i&1))L.push([p.x,p.y-8,20])})});
EXT.hud.push(parts=>{if(race)parts.push(`시합 ${Math.max(0,Math.ceil(race.t))}초 · 깃발 ${Math.min(3,race.i-1)}/3`)});
EXT.die.push(()=>{race=null;pet=null});

/* =========================================================
   5. 음량 조절 (쉬는 화면)
   ========================================================= */
{const st_=document.createElement('style');st_.textContent='.vol{display:grid;grid-template-columns:auto 1fr auto;gap:6px 10px;align-items:center;margin:10px 0 4px;font-family:var(--f-text);font-size:14px;color:var(--muted)}.vol input{width:100%;accent-color:var(--accent);min-height:24px}.vol b{color:var(--ink);font-weight:400;min-width:2.4em;text-align:right}';document.head.appendChild(st_);
 const d=document.createElement('div');d.className='vol';d.innerHTML='<label for="mVol">음악 음량</label><input id="mVol" type="range" min="0" max="100" step="5"><b id="mVolN"></b><label for="sVol">효과음 음량</label><input id="sVol" type="range" min="0" max="100" step="5"><b id="sVolN"></b>';
 const row=$('musicBtn').parentNode;row.parentNode.insertBefore(d,row);
 const sync=()=>{const m=Math.round((S.mvol===undefined?1:S.mvol)*100),s=Math.round((S.svol===undefined?1:S.svol)*100);$('mVol').value=m;$('sVol').value=s;$('mVolN').textContent=m;$('sVolN').textContent=s};
 $('mVol').addEventListener('input',e=>{S.mvol=e.target.value/100;sync()});$('mVol').addEventListener('change',()=>saveGame());
 $('sVol').addEventListener('input',e=>{S.svol=e.target.value/100;sync()});$('sVol').addEventListener('change',()=>{sfx('pick');saveGame()});
 for(const id of['mVol','sVol'])$(id).addEventListener('keydown',e=>{if(e.key.startsWith('Arrow'))e.stopPropagation()});
 const tp0=togglePause;togglePause=function(){tp0();sync()};EXT.load.push(sync)}
})();

/* =========================================================
   6. 막간 · 에필로그 전용 소품: 장면마다 고유한 그림 요소를 더한다
   ========================================================= */
const SHOTPROP=(()=>{
  const R=(x,c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
  const E=(x,c,cx,cy,rx,ry)=>{x.fillStyle=c;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,6.3);x.fill()};
  const G=(x,cx,cy,r,col)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.globalCompositeOperation='lighter';x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);x.globalCompositeOperation='source-over'};
  const room=(x,W,H,wall,floor)=>{R(x,wall[0],0,0,W,H*0.66);for(let j=0;j<H*0.66;j+=9)for(let i=(j/9%2)*9;i<W;i+=18)R(x,wall[1],i,j,17,8);R(x,floor[0],0,H*0.66,W,H*0.34);for(let i=0;i<W;i+=24)R(x,floor[1],i,H*0.66,1,H*0.34);R(x,floor[1],0,H*0.66,W,2)};
  return{
    rays(x,W,H,o){const cx=W*(o.rx||o.bx||0.5),cy=H*(o.ry||0.6);x.globalCompositeOperation='lighter';for(let k=0;k<9;k++){const a=-Math.PI/2+(k-4)*0.36;x.fillStyle=`rgba(255,214,130,${k%2?0.1:0.16})`;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a-0.07)*W,cy+Math.sin(a-0.07)*W);x.lineTo(cx+Math.cos(a+0.07)*W,cy+Math.sin(a+0.07)*W);x.fill()}x.globalCompositeOperation='source-over'},
    forge(x,W,H){room(x,W,H,['#2a2030','#33283a'],['#3a2e2a','#2a201e']);
      R(x,'#4a4252',W*0.62,H*0.18,W*0.3,H*0.5);R(x,'#5e5668',W*0.6,H*0.14,W*0.34,5);R(x,'#3a3440',W*0.72,0,W*0.1,H*0.16);E(x,'#1a1014',W*0.77,H*0.52,W*0.09,H*0.15);E(x,'#e0603a',W*0.77,H*0.56,W*0.07,H*0.1);E(x,'#ffb44a',W*0.77,H*0.58,W*0.05,H*0.07);E(x,'#fff2b0',W*0.77,H*0.6,W*0.025,H*0.04);G(x,W*0.77,H*0.55,H*0.6,'rgba(255,150,60,0.55)');
      R(x,'#8a8496',W*0.22,H*0.6,W*0.2,5);R(x,'#6a6476',W*0.18,H*0.6,W*0.06,3);R(x,'#5a5466',W*0.28,H*0.65,W*0.08,H*0.1);R(x,'#6a6476',W*0.24,H*0.74,W*0.16,5);R(x,'#7a5634',W*0.3,H*0.5,2,H*0.1);R(x,'#a8a4bc',W*0.27,H*0.47,W*0.06,5);
      for(let k=0;k<14;k++)R(x,k%2?'#fff2b0':'#ffb44a',W*(0.3+h2(k,1,321)*0.2),H*(0.3+h2(k,2,321)*0.28),1,1);for(const u of[0.08,0.13,0.5])R(x,'#55516a',W*u,H*0.1,2,H*0.16)},
    bedroom(x,W,H,o){room(x,W,H,['#2a2438','#322b42'],['#4a3626','#3a2a1e']);
      const wx=W*0.1,wy=H*0.1,ww=W*0.26,wh=H*0.36;R(x,'#5a3e26',wx-3,wy-3,ww+6,wh+6);R(x,'#0b0a1c',wx,wy,ww,wh);for(let k=0;k<26;k++)R(x,h2(k,3,322)>0.6?'#ffffff':'#8a88c0',wx+h2(k,1,322)*ww,wy+h2(k,2,322)*wh,1,1);R(x,'#5a3e26',wx+ww/2-1,wy,2,wh);R(x,'#5a3e26',wx,wy+wh/2-1,ww,2);G(x,wx+ww/2,wy+wh/2,H*0.4,'rgba(120,130,220,0.25)');
      const bx=W*0.46,by=H*0.56;R(x,'#5a3e26',bx-4,by-14,6,H*0.3);R(x,'#5a3e26',bx,by+12,W*0.48,6);R(x,'#3a2a1e',bx+W*0.46,by-2,5,H*0.2);R(x,'#e8e0d0',bx+2,by-4,W*0.12,10);
      E(x,'#f0c8a0',bx+W*0.07,by-5,7,6);R(x,'#e8e8f0',bx+W*0.03,by-11,W*0.08,4);E(x,'#e8e8f0',bx+W*0.075,by+2,6,5);R(x,'#3a2a1e',bx+W*0.05,by-5,3,1);R(x,'#3a2a1e',bx+W*0.08,by-5,3,1);
      x.fillStyle='#4a5a8a';x.beginPath();x.ellipse(bx+W*0.27,by+6,W*0.19,11,0,Math.PI,0);x.fill();R(x,'#4a5a8a',bx+W*0.08,by+5,W*0.38,8);R(x,'#6a7ab0',bx+W*0.08,by+5,W*0.38,2);
      const tx=W*0.34,ty=H*0.6;R(x,'#5a3e26',tx,ty,W*0.08,4);R(x,'#3a2a1e',tx+2,ty+4,3,H*0.14);R(x,'#3a2a1e',tx+W*0.08-5,ty+4,3,H*0.14);
      if(o.dew){R(x,'#c8ccff',tx+5,ty-9,5,9);R(x,'#8ae0f4',tx+6,ty-6,3,5);R(x,'#e8fcff',tx+6,ty-11,3,2);G(x,tx+7,ty-5,H*0.3,'rgba(140,220,255,0.5)')}else{R(x,'#e8e0d0',tx+6,ty-8,3,8);R(x,'#ffb44a',tx+6,ty-12,3,4);R(x,'#fff2b0',tx+7,ty-11,1,2);G(x,tx+7,ty-10,H*0.34,'rgba(255,190,100,0.45)')}},
    moon(x,W,H){E(x,'#e8e4d0',W*0.76,H*0.24,H*0.15,H*0.15);E(x,'#c8c4b0',W*0.74,H*0.2,H*0.03,H*0.03);E(x,'#c8c4b0',W*0.79,H*0.28,H*0.04,H*0.035);G(x,W*0.76,H*0.24,H*0.5,'rgba(200,210,255,0.3)');
      x.fillStyle='#07060c';x.beginPath();x.moveTo(0,H);x.lineTo(0,H*0.7);x.quadraticCurveTo(W*0.3,H*0.52,W*0.62,H*0.78);x.lineTo(W*0.7,H);x.fill()},
    molesleep(x,W,H){const cx=W*0.42,cy=H*0.74;E(x,'#3a3440',cx,cy,W*0.24,H*0.2);E(x,'#57505e',cx-4,cy-5,W*0.22,H*0.16);E(x,'#6e6676',cx-W*0.16,cy+2,W*0.08,H*0.09);E(x,'#e8a08a',cx-W*0.235,cy+4,4,3);
      R(x,'#1a1426',cx-W*0.17,cy-3,6,1);for(const[u,v]of[[0.02,0.1],[0.1,0.13],[0.17,0.1]])R(x,'#c8c0d8',cx+W*u,cy+H*v,5,3);
      for(let k=0;k<3;k++){const zx=cx-W*0.08+k*9,zy=cy-H*0.26-k*9,s=3+k;R(x,'#c8ccff',zx,zy,s,1);R(x,'#c8ccff',zx,zy+s-1,s,1);for(let i=0;i<s;i++)R(x,'#c8ccff',zx+s-1-i,zy+i,1,1)}
      const bx=W*0.74,by=H*0.66;R(x,'#5a3e26',bx,by,W*0.14,H*0.18);R(x,'#8f6640',bx,by,W*0.14,4);R(x,'#ffd36b',bx+W*0.06,by+7,4,5);G(x,bx+W*0.07,by+6,H*0.3,'rgba(255,214,110,0.4)')},
    cavemouth(x,W,H){const im=x.getImageData(0,0,W,H),d=im.data;for(let j=0;j<H;j++)for(let i=0;i<W;i++){const u=(i-W*0.56)/(W*0.36),v=(j-H*0.52)/(H*0.44),r=u*u+v*v+(h2(i>>2,j>>2,323)-0.5)*0.16;if(r>1){const k=(j*W+i)*4,n=h2(i>>1,j>>1,324)>0.7?10:0;d[k]=24+n;d[k+1]=18+n;d[k+2]=30+n}else if(r>0.9){const k=(j*W+i)*4;d[k]=90;d[k+1]=70;d[k+2]=80}}x.putImageData(im,0,0);G(x,W*0.56,H*0.5,H*0.7,'rgba(255,230,170,0.25)')},
    gate(x,W,H){const cx=W*0.5;R(x,'#120f26',cx-W*0.2,H*0.06,W*0.4,H*0.8);R(x,'#2a2648',cx-W*0.22,H*0.04,W*0.44,5);for(const s of[-1,1])R(x,'#3e3a66',cx+s*W*0.19-4,H*0.08,8,H*0.78);
      x.fillStyle='#05040c';x.beginPath();x.moveTo(cx-W*0.12,H*0.86);x.lineTo(cx-W*0.12,H*0.4);x.quadraticCurveTo(cx,H*0.16,cx+W*0.12,H*0.4);x.lineTo(cx+W*0.12,H*0.86);x.fill();R(x,'#2a2648',cx-1,H*0.3,2,H*0.56);
      for(let k=0;k<40;k++)R(x,k%3?'#6a6470':'#8a8490',cx+(h2(k,1,325)-0.5)*W*0.26,H*(0.3+h2(k,2,325)*0.56),1,1);for(let k=0;k<3;k++)R(x,k%2?'#3e3a66':'#55516a',cx-W*(0.16+k*0.03),H*(0.86+k*0.04),W*(0.32+k*0.06),5);G(x,cx,H*0.2,H*0.3,'rgba(120,130,220,0.2)')},
    shoe(x,W,H){x.fillStyle='#6a4a30';x.beginPath();x.moveTo(W*0.5,0);x.lineTo(W,0);x.lineTo(W,H*0.5);x.quadraticCurveTo(W*0.8,H*0.62,W*0.56,H*0.5);x.quadraticCurveTo(W*0.44,H*0.3,W*0.5,0);x.fill();
      x.fillStyle='#3a2a1e';x.beginPath();x.moveTo(W,H*0.5);x.quadraticCurveTo(W*0.8,H*0.62,W*0.56,H*0.5);x.lineTo(W*0.57,H*0.56);x.quadraticCurveTo(W*0.8,H*0.7,W,H*0.58);x.fill();for(let k=0;k<4;k++)R(x,'#e8e0d0',W*(0.62+k*0.07),H*(0.12+k*0.04),W*0.05,2);
      E(x,'rgba(0,0,0,0.35)',W*0.78,H*0.84,W*0.24,H*0.06)},
    flowers(x,W,H){for(let k=0;k<46;k++){const fx=h2(k,1,326)*W,fy=H*(0.8+h2(k,2,326)*0.18),c=['#ffd6f0','#fff2b0','#c8ccff','#ffb0c8'][k%4];R(x,'#3a7a44',fx,fy,1,3);R(x,c,fx-1,fy-1,3,1);R(x,c,fx,fy-2,1,3);R(x,'#ffd36b',fx,fy-1,1,1)}},
    sun(x,W,H){E(x,'#fffbe0',W*0.3,H*0.2,H*0.11,H*0.11);G(x,W*0.3,H*0.2,H*0.7,'rgba(255,250,210,0.5)');x.fillStyle='rgba(255,255,240,0.12)';x.fillRect(0,0,W,H)},
    confetti(x,W,H){for(let k=0;k<70;k++)R(x,['#ffd36b','#ff8a7a','#8ae0f4','#9be07a','#ffd6f0'][k%5],h2(k,1,327)*W,h2(k,2,327)*H*0.7,k%3?1:2,k%2?2:1)},
    lanterns(x,W,H){for(let k=0;k<12;k++){const lx=W*(0.05+k*0.08+h2(k,1,328)*0.03),ly=H*(0.46+h2(k,2,328)*0.3);R(x,'#ffd47a',lx,ly,2,3);R(x,'#5a3e26',lx,ly-2,2,2);G(x,lx+1,ly+1,H*0.12,'rgba(255,190,100,0.35)')}
      for(const[u,v]of[[0.03,0.9],[0.95,0.86],[0.9,0.94]]){R(x,'#ff4a5a',W*u,H*v,1,1);R(x,'#ff4a5a',W*u+3,H*v,1,1)}},
    milky(x,W,H){for(let k=0;k<260;k++){const t=h2(k,1,329),o=(h2(k,2,329)-0.5)*(h2(k,4,329))*H*0.34,sx=t*W,sy=H*0.5-t*H*0.44+o;if(sy<0||sy>H*0.6)continue;R(x,h2(k,3,329)>0.75?'#ffffff':(h2(k,3,329)>0.4?'#c8ccff':'#6a68a8'),sx,sy,1,1)}x.globalCompositeOperation='lighter';x.fillStyle='rgba(120,120,200,0.07)';x.beginPath();x.moveTo(0,H*0.36);x.lineTo(W,-H*0.08);x.lineTo(W,H*0.1);x.lineTo(0,H*0.6);x.fill();x.globalCompositeOperation='source-over'},
    dance(x,W,H,o){const cx=W*(o.dx||0.5),cy=H*0.8;for(let k=0;k<9;k++){const a=k/9*6.283,px=cx+Math.cos(a)*W*0.3,py=cy+Math.sin(a)*H*0.1-((k%2)*4);E(x,'#2e2448',px,py,5,4);R(x,'#2e2448',px-3,py-7,2,4);R(x,'#2e2448',px+2,py-7,2,4);R(x,'#ffe08a',px-2,py-1,1,1);R(x,'#ffe08a',px+1,py-1,1,1);G(x,px,py,10,'rgba(255,224,138,0.18)')}},
    well(x,W,H){const cx=W*0.5,by=H*0.84;R(x,'#77738a',cx-14,by-14,28,14);for(let k=0;k<4;k++)R(x,'#55516a',cx-14+k*7,by-14+(k%2)*7,7,1);R(x,'#5a3e26',cx-13,by-34,2,20);R(x,'#5a3e26',cx+11,by-34,2,20);x.fillStyle='#7a3428';x.beginPath();x.moveTo(cx-18,by-34);x.lineTo(cx,by-46);x.lineTo(cx+18,by-34);x.fill();R(x,'#c8b48a',cx,by-34,1,12);R(x,'#8f6640',cx-3,by-22,7,6);E(x,'#4a8ac0',cx,by-13,11,2)},
  };
})();
{const set=(k,i,o)=>Object.assign(SHOT_ART[k][i],o);
 set('c1',0,{props:['rays']});set('c1',1,{props:['forge']});set('c1',2,{props:['bedroom']});
 set('c2',0,{props:['flowers']});set('c2',1,{props:['moon'],beacon:null,shift:-30});
 set('c3',1,{props:['molesleep'],cast:[]});set('c3',2,{props:['cavemouth']});
 set('c4',1,{props:['milky']});
 set('c5',0,{props:['shoe']});set('c5',1,{props:['bedroom'],dew:1,cast:[]});set('c5',2,{props:['gate']});
 set(1,0,{props:['confetti']});set(1,1,{props:['sun']});set(1,2,{props:['flowers']});set(1,3,{props:['rays'],rx:0.5,ry:0.5});
 set(2,0,{props:['lanterns']});set(2,2,{props:['bedroom'],dark:0});set(2,3,{props:['milky']});
 set(3,0,{props:['lanterns']});set(3,1,{props:['dance']});set(3,2,{props:['well']});set(3,3,{props:['milky','dance']});}
