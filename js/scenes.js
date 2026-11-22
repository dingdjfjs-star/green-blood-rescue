/* ============ scenes.js：场景（静态层预渲染 + 动态灯光/雾尘） ============ */
const Scenes = {};

/* ---------- 地下室（第一/三/五/六幕主场景） ----------
   位置锚点：Scenes.basement.pts = {lampX,lampY,tableY,tableX1,tableX2,domeX,doorX,shelfX,floorY} */
Scenes.basement = function(opts){
  opts=opts||{};
  const key='basement'+(opts.lampHue||'green');
  if(!Scenes.basement._c) Scenes.basement._c={};
  const cache=Scenes.basement._c;
  const rnd=seeded(114);
  const P={lampX:640,lampY:238,tableX1:150,tableX2:540,tableTop:486,domeX:300,burnerX:478,
    doorX:100,floorY:560,shelfX:1000,chairX:830};
  if(!cache[key]){
    cache[key]=mk(1280,720,c=>{
      // 背景渐变
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#04070a'); bg.addColorStop(0.55,'#071009'); bg.addColorStop(1,'#030604');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 砖墙
      const bw=66,bh=27;
      for(let ry=0;ry*bh<520;ry++){
        for(let cx=-1;cx*bw<1280+bw;cx++){
          const off=(ry%2)*bw/2;
          const l=10+rnd()*9;
          c.fillStyle=`rgb(${l*0.7|0},${l+3|0},${l*0.8+2|0})`;
          c.fillRect(cx*bw+off+1,ry*bh+1,bw-2,bh-2);
        }
      }
      // 木梁
      c.fillStyle='#0a0d0b';
      c.fillRect(0,128,1280,20); c.fillRect(0,318,1280,14);
      c.fillRect(210,0,18,318); c.fillRect(1060,0,18,318);
      // 地板
      const fl=c.createLinearGradient(0,520,0,720);
      fl.addColorStop(0,'#0c1410'); fl.addColorStop(0.5,'#0a100c'); fl.addColorStop(1,'#050806');
      c.fillStyle=fl; c.fillRect(0,520,1280,200);
      c.strokeStyle='rgba(0,0,0,0.5)'; c.lineWidth=2;
      for(let i=0;i<9;i++){ const y=530+i*22; c.beginPath(); c.moveTo(0,y); c.lineTo(1280,y-4); c.stroke(); }
      for(let i=0;i<7;i++){ const x=120+i*190+rnd()*30;
        c.beginPath(); c.moveTo(x,520); c.lineTo(x-40,720); c.stroke(); }
      // 灯的光池（静态部分）
      let g=c.createRadialGradient(P.lampX,430,40,P.lampX,500,560);
      g.addColorStop(0,'rgba(120,220,160,0.10)'); g.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=g; c.fillRect(0,0,1280,720);
      // 工作台
      c.fillStyle='#0d1210';
      c.fillRect(P.tableX1,P.tableTop,P.tableX2-P.tableX1,16);
      c.fillStyle='rgba(150,255,190,0.10)';               // 台面顶缘受光
      c.fillRect(P.tableX1,P.tableTop,P.tableX2-P.tableX1,3);
      c.fillStyle='#0a0e0c';
      c.fillRect(P.tableX1+14,P.tableTop+16,18,120); c.fillRect(P.tableX2-32,P.tableTop+16,18,120);
      c.fillStyle='#0c110e';
      c.fillRect(P.tableX1+8,P.tableTop+130,P.tableX2-P.tableX1-16,10);
      // 架子与瓶
      c.fillStyle='#0c110f'; c.fillRect(900,330,220,10); c.fillRect(908,418,204,10);
      const bottles=[[930,330],[975,330],[1030,330],[1085,330],[1130,330],[955,418],[1020,418],[1090,418]];
      for(const [bx,by] of bottles){
        const bh2=22+rnd()*26, bw2=8+rnd()*6;
        c.fillStyle='#080c0a';
        c.fillRect(bx-bw2/2,by-bh2,bw2,bh2);
        c.fillRect(bx-3,by-bh2-7,6,7);
        if(rnd()>0.45){ c.fillStyle=`rgba(90,230,160,${0.16+rnd()*0.14})`;
          c.fillRect(bx-bw2/2+1,by-bh2*0.45,bw2-2,bh2*0.45); }
      }
      // 悬挂煤气灯（绿色玻璃灯罩）
      c.strokeStyle='#0a0d0b'; c.lineWidth=3;
      c.beginPath(); c.moveTo(640,148); c.lineTo(640,206); c.stroke();
      c.fillStyle='#0e1a14';
      c.beginPath();
      c.moveTo(628,206); c.lineTo(652,206);
      c.lineTo(676,242); c.lineTo(604,242);
      c.closePath(); c.fill();
      c.strokeStyle='rgba(150,255,200,0.28)'; c.lineWidth=1.5;
      c.beginPath();
      c.moveTo(628,206); c.lineTo(652,206); c.lineTo(676,242); c.lineTo(604,242); c.closePath();
      c.stroke();
      c.fillStyle='#101713'; c.fillRect(634,242,12,10); // 灯头
      // 门（左）
      c.fillStyle='#090d0a'; c.fillRect(46,300,110,220);
      c.strokeStyle='#141b16'; c.lineWidth=4; c.strokeRect(46,300,110,220);
      c.beginPath(); c.moveTo(101,300); c.lineTo(101,520); c.stroke();
      c.fillStyle='#3a463c'; c.beginPath(); c.arc(140,415,5,0,TAU); c.fill();
      c.fillStyle='#0a0e0b'; c.fillRect(30,292,140,10); // 门楣
      // 墙面裂缝
      c.strokeStyle='rgba(140,190,160,0.10)'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(700,80); c.lineTo(716,140); c.lineTo(706,196); c.stroke();
      c.beginPath(); c.moveTo(860,150); c.lineTo(846,210); c.lineTo(858,268); c.lineTo(850,318); c.stroke();
      // 凳子
      c.fillStyle='#0b100d'; c.fillRect(P.chairX-24,510,48,10);
      c.fillRect(P.chairX-18,520,8,40); c.fillRect(P.chairX+10,520,8,40);
      // 酒精灯
      c.fillStyle='#0a0f0c'; c.fillRect(P.burnerX-12,P.tableTop-14,24,14);
      c.fillRect(P.burnerX-5,P.tableTop-26,10,12);
    });
  }
  // 尘埃粒子（动态）
  if(!cache._dust){
    const dr=seeded(88); cache._dust=[];
    for(let i=0;i<30;i++) cache._dust.push({x:380+dr()*520,y:240+dr()*280,s:0.8+dr()*1.6,ph:dr()*TAU});
  }
  const dust=cache._dust;
  const hue=opts.lampHue||'green';
  return {
    pts:P,
    draw(ctx,t){
      ctx.drawImage(cache[key],0,0);
      // 煤气灯闪烁
      const flick=0.82+0.10*Math.sin(t*9.3)+0.05*Math.sin(t*23.7)+0.03*Math.sin(t*41);
      const core = hue==='amber'?'rgba(255,214,150,$A)':'rgba(150,255,190,$A)';
      const halo = hue==='amber'?'rgba(200,150,80,$A)':'rgba(60,190,120,$A)';
      glow(ctx,P.lampX,P.lampY+8,14,core,0.95*flick);
      glow(ctx,P.lampX,P.lampY+8,300,halo,0.30*flick);
      glow(ctx,P.lampX,520,430,halo,0.14*flick);
      // 体积光锥：绿灯罩洒向桌面
      Fx.lightCone(ctx,P.lampX,P.lampY+14,26,556,175,'rgba(130,255,185,$A)',0.09*flick);
      // 尘埃
      ctx.fillStyle='rgba(190,255,215,0.35)';
      for(const d of dust){
        const yy=d.y+Math.sin(t*0.4+d.ph)*14, xx=d.x+Math.sin(t*0.23+d.ph*2)*10;
        ctx.globalAlpha=0.12+0.12*Math.sin(t*1.7+d.ph);
        ctx.beginPath(); ctx.arc(xx,yy,d.s,0,TAU); ctx.fill();
      }
      ctx.globalAlpha=1;
    }
  };
};

