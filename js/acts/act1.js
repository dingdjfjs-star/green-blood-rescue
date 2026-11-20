/* ============ 第一幕 · 广告栏 ============ */
Engine.register({
  id:'act1', title:'第一幕 · 广告栏', mood:'calm', fog:0.35, amb:0.45,
  ad:{
    h:'培美西塞-罗登记忆药剂',
    en:'Knowledge is power, and memory the mother of knowledge! The Pemesis-Roden Memory Elixir — drawn from the unburned scrolls of Alexandria, blended with Ganges morning dew and Alpine ice. One drop, and nothing is ever forgotten! Oxford Street No.14, by royal warrant. (Note: if you dream of a green palace, stop taking it at once and contact your nearest church.)',
    b:'知识就是力量，而记忆则是知识之母！培美西塞-罗登记忆药剂，取材自亚历山大图书馆未焚之卷的千年沉淀，辅以恒河晨露与阿尔卑斯山巅的永冻冰晶，一滴入喉，过目不忘！考学的、议政的、经商的、传教的女王臣民们——请让培美西塞-罗登为您的头脑装上蒸汽引擎！伦敦牛津街14号有售，王室御用，童叟无欺。',
    w:'（注意：服用后若梦见绿色宫殿，请立即停止服用并联系最近的教堂。）'
  },
  beats:[
    /* ---- 1-0 伦敦报纸墙 ---- */
    {
      fog:0.5, amb:0.3,
      subs:[
        '广告是三天前登出去的，贴在圣贾尔斯的砖墙上。',
        '我亲手写的，用左手，字迹歪歪扭扭，像个刚学会写字的孩子。这不是为了伪装——虽然我确实在伪装——而是为了让某些人认出我。',
        '最好的隐藏不是变成另一个人，而是变成一个没有人愿意仔细看的人。'
      ],
      subsEn:[
        'The advertisement had been posted three days ago, on a brick wall in St Giles\'s.',
        'I wrote it myself, with my left hand, in a scrawl like a child\'s — not as a disguise, though a disguise it was, but so that a certain someone would recognise it.',
        'The best hiding is not to become someone else, but to become someone no one cares to look at.'
      ],
      draw(ctx,t){
        const S=Scenes.posterWall(); S.draw(ctx,t);
      }
    },
    /* ---- 1-1 老鼠实验：影子慢一秒 ---- */
    {
      drip:true, fog:0.32, cam:[[0,640,360,1],[8,560,385,1.15]],
      subs:[
        '第七天，它开始用后腿站立，前爪合十，像个人类那样祈祷。',
        '我把它放走了。',
        '有些实验不需要结果，只需要确认恐惧是真的。'
      ],
      subsEn:[
        'On the seventh day it rose onto its hind legs and pressed its forepaws together, praying the way a human prays.',
        'I let it go.',
        'Some experiments need no result — only the confirmation that the fear is real.'
      ],
      draw(ctx,t,dt){
        const S=Scenes.basement();
        S.draw(ctx,t);
        const P=S.pts, top=P.tableTop;
        glow(ctx,P.domeX,top-30,120,'rgba(150,255,190,$A)',0.16+0.03*Math.sin(t*9));
        const pray=(t>3)||(Engine.subI>=1);
        let rx,ry,pose,rph;
        if(!pray){ rx=P.domeX+40*Math.sin(t*0.55); ry=top-4; pose='walk'; rph=t*7; }
        else { rx=P.domeX; ry=top-4; pose='pray'; rph=0; }
        const ratSnap={x:rx,y:ry,pose:pose,ph:rph,h:36};
        Rig.set('rat',t,rx,ry,pose,rph,false,1,1.0);
        drawShadowOf(ctx,(c,s,o)=>Chars.rat(c,s,o),Rig.at('rat',t)||ratSnap,{});
        Chars.rat(ctx,ratSnap,{h:36});
        const free=(Engine.subI>=1);
        let domeLift=0, ratGone=0;
        if(free){ domeLift=Math.min(1,t*0.8); ratGone=Math.min(1,Math.max(0,(t-1.4))*0.5); }
        if(!free||domeLift<1.6){
          ctx.save(); ctx.globalAlpha=clamp(1-Math.max(0,domeLift-0.5),0,1);
          Props.dome(ctx,P.domeX,top-domeLift*46,1);
          ctx.restore();
        }
        if(free&&ratGone<1){
          const rx2=lerp(P.domeX,760,ratGone), ry2=top-4;
          Rig.set('rat',t,rx2,ry2,'walk',t*9,false,1,1.0);
          drawShadowOf(ctx,(c,s,o)=>Chars.rat(c,s,o),Rig.at('rat',t)||{x:rx2,y:ry2,pose:'walk',ph:t*9},{});
          Chars.rat(ctx,{x:rx2,y:ry2,pose:'walk',ph:t*9,h:36},{});
        }
        const snap={x:500,y:614,pose:'work',ph:0,flip:true,s:1,lean:0.03*Math.sin(t*2)};
        Rig.set('holmes',t,snap.x,snap.y,'work',0,true,1,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||snap,{});
        Chars.holmes(ctx,snap,{rim:true,t:t,smoke:false});
      }
    },
    /* ---- 1-2 威金斯与绿墨水纸条 ---- */
    {
      drip:true, fog:0.3,
      subs:[
        '"先生，"威金斯说，他的眼睛在黑暗中发亮，"有个人让我把这个交给您。"',
        '今晚十点，老地方。带上您的影子——如果它还愿意跟着您的话。',
        '没有署名。不需要署名。'
      ],
      subsEn:[
        '"Sir," said Wiggins, his eyes bright in the dark, "someone asked me to give you this."',
        'Ten o\'clock tonight, the old place. Bring your shadow — if it still cares to follow you.',
        'No signature. None was needed.'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        const wx = t<2.2 ? lerp(110,262,ease(t/2.2)) : 262;
        const wpose = t<2.2?'walk':'handout';
        const wsnap={x:wx,y:612,pose:wpose,ph:t*8,flip:false,s:1};
        Rig.set('wiggins',t,wsnap.x,wsnap.y,wpose,t*8,false,1,0.35);
        drawShadowOf(ctx,Chars.wiggins,Rig.at('wiggins',t)||wsnap,{});
        Chars.wiggins(ctx,wsnap,{rim:true});
        const hsnap={x:438,y:612,pose:'stand',ph:0,flip:true,s:1};
        Rig.set('holmes',t,hsnap.x,hsnap.y,'stand',0,true,1,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hsnap,{});
        Chars.holmes(ctx,hsnap,{rim:true,t:t,smoke:true});
        if(Engine.subI>=1){
          const k=ease(Math.min(1,(t-1.0)/0.6));
          ctx.save(); ctx.globalAlpha=k;
          ctx.translate(640,320); ctx.rotate(-0.05); ctx.scale(0.9+0.1*k,0.9+0.1*k);
          ctx.fillStyle='#cfc6a4';
          ctx.fillRect(-175,-108,350,216);
          ctx.fillStyle='rgba(90,70,40,0.22)'; ctx.fillRect(-175,-2,350,2);
          ctx.strokeStyle='rgba(120,100,60,0.4)'; ctx.strokeRect(-175,-108,350,216);
          ctx.fillStyle='rgba(46,150,100,0.95)';
          ctx.font='italic 18px Georgia,"Songti SC","SimSun",serif';
          ctx.textAlign='left';
          const lines=[
            '我知道您在找什么。我也在找。',
            '但我找到的东西可能不是您想要的答案。',
            '今晚十点，老地方。带上您的影子——',
            '如果它还愿意跟着您的话。'
          ];
          lines.forEach((L,i)=>ctx.fillText(L,-150,-50+i*42));
          ctx.restore();
        }
      }
    },
    /* ---- 1-3 绿色火焰与硬币 ---- */
    {
      drip:true, fog:0.3,
      subs:[
        '我把纸条凑到煤气灯上烧了。火焰是绿色的，和墨水一个颜色。',
        '"四下，"我说，"不多不少。"'
      ],
      subsEn:[
        'I held the note to the gas lamp and burned it. The flame was green, the same green as the ink.',
        '"Four knocks," I said. "No more, no less."'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        const wx = t<1.6 ? lerp(110,700,ease(t/1.6)) : 700;
        const wpose = t<1.6?'walk':'stand';
        const wsnap={x:wx,y:612,pose:wpose,ph:t*8,flip:false,s:1};
        Rig.set('wiggins',t,wx,612,wpose,t*8,false,1,0.35);
        drawShadowOf(ctx,Chars.wiggins,Rig.at('wiggins',t)||wsnap,{});
        Chars.wiggins(ctx,wsnap,{rim:true});
        const hsnap={x:548,y:612,pose:'handout',ph:0,flip:false,s:1};
        Rig.set('holmes',t,hsnap.x,hsnap.y,'handout',0,false,1,0.5);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hsnap,{});
        Chars.holmes(ctx,hsnap,{rim:true,t:t});
        if(Engine.subI<2){
          const burnK=clamp(t/1.6,0,1);
          ctx.save(); ctx.globalAlpha=1-burnK*0.85;
          Props.note(ctx,608,528,-0.3,0.9);
          ctx.restore();
          Fx.flame(ctx,608,520,13,t*1.1,'green');
        }
        Fx.flame(ctx,P.lampX,P.lampY+14,9,t,'green');
        if(Engine.subI>=1){
          const k=clamp((t-0.4)/0.7,0,1);
          if(k<1){
            const cx=lerp(588,712,k), cy=560-110*4*k*(1-k);
            Props.coin(ctx,cx,cy,6);
            Fx.glint(ctx,cx,cy,0.5);
          }
        }
      }
    },
    /* ---- 1-4 楼梯的黑暗 ---- */
    {
      fog:0.45,
      subs:[
        '他点点头，消失在楼梯的黑暗里。',
        '他的影子跟在他身后，速度正常。这很好。这说明有些东西还没有注意到他。'
      ],
      subsEn:[
        'He nodded, and vanished into the darkness of the stairs.',
        'His shadow followed at his heels, at the proper speed. Good. It meant some things had not yet noticed him.'
      ],
      draw(ctx,t){
        const S=Scenes.stairwell(); S.draw(ctx,t);
        // 威金斯沿台阶上行，渐远渐暗
        const k=clamp(t/5,0,1);
        const wx=lerp(300,660,k), wy=lerp(648,300,k);
        const ws={x:wx,y:wy,pose:'walk',ph:t*7,flip:false,s:lerp(1,0.5,k)};
        Rig.set('wiggins',t,wx,wy,'walk',t*7,false,1,0.35);
        drawShadowOf(ctx,Chars.wiggins,Rig.at('wiggins',t)||ws,{lampX:820});
        ctx.save(); ctx.globalAlpha=1-k*0.55;
        Chars.wiggins(ctx,ws,{rim:true});
        ctx.restore();
      }
    },
    /* ---- 1-5 影子指门（招牌镜头） ---- */
    {
      drip:true, fog:0.28, em:true, cam:[[0,640,360,1],[6,545,390,1.18]],
      subs:[
        '我抬头看向墙角。我的影子站在那里，比我慢了半拍。',
        '它抬起手，指了指门口。',
        '有人来了。'
      ],
      subsEn:[
        'I looked up at the corner. My shadow stood there, half a beat behind me.',
        'It raised its hand and pointed at the door.',
        'Someone was coming.'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        const hsnap={x:600,y:618,pose:'stand',ph:0,flip:false,s:1};
        Chars.holmes(ctx,hsnap,{rim:true,t:t,smoke:true});
        const armK = t<1.4 ? 0 : (t<2.6 ? ease((t-1.4)/1.2) : 1+ease((t-2.6)/0.9));
        const shSnap={x:505,y:622,pose:'arm',ph:0,flip:true,s:1.02};
        humanoid(ctx,{...shSnap,h:288,color:'rgba(3,8,5,0.92)',armK:armK});
        glow(ctx,505,480,150,'rgba(60,210,140,$A)',0.06+0.03*Math.sin(t*2.2));
        const doorLight=0.25+0.18*Math.sin(t*1.1);
        ctx.fillStyle=`rgba(140,240,180,${doorLight*0.5})`;
        ctx.fillRect(52,518,98,3);
      }
    }
  ]
});
