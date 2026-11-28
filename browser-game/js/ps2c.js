/* PS2C: Neon Vice's low-poly skinned character builder (models.js), ported to an ES module. Spice Master owns this copy now:
   edit it here (additions are marked 'Spice Master').
   Pure geometry/texture/pose code; three.js glue lives in characters.js. Source: neon-vice models.js. */
export const FX={exlean:0,crouch:0,pump:0};
const FACECFG={"money": {"EM": [168, 192], "prof": [[0, 0], [58, -8], [92, -3], [150, 0]], "hl": 106, "hr": 114}, "don": {"EM": [165, 192], "prof": [[0, 0], [55, -6], [90, -3], [150, 0]], "hl": 92, "hr": 118}, "mcwey": {"EM": [173.6, 192], "prof": [[0, 0], [50.4, -12.3], [85.7, -5.5], [145.7, 0]], "hl": 96, "hr": 114}};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t,hex=h=>[((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];
/* ---------------- vector helpers ---------------- */
const V={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len:a=>Math.hypot(a[0],a[1],a[2]),norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];}};
/* ---------------- skeleton (rest pose, A-pose arms) ---------------- */
const AA=38*Math.PI/180,AD=[Math.sin(AA),-Math.cos(AA),0];
const SH=[0.215,1.425,-0.01],EL=V.add(SH,V.mul(AD,0.3)),WR=V.add(EL,V.mul(AD,0.27)),HT=V.add(WR,V.mul(AD,0.18));
const mir=p=>[-p[0],p[1],p[2]];
const BONES=[ // name, parent, pivot, end
 ['pelvis',-1,[0,0.95,0],[0,1.06,0]],['spine',0,[0,1.06,0],[0,1.26,0]],['chest',1,[0,1.26,0],[0,1.47,0]],['neck',2,[0,1.47,0],[0,1.6,0]],['head',3,[0,1.6,0],[0,1.82,0]],
 ['uarmL',2,SH,EL],['farmL',5,EL,WR],['handL',6,WR,HT],['uarmR',2,mir(SH),mir(EL)],['farmR',8,mir(EL),mir(WR)],['handR',9,mir(WR),mir(HT)],
 ['thighL',0,[0.1,0.93,0],[0.105,0.51,0.01]],['shinL',11,[0.105,0.51,0.01],[0.11,0.1,-0.01]],['footL',12,[0.11,0.1,-0.01],[0.115,0.03,0.17]],
 ['thighR',0,[-0.1,0.93,0],[-0.105,0.51,0.01]],['shinR',14,[-0.105,0.51,0.01],[-0.11,0.1,-0.01]],['footR',15,[-0.11,0.1,-0.01],[-0.115,0.03,0.17]]];