/* ---------- 剧院后台（第二幕 2-1） ---------- */
Scenes.theater = function(){
  if(!Scenes.theater._c){
    const rnd=seeded(31);
    Scenes.theater._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#060a09'); bg.addColorStop(1,'#020504');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 绿丝绒大幕（垂直波浪褶皱）
      for(let x=0;x<1280;x+=46){
        const wav=Math.sin(x*0.045)*10;
        const g=c.createLinearGradient(x,0,x+46,0);
        g.addColorStop(0,'#0b1a12'); g.addColorStop(0.5,'#12291c'); g.addColorStop(1,'#0a1710');
        c.fillStyle=g;
        c.beginPath();
        c.moveTo(x,0); c.quadraticCurveTo(x+23+wav,180,x,360);
        c.lineTo(x,720);
        for(let yy=720;yy>360;yy-=24) c.lineTo(x+18*Math.sin(yy*0.05+x),yy);
        c.closePath(); c.fill();
      }
      // 幕布下缘流苏阴影
      c.fillStyle='rgba(0,0,0,0.5)'; c.fillRect(0,430,1280,26);
      // 舞台地板
      c.fillStyle='#0a0f0c'; c.fillRect(0,456,1280,264);
      c.strokeStyle='rgba(140,200,160,0.06)'; c.lineWidth=1.5;
      for(let i=0;i<10;i++){ const y=470+i*26; c.beginPath(); c.moveTo(0,y); c.lineTo(1280,y-8); c.stroke(); }
      // 化妆镜（左）与灯泡弧
      c.fillStyle='#0b0f0d'; c.fillRect(150,180,150,190);
      c.strokeStyle='rgba(255,230,170,0.25)'; c.lineWidth=3; c.strokeRect(150,180,150,190);
      for(let i=0;i<7;i++){
        const a=Math.PI*(0.15+0.7*i/6);
        const bx=225+Math.cos(a)*95, by=270-Math.sin(a)*88;
        c.fillStyle='rgba(255,220,150,0.85)'; c.beginPath(); c.arc(bx,by,5,0,TAU); c.fill();
      }
      c.fillStyle='rgba(120,170,140,0.10)'; c.fillRect(170,200,110,150); // 镜面
      // 服装架（右）
      c.strokeStyle='#0d1210'; c.lineWidth=6;
      c.beginPath(); c.moveTo(1010,260); c.lineTo(1010,456); c.stroke();
      c.beginPath(); c.moveTo(960,268); c.lineTo(1160,268); c.stroke();
      const clothes=[[985,0.9],[1030,1.05],[1075,0.85],[1120,1.0]];
      for(const [cx,ch] of clothes){
        c.fillStyle='#0c110e';
        c.beginPath();
        c.moveTo(cx-24*ch,456); c.quadraticCurveTo(cx-20*ch,320,cx,300);
        c.quadraticCurveTo(cx+20*ch,320,cx+24*ch,456);
        c.closePath(); c.fill();
      }
      // 悬挂的绳与沙袋
      c.strokeStyle='#0a0d0b'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(430,0); c.lineTo(430,120); c.stroke();
      c.fillStyle='#0b0f0c'; c.beginPath(); c.ellipse(430,132,20,14,0.3,0,TAU); c.fill();
      // 道具箱
      c.fillStyle='#0b100d'; c.fillRect(700,400,120,56);
      c.fillStyle='rgba(150,255,190,0.06)'; c.fillRect(700,400,120,5);
    });
  }
  return {
    pts:{floorY:600,mirrorX:225,rackX:1060,centerX:640},
    draw(ctx,t){
      ctx.drawImage(Scenes.theater._c,0,0);
      // 化妆镜灯泡闪烁暖光
      const fl=0.8+0.14*Math.sin(t*7.1)+0.06*Math.sin(t*19);
      glow(ctx,225,270,150,'rgba(255,214,150,$A)',0.22*fl);
      glow(ctx,225,270,340,'rgba(200,150,80,$A)',0.10*fl);
    }
  };
};

