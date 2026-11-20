/* ============ 第五幕 · 地下室的灯（全片最长） ============ */
Engine.register({
  id:'act5', title:'第五幕 · 地下室的灯', mood:'dread', fog:0.32, amb:0.5,
  ad:{
    h:'招租：地下室一间',
    en:'To let: one basement room, St Giles\'s. Well ventilated (cracks in the wall; the wind comes off the Thames), unique lighting (one gas lamp with a green shade, said to be kind to the eyes). Suitable for singles, couples, or anyone who does not need the sun. Landlord: a retired actor, eccentric but kind (he recites lines at night — on how to fade the world). Rent: one pound a month plus a secret. Call after midnight; knock four times. If no answer, slide your secret under the door. (Warning: if your shadow enters the room ahead of you, do not follow.)',
    b:'位于圣贾尔斯区，通风良好（墙上有裂缝，风从泰晤士河来），采光独特（一盏煤气灯，灯罩是绿色的，据说是为了护眼）。适合：单身人士、情侣、或任何不需要阳光的人。房东是一位退役演员，性格古怪但心地善良（他会在夜里背诵台词，内容是关于如何让世界褪色的）。租金：每月一英镑，外加一个秘密。有意者请在午夜后敲门，敲四下。若无人应答，请将秘密写在纸上，从门缝塞入。',
    w:'（警告：若您的影子先您一步进入房间，请勿跟随。）'
  },
  beats:[
    /* ---- 5-1 灯变绿 ---- */
    {
      drip:true, fog:0.3,
      subs:[
        '地下室的灯变了颜色。不是一夜之间变的，是慢慢的，像某种疾病。后来是灯光本身变成了绿色，一种淡淡的、几乎美丽的绿色，像深水下的阳光。',
        '"您的瞳孔收缩速度快了半拍。"我知道他在说我的影子，那半拍的延迟正在缩小。',
        '"您不敢用。" "我不知道褪色之后的人类还是不是人类。" "那您为什么制造它？" "因为，如果有人必须褪色，我宁愿是我。"',
        '"那就让我试。" "不行。" "为什么？" "因为，我需要一位医生。如果药剂失败了，我需要有人记住我作为人类的样子。"'
      ],
      subsEn:[
        'The lamp in the basement changed colour. Not overnight — slowly, like a disease. In time the light itself turned green, a pale, almost beautiful green, like sunlight under deep water.',
        '"Your pupils contract half a beat too fast." I knew he was speaking of my shadow — that the lag was closing.',
        '"You dare not use it." "I don\'t know whether a man is still a man after he fades." "Then why make it?" "Because if someone must fade, I would rather it were me."',
        '"Then let me try." "No." "Why not?" "Because I need a doctor. If the potion fails, I need someone to remember what I looked like as a human."'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        if(t<6){
          const k=0.30*(1-ease(clamp(t/6,0,1)));
          ctx.fillStyle=`rgba(255,178,88,${k})`;
          ctx.fillRect(0,0,1280,720);
        }
        Props.vial(ctx,392,486,1.1,true);
        const hs={x:520,y:614,pose:'stand',ph:0,flip:true,s:1};
        Rig.set('holmes',t,hs.x,hs.y,'stand',0,true,1,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        const ws={x:700,y:614,pose:'sit',ph:0,flip:true,s:0.92};
        Rig.set('watson',t,ws.x,ws.y,'sit',0,true,0.92,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||ws,{});
        Chars.watson(ctx,ws,{rim:true});
        Props.chair(ctx,790,614,0.9);
        Props.bed(ctx,950,640,280,84);
      }
    },
    /* ---- 5-2 实验特写：褪色的老鼠 ---- */
    {
      drip:true, fog:0.18, amb:0.55,
      subs:[
        '"药剂完成了。" "您试过了？" "在老鼠身上。"',
        '"结果呢？" "它们褪色了。绿色从它们的血管里流出来，像墨水从纸上被洗掉。然后它们死了。但死的时候，它们的影子站在床边，看着它们。"'
      ],
      subsEn:[
        '"The potion is finished." "You have tested it?" "On rats."',
        '"And?" "They faded. The green drained from their veins like ink washed from paper. Then they died — and when they died, their shadows stood at the bedside, watching them."'
      ],
      draw(ctx,t,dt){
        // 大特写：烧瓶、滴管、绿液气泡
        ctx.fillStyle='#040806'; ctx.fillRect(0,0,1280,720);
        glow(ctx,640,340,420,'rgba(90,240,160,$A)',0.14+0.04*Math.sin(t*2.1));
        // 大烧瓶
        ctx.save();
        ctx.translate(560,380);
        ctx.strokeStyle='rgba(190,255,225,0.6)'; ctx.lineWidth=3;
        ctx.fillStyle='rgba(120,255,180,0.10)';
        ctx.beginPath();
        ctx.moveTo(-60,120); ctx.lineTo(-60,20);
        ctx.arc(0,20,60,Math.PI,0);
        ctx.lineTo(60,120);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // 绿液
        const lv=110+8*Math.sin(t*1.4);
        const g=ctx.createLinearGradient(0,20,0,120);
        g.addColorStop(0,'rgba(120,255,180,0.75)'); g.addColorStop(1,'rgba(30,140,90,0.85)');
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.moveTo(-58,lv+20); ctx.lineTo(-58,120); ctx.lineTo(58,120); ctx.lineTo(58,lv+20);
        ctx.quadraticCurveTo(0,lv+8,-58,lv+20); ctx.fill();
        // 气泡
        if(!this._bub) this._bub=[];
        if(this._bub.length<26&&Math.random()<0.5){
          Fx.spawn(this._bub,(Math.random()-0.5)*90,110,{vx:(Math.random()-0.5)*8,vy:-16-Math.random()*22,g:0,r:1.5+Math.random()*2.4,life:1.4+Math.random(),col:'rgba(170,255,205,',sway:4});
        }
        Fx.drawPool(ctx,this._bub,1/60);
        ctx.restore();
        glow(ctx,560,380,180,'rgba(100,255,170,$A)',0.20);
        // 试管架（三支，褪色程度递增）
        for(let i=0;i<3;i++){
          const vx=820+i*90;
          ctx.save(); ctx.translate(vx,420); ctx.scale(2.6,2.6);
          Props.vial(ctx,0,0,1, i<2);
          if(i===1){ // 半褪
            ctx.fillStyle='rgba(225,228,215,0.75)';
            ctx.beginPath(); ctx.ellipse(0,-7,4.6,6,0,0,TAU); ctx.fill();
          }
          ctx.restore();
        }
        // 床上一只死去的老鼠，影子立在床边
        const mr={x:1010,y:560,pose:'stand',ph:0,h:30,flip:false};
        rat(ctx,mr,{color:'rgba(225,228,215,0.85)'}); // 已褪色的白鼠
        const sh={x:1130,y:590,pose:'stand',ph:0,flip:true,s:0.5,t:t};
        Chars.shadow(ctx,sh,{});
      }
    },
    /* ---- 5-3 试药（高潮） ---- */
    {
      drip:true, fog:0.2, hb:0, amb:0.62, cam:[[0,640,480,1],[7,745,430,1.2]],
      subs:[
        '第二天早上我醒来的时候，桌上的小瓶空了。华生也不在。',
        '他躺在那里。左臂的肘弯处有一个针孔，针孔周围的皮肤是白色的。不是苍白。是白色。瓷器的白。',
        '"我数到十，"他说，"然后我就知道答案了。" 褪色之后，我还是不是我。',
        '他开始抽搐。绿色的东西从他身体里出来：眼角、指甲缝、耳朵，还有那道早已愈合的旧伤。流出来的时候是液体，一碰到空气就变成粉末，落在床单上，像霜。',
        '而他的影子站起来了。它弯下腰，把手放在华生的额头上。那动作几乎是温柔的。然后它转向我。',
        '"不。" 我扑过去。影子退回去了。不是被我吓退的。是它自己选择退回去的。'
      ],
      subsEn:[
        'When I woke the next morning, the little vial on the table was empty. So was Watson\'s bed.',
        'He lay there. A needle mark in the crook of his left arm, and the skin around it white. Not pale — white. The white of porcelain.',
        '"I\'ll count to ten," he said, "and then I shall know the answer." Whether, after the fading, I am still me.',
        'Then the convulsions began. Green came out of him everywhere: the corners of his eyes, the beds of his nails, his ears, and the old healed scar on his shoulder. Liquid as it left him, powder the moment it touched the air — settling on the sheets like frost.',
        'And his shadow stood up. It bent down and laid its hand on Watson\'s forehead — almost tenderly. Then it turned to me.',
        '"No." I threw myself between them. The shadow withdrew — not driven back by me. It chose to withdraw.'
      ],
      draw(ctx,t,dt){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        Props.vial(ctx,392,486,1.1,false);
        const si=Engine.subI;
        const convulse=(si>=2&&si<=3)?Math.sin(t*22)*3:0;
        lyingFigure(ctx,{x:1090+convulse,y:560,h:230,headRight:false,color:'#080c0a',
          headColor:si>=2?'rgba(224,222,208,0.95)':'rgba(120,130,122,0.8)',blanket:'#101813'});
        if(si>=1){
          ctx.fillStyle='rgba(228,226,214,0.9)';
          ctx.beginPath(); ctx.ellipse(1205,532,10,14,0,0,TAU); ctx.fill();
        }
        if(!this._pool) this._pool=[];
        if(si>=3&&this._pool.length<90){
          for(let i=0;i<3;i++){
            Fx.spawn(this._pool,1030+Math.random()*140,500+Math.random()*30,
              {vx:(Math.random()-0.5)*10,vy:8+Math.random()*16,g:14,r:1.2+Math.random()*1.6,
               life:1.6+Math.random(),col:'rgba(196,255,222,',sway:3});
          }
        }
        Fx.drawPool(ctx,this._pool,1/60);
        if(si>=4){
          const k=ease(clamp(t/1.5,0,1));
          const shx=lerp(1235,1165,k);
          const sh={x:shx,y:645,pose:si>=4?'kneel':'stand',ph:0,flip:true,s:1.1,t:t};
          Rig.set('shade',t,shx,645,sh.pose,0,true,1.1,0.0);
          Chars.shadow(ctx,sh,{});
          if(si>=4){
            glow(ctx,1185,505,44,'rgba(170,255,200,$A)',0.16+0.06*Math.sin(t*3));
          }
          if(si>=5){
            const sh2={x:1235,y:645,pose:'stand',ph:0,flip:true,s:1.08,t:t};
            Chars.shadow(ctx,sh2,{});
          }
        }
        if(si>=5){
          const hx=930;
          const hs={x:hx,y:616,pose:'stand',ph:0,flip:true,s:1,lean:0.05};
          Chars.holmes(ctx,hs,{rim:true,t:t});
          Rig.set('holmes',t,hx,616,'stand',0,true,1,0.4);
        }else{
          const hs={x:620,y:614,pose:'stand',ph:0,flip:true,s:1};
          Chars.holmes(ctx,hs,{rim:true,t:t});
          Rig.set('holmes',t,620,614,'stand',0,true,1,0.4);
        }
        if(si>=3){
          glow(ctx,P.lampX,P.lampY,240,'rgba(90,255,170,$A)',0.10+0.05*Math.sin(t*6));
        }
      }
    },
    /* ---- 5-4 三天蒙太奇 ---- */
    {
      drip:true, fog:0.26, hb:48,
      subs:[
        '第一天。我把他搬到床上，开始记录：体温、脉搏、瞳孔反应。我的笔记乱得连我自己都认不出来。有一个词我写了很多遍：稳定。我不知道我是在记录，还是在祈祷。',
        '第二天。我不记了。我的手抖得太厉害，笔尖划破了纸。有一次他的呼吸停了。我数到三才重新开始。那三秒钟是我这辈子最长的三秒钟。',
        '第三天。我开始说话。我知道他听不见。但我不在乎。',
        '"我怕的是，"我说，"如果我习惯了，你就不在了。"'
      ],
      subsEn:[
        'Day one. I carried him to the bed and began to record: temperature, pulse, pupil response. My notes dissolved into scrawl. One word I wrote over and over: stable. I do not know whether I was recording, or praying.',
        'Day two. I stopped writing. My hands shook too hard; the nib tore the paper. Once, his breathing stopped. I counted to three before it began again. Those three seconds were the longest of my life.',
        'Day three. I began to talk. I knew he could not hear me. I did not care.',
        '"What I fear," I said, "is that if I get used to it, you will be gone."'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        const si=Engine.subI;
        const dayK=[0.10,0.03,0.06,0.06][si]||0.06;
        ctx.fillStyle=`rgba(140,190,160,${dayK})`;
        ctx.fillRect(0,0,1280,720);
        lyingFigure(ctx,{x:1090,y:560,h:230,headRight:false,color:'#080c0a',
          headColor:'rgba(190,195,182,0.75)',blanket:'#101813'});
        const hs={x:960,y:618,pose:'sit',ph:0,flip:true,s:0.98,
          lean:si===1?0.04*Math.sin(t*8):0.015*Math.sin(t*1.2)};
        Rig.set('holmes',t,hs.x,hs.y,'sit',0,true,0.98,0.4);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        if(si===0){
          ctx.save();
          ctx.translate(760,470); ctx.rotate(-0.06);
          ctx.fillStyle='rgba(216,207,174,0.85)';
          ctx.fillRect(-60,-44,120,88);
          ctx.strokeStyle='rgba(40,60,48,0.7)'; ctx.lineWidth=2;
          ctx.beginPath();
          ctx.moveTo(-45,-20); ctx.quadraticCurveTo(-10,-26,40,-18);
          ctx.moveTo(-45,-2); ctx.quadraticCurveTo(0,-10,42,-2);
          ctx.moveTo(-45,16); ctx.lineTo(20,16);
          ctx.stroke();
          ctx.fillStyle='rgba(40,60,48,0.85)';
          ctx.font='20px Georgia,"Songti SC","SimSun",serif';
          ctx.fillText('稳定',-32,16);
          ctx.restore();
        }
        if(si>=1){
          glow(ctx,1000,540,36,'rgba(255,214,150,$A)',0.10+0.04*Math.sin(t*2.4));
        }
        if(si>=2){
          glow(ctx,P.lampX,P.lampY,300,'rgba(120,255,180,$A)',0.08+0.03*Math.sin(t*1.5));
        }
      }
    },
    /* ---- 5-5 第四天：醒来 ---- */
    {
      drip:true, fog:0.28, hb:0,
      subs:[
        '第四天。他的眼睛睁开了。我做的第一件事是检查他的瞳孔。收缩正常。第二件事：我去看他的影子。慢半拍。',
        '我低下头，把额头抵在他的手背上。我感觉到他的手指动了。很轻。他在摸我的头发。 "三天。" "三天。" "我数到十了吗？" "你数到了。答案呢？"',
        '"我还是我。"他说，"但我现在能听见它们了。在地下，在很远的地方。它们在说话。说我的名字。"',
        '"我守了三天。" "我知道。"他说，"我听见了。您说的话。" "哪一句？"',
        '他没有回答。他只是看着我。然后他闭上眼睛，睡着了。我坐在那里，握着他的手，直到灯从绿色变成另一种绿色。'
      ],
      subsEn:[
        'Day four. His eyes opened. First I checked his pupils. Normal. Second, I went to look at his shadow. Half a beat behind.',
        'I bowed my head against the back of his hand, and felt his fingers move — lightly, through my hair. "Three days." "Three days." "Did I count to ten?" "You did. And the answer?"',
        '"I am still me," he said. "But now I can hear them. Underground, a long way off. They are talking. They are saying my name."',
        '"I kept watch for three days." "I know," he said. "I heard you. What you said." "Which line?"',
        'He did not answer. He only looked at me. Then he closed his eyes and slept. I sat holding his hand until the lamp turned from one green into another.'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        const si=Engine.subI;
        const ws={x:1075,y:566,pose:'sit',ph:0,flip:false,s:0.9,lean:0.02*Math.sin(t*1.6)};
        Rig.set('watson',t,ws.x,ws.y,'sit',0,false,0.9,0.4);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||ws,{});
        Chars.watson(ctx,ws,{rim:true});
        const hs={x:950,y:620,pose:'sit',ph:0,flip:true,s:1,
          lean:si>=4?0:0.035};
        Rig.set('holmes',t,hs.x,hs.y,'sit',0,true,1,0.4);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        if(si>=4){
          glow(ctx,1010,470,90,'rgba(140,255,190,$A)',0.10+0.04*Math.sin(t*1.8));
        }
      }
    }
  ]
});
