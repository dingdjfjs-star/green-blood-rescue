/* ============ scenes2.js：新增场景（双语+扩场景批次） ============ */

/* ---------- 伦敦报纸墙（第一幕开场） ---------- */
Scenes.posterWall = function(){
  if(!Scenes.posterWall._c){
    const rnd=seeded(63);
    Scenes.posterWall._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#05080a'); bg.addColorStop(1,'#030504');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      const bw=62,bh=26;
      for(let ry=0;ry*bh<720;ry++){
        for(let cx=-1;cx*bw<1280+bw;cx++){
          const off=(ry%2)*bw/2;
          const l=8+rnd()*7;
          c.fillStyle=`rgb(${l*0.7|0},${l+2|0},${l*0.8|0})`;
          c.fillRect(cx*bw+off+1,ry*bh+1,bw-2,bh-2);
        }
      }
      // 两张旧海报（虚化衬底）
      const poster=(x,y,w,h,rot)=>{
        c.save(); c.translate(x,y); c.rotate(rot);
        c.fillStyle='rgba(196,186,158,0.5)';
        c.fillRect(-w/2,-h/2,w,h);
        c.fillStyle='rgba(90,70,40,0.3)';
        for(let i=0;i<6;i++){ c.fillRect(-w/2+12,-h/2+18+i*((h-40)/6),w-24-rnd()*30,3); }
        c.restore();
      };
      poster(180,300,180,240,0.06);
      poster(1030,280,200,260,-0.05);
      // 中央：合租广告（可读）
      c.save(); c.translate(640,330); c.rotate(-0.03);
      c.fillStyle='rgba(221,212,180,0.95)'; c.fillRect(-190,-130,380,260);
      c.strokeStyle='rgba(100,80,50,0.5)'; c.strokeRect(-190,-130,380,260);
      c.fillStyle='#2a2318';
      c.font='bold 27px Georgia,"Songti SC","SimSun",serif';
      c.textAlign='center';
      c.fillText('瘸腿医生寻演员合租',0,-58);
      c.font='17px Georgia,"Songti SC","SimSun",serif';
      c.fillText('需擅长伪装与化学实验',0,-16);
      c.fillStyle='rgba(90,70,40,0.55)';
      c.fillRect(-150,10,300,3); c.fillRect(-150,26,260,3); c.fillRect(-150,42,290,3);
      c.restore();
      // 浆糊痕
      c.fillStyle='rgba(160,150,120,0.12)';
      c.beginPath(); c.ellipse(640,180,150,26,0,0,TAU); c.fill();
    });
  }
  return {
    pts:{floorY:640,centerX:640},
    draw(ctx,t){
      ctx.drawImage(Scenes.posterWall._c,0,0);
      const fl=0.8+0.12*Math.sin(t*7.7)+0.08*Math.sin(t*18);
      glow(ctx,640,300,320,'rgba(220,170,100,$A)',0.13*fl);
      // 中央海报下角随风翻动
      ctx.save();
      ctx.translate(830,460);
      ctx.rotate(0.12*Math.sin(t*2.6)+0.08);
      ctx.fillStyle='rgba(205,196,166,0.9)';
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-34,-8); ctx.lineTo(-30,16); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  };
};

/* ---------- 楼梯间（第一幕收尾） ---------- */
Scenes.stairwell = function(){
  if(!Scenes.stairwell._c){
    const rnd=seeded(87);
    Scenes.stairwell._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#040708'); bg.addColorStop(1,'#020404');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      const bw=96,bh=44;
      for(let ry=0;ry*bh<720;ry++){
        for(let cx=-1;cx*bw<1280+bw;cx++){
          const off=(ry%2)*bw/2;
          const l=7+rnd()*6;
          c.fillStyle=`rgb(${l*0.75|0},${l+2|0},${l*0.8|0})`;
          c.fillRect(cx*bw+off+2,ry*bh+2,bw-4,bh-4);
        }
      }
      // 向上盘旋的台阶
      for(let i=0;i<12;i++){
        const y=640-i*44, x=520-i*26, w=300-i*10;
        const a=0.85-i*0.062;
        c.fillStyle=`rgba(10,15,12,${a})`;
        c.beginPath(); c.ellipse(x,y,w,26-i*1.2,0,0,TAU); c.fill();
        c.fillStyle=`rgba(150,220,170,${Math.max(0,0.06-i*0.004)})`;
        c.beginPath(); c.ellipse(x,y-10,w*0.92,8,0,Math.PI,TAU); c.fill();
      }
      // 扶手弧线
      c.strokeStyle='rgba(20,28,24,0.9)'; c.lineWidth=7;
      c.beginPath();
      c.moveTo(180,660);
      c.quadraticCurveTo(430,430,700,240);
      c.quadraticCurveTo(790,180,830,110);
      c.stroke();
      // 顶部小窗
      c.fillStyle='rgba(90,190,130,0.10)'; c.fillRect(760,60,120,150);
      c.strokeStyle='#0b110e'; c.lineWidth=5; c.strokeRect(760,60,120,150);
    });
  }
  return {
    pts:{floorY:660,stairX:520},
    draw(ctx,t){
      ctx.drawImage(Scenes.stairwell._c,0,0);
      const fl=0.75+0.16*Math.sin(t*4.3)+0.09*Math.sin(t*13);
      glow(ctx,820,135,150,'rgba(100,210,140,$A)',0.20*fl);
      glow(ctx,820,135,360,'rgba(60,150,100,$A)',0.08*fl);
    }
  };
};