/* ---------- 酒馆（第二幕 2-2） ---------- */
Scenes.tavern = function(){
  if(!Scenes.tavern._c){
    const rnd=seeded(57);
    Scenes.tavern._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#070908'); bg.addColorStop(1,'#030504');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 木墙板
      for(let y=0;y<460;y+=34){
        c.fillStyle=`rgba(20,28,22,${0.5+rnd()*0.3})`;
        c.fillRect(0,y,1280,32);
        c.fillStyle='rgba(0,0,0,0.5)'; c.fillRect(0,y+32,1280,2);
      }
      // 酒吧背架与瓶（中左，背光）
      c.fillStyle='#0a0e0b'; c.fillRect(160,120,360,300);
      c.fillStyle='rgba(120,190,140,0.07)'; c.fillRect(160,120,360,300);
      for(let r=0;r<3;r++){
        c.fillStyle='#0c110e'; c.fillRect(170,180+r*80,340,8);
        for(let i=0;i<8;i++){
          const bx=190+i*42+rnd()*8, bh=26+rnd()*22;
          c.fillStyle='#080c09';
          c.fillRect(bx,176+r*80-bh,9,bh);
          if(rnd()>0.4){ c.fillStyle=`rgba(140,230,170,${0.10+rnd()*0.15})`;
            c.fillRect(bx+1,176+r*80-bh*0.5,7,bh*0.5); }
        }
      }
      // 吧台
      c.fillStyle='#0c110e'; c.fillRect(140,420,400,26);
      c.fillStyle='#0a0e0b'; c.fillRect(150,446,380,154);
      // 圆桌两（右）
      const tables=[[820,520],[1080,470]];
      for(const [tx,ty] of tables){
        c.fillStyle='#0b100d';
        c.beginPath(); c.ellipse(tx,ty,80,18,0,0,TAU); c.fill();
        c.fillRect(tx-8,ty,14,100);
        c.beginPath(); c.ellipse(tx,ty+100,34,8,0,0,TAU); c.fill();
      }
      // 地板
      c.fillStyle='#090d0a'; c.fillRect(0,560,1280,160);
      c.strokeStyle='rgba(0,0,0,0.45)'; c.lineWidth=2;
      for(let i=0;i<7;i++){ const y=572+i*26; c.beginPath(); c.moveTo(0,y); c.lineTo(1280,y-6); c.stroke(); }
      // 窗（右上，外面绿雾光）
      c.fillStyle='#0d1418'; c.fillRect(1020,120,200,150);
      c.strokeStyle='#141b16'; c.lineWidth=6; c.strokeRect(1020,120,200,150);
      c.beginPath(); c.moveTo(1120,120); c.lineTo(1120,270); c.moveTo(1020,195); c.lineTo(1220,195); c.stroke();
    });
  }
  return {
    pts:{floorY:620,barX:340,tableX:820,table2X:1080},
    draw(ctx,t){
      ctx.drawImage(Scenes.tavern._c,0,0);
      const fl=0.8+0.12*Math.sin(t*6.7)+0.08*Math.sin(t*15.3);
      // 酒架背光
      glow(ctx,340,270,260,'rgba(120,210,140,$A)',0.14*fl);
      // 窗外雾光
      glow(ctx,1120,195,160,'rgba(90,200,140,$A)',0.20*(0.8+0.2*Math.sin(t*0.7)));
      // 两盏吊灯（琥珀）
      glow(ctx,640,90,10,'rgba(255,214,150,$A)',0.9*fl);
      glow(ctx,640,90,180,'rgba(200,150,80,$A)',0.20*fl);
      glow(ctx,640,240,320,'rgba(180,130,70,$A)',0.10*fl);
      Fx.lightCone(ctx,640,102,20,414,105,'rgba(255,214,150,$A)',0.06*fl);
      // 桌上烛光
      glow(ctx,820,505,8,'rgba(255,214,150,$A)',0.8*fl);
      glow(ctx,820,505,110,'rgba(200,150,80,$A)',0.16*fl);
    }
  };
};

