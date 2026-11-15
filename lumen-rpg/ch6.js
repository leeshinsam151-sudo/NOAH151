'use strict';
/* =========================================================
   6장 · 별등탑 — 빛의 다리, 재바람 회랑, 오르반, 거인 맞대결, 엔딩 3종
   ========================================================= */
T.TFLOOR=40;T.TWALL=41;T.PIT=42;T.LBRIDGE=43;T.VOIDB=44;
[T.TWALL,T.VOIDB].forEach(t=>SOLIDS.add(t));
const WP={f0:hex('#1c1a34'),f1:hex('#262448'),f2:hex('#302e5a'),f3:hex('#6a68a8'),w0:hex('#0e0c1c'),w1:hex('#2a2648'),w2:hex('#3e3a66'),w3:hex('#5e5a8e'),v:hex('#05040c'),st:hex('#c8ccff'),b1:hex('#e8d08a'),b2:hex('#fff2c0')};
[[T.TFLOOR,'#302e5a'],[T.TWALL,'#0e0c1c'],[T.PIT,'#05040c'],[T.LBRIDGE,'#e8d08a'],[T.VOIDB,'#05040c']].forEach(([t,c])=>MCOL[t]=hex(c));
TILEPX[T.TFLOOR]=(tx,ty,lx,ly,X,Y)=>{if(lx===0||ly===0)return WP.f0;if(h2(X,Y,131)>0.985)return WP.f3;if((lx===8&&ly===8)&&h2(tx,ty,132)>0.7)return WP.st;return ((tx+ty)&1)?WP.f1:WP.f2};
TILEPX[T.TWALL]=(tx,ty,lx,ly,X,Y)=>{const b=tile(tx,ty+1);if(b!==T.TWALL&&ly>=6){if(ly===6)return WP.w3;if((ly-7)%4===3||(lx+((ly-7)>>2)*4)%8===0)return WP.w0;return WP.w2}return h2(X>>1,Y>>1,133)>0.75?WP.w1:WP.w0};
const voidPx=(tx,ty,lx,ly,X,Y)=>{const up=tile(tx,ty-1);if(up!==T.PIT&&up!==T.VOIDB&&up!==T.TWALL&&ly<5)return ly===4?WP.v:WP.f0;return h2(X,Y,134)>0.993?WP.st:WP.v};
TILEPX[T.PIT]=TILEPX[T.VOIDB]=voidPx;
TILEPX[T.LBRIDGE]=(tx,ty,lx,ly,X,Y)=>(lx===0||ly===0)?WP.f3:(h2(X,Y,135)>0.9?WP.b2:WP.b1);
const STAIR=gridSprite(16,16,(x,y)=>{const k=y>>2;return x>=k*2&&x<16-k*2?(y%4===0?'#c8ccff':(y%4===3?'#3e3a66':'#8a88c0')):null},'#0e0c1c');
TRACKS.tower={name:'별이 잠든 탑',bpm:60,wave:'sine',mel:[69,71,72,76,79,81,84],rh:[0.7,0,0.25,0.2,0.5,0,0.3,0.15],arp:1,bell:1,
  ch:[[45,57,60,64],[41,57,60,65],[36,55,60,64],[43,55,59,62],[45,57,60,64],[41,57,60,65],[38,57,62,65],[40,56,59,64]]};
TRACKS.final={name:'별의 선택',bpm:84,wave:'triangle',mel:[69,72,74,76,79,81],rh:[0.8,0.2,0.5,0.3,0.8,0.2,0.5,0.4],arp:2,pulse:1,
  ch:[[45,57,60,64],[41,57,60,65],[43,55,59,62],[40,56,59,64],[45,57,60,64],[38,57,62,65],[43,55,59,62],[40,56,59,64]]};

const TW0=AR.tower.x0;AR.tower.h=18;
const rox=k=>TW0+k*26,rpos=(k,x,y)=>({x:(rox(k)+x)*16+8,y:y*16+8});
const roomOf=px=>clamp(Math.floor((px/16-TW0)/26),0,3);
const SW=[[0,5,13],[0,20,13]],ARC=rpos(2,12.5,8),TOP=rpos(3,12.5,7);
let windT=0,windDir=1,towerBusy=false;

EXT.save.push(()=>({sw:0,ending:0}));
EXT.build.push(MB=>{
  for(let k=0;k<4;k++)for(let y=0;y<18;y++)for(let x=0;x<26;x++)setT(rox(k)+x,y,(x<1||x>24||y<1||y>16)?T.TWALL:T.TFLOOR);
  for(let y=7;y<=10;y++)for(let x=1;x<=24;x++)setT(rox(0)+x,y,T.VOIDB);
  const safe=(x,y)=>(x>=12&&x<=13&&y>=11)||(y>=10&&y<=11&&x>=5&&x<=13)||(x>=5&&x<=6&&y>=6&&y<=11)||(y>=6&&y<=7&&x>=5&&x<=20)||(x>=19&&x<=20&&y<=7);
  for(let y=4;y<=13;y++)for(let x=1;x<=24;x++)if(!safe(x,y))setT(rox(1)+x,y,T.PIT);
  for(const[k,x,y]of SW)MB.place({k:'tsw',tx:rox(k)+x,ty:y,i:SW.findIndex(q=>q[1]===x)});
  MB.place({k:'texit',tx:rox(0)+13,ty:17});
  for(let k=0;k<3;k++){const ux=k===1?19:13;MB.place({k:'tstair',tx:rox(k)+ux,ty:0,up:1,room:k});MB.place({k:'tstair',tx:rox(k+1)+13,ty:17,up:0,room:k+1,back:ux})}
  MB.place({k:'starlamp',tx:rox(3)+12,ty:6},2,1);
});
function setBridge(){const on=S.sw===3;for(let y=7;y<=10;y++)for(const x of[12,13])setT(rox(0)+x,y,on?T.LBRIDGE:T.VOIDB);repaintArea(rox(0)+12,8,3)}
Object.assign(AR.tower,{noOwl:false,
  music:()=>S.q>=35?'village':(roomOf(P.x)>=2?'final':'tower'),
  dark:()=>roomOf(P.x)===3?(S.ending===2?0.9:(S.ending?0.25:0.8)):0.86,
  region:(tx,ty)=>['별등탑 1층 · 빛의 다리','별등탑 2층 · 재바람 회랑','별등탑 3층 · 재의 옥좌','별등탑 꼭대기'][clamp(Math.floor((tx-TW0)/26),0,3)],
  spawn:()=>null,
  cam:()=>{const k=roomOf(P.x);return{x0:rox(k)*16,x1:(rox(k)+26)*16,y0:0,y1:18*16}},
  respawn:()=>{const p=rpos(0,12.5,15);return{x:p.x,y:p.y,msg:'탑 입구에서 정신을 차렸다'}}});
