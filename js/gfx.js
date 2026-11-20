/* ============ gfx.js：绘图原语 / 角色 / 道具 / 特效 / 雾 ============ */
const TAU = Math.PI*2;
function lerp(a,b,k){ return a+(b-a)*k; }
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function ease(k){ k=clamp(k,0,1); return k*k*(3-2*k); }
function seeded(seed){ // mulberry32
  let s=seed>>>0;
  return function(){ s|=0; s=(s+0x6D2B79F5)|0; let t=Math.imul(s^(s>>>15),1|s);
    t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
}
function mk(w,h,fn){ const c=document.createElement('canvas'); c.width=w; c.height=h;
  const x=c.getContext('2d'); fn(x); return c; }

function glow(ctx,x,y,r,color,alpha){
  if(alpha<=0.002) return;
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,color.replace('$A',alpha.toFixed(3)));
  g.addColorStop(1,color.replace('$A','0'));
  ctx.fillStyle=g; ctx.fillRect(x-r,y-r,r*2,r*2);
}
let _vg=null;
function vignette(ctx){
  if(!_vg) _vg=mk(1280,720,c=>{
    const g=c.createRadialGradient(640,340,250,640,360,780);
    g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.62)');
    c.fillStyle=g; c.fillRect(0,0,1280,720);
  });
  ctx.drawImage(_vg,0,0);
}

/* ============ Rig：影子历史缓冲（"影子慢半拍"的机制核心） ============ */
const Rig = {
  map:{},
  actor(id,lag){ const a=this.map[id]||(this.map[id]={lag:lag||0.5,hist:[]}); return a; },
  set(id,t,x,y,pose,ph,flip,s,lag){
    const a=this.actor(id,lag);
    if(lag!==undefined) a.lag=lag;
    a.hist.push({t,x,y,pose:pose||'stand',ph:ph||0,flip:flip?1:0,s:s||1});
    const cut=t-4;
    while(a.hist.length>2 && a.hist[1].t<cut) a.hist.shift();
  },
  at(id,tNow){
    const a=this.actor(id); const h=a.hist;
    if(!h.length) return null;
    const tt=tNow-a.lag;
    if(tt<=h[0].t) return h[0];
    for(let i=h.length-1;i>=0;i--){
      if(h[i].t<=tt){
        const a0=h[i], a1=h[Math.min(i+1,h.length-1)];
        const k=a1.t>a0.t?(tt-a0.t)/(a1.t-a0.t):0;
        return { x:lerp(a0.x,a1.x,k), y:lerp(a0.y,a1.y,k),
          pose:(a0.pose!==a1.pose)?a0.pose:a1.pose,
          ph:lerp(a0.ph,a1.ph,k), flip:a0.flip, s:lerp(a0.s,a1.s,k) };
      }
    }
    return h[h.length-1];
  },
  jump(id){ const a=this.map[id]; if(a) a.hist.length=0; }
};