const BI={};BONES.forEach((b,i)=>BI[b[0]]=i);
const KIDS=BONES.map((_,i)=>BONES.map((b,j)=>b[1]===i?j:-1).filter(j=>j>=0));
/* ================= TEXTURES (painted at load, PS2-sized) ================= */
let SKIN=[196,138,102],LAV=[162,132,210],LAVD=[100,76,148],PANTS=[154,126,202],SHD=[40,20,70];
const rgb=(c,a)=>a===undefined?`rgb(${c[0]|0},${c[1]|0},${c[2]|0})`:`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
function loadImg(src,name){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Could not load character artwork: '+name));i.src=src;});}
const HEAD={chinY:1.575,crownY:1.842,neckY:1.47};
/* head: cylindrical unwrap of the face from the artwork, mirrored from its lit half so the face is straight and symmetric */
function paintHead(img,F){const W=256,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 const s=document.createElement('canvas');s.width=img.width;s.height=img.height;const sx=s.getContext('2d');sx.drawImage(img,0,0);const S=sx.getImageData(0,0,s.width,s.height).data,SW=s.width,SH=s.height;
 const samp=(px,py)=>{px=clamp(px,0,SW-1.001);py=clamp(py,0,SH-1.001);const x0=px|0,y0=py|0,fx=px-x0,fy=py-y0,o=[0,0,0];for(let k=0;k<3;k++){const a=S[(y0*SW+x0)*4+k],b=S[(y0*SW+x0+1)*4+k],cc=S[((y0+1)*SW+x0)*4+k],d=S[((y0+1)*SW+x0+1)*4+k];o[k]=(a*(1-fx)+b*fx)*(1-fy)+(cc*(1-fx)+d*fx)*fy;}return o;};
 /* crop space (2x): skull ellipse, crown & chin rows; facial midline runs from between the eyes (row 193) to the mouth (row 283) */
 const ecx=176,ecy=196,erx=110,ery=150,crown=46,chin=344,mid=sy=>196-(sy-180)*0.06;
 /* match the base skin to the face's own skin tone (cheeks + forehead) */
 {let a=[0,0,0],n=0;for(const [px,py] of F.skin){const c=samp(px,py);a=a.map((v,k)=>v+c[k]);n++;}SKIN=a.map(v=>v/n);if(F.hairPt){const h=samp(...F.hairPt);F.hair=h.map(v=>v*0.9);}if(F.beardPt){const b=samp(...F.beardPt);F.beard=b.map(v=>v*0.9);}}
 const out=x.createImageData(W,H),D=out.data;
 for(let V=0;V<H;V++){const t=1-V/(H-1),Y=lerp(HEAD.neckY,HEAD.crownY,t);const sy=chin-(Y-HEAD.chinY)/(HEAD.crownY-HEAD.chinY)*(chin-crown);
  const dy=(sy-ecy)/ery,xr=Math.abs(dy)<1?ecx+erx*Math.sqrt(1-dy*dy):0,cxr=mid(sy),half=xr-cxr,neck=Y<HEAD.chinY-0.045;
  for(let U=0;U<W;U++){const ph=(U/(W-1)-0.5)*2*Math.PI;const ap=Math.abs(ph);let base=SKIN;if(F.hair&&Y>1.775-0.12*clamp((ap-1.1)/1.7,0,1))base=F.hair;else if(F.beard&&Y>(F.beardBot||1.552)&&Y<(F.beardTop||1.665)+0.03*clamp((ap-1.0)/0.4,0,1)*(ap<1.75?1:0)&&ap<2.35)base=F.beard;if(base===F.beard&&Y<(F.beardBot||1.552)+0.03){const k=(Y-(F.beardBot||1.552))/0.03;base=SKIN.map((v,i)=>v+(F.beard[i]-v)*k);}if(base===SKIN&&Y<HEAD.chinY)base=SKIN.map(v=>v*0.93);let col=base.map(v=>v*(0.8+0.2*Math.max(0,Math.cos(ph)))*(0.92+0.08*t));
   const lim=1.38;const hw=Math.abs(dy)<1?erx*Math.sqrt(1-dy*dy):0;if(!neck&&Math.abs(ph)<lim&&hw>8){const qy=sy-192,mq=profAt(F.prof,qy),sk=176-F.EM[0],qx=F.hl?mq+Math.sin(ph)*(ph<0?F.hl:F.hr)*0.92*Math.sqrt(Math.max(0,1-dy*dy)):sk+Math.sin(ph)*hw*0.86+(mq-sk)*Math.pow(Math.cos(ph),2),TS=F.TS||0,TC=Math.sqrt(1-TS*TS),a=(()=>{const qq=Math.min(qy,chin-192+10);return samp(F.EM[0]+qx*TC-qq*TS,192+qx*TS+qq*TC);})(),sm=e=>e*e*(3-2*e),f=sm(clamp((lim-Math.abs(ph))/0.6,0,1))*sm(clamp((hw-8)/34,0,1))*sm(clamp((sy-crown)/40,0,1))*sm(clamp((Y-HEAD.chinY+0.045)/0.05,0,1));col=col.map((v,k)=>lerp(v,a[k],f));}
   const o=(V*W+U)*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}}
 x.putImageData(out,0,0);
 /* hand-painted PS2 face (symmetric, one nose), drawn at 2x on a 512 sheet */
 const c2=document.createElement('canvas');c2.width=c2.height=512;const y=c2.getContext('2d');y.imageSmoothingQuality='high';y.drawImage(c,0,0,512,512);
 y.save();y.scale(2,2);const fy=(HEAD.crownY-1.676)/(HEAD.crownY-HEAD.neckY)*256;y.translate(128,fy);y.scale(1.4,1.22);y.translate(-128,-fy);y.restore();
 x.clearRect(0,0,W,H);c.width=c.height=512;c.getContext('2d').drawImage(c2,0,0);const x2=c.getContext('2d');x2.scale(2,2);
 paintEars(x2);x2.setTransform(1,0,0,1,0,0);x2.fillStyle='#5a3418';x2.fillRect(0,0,24,6);x2.fillStyle='#ff8a2a';x2.fillRect(28,0,20,6);x2.fillStyle='#e8e0d4';x2.fillRect(52,0,20,6);if(F.glassesSwatch){x2.fillStyle='#0b0b0e';x2.fillRect(244,0,24,6);}return c;}
function profAt(P,q){if(q<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(q<=P[i][0]){const a=P[i-1],b=P[i];return a[1]+(b[1]-a[1])*(q-a[0])/(b[0]-a[0]);}return P[P.length-1][1];}
let FO={calm:0,brow:'#1e100a',fem:0};
function paintFace(y){const C=128,dk=SKIN.map(v=>v*0.62),md=SKIN.map(v=>v*0.8),lt=SKIN.map(v=>Math.min(255,v*1.12)),INK='rgba(38,18,14,';
 const V=Y=>(HEAD.crownY-Y)/(HEAD.crownY-HEAD.neckY)*256,U=xm=>C+Math.asin(clamp(xm/0.108,-1,1))/(2*Math.PI)*256;
 const ell=(cx,cy,rx,ry,col,rot)=>{y.fillStyle=col;y.beginPath();y.ellipse(cx,cy,rx,ry,rot||0,0,6.3);y.fill();};
 const soft=(cx,cy,rx,ry,col)=>{const g=y.createRadialGradient(cx,cy,0,cx,cy,1);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');y.save();y.translate(cx,cy);y.scale(rx,ry);y.fillStyle=g;y.fillRect(-1,-1,2,2);y.restore();};
 const sym=f=>{f(1);f(-1);};
 /* shading: brow ridge, cheekbones, jaw, under-chin; warm cheeks */
 soft(C,V(1.6),34,12,rgb(dk,0.35));sym(s=>soft(C+s*21,V(1.66),9,12,'rgba(200,90,70,.18)'));sym(s=>soft(C+s*26,V(1.63),8,18,rgb(dk,0.22)));
 soft(C,V(1.77),30,10,rgb(lt,0.25));sym(s=>soft(C+s*14,V(1.712),10,6,rgb(dk,FO.fem?0.28:0.6)));
 /* forehead creases */
 if(!FO.fem){y.strokeStyle=INK+'.22)';y.lineWidth=0.8;for(const yy of [1.775,1.79]){y.beginPath();y.moveTo(C-15,V(yy)+1);y.quadraticCurveTo(C,V(yy)-1,C+15,V(yy)+1);y.stroke();}}
 /* eyes: almond whites, brown iris, heavy upper lid, dark bags (women: open almond eyes, light lids, no bags) */
 const ey=V(1.706),ex=U(0.031),eo=FO.fem?1.25:1;sym(s=>{const cx=C+s*(ex-C);
  soft(cx,ey+3,8,4,rgb(dk,FO.fem?0.15:0.5));
  y.fillStyle='#ece4da';y.beginPath();y.moveTo(cx-6.5,ey);y.quadraticCurveTo(cx,ey-3.6*eo,cx+6.5,ey);y.quadraticCurveTo(cx,ey+2.6*eo,cx-6.5,ey);y.fill();
  ell(cx-s*0.6,ey-0.2,2.4,2.4,'#4a2c18');ell(cx-s*0.6,ey-0.2,1.2,1.2,'#0c0604');ell(cx-s*0.6-0.7,ey-1,0.5,0.5,'#fff');
  y.strokeStyle=INK+'1)';y.lineWidth=1.8;y.beginPath();y.moveTo(cx-7,ey+0.3);y.quadraticCurveTo(cx,ey-4.2*eo,cx+7,ey+0.2);y.stroke();
  y.strokeStyle=INK+(FO.fem?'.2)':'.45)');y.lineWidth=0.7;y.beginPath();y.moveTo(cx-5,ey+2.2*eo);y.quadraticCurveTo(cx,ey+3.6*eo,cx+5,ey+2.2*eo);y.stroke();
  /* thick angry brows: low and angled down toward the nose */
  const bt=FO.fem?0.45:1;y.fillStyle=FO.brow;y.beginPath();y.moveTo(cx-s*9.5,ey-3.6-FO.calm*4.5);y.lineTo(cx+s*8.5,ey-9.2+FO.calm*2.2);y.lineTo(cx+s*8,ey-9.2+FO.calm*2.2+3.8*bt);y.lineTo(cx-s*9.5,ey-3.6-FO.calm*4.5+2.2*bt);y.closePath();y.fill();});
 /* frown crease between the brows */
 y.strokeStyle=INK+(0.55*(1-FO.calm))+')';y.lineWidth=0.9;sym(s=>{y.beginPath();y.moveTo(C+s*2,ey-7);y.lineTo(C+s*1.2,ey-2);y.stroke();});
 /* nose: one broad nose, bridge highlight, wing shading, nostrils */
 const nb=V(1.7),nt=V(1.672);y.fillStyle=rgb(lt,0.55);y.beginPath();y.moveTo(C-1.5,nb);y.lineTo(C+1.5,nb);y.lineTo(C+2.5,nt-2);y.lineTo(C-2.5,nt-2);y.fill();
 sym(s=>{soft(C+s*5,nt-6,2.5,9,rgb(dk,0.35));soft(C+s*7,nt,4,3.5,rgb(md,0.8));y.strokeStyle=INK+'.6)';y.lineWidth=0.9;y.beginPath();y.arc(C+s*6.5,nt,3.6,s>0?-1.2:Math.PI-0.3,s>0?0.3:Math.PI+1.2);y.stroke();});
 ell(C,nt-0.5,4,3,rgb(SKIN.map(v=>Math.min(255,v*1.05))));ell(C-0.8,nt-1.5,1.3,1,rgb(lt,0.8));sym(s=>ell(C+s*3.3,nt+2,1.6,1,'rgba(40,14,10,.85)'));
 /* nasolabial folds */
 if(!FO.fem){y.strokeStyle=INK+'.4)';y.lineWidth=0.9;sym(s=>{y.beginPath();y.moveTo(C+s*9,nt+1);y.quadraticCurveTo(C+s*13,V(1.655),C+s*12.5,V(1.638));y.stroke();});}
 /* mouth: firm, corners turned down; full lower lip */
 const my=V(1.646);soft(C,my+3,11,3,rgb([150,70,60],0.5));y.fillStyle='rgb(150,72,62)';y.beginPath();y.moveTo(C-10,my+1.2);y.quadraticCurveTo(C,my-2,C+10,my+1.2);y.quadraticCurveTo(C,my+4.6,C-10,my+1.2);y.fill();
 y.strokeStyle=INK+'1)';y.lineWidth=1.6;y.beginPath();y.moveTo(C-10.5,my+1.8);y.quadraticCurveTo(C-5,my-0.3,C,my+0.3);y.quadraticCurveTo(C+5,my-0.3,C+10.5,my+1.8);y.stroke();
 y.fillStyle=rgb(lt,0.35);y.fillRect(C-4,my+2.4,8,1);soft(C,my+7,7,2.5,rgb(dk,0.4));
 /* chin + jaw line */
 soft(C,V(1.6),8,4,rgb(lt,0.25));y.strokeStyle=INK+'.25)';y.lineWidth=0.8;y.beginPath();y.moveTo(C-3,V(1.598));y.quadraticCurveTo(C,V(1.594),C+3,V(1.598));y.stroke();}
/* Spice Master: toon face matching the cartoon portraits (tools/portraits): clear eye whites with a coloured iris and a catch-light,
   soft rounded brows, a small button nose, rosy cheeks and a simple mouth; no Neon Vice wrinkles, bags or frown.
   T = { iris, brow, browW, calm, squint, mouth: 'smile'|'laugh'|'flat'|'frown'|'grin', fem, old, stache, stacheC, lips } */
function paintToonFace(y,T){const C=128,dk=SKIN.map(v=>v*0.6),lt=SKIN.map(v=>Math.min(255,v*1.14+6)),INK='rgba(42,22,16,',EK=T.eyeK||1;
 const V=Y=>(HEAD.crownY-Y)/(HEAD.crownY-HEAD.neckY)*256,U=xm=>C+Math.asin(clamp(xm/0.108,-1,1))/(2*Math.PI)*256;
 const ell=(cx,cy,rx,ry,col)=>{y.fillStyle=col;y.beginPath();y.ellipse(cx,cy,rx,ry,0,0,6.3);y.fill();};
 const soft=(cx,cy,rx,ry,col)=>{const g=y.createRadialGradient(cx,cy,0,cx,cy,1);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');y.save();y.translate(cx,cy);y.scale(rx,ry);y.fillStyle=g;y.fillRect(-1,-1,2,2);y.restore();};
 const sym=f=>{f(1);f(-1);};
 y.lineCap='round';y.lineJoin='round';
 /* soft modelling: a lit forehead and cheeks, a warm shadow under the brow and down the sides of the nose, under-chin shade */
 soft(C,V(1.77),34,12,rgb(lt,0.32));sym(s=>soft(C+s*19,V(1.668),11,8,rgb(lt,0.22)));
 soft(C,V(1.588),26,8,rgb(dk,0.3));
 /* rosy cheeks (the portraits' blush) */
 sym(s=>soft(C+s*20,V(1.664),9,6,T.fem?'rgba(228,104,100,.5)':'rgba(218,98,84,.42)'));
 /* eyes */
 const ey=V(1.705),ex=U(0.032),open=(T.squint?0.62:T.fem?1.16:1)*(T.lidK||1),ew=7.4*EK,iris=T.iris||[74,48,28];
 sym(s=>{const cx=C+s*(ex-C);
  soft(cx,ey-4,9,3.5,rgb(dk,0.18));
  const top=ey-5.4*open,bot=ey+3.6*open;
  y.save();y.beginPath();y.moveTo(cx-ew,ey+0.4);y.bezierCurveTo(cx-ew*0.6,top,cx+ew*0.6,top,cx+ew,ey-0.2);y.bezierCurveTo(cx+ew*0.55,bot,cx-ew*0.55,bot,cx-ew,ey+0.4);y.closePath();
  y.fillStyle='#f6f1e8';y.fill();y.clip();
  const ix=cx-s*0.4,iy=ey-0.3,ir=3.7*(T.irisK||EK);ell(ix,iy,ir,ir,rgb(iris));ell(ix,iy+0.6,ir*0.75,ir*0.6,rgb(iris.map(v=>Math.min(255,v*1.35+10)),0.6));
  ell(ix,iy,1.8,1.8,'#140a06');ell(ix-1.3,iy-1.4,1.1,1.1,'rgba(255,255,255,.95)');ell(ix+1.2,iy+1,0.45,0.45,'rgba(255,255,255,.7)');
  y.fillStyle=rgb(dk,0.28);y.fillRect(cx-ew,top-2,ew*2,2.6); /* lid shadow on the white */
  y.restore();
  /* bold upper lid line with a little flick, thin lower line */
  y.strokeStyle=INK+'1)';y.lineWidth=1.9;y.beginPath();y.moveTo(cx-s*ew-s*0.3,ey+(s>0?-0.4:0.6));y.bezierCurveTo(cx-ew*0.6*s,top-0.3,cx+ew*0.6*s,top-0.3,cx+s*ew+s*0.9,ey-(s>0?0.2:-0.2));y.stroke();
  y.lineWidth=T.fem?1.4:1.1;y.beginPath();y.moveTo(cx+s*ew,ey-0.3);y.lineTo(cx+s*(ew+1.8),ey-1.6);y.stroke();
  y.strokeStyle=INK+'.45)';y.lineWidth=0.8;y.beginPath();y.moveTo(cx-ew*0.75,ey+1.6*open);y.quadraticCurveTo(cx,bot+0.9,cx+ew*0.75,ey+1.6*open);y.stroke();
  if(T.old){y.strokeStyle=INK+'.28)';y.lineWidth=0.7;for(const k of [0,1]){y.beginPath();y.moveTo(cx+s*(ew+2),ey+0.5+k*2.2);y.lineTo(cx+s*(ew+4.5),ey+1.4+k*3);y.stroke();}}
  /* brows: soft rounded strokes; calm 1 = relaxed and raised, 0 = knitted toward the nose */
  const bw=(T.browW||3.4)*(T.fem?0.62:1),inner=ey-9.4+(1-T.calm)*3.4,outer=ey-9.6-T.calm*0.8,peak=ey-12.4+(1-T.calm)*0.6;
  y.strokeStyle=T.brow;y.lineWidth=bw;y.beginPath();y.moveTo(cx-s*7,inner);y.quadraticCurveTo(cx+s*0.5,peak,cx+s*8.4,outer);y.stroke();});
 /* nose: a button nose with a lit tip and a soft underside (a persiflage head has a sculpted 3D nose instead: just its shadow) */
 const nt=V(1.672);if(T.noNose){soft(C,nt+4,9,3.5,rgb(dk,0.5));sym(s=>soft(C+s*5,nt-5,3,9,rgb(dk,0.22)));}else{soft(C,nt+2.6,7,3,rgb(dk,0.42));sym(s=>soft(C+s*3.6,nt-6,2.2,8,rgb(dk,0.16)));
 ell(C,nt-0.6,4.6,3.6,rgb(SKIN.map(v=>Math.min(255,v*1.04))));ell(C-1,nt-2,1.6,1.1,rgb(lt,0.85));
 y.strokeStyle=INK+'.55)';y.lineWidth=1;y.beginPath();y.moveTo(C-4.6,nt+0.4);y.quadraticCurveTo(C-3.4,nt+3,C-1.2,nt+2.6);y.moveTo(C+4.6,nt+0.4);y.quadraticCurveTo(C+3.4,nt+3,C+1.2,nt+2.6);y.stroke();}
 /* moustache (drawn under the mouth line so the smile shows through its edge) */
 const m=T.mouth||'smile',my=V(1.645)+(T.stache&&m!=='laugh'&&m!=='grin'?2:0); /* a moustache pushes a closed mouth down so the smile shows under it */
 if(T.stache){const sc=T.stacheC||[60,40,28],sy=V(1.645);{const my=sy;y.fillStyle=rgb(sc);y.beginPath();y.moveTo(C,my-5.4);y.bezierCurveTo(C-6,my-8,C-13,my-6,C-14.5,my+1.2);y.bezierCurveTo(C-10,my-0.4,C-4,my-0.6,C,my-1.4);y.bezierCurveTo(C+4,my-0.6,C+10,my-0.4,C+14.5,my+1.2);y.bezierCurveTo(C+13,my-6,C+6,my-8,C,my-5.4);y.fill();
  y.strokeStyle=rgb(sc.map(v=>v*0.42),0.9);y.lineWidth=1;y.stroke();y.strokeStyle=rgb(sc.map(v=>Math.min(255,v*1.5+30)),0.5);y.lineWidth=0.6;for(let i=-3;i<=3;i++){if(!i)continue;y.beginPath();y.moveTo(C+i*3,my-4.4+Math.abs(i)*0.2);y.lineTo(C+i*3.5,my-1.8);y.stroke();}}}
 /* mouth */
 const lip=T.lips||(T.fem?[184,76,72]:[160,80,66]);
 if(m==='laugh'||m==='grin'){const hw=m==='grin'?10:9,dp=m==='grin'?5:7;
  y.save();y.beginPath();y.moveTo(C-hw,my-1);y.quadraticCurveTo(C,my+1.4,C+hw,my-1);y.quadraticCurveTo(C+hw*0.7,my+dp,C,my+dp+0.4);y.quadraticCurveTo(C-hw*0.7,my+dp,C-hw,my-1);y.closePath();
  y.fillStyle='#4a1414';y.fill();y.clip();y.fillStyle='#f8f4ea';y.beginPath();y.moveTo(C-hw,my-2);y.quadraticCurveTo(C,my+0.6,C+hw,my-2);y.lineTo(C+hw,my+1.2);y.quadraticCurveTo(C,my+3.2,C-hw,my+1.2);y.closePath();y.fill();
  ell(C,my+dp+0.6,hw*0.48,2.6,'rgba(214,96,96,.9)');y.restore();
  y.strokeStyle=INK+'1)';y.lineWidth=1.3;y.beginPath();y.moveTo(C-hw,my-1);y.quadraticCurveTo(C,my+1.4,C+hw,my-1);y.quadraticCurveTo(C+hw*0.7,my+dp,C,my+dp+0.4);y.quadraticCurveTo(C-hw*0.7,my+dp,C-hw,my-1);y.stroke();
  sym(s=>{y.lineWidth=1;y.beginPath();y.moveTo(C+s*(hw+0.4),my-1.4);y.quadraticCurveTo(C+s*(hw+2),my-2,C+s*(hw+2.4),my-3.4);y.stroke();});}
 else{const hw=m==='flat'?6.5:m==='frown'?6:8,cv=m==='flat'?0.4:m==='frown'?-2.4:2.6;
  if(T.fem){y.fillStyle=rgb(lip,0.85);y.beginPath();y.moveTo(C-hw*0.85,my);y.quadraticCurveTo(C,my+cv+3.6,C+hw*0.85,my);y.quadraticCurveTo(C,my+cv*0.4,C-hw*0.85,my);y.fill();y.fillStyle=rgb(lip.map(v=>v*0.9),0.75);y.beginPath();y.moveTo(C-hw*0.8,my-0.2);y.quadraticCurveTo(C-3,my-2.4,C,my-1.2);y.quadraticCurveTo(C+3,my-2.4,C+hw*0.8,my-0.2);y.quadraticCurveTo(C,my+cv*0.3,C-hw*0.8,my-0.2);y.fill();}
  else soft(C,my+3.4,6,2,rgb(lip,0.35));
  y.strokeStyle=INK+'1)';y.lineWidth=1.4;y.beginPath();y.moveTo(C-hw,my-cv*0.35);y.quadraticCurveTo(C,my+cv,C+hw,my-cv*0.35);y.stroke();
  if(m==='smile')sym(s=>{y.lineWidth=0.9;y.beginPath();y.moveTo(C+s*(hw-0.2),my-cv*0.35);y.lineTo(C+s*(hw+1.4),my-cv*0.35-1.4);y.stroke();});}
 soft(C,V(1.61),6,3,rgb(lt,0.3)); /* chin light */
}
function paintEars(x){
 /* painted ears (used by the ear flaps), nape crease, a touch of stubble shadow along the jaw */
 for(const ex of [64,192]){const sd=ex>128?1:-1;x.fillStyle=rgb([150,92,70]);x.beginPath();x.ellipse(ex,105,9,19,0,0,6.3);x.fill();x.fillStyle=rgb(SKIN.map(v=>v*1.0));x.beginPath();x.ellipse(ex+sd*2,103,6,15,0,0,6.3);x.fill();x.strokeStyle=rgb([120,70,52],0.7);x.lineWidth=1.5;x.beginPath();x.ellipse(ex,105,10,20,0,0,6.3);x.stroke();}
 x.strokeStyle=rgb([130,80,60],0.35);x.lineWidth=2;x.beginPath();x.moveTo(0,200);x.quadraticCurveTo(12,196,26,201);x.moveTo(256,200);x.quadraticCurveTo(244,196,230,201);x.stroke();}
/* body sheet layout (rows): torso 0-290 · sleeves 290-380 · cuffs 380-400 · swatches 400-440 · trousers 440-512 */
const TY0=0.8,TY1=1.51,ROW={t:290,s0:290,s1:380,c0:381,c1:399,w0:400,w1:440,p0:440,p1:512};
const SW={skin:[0.15,420/512],gold:[0.43,420/512],dial:[(290+20)/512,420/512],shoe:[0.82,420/512]};
function paintBody(pais,B){LAV=B.jacket;LAVD=LAV.map(v=>v*0.62);PANTS=B.pants;SHD=LAV.map(v=>v*0.3);const SHc=a=>rgb(SHD,a);const W=512,c=document.createElement('canvas');c.width=W;c.height=W;const x=c.getContext('2d');
 const ty=Y=>(TY1-Y)/(TY1-TY0)*ROW.t,fx=m=>256+m*340;
 const fabric=(y0,y1,base)=>{x.fillStyle=rgb(base);x.fillRect(0,y0,W,y1-y0);x.save();x.beginPath();x.rect(0,y0,W,y1-y0);x.clip();
  x.globalAlpha=0.09;x.strokeStyle='#3a2a5a';x.lineWidth=1;for(let i=-W;i<W*2;i+=3){x.beginPath();x.moveTo(i,y0);x.lineTo(i+(y1-y0),y1);x.stroke();}
  x.globalAlpha=0.06;x.strokeStyle='#ffffff';for(let i=-W;i<W*2;i+=4){x.beginPath();x.moveTo(i,y1);x.lineTo(i+(y1-y0),y0);x.stroke();}
  const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(255,255,255,0.10)');g.addColorStop(1,SHc(.16));x.globalAlpha=1;x.fillStyle=g;x.fillRect(0,y0,W,y1-y0);x.restore();};
 const line=(pts,w,col)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();x.moveTo(...pts[0]);for(const p of pts.slice(1))x.lineTo(...p);x.stroke();};
 const stitch=(pts,col)=>{x.save();x.setLineDash([3,3]);line(pts,1,col||'rgba(235,225,255,.55)');x.restore();};
 const blob=(cx,cy,rx,ry,col)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,1);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.save();x.translate(cx,cy);x.scale(rx,ry);x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,6.3);x.restore();x.save();x.translate(cx,cy);x.scale(rx,ry);x.fillStyle=g;x.fillRect(-1,-1,2,2);x.restore();};
 const pp=x.createPattern(pais,'repeat');pp.setTransform&&pp.setTransform(new DOMMatrix().scale(B.shirtScale||0.26));
 const INK=rgb(LAV.map(v=>v*0.38),0.85),SEAM=rgb(LAV.map(v=>v*0.48),0.45);
 /* ---- torso ---- */
 fabric(0,ROW.t,LAV);
 /* baked PS2-style shading: underarms & sides darker, chest catch-light, lower-back fold */
 for(const sx of [128,384]){blob(sx,ty(1.36),70,60,SHc(.35));blob(sx,ty(1.0),50,90,SHc(.18));}
 blob(256,ty(1.3),120,50,'rgba(255,255,255,.12)');blob(0,ty(1.05),40,30,SHc(.2));blob(W,ty(1.05),40,30,SHc(.2));
 for(const sd of [-1,1])for(let k=0;k<3;k++){x.strokeStyle='rgba(50,30,90,.22)';x.lineWidth=2;x.beginPath();const cx=256+sd*(150+k*12),cy=ty(1.04+k*0.03);x.moveTo(cx-18,cy);x.quadraticCurveTo(cx,cy+5,cx+18,cy-2);x.stroke();}
 /* seams: side, back, shoulder, darts */
 line([[0,0],[0,ROW.t]],3,SEAM);line([[W,0],[W,ROW.t]],3,SEAM);line([[2,ty(0.97)],[2,ROW.t]],3,'rgba(50,30,80,.7)');line([[W-2,ty(0.97)],[W-2,ROW.t]],3,'rgba(50,30,80,.7)');
 for(const sd of [-1,1]){x.strokeStyle=SEAM;x.lineWidth=2;x.beginPath();x.moveTo(256+sd*128,ty(1.44));x.quadraticCurveTo(256+sd*122,ty(1.15),256+sd*128,ty(0.81));x.stroke();
  line([[256+sd*96,ty(1.47)],[256+sd*170,ty(1.43)]],2,SEAM);line([[fx(sd*0.105),ty(1.26)],[fx(sd*0.11),ty(1.0)]],1.5,'rgba(70,50,110,.3)');}
 const V=Y=>0.012+(Y-1.12)*0.36;
 /* shirt V: paisley from the art, open neck, placket buttons */
 x.save();x.beginPath();x.moveTo(fx(-V(1.12)),ty(1.12));for(let Y=1.12;Y<=1.52;Y+=0.02)x.lineTo(fx(-V(Y)),ty(Y));for(let Y=1.52;Y>=1.12;Y-=0.02)x.lineTo(fx(V(Y)),ty(Y));x.closePath();x.clip();x.fillStyle=pp;x.fillRect(0,0,W,ROW.t);
 const sg=x.createLinearGradient(fx(-0.1),0,fx(0.1),0);sg.addColorStop(0,'rgba(40,20,40,.45)');sg.addColorStop(0.3,'rgba(0,0,0,0)');sg.addColorStop(0.7,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(40,20,40,.45)');x.fillStyle=sg;x.fillRect(0,0,W,ROW.t);
 if(!B.tie&&B.deepV){x.fillStyle=rgb(SKIN.map(v=>v*0.86));x.beginPath();x.moveTo(fx(0),ty(1.2));x.lineTo(fx(-0.085),ty(1.53));x.lineTo(fx(0.085),ty(1.53));x.closePath();x.fill();x.save();x.clip();for(let k=0;k<260;k++){const hx=fx((Math.random()-0.5)*0.12),hy=ty(1.25+Math.random()*0.24);x.strokeStyle='rgba(90,45,25,.45)';x.lineWidth=0.8;x.beginPath();x.moveTo(hx,hy);x.lineTo(hx+(Math.random()-0.5)*3,hy+2+Math.random()*2);x.stroke();}x.restore();}
 if(!B.tie){x.fillStyle=rgb(SKIN.map(v=>v*0.88));x.beginPath();x.moveTo(fx(0),ty(1.41));x.lineTo(fx(-0.06),ty(1.53));x.lineTo(fx(0.06),ty(1.53));x.closePath();x.fill();}
 if(B.tie){const tc=B.tie;x.fillStyle=rgb(tc);x.beginPath();x.moveTo(fx(-0.018),ty(1.48));x.lineTo(fx(0.018),ty(1.48));x.lineTo(fx(0.03),ty(1.2));x.lineTo(fx(0),ty(1.15));x.lineTo(fx(-0.03),ty(1.2));x.closePath();x.fill();x.fillStyle=rgb(tc.map(v=>v*1.3));x.fillRect(fx(-0.022),ty(1.5),fx(0.022)-fx(-0.022),ty(1.47)-ty(1.5));x.strokeStyle='rgba(0,0,0,.4)';x.lineWidth=1;x.stroke();for(let k=0;k<6;k++){x.strokeStyle=rgb(tc.map(v=>v*1.6),0.35);x.beginPath();x.moveTo(fx(-0.03),ty(1.44-k*0.05));x.lineTo(fx(0.03),ty(1.41-k*0.05));x.stroke();}}
 if(B.chains)for(const [d,w] of [[1.44,2.2],[1.38,2.6],[1.31,3.2]]){x.strokeStyle='#8a5a14';x.lineWidth=w+1;x.beginPath();x.moveTo(fx(-0.075),ty(1.52));x.quadraticCurveTo(fx(0),ty(d-0.06),fx(0.075),ty(1.52));x.stroke();x.strokeStyle='#f0c050';x.lineWidth=w;x.stroke();x.strokeStyle='#fff4c0';x.lineWidth=0.8;x.setLineDash([2,3]);x.stroke();x.setLineDash([]);}
 if(B.chain){x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.moveTo(fx(-0.07),ty(1.5));x.quadraticCurveTo(fx(0),ty(1.3),fx(0.07),ty(1.5));x.stroke();x.strokeStyle='#8a5a14';x.lineWidth=1;x.setLineDash([2,2]);x.stroke();x.setLineDash([]);
  const mg=x.createRadialGradient(fx(0),ty(1.32),0,fx(0),ty(1.32),11);mg.addColorStop(0,'#fff4c0');mg.addColorStop(0.6,'#e8b84a');mg.addColorStop(1,'#8a5a14');x.fillStyle=mg;x.beginPath();x.moveTo(fx(0),ty(1.36));x.lineTo(fx(0.028),ty(1.32));x.lineTo(fx(0),ty(1.27));x.lineTo(fx(-0.028),ty(1.32));x.closePath();x.fill();}
 if(!B.tie)line([[fx(0.004),ty(1.4)],[fx(0.004),ty(1.12)]],1.5,'rgba(60,35,45,.6)');if(!B.tie&&!B.chain)for(const Y of [1.36,1.28,1.2]){x.fillStyle='#efe6d6';x.beginPath();x.arc(fx(0.012),ty(Y),2.2,0,6.3);x.fill();}
 x.restore();
 /* lapels: wide notch lapels with drop shadow, ink edge, pick-stitching and a buttonhole */
 for(const sd of [-1,1]){const L=[];for(let Y=1.17;Y<=1.455;Y+=0.015)L.push([fx(sd*V(Y)),ty(Y)]);const R=[];for(let Y=1.455;Y>=1.17;Y-=0.015)R.push([fx(sd*(V(Y)+0.078)),ty(Y)]);
  x.save();x.translate(sd*3,3);x.fillStyle=SHc(.4);x.beginPath();x.moveTo(...L[0]);for(const p of L)x.lineTo(...p);for(const p of R)x.lineTo(...p);x.closePath();x.fill();x.restore();
  const lg=x.createLinearGradient(fx(sd*0.05),0,fx(sd*0.2),0);lg.addColorStop(0,rgb(LAV.map(v=>Math.min(255,v*1.1))));lg.addColorStop(1,rgb(LAV.map(v=>v*0.95)));x.fillStyle=lg;
  x.beginPath();x.moveTo(...L[0]);for(const p of L)x.lineTo(...p);for(const p of R)x.lineTo(...p);x.closePath();x.fill();x.strokeStyle=INK;x.lineWidth=2.5;x.stroke();
  const st=[];for(let Y=1.19;Y<=1.44;Y+=0.015)st.push([fx(sd*(V(Y)+0.068)),ty(Y)]);stitch(st);
  x.fillStyle=rgb(LAVD);x.beginPath();x.moveTo(fx(sd*(V(1.41)+0.078)),ty(1.41));x.lineTo(fx(sd*(V(1.41)+0.106)),ty(1.425));x.lineTo(fx(sd*(V(1.41)+0.078)),ty(1.445));x.fill();
  if(sd>0)line([[fx(V(1.34)+0.03),ty(1.345)],[fx(V(1.34)+0.055),ty(1.35)]],2,'rgba(50,30,90,.8)');
  /* shirt collar points lying over the lapels */
  x.save();x.translate(sd*2,2);x.fillStyle='rgba(30,10,30,.35)';x.beginPath();x.moveTo(fx(sd*0.02),ty(1.385));x.lineTo(fx(sd*0.128),ty(1.432));x.lineTo(fx(sd*0.072),ty(1.5));x.closePath();x.fill();x.restore();
  x.beginPath();x.moveTo(fx(sd*0.02),ty(1.385));x.lineTo(fx(sd*0.128),ty(1.432));x.lineTo(fx(sd*0.072),ty(1.5));x.closePath();x.fillStyle=pp;x.fill();x.strokeStyle='rgba(60,30,50,.85)';x.lineWidth=2;x.stroke();}
 /* front: two buttons with thread, front edge stitching, opening below the button */
 line([[fx(0),ty(1.02)],[fx(-0.07),ty(0.8)]],2,INK);line([[fx(0.006),ty(1.02)],[fx(0.075),ty(0.8)]],2,INK);stitch([[fx(-0.012),ty(1.0)],[fx(-0.074),ty(0.81)]]);
 for(const Y of [1.07,0.97]){x.fillStyle='rgba(30,15,50,.4)';x.beginPath();x.arc(fx(0)+1,ty(Y)+1.5,5,0,6.3);x.fill();x.fillStyle='#4a3866';x.beginPath();x.arc(fx(0),ty(Y),4.6,0,6.3);x.fill();x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.arc(fx(0)-1.5,ty(Y)-1.5,1.6,0,6.3);x.fill();x.fillStyle='#211530';for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])x.fillRect(fx(0)+dx*1.4-0.6,ty(Y)+dy*1.4-0.6,1.2,1.2);}
 /* flap pockets with shadow + ticket pocket */
 for(const sd of [-1,1]){const px=fx(sd*0.15);x.fillStyle=SHc(.35);x.fillRect(px-23,ty(0.985)+10,46,4);x.fillStyle=rgb(LAV.map(v=>v*0.97));x.fillRect(px-23,ty(0.985)-2,46,13);x.strokeStyle=INK;x.lineWidth=1.6;x.strokeRect(px-23,ty(0.985)-2,46,13);stitch([[px-20,ty(0.985)+8],[px+20,ty(0.985)+8]]);}
 x.fillStyle=rgb(LAV.map(v=>v*0.97));x.fillRect(fx(0.15)-14,ty(1.04)-1,28,8);x.strokeStyle=INK;x.lineWidth=1.2;x.strokeRect(fx(0.15)-14,ty(1.04)-1,28,8);
 /* breast pocket welt + folded white pocket square, gold lapel pin */
 x.fillStyle=SHc(.35);x.fillRect(fx(0.09),ty(1.32),fx(0.17)-fx(0.09),4);line([[fx(0.09),ty(1.32)],[fx(0.17),ty(1.315)]],1.8,INK);
 x.fillStyle=B.square||'#f4f1ea';x.beginPath();x.moveTo(fx(0.095),ty(1.322));x.lineTo(fx(0.108),ty(1.362));x.lineTo(fx(0.122),ty(1.335));x.lineTo(fx(0.138),ty(1.37));x.lineTo(fx(0.162),ty(1.318));x.fill();x.strokeStyle='rgba(120,110,130,.7)';x.lineWidth=1;x.stroke();
 if(B.pin!==false){x.fillStyle='#8a5a14';x.beginPath();x.arc(fx(0.118)+1,ty(1.39)+1,5,0,6.3);x.fill();const pg=x.createRadialGradient(fx(0.116),ty(1.392),0,fx(0.118),ty(1.39),5);pg.addColorStop(0,'#fff6c8');pg.addColorStop(0.5,'#f0c050');pg.addColorStop(1,'#a06a14');x.fillStyle=pg;x.beginPath();x.arc(fx(0.118),ty(1.39),4.6,0,6.3);x.fill();}
 /* back: collar band, centre seam, vent */
 x.fillStyle='rgba(60,40,100,.35)';x.fillRect(0,0,70,12);x.fillRect(W-70,0,70,12);line([[3,ty(0.95)],[10,ty(0.95)],[10,ROW.t]],1.5,'rgba(60,40,100,.6)');
 /* hem: shadow + stitch */
 x.fillStyle=SHc(.35);x.fillRect(0,ROW.t-8,W,8);stitch([[0,ROW.t-11],[W,ROW.t-11]]);
 /* ---- sleeves (u: 0.5 = front/inner elbow, 0.75 = outer side) ---- */
 fabric(ROW.s0,ROW.s1,LAV);const sr=v=>ROW.s0+v*(ROW.s1-ROW.s0);
 blob(128,sr(0.1),90,26,SHc(.35));blob(384,sr(0.05),90,20,'rgba(255,255,255,.12)');
 for(let k=0;k<3;k++){x.strokeStyle='rgba(50,30,90,.3)';x.lineWidth=2;x.beginPath();x.moveTo(230,sr(0.52+k*0.04));x.quadraticCurveTo(256,sr(0.56+k*0.04),282,sr(0.52+k*0.04));x.stroke();}
 line([[128,ROW.s0],[128,ROW.s1]],2,SEAM);x.fillStyle=SHc(.35);x.fillRect(0,ROW.s1-8,W,8);stitch([[0,ROW.s1-10],[W,ROW.s1-10]]);
 for(let i=0;i<4;i++){const bx=372+i*8,by=ROW.s1-17;x.fillStyle='rgba(30,15,50,.4)';x.beginPath();x.arc(bx+1,by+1,3,0,6.3);x.fill();x.fillStyle='#4a3866';x.beginPath();x.arc(bx,by,2.8,0,6.3);x.fill();}
 /* ---- cuffs: paisley with an edge ---- */
 x.fillStyle=pp;x.fillRect(0,ROW.c0,W,ROW.c1-ROW.c0);x.fillStyle='rgba(40,20,40,.35)';x.fillRect(0,ROW.c0,W,3);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(0,ROW.c1-3,W,2);
 /* ---- swatches: skin (hands), gold bracelet links, watch dial, shoe leather ---- */
 const g=x.createLinearGradient(0,ROW.w0,0,ROW.w1);g.addColorStop(0,rgb(SKIN.map(v=>v*1.06)));g.addColorStop(1,rgb(SKIN.map(v=>v*0.84)));x.fillStyle=g;x.fillRect(0,ROW.w0,150,40);
 x.strokeStyle='rgba(110,60,40,.55)';x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(26+i*32,ROW.w0+8);x.quadraticCurveTo(30+i*32,ROW.w0+20,26+i*32,ROW.w0+34);x.stroke();}
 const gg=x.createLinearGradient(0,ROW.w0,0,ROW.w1);gg.addColorStop(0,'#fff4c0');gg.addColorStop(0.35,'#f0c050');gg.addColorStop(0.7,'#c08a24');gg.addColorStop(1,'#7a4e10');x.fillStyle=gg;x.fillRect(150,ROW.w0,140,40);
 for(let i=150;i<290;i+=7){x.fillStyle='rgba(90,55,10,.75)';x.fillRect(i,ROW.w0,1.5,40);x.fillStyle='rgba(255,250,210,.5)';x.fillRect(i+2,ROW.w0,1,40);}
 /* dial (40x40): champagne face, gold bezel, hour markers, hands */
 const dx=310,dy=ROW.w0+20;x.fillStyle=gg;x.fillRect(290,ROW.w0,40,40);x.fillStyle='#e9dcb4';x.beginPath();x.arc(dx,dy,14,0,6.3);x.fill();x.strokeStyle='#8a5a14';x.lineWidth=2;x.stroke();
 for(let k=0;k<12;k++){const a=k*Math.PI/6;x.strokeStyle=k%3?'#9a7a3a':'#5a3a10';x.lineWidth=k%3?1:2;x.beginPath();x.moveTo(dx+Math.sin(a)*10,dy-Math.cos(a)*10);x.lineTo(dx+Math.sin(a)*13,dy-Math.cos(a)*13);x.stroke();}
 x.strokeStyle='#2a1a08';x.lineWidth=2;x.beginPath();x.moveTo(dx,dy);x.lineTo(dx+6,dy-5);x.moveTo(dx,dy);x.lineTo(dx-2,dy-10);x.stroke();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(dx-4,dy-5,6,3,-0.6,0,6.3);x.fill();
 /* shoe leather: u wraps the shoe (0.5 = top), v runs heel->toe */
 const sl=x.createLinearGradient(330,0,512,0);const SC=B.shoe||[42,36,48];sl.addColorStop(0,rgb(SC.map(v=>v*0.3)));sl.addColorStop(0.18,rgb(SC.map(v=>v*0.65)));sl.addColorStop(0.5,rgb(SC));sl.addColorStop(0.82,rgb(SC.map(v=>v*0.65)));sl.addColorStop(1,rgb(SC.map(v=>v*0.3)));x.fillStyle=sl;x.fillRect(330,ROW.w0,182,40);
 x.fillStyle='rgba(255,255,255,.35)';x.fillRect(410,ROW.w0+24,20,10);x.fillStyle='#3a2414';x.fillRect(330,ROW.w0,10,40);x.fillRect(502,ROW.w0,10,40);stitch([[345,ROW.w0+2],[345,ROW.w1-2]],'rgba(120,100,90,.6)');stitch([[497,ROW.w0+2],[497,ROW.w1-2]],'rgba(120,100,90,.6)');
 /* ---- trousers (v: hip -> ankle) ---- */
 fabric(ROW.p0,ROW.p1,PANTS);const pr=v=>ROW.p0+v*(ROW.p1-ROW.p0);
 line([[256,ROW.p0],[256,ROW.p1]],1.6,'rgba(255,255,255,.35)');line([[258,ROW.p0],[258,ROW.p1]],1.2,'rgba(60,40,100,.45)');line([[2,ROW.p0],[2,ROW.p1]],2,SEAM);line([[128,ROW.p0],[128,ROW.p1]],2,SEAM);line([[384,ROW.p0],[384,ROW.p1]],2,SEAM);
 for(let k=0;k<3;k++){x.strokeStyle='rgba(50,30,90,.28)';x.lineWidth=2;x.beginPath();x.moveTo(220,pr(0.5+k*0.03));x.quadraticCurveTo(256,pr(0.53+k*0.03),292,pr(0.5+k*0.03));x.stroke();}
 blob(256,pr(0.95),80,6,SHc(.4));x.fillStyle=SHc(.35);x.fillRect(0,ROW.p1-4,W,4);
 return c;}
/* ================= LOW-POLY MESH BUILDER ================= */
function newMesh(){return{p:[],uv:[],bi:[],bw:[],idx:[],grp:[]};}
let GRP=0;
function addV(M,p,uv,w){M.p.push(...p);M.uv.push(...uv);const ws=w.slice(0,4);while(ws.length<4)ws.push([0,0]);let s=0;for(const q of ws)s+=q[1];for(const q of ws){M.bi.push(q[0]);M.bw.push(q[1]/s);}M.grp.push(GRP);return M.p.length/3-1;}
function tri(M,a,b,c,out){const P=i=>[M.p[i*3],M.p[i*3+1],M.p[i*3+2]];const n=V.cross(V.sub(P(b),P(a)),V.sub(P(c),P(a)));if(out&&V.dot(n,out)<0)M.idx.push(a,c,b);else M.idx.push(a,b,c);}
/* loft rings: ring = {c, s(side), f(front), rx, rz, v, w, mod, sq} ; u wraps 0..1 with the front (phi=0) at u=0.5 */
function loft(M,rings,segs,o={}){GRP++;const u0=o.u0||0,u1=o.u1===undefined?1:o.u1,ph0=o.ph0||0;const id=[];
 for(const r of rings){const row=[];for(let i=0;i<=segs;i++){const ph=-Math.PI+2*Math.PI*i/segs+ph0;let sn=Math.sin(ph),cs=Math.cos(ph);if(r.sq){sn=Math.sign(sn)*Math.pow(Math.abs(sn),r.sq);cs=Math.sign(cs)*Math.pow(Math.abs(cs),r.sq);}
   let p=V.add(r.c,V.add(V.mul(r.s,sn*r.rx),V.mul(r.f,cs*r.rz)));if(r.mod)p=r.mod(p,ph,r);row.push(addV(M,p,o.uvf?o.uvf(i/segs,r):[lerp(u0,u1,i/segs),r.v],r.w));}id.push(row);}
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<segs;i++){const a=id[k][i],b=id[k][i+1],c=id[k+1][i+1],d=id[k+1][i];const cen=V.mul(V.add(rings[k].c,rings[k+1].c),0.5),P=j=>[M.p[j*3],M.p[j*3+1],M.p[j*3+2]];const out=V.sub(V.mul(V.add(V.add(P(a),P(b)),V.add(P(c),P(d))),0.25),cen);tri(M,a,b,c,out);tri(M,a,c,d,out);}
 const cap=(k,dir,uv,lift)=>{const r=rings[k],cc=addV(M,V.add(r.c,V.mul(dir,lift||0)),uv||[0.5,r.v],r.w);for(let i=0;i<segs;i++)tri(M,id[k][i],id[k][i+1],cc,dir);};
 if(o.capA)cap(0,o.capA.dir,o.capA.uv,o.capA.lift);if(o.capB)cap(rings.length-1,o.capB.dir,o.capB.uv,o.capB.lift);return id;}
/* textured disc (watch dial): uv laid out around a centre in the texture */
function disc(M,c,n,a,b,r,segs,uvc,uvr,w){GRP++;const cc=addV(M,c,uvc,w),rim=[];for(let i=0;i<=segs;i++){const t=i/segs*2*Math.PI;rim.push(addV(M,V.add(c,V.add(V.mul(a,Math.cos(t)*r),V.mul(b,Math.sin(t)*r))),[uvc[0]+Math.cos(t)*uvr,uvc[1]-Math.sin(t)*uvr],w));}for(let i=0;i<segs;i++)tri(M,cc,rim[i],rim[i+1],n);}
const W1=b=>[[b,1]],W2=(a,b,t)=>[[a,1-t],[b,t]];
/* body-parameter sets on the shared skeleton and animation set.
   fem: athletic 80s proportions (not exaggerated): narrower sloped shoulders, defined waist, wider hips, slimmer limbs with a calf,
   knees slightly in (Q-angle), smaller hands and feet, slimmer neck, a little shorter; walks and stands with the 'fem' gait. */
const BODYP={
 male:{torso:null,bust:null,segs:16,arm:[1,1,1,1,1,1],cuff:1,shIn:0,leg:[1,1,1,1,1,1,1],legX:r=>1+(0.92-r)*0.12,footX:0.112,hand:1,foot:1,neck:1,glute:0,gait:'male',scale:[1,1,1]},
 fem:{torso:[[0.8,0.228,0.156,0],[0.9,0.236,0.16,-0.004],[1.0,0.204,0.146,0.006],[1.1,0.156,0.118,0.012],[1.2,0.178,0.134,0.014],[1.28,0.194,0.144,0.016],[1.36,0.2,0.134,0.006],[1.42,0.19,0.12,-0.004],[1.465,0.15,0.102,-0.012],[1.51,0.078,0.078,-0.014]],
  bust:{1.2:0.024,1.28:0.066,1.36:0.034},segs:20,arm:[0.86,0.84,0.8,0.78,0.76,0.72],cuff:0.74,shIn:0.022,leg:[1.1,1.06,0.96,0.82,0.92,0.74,0.7],
  legX:r=>r>0.51?1-(0.92-r)/0.41*0.09:0.91+(0.51-r)/0.41*0.07,footX:0.1,hand:0.86,foot:0.86,neck:0.84,glute:0.018,gait:'fem',scale:[0.9,0.96,0.9]}};
/* scale vertices [v0,v1) about a point (per-axis factors) */
function scaleAbout(M,v0,v1,c,k){for(let i=v0;i<v1;i++)for(let a=0;a<3;a++)M.p[i*3+a]=c[a]+(M.p[i*3+a]-c[a])*k[a];}
/* head-parameter sets: jaw rows y:[rx k, rz k, min roundness]; face relief (nose/brow/chin) offsets by ring */
const HEADP={
 male:{nose:{1.652:0.012,1.677:0.016,1.702:0.006},brow:{1.727:0.008},chin:{1.605:0.012,1.585:0.006}},
 fem:{jaw:{1.555:[0.86,0.9,1],1.585:[0.86,0.92,0.95],1.605:[0.88,0.95,0.92],1.628:[0.92,0.97,0.92],1.652:[0.96,0.98,0.92],1.677:[0.99,1,0.92]},
  nose:{1.652:0.008,1.677:0.011,1.702:0.004},brow:{1.727:0.003},chin:{1.605:0.006,1.585:0.007}}};
/* hair shell: rows [y,rx,rz,z]; the face side is tucked inside the head below `open` so the hair frames the face; `curl` adds perm texture */
function hairShell(M,rows,segs,o){const hu=[144/512,3/512],open=o.open||0,c0=o.c0||0.3,curl=o.curl||0;
 const wy=y=>y>1.6?W1(BI.head):y>1.52?W2(BI.neck,BI.head,(y-1.52)/0.08):y>1.44?W2(BI.chest,BI.neck,(y-1.44)/0.08):W1(BI.chest);
 loft(M,rows.map(r=>({c:[0,r[0],r[3]],s:[1,0,0],f:[0,0,1],rx:r[1],rz:r[2],w:wy(r[0]),v:hu[1],mod:(p,ph)=>{const c=Math.cos(ph),n=1+curl*(Math.sin(ph*9+r[0]*120)*0.6+Math.sin(ph*5-r[0]*70)*0.4);
  let k=n;if(r[0]<open){const t=clamp((c-c0)/0.3,0,1);k*=1-0.45*t*t*(3-2*t);}p[0]*=k;p[2]=r[3]+(p[2]-r[3])*k;return p;}})),segs,{uvf:HUV(hu),capA:o.top?{dir:[0,1,0],uv:HCAP(hu)}:undefined,capB:o.bottom?{dir:[0,-1,0],uv:hu}:undefined});}
/* feathered face-framing lock (80s flick): a tapered strand from the temple down past the jaw, curling outward at the tip */
function hairLock(M,s,pts){const hu=[144/512,3/512];loft(M,pts.map(q=>({c:[s*q[0],q[1],q[2]],s:[1,0,0],f:[0,0,1],rx:q[3],rz:q[3]*0.7,v:hu[1],w:q[1]>1.6?W1(BI.head):W2(BI.neck,BI.head,clamp((q[1]-1.5)/0.1,0,1))})),6,{uvf:()=>hu,capA:{dir:[0,1,0],uv:hu},capB:{dir:[0,-1,0],uv:hu}});}
/* torso profile rows [y, rx, rz, zc, weights] after body params, shoulders and belly (shared by the body and the armour shell) */
function torsoRows(B){const BP=B.fem?BODYP.fem:BODYP.male;
 const T=[[0.8,0.206,0.143,0,W1(BI.pelvis)],[0.9,0.207,0.145,0,W1(BI.pelvis)],[1.0,0.2,0.147,0.008,W2(BI.pelvis,BI.spine,0.5)],[1.1,0.21,0.152,0.014,W1(BI.spine)],
  [1.22,0.236,0.158,0.012,W2(BI.spine,BI.chest,0.6)],[1.33,0.252,0.158,0.008,W1(BI.chest)],[1.415,0.24,0.142,-0.004,W1(BI.chest)],[1.465,0.192,0.118,-0.012,W1(BI.chest)],[1.51,0.098,0.092,-0.014,W2(BI.chest,BI.neck,0.3)]];
 /* women: the BODYP.fem torso (wider hips, defined waist, soft bust, narrower sloped shoulders; fully clothed) */
 if(BP.torso){const tw=y=>y<0.95?W1(BI.pelvis):y<1.05?W2(BI.pelvis,BI.spine,0.5):y<1.15?W1(BI.spine):y<1.25?W2(BI.spine,BI.chest,0.6):y<1.5?W1(BI.chest):W2(BI.chest,BI.neck,0.3);T.splice(0,T.length,...BP.torso.map(r=>[r[0],r[1],r[2],r[3],tw(r[0])]));}
 const SHx=B.shoulders||0,BEL=B.belly||0;for(const r of T){const y=r[0],up=clamp((y-1.15)/0.25,0,1)*(y>1.48?0.4:1);r[1]*=1+SHx*up;const bb=Math.exp(-Math.pow((y-1.02)/0.14,2));r[2]+=BEL*bb;r[3]+=BEL*0.6*bb;r[1]+=BEL*0.35*bb;}
 if(B.hipTaper)for(const r of T)if(r[0]<0.95){r[1]*=B.hipTaper;r[2]*=B.hipTaper;} /* Spice Master: tucked-in shirts, hips sit inside the legs */
 if(B.pads)for(const r of T)if(r[0]>1.3&&r[0]<1.5)r[1]*=r[0]>1.44?1.1:1.06;
 /* Spice Master: an hourglass figure (B.hourglass): a drawn-in waist and slighter shoulders */
 if(B.fem&&B.hourglass){/* extra rings through the bust so it is round, not a three-ring cone */for(const y of [1.24,1.32]){const i=T.findIndex(r=>r[0]>y);if(i>0){const a=T[i-1],c=T[i],t=(y-a[0])/(c[0]-a[0]);T.splice(i,0,[y,a[1]+(c[1]-a[1])*t,a[2]+(c[2]-a[2])*t,a[3]+(c[3]-a[3])*t,t<0.5?a[4]:c[4]]);}}}
 if(B.fem&&B.hourglass){for(const r of T)if(r[0]>1.3&&r[0]<1.5)r[1]*=0.95;
  /* hips, waist and belly as one smooth curve: full round hips, a small waist, a flat toned belly with a slight forward curve under the navel */
  const HG=[[0.745,0.192,0.128,0.004],[0.79,0.22,0.156,0],[0.85,0.236,0.168,-0.004],[0.9,0.234,0.164,-0.004],[0.95,0.218,0.148,0.002],[1.0,0.192,0.128,0.007],[1.05,0.164,0.112,0.01],[1.1,0.148,0.102,0.011],[1.15,0.151,0.106,0.012],[1.2,0.166,0.12,0.014]];
  const tw=y=>y<0.95?W1(BI.pelvis):y<1.05?W2(BI.pelvis,BI.spine,0.5):y<1.15?W1(BI.spine):W2(BI.spine,BI.chest,0.6);
  while(T.length&&T[0][0]<1.22)T.shift();T.unshift(...HG.map(r=>[r[0],r[1],r[2],r[3],tw(r[0])]));}
 /* Spice Master: a rounder seat for B.gluteK (Club Monique dancers): a tucked-under lower ring and an extra ring through the cheeks */
 if(B.fem&&B.gluteK&&T[0][0]===0.8){const r0=T[0];T.splice(0,1,[0.745,r0[1]*0.8,r0[2]*0.8,0.006,r0[4]],[0.79,r0[1]*1.0,r0[2]*1.04,0,r0[4]],[0.85,r0[1]*1.06,r0[2]*1.08,-0.004,r0[4]]);}
 return T;}
function buildBody(B){const M=newMesh(),X=[1,0,0],Y=[0,1,0],Z=[0,0,1],BP=B.fem?BODYP.fem:BODYP.male;
 const tv=y=>((TY1-y)/(TY1-TY0)*ROW.t)/512;
 /* torso: big frame, chest wider than the hips, padded 80s shoulders, open collar */
 const T=torsoRows(B),BUST=BP.bust||{},SHx=B.shoulders||0;
 loft(M,T.map(r=>({c:[0,r[0],r[3]],s:X,f:Z,rx:r[1],rz:r[2],v:tv(Math.max(r[0],0.802)),w:r[4],mod:(p,ph)=>{if(r[0]>1.44&&r[0]<1.48){p[1]+=0.006*Math.cos(2*ph);}if(B.fem){const b=(B.hourglass?(r[0]>1.14&&r[0]<1.43?0.07*Math.exp(-Math.pow((r[0]-1.268)/(r[0]<1.268?0.05:0.082),2)):0):(BUST[r[0]]||0))*(B.bustK||1);if(b>0.001){const c=Math.max(0,Math.cos(ph));p[2]+=b*c*c*Math.exp(-Math.pow((Math.abs(Math.sin(ph))-0.42)/0.3,2));}if(BP.glute&&r[0]>0.85&&r[0]<0.95&&!B.gluteK){const k=Math.max(0,-Math.cos(ph));p[2]-=BP.glute*k*k;}if(BP.glute&&B.gluteK&&r[0]>0.74&&r[0]<0.95){const k=Math.max(0,-Math.cos(ph)),cl=1-0.75*Math.exp(-Math.pow(Math.sin(ph)/0.14,2)),wy=r[0]<0.76?0.45:r[0]<0.82?0.9:r[0]<0.87?1:0.7;p[2]-=BP.glute*B.gluteK*k*k*cl*wy;}return p;}if(Math.cos(ph)>0.2&&r[0]>1.05&&r[0]<1.4)p[2]+=0.008*Math.cos(ph);return p;}})),BP.segs,{capA:{dir:[0,-1,0],uv:[0.5,0.555]},capB:{dir:[0,1,0],uv:[0.5,0.002],lift:-0.012}});
 /* lapel ridge: a thin raised strip so the lapels catch light (PS2 games modelled these as a few polys) */
 if(!B.fem)for(const s of [1,-1]){GRP++;const pts=[];for(const Y of [1.18,1.3,1.45]){const vw=0.012+(Y-1.12)*0.36,xx=s*(vw+0.04),zz=Math.sqrt(Math.max(0,1-Math.pow(xx/(Y>1.38?0.24:0.25),2)))*0.156+0.008+(Y<1.4?0.008:0);pts.push([xx,Y,zz]);}
  const uvp=p=>[0.5+p[0]*340/512,((TY1-p[1])/(TY1-TY0)*ROW.t)/512];const w=W1(BI.chest),ids=[];for(const p of pts){ids.push(addV(M,V.add(p,[-s*0.03,0,0.004]),uvp(V.add(p,[-s*0.03,0,0])),w),addV(M,V.add(p,[s*0.03,0,0.006]),uvp(V.add(p,[s*0.03,0,0])),w));}
  for(let k=0;k<2;k++){const a=ids[k*2],b=ids[k*2+1],c=ids[k*2+3],d=ids[k*2+2];tri(M,a,b,c,[0,0,1]);tri(M,a,c,d,[0,0,1]);}}
 /* open shirt collar band standing around the back of the neck */
 if(!B.fem)loft(M,[{c:[0,1.49,-0.012],rx:0.1,rz:0.094},{c:[0,1.535,-0.02],rx:0.096,rz:0.09}].map((r,k)=>Object.assign(r,{s:X,f:Z,w:W2(BI.chest,BI.neck,0.4),v:(ROW.c0+2+k*15)/512,mod:(p,ph)=>{if(Math.cos(ph)>0.55)p[1]-=(Math.cos(ph)-0.55)*0.09*(k);return p;}})),12,{u0:0,u1:1});
 /* arms */
 for(const s of [1,-1]){const v0=M.p.length/3;const sh=s>0?SH:mir(SH),el=s>0?EL:mir(EL),wr=s>0?WR:mir(WR),ad=[AD[0]*s,AD[1],0],side=V.norm(V.cross(ad,Z)).map(v=>-v*s),fwd=Z;
  const ua=BI[s>0?'uarmL':'uarmR'],fa=BI[s>0?'farmL':'farmR'],hb=BI[s>0?'handL':'handR'];const sv=t=>(ROW.s0+t*(ROW.s1-ROW.s0))/512;
  const at=(base,dir,t)=>V.add(base,V.mul(dir,t));
  const AR=[{c:V.add(at(sh,ad,0.0),[-s*0.012,-0.012,0]),rx:0.074,rz:0.08,v:sv(0),w:[[ua,0.6],[BI.chest,0.4]]},{c:at(sh,ad,0.06),rx:0.082,rz:0.084,v:sv(0.15),w:W1(ua)},{c:at(sh,ad,0.2),rx:0.076,rz:0.078,v:sv(0.4),w:W1(ua)},
   {c:el,rx:0.068,rz:0.07,v:sv(0.55),w:W2(ua,fa,0.5)},{c:at(el,ad,0.1),rx:0.064,rz:0.064,v:sv(0.72),w:W1(fa)},{c:at(wr,ad,-0.02),rx:0.056,rz:0.057,v:sv(0.98),w:W1(fa)}].map((r,k)=>Object.assign(r,{s:side,f:fwd,rx:r.rx*BP.arm[k],rz:r.rz*BP.arm[k]}));
  /* Spice Master hourglass: slim arms and a rounded shoulder instead of the open sleeve head */
  if(B.hourglass){for(const r of AR){r.rx*=0.9;r.rz*=0.9;}AR[0].rx*=0.86;AR[0].rz*=0.9;AR.unshift({c:V.add(sh,[-s*0.034,0.006,0]),rx:0.024,rz:0.034,v:sv(0),w:[[ua,0.5],[BI.chest,0.5]],s:side,f:fwd});}
  loft(M,AR,8,{u0:0,u1:1});
  loft(M,[{c:at(wr,ad,-0.035),rx:0.05,rz:0.051,v:(ROW.c0+1)/512,w:W1(fa)},{c:at(wr,ad,0.012),rx:0.049,rz:0.05,v:(ROW.c1-1)/512,w:W2(fa,hb,0.3)}].map(r=>Object.assign(r,{s:side,f:fwd,rx:r.rx*BP.cuff,rz:r.rz*BP.cuff})),8,{u0:0,u1:1});
  if(!B.nowatch&&s===(B.watch||1)){/* gold watch: link bracelet, raised case with bezel, champagne dial, crown */
   const gv=SW.gold[1];loft(M,[{c:at(wr,ad,-0.064),rx:0.058,rz:0.059},{c:at(wr,ad,-0.034),rx:0.058,rz:0.059}].map(r=>Object.assign(r,{s:side,f:fwd,w:W1(fa),v:gv})),12,{uvf:(u,r)=>[150/512+u*140/512,r===undefined?gv:gv]});
   const cc=at(at(wr,ad,-0.049),side,0.058),ax=V.norm(ad),bx=fwd;
   loft(M,[{c:cc,rx:0.029,rz:0.029},{c:at(cc,side,0.013),rx:0.029,rz:0.029},{c:at(cc,side,0.015),rx:0.025,rz:0.025}].map(r=>Object.assign(r,{s:ax,f:bx,w:W1(fa),v:gv})),12,{uvf:()=>[0.36,gv]});
   disc(M,at(cc,side,0.0155),side,ax,bx,0.023,14,SW.dial,16/512,W1(fa));
   loft(M,[{c:at(at(cc,side,0.006),bx,0.028),rx:0.005,rz:0.005},{c:at(at(cc,side,0.006),bx,0.036),rx:0.004,rz:0.004}].map(r=>Object.assign(r,{s:ax,f:side,w:W1(fa),v:gv})),6,{uvf:()=>[0.36,gv],capB:{dir:bx,uv:[0.36,gv]}});}
  {/* fist: palm block, four curled fingers, thumb across the front; gold knuckle duster rings around the fingers */
   const f0=M.p.length/3,pm=V.mul(side,-1),Zv=[0,0,1],hw=W1(hb),sk=()=>SW.skin,gv=SW.gold[1],gu=()=>[0.36,gv];
   const P=(ta,tp,tz)=>V.add(V.add(at(wr,ad,ta),V.mul(pm,tp)),V.mul(Zv,tz));
   loft(M,[[0,0.024,0.038],[0.03,0.026,0.046],[0.07,0.025,0.048],[0.093,0.022,0.046]].map(q=>({c:P(q[0],0,0),s:pm,f:Zv,rx:q[1],rz:q[2],sq:0.6,w:hw,v:SW.skin[1]})),8,{uvf:u=>[0.02+u*0.26,SW.skin[1]],capB:{dir:ad,uv:sk(),lift:0.004}});
   const FZ=[0.034,0.0113,-0.0113,-0.034];
   for(const fz of FZ){const r0=fz===FZ[3]?0.0098:0.0112;
    loft(M,[{c:P(0.1,-0.016,fz),rx:r0,rz:r0*0.92},{c:P(0.104,0.03,fz),rx:r0,rz:r0*0.92}].map(r=>Object.assign(r,{s:ad,f:Zv,w:hw,v:SW.skin[1]})),6,{uvf:sk,capA:{dir:V.mul(pm,-1),uv:sk(),lift:0.006},capB:{dir:pm,uv:sk(),lift:0.006}});
    loft(M,[{c:P(0.104,0.034,fz),rx:r0*0.95,rz:r0*0.9},{c:P(0.066,0.036,fz),rx:r0*0.85,rz:r0*0.85}].map(r=>Object.assign(r,{s:pm,f:Zv,w:hw,v:SW.skin[1]})),6,{uvf:sk,capB:{dir:V.mul(ad,-1),uv:sk(),lift:0.005}});
    /* duster finger ring: open band around the finger */
    if(B.rings&&(fz===FZ[2]||fz===FZ[1]&&B.rings>1))loft(M,[{c:P(0.1,0.004,fz),rx:0.0128,rz:0.0122},{c:P(0.1,0.014,fz),rx:0.0128,rz:0.0122}].map(r=>Object.assign(r,{s:ad,f:Zv,w:hw,v:gv})),8,{uvf:gu});
    if(B.dusters)loft(M,[{c:P(0.1,-0.006,fz),rx:0.0158,rz:0.0128},{c:P(0.1,0.012,fz),rx:0.0158,rz:0.0128}].map(r=>Object.assign(r,{s:ad,f:Zv,w:hw,v:gv})),10,{uvf:gu});
    /* spike on the punching face */
    if(B.dusters)loft(M,[{c:P(0.117,0.003,fz),rx:0.0055,rz:0.0055},{c:P(0.133,0.003,fz),rx:0.001,rz:0.001}].map(r=>Object.assign(r,{s:pm,f:Zv,w:hw,v:gv})),5,{uvf:gu});}
   if(B.dusters){
   /* duster frame: front bridge joining the rings + grip bar in the palm */
   loft(M,[{c:P(0.112,0.003,0.05),rx:0.0055,rz:0.009},{c:P(0.112,0.003,-0.05),rx:0.0055,rz:0.009}].map(r=>Object.assign(r,{s:ad,f:pm,w:hw,v:gv})),6,{uvf:gu,capA:{dir:Zv,uv:gu()},capB:{dir:V.mul(Zv,-1),uv:gu()}});
   loft(M,[{c:P(0.056,0.032,0.044),rx:0.007,rz:0.008},{c:P(0.056,0.032,-0.044),rx:0.007,rz:0.009}].map(r=>Object.assign(r,{s:ad,f:pm,w:hw,v:gv})),6,{uvf:gu,capA:{dir:Zv,uv:gu()},capB:{dir:V.mul(Zv,-1),uv:gu()}});
   for(const zz of [0.047,-0.047])loft(M,[{c:P(0.112,0.006,zz),rx:0.006,rz:0.006},{c:P(0.056,0.032,zz),rx:0.006,rz:0.006}].map(r=>Object.assign(r,{s:Zv,f:ad,w:hw,v:gv})),5,{uvf:gu});
   }
   /* thumb wrapped over the front of the curled fingers */
   loft(M,[{c:P(0.035,0.026,0.044),rx:0.016,rz:0.015},{c:P(0.07,0.044,0.03),rx:0.013,rz:0.012},{c:P(0.088,0.049,0.006),rx:0.011,rz:0.0105}].map(r=>Object.assign(r,{s:ad,f:pm,w:hw,v:SW.skin[1]})),6,{uvf:sk,capB:{dir:V.mul(Zv,-1),uv:sk(),lift:0.006}});
   if(BP.hand!==1)scaleAbout(M,f0,M.p.length/3,wr,[BP.hand,BP.hand,BP.hand]);}
  {const dx=s*(0.215*SHx*0.9-BP.shIn);for(let i=v0;i<M.p.length/3;i++)M.p[i*3]+=dx;}
  /* legs */
  const x=0.1*s,th=BI[s>0?'thighL':'thighR'],sn=BI[s>0?'shinL':'shinR'],ft=BI[s>0?'footL':'footR'];const lv=t=>(ROW.p0+t*(ROW.p1-ROW.p0))/512;
  loft(M,[[0.92,0.1,W2(BI.pelvis,th,0.6)],[0.8,0.095,W1(th)],[0.65,0.083,W1(th)],[0.51,0.07,W2(th,sn,0.5)],[0.36,0.064,W1(sn)],[0.2,0.06,W1(sn)],[0.1,0.065,W1(sn)]].map((r,k)=>{const lk=B.hourglass?[1.08,1.2,1.12,0.84,1.0,0.76,0.64][k]:BP.leg[k],cz=B.hourglass?[-0.004,-0.012,-0.008,0.004,-0.012,-0.004,0][k]:0,zk=B.hourglass?[1,1.14,1.12,1,1.08,1,1][k]:1;/* Spice Master hourglass: full thighs, a neat knee, a calf that swells to the back, a slim ankle */return{c:[x*BP.legX(r[0]),r[0],0.006+cz],s:X,f:Z,rx:r[1]*lk,rz:r[1]*1.04*lk*zk,v:lv((0.92-r[0])/0.82),w:r[2]};}),B.hourglass?12:10,{});
  /* shoes: loafer shape, leather texture wrapping over the top */
  const sc=(z,w,h,y,t)=>({c:[BP.footX*s,y,z],s:X,f:Y,rx:w,rz:h,w:W1(ft),t});const sw=SW.shoe[1];
  if(B.fem&&s>0&&B.skirt){/* skirt: flares from the hips, painted like the dress (bottom of the torso sheet) */
   const sl=B.skirt,sv2=tv(0.82),sk=(y,r,z)=>({c:[0,y,z],s:X,f:Z,rx:r,rz:r*0.74,v:sv2,w:W1(BI.pelvis)});
   loft(M,[sk(0.84,0.234,0),sk(0.84-sl*0.45,0.24+sl*0.04,0.004),sk(0.84-sl,0.246+sl*0.08,0.008)],20,{});}
  const s0=M.p.length/3;if(B.heels){/* pumps: raised heel, low vamp, slim toe, stiletto */
   loft(M,[sc(-0.06,0.04,0.026,0.112,0),sc(-0.02,0.046,0.034,0.098,0.25),sc(0.07,0.048,0.03,0.05,0.6),sc(0.16,0.042,0.022,0.03,0.85),sc(0.2,0.026,0.014,0.026,1)],8,{uvf:(u,r)=>[(332+u*178)/512,(ROW.w0+2+r.t*36)/512],capA:{dir:[0,0,-1],uv:[340/512,(ROW.w0+4)/512]},capB:{dir:[0,0,1],uv:[421/512,(ROW.w1-4)/512]},ph0:Math.PI/8});
   loft(M,[{c:[BP.footX*s,0.09,-0.052],rx:0.012,rz:0.014},{c:[BP.footX*s,0.004,-0.056],rx:0.005,rz:0.005}].map(r=>Object.assign(r,{s:X,f:Z,w:W1(ft),v:(ROW.w0+30)/512})),6,{uvf:()=>[340/512,(ROW.w0+30)/512],capB:{dir:[0,-1,0],uv:[340/512,(ROW.w0+30)/512]}});}
  else loft(M,[sc(-0.065,0.05,0.045,0.06,0),sc(-0.02,0.056,0.06,0.07,0.25),sc(0.08,0.058,0.045,0.055,0.6),sc(0.17,0.05,0.032,0.04,0.85),sc(0.205,0.032,0.02,0.035,1)],8,{uvf:(u,r)=>[(332+u*178)/512,(ROW.w0+2+r.t*36)/512],capA:{dir:[0,0,-1],uv:[340/512,(ROW.w0+4)/512]},capB:{dir:[0,0,1],uv:[421/512,(ROW.w1-4)/512]},ph0:Math.PI/8});
  if(BP.foot!==1)scaleAbout(M,s0,M.p.length/3,[BP.footX*s,0,-0.04],[BP.foot,0.94,BP.foot]);}
 return M;}
/* Spice Master toon hair: hair meshes sample a strand strip (head sheet rows 8-14, painted by paintHeadP) round the head and down its height */
let TOONHAIR=false;const hairV=y=>(8.5+clamp((1.86-y)/0.16,0,1)*5)/512,HUV=hu=>TOONHAIR?(t,r)=>[t,hairV(r.c[1])]:()=>hu,HCAP=hu=>TOONHAIR?[0.5,8.6/512]:hu;
function buildHead(B){TOONHAIR=!!(B&&B.toon);const M=newMesh(),X=[1,0,0],Z=[0,0,1],tv=y=>1-(y-HEAD.neckY)/(HEAD.crownY-HEAD.neckY),FH=!!(B&&B.fem),nk=FH?BODYP.fem.neck:1;
 /* rings: neck -> chin -> square jaw -> cheekbones -> brow -> crown */
 const R=[[1.47,0.097*nk,0.094*nk,-0.008,1],[1.52,0.095*nk,0.094*nk,-0.002,1],[1.555,0.09,0.093,0.006,1],[1.585,0.084,0.09,0.012,0.8],[1.605,0.094,0.098,0.02,0.72],[1.628,0.1,0.104,0.02,0.78],[1.652,0.103,0.108,0.016,0.85],[1.677,0.106,0.11,0.011,0.9],
  [1.702,0.108,0.112,0.006,0.92],[1.727,0.109,0.114,0.002,0.95],[1.757,0.107,0.114,-0.004,1],[1.787,0.099,0.107,-0.009,1],[1.812,0.083,0.092,-0.012,1],[1.83,0.058,0.065,-0.014,1]];
 /* women: tapered rounded jaw and a small chin, softer brow and a smaller nose; cheekbones stay full */
 if(FH){const J=HEADP.fem.jaw;for(const r of R){const j=J[r[0]];if(j){r[1]*=j[0];r[2]*=j[1];r[4]=Math.max(r[4],j[2]);}}}
 /* Spice Master toon: rounder jaw and fuller cheeks, a softer brow ridge and a smaller nose bump (the face is painted on) */
 if(B&&B.toon){for(const r of R){if(r[0]>=1.555&&r[0]<=1.677){r[4]=Math.min(1,r[4]+0.16);}if(r[0]===1.585){r[1]+=0.008;r[2]+=0.004;}if(r[0]===1.605||r[0]===1.628){r[1]+=0.005;r[2]+=0.002;}}}
 /* Spice Master persiflage (B.px): caricature head shape: jowls, a heavier brow ridge, a chin and a real 3D nose (built below) */
 const PX=B&&B.px;if(PX){for(const r of R){const k=r[0];if(k>=1.555&&k<=1.628){const j=(PX.jaw||0)*(k<=1.605?1:0.5);r[1]+=j;r[2]+=j*0.4;}if(k===1.585&&PX.chinOut)r[3]+=PX.chinOut;}}
 const HP0=FH?HEADP.fem:HEADP.male,tk=B&&B.toon?0.55:1,sc=o=>{const q={};for(const k in o)q[k]=o[k]*tk;return q;},HP={nose:sc(HP0.nose),brow:sc(HP0.brow),chin:B&&B.toon?sc(HP0.chin):HP0.chin},nose=PX?{}:HP.nose,brow=PX?{1.727:0.008*(PX.brow||1),1.702:0.003*(PX.brow||1)}:HP.brow,chin=PX?{1.605:0.012*(PX.chin||1),1.585:0.008*(PX.chin||1)}:HP.chin;
 loft(M,R.map(r=>({c:[0,r[0],r[3]],s:X,f:Z,rx:r[1],rz:r[2],sq:r[4],v:tv(r[0]),w:r[0]<1.6?W2(BI.neck,BI.head,clamp((r[0]-1.5)/0.1,0,1)):W1(BI.head),
  mod:(p,ph)=>{const c=Math.cos(ph);if(c>0.5){p[2]-=(c-0.5)*0.03;}const k=Math.max(0,c);const key=r[0];p[2]+=((nose[key]||0)*Math.pow(k,24)+(brow[key]||0)*k*k+(chin[key]||0)*Math.pow(k,4));return p;}})),16,{capB:{dir:[0,1,0],uv:[0.5,0.004],lift:0.012}});
 if(B&&B.cigar){const cu=[12/512,3/512],eu=[38/512,3/512],w=W1(BI.head);loft(M,[{c:[0.03,1.64,0.1],rx:0.009,rz:0.009},{c:[0.06,1.632,0.175],rx:0.0095,rz:0.0095}].map(r=>Object.assign(r,{s:[1,0,0],f:[0,1,0],w,v:cu[1]})),6,{uvf:()=>cu});loft(M,[{c:[0.06,1.632,0.175],rx:0.0096,rz:0.0096},{c:[0.062,1.6315,0.185],rx:0.0092,rz:0.0092}].map(r=>Object.assign(r,{s:[1,0,0],f:[0,1,0],w,v:eu[1]})),6,{uvf:()=>eu,capB:{dir:[0,0,1],uv:eu}});}
 if(B&&B.hs==='long'&&FH){/* women's long feathered hair: full back and sides to the shoulder blades, a flicked fringe and face-framing wings */
  hairShell(M,[[1.79,0.122,0.118,-0.014],[1.72,0.132,0.114,-0.026],[1.64,0.136,0.104,-0.04],[1.56,0.132,0.09,-0.056],[1.48,0.126,0.074,-0.07],[1.4,0.122,0.06,-0.08],[1.35,0.126,0.05,-0.084]],14,{open:1.77,c0:0.4,curl:0.015,bottom:1});
  for(const s of [1,-1])hairLock(M,s,[[0.09,1.79,0.06,0.02],[0.118,1.73,0.05,0.026],[0.13,1.66,0.03,0.028],[0.124,1.58,0.02,0.026],[0.13,1.5,0.008,0.022],[0.15,1.45,-0.004,0.012]]);}
 else if(B&&B.hs==='long'){/* long hair: falls behind the head past the shoulders, framing the face */
  const hu=[144/512,3/512],R=(y,r,rz,z,w)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx:r,rz,w,v:hu[1]});
  loft(M,[R(1.76,0.12,0.09,-0.035,W1(BI.head)),R(1.66,0.125,0.08,-0.055,W1(BI.head)),R(1.56,0.128,0.068,-0.07,W2(BI.neck,BI.head,0.5)),R(1.46,0.124,0.056,-0.085,W2(BI.chest,BI.neck,0.5)),R(1.38,0.11,0.042,-0.1,W1(BI.chest))],12,{uvf:HUV(hu),capB:{dir:[0,1,0],uv:hu},capA:{dir:[0,-1,0],uv:hu}});}
 if(B&&(B.hs==='normal'||B.hs==='slick'||B.hs==='buzz'||B.hs==='long')){const hu=[144/512,3/512],w=W1(BI.head),th=B.hs==='buzz'?0.004:B.hs==='slick'?0.009:FH&&B.hs==='long'?0.02:0.014,fr=FH&&B.hs==='long'?0.024:0;
  const R=(y,r,z,drop)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx:r+th,rz:r*1.045+th,w,v:hu[1],mod:(p,ph)=>{const back=Math.max(0,-Math.cos(ph)),fw=Math.max(0,Math.cos(ph));p[1]-=drop*back;if(B.hs==='slick')p[2]-=0.006*fw;
   if(fr&&y<1.8){const f=Math.pow(fw,3);p[1]-=fr*f;p[2]+=0.012*f;}return p;}});
  loft(M,[R(1.765,0.108,-0.004,0.07),R(1.79,0.1,-0.009,0.035),R(1.815,0.084,-0.012,0.012),R(1.834,0.06,-0.014,0),R(1.846,0.03,-0.014,0)],14,{uvf:HUV(hu),capB:{dir:[0,1,0],uv:HCAP(hu)}});}
 if(B&&(B.hs==='mohawk'||B.hs==='big')){const hu=[144/512,3/512],w=W1(BI.head);
  if(B.hs==='big'&&FH){/* women's 80s perm: big curly volume around the crown falling to the shoulders, open at the face */
   hairShell(M,[[1.92,0.06,0.06,-0.02],[1.885,0.13,0.125,-0.018],[1.82,0.158,0.142,-0.022],[1.74,0.166,0.126,-0.036],[1.65,0.162,0.106,-0.052],[1.56,0.152,0.088,-0.066],[1.48,0.136,0.07,-0.076],[1.43,0.118,0.056,-0.08]],16,{open:1.775,c0:0.42,curl:0.07,top:1,bottom:1});}
  else if(B.hs==='big'){const R=(y,r,z)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx:r,rz:r*1.08,w,v:hu[1]});loft(M,[R(1.7,0.112,-0.03),R(1.76,0.135,-0.02),R(1.83,0.138,-0.015),R(1.89,0.115,-0.015),R(1.925,0.06,-0.015)],14,{uvf:HUV(hu),capB:{dir:[0,1,0],uv:hu}});}
  else{GRP++;const N=9,ids=[];for(let i=0;i<=N;i++){const a=-1.05+2.1*i/N,cz=Math.sin(a)*0.112-0.004,cy=1.738+Math.cos(a)*0.104,ny=Math.cos(a),nz=Math.sin(a),h=0.07+0.02*Math.sin(i/N*Math.PI);
   ids.push([addV(M,[-0.014,cy,cz],hu,w),addV(M,[0.014,cy,cz],hu,w),addV(M,[0,cy+ny*h,cz+nz*h],hu,w)]);}
   for(let i=0;i<N;i++){const a=ids[i],b=ids[i+1];tri(M,a[0],b[0],b[2],[-1,0,0]);tri(M,a[0],b[2],a[2],[-1,0,0]);tri(M,a[1],a[2],b[2],[1,0,0]);tri(M,a[1],b[2],b[1],[1,0,0]);}}}
 /* Spice Master: short dark curls (Eddy Jr.), a bumpy shell hugging the skull, open at the face */
 if(B&&B.hs==='curly')hairShell(M,[[1.895,0.05,0.055,-0.016],[1.875,0.098,0.105,-0.014],[1.835,0.124,0.132,-0.013],[1.79,0.128,0.136,-0.014],[1.745,0.124,0.13,-0.02],[1.7,0.116,0.118,-0.03]],18,{open:1.775,c0:0.3,curl:0.08,top:1});
 if(B&&B.hat){const hu=[88/512,3/512],bu=[116/512,3/512],w=W1(BI.head),R=(y,r,z)=>({c:[0,y,z||-0.006],s:[1,0,0],f:[0,0,1],rx:r,rz:r*1.04,w,v:hu[1]});
  /* Spice Master hats: baseball cap and peaked cap with the visor at the front, a chef's toque */
  const visor=(z0,len,y,col)=>loft(M,[{c:[0,y,z0],s:[1,0,0],f:[0,1,0],rx:0.088,rz:0.011,w,v:col[1]},{c:[0,y-0.012,z0+len*0.6],s:[1,0,0],f:[0,1,0],rx:0.08,rz:0.009,w,v:col[1]},{c:[0,y-0.02,z0+len],s:[1,0,0],f:[0,1,0],rx:0.055,rz:0.006,w,v:col[1]}],10,{uvf:()=>col,capB:{dir:[0,0,1],uv:col}});
  if(B.hat==='ballcap'){loft(M,[R(1.758,0.121),R(1.81,0.118),R(1.85,0.096),R(1.872,0.05)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});visor(0.1,0.1,1.772,hu);}
  else if(B.hat==='peaked'){loft(M,[R(1.76,0.12),R(1.79,0.122)],16,{uvf:()=>bu});loft(M,[R(1.79,0.122),R(1.86,0.138),R(1.872,0.136)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});visor(0.1,0.085,1.768,[160/512,3/512]);}
  else if(B.hat==='chef'){loft(M,[R(1.76,0.12),R(1.8,0.122),R(1.88,0.135),R(1.95,0.16),R(1.99,0.15),R(2.01,0.09)],16,{uvf:()=>[52/512,3/512],capB:{dir:[0,1,0],uv:[52/512,3/512]}});}
  else if(B.hat==='fedora'){loft(M,[R(1.79,0.19),R(1.795,0.195),R(1.8,0.12)],16,{uvf:()=>hu});loft(M,[R(1.79,0.118),R(1.82,0.118)],16,{uvf:()=>bu});loft(M,[R(1.82,0.117),R(1.9,0.108),R(1.925,0.085)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu,lift:-0.01}});}
  else if(B.hat==='wrap'){/* Spice Master: a Paravim head wrap, a wound band under a soft dome */loft(M,[R(1.735,0.124),R(1.765,0.131)],16,{uvf:()=>bu});loft(M,[R(1.765,0.131),R(1.81,0.137),R(1.855,0.129),R(1.89,0.106),R(1.915,0.066)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});}
  else if(B.hat==='beanie'){loft(M,[R(1.755,0.118),R(1.79,0.119)],16,{uvf:()=>bu});loft(M,[R(1.79,0.116),R(1.85,0.1),R(1.885,0.06)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});}
  else{loft(M,[R(1.745,0.116),R(1.8,0.112),R(1.84,0.09),R(1.86,0.05)],16,{uvf:()=>hu,capB:{dir:[0,1,0],uv:hu}});loft(M,[{c:[0,1.75,-0.13],s:[1,0,0],f:[0,1,0],rx:0.03,rz:0.012,w,v:hu[1]},{c:[0,1.68,-0.15],s:[1,0,0],f:[0,1,0],rx:0.02,rz:0.01,w,v:hu[1]}],6,{uvf:()=>hu});}}
 /* full fluffy beard + moustache (3D), e.g. Nine of Nine */
 if(B&&B.fluff==='photo'){const w=W1(BI.head),tv=y=>1-(clamp(y,1.565,1.7)-HEAD.neckY)/(HEAD.crownY-HEAD.neckY);
  const ring=(y,rx,rz,z,hide)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx,rz,w,v:tv(y),mod:(p,ph)=>{const c=Math.cos(ph),k=lerp(0.5,1,clamp((c+0.45)/0.6,0,1))*(hide?lerp(1,0.55,Math.pow(Math.max(0,c),1.5)):1),n=1+0.07*Math.sin(ph*9+y*140)+0.045*Math.sin(ph*17+y*61);p[0]*=k*n;p[2]=z+(p[2]-z)*k*n;return p;}});
  loft(M,[ring(1.49,0.03,0.036,0.056),ring(1.51,0.064,0.076,0.04),ring(1.536,0.094,0.104,0.024),ring(1.566,0.106,0.116,0.014),ring(1.6,0.112,0.121,0.018),ring(1.628,0.115,0.123,0.016,1),ring(1.664,0.113,0.12,0.012,1),ring(1.69,0.109,0.115,0.008,1)],18,{capA:{dir:[0,-1,0],uv:[0.5,tv(1.565)]}});
  const bu=[200/512,3/512];loft(M,[-0.05,-0.042,-0.03,-0.016,0,0.016,0.03,0.042,0.05].map(x=>{const ax=Math.abs(x);return{c:[x,1.672-ax*0.06,0.12-x*x*9],s:[0,1,0],f:[0,0,1],rx:0.0085-ax*0.05,rz:0.011-ax*0.06,w,v:bu[1]};}),8,{uvf:()=>bu});}
 if(B&&B.hairVol){const w=W1(BI.head),tv=y=>1-(y-HEAD.neckY)/(HEAD.crownY-HEAD.neckY);
  const H=(y,rx,rz,z,a)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx,rz,w,v:tv(y),mod:(p,ph)=>{const n=1+(a||0)*(Math.sin(ph*7+y*90)*0.6+Math.sin(ph*13)*0.4);p[0]*=n;p[2]=z+(p[2]-z)*n;if(Math.cos(ph)>0)p[1]+=(a||0)*0.4*Math.cos(ph);return p;}});
  loft(M,[H(1.762,0.106,0.113,-0.004),H(1.782,0.113,0.121,-0.006,0.03),H(1.81,0.104,0.112,-0.009,0.05),H(1.836,0.084,0.092,-0.012,0.05),H(1.858,0.05,0.056,-0.014,0.04)],18,{capB:{dir:[0,1,0],uv:[0.5,tv(1.86)],lift:0.006}});}
 if(B&&B.fluff===true){const bu=[200/512,3/512],w=W1(BI.head);
  const ring=(y,rx,rz,z,dip)=>({c:[0,y,z],s:[1,0,0],f:[0,0,1],rx,rz,w,v:bu[1],mod:(p,ph)=>{const c=Math.cos(ph),k=lerp(0.5,1,clamp((c+0.45)/0.6,0,1)),n=1+0.075*Math.sin(ph*9+y*140)+0.045*Math.sin(ph*17+y*61);p[0]*=k*n;p[2]=z+(p[2]-z)*k*n;if(dip&&c>0)p[1]-=dip*c*c;return p;}});
  loft(M,[ring(1.488,0.028,0.034,0.056),ring(1.508,0.062,0.074,0.04),ring(1.534,0.092,0.102,0.024),ring(1.565,0.104,0.114,0.014),ring(1.6,0.111,0.12,0.018),ring(1.634,0.115,0.123,0.018,0.03),ring(1.668,0.113,0.121,0.012,0.052)],18,{uvf:()=>bu,capA:{dir:[0,-1,0],uv:bu}});
  loft(M,[-0.042,-0.03,-0.016,0,0.016,0.03,0.042].map(x=>({c:[x,1.649-Math.abs(x)*0.45-(Math.abs(x)>0.035?0.008:0),0.119-x*x*7],s:[0,1,0],f:[0,0,1],rx:0.0095-Math.abs(x)*0.08,rz:0.011,w,v:bu[1]})),8,{uvf:()=>bu});}
 /* armour (look v2): soft vest or plate carrier following the torso profile (bust flattened under it), with armholes and a scooped neck;
    chest/spine weighted so it rides the body and survives a head cut */
 if(B&&B.armor){const T=torsoRows(B),BU=(B.fem&&BODYP.fem.bust)||{},plate=B.armor==='plate',au=[342/512,3/512],du=[370/512,3/512],pad=plate?0.026:0.018,sY=[0,1,0];
  const at=y=>{let i=0;while(i<T.length-2&&T[i+1][0]<y)i++;const a=T[i],b=T[i+1],t=clamp((y-a[0])/(b[0]-a[0]),0,1);return{rx:lerp(a[1],b[1],t),rz:lerp(a[2],b[2],t),zc:lerp(a[3],b[3],t),w:t<0.5?a[4]:b[4]};};
  const bust=y=>{let m=0;for(const k in BU)m=Math.max(m,BU[k]*Math.max(0,1-Math.abs(y-k)/0.09));return m*0.85;};
  const shell=y=>{const r=at(y),F=r.zc+r.rz+bust(y),K=r.rz-r.zc,arm=y<1.28?1:1-1.8*(y-1.28);return{y,w:r.w,zc:(F-K)/2,rx:r.rx*arm+pad*(y<1.28?1:0.5),rz:(F+K)/2+pad};};
  const YS=[0.97,1.06,1.16,1.26,1.34,1.41,1.45],top=YS[YS.length-1],S=YS.map(shell);
  loft(M,S.map(r=>({c:[0,r.y,r.zc],s:X,f:Z,rx:r.rx,rz:r.rz,sq:0.8,w:r.w,v:au[1],mod:(p,ph)=>{if(r.y===top){const c=Math.max(0,Math.cos(ph));p[1]-=0.06*c*c;}return p;}})),16,{uvf:()=>au});
  const fz=y=>{const r=S.reduce((a,b)=>Math.abs(b.y-y)<Math.abs(a.y-y)?b:a);return r.zc+r.rz;},bz=y=>{const r=S.reduce((a,b)=>Math.abs(b.y-y)<Math.abs(a.y-y)?b:a);return r.zc-r.rz;};
  const box=(x,y,z0,dz,rx,ry,uv,w)=>loft(M,[{c:[x,y,z0],rx,rz:ry},{c:[x,y,z0+dz],rx:rx*0.96,rz:ry*0.96}].map(r=>Object.assign(r,{s:X,f:sY,sq:0.3,w,v:uv[1]})),8,{uvf:()=>uv,capB:{dir:[0,0,Math.sign(dz)],uv},ph0:Math.PI/8});
  const k=S[3].rx/0.25;
  if(plate){const wc=W2(BI.spine,BI.chest,0.7);box(0,1.25,fz(1.26)-0.012,0.03,0.125*k,0.13,au,wc);box(0,1.25,bz(1.26)+0.012,-0.026,0.125*k,0.13,au,wc);
   for(const x of [-0.085,0,0.085])box(x*k,1.08,fz(1.06)-0.008,0.032,0.03,0.042,du,W2(BI.pelvis,BI.spine,0.6));}
  else for(const x of [-1,1])box(x*0.07*k,1.36,fz(1.34)-0.01,0.016,0.03,0.022,du,W1(BI.chest));}
 /* helmet (look v2): PASGT shell flaring over the ears and nape, or a round riot helmet with a smoked visor */
 if(B&&B.helmet){const hu=[398/512,3/512],vu=[426/512,3/512],w=W1(BI.head),riot=B.helmet==='riot';
  const R=(y,r,z,drop)=>({c:[0,y,z],s:X,f:Z,rx:r,rz:r*1.08,w,v:hu[1],mod:(p,ph)=>{p[1]-=(drop||0)*(1-Math.cos(ph))/2;return p;}});
  if(riot)loft(M,[R(1.905,0.05,-0.008),R(1.89,0.104,-0.008),R(1.845,0.138,-0.01),R(1.78,0.148,-0.012),R(1.74,0.15,-0.014,0.05),R(1.736,0.138,-0.014,0.05)],16,{uvf:()=>hu,capA:{dir:[0,1,0],uv:hu}});
  else loft(M,[R(1.9,0.045,-0.008),R(1.886,0.1,-0.008),R(1.845,0.135,-0.01),R(1.785,0.145,-0.012,0.01),R(1.738,0.15,-0.014,0.07),R(1.734,0.138,-0.014,0.07)],16,{uvf:()=>hu,capA:{dir:[0,1,0],uv:hu}});
  if(riot)loft(M,[[1.745,0.152,0.162],[1.67,0.15,0.168],[1.6,0.138,0.158]].map(q=>({c:[0,q[0],-0.01],s:X,f:Z,rx:q[1],rz:q[2],w:q[0]<1.6?W2(BI.neck,BI.head,0.5):w,v:vu[1],mod:(p,ph)=>{const t=clamp((Math.cos(ph)-0.1)/0.25,0,1),kk=lerp(0.55,1,t);p[0]*=kk;p[2]=-0.01+(p[2]+0.01)*kk;return p;}})),16,{uvf:()=>vu});}
 /* glasses: rectangular black frames, bridge, temple arms */
 if(B&&B.specs){const gu=B.fluff==='photo'?[0.5,3/512]:[172/512,3/512],w=W1(BI.head),gy=1.711,gz=0.125;
  for(const sx of [1,-1]){const cx=sx*0.036,R2=(rx,rz,z)=>({c:[cx,gy,z],s:[1,0,0],f:[0,1,0],rx,rz,sq:0.35,w,v:gu[1]});
   const bar=(a0,a1,hz)=>loft(M,[a0,a1].map(c=>({c:[c[0],c[1],gz],s:hz?[0,1,0]:[1,0,0],f:[0,0,1],rx:0.0042,rz:0.0042,w,v:gu[1]})),6,{uvf:()=>gu,capA:{dir:hz?[-1,0,0]:[0,-1,0],uv:gu},capB:{dir:hz?[1,0,0]:[0,1,0],uv:gu}});const hw=0.031,hh=0.02;bar([cx-hw,gy+hh],[cx+hw,gy+hh],1);bar([cx-hw+0.004,gy-hh],[cx+hw-0.004,gy-hh],1);bar([cx-hw,gy-hh+0.002],[cx-hw,gy+hh],0);bar([cx+hw,gy-hh+0.002],[cx+hw,gy+hh],0);
   const tp=(z,x)=>({c:[x,gy+0.007,z],s:[0,1,0],f:[1,0,0],rx:0.0045,rz:0.0035,w,v:gu[1]});loft(M,[tp(gz-0.004,sx*0.066),tp(0.06,sx*0.106),tp(-0.025,sx*0.114)],5,{uvf:()=>gu});}
  loft(M,[-0.014,0,0.014].map(x=>({c:[x,gy+0.006-(x===0?0.002:0),gz-0.001],s:[0,1,0],f:[0,0,1],rx:0.0035,rz:0.0035,w,v:gu[1]})),5,{uvf:()=>gu});}
 if(PX&&PX.nose){const n=PX.nose,dr=PX.droop||0,hk=PX.hook||0,nu=[452/512,3/512],w=W1(BI.head),bw=PX.noseW||1;
  /* rings top (bridge) to bottom (under the tip); the bulb sits forward and a drooping nose hangs lower */
  const N=[[1.722,0.094,0.008,0.006],[1.708,0.102+0.002*n,0.0085,0.008],[1.692,0.104+0.007*n+hk*0.003,0.009*bw,0.0095],[1.676-dr*0.4,0.103+0.012*n,0.0125*n*bw,0.012*n],[1.664-dr,0.101+0.0145*n,0.0145*n*bw,0.013*n],[1.654-dr,0.099+0.011*n,0.0125*n*bw,0.0105*n],[1.648-dr*0.8,0.096,0.007*n,0.005]];
  loft(M,N.map(q=>({c:[0,q[0]+0.005,q[1]],s:[1,0,0],f:[0,0,1],rx:q[2],rz:q[3],w,v:nu[1]})),10,{uvf:()=>nu,capA:{dir:[0,1,0],uv:nu},capB:{dir:[0,-1,0],uv:nu}});
  if(n>1.2)for(const s of [1,-1])loft(M,[[1.664-dr,0.009*n*bw,0.096+0.008*n],[1.657-dr,0.0105*n*bw,0.095+0.008*n],[1.65-dr,0.009*n*bw,0.094+0.006*n]].map(q=>({c:[s*q[1],q[0]+0.005,q[2]],s:[1,0,0],f:[0,0,1],rx:0.0058*n,rz:0.0062*n,w,v:nu[1]})),8,{uvf:()=>nu,capA:{dir:[0,1,0],uv:nu},capB:{dir:[0,-1,0],uv:nu}});}
 /* ear flaps, textured with the painted ears */
 for(const s of [1,-1]){GRP++;const ek=PX&&PX.ear||1,c=[s*0.106,1.69,-0.006],w=W1(BI.head),u=s>0?192/256:64/256,v0=84/256,v1=126/256,du=12/256;
  const E=q=>V.add(c,V.mul(q,ek)),a=addV(M,E([0,0.026,-0.014]),[u-du,v0],w),b=addV(M,E([0,0.026,0.012]),[u+du,v0],w),cc=addV(M,E([s*0.014,-0.028,0.01]),[u+du,v1],w),d=addV(M,E([s*0.012,-0.028,-0.016]),[u-du,v1],w),o=[s,0,0];
  const e=addV(M,E([s*0.018*ek,0,-0.002]),[u,(v0+v1)/2],w);for(const [p,q] of [[a,b],[b,cc],[cc,d],[d,a]])tri(M,p,q,e,o);}
 return M;}
/* smooth normals per loft group (positions welded inside a group) */
function normals(M){const n=new Float32Array(M.p.length),key=i=>M.grp[i]+':'+Math.round(M.p[i*3]*1e4)+','+Math.round(M.p[i*3+1]*1e4)+','+Math.round(M.p[i*3+2]*1e4),acc={};
 for(let t=0;t<M.idx.length;t+=3){const a=M.idx[t],b=M.idx[t+1],c=M.idx[t+2],P=i=>[M.p[i*3],M.p[i*3+1],M.p[i*3+2]],fn=V.cross(V.sub(P(b),P(a)),V.sub(P(c),P(a)));for(const i of [a,b,c]){const k=key(i);acc[k]=acc[k]?V.add(acc[k],fn):fn;}}
 for(let i=0;i<M.p.length/3;i++){const q=V.norm(acc[key(i)]||[0,1,0]);n.set(q,i*3);}return n;}
const M4={id:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
 mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
 T:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
 R(ax,a){const[x,y,z]=V.norm(ax),c=Math.cos(a),s=Math.sin(a),t=1-c;return[t*x*x+c,t*x*y+s*z,t*x*z-s*y,0,t*x*y-s*z,t*y*y+c,t*y*z+s*x,0,t*x*z+s*y,t*y*z-s*x,t*z*z+c,0,0,0,0,1];},
 persp(f,a,n,fa){const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0];},
 look(e,c,u){const z=V.norm(V.sub(e,c)),x=V.norm(V.cross(u,z)),y=V.cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,e),-V.dot(y,e),-V.dot(z,e),1];},
 ap(m,p){return[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}};
const X=[1,0,0],Y=[0,1,0],Z=[0,0,1];
function pose(t,anim,jab,arms,kick,gait,extra){const R={},rot=(b,ax,a)=>{R[b]=M4.mul(M4.R(ax,a),R[b]||M4.id());};let root=[0,0,0];const fem=gait==='fem';
 const armHinge=s=>V.norm(V.cross([AD[0]*s,AD[1],0],Z));
 const lower=(s,a)=>rot(s>0?'uarmL':'uarmR',Z,-a*s);
 if(anim&&anim.R){/* Spice Master: a motion-capture base pose (js/mocap.js); everything below layers on top */for(const k in anim.R)R[k]=anim.R[k].slice();root=anim.root.slice();}
 else if(anim==='idle'&&fem){/* contrapposto: weight on the right leg, hip up on that side, left knee eased, shoulders counter-tilted */
  const br=Math.sin(t*1.6),sw=Math.sin(t*0.45)*0.012;lower(1,0.6);lower(-1,0.58);rot('uarmL',X,-0.04);rot('uarmR',X,-0.08);rot('farmL',armHinge(1),0.3);rot('farmR',armHinge(-1),0.38);
  rot('pelvis',Z,-0.07-sw);rot('pelvis',Y,0.06);rot('thighR',Z,0.075+sw);rot('thighL',Z,0.03+sw);rot('thighL',X,-0.1);rot('shinL',X,0.2);rot('footL',X,-0.08);rot('thighR',X,0.02);
  rot('spine',Z,0.05+sw*0.6);rot('chest',Z,0.035);rot('chest',X,-0.02*br);rot('spine',X,0.01);rot('neck',Z,-0.02);rot('neck',Y,Math.sin(t*0.5)*0.06);rot('head',X,Math.sin(t*0.37)*0.05);
  root=[-0.022,0.003*br-0.004,0];}
 else if(anim==='idle'){const br=Math.sin(t*1.6);lower(1,0.5);lower(-1,0.5);rot('uarmL',X,-0.05);rot('uarmR',X,-0.05);rot('farmL',armHinge(1),0.25);rot('farmR',armHinge(-1),0.25);
  rot('chest',X,-0.02*br);rot('neck',Y,Math.sin(t*0.5)*0.06);rot('head',X,Math.sin(t*0.37)*0.06);rot('spine',X,0.02);root=[0,0.004*br,0];rot('thighL',Z,0.03);rot('thighR',Z,-0.03);}
 else if(anim==='walk'&&fem){/* hip-led walk: pelvis shifts over the stance leg and drops on the swing side, feet track a narrow line,
   smaller arm swing close to the body, upright chest with little counter-rotation, steady head */
  const w=t*2*Math.PI*0.95,s=Math.sin(w),c=Math.cos(w),roll=-0.07*c,shift=-0.026*c;
  rot('thighL',X,-0.42*s);rot('thighR',X,0.42*s);rot('shinL',X,0.08+0.72*Math.max(0,Math.sin(w+1.9)));rot('shinR',X,0.08+0.72*Math.max(0,Math.sin(w+1.9+Math.PI)));
  rot('footL',X,0.28*Math.max(0,-Math.sin(w+0.6)));rot('footR',X,0.28*Math.max(0,Math.sin(w+0.6)));
  const legZ=(-shift-0.83*roll)/0.83;rot('thighL',Z,legZ-0.05);rot('thighR',Z,legZ+0.05);
  lower(1,0.6);lower(-1,0.6);rot('uarmL',X,0.3*s);rot('uarmR',X,-0.3*s);rot('farmL',armHinge(1),0.42+0.16*Math.max(0,-s));rot('farmR',armHinge(-1),0.42+0.16*Math.max(0,s));
  rot('pelvis',Z,roll);rot('pelvis',Y,0.15*s);rot('spine',Z,-roll*1.15);rot('chest',Y,-0.08*s);rot('spine',X,0.02);rot('chest',X,-0.03);rot('neck',Z,roll*0.3);
  root=[shift,0.016*Math.abs(c)-0.014,0];rot('head',X,-0.02);}
 else if(anim==='walk'){const w=t*2*Math.PI*0.95,s=Math.sin(w),c=Math.cos(w);
  rot('thighL',X,-0.45*s);rot('thighR',X,0.45*s);rot('shinL',X,0.08+0.75*Math.max(0,Math.sin(w+1.9)));rot('shinR',X,0.08+0.75*Math.max(0,Math.sin(w+1.9+Math.PI)));
  rot('footL',X,0.25*Math.max(0,-Math.sin(w+0.6)));rot('footR',X,0.25*Math.max(0,Math.sin(w+0.6)));
  lower(1,0.52);lower(-1,0.52);rot('uarmL',X,0.38*s);rot('uarmR',X,-0.38*s);rot('farmL',armHinge(1),0.35+0.2*Math.max(0,-s));rot('farmR',armHinge(-1),0.35+0.2*Math.max(0,s));
  rot('pelvis',Y,0.1*s);rot('chest',Y,-0.16*s);rot('spine',X,0.06);root=[0,0.025*Math.abs(c)-0.02,0];rot('head',X,-0.04);}
 else{ /* boxer: fists up, bouncing */
  const b=Math.abs(Math.sin(t*4.2)),j=jab===undefined?Math.max(0,Math.sin(t*1.3))**8:jab;root=[0,-0.035-b*0.025,0];
  rot('thighL',X,-0.28);rot('thighR',X,0.08);rot('thighL',Z,0.1);rot('thighR',Z,-0.1);rot('shinL',X,0.42);rot('shinR',X,0.32);rot('footL',X,-0.14);rot('footR',X,-0.4);
  rot('pelvis',Y,0.32);rot('spine',X,0.12);rot('chest',Y,-0.2);rot('chest',X,0.06);rot('neck',X,0.1);rot('head',X,-0.06);
  lower(1,0.62);lower(-1,0.6);rot('uarmL',X,-0.62+j*0.1);rot('uarmR',X,-0.7-j*0.85);rot('uarmL',Y,-0.2);rot('uarmR',Y,0.25-j*0.2);
  rot('farmL',armHinge(1),2.25);rot('farmR',armHinge(-1),2.2-j*1.9);rot('handL',armHinge(1),0.25);rot('handR',armHinge(-1),0.25-j*0.25);}
 if(arms){for(const b of ['uarmL','uarmR','farmL','farmR','handL','handR'])delete R[b];const k=kick||0;
  const up=(s,x,y,z)=>{const u=s>0?'uarmL':'uarmR';lower(s,0.66);rot(u,X,x);rot(u,Y,y);if(z)rot(s>0?'farmL':'farmR',armHinge(s),z);};
  if(arms==='execGun'){up(-1,-0.75+k,0.2,0.1);up(1,-0.7,-0.45,0.5);}
  else if(arms==='aim'){up(-1,-1.5+k*1.6,0.22,0.05+k);up(1,-1.36+k,-0.52,0.4);}
  else if(arms==='aim1'){up(-1,-1.52+k*2,0.12,k);lower(1,0.5);rot('farmL',armHinge(1),0.25);}
  else if(arms==='dual'){up(-1,-1.5+k,0.1,0.02);up(1,-1.5+k*0.6,-0.1,0.02);}
  else if(arms==='rifle'){const pm=FX.pump||0;up(-1,-1.2+k,0.3,0.9);up(1,-1.36+0.3*pm,-0.4,0.25+0.75*pm);}
  else if(arms==='low'){lower(-1,0.5);rot('uarmR',X,-0.15);rot('farmR',armHinge(-1),0.35);lower(1,0.5);rot('farmL',armHinge(1),0.25);}
  else if(arms==='cash'){lower(-1,0.5);rot('uarmR',X,-0.12);rot('farmR',armHinge(-1),0.3);up(1,-0.7,-0.35,1.4);}
  else if(arms==='melee'){up(-1,-1.0-0.45*k,0.75-1.7*k,1.15-0.95*k);lower(1,0.5);rot('farmL',armHinge(1),0.4);}
  else if(arms==='talk'){const g=Math.sin(t*2.3)*0.22,g2=Math.sin(t*1.7+1)*0.22;up(-1,-0.5+g,0.25,1.2+g2);up(1,-0.55-g2,-0.25,1.1+g);}}
 if(FX.exlean){rot('spine',X,0.35*FX.exlean);rot('chest',X,0.2*FX.exlean);rot('thighL',X,-0.35*FX.exlean);rot('thighR',X,-0.1*FX.exlean);rot('shinL',X,0.55*FX.exlean);rot('shinR',X,0.3*FX.exlean);root[1]-=0.08*FX.exlean;}
 if(FX.crouch){const c=FX.crouch;/* W7 cover crouch: deep knee bend, feet flat, chest over knees */
  rot('thighL',X,-1.45*c);rot('thighR',X,-1.3*c);rot('shinL',X,2.2*c);rot('shinR',X,2.05*c);rot('footL',X,-0.75*c);rot('footR',X,-0.75*c);rot('spine',X,0.4*c);rot('chest',X,0.15*c);root[1]-=0.47*c;}
 if(extra)extra(R,rot,lower,armHinge);R.head=M4.mul(M4.R(X,0.06),R.head||M4.id());
 const W=[];for(let i=0;i<NB;i++){const b=BONES[i],pv=b[2],L=M4.mul(M4.mul(M4.T(pv[0],pv[1],pv[2]),R[b[0]]||M4.id()),M4.T(-pv[0],-pv[1],-pv[2]));W[i]=b[1]<0?M4.mul(M4.T(root[0],root[1],root[2]),L):M4.mul(W[b[1]],L);}
 return W;}
const NB=BONES.length;
function paintSmile(cv,F){const x=cv.getContext('2d'),C=256,my=277,hw=36;
 if(F.beard){x.fillStyle=rgb(F.beard);x.fillRect(188,0,24,6);}
 const mouth=()=>{x.beginPath();x.moveTo(C-hw,my-14);x.quadraticCurveTo(C,my,C+hw,my-14);x.quadraticCurveTo(C+hw*0.62,my+19,C,my+20);x.quadraticCurveTo(C-hw*0.62,my+19,C-hw,my-14);x.closePath();};
 x.save();mouth();x.fillStyle='#3a0e12';x.fill();x.clip();x.fillStyle='#f3ede2';x.beginPath();x.moveTo(C-hw,my-15);x.quadraticCurveTo(C,my-1,C+hw,my-15);x.lineTo(C+hw,my-2);x.quadraticCurveTo(C,my+12,C-hw,my-2);x.closePath();x.fill();
 x.strokeStyle='rgba(120,100,90,.55)';x.lineWidth=1;for(let i=-3;i<=3;i++){const tx=C+i*7;x.beginPath();x.moveTo(tx,my-4+Math.abs(i)*0.6);x.lineTo(tx,my+7-Math.abs(i)*0.5);x.stroke();}
 x.fillStyle='rgba(200,80,90,.5)';x.beginPath();x.ellipse(C,my+12,hw*0.45,3,0,0,6.3);x.fill();x.restore();
 mouth();x.strokeStyle='#1e0606';x.lineWidth=3.4;x.stroke();
 x.strokeStyle='rgba(60,20,10,.7)';x.lineWidth=1.6;for(const sd of [1,-1]){x.lineWidth=2.4;x.beginPath();x.moveTo(C+sd*(hw+1),my-14);x.quadraticCurveTo(C+sd*(hw+6),my-16,C+sd*(hw+7),my-23);x.stroke();}}
function tropicalCanvas(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#2a8f8a';x.fillRect(0,0,128,128);
 const leaf=(cx,cy,a,sz,col)=>{x.save();x.translate(cx,cy);x.rotate(a);x.fillStyle=col;x.beginPath();x.moveTo(0,-sz);x.quadraticCurveTo(sz*0.5,-sz*0.2,0,sz);x.quadraticCurveTo(-sz*0.5,-sz*0.2,0,-sz);x.fill();x.strokeStyle='rgba(90,30,50,.5)';x.lineWidth=1;x.beginPath();x.moveTo(0,-sz*0.9);x.lineTo(0,sz*0.9);x.stroke();for(let k=-3;k<=3;k++){x.beginPath();x.moveTo(0,k*sz*0.22);x.lineTo(sz*0.3*Math.sign(k||1),k*sz*0.22-sz*0.12);x.stroke();}x.restore();};
 const pts=[[20,22,0.6],[84,14,-0.7],[52,60,1.9],[110,70,0.3],[18,96,-1.2],[76,104,2.6],[44,6,2.2],[118,118,-0.4]];
 for(const [px,py,a] of pts)for(const [ox,oy] of [[0,0],[128,0],[-128,0],[0,128],[0,-128]]){leaf(px+ox,py+oy,a,20,'#d98aa4');leaf(px+ox+6,py+oy+4,a+0.5,12,'#b8607e');}
 x.globalAlpha=0.08;x.strokeStyle='#000';for(let i=0;i<128;i+=2){x.beginPath();x.moveTo(i,0);x.lineTo(i,128);x.stroke();}return c;}
function shirtCanvas(col){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle=rgb(col);x.fillRect(0,0,64,64);
 x.globalAlpha=0.08;x.strokeStyle='#000';for(let i=0;i<64;i+=2){x.beginPath();x.moveTo(i,0);x.lineTo(i,64);x.stroke();}x.globalAlpha=0.06;x.strokeStyle='#fff';for(let i=1;i<64;i+=3){x.beginPath();x.moveTo(0,i);x.lineTo(64,i);x.stroke();}return c;}
const RW=mir(WR),ADR=[-AD[0],AD[1],0],LW=WR,ADL=[AD[0],AD[1],0];
function handFrame(Wm,left,sw,base){const Mh=Wm[left?BI.handL:BI.handR],w=left?LW:RW,a=left?ADL:ADR,pm=left?V.norm(V.cross(a,Z)).map(v=>v):V.norm(V.cross(a,Z)).map(v=>-v);
 const O=M4.ap(Mh,V.add(w,V.mul(a,0.065))),dz=V.norm(V.sub(M4.ap(Mh,V.add(w,a)),M4.ap(Mh,w))),dy=V.norm(V.sub(M4.ap(Mh,V.add(w,Z)),M4.ap(Mh,w))),dx=V.norm(V.cross(dy,dz)),dy2=V.cross(dz,dx);
 return [dx[0]*sw,dy2[0]*sw,dz[0]*sw,O[0],dx[1]*sw,dy2[1]*sw,dz[1]*sw,O[1],dx[2]*sw,dy2[2]*sw,dz[2]*sw,O[2]];}
const C255=c=>(c||[0.5,0.5,0.5]).map(v=>Math.round(v*255));
const BODYCFG={fat:{scale:[1.22,0.98,1.2],belly:0.12,shoulders:0.08},big:{scale:[1.14,1.06,1.1],shoulders:0.24},thin:{scale:[0.86,1.05,0.86]},slim:{scale:[0.93,1.02,0.93]},stocky:{scale:[1.08,0.96,1.08],shoulders:0.1},boss:{scale:[1.2,1.0,1.18],belly:0.1,shoulders:0.12},normal:{scale:[1,1,1]}};
function paintHeadP(L){SKIN=C255(L.skin);const W=256,c=document.createElement('canvas');c.width=c.height=W;const x=c.getContext('2d');const out=x.createImageData(W,W),D=out.data;
 const hair=L.hair?C255(L.hair):null,hs=L.hs,beard=L.beard?C255(L.beard):null,hatOn=!!L.hat;const toon=L.toon!==false;
 const hl=hs==='buzz'?1.79:hs==='slick'?1.772:hs==='big'||hs==='long'?1.75:1.768;
 for(let V=0;V<W;V++){const t=1-V/(W-1),Y=lerp(HEAD.neckY,HEAD.crownY,t);
  for(let U=0;U<W;U++){const ph=(U/(W-1)-0.5)*2*Math.PI,ap=Math.abs(ph);let base=SKIN.slice();
   if(hair&&hs){const line=hl-0.11*clamp((ap-1.0)/1.0,0,1)-0.03*clamp((ap-2.2)/0.8,0,1);let inH=Y>line;if(hs==='mohawk')inH=Y>1.7&&Math.abs(Math.sin(ph))<0.22;
    if(inH){const k=hs==='buzz'?0.55:hs==='mohawk'?1:0.95;base=base.map((v,i)=>v+(hair[i]-v)*k);}}
   if(beard&&Y>1.552&&Y<1.668+0.02*clamp((ap-1)/0.5,0,1)&&ap<2.3){base=beard.slice();}
   else if(L.stubble&&Y>1.555&&Y<1.655&&ap<2.2){const st=toon?(L.stubbleC?C255(L.stubbleC):[96,84,82]):null;base=toon?base.map((v,i)=>v+(st[i]-v)*0.26*clamp((1.655-Y)/0.02,0,1)*clamp((Y-1.555)/0.015,0,1)):base.map(v=>v*0.82);}
   /* Spice Master toon: warm (sienna) shading round the sides instead of a grey darken */
   const sd=1-Math.max(0,Math.cos(ph)),col=toon?base.map((v,i)=>v*(1-sd*[0.16,0.24,0.27][i])*(0.94+0.06*t)):base.map(v=>v*(0.8+0.2*Math.max(0,Math.cos(ph)))*(0.92+0.08*t));const o=(V*W+U)*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}}
 x.putImageData(out,0,0);
 const c2=document.createElement('canvas');c2.width=c2.height=512;const y=c2.getContext('2d');y.imageSmoothingQuality='high';y.drawImage(c,0,0,512,512);
 FO={calm:L.calm||0,brow:hair?rgb(hair.map(v=>v*0.7)):beard?rgb(beard.map(v=>v*0.7)):'#2a1a12',fem:L.fem?1:0};
 y.save();y.scale(2,2);const fy=(HEAD.crownY-1.676)/(HEAD.crownY-HEAD.neckY)*256;y.translate(128,fy);y.scale(1.4,1.22);y.translate(-128,-fy);
 if(toon){const bc=L.browC?C255(L.browC):hair?hair.map(v=>v*0.62):beard?beard.map(v=>v*0.62):[42,26,18],old=hair&&hair[0]>150&&Math.abs(hair[0]-hair[2])<40;
  paintToonFace(y,{iris:L.iris?C255(L.iris):null,brow:rgb(bc),browW:L.browW,calm:L.calm??1,squint:!!L.squint,mouth:L.mouth||(L.smile?'smile':'flat'),fem:!!L.fem,old:L.old??old,
   stache:!!(L.stache||L.beard),stacheC:(beard||hair||(L.browC?C255(L.browC):[96,66,44])).map(v=>v*0.9),lips:L.lips?C255(L.lips):null,eyeK:L.eyeK,irisK:L.irisK,lidK:L.lidK,noNose:!!L.noNose});
  if(L.pxFace)L.pxFace(y,{C:128,V:Y=>(HEAD.crownY-Y)/(HEAD.crownY-HEAD.neckY)*256,U:xm=>128+Math.asin(clamp(xm/0.108,-1,1))/(2*Math.PI)*256,SKIN,L,rgb});}
 else paintFace(y);
 const C=128,Vy=Y=>(HEAD.crownY-Y)/(HEAD.crownY-HEAD.neckY)*256,ey=Vy(1.706),ex=7.5;
 if(!toon&&(L.stache||L.beard)){y.fillStyle=rgb((beard||hair||[40,28,20]).map(v=>v*0.8));y.beginPath();y.moveTo(C-12,Vy(1.646)+2);y.quadraticCurveTo(C-6,Vy(1.662),C,Vy(1.658));y.quadraticCurveTo(C+6,Vy(1.662),C+12,Vy(1.646)+2);y.quadraticCurveTo(C,Vy(1.652),C-12,Vy(1.646)+2);y.fill();}
 if(L.scar){y.strokeStyle='rgba(150,60,60,.8)';y.lineWidth=1.4;y.beginPath();y.moveTo(C+5,ey-12);y.lineTo(C+11,ey+9);y.stroke();for(let k=0;k<4;k++){y.beginPath();y.moveTo(C+5.5+k*1.5-2,ey-8+k*5);y.lineTo(C+5.5+k*1.5+2,ey-8+k*5);y.stroke();}}
 if(L.fem&&!toon){for(const s of [1,-1]){y.fillStyle='rgba(150,80,170,.4)';y.beginPath();y.ellipse(C+s*ex,ey-3.2,6.2,2.2,0,0,6.3);y.fill();y.fillStyle='rgba(230,90,110,.22)';y.beginPath();y.ellipse(C+s*(ex+4.5),Vy(1.668),5,3,0,0,6.3);y.fill();}
  y.fillStyle='rgba(200,40,70,.85)';y.beginPath();y.ellipse(C,Vy(1.645),8,2.6,0,0,6.3);y.fill();for(const s of [1,-1]){y.strokeStyle='#1a0a08';y.lineWidth=1.6;y.beginPath();y.moveTo(C+s*(ex+6.5),ey-0.5);y.lineTo(C+s*(ex+9),ey-2.5);y.stroke();}}
 if(L.shades||L.aviators){for(const s of [1,-1]){const cx=C+s*ex;y.fillStyle='rgba(10,10,14,.95)';y.beginPath();if(L.aviators){y.moveTo(cx-s*-7,ey-4);y.lineTo(cx+s*8,ey-4);y.quadraticCurveTo(cx+s*8,ey+6,cx+s*1,ey+6);y.quadraticCurveTo(cx-s*7,ey+5,cx-s*7,ey-4);}else{y.rect(cx-7.5,ey-4,15,8);}y.fill();y.fillStyle='rgba(120,170,220,.45)';y.fillRect(cx-5,ey-3,4,2);
  y.strokeStyle=L.aviators?'#d0a040':'#111';y.lineWidth=1;y.stroke();}y.strokeStyle=L.aviators?'#d0a040':'#111';y.lineWidth=1.4;y.beginPath();y.moveTo(C-2,ey-2);y.lineTo(C+2,ey-2);y.stroke();for(const s of [1,-1]){y.beginPath();y.moveTo(C+s*(ex+7.5),ey-3);y.lineTo(C+s*30,ey-2);y.stroke();}}
 else if(L.glasses&&!toon){y.strokeStyle='#222';y.lineWidth=1.3;for(const s of [1,-1]){y.beginPath();y.ellipse(C+s*ex,ey,7,5.5,0,0,6.3);y.stroke();}y.beginPath();y.moveTo(C-1,ey-1);y.lineTo(C+1,ey-1);y.stroke();}
 y.restore();const x2=c2.getContext('2d');x2.save();x2.scale(2,2);paintEars(x2);
 if(L.earpiece){x2.fillStyle='#111';x2.fillRect(186,100,6,10);x2.strokeStyle='#ddd';x2.lineWidth=0.7;x2.beginPath();x2.moveTo(189,110);x2.lineTo(189,150);x2.stroke();}x2.restore();
 x2.fillStyle='#5a3418';x2.fillRect(0,0,24,6);x2.fillStyle=rgb(L.noseC?C255(L.noseC):SKIN.map(v=>Math.min(255,v*1.04)));x2.fillRect(440,0,26,6);x2.fillStyle='#ff8a2a';x2.fillRect(28,0,20,6);x2.fillStyle='#e8e0d4';x2.fillRect(52,0,20,6);
 if(L.hair){x2.fillStyle=rgb(C255(L.hair));x2.fillRect(132,0,24,6);
  if(toon&&hs){const hc=C255(L.hair),lum=(hc[0]+hc[1]+hc[2])/3,g=x2.createLinearGradient(0,8,0,14);g.addColorStop(0,rgb(hc.map(v=>Math.min(255,v*1.06+8))));g.addColorStop(0.35,rgb(hc.map(v=>Math.min(255,v*1.18+(lum<60?34:16)))));g.addColorStop(0.6,rgb(hc));g.addColorStop(1,rgb(hc.map(v=>v*0.72)));
   x2.fillStyle=g;x2.fillRect(0,7,512,8);for(let i=0;i<512;i+=4){const k=((i*37)%23)/23;x2.fillStyle=k>0.5?rgb(hc.map(v=>v*0.7),0.5):rgb(hc.map(v=>Math.min(255,v*1.25+18)),0.32);x2.fillRect(i+((i*13)%3),7,1+(k>0.8?1:0),8);}}}const hc=C255(L.hatC||[0.1,0.1,0.12]);x2.fillStyle=rgb(hc);x2.fillRect(76,0,24,6);x2.fillStyle=rgb(hc.map(v=>v*0.45));x2.fillRect(104,0,24,6);x2.fillStyle='#0b0b0e';x2.fillRect(160,0,24,6);if(L.beard){x2.fillStyle=rgb(C255(L.beard).map(v=>Math.min(255,v*1.08)));x2.fillRect(188,0,24,6);}
 if(ARMOR[L.armor]){const a=C255(L.armorC||(L.armor==='plate'?[0.27,0.29,0.21]:[0.13,0.14,0.17]));x2.fillStyle=rgb(a);x2.fillRect(330,0,24,6);x2.fillStyle=rgb(a.map(v=>v*0.6));x2.fillRect(358,0,24,6);}
 if(HELMET[L.helmet]){x2.fillStyle=rgb(C255(L.helmetC||(L.helmet==='riot'?[0.07,0.07,0.09]:[0.25,0.28,0.19])));x2.fillRect(386,0,24,6);x2.fillStyle='#5a7490';x2.fillRect(414,0,24,6);}return c2;}
function paintBodyP(L){const sh=C255(L.shirt),jk=C255(L.jacket),sk=C255(L.skin);
 const B={jacket:jk,pants:C255(L.pants),shirt:sh,tie:L.tie?C255(L.tie):null,chain:!!(L.chain||L.medallion),pin:false,square:L.tie?'#e8e4dc':'#f0ece4',shoe:C255(L.shoes||[0.08,0.08,0.09]),shirtScale:1};
 if(L.tee||L.tank){B.jacket=sh;}
 const c=paintBody(shirtCanvas(sh),B),x=c.getContext('2d');
 const fab=(x0,y0,w,h,col)=>{x.fillStyle=rgb(col);x.fillRect(x0,y0,w,h);x.globalAlpha=0.08;x.strokeStyle='#000';for(let i=x0;i<x0+w;i+=3){x.beginPath();x.moveTo(i,y0);x.lineTo(i+h*0.3,y0+h);x.stroke();}x.globalAlpha=1;const g=x.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.18)');x.fillStyle=g;x.fillRect(x0,y0,w,h);};
 if(L.tee||L.tank){fab(0,0,512,290,sh);
  for(const sx of [128,384]){const g=x.createRadialGradient(sx,40,0,sx,40,80);g.addColorStop(0,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-80,0,160,120);}
  x.fillStyle=rgb(sk.map(v=>v*0.9));x.beginPath();x.ellipse(256,0,L.tank?60:38,L.tank?40:22,0,0,6.3);x.fill();
  if(L.chain||L.medallion){x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.moveTo(214,0);x.quadraticCurveTo(256,70,298,0);x.stroke();if(L.medallion){x.fillStyle='#f0c050';x.beginPath();x.arc(256,52,9,0,6.3);x.fill();}}
  fab(0,290,512,90,sk);if(L.tee)fab(0,290,512,26,sh);fab(0,381,512,18,sk);
  if(L.tattoo){x.strokeStyle='rgba(30,50,90,.75)';x.lineWidth=2;for(let k=0;k<14;k++){const tx=Math.random()*512,ty2=300+Math.random()*70;x.beginPath();x.arc(tx,ty2,3+Math.random()*6,0,4);x.stroke();}}
  if(L.tank)for(const sx of [96,416]){x.fillStyle=rgb(sk);x.fillRect(sx-34,0,68,26);}}
 if(L.fem){fab(0,0,512,290,jk);
  for(const sx of [128,384]){const g=x.createRadialGradient(sx,40,0,sx,40,80);g.addColorStop(0,'rgba(0,0,0,.2)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(sx-80,0,160,120);}
  x.fillStyle=rgb(sk.map(v=>v*0.92));x.beginPath();x.ellipse(256,0,44,26,0,0,6.3);x.fill();
  for(const sd of [-1,1]){const g=x.createRadialGradient(256+sd*36,92,4,256+sd*36,100,46);g.addColorStop(0,'rgba(255,255,255,.16)');g.addColorStop(0.6,'rgba(255,255,255,0)');g.addColorStop(0.8,'rgba(0,0,0,.14)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(256+sd*36-50,40,100,110);}
  x.fillStyle=rgb(sh);x.fillRect(0,180,512,9);
  if(L.chain||L.medallion){x.strokeStyle='#e8b84a';x.lineWidth=3;x.beginPath();x.moveTo(220,0);x.quadraticCurveTo(256,46,292,0);x.stroke();if(L.medallion){x.fillStyle='#f0c050';x.beginPath();x.arc(256,36,7,0,6.3);x.fill();}}
  if(L.sleeves)fab(0,290,512,90,jk);else{fab(0,290,512,90,sk);for(const sx of [96,416]){x.fillStyle=rgb(sk);x.fillRect(sx-34,0,68,22);}}fab(0,381,512,18,sk);
  if(L.crop){/* bare midriff between the top's hem (~y 1.17) and the waistband */fab(0,139,512,34,sk);const g=x.createLinearGradient(0,139,0,147);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,139,512,8);
   x.fillStyle=rgb(sk.map(v=>v*0.6));x.beginPath();x.ellipse(256,164,2.2,3,0,0,6.3);x.fill();}}
 if(L.vest){const vc=C255(L.vest);fab(0,0,212,290,vc);fab(300,0,212,290,vc);x.strokeStyle='rgba(0,0,0,.5)';x.lineWidth=3;x.strokeRect(212,0,88,290);if(L.pouches){for(const px of [150,330]){x.fillStyle=rgb(vc.map(v=>v*0.8));x.fillRect(px,150,40,46);x.strokeStyle='rgba(0,0,0,.4)';x.strokeRect(px,150,40,46);}}}
 if(L.apron){const ac=C255(L.apron);fab(150,40,212,250,ac);x.strokeStyle=rgb(ac.map(v=>v*0.7));x.lineWidth=3;x.beginPath();x.moveTo(170,40);x.lineTo(220,0);x.moveTo(342,40);x.lineTo(292,0);x.stroke();
  for(let k=0;k<9;k++){x.fillStyle='rgba(130,10,14,.75)';x.beginPath();x.ellipse(170+Math.random()*170,80+Math.random()*190,4+Math.random()*10,3+Math.random()*7,Math.random()*3,0,6.3);x.fill();}}
 if(L.torsoTile===30||L.torsoTile===31||L.torsoTile===29||L.torsoTile===32){const pat=(x0,y0,w,h,skipV)=>{x.save();x.beginPath();x.rect(x0,y0,w,h);if(skipV)x.rect(362,0,-212,150);x.clip('evenodd');if(L.fem&&L.crop){x.beginPath();x.rect(0,0,512,512);x.rect(0,139,512,34);x.clip('evenodd');}
  if(L.torsoTile===30){x.strokeStyle='rgba(235,235,245,.38)';x.lineWidth=1;for(let i=x0;i<x0+w;i+=7){x.beginPath();x.moveTo(i,y0);x.lineTo(i,y0+h);x.stroke();}}
  else if(L.torsoTile===31){const cs=['#3e4a26','#6b6b3a','#2a2a1a','#7a7048'];for(let k=0;k<w*h/260;k++){x.fillStyle=cs[k%4];x.beginPath();x.ellipse(x0+Math.random()*w,y0+Math.random()*h,6+Math.random()*12,4+Math.random()*8,Math.random()*3,0,6.3);x.fill();}}
  else if(L.torsoTile===32){for(let k=0;k<w*h/900;k++){const px=x0+Math.random()*w,py=y0+Math.random()*h,sz=6+Math.random()*5,cs=Math.random()<0.55?['#ff5fb8','#ffb070']:['#2de2e6','#3a6ae0'];x.save();x.translate(px,py);x.rotate(Math.random()*6.3);const gr=x.createLinearGradient(-sz*1.6,0,sz*1.6,0);gr.addColorStop(0,cs[0]);gr.addColorStop(1,cs[1]);x.fillStyle=gr;x.beginPath();x.ellipse(0,0,sz*1.6,sz*0.55,0,0,6.3);x.fill();x.beginPath();x.moveTo(-sz*1.4,0);x.lineTo(-sz*2.3,-sz*0.7);x.lineTo(-sz*2.2,sz*0.7);x.closePath();x.fill();x.beginPath();x.moveTo(-sz*0.2,-sz*0.45);x.lineTo(sz*0.25,-sz*1.1);x.lineTo(sz*0.6,-sz*0.4);x.closePath();x.fill();x.restore();}}
  else{for(let k=0;k<w*h/500;k++){x.fillStyle=k%2?'rgba(255,240,120,.7)':'rgba(255,255,255,.6)';x.beginPath();x.arc(x0+Math.random()*w,y0+Math.random()*h,2+Math.random()*4,0,6.3);x.fill();}}x.restore();};
  if(L.tee||L.tank)pat(0,0,512,290,false);else{pat(0,0,512,290,true);pat(0,290,512,90,false);}if(L.legTile===L.torsoTile)pat(0,440,512,72,false);}
 if(L.gloves){const gc=C255(L.gloves);x.fillStyle=rgb(gc);x.fillRect(0,400,150,40);x.fillRect(0,381,512,18);}
 return c;}
/* look fields v2 (additive; absent = v1 output):
   armor:'vest'|'plate' (any body) soft vest or plate carrier over the torso; armorC:[r,g,b] 0..1 colour.
   helmet:'pasgt'|'riot' (any body) replaces hat and hides hair; helmetC:[r,g,b] 0..1 colour.
   fem only: heels:1 pumps; pads:1 80s shoulder pads; crop:1 bare midriff. */
const ARMOR={vest:1,plate:1},HELMET={pasgt:1,riot:1};
function lookCfg(L,bodyType){const fb=k=>BODYCFG[L.fem&&k==='thin'?'slim':k],bt=fb(bodyType)||fb(L.body)||BODYCFG.normal,helmet=HELMET[L.helmet]?L.helmet:null;
 return{L,B:{toon:L.toon!==false,specs:L.glasses?1:0,fluff:!!(L.fluff&&L.beard),hs:(L.hair&&!L.hat&&!helmet)?L.hs:null,watch:L.watch?-1:0,cigar:!!L.cigar,hat:helmet?null:(L.hat||null),shoulders:bt.shoulders||0,belly:bt.belly||(L.belly?0.1:0),rings:L.bling?1:0,fem:!!L.fem,skirt:L.fem?(L.skirt||0):0,
  armor:ARMOR[L.armor]?L.armor:null,helmet,heels:!!(L.fem&&L.heels),pads:!!(L.fem&&L.pads),crop:!!(L.fem&&L.crop)},scale:L.fem?bt.scale.map((v,i)=>v*BODYP.fem.scale[i]):bt.scale,gait:(L.fem?BODYP.fem:BODYP.male).gait};}
export {BONES,BI,NB,HEAD,FACECFG,V,M4,AD,SH,EL,WR,mir,paintHead,paintSmile,paintBody,paintHeadP,paintBodyP,shirtCanvas,tropicalCanvas,buildBody,buildHead,normals,pose,lookCfg,BODYCFG,C255,handFrame};