ROUTES.tower={'*':()=>rpos(0,13,16)};ROUTES.desert.tower=()=>({x:331*16,y:35*16});

function enterTower(){
  if(S.q<30)return say([['sys','별등탑으로 가는 거대한 문. 오르반의 재가 문틈을 메우고 있다.']]);
  const p=rpos(0,12.5,15);warp(p.x,p.y,'up');E=[];
  if(S.q<34)for(const[x,y]of[[6,4],[19,4],[12,3]])spawnEnemy('pilgrim',(rox(0)+x)*16,y*16,16);
  if(S.q===30){S.q=31;banner('별등탑','6장');saveGame();say([['seha','여기가 별등탑… 백 년 동안 아무도 오르지 못한 곳이야.'],['moru','바닥이 끊겨 있어! 저 건너로 어떻게 가지?'],['owl','양쪽 구석에 화로가 있어. 둘 다 밝히면 뭔가 일어날 것 같아!']])}else banner('별등탑');
}
OBJK.texit={draw:(o,ox,oy)=>{ctx.fillStyle='#05040c';ctx.fillRect(ox-8,oy-6,32,10)},y:o=>o.ty*16-20,act:o=>({x:o.tx*16,y:o.ty*16-4,fn:()=>{if(BOSS)return;say([['sys','탑 밖으로 나간다.']],()=>{warp(330*16,35*16+8,'left');banner('폐허 도시')})}})};
OBJK.tsw={draw:(o,ox,oy)=>drawBeacon(BEACON,ox+8,oy+16,(S.sw>>o.i)&1?'lit':'off',6,9),y:o=>o.ty*16+15,act:o=>((S.sw>>o.i)&1)?null:{x:o.tx*16+8,y:o.ty*16+14,fn:()=>{S.sw|=1<<o.i;sfx('ignite');shake=3;if(S.sw===3){setBridge();flash=0.5;say([['sys','두 화로의 빛이 만나 허공에 빛의 다리가 놓였다!']],saveGame)}else say([['sys','화로에 불을 붙였다. 반대쪽 화로도 밝혀야 할 것 같다.']],saveGame)}}};
OBJK.tstair={draw:(o,ox,oy)=>{if(o.up)ctx.drawImage(STAIR,ox,oy+10);else{ctx.fillStyle='#05040c';ctx.fillRect(ox-4,oy-4,24,8)}},y:o=>o.up?o.ty*16+12:o.ty*16-20,act:o=>({x:o.tx*16+8,y:o.up?o.ty*16+20:o.ty*16-4,fn:()=>{
  if(BOSS||P.giant)return;
  if(o.up&&o.room===2&&S.q<34)return say([['sys','재의 장막이 계단을 막고 있다.']]);
  const p=o.up?rpos(o.room+1,13,15):rpos(o.room-1,o.back,2);blackout=1;P.x=p.x;P.y=p.y;P.dir=o.up?'up':'down';rally();E=[];HAZ=[];DPROJ=[];lastRegion=regionAt(Math.floor(P.x/16),8);banner(lastRegion.split(' · ')[1]||lastRegion)}})};
OBJK.starlamp={draw:(o,ox,oy)=>drawBeacon(GREATB,ox+16,oy+16,S.ending===1||S.ending===3?'lit':'off',13,S.ending===3?12:20),y:o=>o.ty*16+15,act:o=>({x:o.tx*16+16,y:o.ty*16+20,fn:starChoice})};

/* ---------- 거인 모드 ---------- */
function updGiant(dt){
  let ix=joy.x,iy=joy.y;if(keys.arrowleft)ix--;if(keys.arrowright)ix++;if(keys.arrowup)iy--;if(keys.arrowdown)iy++;
  const il=Math.hypot(ix,iy);if(il>1){ix/=il;iy/=il}
  if(il>0.25)P.dir=Math.abs(ix)>Math.abs(iy)?(ix<0?'left':'right'):(iy<0?'up':'down');
  P.atkCd-=dt;P.inv-=dt;P.flareCd-=dt;if(flareGlow>0)flareGlow=Math.max(0,flareGlow-dt*2);if(P.atkT>0)P.atkT-=dt;
  P.gT-=dt;if(P.gT<=0){P.giant=false;toast('별빛이 다했다…');S.hp=0;die();return}
  if(want.attack&&P.atkCd<=0){P.atkT=0.3;P.atkCd=0.7;sfx('slam');shake=5;const v=DIRV[P.dir],cx=P.x+v[0]*24,cy=P.y-6+v[1]*20;
    for(let k=0;k<26;k++){const a=k/26*6.283;PARTS.push({x:cx,y:cy,vx:Math.cos(a)*140,vy:Math.sin(a)*90,life:0.35,max:0.35,col:k%2?'#fff2b0':'#ffb44a',sz:2})}
    if(BOSS&&!BOSS.under&&Math.hypot(BOSS.x-cx,BOSS.y-BOSS.hcy-cy)<48+BOSS.hw){hitBoss(rollDmg(st.atk()*1.6));P.gT=Math.min(90,P.gT+6)}
    for(const e of E.slice())if(Math.hypot(e.x-cx,e.y-cy)<52)hitEnemy(e,{d:Math.round(st.atk()*2.5),crit:false},v[0],v[1])}
  if(want.flare)doFlare();
  const sp=P.atkT>0?12:48;let vx=ix*sp+P.kx,vy=iy*sp+P.ky;const kd=Math.min(1,dt*10);P.kx-=P.kx*kd;P.ky-=P.ky*kd;
  moveBody(P,vx*dt,vy*dt,9,5,true);P.moving=il>0.25;if(P.moving){P.walkT+=dt*0.6;if(Math.floor(P.walkT*8)%2===0&&Math.random()<dt*8)shake=Math.max(shake,1.2)}
}
function drawGiant(lp){
  if(P.inv>0&&Math.floor(time*20)%2===0)return;
  const x=Math.round(P.x-cam.x),y=Math.round(P.y-cam.y),s=HERO[P.dir][P.moving?Math.floor(P.walkT*8)%4:0];
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.ellipse(x,y,14,4,0,0,6.283);ctx.fill();
  const g=GH[P.dir][P.moving?Math.floor(P.walkT*8)%4:0],dy=P.atkT>0?3:0;
  if(P.dir==='up')ctx.drawImage(GLANTERN,x-21,y-20+dy);
  ctx.drawImage(g,x-16,y-40+dy);
  if(P.dir!=='up')ctx.drawImage(GLANTERN,x+(P.dir==='left'?-21:12),y-19+dy+(P.moving?Math.round(Math.sin(P.walkT*8)):0));
}
EXT.hud.push(parts=>{if(P.giant)parts.push('별빛 '+'■'.repeat(Math.max(0,Math.ceil(P.gT/15)))+'□'.repeat(Math.max(0,6-Math.ceil(P.gT/15))))});