/* ---------- 卧室（第三幕 3-2 死者） ---------- */
Scenes.bedroom = function(){
  if(!Scenes.bedroom._c){
    const rnd=seeded(73);
    Scenes.bedroom._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#05080a'); bg.addColorStop(1,'#020404');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 墙纸（暗纹印章）
      for(let y=40;y<520;y+=90) for(let x=40;x<1280;x+=110){
        const jx=x+rnd()*20, jy=y+rnd()*16;
        c.strokeStyle='rgba(90,140,110,0.07)'; c.lineWidth=1.5;
        c.beginPath(); c.arc(jx,jy,14,0,TAU); c.stroke();
        c.beginPath(); c.arc(jx,jy,6,0,TAU); c.stroke();
      }
      // 窗与绿月光（右上，克制）
      c.fillStyle='rgba(90,190,130,0.07)'; c.fillRect(1010,130,170,210);
      c.strokeStyle='#0c1210'; c.lineWidth=6;
      c.strokeRect(1010,130,170,210);
      c.beginPath(); c.moveTo(1095,130); c.lineTo(1095,340); c.moveTo(1010,235); c.lineTo(1180,235); c.stroke();
      c.fillStyle='#0a0f0c'; c.fillRect(1000,122,190,9); c.fillRect(1000,340,190,11);
      // 地板
      c.fillStyle='#0a0e0b'; c.fillRect(0,520,1280,200);
      c.strokeStyle='rgba(0,0,0,0.5)';
      for(let i=0;i<8;i++){ const y=534+i*24; c.beginPath(); c.moveTo(0,y); c.lineTo(1280,y-5); c.stroke(); }
      // 床（中央偏左，比例正常）
      c.fillStyle='#0b100d';
      c.fillRect(340,380,16,150);            // 床头柱
      c.fillRect(340,372,120,12);            // 床头板顶
      c.fillRect(340,384,112,16);            // 床头板
      c.fillStyle='#0d1310'; c.fillRect(360,470,560,26);   // 床垫
      c.fillStyle='#101813'; c.fillRect(372,456,110,16);   // 枕头
      c.fillStyle='#0b100d'; c.fillRect(900,480,14,90);    // 床尾
      // 床头柜与蜡烛
      c.fillStyle='#0b100d'; c.fillRect(280,440,70,56);
      c.fillStyle='#e8e2c8'; c.fillRect(308,420,10,20);    // 蜡烛
    });
  }
  return {
    pts:{bedTop:470,bedX:360,bedEndX:900,floorY:640,corpseHead:[710,448]},
    draw(ctx,t){
      ctx.drawImage(Scenes.bedroom._c,0,0);
      const fl=0.75+0.18*Math.sin(t*5.3)+0.07*Math.sin(t*17);
      // 蜡烛
      Fx.flame(ctx,313,416,7,t*0.9,'amber');
      glow(ctx,313,414,110,'rgba(255,200,130,$A)',0.20*fl);
      Fx.lightCone(ctx,313,422,5,520,28,'rgba(255,200,130,$A)',0.12*fl);
      // 窗光
      glow(ctx,1095,235,170,'rgba(90,200,130,$A)',0.13);
    }
  };
};