/* ---------- 剧院舞台正面（第二幕开场） ---------- */
Scenes.theaterStage = function(){
  if(!Scenes.theaterStage._c){
    const rnd=seeded(29);
    Scenes.theaterStage._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#050a08'); bg.addColorStop(1,'#020404');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 两侧绿幕
      for(const side of [0,1]){
        const x0=side?1050:0;
        for(let i=0;i<6;i++){
          const x=x0+(side?i*38:(5-i)*38);
          const g=c.createLinearGradient(x,0,x+38,0);
          g.addColorStop(0,'#0b1a12'); g.addColorStop(1,'#153022');
          c.fillStyle=g;
          c.fillRect(x,0,38,560+((i*37)%60));
        }
      }
      // 背景深幕
      c.fillStyle='#0a150f'; c.fillRect(220,0,840,480);
      for(let x=240;x<1050;x+=60){
        c.strokeStyle='rgba(0,0,0,0.5)'; c.lineWidth=3;
        c.beginPath(); c.moveTo(x,0); c.quadraticCurveTo(x+12,200,x,460); c.stroke();
      }
      // 舞台地板
      c.fillStyle='#0c120e'; c.fillRect(60,480,1160,120);
      c.strokeStyle='rgba(150,210,170,0.10)';
      for(let i=0;i<8;i++){
        const y=492+i*14;
        c.beginPath(); c.moveTo(60,y); c.lineTo(1220,y-6); c.stroke();
      }
      // 脚灯
      for(let i=0;i<12;i++){
        const x=140+i*88;
        c.fillStyle='#0a0f0c'; c.beginPath(); c.arc(x,600,9,Math.PI,TAU); c.fill();
      }
      // 观众席剪影
      c.fillStyle='#030503';
      for(let r=0;r<3;r++){
        const y=650+r*26, off=r*30;
        for(let i=0;i<17;i++){
          const x=60+off+i*70+rnd()*10;
          c.beginPath(); c.arc(x,y,20-r*2,0,TAU); c.fill();
        }
      }
    });
  }
  return {
    pts:{stageX:640,floorY:540},
    draw(ctx,t){
      ctx.drawImage(Scenes.theaterStage._c,0,0);
      const fl=0.82+0.12*Math.sin(t*9.1)+0.06*Math.sin(t*21);
      glow(ctx,640,470,420,'rgba(255,214,150,$A)',0.16*fl);
      // 体积光：脚灯向舞台打出的光扇 + 主光锥
      for(let i=0;i<12;i++){
        Fx.lightCone(ctx,140+i*88,596,7,468,34,'rgba(255,214,150,$A)',0.055*fl);
        glow(ctx,140+i*88,598,30,'rgba(255,214,150,$A)',0.75*fl);
      }
      Fx.lightCone(ctx,640,300,55,470,190,'rgba(255,220,160,$A)',0.10*fl);
      glow(ctx,640,540,600,'rgba(200,150,80,$A)',0.10*fl);
    }
  };
};

