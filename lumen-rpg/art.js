'use strict';
/* =========================================================
   큰 그림: 대화창 초상화, 보스 등장 그림, 시작·장 제목 화면,
   막간·에필로그 전용 그림. 전부 코드로 그리는 도트 일러스트.
   ========================================================= */

/* ---------- 사람 초상화 (64×64, 옵션으로 얼굴을 바꾼다) ---------- */
const HOODS={
  teal:['#b8e6ee','#7fc4d4','#3d8298','#2f6f86','#1f4a5e'],purple:['#d8ccf0','#b0a0d0','#8a76aa','#6e5a8a','#4a3c62'],green:['#d0f0b8','#a6d88a','#6aaa58','#5a9a4a','#3a6e34'],
  orange:['#ffd0a8','#f0a070','#c86a44','#b4583a','#7a3a28'],olive:['#d8e0a0','#a8b870','#7a8a44','#6a7a3a','#4a5628'],slate:['#c8ccd8','#9aa0b0','#6a7080','#5a6070','#3a3e4c'],
  ash:['#b0acb8','#8a8490','#5e5868','#4a4858','#2e2c3a'],sand:['#f8f0d8','#e8dcb8','#d0bc90','#c8b48a','#a08a60'],sea:['#c0e8f4','#8ac4d8','#5a9ab0','#4a8aa0','#2e6278'],
  black:['#6a6470','#5e5866','#3e3a46','#34303a','#201c26'],tan:['#e8dcc0','#c4b48a','#9a8a66','#8a7a5a','#6a5c42']};
