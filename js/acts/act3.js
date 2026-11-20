/* ============ 第三幕 · 医生 ============ */
Engine.register({
  id:'act3', title:'第三幕 · 医生', mood:'dread', fog:0.34, amb:0.45,
  ad:{
    h:'旧日支配者主题婚礼策划',
    en:'Old Ones-themed wedding planning! Let Them witness your love! Full service: green-silk invitations (written in true green blood, never fading), deep-sea pearl rings (each from the clams of R\'lyeh), and — most unforgettable — a genuine Old One incarnate to officiate! Basic: His distant gaze. Deluxe: His whisper as background music. Supreme: His tentacles place the rings. Book early; Their time is counted in centuries. (Disclaimer: should either party reveal its true form during the ceremony, the company accepts no liability.)',
    b:'让祂们见证您的爱情！我们提供全套服务：绿色丝绸请柬（用真正的绿血书写，永不褪色）、深海珍珠戒指（每一颗都来自拉莱耶的蚌壳）、以及最令人难忘的——由一位真正的旧日支配者化身亲自为您主持婚礼！您的誓言将在祂的耳畔回响，直至时间尽头。套餐价目：基础版（祂在远处凝视）、豪华版（祂的低语作为背景音乐）、至尊版（祂的触须为您戴上戒指）。预约从速，祂们的时间以世纪计。',
    w:'（免责声明：若婚礼过程中任何一方现出原形，本公司概不负责。）'
  },
  beats:[
    /* ---- 3-1 包扎：稳的手 ---- */
    {
      drip:true, fog:0.3, hb:52,
      subs:[
        '华生的手很稳。一个腿瘸的人，手却稳得像外科医生——事实上，他确实是。',
        '他给我包扎伤口的时候，手指的动作精确得像在演奏某种乐器。',
        '"研究如何让某些东西褪色。"'
      ],
      subsEn:[
        'Watson\'s hands were steady. A man with a lame leg, and hands steady as a surgeon\'s — which, in fact, he was.',
        'When he dressed the burn, his fingers moved with the precision of someone playing an instrument.',
        '"Studying how to make certain things fade."'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const h1={x:600,y:610,pose:'sit',ph:0,flip:true,s:0.95,lean:0.02*Math.sin(t*1.3)};
        Rig.set('holmes',t,h1.x,h1.y,'sit',0,true,0.95,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||h1,{lampX:640});
        Chars.holmes(ctx,h1,{rim:true,t:t});
        Props.chair(ctx,700,610,0.9);
        glow(ctx,640,520,70,'rgba(255,214,150,$A)',0.10+0.03*Math.sin(t*2.2));
        const w1={x:520,y:614,pose:'work',ph:0,flip:false,s:0.9};
        Rig.set('watson',t,w1.x,w1.y,'work',0,false,0.9,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||w1,{lampX:640,keepCane:true});
        Chars.watson(ctx,w1,{rim:true});
        ctx.fillStyle='rgba(216,207,174,0.5)';
        ctx.beginPath(); ctx.ellipse(640,522,16,10,-0.4,0,TAU); ctx.fill();
        ctx.strokeStyle='rgba(216,207,174,0.65)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(628,524); ctx.quadraticCurveTo(600,510,580,514); ctx.stroke();
      }
    },
    /* ---- 3-2 手部特写：多停的那一秒 ---- */
    {
      fog:0.12, hb:0, amb:0.4,
      subs:[
        '他的手指在我的手腕上停留了比平时多一秒的时间。',
        '也许他意识到了，但选择不说。也许他没意识到，但他的手意识到了。'
      ],
      subsEn:[
        'His fingers stayed on my wrist one second longer than they needed to.',
        'Perhaps he noticed and chose not to say. Perhaps he did not notice — but his hand did.'
      ],
      draw(ctx,t){
        // 大特写：暗底上两条手臂相交，绷带缠绕
        ctx.fillStyle='#040806'; ctx.fillRect(0,0,1280,720);
        glow(ctx,640,380,340,'rgba(120,210,160,$A)',0.10+0.03*Math.sin(t*1.6));
        // 华生的手臂（左下伸入，粗壮）
        ctx.save();
        ctx.fillStyle='#0a100d';
        ctx.beginPath();
        ctx.moveTo(80,720); ctx.quadraticCurveTo(300,560,560,430);
        ctx.lineTo(640,470); ctx.quadraticCurveTo(360,620,140,720);
        ctx.closePath(); ctx.fill();
        // 福尔摩斯的手腕（右上伸入）
        ctx.beginPath();
        ctx.moveTo(1280,120); ctx.quadraticCurveTo(1000,260,700,400);
        ctx.lineTo(690,470); ctx.quadraticCurveTo(1020,340,1280,230);
        ctx.closePath(); ctx.fill();
        // 相触的手（中心小光）
        glow(ctx,660,450,60,'rgba(255,214,150,$A)',0.16+0.05*Math.sin(t*2.2));
        // 绷带一圈圈缠绕（随 t 增加）
        const wraps=Math.floor(clamp(t/1.4,0,7));
        for(let i=0;i<=wraps;i++){
          const k=i/7;
          const bx=lerp(760,600,k), by=lerp(400,455,k);
          const r=lerp(38,30,k);
          ctx.strokeStyle=`rgba(216,207,174,${0.9-i*0.06})`;
          ctx.lineWidth=11;
          ctx.beginPath(); ctx.ellipse(bx,by,r,r*0.42,-0.5,0,TAU); ctx.stroke();
        }
        // 绷带卷
        if(t>9.8){
          ctx.fillStyle='rgba(216,207,174,0.85)';
          ctx.beginPath(); ctx.ellipse(700,560,26,16,-0.4,0,TAU); ctx.fill();
          ctx.strokeStyle='rgba(180,170,140,0.6)'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.ellipse(700,560,18,10,-0.4,0,TAU); ctx.stroke();
        }
        ctx.restore();
      }
    },
    /* ---- 3-3 影子收脸（恐怖重头） ---- */
    {
      fog:0.18, hb:64, amb:0.55, cam:[[0,640,380,1],[9,745,393,1.2]],
      subs:[
        '"我有个病人，"他说，声音很低，"一个复旧党的人。他的影子……"',
        '快了半拍。就像……就像影子在追赶他。',
        '他死的时候，影子还在动。它站在床边，看着他的身体，然后……它弯下腰，把什么东西从尸体上拿走了。',
        '他的脸。',
        '这意味着它们在学习。它们在学习如何成为……我们。'
      ],
      subsEn:[
        '"I have a patient," he said, very low. "A Restoration man. His shadow…"',
        'It runs ahead. Half a beat. As if… as if the shadow were chasing him.',
        'When he died, the shadow went on moving. It stood at the bedside, looking down at the body — and then it bent, and took something from the corpse.',
        'His face.',
        'It means they are learning. Learning how to become… us.'
      ],
      draw(ctx,t){
        const S=Scenes.bedroom(); S.draw(ctx,t);
        const P=S.pts;
        const bend=Engine.subI>=2;
        const hasFace=Engine.subI>=3;
        lyingFigure(ctx,{x:640,y:P.bedTop,h:230,headRight:true,color:'#080c0a',
          headColor:hasFace?'#0d1411':'rgba(190,190,175,0.8)',blanket:'#101813'});
        const sh={x:895,y:645,pose:bend?'kneel':'stand',ph:0,flip:true,s:1.08,t:t};
        Rig.set('shade',t,sh.x,sh.y,sh.pose,0,true,1.08,0.0);
        Chars.shadow(ctx,sh,{});
        const k=bend?ease(Math.min(1,t/1.4)):0;
        const fx=lerp(P.corpseHead[0],858,hasFace?1:k*0.5);
        const fy=lerp(P.corpseHead[1],568,hasFace?1:k*0.5);
        const fk=hasFace?1:0.4+0.4*k;
        ctx.save();
        ctx.globalAlpha=fk;
        ctx.translate(fx,fy);
        ctx.fillStyle='rgba(206,200,180,0.92)';
        ctx.beginPath(); ctx.ellipse(0,0,24,30,0.08,0,TAU); ctx.fill();
        ctx.fillStyle='rgba(90,96,88,0.35)';
        ctx.beginPath(); ctx.ellipse(-8,-7,5,3.4,0,0,TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(8,-7,5,3.4,0,0,TAU); ctx.fill();
        ctx.strokeStyle='rgba(90,96,88,0.30)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(0,14,7,1.15*Math.PI,1.85*Math.PI); ctx.stroke();
        ctx.restore();
        glow(ctx,fx,fy,70,'rgba(210,230,205,$A)',0.14*fk);
      }
    },
    /* ---- 3-4 对坐：座右铭 ---- */
    {
      drip:true, fog:0.3, hb:0,
      subs:[
        '"您害怕吗？"他问。',
        '我害怕很多东西：害怕我的影子有一天会比我先开口说话，害怕我的血有一天会完全变成绿色，害怕习惯了不害怕。',
        '"我害怕。"我说，"但我更怕习惯了不害怕。"',
        '"我明天再来。"他说。他走到门口，又停下来，转过身。'
      ],
      subsEn:[
        '"Are you afraid?" he asked.',
        'I am afraid of many things: that one day my shadow will speak before I do; that one day my blood will run entirely green; that I will grow used to not being afraid.',
        '"I am afraid," I said. "But I am more afraid of getting used to it."',
        '"I\'ll come again tomorrow," he said. At the door he stopped, and turned.'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        const h1={x:560,y:608,pose:'sit',ph:0,flip:false,s:0.94};
        Rig.set('holmes',t,h1.x,h1.y,'sit',0,false,0.94,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||h1,{lampX:640});
        Chars.holmes(ctx,h1,{rim:true,t:t,smoke:true});
        Props.chair(ctx,475,608,0.9);
        const w1={x:760,y:608,pose:'sit',ph:0,flip:true,s:0.9};
        Rig.set('watson',t,w1.x,w1.y,'sit',0,true,0.9,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||w1,{lampX:640,keepCane:true});
        Chars.watson(ctx,w1,{rim:true});
        Props.chair(ctx,845,608,0.9);
        if(Engine.subI===2){
          glow(ctx,640,300,260,'rgba(80,230,150,$A)',0.10+0.04*Math.sin(t*2.6));
        }
      }
    },
    /* ---- 3-5 剧本手稿特写：没有结局，只有下一幕 ---- */
    {
      fog:0.15, amb:0.4,
      subs:[
        '"您写的剧本，"他说，"我读完了。" "结局呢？"',
        '"没有结局。"他说，"只有下一幕。"'
      ],
      subsEn:[
        '"The play you wrote," he said. "I\'ve finished it." "And the ending?"',
        '"There is no ending," he said. "Only the next act."'
      ],
      draw(ctx,t){
        // 特写：桌面上的一叠手稿
        ctx.fillStyle='#040706'; ctx.fillRect(0,0,1280,720);
        glow(ctx,640,300,380,'rgba(255,214,150,$A)',0.13+0.03*Math.sin(t*1.8));
        // 手稿叠
        for(let i=0;i<4;i++){
          const off=i*7;
          ctx.save();
          ctx.translate(640+off*0.6-10,330+off*0.5);
          ctx.rotate((i%2?0.02:-0.02)+0.01*Math.sin(t*0.8+i));
          ctx.fillStyle=`rgba(214,205,176,${0.9-i*0.1})`;
          ctx.fillRect(-170,-120,340,240);
          // 密码般的字迹（剧本=密码）
          ctx.strokeStyle='rgba(46,120,86,0.75)'; ctx.lineWidth=1.6;
          for(let r=0;r<9;r++){
            ctx.beginPath();
            const y=-100+r*24, x0=-150;
            for(let k=1;k<=6;k++){
              ctx.lineTo(x0+k*50, y+Math.sin(k*3.1+r*1.7+i*2)*3.4);
            }
            ctx.stroke();
          }
          ctx.restore();
        }
        // 翻动的一页（t>4）
        if(t>4){
          const k=clamp((t-4)/1.2,0,1);
          ctx.save();
          ctx.translate(810,330);
          ctx.rotate(-0.5+k*1.1);
          ctx.fillStyle='rgba(222,214,186,0.95)';
          ctx.fillRect(0,-120,170,240);
          ctx.strokeStyle='rgba(46,120,86,0.6)'; ctx.lineWidth=1.5;
          for(let r=0;r<7;r++){
            ctx.beginPath();
            const y=-95+r*27;
            for(let kk=1;kk<=4;kk++) ctx.lineTo(-140+kk*62, y+Math.sin(kk*2.7+r)*3);
            ctx.stroke();
          }
          ctx.restore();
        }
        // 最后一行绿字（"只有下一幕"时刻）
        if(Engine.subI>=1){
          const k=ease(clamp((t-0.5)/1,0,1));
          ctx.fillStyle=`rgba(90,245,170,${0.8*k})`;
          ctx.font='italic 30px Georgia,"Songti SC","SimSun",serif';
          ctx.textAlign='center';
          ctx.fillText('ACT Ⅶ · 下一幕',640,640);
        }
      }
    }
  ]
});