/* ---------- 보스: 오르반 / 잿빛 거인 ---------- */
function ashBolts(b,n,sp){const a0=Math.atan2(P.y-8-(b.y-b.hcy),P.x-b.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*0.22;DPROJ.push({x:b.x,y:b.y-b.hcy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:3,dmg:b.kind==='ashgiant'?16:12})}sfx('spore')}
function spawnOrban(){BOSS={kind:'orban',name:'재의 사제 오르반',music:'final',x:ARC.x,y:ARC.y-20,hp:800,max:800,st:'rise',t:0,cd:1.5,flash:0,stun:0,hw:7,hh:10,hcy:10,under:false,phase:1}}
BOSSES.orban={
  upd(b,dt){b.t+=dt;if(b.flash>0)b.flash-=dt;if(b.hp<=0)return orbanFalls();if(b.stun>0){b.stun-=dt;return}
    if(b.phase===1&&b.hp<b.max/2){b.phase=2;toast('오르반의 재가 거세게 휘몰아친다!','gold');sfx('rage')}
    const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy)||1;
    if(b.st==='rise'){if(b.t>1){b.st='idle';b.t=0}return}
    if(b.st==='idle'){const s=d<60?-26:(d>100?24:0);moveBody(b,dx/d*s*dt-dy/d*18*dt,dy/d*s*dt+dx/d*18*dt,5,3,false);b.cd-=dt;
      if(b.cd<=0){const r=Math.random();b.st=r<0.4?'bolt':(r<0.7?'pillar':'blink');b.t=0}}
    else if(b.st==='bolt'){if(b.t>0.45){ashBolts(b,b.phase===2?7:5,95);b.st='idle';b.cd=rand(1.1,1.8)/b.phase}}
    else if(b.st==='pillar'){if(b.t>0.4){for(let k=0;k<(b.phase===2?5:3);k++){const a=Math.random()*6.283,r=k?rand(18,44):0;HAZ.push({x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r,t:-k*0.15,warn:0.8,dur:0.35,hit:false})}b.st='idle';b.cd=rand(1.2,1.9)/b.phase;sfx('tele')}}
    else if(b.st==='blink'){if(b.t>0.35){for(let k=0;k<14;k++)PARTS.push({x:b.x+rand(-6,6),y:b.y-rand(0,20),vx:rand(-30,30),vy:rand(-40,0),life:0.5,max:0.5,col:'#8a8490',sz:1});const q=rpos(2,rand(4,21),rand(4,13));b.x=q.x;b.y=q.y;b.st='idle';b.cd=0.5}}},
  draw(b){const x=Math.round(b.x-8-cam.x),y=Math.round(b.y-22-cam.y+Math.sin(time*3)*2);if(b.st==='blink')ctx.globalAlpha=Math.max(0.1,1-b.t*3);if(b.st==='rise')ctx.globalAlpha=clamp(b.t,0,1);
    ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(Math.round(b.x-5-cam.x),Math.round(b.y-1-cam.y),10,2);ctx.drawImage(NPCSPR.orban,x,y);
    if(b.flash>0||((b.st==='bolt'||b.st==='pillar')&&Math.floor(time*16)%2)){ctx.globalCompositeOperation='lighter';ctx.drawImage(NPCSPR.orban,x,y);ctx.globalCompositeOperation='source-over'}ctx.globalAlpha=1}
};
function orbanFalls(){
  const b=BOSS;BOSS=null;HAZ=[];DPROJ=[];shake=6;flash=0.8;
  say([['orban','…아직이다. 나는 백 년을 기다렸다. 재여, 모여라. 이 탑의 재여, 모두 내게로!'],['sys','탑의 벽과 바닥에서 재가 솟구쳐 오르반을 감싼다. 재는 산처럼 부풀어 올라 거인이 되었다.'],['seha','저건… 너무 커! 우리 힘으로는…'],['owl','별의 이슬! 스승님이 그랬잖아, 정말로 커져야 할 때 쓰라고!'],['sys','별의 이슬 마지막 한 방울을 삼켰다. 몸이 커진다. 탑의 천장이 가까워진다!']],
    ()=>{S.q=33;S.dew=0;P.giant=true;P.gT=90;P.x=ARC.x;P.y=ARC.y+70;flash=1;sfx('lvl');
      BOSS={kind:'ashgiant',name:'잿빛 거인',music:'final',x:ARC.x,y:ARC.y-10,hp:1100,max:1100,st:'rise',t:0,cd:2,flash:0,stun:0,hw:16,hh:22,hcy:26,under:false,phase:1,gx:0,gy:0};
      toast('A: 내려찍기 · D: 섬광 · 맞히면 별빛이 조금 차오른다','gold')});
}
BOSSES.ashgiant={
  upd(b,dt){b.t+=dt;if(b.flash>0)b.flash-=dt;if(b.hp<=0)return giantFalls();if(b.stun>0){b.stun-=dt;return}
    if(b.phase===1&&b.hp<b.max/2){b.phase=2;shake=7;sfx('rage')}
    const dx=P.x-b.x,dy=P.y-b.y,d=Math.hypot(dx,dy)||1;
    if(b.st==='rise'){if(b.t>1.5){b.st='idle';b.t=0}return}
    if(b.st==='idle'){moveBody(b,dx/d*20*dt,dy/d*20*dt,12,6,false);b.cd-=dt;if(b.cd<=0){b.t=0;if(Math.random()<0.55){b.st='slamW';b.gx=P.x;b.gy=P.y}else b.st='wave'}}
    else if(b.st==='slamW'){if(b.t>0.95){shake=7;sfx('slam');if(((P.x-b.gx)/44)**2+((P.y-b.gy)/28)**2<1)hurtPlayer(22,b.gx,b.gy);for(let k=0;k<30;k++){const a=k/30*6.283;PARTS.push({x:b.gx,y:b.gy,vx:Math.cos(a)*140,vy:Math.sin(a)*90,life:0.4,max:0.4,col:'#8a8490',sz:2})}b.st='idle';b.cd=rand(1.2,1.9)/(b.phase===2?1.3:1)}}
    else if(b.st==='wave'){if(b.t>0.6){ashBolts(b,b.phase===2?9:6,80);b.st='idle';b.cd=rand(1.4,2)}}
    if(overlap(P.x,P.y-12,9,12,b.x,b.y-24,14,20))hurtPlayer(14,b.x,b.y)},
  draw(b){const x=Math.round(b.x-24-cam.x),y=Math.round(b.y-60-cam.y+Math.sin(time*2)*2);if(b.st==='rise')ctx.globalAlpha=clamp(b.t/1.5,0,1);
    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.ellipse(b.x-cam.x,b.y-cam.y,20,6,0,0,6.283);ctx.fill();
    const ag=AG[b.st==='slamW'?2:Math.floor(time*2)%2];ctx.drawImage(ag,x,y);
    if(b.flash>0||((b.st==='slamW'||b.st==='wave')&&Math.floor(time*14)%2)){ctx.globalCompositeOperation='lighter';ctx.drawImage(ag,x,y);ctx.globalCompositeOperation='source-over'}ctx.globalAlpha=1;
    if(Math.floor(time*3)%2){ctx.fillStyle='#5a6ab8';ctx.fillRect(x+23,y+32,2,2)}
    for(let k=0;k<5;k++){const a=time*1.5+k*1.26;ctx.fillStyle='#6a6470';ctx.fillRect(Math.round(b.x-cam.x+Math.cos(a)*24),Math.round(b.y-30-cam.y+Math.sin(a*1.3)*24),2,2)}
    if(b.st==='slamW'){const gx=Math.round(b.gx-cam.x),gy=Math.round(b.gy-cam.y);ctx.fillStyle=`rgba(0,0,0,${0.2+b.t*0.35})`;ctx.beginPath();ctx.ellipse(gx,gy,44*b.t,28*b.t,0,0,6.283);ctx.fill();ctx.fillStyle=Math.floor(time*12)%2?'#ffb44a':'#8a5a2a';for(let a=0;a<6.28;a+=0.1)ctx.fillRect(Math.round(gx+Math.cos(a)*44),Math.round(gy+Math.sin(a)*28),1,1)}}
};
function giantFalls(){
  const b=BOSS;BOSS=null;HAZ=[];DPROJ=[];E=[];P.giant=false;shake=9;flash=1;sfx('bossdown');gainXP(900);
  for(let k=0;k<90;k++)PARTS.push({x:b.x+rand(-20,20),y:b.y-rand(0,50),vx:rand(-90,90),vy:rand(-130,10),life:rand(0.8,1.8),max:1.8,col:k%3?'#6a6470':'#ffe08a',sz:k%4?1:2});
  setTimeout(()=>say([
    ['sys','재가 흩어진다. 몸이 원래 크기로 돌아왔다. 무너진 재 더미 한가운데 오르반이 무릎을 꿇고 있다.'],
    ['orban','…백 년 전, 나는 별등지기의 막내 제자였다. 그림자를 땔감으로 쓰자고 처음 말한 것이… 나였다.'],
    ['orban','그날 밤 들판에서 들린 울음소리를 나는 하루도 잊지 못했다. 그래서 모든 빛을 끄기로 했지. 다시는 아무것도 타지 않도록.'],
    ['orban','가슴에 박힌 이것이 보이느냐. 꺼진 별의 조각이다. 이것이 나를 백 년이나 붙들어 두었다.'],
  ],()=>choose('오르반 앞에서','어떻게 할까요?',[
    {label:'손을 내민다. “스승님이 그러셨어요. 당신은 너무 큰 빛에 데었을 뿐이라고.”',fn:()=>{S.flags.spareOrban=1;say([['orban','…호롱이. 그 울보 녀석이 그런 말을.'],['orban','작은 등불이여. 네 빛은… 뜨겁지 않구나. 올라가거라. 별등 앞에서, 내가 하지 못한 선택을 해 다오.']],afterOrban)}},
    {label:'등을 돌린다. “당신이 끈 봉화 때문에 많은 사람이 떨었어요.”',fn:()=>{S.flags.spareOrban=0;say([['orban','…그래. 그 말이 옳다. 나는 재로 돌아가마.'],['sys','오르반은 한 줌의 재가 되어 흩어졌다. 꺼진 별의 조각만이 바닥에 남았다.']],afterOrban)}}])),1500);
}
function afterOrban(){S.q=34;S.hp=st.maxHp();S.mp=st.maxMp();toast('꼭대기로 가는 계단이 열렸다','gold');saveGame()}
const trueOK=()=>pageCount()>=3&&S.sideQ===2&&S.flags.sehaChoice===1&&S.flags.spareOrban===1;
function starChoice(){
  if(S.ending)return say([['sys',['','별등이 온 세상을 비추고 있다.','꺼진 별등 위로 진짜 별들이 떠 있다.','별등 속에서 작은 불씨가 태우지 않는 빛을 내고 있다.'][S.ending]]],()=>choose('별등 앞에서','',[{label:'에필로그 다시 보기',fn:()=>playEpilogue(S.ending)},{label:'그만두기'}]));
  if(S.q<34)return;
  say([['sys','백 년 동안 꺼져 있던 별등. 차가운 불씨 받침에 손을 대자 낮은 울림이 느껴진다.'],['owl','…네가 정해. 여기까지 걸어온 건 너니까.']],()=>{
    const o=[{label:'다시 밝힌다. 세상에 빛을 되돌린다.',fn:()=>ending(1)},{label:'꺼진 채로 둔다. 어둠과 함께 사는 길을 택한다.',fn:()=>ending(2)}];
    if(trueOK())o.push({label:'등불의 불씨를 나눈다. 태우지 않는 작은 빛을 건넨다.',fn:()=>ending(3)});
    o.push({label:'조금 더 생각한다'});choose('별의 선택','별등 앞에서',o)});
}
function ending(n){
  S.ending=n;S.q=35;flash=1;shake=4;sfx('ending');saveGame();
  const T3=[null,
   [['sys','등불의 불을 별등에 옮겼다. 눈부신 빛이 탑에서 쏟아져 온 세상을 덮는다.'],['sys','재울 마을에서 스승 호롱이 눈을 뜬다. 사람들이 창문을 열고 환호한다.'],['seha','…들판이 조용해. 그림자들의 소리가, 하나도 안 들려.'],['sys','세상은 다시 밝아졌다. 그리고 땅은 더 이상 꿈을 꾸지 않는다.']],
   [['sys','별등에서 손을 뗐다. 탑 꼭대기 위로, 백 년 만에 진짜 별들이 보인다.'],['moru','안 켜는 거야? …그래. 봉화랑 등불이면 충분할지도 몰라.'],['sys','사람들은 마을마다 작은 불을 켜고 어둠과 함께 사는 법을 배웠다. 그림자들은 불빛 가장자리에서 조용히 지켜본다.'],['sys','스승 호롱은 여전히 잠들어 있다. 하지만 그 숨결은 어느 때보다 평온하다.']],
   [['sys','등불에서 가장 작은 불씨 하나를 떼어 별등에 올려놓았다. 발밑과, 곁에 선 한 사람을 비출 만큼의 빛.'],['sys','불씨는 타오르지 않고 번져 나간다. 별등이 은은하게 빛난다. 아무것도 태우지 않는 빛이다.'],['seha','들려…? 그림자들이 울지 않아. 빛 가장자리에서… 춤추고 있어.'],['orban','…이것이었구나. 백 년 전 우리가 찾지 못한 것이.'],['sys','재울 마을에서 스승 호롱이 눈을 뜨고 중얼거린다. “잘 걸었구나.” 밤은 여전히 밤이지만, 이제 누구도 길을 잃지 않는다.']]][n];
  say(T3,()=>playEpilogue(n,()=>showEnd(5+n)));
}
ENDS[6]=['엔딩 · 다시 뜬 별','별등을 다시 밝혔다','세상에 빛이 돌아오고 스승이 깨어났어요. 하지만 그림자들은 사라졌어요. 다른 선택을 했다면 어땠을까요? 일지 조각 3개, 버들의 부탁, 세하에게 건넨 대답, 오르반에게 내민 손이 또 다른 길을 열어 줘요.'];
ENDS[7]=['엔딩 · 별이 보이는 밤','별등을 끄둔 채 두었다','사람과 그림자가 어둠 속에서 함께 살아가요. 스승은 평온히 잠들어 있어요. 일지 조각 3개, 버들의 부탁, 세하에게 건넨 대답, 오르반에게 내민 손이 또 다른 길을 열어 줘요.'];
ENDS[8]=['진엔딩 · 태우지 않는 빛','작은 불씨를 나누었다','빛과 그림자가 함께 사는 밤이 왔어요. 스승이 깨어났고, 오르반은 백 년 만에 짐을 내려놓았어요. 긴 여정을 끝까지 걸어 줘서 고마워요.'];
QX[31]={text:()=>'탑을 올라 오르반에게 가기',target:()=>{const k=roomOf(P.x);return k===0&&S.sw!==3?rpos(0,SW[(S.sw&1)?1:0][1],SW[0][2]):rpos(k,k===1?19:13,1)}};
QX[32]={text:()=>'오르반과 맞서기',target:()=>BOSS?{x:BOSS.x,y:BOSS.y-30}:null};
QX[33]={text:()=>'잿빛 거인과 맞서기 (별빛이 다하기 전에!)',target:()=>BOSS?{x:BOSS.x,y:BOSS.y-64}:null};
QX[34]={text:()=>'탑 꼭대기, 별등 앞으로',target:()=>curArea.id==='tower'&&roomOf(P.x)===3?{x:TOP.x,y:TOP.y-20}:rpos(2,13,1)};
QX[35]={text:()=>'여정 완료 · 자유롭게 탐험하기'};

