/* ============ 第四幕 · 皮与核 ============ */
/* Rache 粉笔笔画数据：v 0=基线 1=大写顶，每字母 strokes 为折线数组 */
const RACHE_STROKES=[
  {w:0.72, strokes:[[[0,0],[0,1]], [[0,1],[0.62,0.86],[0.74,0.64],[0.6,0.48],[0,0.44]], [[0.3,0.46],[0.62,0.24],[0.7,0]]]},
  {w:0.7,  strokes:[[[0.74,0.66],[0.5,0.76],[0.26,0.72],[0.14,0.54],[0.2,0.34],[0.44,0.28],[0.72,0.4]], [[0.74,0.7],[0.72,0.4],[0.7,0.28]]]},
  {w:0.66, strokes:[[[0.78,0.68],[0.56,0.78],[0.3,0.72],[0.16,0.52],[0.24,0.32],[0.5,0.24],[0.78,0.32]]]},
  {w:0.72, strokes:[[[0,0],[0,1]], [[0,0.44],[0.2,0.56],[0.44,0.58],[0.6,0.44],[0.62,0.22],[0.6,0]]]},
  {w:0.7,  strokes:[[[0.18,0.46],[0.74,0.46]], [[0.74,0.46],[0.6,0.28],[0.36,0.2],[0.18,0.32],[0.14,0.52],[0.26,0.7],[0.5,0.76],[0.7,0.62]]]},
];
Engine.register({
  id:'act4', title:'第四幕 · 皮与核', mood:'tension', fog:0.25, amb:0.5,
  ad:{
    h:'出售二手化学实验器材',
    en:'Second-hand chemistry equipment, nine-tenths new. Includes: Bunsen burner (flame colour adjustable; green most popular), alembic (formerly used to distil moonlight), microscope (renders blood cells visible; do not use at full moon), assorted glassware (faint green residue inside adds to collector\'s value). Seller: a retired consulting detective, parting with them reluctantly owing to failing eyesight (he claims his shadow has begun to argue with him). Price negotiable, cash only, no shells. Baker Street, somewhere; knock four times, no more, no less. (Agent\'s note: if a violin answers the door, leave at once. That is not him.)',
    b:'九成新。包括：本生灯（火焰颜色可调，绿色为最受欢迎款）、蒸馏器（曾用于提炼月光）、显微镜（可观察血液细胞，但请勿在满月时使用）、以及各种玻璃器皿（部分器皿内壁残留绿色痕迹，不影响使用，反而增添收藏价值）。卖家是一位退休的咨询侦探，因视力原因（他声称自己的影子开始与他争吵）忍痛割爱。价格面议，只收现金，不收贝壳。地址：贝克街某处，敲门时请敲四下，不多不少。',
    w:'（中介备注：若门后传来小提琴声，请立即离开，那不是他。）'
  },
  beats:[
    /* ---- 4-0 伦敦夜景：不该去的夜 ---- */
    {
      fog:0.55, amb:0.45,
      subs:[
        '那天夜里我们本来不应该去的。我知道，华生也知道。',
        '但有些事情必须做——不是因为它们是对的，而是因为它们是唯一还能做的事。'
      ],
      subsEn:[
        'We should not have gone that night. I knew it, and Watson knew it.',
        'But some things must be done — not because they are right, but because they are the only thing left to do.'
      ],
      draw(ctx,t){
        const S=Scenes.londonNight(); S.draw(ctx,t);
        // 两人走过桥（自右向左）
        const k=clamp(t/10,0,1);
        const hx=lerp(1150,240,k), wx=lerp(1230,330,k);
        const hs={x:hx,y:470,pose:'walk',ph:t*6.5,flip:true,s:0.62};
        Rig.set('holmes',t,hx,470,'walk',t*6.5,true,0.62,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{lampX:640});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        const ws={x:wx,y:474,pose:'walk',ph:t*6.5+0.4,flip:true,s:0.58};
        Rig.set('watson',t,wx,474,'walk',t*6.5+0.4,true,0.58,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||ws,{lampX:640,keepCane:true});
        Chars.watson(ctx,ws,{rim:true});
      }
    },
    /* ---- 4-1 王子：选择 ---- */
    {
      fog:0.2, amb:0.55,
      subs:[
        '王子比我们想象的更年轻，也更疲惫。他的血是绿色的——但他的眼睛是棕色的，像人类一样棕色。',
        '"你们想让我背叛我的种族。"',
        '"我们想让您选择。选择成为人类。"',
        '"成为人类？意味着会死。意味着会痛。意味着在夜里醒来，发现自己的影子不在床上，而是站在墙角，看着你们。"',
        '"意味着自由。"华生说。',
        '"你不怕吗？" "我怕。"他说，"但我更怕习惯了不害怕。"'
      ],
      subsEn:[
        'The Prince was younger than we had imagined, and more tired. His blood was green — but his eyes were brown, brown as a man\'s.',
        '"You want me to betray my own kind."',
        '"We want you to choose. To choose to be human."',
        '"To be human? It means to die. It means to hurt. It means waking at night to find your shadow is not in the bed, but standing in the corner, watching you."',
        '"It means freedom," said Watson.',
        '"Aren\'t you afraid?" "I am," he said. "But I am more afraid of getting used to it."'
      ],
      draw(ctx,t){
        const S=Scenes.princeRoom(); S.draw(ctx,t);
        const p1={x:1010,y:628,pose:'sit',ph:0,flip:true,s:0.92,lean:0.02*Math.sin(t*1.1)};
        Rig.set('prince',t,p1.x,p1.y,'sit',0,true,0.92,0.5);
        drawShadowOf(ctx,Chars.prince,Rig.at('prince',t)||p1,{lampX:200});
        Chars.prince(ctx,p1,{rim:true,color:'#111d17',t:t});
        const h1={x:560,y:632,pose:'stand',ph:0,flip:false,s:0.95};
        Rig.set('holmes',t,h1.x,h1.y,'stand',0,false,0.95,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||h1,{lampX:200});
        Chars.holmes(ctx,h1,{rim:true,t:t});
        const w1={x:480,y:636,pose:'stand',ph:0,flip:false,s:0.9};
        Rig.set('watson',t,w1.x,w1.y,'stand',0,false,0.9,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||w1,{lampX:200,keepCane:true});
        Chars.watson(ctx,w1,{rim:true});
      }
    },
    /* ---- 4-2 王子的秘密：杀了我 ---- */
    {
      fog:0.18, amb:0.6, hb:56,
      subs:[
        '"我曾经是人类。……我记得阳光。记得饿。真正的饿，不是这种……这种吞噬。"',
        '门外有声音。不是脚步声，是某种东西在地板上爬行的声音。',
        '"它们来了。它们知道我在这里。它们知道我在……犹豫。"',
        '"杀了我。用人类的刀。让我作为人类死去，而不是作为它们的一员活着。"'
      ],
      subsEn:[
        '"I was human once. …I remember sunlight. I remember hunger. Real hunger — not this… this devouring."',
        'Outside, a sound. Not footsteps — something crawling across the floor.',
        '"They are coming. They know I am here. They know I am… hesitating."',
        '"Kill me. With a man\'s blade. Let me die as a human, not live as one of them."'
      ],
      draw(ctx,t){
        const S=Scenes.princeRoom(); S.draw(ctx,t);
        const p1={x:1010,y:628,pose:'stand',ph:0,flip:true,s:0.92,lean:-0.01*Math.sin(t*3)};
        Rig.set('prince',t,p1.x,p1.y,'stand',0,true,0.92,0.5);
        drawShadowOf(ctx,Chars.prince,Rig.at('prince',t)||p1,{lampX:200});
        Chars.prince(ctx,p1,{rim:true,color:'#111d17',t:t});
        const h1={x:560,y:632,pose:'stand',ph:0,flip:false,s:0.95};
        Rig.set('holmes',t,h1.x,h1.y,'stand',0,false,0.95,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||h1,{lampX:200});
        Chars.holmes(ctx,h1,{rim:true,t:t});
        const crouch=Engine.subI>=2;
        const w1={x:480,y:636,pose:crouch?'crouch':'stand',
          poseFrom:crouch?'stand':null,
          poseK:crouch?clamp((Engine.beatT-Engine.subChangedAt)/0.35,0,1):0,
          ph:0,flip:false,s:0.9};
        Rig.set('watson',t,w1.x,w1.y,w1.pose,0,false,0.9,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||w1,{lampX:200,keepCane:true});
        Chars.watson(ctx,w1,{rim:true});
        if(Engine.subI>=1){
          const k=ease((t%2)/2);
          ctx.fillStyle=`rgba(2,6,4,${0.25+0.2*k})`;
          ctx.beginPath();
          ctx.moveTo(940,330);
          for(let i=0;i<=8;i++){
            ctx.lineTo(940+i*44, 330+22*Math.sin(i*2.1+t*3)+14*Math.sin(i*4.3-t*5));
          }
          ctx.lineTo(1290,360); ctx.lineTo(1290,300); ctx.closePath(); ctx.fill();
        }
      }
    },
    /* ---- 4-3 处决（无字幕，纯视觉+心跳） ---- */
    {
      fog:0.12, hb:92, amb:0.65, auto:8.5, subs:[], cam:[[0,640,360,1],[8.5,770,430,1.26]],
      draw(ctx,t){
        const S=Scenes.princeRoom(); S.draw(ctx,t);
        const p1={x:900,y:630,pose:'kneel',ph:0,flip:true,s:0.92};
        Chars.prince(ctx,p1,{color:'#111d17'});
        const w1={x:812,y:634,pose:'work',ph:0,flip:false,s:0.9};
        Chars.watson(ctx,w1,{rim:true,keepCane:false});
        const glintK=(t>1.7&&t<2.3)?(1-Math.abs(t-2.0)/0.3):0;
        Fx.glint(ctx,858,540,glintK);
        if(t>1.9){
          const bk=clamp((t-1.9)/2.2,0,1);
          const rr=Math.floor(lerp(40,128,bk)), gg=Math.floor(lerp(220,32,bk)), bb=Math.floor(lerp(120,36,bk));
          ctx.fillStyle=`rgba(${rr},${gg},${bb},${0.85*bk})`;
          ctx.beginPath();
          ctx.ellipse(900,608,60*bk+12,16*bk+4,0,0,TAU); ctx.fill();
          for(let i=0;i<5;i++){
            const dx=Math.sin(i*17.3)*70*bk, dy=Math.cos(i*9.1)*10*bk;
            ctx.beginPath(); ctx.ellipse(900+dx,612+dy,7*bk,3*bk,0,0,TAU); ctx.fill();
          }
        }
        if(t>1.9&&t<3.0){
          for(let i=0;i<10;i++){
            const k2=clamp((t-1.9)/1.1,0,1);
            const dx=Math.sin(i*13.7)*90*k2, dy=-60*Math.sin(k2*Math.PI)*(0.4+0.6*Math.abs(Math.sin(i*7.7)));
            ctx.fillStyle='rgba(90,240,160,0.7)';
            ctx.beginPath(); ctx.arc(900+dx,590+dy,2.4,0,TAU); ctx.fill();
          }
        }
        // Rache（t≈4.8 起，绿粉笔逐笔书写，每写一个字母一声刮擦）
        if(t>4.8){
          const p=clamp((t-4.8)/3.2,0,1);
          if(this._rl===undefined) this._rl=0;
          const CUM=[0,3,5,6,8,10];
          let li=0;
          for(let i=0;i<5;i++){ if(p*10>=CUM[i]) li=i; }
          if(li>this._rl){ this._rl=li; AudioSys.grind(); }
          ctx.save();
          ctx.translate(500,340); ctx.rotate(-0.03);
          glow(ctx,430,320,180,'rgba(90,245,170,$A)',0.12*p);
          let bx=0, acc=0;
          for(let li2=0; li2<RACHE_STROKES.length; li2++){
            const L=RACHE_STROKES[li2];
            if(p*10<=acc) break;
            for(let s=0;s<L.strokes.length;s++){
              const done=clamp(p*10-acc-s,0,1);
              if(done<=0) break;
              const pts=Fx.chalkPartial(L.strokes[s],done);
              Fx.chalkStroke(ctx,pts,bx,0,84,0.9,li2*7+s);
            }
            acc+=L.strokes.length;
            bx+=L.w*84+0.2*84;
          }
          ctx.restore();
        }
        if(t>2.2&&t<4.6){
          Engine.doShake(0.5+0.4*Math.sin(t*9));
        }
      }
    },
    /* ---- 4-4 走进雾里 ---- */
    {
      fog:0.75, hb:0, amb:0.45,
      subs:[
        '我们离开的时候，王子的身体还在抽搐。华生的手在抖，但他没有停下来。我们走进雾里，走进那个绿色正在蔓延的世界。',
        '"我们做错了吗？"华生问。',
        '"我们做了唯一还能做的事。"我说。',
        '他只是伸出手，握了握我的手臂。他的手很暖，但指尖是凉的。'
      ],
      subsEn:[
        'When we left, the Prince\'s body was still twitching. Watson\'s hands shook, but he did not stop. We walked into the fog, into a world going green.',
        '"Did we do wrong?" Watson asked.',
        '"We did the only thing left to do," I said.',
        'He only reached out and took my arm. His hand was warm; his fingertips were cold.'
      ],
      draw(ctx,t){
        const S=Scenes.street({lampX:920}); S.draw(ctx,t);
        const k=clamp(t/9,0,1);
        const hx=lerp(1150,330,k), wx=lerp(1230,420,k);
        const hs={x:hx,y:628,pose:'walk',ph:t*6.5,flip:true,s:0.95};
        Rig.set('holmes',t,hx,628,'walk',t*6.5,true,0.95,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{lampX:920});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        const ws={x:wx,y:632,pose:'walk',ph:t*6.5+0.4,flip:true,s:0.9};
        Rig.set('watson',t,wx,632,'walk',t*6.5+0.4,true,0.9,0.5);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||ws,{lampX:920,keepCane:true});
        Chars.watson(ctx,ws,{rim:true});
        if(Engine.subI>=3){
          Fx.glint(ctx,(hx+wx)/2,530,0.35+0.15*Math.sin(t*2.6));
        }
      }
    }
  ]
});
