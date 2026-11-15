'use strict';
/* =========================================================
   소리 보강: 잡음 기반 소리 엔진, 보스 포효, 상황별 효과음,
   특수 지역 발소리, 지역 환경음
   ========================================================= */
(()=>{
let NBUF=null,OUT=null,WIND=null;
function aout(){
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}
  if(!OUT){OUT=AC.createGain();OUT.gain.value=1;const c=AC.createDynamicsCompressor();c.threshold.value=-14;c.ratio.value=6;OUT.connect(c);c.connect(AC.destination)}
  if(!NBUF){const n=AC.sampleRate*2;NBUF=AC.createBuffer(1,n,AC.sampleRate);const d=NBUF.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}
  return AC;
}
/* 잡음: 필터를 쓸어내리며 포효·충격·바람을 만든다 */
function noise(o){
  const a=aout();if(!a)return;const t=a.currentTime+(o.delay||0),s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();
  s.buffer=NBUF;s.loop=true;f.type=o.type||'lowpass';f.Q.value=o.q||0.7;f.frequency.setValueAtTime(o.f1,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,o.f2||o.f1),t+o.dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(o.vol,t+(o.att||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+o.dur);
  s.connect(f);f.connect(g);g.connect(OUT);s.start(t,Math.random()*1.5);s.stop(t+o.dur+0.05);
}
/* 으르렁: 톱니파에 떨림을 걸어 거친 목소리를 만든다 */
function growl(o){
  const a=aout();if(!a)return;const t=a.currentTime+(o.delay||0),os=a.createOscillator(),lp=a.createBiquadFilter(),g=a.createGain(),tg=a.createGain(),lfo=a.createOscillator(),ld=a.createGain();
  os.type=o.type||'sawtooth';os.frequency.setValueAtTime(o.f1,t);os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+o.dur);
  lp.type='lowpass';lp.frequency.value=o.lp||600;lfo.frequency.value=o.trem||20;ld.gain.value=0.45;tg.gain.value=0.6;lfo.connect(ld);ld.connect(tg.gain);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(o.vol,t+Math.min(0.12,o.dur*0.25));g.gain.setValueAtTime(o.vol,t+o.dur*0.6);g.gain.exponentialRampToValueAtTime(0.0001,t+o.dur);
  os.connect(lp);lp.connect(tg);tg.connect(g);g.connect(OUT);os.start(t);lfo.start(t);os.stop(t+o.dur+0.05);lfo.stop(t+o.dur+0.05);
}
function ping(type,f1,f2,dur,vol,delay){ // 맑은 음 (OUT으로 보낸다)
  const a=aout();if(!a)return;const t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(OUT);o.start(t);o.stop(t+dur+0.03);
}
function duck(sec){if(!MUS||!AC)return;const g=MUS.master.gain,t=AC.currentTime,v=MUS.vol>0?MUS.vol:0;g.cancelScheduledValues(t);g.setTargetAtTime(v*0.22,t,0.06);g.setTargetAtTime(v,t+sec,0.5)}

/* ---------- 보스 포효 ---------- */
const ROAR={
  scare(k=1){for(let i=0;i<3;i++){growl({f1:540,f2:320,dur:0.24,vol:0.1*k,trem:60,lp:2600,delay:i*0.27});noise({f1:2400,f2:1300,type:'bandpass',q:3,dur:0.22,vol:0.08*k,delay:i*0.27})}noise({f1:320,f2:110,dur:1,vol:0.07*k})},
  root(k=1){growl({f1:74,f2:50,dur:1.7,vol:0.2*k,trem:7,lp:420});growl({f1:111,f2:76,dur:1.6,vol:0.08*k,trem:5,lp:620,type:'triangle'});for(let i=0;i<5;i++)noise({f1:1000+i*220,f2:500,type:'bandpass',q:9,dur:0.07,vol:0.07*k,delay:0.2+i*0.24})},
  mole(k=1){growl({f1:96,f2:56,dur:1.15,vol:0.2*k,trem:28,lp:520});noise({f1:280,f2:90,dur:1.15,vol:0.12*k});noise({f1:1900,f2:900,type:'bandpass',q:2,dur:0.26,vol:0.05*k,delay:0.04})},
  whale(k=1){ping('sine',170,430,0.85,0.14*k);ping('sine',430,140,1.1,0.14*k,0.8);ping('sine',86,70,1.9,0.12*k);noise({f1:190,f2:80,dur:1.9,vol:0.09*k,att:0.2})},
  ratking(k=1){for(let i=0;i<4;i++)ping('square',1700+i*190,2600,0.07,0.05*k,i*0.11);noise({f1:5200,f2:3000,type:'highpass',dur:0.5,vol:0.04*k});growl({f1:250,f2:160,dur:0.5,vol:0.08*k,trem:42,lp:1300,delay:0.1})},
  orban(k=1){for(const f of[110,130.8,164.8])growl({f1:f,f2:f*0.97,dur:1.9,vol:0.06*k,trem:4,lp:900});noise({f1:600,f2:3200,type:'bandpass',q:1.2,dur:1.7,vol:0.06*k,att:0.6})},
  ashgiant(k=1){ping('sine',72,28,1.5,0.24*k);growl({f1:62,f2:40,dur:2.1,vol:0.2*k,trem:18,lp:380});noise({f1:1200,f2:150,dur:2.1,vol:0.16*k,att:0.05})},
};
const thump=(f,v,d)=>{ping('sine',f,f*0.33,d,v);noise({f1:f*9,f2:f,dur:d*0.8,vol:v*0.6})};
const chime=(fs,v,gap,dur)=>fs.forEach((f,i)=>ping('triangle',f,f,dur||0.5,v,i*(gap||0.09)));
Object.assign(SFX,{
  impact:()=>thump(130,0.2,0.45),
  rage:()=>{const k=BOSS&&BOSS.kind;if(ROAR[k]){duck(1.2);ROAR[k](0.75)}else SFX.boss()},
  omen:()=>{ping('sine',55,46,1.3,0.16);noise({f1:180,f2:700,type:'bandpass',dur:1.3,vol:0.06,att:0.8})},
  bossdown:()=>{duck(2);ping('sine',170,28,1.3,0.2);noise({f1:2200,f2:110,dur:1.4,vol:0.14});chime([523,784,1046,1568],0.06,0.12,0.9)},
  tele:()=>{ping('square',233,330,0.11,0.04);ping('square',233,330,0.11,0.04,0.15);noise({f1:900,f2:400,type:'bandpass',q:2,dur:0.3,vol:0.03})},
  caw:()=>{for(let i=0;i<2;i++){growl({f1:560,f2:340,dur:0.2,vol:0.07,trem:60,lp:2600,delay:i*0.22});noise({f1:2400,f2:1400,type:'bandpass',q:3,dur:0.18,vol:0.05,delay:i*0.22})}},
  quake:()=>{noise({f1:420,f2:55,dur:1,vol:0.16});ping('sine',62,32,0.9,0.18)},
  whaleJump:()=>{noise({f1:300,f2:2000,type:'bandpass',dur:0.65,vol:0.11,att:0.35});ping('sine',95,270,0.6,0.1)},
  whaleLand:()=>{ping('sine',92,26,0.8,0.26);noise({f1:1500,f2:90,dur:1,vol:0.18})},
  stake:()=>{for(const f of[880,1320,1870])ping('square',f,f*0.98,0.35,0.035);noise({f1:6000,f2:3000,type:'highpass',dur:0.12,vol:0.06});thump(140,0.1,0.25)},
  smash:()=>{noise({f1:2600,f2:280,dur:0.38,vol:0.14});ping('square',190,58,0.22,0.07);noise({f1:700,f2:200,dur:0.5,vol:0.07,delay:0.08})},
  shatter:()=>{noise({f1:5000,f2:2500,type:'highpass',dur:0.45,vol:0.09});for(let i=0;i<6;i++)ping('triangle',2200+Math.random()*2400,1800,0.18,0.035,i*0.035);thump(120,0.12,0.3)},
  thud:()=>thump(112,0.16,0.26),
  burst:()=>{noise({f1:1300,f2:180,dur:0.55,vol:0.14});thump(100,0.14,0.35)},
  rock:()=>{noise({f1:950,f2:140,dur:0.3,vol:0.11});ping('sine',92,48,0.22,0.1)},
  stomp:()=>{ping('sine',72,28,0.55,0.24);noise({f1:650,f2:70,dur:0.55,vol:0.14})},
  slam:()=>{ping('sine',80,30,0.5,0.22);noise({f1:900,f2:80,dur:0.5,vol:0.14});noise({f1:3000,f2:1200,type:'bandpass',q:2,dur:0.12,vol:0.06})},
  ignite:()=>{noise({f1:380,f2:2600,type:'bandpass',dur:0.55,vol:0.09,att:0.12});for(let i=0;i<5;i++)noise({f1:3200,f2:2000,type:'highpass',dur:0.03,vol:0.05,delay:0.25+i*0.07+Math.random()*0.03})},
  beaconLit:()=>{noise({f1:300,f2:3200,type:'bandpass',dur:0.9,vol:0.12,att:0.15});ping('sine',110,82,1.1,0.12);chime([523,659,784,1046],0.055,0.1,0.9)},
  warp:()=>{ping('triangle',380,1700,0.5,0.06);noise({f1:3000,f2:8000,type:'highpass',dur:0.55,vol:0.04,att:0.3});chime([1318,1568,2093],0.03,0.07,0.4)},
  plant:()=>{chime([660,990],0.05,0.1,0.5);noise({f1:500,f2:1800,type:'bandpass',dur:0.3,vol:0.04,att:0.1})},
  ending:()=>{noise({f1:300,f2:3600,type:'bandpass',dur:1.4,vol:0.12,att:0.3});chime([392,523,659,784,1046,1318],0.05,0.16,1.4);ping('sine',98,82,2,0.12)},
  coin:()=>{ping('triangle',1250,1300,0.05,0.045);ping('triangle',1850,1900,0.09,0.045,0.05)},
  equip:()=>{ping('triangle',480,720,0.07,0.05);noise({f1:3400,f2:2600,type:'bandpass',q:4,dur:0.04,vol:0.05})},
  charge:()=>{ping('triangle',700,1500,0.16,0.05);ping('sine',1500,1500,0.2,0.04,0.14)},
  land:()=>{thump(150,0.07,0.18);noise({f1:1200,f2:500,dur:0.2,vol:0.04})},
  squeak:()=>{for(let i=0;i<3;i++)ping('square',2000+i*250,2700,0.06,0.045,i*0.1)},
  chapter:()=>{chime([392,523,659,784],0.05,0.14,1.2);noise({f1:400,f2:1600,type:'bandpass',dur:1.2,vol:0.03,att:0.6})},
});
for(const k in ROAR)SFX['roar_'+k]=()=>{duck(3);SFX.impact();ROAR[k]()};

/* ---------- 발소리 (특수 지역만) ---------- */
const STEP={
  cave:v=>{noise({f1:1700,f2:1100,type:'bandpass',q:2.4,dur:0.05,vol:0.05*v});noise({f1:1500,f2:900,type:'bandpass',q:2.4,dur:0.06,vol:0.018*v,delay:0.15})},
  marble:v=>{ping('triangle',940,700,0.035,0.022*v);noise({f1:3600,f2:2400,type:'highpass',dur:0.03,vol:0.03*v});noise({f1:3000,f2:2000,type:'highpass',dur:0.03,vol:0.01*v,delay:0.11})},
  sand:v=>noise({f1:1300,f2:480,dur:0.1,vol:0.045*v,att:0.025}),
  wood:v=>{ping('triangle',175,118,0.055,0.05*v);noise({f1:850,f2:400,dur:0.04,vol:0.025*v})},
};
function stepKind(tx,ty){const a=curArea.id,t=tile(tx,ty);if(a==='mine')return 'cave';if(a==='tower')return 'marble';if(a==='room'||t===T.BRIDGE)return 'wood';if(a==='desert')return t===T.RFLOOR?null:'sand';return null}
let stepT=0,ambT=0,evT=2,crkT=0;
EXT.update.push((dt,tx,ty)=>{
  if(!S.sound||!P.moving||P.auto||P.dashT>0){stepT=Math.min(stepT,0.08);return}
  stepT-=dt;if(stepT>0)return;stepT=P.giant?0.5:0.3;const k=stepKind(tx,ty);if(k)STEP[k](P.mini?0.55:1);
});

/* ---------- 지역 환경음 ---------- */
function windNode(){if(WIND)return WIND;const a=aout();if(!a)return null;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=NBUF;s.loop=true;f.type='bandpass';f.Q.value=0.6;f.frequency.value=500;g.gain.value=0;s.connect(f);f.connect(g);g.connect(OUT);s.start();return WIND={f,g}}
function nearFire(){let best=1e9;BEACONS.forEach((b,i)=>{if(BS[i].state!=='off'&&b.tx>=curArea.x0&&b.tx<curArea.x1)best=Math.min(best,Math.hypot(b.tx*16+8-P.x,b.ty*16-P.y))});for(const o of OBJS)if(o.k==='fire'&&o.tx>=curArea.x0&&o.tx<curArea.x1)best=Math.min(best,Math.hypot(o.tx*16+8-P.x,o.ty*16-P.y));return best}
EXT.ambient.push(dt=>{
  if(!AC||AC.state!=='running'||!curArea)return;
  const on=S.sound&&mode!=='title'&&!CINE,id=curArea.id,forest=id==='over'&&P.x>=FX*16,village=id==='over'&&inRect(VILLAGE,Math.floor(P.x/16),Math.floor(P.y/16));
  ambT-=dt;if(ambT<=0){ambT=0.3;const w=windNode();if(w){let v=0,fq=500;
      if(on){if(id==='desert'){const st=typeof storm!=='undefined'&&storm>0;v=st?0.11:0.03;fq=st?1000:560}else if(id==='tower'){v=0.014;fq=1500}else if(id==='mine'){v=0.012;fq=140}else if(forest){v=0.014;fq=340}else if(id==='over'&&!village){v=0.007;fq=420}}
      const t=AC.currentTime;w.g.gain.setTargetAtTime(v*(0.8+Math.sin(time*0.7)*0.2),t,0.4);w.f.frequency.setTargetAtTime(fq*(1+Math.sin(time*0.31)*0.2),t,0.5)}}
  if(!on)return;
  evT-=dt;if(evT<=0){
    if(id==='mine'){evT=rand(1.8,4.5);const f=rand(900,1500);ping('sine',f,f*0.6,0.09,0.035);ping('sine',f*0.98,f*0.6,0.09,0.012,0.17)}
    else if(id==='tower'){evT=rand(4,8);chime([[1568,2093],[1760,2349],[1318,1976]][Math.floor(Math.random()*3)],0.012,0.25,1.2)}
    else if(forest||(id==='over'&&!BOSS)){evT=rand(village?3:1.4,village?6:3.6);const f=rand(4200,4900),n=3+Math.floor(Math.random()*3);for(let i=0;i<n;i++)ping('triangle',f,f*1.02,0.03,village?0.007:0.012,i*0.06)}
    else if(id==='tiny'){evT=rand(2,4);const f=rand(2600,3200);for(let i=0;i<5;i++)ping('triangle',f,f*1.03,0.04,0.014,i*0.05)}
    else evT=2;}
  crkT-=dt;if(crkT<=0){const d=nearFire();if(d<110){const k=1-d/110;crkT=rand(0.06,0.3);noise({f1:rand(2200,4200),f2:1800,type:'highpass',dur:0.025,vol:0.035*k});if(Math.random()<0.15)noise({f1:500,f2:200,dur:0.12,vol:0.02*k})}else crkT=0.4}
});
})();