EXT.update.push((dt,tx,ty)=>{
  if(curArea.id!=='tower'){P.wx=0;return}
  const k=roomOf(P.x);
  if(k===1){windT+=dt;if(windT>5){windT=0;windDir*=-1}P.wx=windT>1.4&&windT<3.2?windDir*46:0;
    if(windT>0.4&&windT<3.2&&Math.random()<0.6)PARTS.push({x:cam.x+(windDir>0?-4:VW+4),y:cam.y+rand(0,VH),vx:windDir*rand(160,240),vy:rand(-8,8),life:1.6,max:1.6,col:windT<1.4?'#5e5866':'#a09aa8',sz:windT<1.4?1:2});
    if(tile(tx,ty)===T.PIT&&P.dashT<=0&&!P.auto&&mode==='play'){S.hp-=15;sfx('hurt');blackout=0.8;const p=rpos(1,13,15);P.x=p.x;P.y=p.y;P.kx=P.ky=0;rally();toast('허공으로 떨어졌다! 바람이 멎을 때 건너자');if(S.hp<=0){S.hp=0;die()}}}
  else P.wx=0;
  if(k===2&&S.q===31&&ty<=13&&mode==='play'&&!towerBusy){towerBusy=true;S.q=32;E=[];sfx('omen');
    say([['orban','…원래 크기로 돌아왔구나. 호롱의 꿈에 다녀온 얼굴이로군.'],['orban','나는 이 탑을 무너뜨린다. 막고 싶다면, 그 작은 등불로 나를 넘어 보거라.'],['seha','오르반은 순식간에 자리를 옮겨! 바닥이 보랏빛으로 빛나면 피해!']],()=>{towerBusy=false;spawnOrban()})}
});
EXT.lights.push((L,warm)=>{
  if(curArea.id!=='tower')return;
  for(const[k,x,y]of SW)if((S.sw>>SW.findIndex(q=>q[1]===x))&1){L.push([(rox(k)+x)*16+8,y*16,80]);warm.push([(rox(k)+x)*16+8,y*16,50,0.2])}
  if(S.sw===3)L.push([(rox(0)+13)*16,9*16,60]);
  if(BOSS)L.push([BOSS.x,BOSS.y-BOSS.hcy,BOSS.kind==='ashgiant'?70:40]);
  if(P.giant)L.push([P.x,P.y-16,110]);
  for(const p of DPROJ)L.push([p.x,p.y,9]);
  L.push([TOP.x,TOP.y-10,S.ending===1?260:(S.ending===3?170:50)]);if(S.ending===1||S.ending===3)warm.push([TOP.x,TOP.y-14,120,0.25]);
});
EXT.sorted.push(D=>{if(curArea.id==='tower'&&S.q>=34&&S.flags.spareOrban===1&&!BOSS&&roomOf(P.x)>=2){const q=S.ending===3?{x:TOP.x-40,y:TOP.y+30}:{x:ARC.x,y:ARC.y};if(roomOf(q.x)===roomOf(P.x))D.push({y:q.y,f:()=>ctx.drawImage(NPCSPR.orban,Math.round(q.x-8-cam.x),Math.round(q.y-20-cam.y))})}});
EXT.die.push(()=>{P.giant=false;P.wx=0;towerBusy=false;if(S.q===32||S.q===33){S.q=31;S.dew=1}});
EXT.load.push(()=>{P.giant=false;towerBusy=false;if(S.q===32||S.q===33){S.q=31;S.dew=1}setBridge()});