const TAN=['#d8a880','#b08460','#f0c8a0'],PALE=['#e8e0d8','#b8aea4','#f8f4ee'],SKIN=['#f2c6a0','#c98f6e','#ffe0b8'];
const CAST={
  me:{hood:'teal',hair:['#5a3a2a','#7a5238'],mouth:'smile',blush:1,clasp:1},
  elder:{hood:'purple',hair:['#e8e4f0','#c8c4d8'],eyes:'closed',wrinkle:1,mouth:'smile',fringe:'flat',brow:'#c8c4d8'},
  kid:{hood:'green',hair:['#c06a3a','#e08a4a'],freckle:1,mouth:'grin',blush:1,big:1},
  moru:{hood:'orange',hair:['#7a2a1a','#a83a24'],goggles:1,soot:1,mouth:'grin',brow:'#7a2a1a'},
  herb:{hood:'olive',hair:['#f0ece4','#c8c4d0'],eyes:'closed',bushy:1,beard:'long',wrinkle:1,fringe:'none'},
  grandpa:{hood:'slate',hair:['#b8b4c0','#8a8690'],lamp:1,beard:'short',wrinkle:1,mouth:'smile',fringe:'flat'},
  seha:{hood:'ash',hair:['#c8c8d8','#e8e8f4'],skin:PALE,mask:'half',eyes:'sharp',mouth:'flat',brow:'#8a8898'},
  harin:{hood:'sand',hair:['#3a2a26','#5a4238'],skin:TAN,paint:1,mouth:'smile',wrinkle:1,fringe:'flat'},
  jeti:{hood:'sea',hair:['#2a2020','#4a3a34'],skin:TAN,beard:'mustache',mouth:'grin',earring:1,fringe:'flat'},
  orban:{hood:'black',mask:'full',fringe:'none'},
  master:{hood:'tan',hair:['#f0ece4','#c8c4d0'],eyes:'closed',beard:'mustache',mcol:'#f0ece4',wrinkle:1,mouth:'smile',fringe:'flat',brow:'#f0ece4'},
};
function bustFn(o){
  const H=HOODS[o.hood],sk=o.skin||SKIN,hair=o.hair||['#5a3a2a','#7a5238'],FR=o.big?1.08:1;
  return(x,y)=>{const X=x+26,Y=y+30,px=X+.5,py=Y+.5,hx=58,hy=62,r=((px-hx)/26)**2+((py-hy)/28)**2;
    if(o.lamp&&Math.hypot(px-61,py-43)<5){const d=Math.hypot(px-61,py-43);return d<2.4?'#fff8d8':(d<3.8?'#ffd36b':'#4e5260')}
    if(o.goggles&&py>43&&py<51&&px>44&&px<80&&r<1){const a=Math.hypot(px-53,py-47),b=Math.hypot(px-71,py-47);if(a<3.6||b<3.6)return (a<1.5||b<1.5)?'#e0fbff':'#8ad0e8';return (a<4.8||b<4.8)?'#c9a24a':'#3a3048'}
    if(o.earring&&Math.hypot(px-45.5,py-79)<2.2)return '#ffd36b';
    if(r<1){
      const fx=62,fy=67,fr=((px-fx)/(16.5*FR))**2+((py-fy)/(18.5*FR))**2;
      if(fr<1&&py<88){
        if(o.mask==='full'||(o.mask==='half'&&px<fx+0.5)){
          if(py>64.2&&py<67.2&&(Math.abs(px-54)<3.6||(o.mask==='full'&&Math.abs(px-69.5)<3.6)))return (Y===65)?'#ff7a5a':'#c0392b';
          if(Math.abs(px-(58+Math.sin(py*0.7)*1.6))<0.7&&py>49&&py<(o.mask==='full'?72:80))return '#8a8074';
          if(o.mask==='half'&&px>fx-1)return '#a89c90';
          return fr>0.8?'#b8ae9c':(px<54?'#fbf6ec':'#e8e0d0')}
        if(o.fringe!=='none'&&py<51.5+(o.fringe==='flat'?0.5:Math.abs(((X+2)%8)-4)*1.3)-(px<54?2:0))return (X>>1)%3===0?hair[1]:hair[0];
        if(o.lamp&&py<50)return py<48.5?'#7a7e8e':'#4e5260';
        for(const ex of[54,69]){if(o.mask==='half'&&ex===54)continue;
          if(o.bushy&&py>59.5&&py<63.5&&Math.abs(px-ex)<4.6)return (X+Y)%3===0?'#c8c4d0':'#f0ece4';
          if(o.eyes==='closed'){if((Y===67&&Math.abs(px-ex)<2.6)||(Y===66&&Math.abs(px-ex)>=2&&Math.abs(px-ex)<3.6))return '#3a2a26'}
          else{const h=o.eyes==='sharp'?2.1:(o.big?3.8:3.2);if(Math.abs(px-ex)<2.2&&py>67.8-h&&py<67.8+h)return (X===ex-2&&Y===Math.ceil(67.8-h))?'#ffffff':((Y===Math.floor(67.8+h-0.6)&&X===ex+1)?'#ffb44a':'#1a1426')}
          if(!o.bushy&&Y===(o.eyes==='sharp'?63:62)&&Math.abs(px-ex)<3.4)return o.brow||hair[0]}
        if(o.wrinkle&&((Y===72&&(Math.abs(px-54)<3||Math.abs(px-69)<3))||(Y===57&&px>56&&px<68&&X%2===0)))return sk[1];
        if(o.freckle&&(Y===74||Y===76)&&(X===50||X===53||X===71||X===74))return '#c08060';
        if(o.soot&&Math.hypot(px-72.5,py-76)<2.8)return '#5a4a48';
        if(o.paint&&py>71&&py<73.4&&(Math.abs(px-52.5)<4||Math.abs(px-71)<4))return '#4a8aa0';
        if(o.beard==='long'&&py>75.5&&((px-fx)/14)**2+((py-81)/9)**2<1)return (X+Y)%4===0?'#c8c4d0':'#f0ece4';
        if(o.beard==='short'&&py>76.5&&fr>0.5)return (X+Y)%3===0?'#8a8690':'#b8b4c0';
        if(o.beard==='mustache'&&py>75.4&&py<78.6&&Math.abs(px-62)<7.5&&Math.abs(px-62)>0.7)return o.mcol||'#3a2a26';
        if(X===62&&(Y===73||Y===74))return sk[1];
        if(o.mouth==='grin'){if(py>77.5&&py<81.5&&Math.abs(px-62)<4.6-(py-77.5)*0.5)return (Y===78&&Math.abs(px-62)<3.6)?'#ffffff':'#8a3a34'}
        else if(o.mouth==='flat'){if(Y===79&&px>59&&px<66)return '#8a5a52'}
        else if(o.mouth==='smile'){if((Y===79&&X>=59&&X<=64)||(Y===78&&(X===58||X===65)))return '#b06a5a'}
        if(o.blush&&py>73&&py<77&&(Math.abs(px-51)<2.5||Math.abs(px-72.5)<2.5))return '#e8a08a';
        if((fr>0.8&&px>fx)||py>83)return sk[1];if(px<53&&py>69)return sk[2];return sk[0]}
      if(r>0.84&&px<hx+4)return H[0];
      const t=(px-hx)+(py-hy)*0.4;return t<-17?H[1]:(t<0?H[2]:(t<15?H[3]:H[4]))}
    if(o.beard==='long'&&py>=84&&py<94&&Math.abs(px-62)<10-(py-84)*0.9)return (X+Y)%4===0?'#c8c4d0':'#f0ece4';
    if(py>=86&&py<95&&Math.abs(px-60)<23-(py-86)*0.3){if(o.clasp&&Math.abs(px-61)<2.6&&py>88&&py<93)return '#ffd36b';return py<88?H[0]:H[1]}
    if(py>=90){const hw=27+(py-90)*0.3;if(Math.abs(px-60)<hw){const rel=(px-60)/hw,fold=Math.sin(px*0.42+Math.sin(py*0.05)*2);if(rel<-0.84)return H[1];if(fold>0.86)return H[4];if(fold<-0.9)return H[2];return rel>0.2?H[4]:H[3]}}
    return null};
}
/* ---------- 사람이 아닌 얼굴들 (64×64) ---------- */
const BEAST={
  owl:(x,y)=>{const px=x+.5,py=y+.5;if(Math.abs(Math.abs(px-32)-15)<4-(26-py)*0.0&&py>6&&py<18&&Math.abs(Math.abs(px-32)-15)<(py-5)*0.5)return '#5a4030';
    if(((px-32)/23)**2+((py-38)/25)**2>=1)return null;
    for(const s of[-1,1]){const e=Math.hypot(px-(32+s*10.5),py-30);if(e<9)return e<3.4?((x===Math.round(31+s*10.5-1)&&y===28)?'#ffffff':'#1a1426'):(e<7?'#ffd36b':(e<8?'#eaa63a':'#5a4030'))}
    if(Math.abs(px-32)<3.4-(py-34)*0.5&&py>33&&py<41)return px<32?'#f0b84a':'#c8862a';
    if(((px-32)/14)**2+((py-50)/13)**2<1)return (x+y*2)%5===0?'#b8a888':'#d8c8a8';
    return px<16?'#a8845c':(px>48?'#5a4030':((x*3+y)%7===0?'#7a5a3e':'#8a6a4a'))},
  scare:(x,y)=>{const px=x+.5,py=y+.5;
    if(py>16&&py<21&&Math.abs(px-32)<25)return py<18?'#5a4030':'#3a2a20';if(py<=17&&py>3&&Math.abs(px-32)<12-(py<7?7-py:0)){return py>13?'#8a2a2a':(px<28?'#5a4030':'#3a2a20')}
    if(py>54&&Math.abs(px-32)<17&&(x+y)%3!==0)return (x%2)?'#e8c45a':'#b8902e';
    if(((px-32)/18)**2+((py-37)/19)**2>=1)return null;
    for(const s of[-1,1]){const ex=32+s*8;if(py>29&&py<37&&Math.abs(px-ex)<(py-29)*0.6+0.6)return py>34?'#fff2b0':'#ff8a3a'}
    if(py>44&&py<49&&Math.abs(px-32)<11){if(y===46)return '#2a1a14';if(Math.abs(((x+1)%4)-1.5)<0.6)return '#2a1a14'}
    if(Math.abs(px-43)<3.5&&Math.abs(py-41)<3.5)return (x+y)%2?'#8a6a48':'#7a5a3a';
    return px<24?'#e0bc80':(px>42||py>50?'#9a7848':((x+y*3)%11===0?'#b8925c':'#c9a46a'))},
  root:calm=>(x,y)=>{const px=x+.5,py=y+.5,L=calm?['#2a5a34','#3e7a44','#5e9e58','#86c070']:['#2a2040','#3e3058','#564474','#6e5a90'];
    if([[32,10,20],[12,18,13],[52,18,13],[32,20,16]].some(([cx,cy,r])=>(px-cx)**2+((py-cy)*1.3)**2<r*r)&&py<28+Math.sin(px*0.6)*2){if(calm&&h2(x,y,201)>0.93)return '#ffd6f0';if(!calm&&h2(x,y,202)>0.92)return '#b06ae0';const s=(px-14)*0.3+(py-4)*0.9+(h2(x>>1,y>>1,203)-0.5)*8;return L[s<6?3:s<13?2:s<20?1:0]}
    if(Math.abs(px-32)>21+(py>52?(py-52)*0.8:0))return null;
    for(const s of[-1,1]){const ex=32+s*9;if(Math.abs(px-ex)<4.5&&py>32&&py<41){const d=Math.hypot(px-ex,py-36.5);return d<1.8?(calm?'#ffe08a':'#d07aff'):(d<3?(calm?'#8a6a2a':'#5a2a7a'):'#120a14')}}
    if(py>46&&py<52&&Math.abs(px-32)<8-(py>50?2:0))return '#120a14';
    const bk=calm?['#3e2a1c','#5a3e26','#7a5634','#8f6a44']:['#2e2228','#463440','#5e4a58','#6e5a68'];
    if((x*5+Math.floor(y/4))%7===0)return bk[0];return px<20?bk[3]:(px>44?bk[1]:bk[2])},
  mole:calm=>(x,y)=>{const px=x+.5,py=y+.5;
    if((y===44||y===48)&&Math.abs(px-32)>13&&Math.abs(px-32)<29)return '#c8c0b0';
    if(((px-32)/25)**2+((py-37)/23)**2>=1)return null;
    if(py<25){if(Math.hypot(px-32,py-17)<5){const d=Math.hypot(px-32,py-17);return d<2.6?(calm?'#fff8d8':'#8a7a5a'):(calm?'#ffd36b':'#5a5040')}if((x===16&&y===23)||(x===47&&y===23)||(x===24&&y===17)||(x===40&&y===17))return '#d8dce8';return py>22.5?'#4e5260':(px<26?'#a8acbc':'#7a7e8e')}
    for(const s of[-1,1]){const d=Math.hypot(px-(32+s*11),py-33);if(d<3)return calm?(d<1.2&&s<0?'#e8eef8':'#120e14'):(d<1.6?'#c8c8d8':'#8a8a98')}
    if(((px-32)/7)**2+((py-43)/5)**2<1)return py<41?'#f0a0b0':'#d07a8a';
    if(py>48&&py<54&&Math.abs(px-32)<4&&x!==32)return '#f4ecdc';
    if(((px-32)/13)**2+((py-46)/9)**2<1)return '#6e6272';
    return (px-32)+(py-37)<-8?'#5e5468':(px>44?'#3a3442':'#4a4252')},
  whale:(x,y)=>{const px=x+.5,py=y+.5;
    if(((px-40)/42)**2+((py-34)/26)**2>=1||px>63.5)return null;
    {const d=Math.hypot(px-22,py-30);if(d<5.5)return d<2.2?((x===20&&y===28)?'#ffffff':'#1a1426'):(d<4.2?'#4a6a8a':'#8a7a5e')}
    if(Math.abs(py-(46+Math.sin(px*0.12)*2))<0.8&&px>6&&px<50)return '#3a3028';
    if(py>47+Math.sin(px*0.12)*2)return (x+y)%6===0?'#d8c8a0':'#ece0bc';
    if(h2(x>>1,y>>1,204)>0.86)return '#8a7a5e';return py<22?'#c8b690':'#a89672'},
  rat:(x,y)=>{const px=x+.5,py=y+.5;
    if(py<14&&py>3&&Math.abs(px-32)<10&&(py>9||Math.floor(px)%5<3))return (x+y)%4===0?'#fff2b0':'#e8c45a';
    for(const s of[-1,1]){const d=Math.hypot(px-(32+s*18),py-22);if(d<9)return d<5.5?'#c88a9a':'#3d3260'}
    if(((px-32)/20)**2+((py-38)/19)**2>=1)return null;
    for(const s of[-1,1]){const d=Math.hypot(px-(32+s*8),py-34);if(d<3.4)return d<1.4?'#fff2b0':'#ff4a5a'}
    if(Math.hypot(px-32,py-47)<3.2)return '#e08a9a';
    if((y===46||y===49)&&Math.abs(px-32)>5&&Math.abs(px-32)<19)return '#8a7ab0';
    if(py>50&&py<55&&Math.abs(px-32)<3.5&&x!==32)return '#f4ecdc';
    return px<22?'#5a4a84':(px>42||py>48?'#2a2246':'#3d3260')},
};
const ARTC={};
function bustCv(id){
  if(ARTC[id])return ARTC[id];
  const fn=CAST[id]?bustFn(CAST[id]):({owl:BEAST.owl,scare:BEAST.scare,root:BEAST.root(true),rootX:BEAST.root(false),mole:BEAST.mole(true),moleX:BEAST.mole(false),whale:BEAST.whale,ratK:BEAST.rat})[id];
  return ARTC[id]=fn?gridSprite(64,64,fn,'#120e1c'):null;
}
const WHO_ART={me:'me',owl:'owl',elder:'elder',kid:'kid',moru:'moru',herb:'herb',grandpa:'grandpa',seha:'seha',harin:'harin',jeti:'jeti',orban:'orban',master:'master',boss:'scare',boss2:'rootX',root:'root',boss3:'moleX',mole:'mole',bahar:'whale',ratking:'ratK'};
const PBG={me:'#2a3a52',owl:'#3a3044',moru:'#4a2e2a',seha:'#2a2a3a',orban:'#1a1420',boss:'#3a2418',boss2:'#241a38',boss3:'#221e2c',ratking:'#2a1e3e',bahar:'#4a3e2a',root:'#1e3424',kid:'#2a4030',harin:'#4a3e2a',jeti:'#22404a'};