/* ============ 角色：剪影人形 ============ */
/* o={x,y(地面),h,pose,ph,flip,color,rim,cane,pipe,cap,coatW,lean} */
function humanoid(ctx,o){
  const h=o.h||260;
  const c=o.color||'#070b09';
  const lw=Math.max(3,h*0.052);
  ctx.save(); ctx.translate(o.x,o.y); if(o.flip) ctx.scale(-1,1);
  // 地面接触阴影（影子副本调用时带 groundShadow:false 跳过）
  if(o.groundShadow){
    const sr=h*0.17;
    ctx.save(); ctx.translate(0,3); ctx.scale(1,0.3);
    const gs=ctx.createRadialGradient(0,0,0,0,0,sr);
    gs.addColorStop(0,'rgba(0,0,0,0.34)'); gs.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gs; ctx.beginPath(); ctx.arc(0,0,sr,0,TAU); ctx.fill();
    ctx.restore();
  }
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.strokeStyle=c; ctx.fillStyle=c;
  const pose=o.pose||'stand', ph=o.ph||0;
  let lean=(o.lean||0)*h;
  if(pose==='stand'&&o.t!==undefined) lean+=Math.sin(o.t*0.7)*h*0.01; // 站姿重心微移
  const br=(o.t!==undefined)?Math.sin(o.t*1.5)*h*0.006:0;            // 呼吸起伏
  const hipY=-h*0.52, shY=-h*0.78-br*0.6, headCY=-h*0.875-br, headR=h*0.072;
  let f1=[-0.09*h,0], f2=[0.09*h,0], hd1=[-0.13*h,-0.40*h], hd2=[0.13*h,-0.40*h];
  let hip=hipY, footTilt=0;
  const s=Math.sin(ph);
  switch(pose){
    case 'walk':
      f1=[0.17*h*s, -0.055*h*Math.max(0,s)];
      f2=[-0.17*h*s, -0.055*h*Math.max(0,-s)];
      hd1=[0.12*h*Math.sin(ph+Math.PI),-0.40*h];
      hd2=[0.12*h*Math.sin(ph),-0.40*h];
      break;
    case 'point': hd2=[0.46*h,-0.72*h]; break;
    case 'handout': hd2=[0.30*h,-0.50*h]; break;
    case 'raise': hd2=[0.18*h,-0.99*h]; break;
    case 'arm': { // 0=垂手 1=高举 2=平指（影子抬手专用，连续插值）
      const k=clamp(o.armK||0,0,2);
      if(k<=1) hd2=[lerp(0.13,0.18,k)*h, lerp(-0.40,-0.99,k)*h];
      else hd2=[lerp(0.18,0.46,k-1)*h, lerp(-0.99,-0.72,k-1)*h];
      break;
    }
    case 'work':
      f1=[-0.10*h,0]; f2=[0.06*h,0];
      hd1=[0.30*h,-0.48*h]; hd2=[0.42*h,-0.46*h];
      break;
    case 'sit':
      hip=-0.30*h;
      f1=[0.17*h,0]; f2=[0.26*h,0];
      hd1=[-0.10*h,-0.44*h]; hd2=[0.16*h,-0.42*h];
      break;
    case 'kneel':
      hip=-0.36*h;
      f1=[0.16*h,0]; f2=[-0.18*h,-0.02*h];
      hd1=[-0.12*h,-0.30*h]; hd2=[0.10*h,-0.30*h];
      break;
    case 'crouch':
      hip=-0.34*h;
      f1=[-0.17*h,0]; f2=[0.17*h,0];
      hd1=[-0.12*h,-0.30*h]; hd2=[0.12*h,-0.30*h];
      break;
  }
  // 影子用：更暗更平
  function limb(x1,y1,x2,y2,x3,y3,w){
    ctx.lineWidth=w||lw;
    ctx.beginPath(); ctx.moveTo(x1,y1);
    ctx.quadraticCurveTo(x2,y2,x3,y3); ctx.stroke();
  }
  const kx1=(f1[0]>=0?0.06:-0.06)*h, kx2=(f2[0]>=0?0.06:-0.06)*h;
  // 腿
  limb(0,hip,(f1[0]+kx1)/2,(hip+0)/2 - h*0.02,f1[0],f1[1],lw*1.15);
  limb(0,hip,(f2[0]+kx2)/2,(hip+0)/2 - h*0.02,f2[0],f2[1],lw*1.15);
  // 躯干（粗描线）+ 大衣
  const shX=lean;
  ctx.lineWidth=h*0.13;
  ctx.beginPath(); ctx.moveTo(0,hip); ctx.quadraticCurveTo(lean*0.4,(hip+shY)/2,shX,shY); ctx.stroke();
  const cw=(o.coatW||1)*0.15*h;
  ctx.beginPath();
  ctx.moveTo(shX-cw*0.8,shY+0.01*h);
  ctx.quadraticCurveTo(shX,shY-h*0.02,shX+cw*0.8,shY+0.01*h);
  ctx.quadraticCurveTo(shX+cw*1.1,-0.10*h,shX+cw*0.95,-0.055*h);
  ctx.lineTo(shX-cw*0.95,-0.055*h);
  ctx.quadraticCurveTo(shX-cw*1.1,-0.10*h,shX-cw*0.8,shY+0.01*h);
  ctx.fill();
  // 手臂
  limb(shX,shY-0.02*h,(shX+hd1[0])/2,(shY+hd1[1])/2+h*0.03,hd1[0],hd1[1],lw*0.9);
  limb(shX,shY-0.02*h,(shX+hd2[0])/2,(shY+hd2[1])/2+h*0.03,hd2[0],hd2[1],lw*0.9);
  // 头颈
  ctx.lineWidth=lw*0.8;
  ctx.beginPath(); ctx.moveTo(shX,shY); ctx.lineTo(shX*1.3,headCY+headR*0.8); ctx.stroke();
  // 头（椭圆，避免正圆的"鸡蛋"感）
  const hcx=shX*1.3;
  ctx.beginPath(); ctx.ellipse(hcx,headCY,headR*0.92,headR*1.08,0,0,TAU); ctx.fill();
  // 发型（剪影语言：头顶的形状差异）
  const hair=o.hair;
  if(hair==='short'){ // 军式短发：贴头皮的平顶
    ctx.beginPath();
    ctx.ellipse(hcx,headCY-headR*0.28,headR*0.98,headR*0.82,0,Math.PI,TAU);
    ctx.fill();
    ctx.beginPath(); ctx.ellipse(hcx-headR*0.95,headCY,headR*0.18,headR*0.5,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hcx+headR*0.95,headCY,headR*0.18,headR*0.5,0,0,TAU); ctx.fill();
  }else if(hair==='messy'){ // 微乱中发：三个鼓包+侧延
    ctx.beginPath();
    ctx.moveTo(hcx-headR*1.02,headCY+headR*0.15);
    ctx.quadraticCurveTo(hcx-headR*1.25,headCY-headR*0.7, hcx-headR*0.5,headCY-headR*1.02);
    ctx.quadraticCurveTo(hcx-headR*0.1,headCY-headR*1.38, hcx+headR*0.45,headCY-headR*1.0);
    ctx.quadraticCurveTo(hcx+headR*1.05,headCY-headR*0.85, hcx+headR*1.05,headCY-headR*0.1);
    ctx.quadraticCurveTo(hcx+headR*0.9,headCY-headR*0.5, hcx+headR*0.2,headCY-headR*0.55);
    ctx.quadraticCurveTo(hcx-headR*0.6,headCY-headR*0.6, hcx-headR*1.02,headCY+headR*0.15);
    ctx.closePath(); ctx.fill();
  }else if(hair==='long'){ // 及肩长发：两侧垂落
    ctx.beginPath();
    ctx.moveTo(hcx-headR*1.05,headCY+headR*0.6);
    ctx.quadraticCurveTo(hcx-headR*1.35,headCY-headR*0.5, hcx-headR*0.4,headCY-headR*1.15);
    ctx.quadraticCurveTo(hcx,headCY-headR*1.5, hcx+headR*0.45,headCY-headR*1.1);
    ctx.quadraticCurveTo(hcx+headR*1.3,headCY-headR*0.35, hcx+headR*1.05,headCY+headR*0.6);
    ctx.quadraticCurveTo(hcx+headR*1.15,headCY+headR*1.1, hcx+headR*0.9,headCY+headR*1.7);
    ctx.lineTo(hcx-headR*0.9,headCY+headR*1.7);
    ctx.quadraticCurveTo(hcx-headR*1.15,headCY+headR*1.1, hcx-headR*1.05,headCY+headR*0.6);
    ctx.closePath(); ctx.fill();
  }
  if(o.cap){ // 扁帽
    ctx.beginPath(); ctx.arc(shX*1.3,headCY-headR*0.35,headR*1.06,Math.PI,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(shX*1.3,headCY-headR*0.36,headR*1.25,headR*0.22,0,0,TAU); ctx.fill();
  }
  if(o.pipe && (pose==='stand'||pose==='sit'||pose==='walk')){
    const mx=shX*1.3+headR*0.85, my=headCY+headR*0.28;
    ctx.lineWidth=lw*0.5;
    ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx+0.07*h,my+0.015*h); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx+0.085*h,my+0.02*h,h*0.022,0,TAU); ctx.fill();
    if(o.smoke&&o.t!==undefined){
      glow(ctx,mx+0.085*h,my+0.02*h,h*0.05,'rgba(180,255,200,$A)',0.10+0.06*Math.sin(o.t*7));
      // 烟斗烟：无状态飘散圈
      for(let i=0;i<3;i++){
        const k=(o.t*0.3+i*0.34)%1;
        const px=mx+0.09*h+Math.sin(o.t*1.8+i*2.1)*0.014*h;
        const py=my+0.01*h-k*0.16*h;
        ctx.fillStyle=`rgba(185,235,205,${(0.12*(1-k)).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(px,py,(0.006+0.02*k)*h,0,TAU); ctx.fill();
      }
      ctx.fillStyle=c;
    }
  }
  if(o.cane && pose!=='lie'){
    const hx=(pose==='sit')?0.30*h:hd2[0];
    const hy=(pose==='sit')?-0.42*h:hd2[1];
    ctx.lineWidth=lw*0.55;
    ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx+0.13*h,0); ctx.stroke();
    ctx.beginPath(); ctx.arc(hx,hy,0.016*h,0,TAU); ctx.fill();
  }
  // 边缘微光（可读性）：以背光晕代替描边
  if(o.rim){
    ctx.globalCompositeOperation='lighter';
    glow(ctx,shX,-h*0.55,h*0.75,'rgba(130,255,190,$A)',0.05);
    ctx.globalCompositeOperation='source-over';
  }
  ctx.restore();
}

/* 倒卧的人（病床/尸体） o={x,y(床面),h,headRight,blanket,still} */
function lyingFigure(ctx,o){
  const h=o.h||200, c=o.color||'#070b09';
  ctx.save(); ctx.translate(o.x,o.y); if(!o.headRight) ctx.scale(-1,1);
  ctx.fillStyle=c; ctx.strokeStyle=c; ctx.lineCap='round';
  const th=0.14*h;
  // 躯干
  ctx.beginPath();
  ctx.ellipse(-0.30*h,-th/2-1,0.36*h,th,0,0,TAU); ctx.fill();
  // 头
  ctx.fillStyle=o.headColor||c;
  ctx.beginPath(); ctx.arc(0.16*h,-th*0.7,0.085*h,0,TAU); ctx.fill();
  ctx.fillStyle=c;
  // 腿
  ctx.lineWidth=0.05*h;
  ctx.beginPath(); ctx.moveTo(-0.62*h,-th*0.4); ctx.lineTo(-0.86*h,-th*0.3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.62*h,-th*0.5); ctx.lineTo(-0.88*h,-th*0.55); ctx.stroke();
  // 手臂搭在被子上
  ctx.beginPath(); ctx.moveTo(-0.18*h,-th*1.05); ctx.quadraticCurveTo(-0.34*h,-th*1.5,-0.44*h,-th*1.15); ctx.stroke();
  if(o.blanket){
    ctx.fillStyle=o.blanket;
    ctx.beginPath();
    ctx.moveTo(-0.02*h,-th*1.6);
    ctx.quadraticCurveTo(-0.35*h,-th*2.15,-0.72*h,-th*1.7);
    ctx.lineTo(-0.90*h,-th*1.15);
    ctx.quadraticCurveTo(-0.4*h,-th*0.55,-0.05*h,-th*0.9);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(180,255,210,0.06)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(-0.10*h,-th*1.5); ctx.quadraticCurveTo(-0.4*h,-th*2.0,-0.70*h,-th*1.55); ctx.stroke();
  }
  ctx.restore();
}

/* 无脸影子生物（第三幕收脸/第五幕站起） o={x,y,h,pose,ph,flip} */
function shadowFigure(ctx,o){
  const jag=seeded(7);
  const h=o.h||240;
  // 背光晕：让纯黑剪影从暗背景里读出来
  glow(ctx,o.x,o.y-h*0.45,h*1.15,'rgba(150,225,175,$A)',0.26);
  glow(ctx,o.x,o.y-h*0.45,h*0.5,'rgba(180,240,200,$A)',0.18);
  // 本体（humanoid 自带 translate/scale，这里不要重复包裹）
  humanoid(ctx,{...o,color:'#010302',coatW:1.05,h:h,rim:false});
  // 流动的锯齿雾状下摆
  ctx.save(); ctx.translate(o.x,o.y); if(o.flip) ctx.scale(-1,1);
  ctx.fillStyle='rgba(1,3,2,0.92)';
  ctx.beginPath();
  ctx.moveTo(-0.16*h,-0.06*h);
  const n=9;
  for(let i=0;i<=n;i++){
    const px=-0.16*h+(0.32*h)*i/n;
    const py=-0.06*h + (0.10+0.10*jag())*h*Math.abs(Math.sin(i*2.4+(o.t||0)));
    ctx.lineTo(px,py);
  }
  ctx.lineTo(0.16*h,-0.10*h); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* 老鼠 o={x,y,h(~34),pose:'walk'|'stand'|'pray',ph,color} */
function rat(ctx,o){
  const h=o.h||34, c=o.color||'#070b09';
  ctx.save(); ctx.translate(o.x,o.y); if(o.flip) ctx.scale(-1,1);
  ctx.fillStyle=c; ctx.strokeStyle=c; ctx.lineCap='round';
  const ph=o.ph||0;
  if(o.pose==='walk'){
    // 四足
    ctx.beginPath(); ctx.ellipse(0,-h*0.22,h*0.5,h*0.22,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(h*0.42,-h*0.30,h*0.16,0,TAU); ctx.fill();
    ctx.lineWidth=h*0.07;
    ctx.beginPath(); ctx.moveTo(h*0.30,-h*0.16); ctx.lineTo(h*0.30+h*0.10*Math.sin(ph),0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(h*0.20,-h*0.16); ctx.lineTo(h*0.20-h*0.10*Math.sin(ph),0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-h*0.30,-h*0.16); ctx.lineTo(-h*0.30-h*0.10*Math.sin(ph),0); ctx.stroke();
    // 尾
    ctx.lineWidth=h*0.06;
    ctx.beginPath(); ctx.moveTo(-h*0.46,-h*0.2);
    ctx.quadraticCurveTo(-h*0.85,-h*0.3+h*0.1*Math.sin(ph*1.3),-h*1.15,-h*0.12+h*0.14*Math.sin(ph*0.9));
    ctx.stroke();
    // 耳
    ctx.beginPath(); ctx.arc(h*0.40,-h*0.46,h*0.08,0,TAU); ctx.fill();
  }else{
    // 直立（stand/pray）
    const tilt=-0.9;
    ctx.save(); ctx.rotate(tilt);
    ctx.beginPath(); ctx.ellipse(-h*0.1,-h*0.25,h*0.42,h*0.2,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-h*0.62,-h*0.34,h*0.15,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-h*0.56,-h*0.5,h*0.08,0,TAU); ctx.fill();
    ctx.lineWidth=h*0.09;
    ctx.beginPath(); ctx.moveTo(-h*0.30,-h*0.16); ctx.lineTo(-h*0.34,0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-h*0.02,-h*0.14); ctx.lineTo(-h*0.06,0); ctx.stroke();
    ctx.lineWidth=h*0.06;
    ctx.beginPath(); ctx.moveTo(0.28*h,-0.3*h);
    ctx.quadraticCurveTo(h*0.62,-h*0.44,h*0.8,-h*0.2); ctx.stroke();
    if(o.pose==='pray'){
      ctx.lineWidth=h*0.07;
      ctx.beginPath(); ctx.moveTo(-h*0.72,-h*0.4); ctx.lineTo(-h*0.82,-h*0.52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-h*0.68,-h*0.42); ctx.lineTo(-h*0.80,-h*0.55); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

/* 角色预设 */
const Chars = {
  holmes(ctx,snap,o){ humanoid(ctx,{h:280,coatW:1.18,pipe:true,hair:'messy',groundShadow:true,...snap,...o}); },
  watson(ctx,snap,o){ humanoid(ctx,{h:252,cane:true,coatW:1.0,hair:'short',groundShadow:true,...snap,...o}); },
  wiggins(ctx,snap,o){ humanoid(ctx,{h:170,cap:true,coatW:0.85,groundShadow:true,...snap,...o}); },
  prince(ctx,snap,o){ humanoid(ctx,{h:262,coatW:0.78,hair:'long',groundShadow:true,...snap,...o}); },
  rat(ctx,snap,o){ rat(ctx,{h:34,...snap,...o}); },
  shadow(ctx,snap,o){ shadowFigure(ctx,{h:250,...snap,...o}); }
};
/* 画影子副本（黑色，背向光源偏移） */
function drawShadowOf(ctx,drawFn,snap,o){
  const lampX=o.lampX!==undefined?o.lampX:640;
  const dir=snap.x<lampX?-1:1;
  drawFn(ctx,{...snap,x:snap.x+dir*14*(snap.s||1),y:snap.y+4},{...o,color:'rgba(2,6,4,0.88)',rim:false,pipe:false,smoke:false,groundShadow:false,cane:o.keepCane});
}

/* ============ 道具 ============ */
const Props = {
  dome(ctx,x,y,s){ // 玻璃罩（x,y=罩底中心，底在桌面上）
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    ctx.strokeStyle='rgba(170,255,215,0.4)'; ctx.fillStyle='rgba(150,255,205,0.05)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(-56,0); ctx.lineTo(-56,-18);
    ctx.arc(0,-18,56,Math.PI,0);
    ctx.lineTo(56,0);
    ctx.fill(); ctx.stroke();
    // 底盘
    ctx.fillStyle='#0d1310'; ctx.beginPath(); ctx.ellipse(0,2,64,8,0,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(170,255,215,0.25)'; ctx.beginPath(); ctx.ellipse(0,2,64,8,0,0,TAU); ctx.stroke();
    // 高光
    ctx.strokeStyle='rgba(220,255,235,0.30)';
    ctx.beginPath(); ctx.arc(0,-18,46,Math.PI*1.15,Math.PI*1.45); ctx.stroke();
    ctx.restore();
  },
  note(ctx,x,y,rot,s,inkColor){
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot||0); ctx.scale(s,s);
    ctx.fillStyle='#cfc6a4'; ctx.fillRect(-42,-30,84,60);
    ctx.fillStyle='rgba(90,70,40,0.25)'; ctx.fillRect(-42,-6,84,2);
    ctx.strokeStyle='rgba(60,160,110,0.85)'; ctx.lineWidth=1.4; ctx.lineCap='round';
    for(let i=0;i<4;i++){
      ctx.beginPath();
      ctx.moveTo(-32,-18+i*12);
      const wdt=[58,50,56,30][i];
      for(let k=1;k<=5;k++){
        ctx.lineTo(-32+wdt*k/5, -18+i*12 + Math.sin(k*2.2+i*3)*2.2);
      }
      ctx.stroke();
    }
    ctx.restore();
  },
  coin(ctx,x,y,r){
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle='#b9a15e'; ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill();
    ctx.strokeStyle='rgba(255,240,180,0.8)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(0,0,r*0.62,0,TAU); ctx.stroke();
    ctx.restore();
  },
  vial(ctx,x,y,s,full){
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    ctx.fillStyle='rgba(150,255,205,0.14)';
    ctx.strokeStyle='rgba(190,255,225,0.55)'; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(-5,-2); ctx.lineTo(-5,-12); ctx.lineTo(-2.5,-14); ctx.lineTo(-2.5,-20);
    ctx.lineTo(2.5,-20); ctx.lineTo(2.5,-14); ctx.lineTo(5,-12); ctx.lineTo(5,-2);
    ctx.arc(0,-2,5,0,Math.PI,true); ctx.closePath(); ctx.fill(); ctx.stroke();
    if(full){
      const g=ctx.createRadialGradient(0,-6,0,0,-6,9);
      g.addColorStop(0,'rgba(120,255,180,0.9)'); g.addColorStop(1,'rgba(40,160,100,0.5)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.ellipse(0,-7,4.6,8,0,0,TAU); ctx.fill();
      glow(ctx,0,-7,16,'rgba(90,255,170,$A)',0.35);
    }else{
      ctx.fillStyle='rgba(200,230,210,0.10)';
      ctx.beginPath(); ctx.ellipse(0,-6,4.6,8,0,0,TAU); ctx.fill();
    }
    // 木塞
    ctx.fillStyle='#7a6440'; ctx.fillRect(-3,-24,6,5);
    ctx.restore();
  },
  chair(ctx,x,y,s){
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    ctx.fillStyle='#0a0f0c';
    ctx.fillRect(-26,-56,52,8);            // 座面
    ctx.fillRect(-24,-100,8,46);           // 背柱
    ctx.fillRect(16,-100,8,46);
    ctx.fillRect(-22,-100,44,7);           // 背板
    ctx.fillRect(-24,-48,7,48); ctx.fillRect(17,-48,7,48); // 前腿
    ctx.restore();
  },
  bed(ctx,x,y,w,hgt){ // x,y=床头左上（地面），w 床长
    const hgt2=hgt||64;
    ctx.save(); ctx.translate(x,y);
    ctx.fillStyle='#0b100d';
    ctx.fillRect(0,-hgt2-18,10,hgt2+18);   // 床头板
    ctx.fillRect(0,-hgt2-26,10,10);
    ctx.fillStyle='rgba(150,255,190,0.10)'; // 床沿受光
    ctx.fillRect(0,-hgt2,w,3);
    ctx.fillStyle='#0b100d';
    ctx.fillRect(0,-hgt2+3,w,hgt2*0.28);    // 床垫
    ctx.fillRect(w-8,-hgt2*0.7,8,hgt2*0.7); // 床尾
    ctx.fillStyle='#101812';
    ctx.fillRect(6,-hgt2+9,Math.min(120,w*0.3),10); // 枕头暗示
    ctx.restore();
  }
};

/* ============ 特效 ============ */
const Fx = {
  flame(ctx,x,y,s,t,hue){ // 绿色火焰（hue: 'green'|'amber'）
    const col = hue==='amber' ? ['rgba(255,210,120,','rgba(255,140,40,'] : ['rgba(160,255,200,','rgba(60,230,150,'];
    ctx.save(); ctx.translate(x,y); ctx.globalCompositeOperation='lighter';
    for(let L=0;L<3;L++){
      const w=s*(0.36-L*0.10)*(1+0.18*Math.sin(t*13+L*2.1));
      const hgt=s*(1.7-L*0.42)*(1+0.10*Math.sin(t*17+L*1.7));
      const wob=Math.sin(t*11+L*3)*s*0.14;
      const g=ctx.createLinearGradient(0,0,0,-hgt);
      g.addColorStop(0,col[1]+'0.85)'); g.addColorStop(0.55,col[0]+'0.5)'); g.addColorStop(1,col[0]+'0)');
      ctx.fillStyle=g;
      ctx.beginPath();
      ctx.moveTo(-w,0);
      ctx.quadraticCurveTo(-w*1.1,-hgt*0.45, wob,-hgt);
      ctx.quadraticCurveTo(w*1.1,-hgt*0.45, w,0);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  },
  eyes(ctx,x,y,s,blink){
    const k=(blink===undefined)?1:(0.55+0.45*Math.abs(Math.sin(blink*2.2)));
    glow(ctx,x,y,20*s,'rgba(190,255,140,$A)',0.7*k);
    ctx.fillStyle=`rgba(235,255,190,${0.98*k})`;
    ctx.beginPath(); ctx.ellipse(x-8*s,y,4.5*s,3.2*s*k,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+8*s,y,4.5*s,3.2*s*k,0,0,TAU); ctx.fill();
    // 竖瞳
    ctx.fillStyle=`rgba(10,20,14,${0.9*k})`;
    ctx.beginPath(); ctx.ellipse(x-8*s,y,1.2*s,2.6*s*k,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+8*s,y,1.2*s,2.6*s*k,0,0,TAU); ctx.fill();
  },
  glint(ctx,x,y,k){
    if(k<=0) return;
    ctx.save(); ctx.globalCompositeOperation='lighter';
    const r=26*k;
    ctx.strokeStyle=`rgba(255,255,240,${0.85*k})`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x-r,y); ctx.lineTo(x+r,y); ctx.moveTo(x,y-r); ctx.lineTo(x,y+r); ctx.stroke();
    glow(ctx,x,y,r*1.6,'rgba(255,255,220,$A)',0.4*k);
    ctx.restore();
  },
  /* 体积光锥：apexY 为光锥顶点，baseY 为底边（可上下任意方向），w0/w1 为两端口半宽 */
  lightCone(ctx,ax,apexY,w0,baseY,w1,color,alpha){
    if(alpha<=0.003) return;
    ctx.save(); ctx.globalCompositeOperation='screen';
    const g=ctx.createLinearGradient(0,apexY,0,baseY);
    g.addColorStop(0,color.replace('$A',alpha.toFixed(3)));
    g.addColorStop(1,color.replace('$A','0'));
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.moveTo(ax-w0,apexY); ctx.lineTo(ax+w0,apexY);
    ctx.lineTo(ax+w1,baseY); ctx.lineTo(ax-w1,baseY);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },
  /* 粉笔笔画：pts=[u,v] 归一化折线（v: 0=基线 1=大写顶），frac 为部分绘制比例 */
  chalkStroke(ctx,pts,bx,y,hs,alpha,jseed){
    for(let pass=0;pass<2;pass++){
      ctx.strokeStyle=`rgba(120,245,180,${alpha*(pass?0.85:0.4)})`;
      ctx.lineWidth=pass?7:9; ctx.lineCap='round'; ctx.lineJoin='round';
      ctx.beginPath();
      pts.forEach((p,i)=>{
        const jx=Math.sin(i*3.7+jseed)*2.4+(pass?1.5:0);
        const jy=Math.cos(i*2.9+jseed)*1.9;
        const X=bx+p[0]*hs*0.66+jx, Y=y-p[1]*hs+jy;
        i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);
      });
      ctx.stroke();
    }
  },
  chalkPartial(pts,frac){ // 折线按长度比例截断
    if(frac>=1) return pts;
    const n=pts.length;
    if(n<2||frac<=0) return [pts[0]];
    const segs=[]; let total=0;
    for(let i=1;i<n;i++){
      const dx=pts[i][0]-pts[i-1][0], dy=pts[i][1]-pts[i-1][1];
      const L=Math.hypot(dx,dy); segs.push(L); total+=L;
    }
    const target=total*clamp(frac,0,1);
    const out=[pts[0]]; let acc=0;
    for(let i=1;i<n;i++){
      if(acc+segs[i-1]>=target){
        const k=(target-acc)/segs[i-1];
        out.push([lerp(pts[i-1][0],pts[i][0],k), lerp(pts[i-1][1],pts[i][1],k)]);
        return out;
      }
      acc+=segs[i-1]; out.push(pts[i]);
    }
    return out;
  },
  /* 粒子池：powder 粉末 / petal 花瓣 */
  pool:[],
  spawn(pool,x,y,opts){
    pool.push({x,y,vx:opts.vx||0,vy:opts.vy||20,g:opts.g||0,r:opts.r||2,
      life:opts.life||2,age:0,col:opts.col||'rgba(210,255,225,',sway:opts.sway||0,ph:Math.random()*TAU});
  },
  drawPool(ctx,pool,dt){
    for(let i=pool.length-1;i>=0;i--){
      const p=pool[i]; p.age+=dt;
      if(p.age>p.life){ pool.splice(i,1); continue; }
      p.vy+=p.g*dt;
      p.x+=p.vx*dt + (p.sway?Math.sin(p.age*3+p.ph)*p.sway:0);
      p.y+=p.vy*dt;
      const k=1-p.age/p.life;
      ctx.fillStyle=p.col+(0.8*k)+')';
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*(0.5+0.5*k),0,TAU); ctx.fill();
    }
  }
};

/* ============ 绿雾 ============ */
const Fog = {
  parts:[], intensity:0.35, target:0.35, surgeI:0, surgeX:null,
  init(){
    this.parts.length=0;
    const rnd=seeded(2026);
    for(let i=0;i<80;i++){
      this.parts.push({x:rnd()*1280,y:rnd()*720,r:70+rnd()*190,
        vx:4+rnd()*16,vy:-1.5+rnd()*3,a:0.05+rnd()*0.10,ph:rnd()*TAU});
    }
  },
  reset(){ this.init(); this.intensity=this.target=0.35; this.surgeI=0; },
  setIntensity(v){ this.target=v; },
  surge(x){ this.surgeI=1; this.surgeX=x; },
  update(dt){
    this.intensity += (this.target-this.intensity)*Math.min(1,dt*2);
    if(this.surgeI>0 && this.surgeX!=null){
      for(let k=0;k<3;k++){
        this.parts.push({x:this.surgeX+(Math.random()-0.5)*120,y:640+Math.random()*60,
          r:80+Math.random()*160,vx:(Math.random()-0.5)*40,vy:-30-Math.random()*50,
          a:0.10+Math.random()*0.14,ph:Math.random()*TAU,born:1});
      }
    }
    for(let i=this.parts.length-1;i>=0;i--){
      const p=this.parts[i];
      p.x+=p.vx*dt; p.y+=p.vy*dt;
      if(p.x-p.r>1280+140) p.x=-p.r-100;
      if(p.x+p.r<-140) p.x=1280+p.r-40;
      if(p.y<-p.r-60) p.y=720+p.r*0.7;
      if(p.y>720+p.r+60 && !p.born) p.y=-p.r*0.4;
      if(p.born && p.y<-p.r) { this.parts.splice(i,1); }
    }
    if(this.parts.length>240) this.parts.splice(0,this.parts.length-240);
  },
  draw(ctx){
    const k=this.intensity;
    if(k<=0.01) return;
    ctx.save(); ctx.globalCompositeOperation='screen';
    for(const p of this.parts){
      const a=p.a*(0.20+k*0.75);
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      g.addColorStop(0,`rgba(52,170,118,${a})`);
      g.addColorStop(0.6,`rgba(28,86,62,${a*0.5})`);
      g.addColorStop(1,'rgba(14,44,32,0)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,TAU); ctx.fill();
    }
    ctx.restore();
  }
};
Fog.init();