/* =========================================================
   전용 도트: 거인이 된 주인공 (32×40) · 잿빛 거인 (48×60)
   ========================================================= */
function makeGH(dir,fr){
  const pl=PALS.hero,mid='#27586c',hair='#5a3a2a',side=dir==='side',cx=side?15:16;
  return gridSprite(32,40,(x,y)=>{const px=x+.5,py=y+.5;
    const legs=side?[[13.5+(fr===1?-2:fr===3?2:0),fr===1?-2:0],[17.5+(fr===1?2:fr===3?-2:0),fr===3?-2:0]]:[[12.5,fr===1?-2:0],[19.5,fr===3?-2:0]];
    for(const[lx,lf]of legs){if(Math.abs(px-lx)<2.6&&py>=32&&py<37+lf)return px<lx?'#4a4064':pl.p;if(Math.abs(px-lx-0.3)<3.3&&py>=37+lf&&py<40+lf)return py<38+lf?'#6a4a36':pl.f}
    if(py>=19&&py<34){const hw=(side?7:9)+(py-19)*(side?0.2:0.24);if(Math.abs(px-cx)<hw){
      if(py>=27&&py<29)return Math.abs(px-cx)<1.2&&dir!=='up'?'#ffd36b':pl.b;
      if(py>=33)return pl.C;
      if(py<21.5)return Math.abs(px-cx)<1.3&&dir==='down'?'#ffd36b':pl.w;
      const rel=(px-cx)/hw;if(rel<-0.72)return pl.w;if(rel>0.6)return pl.C;
      if(!side&&(Math.abs(px-(cx-4.5))<0.6||Math.abs(px-(cx+4.5))<0.6)&&py>23)return mid;
      if(dir==='up'&&Math.abs(px-cx)<0.6)return pl.C;
      if(py>29&&(x+y)%5===0)return mid;return pl.c}}
    if(!side){for(const sd of[-1,1]){const ax=cx+sd*11;if(Math.abs(px-ax)<2.4&&py>=21&&py<29)return sd<0?pl.c:pl.C;if(Math.hypot(px-ax,py-30)<2.3)return dir==='up'?pl.S:pl.s}}
    else{if(Math.abs(px-(cx+2))<2.4&&py>=21&&py<29)return mid;if(Math.hypot(px-(cx+2.5),py-30)<2.3)return pl.s}
    if(((px-cx)/9.5)**2+((py-10.5)/9.8)**2<1){
      if(dir==='down'&&((px-16)/6.2)**2+((py-12.5)/6.3)**2<1){if(py<8.6)return (x+y)%4===0?'#7a5238':hair;if((x===12||x===13||x===18||x===19)&&(y===12||y===13))return (y===12&&(x===12||x===18))?'#f4f4ff':'#1a1426';if(y===16&&(x===15||x===16))return pl.S;if((x===11||x===20)&&y===15)return '#e8a08a';return py>16.5?pl.S:pl.s}
      if(side&&((px-20)/5)**2+((py-12.5)/6)**2<1&&px>15.5){if(py<8.6)return hair;if((x===20||x===21)&&(y===12||y===13))return (y===12&&x===21)?'#f4f4ff':'#1a1426';if(x===24&&y===14)return pl.S;return py>16.5?pl.S:pl.s}
      const rel=(px-cx)/9.5;if(rel<-0.6||py<3.5)return pl.w;if(rel>0.55)return pl.C;if(dir==='up'&&Math.abs(px-cx)<0.6&&py>6)return pl.C;return pl.c}
    return null},'#1a1426');
}
const GH=(()=>{const f=d=>[0,1,2,3].map(i=>makeGH(d,i)),r=f('side');return{down:f('down'),up:f('up'),right:r,left:r.map(flipH)}})();
const GLANTERN=gridSprite(9,13,(x,y)=>{if(y<3)return (x===4||(y===2&&x>=3&&x<=5)||(y===0&&x>=3&&x<=5))?'#2a1e14':null;if(y===3||y===12)return x>=1&&x<=7?'#2a1e14':null;if(x<1||x>7)return null;if(x===1||x===7)return '#4a3626';const d=Math.hypot(x-4,y-7.5);return d<1.6?'#fff8d8':(d<3?'#ffe08a':'#ffb44a')},'#1a1012');
function makeAG(pose){
  const ash=['#201c26','#34303c','#4a4454','#665f72'],up=pose===2;
  return gridSprite(48,60,(x,y)=>{const px=x+.5,py=y+.5,n=h2(x,y,150+pose),n2=h2(x>>1,y>>1,160),sh=v=>ash[clamp(Math.floor(v+(n-0.5)*1.4),0,3)];
    if(((px-24)/9)**2+((py-13)/9.5)**2<1){
      if(((px-24)/5.6)**2+((py-14.5)/7)**2<1){if((y===13||y===14)&&((x>=19&&x<=21)||(x>=26&&x<=28)))return y===13?'#ff6a4a':'#c0392b';if((x===24&&y>=7&&y<=11)||(x===23&&y===11)||(x===25&&y===9))return '#8a8074';if(y===19&&x>=22&&x<=25)return '#8a8074';return px<22?'#f4ecdc':(py>18?'#b8ae9c':'#e0d8c8')}
      return px<20?'#3e3946':'#201c26'}
    for(const sd of[-1,1]){const ax=24+sd*17,ay=up?22:40;if(((px-ax)/6.2)**2+((py-ay)/(up?13:14))**2<1)return sh(sd<0?2.2:1.2);if(Math.hypot(px-ax,py-(up?8:53))<6.2)return n2>0.8?'#ff8a4a':sh(sd<0?2.6:1.6)}
    if(((px-24)/17)**2+((py-37)/19)**2<1&&py<56+Math.sin(x*0.7+pose)*2.5){
      const sd=Math.abs(px-24)+Math.abs(py-33);if(sd<5)return sd<1.5?'#3a4a8a':(sd<3.6?'#141a34':'#0a0c1a');
      if((Math.abs((px-24)*0.8+(py-46)*0.5+Math.sin(py*0.5)*3)<0.7&&py>41)||(Math.abs(px-14-Math.sin(py*0.4)*2)<0.6&&py>30&&py<46)||(Math.abs(px-34+Math.sin(py*0.45)*2)<0.6&&py>28&&py<44))return n>0.4?'#ff8a4a':'#c0502a';
      return sh(1.2+((24-px)/17)*1.3+((37-py)/19)*0.8)}
    if(py>52&&py<59&&n>0.62&&Math.abs(px-24)<21)return ash[1];
    return null},'#0e0a12');
}
const AG=[makeAG(0),makeAG(1),makeAG(2)];