/* 대화창 초상화를 큰 그림으로 바꾼다 */
drawPortrait=function(who){
  const pc=$('portrait');if(pc.width!==64){pc.width=64;pc.height=64}
  const x=pc.getContext('2d');x.imageSmoothingEnabled=false;pc.classList.toggle('none',who==='sys');if(who==='sys')return;
  x.fillStyle=PBG[who]||'#2e2840';x.fillRect(0,0,64,64);
  for(let j=0;j<64;j++)for(let i=0;i<64;i++)if(((i+j)&1)&&j>38+Math.sin(i*0.3)*3){x.fillStyle='rgba(0,0,0,0.18)';x.fillRect(i,j,1,1)}
  const g=x.createRadialGradient(22,24,2,22,24,44);g.addColorStop(0,'rgba(255,200,120,0.34)');g.addColorStop(1,'rgba(255,200,120,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
  const b=bustCv(WHO_ART[who]);if(b)x.drawImage(b,0,0);
};
{const st_=document.createElement('style');st_.textContent=`
#portrait{width:calc(var(--u)*44);height:calc(var(--u)*44)}
#dialog{min-height:calc(var(--u)*52)}
#dialog.cine{min-height:0;padding:calc(var(--u)*2.5) calc(var(--u)*5);bottom:calc(var(--u)*3);left:calc(var(--u)*4);right:calc(var(--u)*4);background:rgba(27,22,38,.9)}
#dialog.cine #dText{min-height:0}
#dialog.cine #dName{font-size:max(10px,calc(var(--u)*3.6));margin:0}
#cineArt{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;display:block}
#splash{position:absolute;inset:0;overflow:hidden;background:rgba(7,6,12,.78);display:flex;align-items:center;justify-content:center;cursor:pointer}
#splash .band{position:relative;width:100%;display:flex;align-items:center;gap:calc(var(--u)*8);padding:calc(var(--u)*4) calc(var(--u)*14);background:linear-gradient(90deg,rgba(13,11,20,0),#1b1626 18%,#1b1626 82%,rgba(13,11,20,0));border-block:calc(var(--u)*1) solid var(--accent);animation:spIn .45s cubic-bezier(.2,.9,.3,1)}
#splash.chap .band{flex-direction:column;gap:calc(var(--u)*3);padding:calc(var(--u)*5) 0;border-color:var(--line)}
#splashCv{image-rendering:pixelated;flex:none;height:calc(var(--u)*64);border:2px solid var(--edge);box-shadow:0 0 0 2px var(--line)}
#splash.chap #splashCv{height:auto;width:calc(var(--u)*192);max-width:92%}
.spk{color:var(--accent);letter-spacing:.34em;font-size:max(11px,calc(var(--u)*4.4))}
.spt{font-size:max(22px,calc(var(--u)*13));line-height:1.1;color:var(--ink);text-shadow:0 3px 0 #000,0 0 22px rgba(255,180,74,.45)}
.sps{font-family:var(--f-text);color:var(--muted);font-size:max(12px,calc(var(--u)*4.6));margin-top:4px}
#splash.chap .sptxt{text-align:center}
@keyframes spIn{from{transform:translateX(-40%);opacity:0}to{transform:none;opacity:1}}
#splash.chap .band{animation-name:spUp}
@keyframes spUp{from{transform:translateY(18%);opacity:0}to{transform:none;opacity:1}}
#title{background-size:cover;background-position:center;image-rendering:pixelated;justify-content:flex-end;padding-right:5%}
#title .card{background:rgba(27,22,38,.86)}
@media (max-width:760px){#title{justify-content:center;padding-right:12px}#splash .band{flex-direction:column;gap:8px;padding:10px}}
@media (prefers-reduced-motion:reduce){#splash .band{animation:none}}`;document.head.appendChild(st_);}

/* ---------- 풍경 그림 (크기를 정해서 그린다) ---------- */
const SKYS={night:['#0b0a1c','#141230','#1e1a44','#2a2254','#3a2a58'],dusk:['#141230','#2a2254','#5a3a6a','#a85a6a','#e8a070'],bright:['#6aa8e0','#8ec4ee','#bfe0f2','#eee6c8','#f6d9a0'],cave:['#07060c','#0c0912','#120e1a','#181222','#1e1828']};
function sceneArt(W,H,o){
  const c=mk(W,H),x=c.getContext('2d'),sky=SKYS[o.mood||'night'],cave=o.mood==='cave',br=o.mood==='bright';
  const P=(i,j,col)=>{x.fillStyle=col;x.fillRect(i,j,1,1)};
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){const t=j/(H*0.72)*4,k=Math.min(3,Math.floor(t)),f=t-k;P(i,j,(k<4&&((i+j)&1)&&f>0.5+(h2(i,j,210)-0.5)*0.4)?sky[k+1]:sky[k])}
  if(!br&&!cave)for(let k=0;k<W*0.5;k++){const sx=Math.floor(h2(k,1,211)*W),sy=Math.floor(h2(k,2,211)*H*0.6),b=h2(k,3,211);P(sx,sy,b>0.8?'#ffffff':(b>0.4?'#c8ccff':'#6a68a8'));if(b>0.95){x.fillStyle='#c8ccff';x.fillRect(sx-1,sy,3,1);x.fillRect(sx,sy-1,1,3)}}
  if(br&&o.t==='desert'){x.fillStyle='#fff6d0';x.beginPath();x.arc(W*0.78,H*0.2,H*0.09,0,6.3);x.fill()}
  const hill=(base,amp,seed,cols)=>{for(let i=0;i<W;i++){const top=Math.round(H*(base+Math.sin(i/W*7+seed)*amp+Math.sin(i/W*17+seed*2)*amp*0.4));for(let j=top;j<H;j++)P(i,j,j===top?cols[1]:(((i+j)&3)===0&&j<top+6?cols[1]:cols[0]))}};
  const tri=(cx,top,base,hw,ca,cb)=>{for(let j=Math.round(top);j<base;j++){const w=(j-top)/(base-top)*hw;for(let i=Math.round(cx-w);i<=cx+w;i++)P(i,j,i<cx-w*0.2?ca:cb)}};
  const glow=(gx,gy,r,col)=>{const g=x.createRadialGradient(gx,gy,0,gx,gy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.globalCompositeOperation='lighter';x.fillStyle=g;x.fillRect(gx-r,gy-r,r*2,r*2);x.globalCompositeOperation='source-over'};
  const brazier=(bx,by,s,state)=>{for(let j=0;j<12*s;j++){const w=(3+j/(12*s)*3)*s;for(let i=-w;i<w;i++)P(Math.round(bx+i),Math.round(by-12*s+j),i<-w*0.4?'#a8a4bc':(i>w*0.5?'#55516a':'#77738a'))}
    x.fillStyle='#2a2636';x.fillRect(Math.round(bx-5.5*s),Math.round(by-14.5*s),Math.round(11*s),Math.round(3*s));
    if(state&&state!=='off'){const h=(state==='soft'?5:10)*s;for(let i=-4*s;i<=4*s;i++){const fh=h*(1-Math.abs(i)/(4.6*s))*(0.75+h2(i,7,212)*0.4);for(let j=0;j<fh;j++)P(Math.round(bx+i),Math.round(by-14.5*s-j),j<fh*0.35?'#fff2b0':(j<fh*0.7?'#ffb44a':'#e0603a'))}glow(bx,by-18*s,(state==='soft'?26:44)*s,state==='soft'?'rgba(255,220,150,0.5)':'rgba(255,170,70,0.6)')}};
  const spire=(sx,lit)=>{x.fillStyle=br?'#5a5878':'#120f26';x.fillRect(sx-3,H*0.14,7,H*0.7);x.fillRect(sx-6,H*0.09,13,H*0.06);x.fillRect(sx-2,H*0.03,5,H*0.07);x.fillStyle=lit?'#ffe9a0':'#2a2648';x.fillRect(sx-1,H*0.1,3,H*0.04);if(lit)glow(sx,H*0.12,H*0.3,'rgba(255,220,140,0.55)')};
  const T=o.t,dk=br?0:1;
  if(T==='village'||T==='field'||T==='spire'){
    hill(0.62,0.05,1,br?['#6a9a6a','#8ab87a']:['#16122c','#1e1a3a']);if(T==='spire'||o.spire)spire(Math.round(W*(o.spireX||0.5)),o.lit);
    hill(0.74,0.04,3,br?['#4a8a4a','#6aa85a']:['#1c2a2a','#26403a']);
    if(T==='village'){[[0.14,0.2,0],[0.4,0.24,1],[0.68,0.2,2],[0.9,0.22,0]].forEach(([u,w,k])=>{const cx=W*u,hw=W*w*0.5,top=H*0.52,base=H*0.86,R=[['#7a3428','#a84a3a'],['#2e3a5a','#4a5a8a'],['#30503a','#4a7a4a']][k];
        x.fillStyle=br?'#d8c8a0':'#6a5e58';x.fillRect(cx-hw*0.8,top,hw*1.6,base-top);tri(cx,top-H*0.16,top,hw,br?R[1]:R[0],R[0]);
        for(const s of[-0.45,0.35]){x.fillStyle=o.dark?'#241c32':'#ffd47a';x.fillRect(Math.round(cx+hw*s),Math.round(top+H*0.07),Math.round(hw*0.28),Math.round(H*0.08));if(!o.dark&&!br)glow(cx+hw*s+hw*0.14,top+H*0.11,H*0.14,'rgba(255,200,110,0.4)')}
        x.fillStyle='#5a3e26';x.fillRect(Math.round(cx-hw*0.1),Math.round(base-H*0.15),Math.round(hw*0.24),Math.round(H*0.15))});
      for(let j=Math.round(H*0.86);j<H;j++)for(let i=0;i<W;i++)P(i,j,((j&3)===0||((i+(j>>2)*3)&7)===0)?(br?'#6e6a82':'#2e2a3c'):(br?'#9a96ac':'#46425a'))}
    else{for(let j=Math.round(H*0.84);j<H;j++)for(let i=0;i<W;i++)if(h2(i,j,213)>0.7)P(i,j,br?'#8ac070':'#34584a')}
    if(o.beacon)brazier(W*(o.bx||0.7),H*0.86,H/72,o.beacon);
  }else if(T==='forest'){
    for(let l=0;l<3;l++){const cols=br?[['#7ab080','#5a9a6a'],['#4a8a5a','#3a7248'],['#2e5a3a','#244a30']][l]:[['#1a2a34','#16242e'],['#14222a','#101c24'],['#0e181c','#0a1216']][l];
      for(let k=-1;k<14;k++){const cx=W*((k+h2(k,l,214)*0.7)/(9-l*2)),hw=W*(0.05+l*0.025),base=H*(0.74+l*0.1),top=base-H*(0.34+l*0.1+h2(k,l,215)*0.1);tri(cx,top,base,hw,cols[0],cols[1]);tri(cx,top+H*0.1,base+H*0.06,hw*1.25,cols[0],cols[1])}
      if(!br){x.fillStyle=`rgba(170,196,210,${0.07+l*0.02})`;x.fillRect(0,H*(0.6+l*0.1),W,H*0.1)}}
    x.fillStyle=br?'#2e5a3a':'#0c1418';x.fillRect(0,H*0.9,W,H*0.1);
    if(o.root){const cx=W*0.5,calm=o.root==='calm';x.fillStyle=calm?'#5a3e26':'#463440';x.fillRect(cx-W*0.05,H*0.36,W*0.1,H*0.56);for(const[dx,dy,r]of[[0,0.26,0.17],[-0.1,0.33,0.1],[0.1,0.33,0.1]]){x.fillStyle=calm?'#3e7a44':'#3e3058';x.beginPath();x.ellipse(cx+W*dx,H*dy,W*r,H*r*1.2,0,0,6.3);x.fill()}
      for(let k=0;k<26;k++)P(Math.round(cx+(h2(k,1,216)-0.5)*W*0.36),Math.round(H*(0.14+h2(k,2,216)*0.26)),calm?'#ffd6f0':'#b06ae0');
      for(const s of[-1,1]){x.fillStyle='#120a14';x.fillRect(cx+s*W*0.022-2,H*0.56,4,4);P(Math.round(cx+s*W*0.022),Math.round(H*0.57),calm?'#ffe08a':'#d07aff')}glow(cx,H*0.3,H*0.4,calm?'rgba(255,214,240,0.25)':'rgba(176,106,224,0.3)')}
    if(o.beacon)brazier(W*(o.bx||0.5),H*0.92,H/72,o.beacon);
    if(o.fire){brazier(W*0.5,H*0.95,H/110,'soft')}
  }else if(T==='mine'){
    for(let i=0;i<W;i++){const cH=Math.round(H*(0.2+Math.sin(i*0.09)*0.05+h2(i>>2,1,217)*0.07));for(let j=0;j<cH;j++)P(i,j,j>cH-2?'#3c3246':(h2(i>>1,j>>1,218)>0.7?'#2c2434':'#221c2a'));
      const fH=Math.round(H*(0.8+Math.sin(i*0.05)*0.03));for(let j=fH;j<H;j++)P(i,j,j===fH?'#5a5064':(h2(i,j,219)>0.85?'#463c4a':'#3a3240'))}
    for(let k=0;k<9;k++)tri(W*(0.06+k*0.115+h2(k,2,220)*0.04),H*0.16,H*(0.3+h2(k,3,220)*0.16),W*0.02,'#2c2434','#1a1422');
    for(let k=0;k<7;k++){const cx=W*(0.08+k*0.14+h2(k,4,221)*0.05),pur=k%2,base=H*(0.82+(k%3)*0.03),h=H*(0.1+h2(k,5,221)*0.12);tri(cx,base-h,base,W*0.022,pur?'#b89aff':'#8ae0f4',pur?'#7a5ac8':'#4aa8c8');glow(cx,base-h*0.5,H*0.16,pur?'rgba(150,110,255,0.3)':'rgba(110,210,255,0.3)')}
    if(o.fire)brazier(W*0.5,H*0.92,H/100,'soft');
  }else if(T==='desert'||T==='city'){
    const A=br?['#d8b878','#e8cc90']:['#3a2e3a','#4e3e4a'],B=br?['#c09a58','#d8b070']:['#2a2230','#3a3040'];
    hill(0.6,0.05,2,A);if(T==='city'||o.spire)spire(Math.round(W*(o.spireX||0.8)),o.lit);
    if(o.whale){const cx=W*0.5;x.fillStyle=br?'#a89672':'#5a4e48';x.beginPath();x.ellipse(cx,H*0.7,W*0.24,H*0.14,0,Math.PI,0);x.fill();x.beginPath();x.ellipse(cx+W*0.27,H*0.6,W*0.035,H*0.07,0.5,0,6.3);x.fill();x.beginPath();x.ellipse(cx+W*0.31,H*0.66,W*0.035,H*0.05,-0.4,0,6.3);x.fill();P(Math.round(cx-W*0.16),Math.round(H*0.66),'#1a1426')}
    hill(0.76,0.04,5,B);
    if(T==='city')for(const[u,h,brk]of[[0.1,0.42,0],[0.24,0.3,1],[0.42,0.46,0],[0.6,0.26,1],[0.92,0.4,0]]){const cx=Math.round(W*u),top=Math.round(H*(0.84-h)),w=Math.round(W*0.03);x.fillStyle=br?'#9a94a8':'#3a3648';x.fillRect(cx-w,top,w*2,H*0.86-top);x.fillStyle=br?'#b8b2c4':'#4e4a5e';x.fillRect(cx-w-2,top-(brk?0:3),w*2+4,3);x.fillStyle=br?'#7e788a':'#2a2636';x.fillRect(cx+w-2,top,2,H*0.86-top)}
    if(o.oasis){for(const u of[0.16,0.84]){const cx=W*u;x.fillStyle='#5a3e26';x.fillRect(cx-1,H*0.5,3,H*0.34);for(let k=0;k<6;k++){const a=-2.8+k*0.5;for(let r=0;r<W*0.07;r++)P(Math.round(cx+Math.cos(a)*r),Math.round(H*0.5+Math.sin(a)*r*0.7+r*r*0.012),k%2?'#3a8444':'#6ab45a')}}
      x.fillStyle=br?'#4a8ac0':'#26406a';x.beginPath();x.ellipse(W*0.5,H*0.86,W*0.2,H*0.05,0,0,6.3);x.fill()}
  }else if(T==='tower'){
    for(let j=Math.round(H*0.58);j<H;j++)for(let i=0;i<W;i++){const d=(j-H*0.58)/(H*0.42),cw=Math.floor((i-W/2)/(8+d*26)),ch=Math.floor(Math.log(1+d*6)*4);P(i,j,(cw+ch)&1?'#262448':'#302e5a')}
    x.fillStyle='#0e0c1c';x.fillRect(0,H*0.5,W,H*0.09);for(let k=0;k<5;k++){x.fillStyle='#1a1634';x.fillRect(W*(0.08+k*0.21)-3,0,6,H*0.56)}
    brazier(W*0.5,H*0.66,H/52,o.lamp||'off');
  }else if(T==='tiny'){
    for(let j=Math.round(H*0.5);j<H;j++)for(let i=0;i<W;i++)P(i,j,h2(i>>2,j>>2,222)>0.5?'#2e6034':'#234a2a');
    for(let k=0;k<11;k++){const cx=W*(0.02+k*0.1+h2(k,1,223)*0.04),h=H*(0.6+h2(k,2,223)*0.35);for(let j=0;j<h;j++){const w=(j/h)*W*0.022+1,bend=Math.sin(j*0.03+k)*8*(1-j/h);for(let i=-w;i<w;i++)P(Math.round(cx+i+bend),Math.round(H-h+j),i<0?'#5aa85a':'#3a7a44')}}
    x.fillStyle='#8a5630';x.beginPath();x.ellipse(W*0.74,H*0.12,W*0.16,H*0.3,0.2,0,6.3);x.fill();x.fillStyle='#5a3620';x.fillRect(W*0.6,H*0.36,W*0.3,H*0.05);
    x.fillStyle='rgba(0,0,0,0.3)';x.beginPath();x.ellipse(W*0.72,H*0.8,W*0.18,H*0.06,0,0,6.3);x.fill();
  }
  return c;
}
/* 인물과 작은 생물을 풍경 위에 세운다 */
function composeShot(W,H,spec){
  const c=sceneArt(W,H,spec),x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const cast=spec.cast||[],big=cast.filter(k=>bustCv(k)),small=cast.filter(k=>!bustCv(k)),n=big.length,step=Math.min(50,(W-30)/Math.max(1,n)),x0=W/2-step*(n-1)/2-32+(spec.shift||0);
  big.forEach((k,i)=>{const bx=Math.round(x0+i*step),by=H-72+(i%2?2:0);x.drawImage(bustCv(k),bx,by)});
  const SM={rat:RAT[0],slime:SLIME,spore:SPORE,wolf:WOLF[0]};
  small.forEach((k,i)=>{const s=SM[k];if(!s)return;const sx=Math.round(W*(i%2?0.86-i*0.05:0.06+i*0.05)),sy=H-26-s.height*2-(k==='spore'?18+i*5:0);x.drawImage(s,sx,sy,s.width*2,s.height*2);if(k==='rat'){x.fillStyle='#ff4a5a';x.fillRect(sx+18,sy+6,2,2)}});
  const v=x.createLinearGradient(0,H*0.7,0,H);v.addColorStop(0,'rgba(7,6,12,0)');v.addColorStop(1,'rgba(7,6,12,0.55)');x.fillStyle=v;x.fillRect(0,H*0.7,W,H*0.3);
  return c;
}

/* ---------- 장면별 그림 지정 ---------- */
const SHOT_ART={
  c1:[{t:'field',mood:'night',beacon:'lit',bx:0.5,cast:['rat','rat']},{t:'village',mood:'dusk',cast:['moru']},{t:'village',mood:'night',cast:['elder','owl']}],
  c2:[{t:'forest',mood:'dusk',root:'calm',cast:['herb','spore','spore']},{t:'forest',mood:'night',beacon:'lit',bx:0.2,cast:['seha'],shift:30}],
  c3:[{t:'mine',mood:'cave',fire:1,cast:['moru','grandpa']},{t:'mine',mood:'cave',cast:['mole']},{t:'desert',mood:'bright',cast:['seha'],shift:-40}],
  c4:[{t:'desert',mood:'bright',whale:1,cast:['moru','seha'],shift:-50},{t:'city',mood:'night',cast:['orban']}],
  c5:[{t:'village',mood:'dusk',cast:['me','kid','owl']},{t:'village',mood:'night',cast:['master']},{t:'city',mood:'night',cast:['orban'],shift:30}],
  1:[{t:'village',mood:'bright',cast:['master','elder','kid']},{t:'field',mood:'bright',beacon:'lit',bx:0.6},{t:'forest',mood:'bright',root:'calm',cast:['herb'],shift:-50},{t:'tower',mood:'bright',lamp:'lit',cast:['moru','me','seha']}],
  2:[{t:'village',mood:'night',cast:['elder','kid','rat','rat']},{t:'forest',mood:'night',fire:1,cast:['herb','wolf'],shift:-40},{t:'village',mood:'night',dark:1,cast:['owl']},{t:'tower',mood:'night',lamp:'off',cast:['moru','me','seha']}],
  3:[{t:'village',mood:'dusk',cast:['master','kid','rat','slime']},{t:'forest',mood:'dusk',beacon:'lit',cast:['spore','spore','spore','spore']},{t:'desert',mood:'dusk',oasis:1,cast:['harin','orban','jeti']},{t:'tower',mood:'dusk',lamp:'soft',cast:['moru','me','seha','owl','rat']}],
};
const CHAP_ART={1:{t:'field',mood:'night',beacon:'off',bx:0.7,n:'재울의 등불'},2:{t:'forest',mood:'night',root:'x',n:'안개 숲'},3:{t:'mine',mood:'cave',n:'가라앉은 광산'},4:{t:'desert',mood:'bright',whale:1,n:'잿빛 사막'},5:{t:'tiny',mood:'bright',n:'작은 세계'},6:{t:'spire',mood:'night',n:'별등탑'}};
const BOSS_ART={scare:['scare','어둠 먹은 허수아비','들판의 큰 봉화를 삼킨 자'],root:['rootX','울림뿌리','재에 물든, 숲에서 가장 오래된 나무'],mole:['moleX','무쇠 두더지왕','눈이 먼 기록의 수호자'],whale:['whale','모래 고래 바하르','등에 말뚝이 박힌 사막의 수호자'],ratking:['ratK','찍찍왕','스승의 방을 차지한 그림자 쥐 우두머리'],orban:['orban','재의 사제 오르반','백 년 전, 별등지기의 막내 제자'],ashgiant:['orban','잿빛 거인','탑의 재를 모두 두른 오르반']};

/* ---------- 등장 화면 (보스 · 장 제목) ---------- */
{const d=document.createElement('div');d.id='splash';d.hidden=true;d.innerHTML='<div class="band"><canvas id="splashCv" width="64" height="64"></canvas><div class="sptxt"><div class="spk" id="spK"></div><div class="spt" id="spT"></div><div class="sps" id="spS"></div></div></div>';$('wrap').appendChild(d);d.addEventListener('click',()=>endSplash());
 const cv=document.createElement('canvas');cv.id='cineArt';cv.width=192;cv.height=108;cv.hidden=true;$('wrap').insertBefore(cv,$('dialog'));}
let splashT=0,splashAt=0;
function showSplash(o){
  const cv=$('splashCv'),sp=$('splash');sp.classList.toggle('chap',!!o.chap);cv.width=o.art.width;cv.height=o.art.height;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  if(!o.chap){x.fillStyle=o.bg||'#241a2e';x.fillRect(0,0,cv.width,cv.height);const g=x.createRadialGradient(32,30,2,32,30,46);g.addColorStop(0,'rgba(255,120,80,0.4)');g.addColorStop(1,'rgba(255,120,80,0)');x.fillStyle=g;x.fillRect(0,0,64,64)}
  x.drawImage(o.art,0,0);$('spK').textContent=o.k;$('spT').textContent=o.t;$('spS').textContent=o.s||'';$('spS').hidden=!o.s;
  sp.hidden=false;mode='splash';splashT=o.dur||2.8;splashAt=performance.now();sfx(o.snd||(o.chap?'chapter':'impact'));
}
function endSplash(){if(mode!=='splash'||performance.now()-splashAt<500)return;$('splash').hidden=true;mode='play'}
{const ep0=extPress;extPress=function(a){if(mode==='splash'){if(a==='attack'||a==='interact'||a==='pause')endSplash();return true}return ep0(a)}}
{const b0=banner;banner=function(name,sub){const m=sub&&/^(\d)장/.exec(sub);if(m&&CHAP_ART[m[1]]&&mode==='play'){const A=CHAP_ART[m[1]];return showSplash({chap:1,art:sceneArt(192,72,A),k:`${m[1]}장`,t:A.n,dur:3.2})}b0(name,sub)}}
let seenBoss=null,lastCine=null;
EXT.ambient.push(dt=>{
  if(mode==='splash'){splashT-=dt;if(splashT<=0){splashAt=0;endSplash()}}
  if(!BOSS)seenBoss=null;
  else if(BOSS!==seenBoss&&mode==='play'){seenBoss=BOSS;const A=BOSS_ART[BOSS.kind];if(A)showSplash({art:BOSS.kind==='ashgiant'?AG[0]:bustCv(A[0]),k:'그림자가 깨어난다',t:A[1],s:A[2],snd:'roar_'+BOSS.kind})}
  if(CINE!==lastCine){lastCine=CINE;$('dialog').classList.toggle('cine',!!CINE);const cv=$('cineArt'),sp=CINE&&SHOT_ART[CINE.key]&&SHOT_ART[CINE.key][CINE.idx];
    if(sp){const spec=Object.assign({},sp);if(CINE.key===3&&CINE.idx===2&&S.flags.spareOrban!==1)spec.cast=['harin','jeti'];const a=composeShot(192,108,spec);cv.getContext('2d').drawImage(a,0,0);cv.hidden=false}else cv.hidden=true}
});

/* ---------- 시작 화면 그림 ---------- */
{const a=sceneArt(320,180,{t:'spire',mood:'night',spireX:0.3,beacon:'lit',bx:0.12}),x=a.getContext('2d');x.imageSmoothingEnabled=false;
 x.drawImage(bustCv('me'),70,116);x.drawImage(bustCv('owl'),118,128,40,40);
 const g=x.createRadialGradient(60,150,2,60,150,70);g.addColorStop(0,'rgba(255,180,90,0.45)');g.addColorStop(1,'rgba(255,180,90,0)');x.globalCompositeOperation='lighter';x.fillStyle=g;x.fillRect(0,80,140,100);x.globalCompositeOperation='source-over';
 $('title').style.backgroundImage=`linear-gradient(90deg,rgba(7,6,12,0) 30%,rgba(7,6,12,0.7)),url(${a.toDataURL()})`;}