/* ---------- 王子房间（第四幕） ---------- */
Scenes.princeRoom = function(){
  if(!Scenes.princeRoom._c){
    const rnd=seeded(41);
    Scenes.princeRoom._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#080a0c'); bg.addColorStop(1,'#030505');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 华贵墙纸：菱格+暗金
      c.strokeStyle='rgba(120,150,120,0.09)'; c.lineWidth=1;
      for(let x=-40;x<1320;x+=52){ c.beginPath(); c.moveTo(x,0); c.lineTo(x+260,720); c.stroke();
        c.beginPath(); c.moveTo(x+260,0); c.lineTo(x,720); c.stroke(); }
      for(let y=30;y<500;y+=110) for(let x=60;x<1280;x+=130){
        c.strokeStyle='rgba(170,150,90,0.10)';
        c.beginPath(); c.arc(x+rnd()*10,y+rnd()*8,17,0,TAU); c.stroke();
      }
      // 护墙板
      c.fillStyle='#0b0f0d'; c.fillRect(0,440,1280,80);
      c.fillStyle='rgba(170,150,90,0.07)'; c.fillRect(0,442,1280,3);
      // 地板
      c.fillStyle='#0a0d0b'; c.fillRect(0,520,1280,200);
      c.strokeStyle='rgba(0,0,0,0.45)';
      for(let i=0;i<8;i++){ const y=534+i*24; c.beginPath(); c.moveTo(0,y); c.lineTo(1280,y-5); c.stroke(); }
      // 大地毯（王子之血落处）
      c.fillStyle='rgba(60,26,26,0.30)';
      c.beginPath(); c.ellipse(640,600,360,64,0,0,TAU); c.fill();
      c.strokeStyle='rgba(170,150,90,0.10)'; c.lineWidth=3;
      c.beginPath(); c.ellipse(640,600,360,64,0,0,TAU); c.stroke();
      // 三叉烛台（左）
      c.fillStyle='#0c110e'; c.fillRect(196,340,8,180);
      c.fillRect(160,380,80,8);
      for(const cx of [170,200,230]){
        c.fillStyle='#e8e2c8'; c.fillRect(cx-4,352,8,24);
      }
      // 扶手椅（右）
      c.fillStyle='#0c110e';
      c.beginPath(); c.ellipse(1020,430,90,26,0,Math.PI,TAU); c.fill();
      c.fillRect(930,430,180,60);
      c.fillRect(924,340,20,150); c.fillRect(1096,340,20,150);
      // 深色窗帘（右上）
      c.fillStyle='#0a1210';
      c.fillRect(880,0,70,330); c.fillRect(1230,0,50,330);
      c.fillRect(950,0,290,26);
    });
  }
  return {
    pts:{floorY:640,carpetCX:640,chairX:1020},
    draw(ctx,t){
      ctx.drawImage(Scenes.princeRoom._c,0,0);
      const fl=0.78+0.15*Math.sin(t*6.1)+0.07*Math.sin(t*16);
      for(const cx of [170,200,230]) Fx.flame(ctx,cx,348,6,t*0.8+cx,'amber');
      glow(ctx,200,350,190,'rgba(255,205,140,$A)',0.24*fl);
      glow(ctx,200,350,380,'rgba(190,140,80,$A)',0.10*fl);
      Fx.lightCone(ctx,200,352,38,520,64,'rgba(255,205,140,$A)',0.09*fl);
    }
  };
};