/* =========================================================
   에필로그: 엔딩마다 장소를 옮겨 가며 보여 주는 짧은 장면
   ========================================================= */
const SQ={x:18.5*16,y:46*16},HOME={x:24.5*16,y:43*16};
const A_=(s,x,y,o)=>Object.assign({s,x,y},o||{});
const EPI={
 1:[()=>({x:SQ.x,y:SQ.y,dark:0.08,cap:'별등의 빛이 재울 마을까지 닿았다. 스승 호롱이 눈을 뜨고, 사람들이 창문을 열고 환호한다.',
     actors:[A_(NPCSPR.master,SQ.x+6,SQ.y-18,{bob:1}),A_(NPCSPR.elder,SQ.x-30,SQ.y-10,{bob:1}),A_(NPCSPR.kid,SQ.x+34,SQ.y+6,{hop:1}),A_(NPCSPR.grandpa,SQ.x-52,SQ.y+18,{bob:1})]}),
    ()=>({x:54*16,y:47*16,dark:0.08,cap:'들판은 한낮처럼 밝다. 밤마다 풀숲에서 들리던 작은 발소리는, 이제 들리지 않는다.',actors:[]}),
    ()=>({x:(ROOT.tx+1)*16,y:(ROOT.ty+3)*16,dark:0.1,cap:'울림뿌리는 가지마다 꽃을 피웠다. 하지만 더는 꿈 이야기를 들려주지 않는다.',actors:[A_(NPCSPR.herb,(ROOT.tx+1)*16-30,(ROOT.ty+3)*16+6,{bob:1})]}),
    ()=>({x:TOP.x,y:TOP.y+20,dark:0.1,cap:'빛은 돌아왔다. 그리고 무언가는 돌아오지 않았다.',actors:partyAt(TOP.x,TOP.y+34)})],
 2:[()=>({x:SQ.x,y:SQ.y,dark:0.82,stars:1,night:1,cap:'사람들은 집집마다 작은 불을 켰다. 그림자들은 불빛 가장자리에서 조용히 지켜본다.',
     actors:[A_(NPCSPR.elder,SQ.x-24,SQ.y-8,{bob:1,lit:30}),A_(NPCSPR.kid,SQ.x+20,SQ.y+8,{bob:1,lit:26}),A_(RAT[0],SQ.x+92,SQ.y+34,{eyes:1}),A_(RATL[0],SQ.x-96,SQ.y+40,{eyes:1}),A_(RAT[0],SQ.x+70,SQ.y-52,{eyes:1})]}),
    ()=>({x:CAMP.x*16+8,y:CAMP.y*16+24,dark:0.8,stars:1,cap:'숲지기 버들은 늑대에게 모닥불 곁 한 자리를 내주었다.',actors:[A_(NPCSPR.herb,107*16+8,27*16+12,{bob:1}),A_(WOLF[0],CAMP.x*16+62,CAMP.y*16+30,{bob:1}),A_(SPORE,CAMP.x*16-40,CAMP.y*16+40,{float:1,lit:20})]}),
    ()=>({x:HOME.x,y:HOME.y,dark:0.84,stars:1,night:1,cap:'스승 호롱은 여전히 잠들어 있다. 창밖으로, 백 년 만에 진짜 별이 보인다.',actors:[A_(OWL[0],HOME.x+8,HOME.y-52,{bob:1})]}),
    ()=>({x:TOP.x,y:TOP.y+20,dark:0.86,stars:1,cap:'별등은 꺼진 채 남았다. 대신 저마다의 작은 불빛이 밤을 건넌다.',actors:partyAt(TOP.x,TOP.y+34)})],
 3:[()=>({x:SQ.x,y:SQ.y,dark:0.5,stars:1,cap:'스승 호롱이 눈을 뜨고 중얼거렸다. “잘 걸었구나.” 꼬마 콩 곁에서 그림자 쥐가 꼬리를 흔든다.',
     actors:[A_(NPCSPR.master,SQ.x+4,SQ.y-18,{bob:1}),A_(NPCSPR.elder,SQ.x-30,SQ.y-10,{bob:1}),A_(NPCSPR.kid,SQ.x+34,SQ.y+8,{hop:1}),A_(RATL[0],SQ.x+52,SQ.y+12,{hop:1,eyes:1}),A_(SLIME,SQ.x-58,SQ.y+26,{hop:1,lit:20})]}),
    ()=>({x:118*16,y:46*16,dark:0.55,stars:1,cap:'안개 숲에서는 포자 정령들이 봉화 둘레를 돌며 춤춘다.',actors:[0,1,2,3,4].map(i=>A_(SPORE,118*16+8,45*16,{orbit:44,ph:i*1.256,lit:18}))}),
    ()=>({x:OASIS.x*16,y:35*16,dark:0.5,stars:1,cap:S.flags.spareOrban===1?'오르반은 가면을 벗고 오아시스의 우물을 고친다. 백 년 만에 생긴 일거리다.':'오아시스에는 다시 물이 차오른다. 하린은 깨진 가면 하나를 모래에 묻어 주었다.',
     actors:[A_(NPCSPR.harin,OASIS.x*16+30,35*16+10,{bob:1}),A_(NPCSPR.jeti,OASIS.x*16-70,37*16+12,{bob:1})].concat(S.flags.spareOrban===1?[A_(NPCSPR.orban,OASIS.x*16-8,34*16+4,{bob:1})]:[])}),
    ()=>({x:TOP.x,y:TOP.y+20,dark:0.45,stars:1,cap:'밤은 여전히 밤이다. 하지만 이제, 아무도 길을 잃지 않는다.',actors:partyAt(TOP.x,TOP.y+34).concat([0,1,2].map(i=>A_(RAT[0],TOP.x,TOP.y-4,{orbit:58,ph:i*2.09,eyes:1})))})],
};
function partyAt(x,y){return[A_(HERO.up[0],x,y),A_(MORU_SET.up[0],x-22,y+6),A_(SEHA_SET.up[0],x+22,y+6),A_(OWL[0],x+10,y-22,{bob:1})]}
function actorPos(a){let x=a.x,y=a.y;if(a.orbit){x+=Math.cos(time*0.9+a.ph)*a.orbit;y+=Math.sin(time*0.9+a.ph)*a.orbit*0.55}if(a.bob)y+=Math.round(Math.sin(time*2+a.x)*0.8);if(a.hop)y-=Math.abs(Math.round(Math.sin(time*5+a.x)*3));if(a.float)y+=Math.round(Math.sin(time*3)*2);return[x,y]}
function playEpilogue(n,done){
  const shots=EPI[n];let i=-1,at=0;setHud(false);mode='cine';E=[];PROJ=[];HAZ=[];const lab=typeof n==='string'?'막간':'에필로그';
  const finish=()=>{CINE=null;cineNext=()=>{};cineSkip=()=>{};$('dialog').hidden=true;$('portrait').classList.remove('none');setArea(areaAt(P.x));setHud(true);blackout=1;mode='play';if(done)done()};
  cineNext=()=>{if(performance.now()-at<700)return;at=performance.now();i++;if(i>=shots.length)return finish();const s=shots[i]();blackout=1;CINE={x:s.x,y:s.y+26,dark:s.dark,stars:!!s.stars,night:!!s.night,key:n,idx:i,actors:s.actors||[],t:0};darkCur=s.dark;setArea(areaAt(s.x));PARTS=[];
    $('dialog').hidden=false;$('portrait').classList.add('none');$('dName').textContent=`${lab} ${i+1} / ${shots.length}`;$('dText').textContent=s.cap};
  cineSkip=finish;at=-9999;cineNext();
}
EXT.ambient.push(dt=>{if(CINE){CINE.t+=dt;if(CINE.t>11)cineNext()}});
EXT.sorted.push(D=>{if(!CINE)return;for(const a of CINE.actors){const[x,y]=actorPos(a);D.push({y,f:()=>{ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(Math.round(x-cam.x-4),Math.round(y-cam.y-1),8,2);ctx.drawImage(a.s,Math.round(x-a.s.width/2-cam.x),Math.round(y-a.s.height-cam.y))}})}});
EXT.lights.push(L=>{if(!CINE)return;for(const a of CINE.actors)if(a.lit){const[x,y]=actorPos(a);L.push([x,y-8,a.lit])}});
EXT.post.push(()=>{if(!CINE)return;for(const a of CINE.actors)if(a.eyes){const[x,y]=actorPos(a);ctx.fillStyle='#ff4a5a';ctx.fillRect(Math.round(x+(a.s===RATL[0]?-4:3)-cam.x),Math.round(y-5-cam.y),1,1)}});
EXT.over.push(()=>{if(!CINE||!CINE.stars)return;for(let k=0;k<(CINE.night?60:26);k++){const tw=Math.sin(time*2+k*1.7);if(tw<-0.3)continue;ctx.fillStyle=tw>0.6?'#ffffff':'#a8b4e8';ctx.fillRect(Math.floor(h2(k,1,170)*VW),Math.floor(h2(k,2,170)*VH*0.42),1,1)}});