/* ---------- 伦敦夜景 / 泰晤士河（第四幕开场） ---------- */
Scenes.londonNight = function(){
  if(!Scenes.londonNight._c){
    const rnd=seeded(17);
    Scenes.londonNight._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#030608'); bg.addColorStop(0.62,'#060c0a'); bg.addColorStop(1,'#030605');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      // 月亮
      c.fillStyle='rgba(210,235,215,0.85)';
      c.beginPath(); c.arc(1050,120,44,0,TAU); c.fill();
      // 议会大厦剪影
      c.fillStyle='#060a08';
      c.fillRect(80,330,700,180);
      for(let i=0;i<9;i++){
        const x=120+i*72;
        c.beginPath();
        c.moveTo(x,330); c.lineTo(x+16,238-rnd()*30); c.lineTo(x+32,330);
        c.closePath(); c.fill();
      }
      // 大钟塔
      c.fillRect(830,180,86,330);
      c.beginPath(); c.moveTo(824,196); c.lineTo(873,110); c.lineTo(922,196); c.closePath(); c.fill();
      c.fillStyle='rgba(190,220,190,0.22)';
      c.beginPath(); c.arc(873,240,26,0,TAU); c.fill();
      c.strokeStyle='rgba(190,220,190,0.35)'; c.lineWidth=2;
      c.beginPath(); c.arc(873,240,26,0,TAU); c.stroke();
      // 桥
      c.fillStyle='#050807';
      c.fillRect(0,470,1280,16);
      for(let i=0;i<9;i++){
        const x=40+i*140;
        c.beginPath(); c.arc(x+60,486,34,Math.PI,TAU); c.fill();
      }
      // 河面
      c.fillStyle='#040806'; c.fillRect(0,486,1280,234);
      c.fillStyle='rgba(8,14,11,0.8)';
      c.fillRect(80,486,700,120);
      c.fillRect(830,486,86,180);
    });
  }
  return {
    pts:{bridgeY:486},
    draw(ctx,t){
      ctx.drawImage(Scenes.londonNight._c,0,0);
      const fl=0.8+0.14*Math.sin(t*3.7)+0.06*Math.sin(t*11);
      glow(ctx,1050,120,110,'rgba(190,235,205,$A)',0.28);
      glow(ctx,873,240,60,'rgba(200,235,200,$A)',0.18*fl);
      // 河面波光
      ctx.save(); ctx.globalCompositeOperation='screen';
      for(let i=0;i<10;i++){
        const y=500+i*22;
        const x=((t*22+i*160)%1600)-200;
        ctx.fillStyle=`rgba(110,200,150,${0.05+0.04*Math.sin(t*2+i)})`;
        ctx.fillRect(x,y,120-i*6,3);
      }
      ctx.restore();
      glow(ctx,1050,560,220,'rgba(170,220,180,$A)',0.10);
    }
  };
};

/* ---------- 贝克街 221B 门前（第六幕） ---------- */
Scenes.bakerStreet = function(){
  if(!Scenes.bakerStreet._c){
    const rnd=seeded(51);
    Scenes.bakerStreet._c=mk(1280,720,c=>{
      const bg=c.createLinearGradient(0,0,0,720);
      bg.addColorStop(0,'#04070a'); bg.addColorStop(1,'#020404');
      c.fillStyle=bg; c.fillRect(0,0,1280,720);
      const bw=74,bh=34;
      for(let ry=0;ry*bh<720;ry++){
        for(let cx=-1;cx*bw<1280+bw;cx++){
          const off=(ry%2)*bw/2;
          const l=8+rnd()*7;
          c.fillStyle=`rgb(${l*0.75|0},${l+2|0},${l*0.82|0})`;
          c.fillRect(cx*bw+off+1,ry*bh+1,bw-2,bh-2);
        }
      }
      // 两排窗
      for(let r=0;r<2;r++){
        const y=110+r*180;
        for(let i=0;i<8;i++){
          const x=90+i*160;
          c.fillStyle='#0a100d'; c.fillRect(x,y,64,100);
          c.strokeStyle='#131b15'; c.lineWidth=4; c.strokeRect(x,y,64,100);
          c.beginPath(); c.moveTo(x+32,y); c.lineTo(x+32,y+100); c.stroke();
          if(rnd()>0.55){ c.fillStyle=`rgba(150,220,160,${0.06+rnd()*0.08})`;
            c.fillRect(x+4,y+4,26,42); c.fillStyle='#0a100d'; }
        }
      }
      // 中央黑门
      c.fillStyle='#0a0f0c';
      c.beginPath();
      c.moveTo(560,640); c.lineTo(560,380);
      c.arc(640,380,80,Math.PI,0);
      c.lineTo(720,640); c.closePath(); c.fill();
      c.strokeStyle='rgba(150,255,200,0.14)'; c.lineWidth=3;
      c.stroke();
      // 门牌 221B
      c.fillStyle='#2a342c'; c.fillRect(600,470,84,40);
      c.strokeStyle='rgba(200,220,190,0.35)'; c.lineWidth=2;
      c.strokeRect(600,470,84,40);
      c.fillStyle='rgba(220,230,200,0.85)';
      c.font='bold 26px Georgia,serif';
      c.textAlign='center';
      c.fillText('221B',642,499);
      // 门环
      c.strokeStyle='#2a342c'; c.lineWidth=5;
      c.beginPath(); c.arc(640,550,14,0,TAU); c.stroke();
      // 台阶
      c.fillStyle='#090d0a';
      c.fillRect(540,640,200,16); c.fillRect(560,656,160,16); c.fillRect(580,672,120,16);
    });
  }
  return {
    pts:{doorX:640,floorY:690},
    draw(ctx,t){
      ctx.drawImage(Scenes.bakerStreet._c,0,0);
      const fl=0.8+0.12*Math.sin(t*6.9)+0.08*Math.sin(t*17);
      glow(ctx,420,340,16,'rgba(255,214,150,$A)',0.9*fl);
      glow(ctx,420,340,260,'rgba(210,160,90,$A)',0.24*fl);
      Fx.lightCone(ctx,420,352,11,646,58,'rgba(255,214,150,$A)',0.09*fl);
      glow(ctx,642,490,60,'rgba(210,230,200,$A)',0.10+0.05*Math.sin(t*1.3));
    }
  };
};