/* ---------- 街道（第二幕 2-3 / 第四幕 4-4） ---------- */
Scenes.street = function(opts){
  opts=opts||{};
  const key='street'+(opts.lampX||400);
  if(!Scenes.street._c) Scenes.street._c={};
  if(!Scenes.street._c[key]){
    const rnd=seeded(19+(opts.lampX||400));
    Scenes.street._c[key]=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#04070a'); bg.addColorStop(0.7,'#060a08'); bg.addColorStop(1,'#030504');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 联排房屋剪影（两层）
      c.fillStyle='#070b09';
      for(let x=-20;x<1300;){
        const w=140+rnd()*120, h=300+rnd()*130;
        c.fillRect(x,470-h,w,h+40);
        // 烟囱
        if(rnd()>0.5) c.fillRect(x+w*0.7,470-h-34,18,36);
        // 窗（微光）
        for(let wx=x+16;wx<x+w-24;wx+=44){
          if(rnd()>0.62){ c.fillStyle=`rgba(150,220,160,${0.05+rnd()*0.08})`;
            c.fillRect(wx,470-h+30+rnd()*60,16,22); c.fillStyle='#070b09'; }
        }
        x+=w;
      }
      // 石板路
      c.fillStyle='#090d0a'; c.fillRect(0,470,1280,250);
      c.strokeStyle='rgba(0,0,0,0.4)';
      for(let i=0;i<9;i++){ const y=482+i*26; c.beginPath(); c.moveTo(0,y); c.lineTo(1280,y-6); c.stroke(); }
      for(let i=0;i<14;i++){ const x=40+i*95+rnd()*30;
        c.beginPath(); c.moveTo(x,470); c.lineTo(x-30,720); c.stroke(); }
      // 路灯（指定位置）
      const lx=opts.lampX||400;
      c.fillStyle='#0b100d';
      c.fillRect(lx-5,320,10,160);
      c.fillRect(lx-14,478,28,10);
      c.beginPath(); c.moveTo(lx-16,320); c.quadraticCurveTo(lx,286,lx+16,320);
      c.lineTo(lx+9,320); c.quadraticCurveTo(lx,300,lx-9,320); c.closePath(); c.fill();
    });
  }
  const lx=opts.lampX||400;
  return {
    pts:{lampX:lx,floorY:640},
    draw(ctx,t){
      ctx.drawImage(Scenes.street._c[key],0,0);
      const fl=0.8+0.12*Math.sin(t*8.7)+0.08*Math.sin(t*21);
      Fx.flame(ctx,lx,322,8,t,'amber');
      glow(ctx,lx,320,16,'rgba(255,214,150,$A)',0.9*fl);
      glow(ctx,lx,330,240,'rgba(220,160,90,$A)',0.30*fl);
      glow(ctx,lx,500,430,'rgba(180,130,80,$A)',0.14*fl);
      Fx.lightCone(ctx,lx,326,10,556,54,'rgba(230,180,110,$A)',0.11*fl);
    }
  };
};