/* ---------- 장마다 나오는 막간 장면 ---------- */
Object.assign(EPI,{
 c1:[()=>({x:GREAT.tx*16+8,y:GREAT.ty*16+30,dark:0.6,stars:1,cap:'재울의 큰 봉화가 다시 타오른다. 들판의 그림자들이 빛 밖으로 물러난다.',
      actors:[A_(RAT[0],GREAT.tx*16+120,GREAT.ty*16+60,{eyes:1,hop:1}),A_(RATL[0],GREAT.tx*16-118,GREAT.ty*16+40,{eyes:1,hop:1})]}),
     ()=>({x:10.5*16,y:55*16,dark:0.55,cap:'식어 있던 대장간 화덕에 불이 붙었다. 모루가 신이 나서 망치를 집어 든다.',actors:[A_(NPCSPR.moru,10.5*16+10,55*16+4,{hop:1,lit:34})]}),
     ()=>({x:HOME.x,y:HOME.y,dark:0.7,stars:1,cap:'스승 호롱은 아직 깊이 잠들어 있다. 길은 이제 막 시작됐다.',actors:[A_(NPCSPR.elder,HOME.x-40,HOME.y+6,{bob:1}),A_(OWL[0],HOME.x+10,HOME.y-52,{bob:1})]})],
 c2:[()=>({x:(ROOT.tx+1)*16,y:(ROOT.ty+3)*16,dark:0.5,cap:'안개가 걷힌 숲에 울림뿌리의 꽃이 피었다. 포자 정령들이 조용히 모여든다.',
      actors:[A_(NPCSPR.herb,(ROOT.tx+1)*16-34,(ROOT.ty+3)*16+8,{bob:1})].concat([0,1,2].map(i=>A_(SPORE,(ROOT.tx+1)*16,(ROOT.ty+1)*16,{orbit:50,ph:i*2.09,lit:18})))}),
     ()=>({x:124*16,y:17*16,dark:0.72,stars:1,cap:'멀리서 지켜보던 세하가 금 간 가면을 만지작거리다, 말없이 돌아선다.',actors:[A_(SEHA_SET.up[0],124*16+52,19*16,{lit:22})]})],
 c3:[()=>({x:MCAMP.x*16,y:MCAMP.y*16+10,dark:0.6,cap:'모루는 십 년 만에 할아버지의 손을 잡았다. 망치 든 손이 조금 떨렸다.',actors:[A_(MORU_SET.right[0],MCAMP.x*16+12,MCAMP.y*16+2,{bob:1}),A_(NPCSPR.grandpa,MCAMP.x*16+30,MCAMP.y*16+2,{bob:1})]}),
     ()=>({x:191*16,y:56*16,dark:0.8,cap:'눈을 뜬 두더지왕은 기록 보관함 곁에서 코를 골며 잠들었다.',actors:[]}),
     ()=>({x:DCAVE.x+40,y:DCAVE.y+10,dark:0.12,cap:'긴 굴 끝에서 뜨거운 바람이 불어온다. 잿빛 사막이다.',actors:[A_(SEHA_SET.right[0],DCAVE.x+20,DCAVE.y+8)]})],
 c4:[()=>({x:313*16,y:35*16,dark:0.15,cap:'바하르가 유사 위에 누워 느긋하게 노래한다. 말뚝이 뽑힌 자리에 모래가 덮인다.',actors:[A_(MORU_SET.right[0],309*16,35*16+6,{hop:1}),A_(SEHA_SET.right[0],308*16-6,34*16+2)]}),
     ()=>({x:PLAZA.x,y:PLAZA.y,dark:0.62,stars:1,cap:'유사 너머 폐허 도시의 광장. 재의 사제 오르반이 별등탑을 올려다보고 있다.',actors:[A_(NPCSPR.orban,PLAZA.x,PLAZA.y,{lit:26})]})],
 c5:[()=>({x:SQ.x,y:SQ.y,dark:0.5,cap:'원래 크기로 돌아왔다. 꼬마 콩은 제 신발 밑에 누가 있었는지 꿈에도 모른다.',actors:[A_(HERO.down[0],SQ.x-6,SQ.y-8),A_(NPCSPR.kid,SQ.x+30,SQ.y+6,{hop:1}),A_(OWL[0],SQ.x+6,SQ.y-34,{bob:1})]}),
     ()=>({x:HOME.x,y:HOME.y,dark:0.72,stars:1,night:1,cap:'스승의 머리맡에는 별의 이슬이 한 방울 남았다. 정말로 커져야 할 때를 위해.',actors:[]}),
     ()=>({x:331*16+16,y:35*16,dark:0.65,stars:1,cap:'폐허 도시 동쪽, 별등탑의 문. 오르반은 이미 저 안으로 들어갔다.',actors:[A_(NPCSPR.orban,331*16+16,36*16+4,{lit:24})]})],
});
{const showEnd0=showEnd;showEnd=function(ch){if(ch>=1&&ch<=5&&EPI['c'+ch]&&!CINE)return playEpilogue('c'+ch,()=>showEnd0(ch));showEnd0(ch)}}
