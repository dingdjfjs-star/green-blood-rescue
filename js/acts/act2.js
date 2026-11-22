/* ============ 第二幕 · 演员 ============ */
Engine.register({
  id:'act2', title:'第二幕 · 演员', mood:'mystery', fog:0.3, amb:0.4,
  ad:{
    h:'皇家认证记忆消除服务',
    en:'Royal-certified memory removal! Do you wake at night drenched in sweat, dreaming you are a worm crawling the seabed? Does the hum of the deep tunnels feel strangely familiar? Does your shadow sometimes fall half a beat behind your footsteps? Fear not! Her Majesty\'s loyal physicians will set you right: one small bleeding, one cup of warm herbal tea, and you will sleep like an infant. Memory is a burden; to lay it down is freedom. Whitehall, three floors below, behind the iron door. (Tip: do not bring a mirror.)',
    b:'您是否时常在深夜惊醒，冷汗淋漓，梦见自己变成了一条在海底匍匐的蠕虫？您是否对地铁隧道深处的嗡鸣声感到莫名的亲切？您是否觉得自己的影子有时比您的脚步慢了半拍？不必惊慌！女王陛下的忠诚医师们将为您排忧解难：一次小小的放血，一杯温热的草药茶，您将重获婴儿般的睡眠。记忆是重担，放下即是自由。地址：白厅地下三层，铁门后有人接待。',
    w:'（温馨提示：请勿携带镜子前往。）'
  },
  beats:[
    /* ---- 2-0 舞台上：英雄最难演 ---- */
    {
      fog:0.2, cam:[[0,640,430,1.16],[7,640,360,1]],
      subs:[
        '那时候我还在演戏，演一些无关紧要的角色——绅士、仆人、杀手，偶尔也演英雄。',
        '英雄是最难演的，因为英雄必须相信自己在做正确的事，而我已经很久没有相信过任何事了。'
      ],
      subsEn:[
        'Back then I still acted — gentlemen, servants, killers, and once in a while, a hero.',
        'Heroes are the hardest to play, for a hero must believe he is doing right — and it had been a long time since I believed anything at all.'
      ],
      draw(ctx,t){
        const S=Scenes.theaterStage(); S.draw(ctx,t);
        // 福尔摩斯在舞台中央
        const hs={x:640,y:520,pose:'stand',ph:0,flip:false,s:0.9};
        Rig.set('holmes',t,hs.x,hs.y,'stand',0,false,0.9,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{lampX:640,lampDir:0});
        Chars.holmes(ctx,hs,{rim:true,t:t});
      }
    },
    /* ---- 2-1 后台：两句题眼对撞 ---- */
    {
      fog:0.22,
      subs:[
        '我第一次见到他是在德鲁里巷的后台。',
        '您的影子慢了半拍。',
        '您的血是绿的。',
        '不是疑问，是陈述。不是恐惧，是确认。',
        '那是那天晚上我第一次看到有人笑——不是观众席上那种礼貌的、训练过的笑，而是真正的、从某个深不见底的地方涌上来的笑。'
      ],
      subsEn:[
        'The first time I saw him was backstage at the Drury Lane.',
        '"Your shadow is half a beat behind."',
        '"Your blood is green."',
        'Not a question — a statement. Not fear — confirmation.',
        'It was the first time that night I saw someone laugh — not the polite, trained laughter of the stalls, but real laughter, rising from somewhere very deep.'
      ],
      draw(ctx,t){
        const S=Scenes.theater(); S.draw(ctx,t);
        const hs={x:250,y:600,pose:'stand',ph:0,flip:false,s:0.96};
        Rig.set('holmes',t,hs.x,hs.y,'stand',0,false,0.96,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{lampX:225});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        const wx=t<2.5?lerp(80,430,ease(t/2.5)):430;
        const wp=t<2.5?'walk':'stand';
        const ws={x:wx,y:612,pose:wp,ph:t*7,flip:false,s:1};
        Rig.set('watson',t,wx,612,wp,t*7,false,1,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||ws,{lampX:225});
        Chars.watson(ctx,ws,{rim:true});
        if(Engine.subI>=1&&Engine.subI<=3){
          const k1=Engine.subI>=1?ease(Math.min(1,t/0.8)):0;
          const k2=Engine.subI>=2?ease(Math.min(1,(t-0.2)/0.8)):0;
          const fadeAll=Engine.subI>=3?clamp(1-(t)/0.9,0.25,1):1;
          ctx.save(); ctx.textAlign='center';
          if(k1>0){
            ctx.fillStyle=`rgba(190,235,205,${0.95*k1*fadeAll})`;
            ctx.font='44px Georgia,"Songti SC","SimSun",serif';
            ctx.letterSpacing='6px';
            ctx.fillText('「 您的影子慢了半拍。」',640,300-8*(1-k1));
          }
          if(k2>0){
            ctx.fillStyle=`rgba(140,255,190,${0.95*k2*fadeAll})`;
            ctx.font='52px Georgia,"Songti SC","SimSun",serif';
            ctx.letterSpacing='6px';
            ctx.fillText('「 您的血是绿的。」',640,392-8*(1-k2));
            glow(ctx,640,375,200,'rgba(70,220,150,$A)',0.10*k2);
          }
          ctx.letterSpacing='0px';
          ctx.restore();
        }
      }
    },
    /* ---- 2-2 酒馆：摊牌与闪回 ---- */
    {
      fog:0.26,
      subs:[
        '他喝酒的方式很特别：先闻，再抿一小口，让酒在舌尖停留三秒，然后咽下去。整个过程像在进行某种仪式。',
        '您的拐杖是陆军制式的，但握柄磨损的方式说明您用它支撑右腿。您的领口有碘酒的味道。您在那里见过一些东西，一些您无法忘记、也无法解释的东西。',
        '"它舔了我。"他终于说。',
        '在坎大哈的洞穴里。有一个东西，像湖，但不是湖。它从水里升起来，它的嘴像水蛭，但它的眼睛——它的眼睛像人。',
        '它没有杀我。它只是舔了我一下，然后……笑了。',
        '"茉莉花？"我说。',
        '"你也闻到了。"'
      ],
      subsEn:[
        'He drank in a peculiar way: he smelled it first, then took one small sip, let it rest on his tongue for three seconds, and swallowed. The whole thing like a ritual.',
        'Your cane is army-issue, but the wear on the grip says you lean on it with the right leg. There is iodine on your collar. You have seen things out there that you cannot forget, and cannot explain.',
        '"It licked me," he said at last.',
        'In a cave in Kandahar. Something like a lake, but not a lake. It rose out of the water; its mouth was like a leech\'s — but its eyes were human.',
        'It did not kill me. It only licked me once, and then… it smiled. If that is the word.',
        '"Jasmine?" I said.',
        '"You smelled it too."'
      ],
      draw(ctx,t){
        const flash=(Engine.subI>=3&&Engine.subI<=4);
        Fog.setIntensity(flash?0.05:0.26);
        if(!flash){
          const S=Scenes.tavern(); S.draw(ctx,t);
          const h1={x:560,y:600,pose:'sit',ph:0,flip:false,s:0.92};
          Rig.set('holmes',t,h1.x,h1.y,'sit',0,false,0.92,0.5);
          drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||h1,{lampX:640});
          Chars.holmes(ctx,h1,{rim:true,t:t});
          Props.chair(ctx,475,600,1);
          const w1={x:760,y:600,pose:'sit',ph:0,flip:true,s:0.88};
          Rig.set('watson',t,w1.x,w1.y,'sit',0,true,0.88,0.5);
          drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||w1,{lampX:640});
          Chars.watson(ctx,w1,{rim:true});
          Props.chair(ctx,845,600,1);
          ctx.fillStyle='rgba(150,230,180,0.25)'; ctx.fillRect(648,542,10,16);
          ctx.fillStyle='rgba(200,150,80,0.30)'; ctx.fillRect(668,542,10,16);
        }else{
          // 闪回：坎大哈洞穴（波纹+触手剪影+眼睛缓移）
          ctx.fillStyle='#010302'; ctx.fillRect(0,0,1280,720);
          const k=ease(Math.min(1,t/1.2));
          glow(ctx,640,340,420*k,'rgba(40,150,100,$A)',0.10*k);
          ctx.fillStyle='rgba(30,110,80,0.12)';
          ctx.fillRect(0,430,1280,290);
          // 水面涟漪
          ctx.lineWidth=1.5;
          for(let i=0;i<6;i++){
            const y=438+i*16;
            ctx.strokeStyle=`rgba(90,200,140,${0.05+0.04*Math.sin(t*2.2+i*1.3)})`;
            ctx.beginPath();
            for(let x=0;x<=1280;x+=48){
              const yy=y+Math.sin(x*0.018+t*1.6+i)*4;
              x?ctx.lineTo(x,yy):ctx.moveTo(x,yy);
            }
            ctx.stroke();
          }
          // 水下触手剪影：周期性升起又沉下
          const tk=Math.pow(Math.max(0,Math.sin(t*0.45)),3);
          if(tk>0.03){
            ctx.fillStyle='rgba(1,4,3,0.92)';
            for(let j=0;j<3;j++){
              ctx.save();
              ctx.translate(300+j*260+Math.sin(t*0.6+j*1.7)*50, 445);
              ctx.rotate((j-1)*0.28);
              ctx.beginPath();
              ctx.moveTo(-16*tk,0);
              ctx.quadraticCurveTo(10*tk,-150*tk*(0.75+j*0.18), 70*tk+j*22,-105*tk);
              ctx.quadraticCurveTo(30*tk,-45*tk, 18*tk,0);
              ctx.closePath(); ctx.fill();
              ctx.restore();
            }
          }
          // 一双人眼：缓缓眨动、轻微追踪
          const blink=0.5+0.5*Math.sin(t*1.4);
          Fx.eyes(ctx,640+Math.sin(t*0.4)*40,330,3.4,blink);
          ctx.fillStyle=`rgba(150,200,170,${0.5*k})`;
          ctx.font='italic 17px Georgia,"Songti SC","SimSun",serif';
          ctx.textAlign='center';
          ctx.fillText('—— 坎大哈 ——',640,560);
        }
      }
    },
    /* ---- 2-3 路灯下：影子拉长，握手 ---- */
    {
      fog:0.55,
      subs:[
        '那天晚上我们分手的时候，他站在路灯下，影子被拉得很长。',
        '"我需要一位医生。"我说。',
        '"我需要一位演员。"他说。',
        '"为什么？"',
        '"因为，"他松开手，"我想学会扮演一个忘记的人。"'
      ],
      subsEn:[
        'When we parted that night, he stood beneath the street lamp, and his shadow stretched long behind him.',
        '"I need a doctor," I said.',
        '"I need an actor," he said.',
        '"Why?"',
        '"Because," he said, letting go of my hand, "I want to learn to play a man who has forgotten."'
      ],
      draw(ctx,t){
        const S=Scenes.street({lampX:640}); S.draw(ctx,t);
        const h1={x:520,y:620,pose:'stand',ph:0,flip:false,s:0.95};
        const w1={x:760,y:620,pose:'stand',ph:0,flip:true,s:0.92};
        const shake=Engine.subI>=1&&Engine.subI<=3;
        humanoid(ctx,{...h1,x:h1.x-30,y:h1.y+6,pose:'stand',h:300,color:'rgba(2,6,4,0.9)',pipe:false});
        humanoid(ctx,{...w1,x:w1.x+30,y:w1.y+6,pose:'stand',h:290,color:'rgba(2,6,4,0.9)',cane:false});
        const hs2=shake?{...h1,pose:'handout'}:h1;
        const ws2=shake?{...w1,pose:'handout'}:w1;
        Chars.holmes(ctx,hs2,{rim:true,t:t});
        Chars.watson(ctx,ws2,{rim:true});
        if(shake){
          Fx.glint(ctx,640,520,0.4+0.2*Math.sin(t*3));
        }
      }
    }
  ]
});