/* ---------- 门墙（第六幕敲门） ---------- */
Scenes.doorWall = function(){
  if(!Scenes.doorWall._c){
    const rnd=seeded(97);
    Scenes.doorWall._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#05080a'); bg.addColorStop(1,'#020404');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 石墙（大块石）
      const bw=120,bh=58;
      for(let ry=0;ry*bh<520;ry++){
        for(let cx=-1;cx*bw<1280+bw;cx++){
          const off=(ry%2)*bw/2;
          const l=9+rnd()*8;
          c.fillStyle=`rgb(${l*0.7|0},${l+2|0},${l*0.85|0})`;
          c.fillRect(cx*bw+off+2,ry*bh+2,bw-4,bh-4);
        }
      }
      // 门框（拱）
      c.fillStyle='#0a0f0c';
      c.beginPath();
      c.moveTo(500,520); c.lineTo(500,240);
      c.arc(640,240,140,Math.PI,0);
      c.lineTo(780,520); c.closePath(); c.fill();
      // 厚重木门（可开合：静态画关着的）
      c.fillStyle='#0c110e';
      c.fillRect(516,250,248,270);
      c.strokeStyle='rgba(150,255,200,0.12)'; c.lineWidth=2;
      c.strokeRect(516,250,248,270);
      c.beginPath(); c.moveTo(640,250); c.lineTo(640,520); c.stroke();
      c.strokeRect(536,280,88,90); c.strokeRect(656,280,88,90);
      c.strokeRect(536,390,88,110); c.strokeRect(656,390,88,110);
      // 门把手
      c.fillStyle='#2a3a30'; c.beginPath(); c.arc(700,400,7,0,TAU); c.fill();
      // 壁灯（左）
      c.fillStyle='#0b100d'; c.fillRect(330,300,10,44);
      // 地板
      c.fillStyle='#0a0e0b'; c.fillRect(0,520,1280,200);
      c.strokeStyle='rgba(0,0,0,0.45)';
      for(let i=0;i<8;i++){ const y=534+i*24; c.beginPath(); c.moveTo(0,y); c.lineTo(1280,y-5); c.stroke(); }
    });
  }
  return {
    pts:{doorX:640,doorBottom:520,floorY:640},
    draw(ctx,t){
      ctx.drawImage(Scenes.doorWall._c,0,0);
      const fl=0.8+0.13*Math.sin(t*7.7)+0.07*Math.sin(t*18);
      Fx.flame(ctx,335,296,7,t*0.85,'green');
      glow(ctx,335,296,130,'rgba(120,230,160,$A)',0.22*fl);
    }
  };
};

