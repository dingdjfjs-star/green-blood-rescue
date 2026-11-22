/* ============ 第六幕 · Rache（含尾声） ============ */
Engine.register({
  id:'act6', title:'第六幕 · Rache', mood:'climax', fog:0.3, amb:0.5,
  ad:{
    h:'寻人启事',
    en:'WANTED: a tall gentleman, dark-haired, given to pipe-smoking, skilled in disguise and chemistry. Last seen in the company of a lame doctor, the two of them seemingly searching for something — or fleeing it. Send clues to this office, or write RACHE in green chalk on any wall in St Giles\'s. Reward: the answer to one question — any question, if you dare to ask it. (This notice stands until the world returns to its old track, or derails entirely.)',
    b:'寻找一位高个子男士，黑发，抽烟斗，擅长伪装与化学实验。最后一次出现时与一位瘸腿医生同行，二人似乎正在寻找什么，或逃避什么。如有线索，请致信本报社，或直接在圣贾尔斯区的任何一面墙上用绿色粉笔写下 Rache。报酬：一个问题的答案——任何问题的答案，只要您敢问。',
    w:'（本启事长期有效，直至世界重回旧轨，或彻底脱轨。）'
  },
  beats:[
    /* ---- 6-1 午夜的威金斯 ---- */
    {
      drip:true, fog:0.26,
      subs:[
        '威金斯来的时候，已经是午夜了。那件事过去两周，华生能下床了，虽然走路的时候我忍不住要数他的脚步和影子之间的间隔。',
        '他长大了，不再是那个跑腿的小孩。他的眼睛在黑暗中发亮，像某种夜行动物。',
        '"贝克街的那位先生，"他说，"他没有上报你们的行踪。" "我知道。"我说。 "为什么？" "因为他在等我们变成他。"',
        '有些事情只有变成过怪物的人才能明白。'
      ],
      subsEn:[
        'Wiggins came at midnight. A fortnight had passed; Watson could walk again, though I could not help counting the interval between his steps and his shadow.',
        'He had grown; he was no longer the errand boy. His eyes shone in the dark like some nocturnal animal\'s.',
        '"The gentleman at Baker Street," he said, "never reported where you are." "I know," I said. "Why?" "Because he is waiting for us to become him."',
        'Some things are only understood by those who have been monsters.'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const wx=t<2.0?lerp(110,300,ease(t/2.0)):300;
        const ws={x:wx,y:614,pose:t<2.0?'walk':'stand',ph:t*7,flip:false,s:1.06};
        Rig.set('wiggins',t,wx,614,ws.pose,t*7,false,1.06,0.35);
        drawShadowOf(ctx,Chars.wiggins,Rig.at('wiggins',t)||ws,{});
        Chars.wiggins(ctx,ws,{rim:true});
        const hs={x:560,y:616,pose:'stand',ph:0,flip:true,s:1};
        Rig.set('holmes',t,hs.x,hs.y,'stand',0,true,1,0.4);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        const ws2={x:700,y:616,pose:'stand',ph:0,flip:true,s:0.92};
        Rig.set('watson',t,ws2.x,ws2.y,'stand',0,true,0.92,0.4);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||ws2,{});
        Chars.watson(ctx,ws2,{rim:true});
      }
    },
    /* ---- 6-2 送药 ---- */
    {
      drip:true, fog:0.24,
      subs:[
        '我把药剂装进一个小瓶，附上一张纸条。纸条上只有一行字：',
        '"灰烬也会泄露秘密，但有些秘密值得被烧掉。"',
        '"送去贝克街。敲四下门，不多不少。如果没有人应答，就把纸条从门缝塞进去。如果影子先您一步进入房间，不要跟随。"',
        '威金斯点点头，消失在楼梯的黑暗里。他的影子跟在他身后，速度正常。这很好。'
      ],
      subsEn:[
        'I filled a little vial and pinned a note to it. The note carried a single line:',
        '"Ashes betray secrets too — but some secrets are worth burning."',
        '"Take it to Baker Street. Knock four times, no more, no less. If no one answers, slide the note under the door. And if your shadow enters the room ahead of you — do not follow it."',
        'Wiggins nodded, and vanished into the darkness of the stairs. His shadow followed at the proper speed. Good.'
      ],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const si=Engine.subI;
        if(si<=2){
          const k=ease(clamp(t/0.8,0,1));
          ctx.save(); ctx.globalAlpha=k;
          ctx.translate(500,360); ctx.scale(3.4,3.4);
          Props.vial(ctx,0,0,1,true);
          ctx.restore();
          ctx.save();
          ctx.translate(830,340); ctx.rotate(-0.04); ctx.scale(0.9+0.1*k,0.9+0.1*k);
          ctx.fillStyle='#cfc6a4'; ctx.fillRect(-180,-70,360,140);
          ctx.strokeStyle='rgba(120,100,60,0.4)'; ctx.strokeRect(-180,-70,360,140);
          ctx.fillStyle='rgba(46,150,100,0.95)';
          ctx.font='italic 20px Georgia,"Songti SC","SimSun",serif';
          ctx.textAlign='center';
          ctx.fillText('灰烬也会泄露秘密，',0,-12);
          ctx.fillText('但有些秘密值得被烧掉。',0,26);
          ctx.restore();
        }else{
          const wx=lerp(300,1340,clamp((t-0.5)/2.2,0,1));
          const ws={x:wx,y:614,pose:'walk',ph:t*8,flip:false,s:1.06};
          Rig.set('wiggins',t,wx,614,'walk',t*8,false,1.06,0.35);
          drawShadowOf(ctx,Chars.wiggins,Rig.at('wiggins',t)||ws,{});
          Chars.wiggins(ctx,ws,{rim:true});
          const hs={x:560,y:616,pose:'stand',ph:0,flip:false,s:1};
          Chars.holmes(ctx,hs,{rim:true,t:t});
          const ws2={x:700,y:616,pose:'stand',ph:0,flip:false,s:0.92};
          Chars.watson(ctx,ws2,{rim:true});
        }
      }
    },
    /* ---- 6-3 贝克街 221B 门前（敲四下） ---- */
    {
      fog:0.6, amb:0.42,
      subs:[
        '贝克街。雾从河上漫过来，把门牌泡得发暗。',
        '四下敲门。不多不少。没有人应答。威金斯把纸条从门缝塞了进去。',
        '门里很安静。安静得像有人正站在门的另一侧，低着头，听。'
      ],
      subsEn:[
        'Baker Street. Fog off the river had darkened the brass of the number plate.',
        'Four knocks. No more, no less. No one answered. Wiggins slid the note under the door.',
        'Inside, silence. A silence like someone standing on the other side of the door, head bowed, listening.'
      ],
      draw(ctx,t){
        const S=Scenes.bakerStreet(); S.draw(ctx,t);
        const si=Engine.subI;
        // 威金斯走上台阶到门前
        const wx=t<2.0?lerp(300,560,ease(t/2.0)):560;
        const wy=lerp(690,648,clamp(t/2.0,0,1));
        const ws={x:wx,y:wy,pose:t<2.0?'walk':'stand',ph:t*7,flip:false,s:0.8};
        Rig.set('wiggins',t,wx,wy,ws.pose,t*7,false,0.8,0.35);
        drawShadowOf(ctx,Chars.wiggins,Rig.at('wiggins',t)||ws,{lampX:420});
        Chars.wiggins(ctx,ws,{rim:true});
        // 敲门触发
        if(this._lastSub===undefined) this._lastSub=-1;
        if(si===1&&this._lastSub===0){
          AudioSys.knock4(()=>Engine.doShake(2.6));
          this._knockT=t;
        }
        this._lastSub=si;
        // 纸条塞进门缝（si>=1）
        if(si>=1){
          const k=clamp((t-this._knockT!==undefined?(t-this._knockT):0)/1.6,0,1);
          if(k>0.2){
            const px=lerp(660,575,clamp((k-0.2)/0.8,0,1));
            ctx.save();
            ctx.translate(px,634); ctx.rotate(-0.03);
            ctx.fillStyle='rgba(214,205,176,0.92)';
            ctx.fillRect(-34,-8,68,12);
            ctx.restore();
          }
        }
        // 门内安静的压迫感（si>=2）
        if(si>=2){
          glow(ctx,640,470,140,'rgba(90,230,150,$A)',0.10+0.05*Math.sin(t*1.7));
        }
      }
    },
    /* ---- 6-4 四下敲门（全片最重的音效） ---- */
    {
      drip:true, fog:0.3, amb:0.6,
      subs:[
        '华生站在我身后。他的手放在我的肩膀上，很轻，像一片羽毛。 "您害怕吗？" "我怕的是习惯了不害怕。" 他笑了。 "那就好。"',
        '门被敲响了。四下。不多不少。',
        '我们看着彼此。地下室的灯是绿色的，但我们的影子还慢半拍。这很好。这说明我们还在这里，还是人类，还能选择。',
        '"去开门吧。"华生说。 "您不去？" "我是医生。"他说，"我需要记住您作为人类的样子。"'
      ],
      subsEn:[
        'Watson stood behind me, his hand resting on my shoulder, light as a feather. "Are you afraid?" "I am afraid of getting used to it." He laughed. "Then it is well."',
        'The door was struck. Four times. No more, no less.',
        'We looked at each other. The basement lamp burned green, but our shadows still lagged half a beat. Good. It meant we were still here — still human, still able to choose.',
        '"Go and open it," said Watson. "You will not come?" "I am a doctor," he said. "I need to remember what you looked like as a human."'
      ],
      draw(ctx,t,dt){
        const S=Scenes.basement(); S.draw(ctx,t);
        const P=S.pts;
        const si=Engine.subI;
        if(this._lastSub===undefined) this._lastSub=-1;
        if(si===1&&this._lastSub===0){
          AudioSys.knock4(()=>Engine.doShake(3.6));
          this._knockT=t;
        }
        if(si===1&&this._knockT!==undefined&&t<this._knockT+3.6){
          const ph2=(t-this._knockT)%0.85;
          if(ph2<0.15){
            ctx.fillStyle='rgba(140,240,180,0.5)';
            ctx.fillRect(52,518,98,3);
          }
        }
        this._lastSub=si;
        const hs={x:640,y:616,pose:'stand',ph:0,flip:false,s:1};
        Rig.set('holmes',t,hs.x,hs.y,'stand',0,false,1,0.4);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{});
        Chars.holmes(ctx,hs,{rim:true,t:t,smoke:true});
        const ws={x:760,y:618,pose:'stand',ph:0,flip:true,s:0.92};
        Rig.set('watson',t,ws.x,ws.y,'stand',0,true,0.92,0.4);
        drawShadowOf(ctx,Chars.watson,Rig.at('watson',t)||ws,{});
        Chars.watson(ctx,ws,{rim:true});
        if(si===0||si===2){
          glow(ctx,700,520,26,'rgba(200,255,220,$A)',0.10);
        }
        if(si>=1){
          const fogK=0.10+0.06*Math.sin(t*1.2);
          glow(ctx,100,410,180,'rgba(90,230,150,$A)',fogK);
        }
      }
    },
    /* ---- 6-5 开门：雾涌进来（留白终幕） ---- */
    {
      fog:0.5, subs:[], auto:10, amb:0.7, hb:60, cam:[[0,640,420,1],[9,505,420,1.28]],
      draw(ctx,t){
        const S=Scenes.basement(); S.draw(ctx,t);
        const k1=ease(clamp(t/2.2,0,1));
        const hx=lerp(640,330,k1);
        const hs={x:hx,y:616,pose:k1<1?'walk':'handout',ph:t*6,flip:true,s:1,
          lean:k1<1?0:0.04*Math.sin(t*9)};
        Rig.set('holmes',t,hx,616,hs.pose,t*6,true,1,0.4);
        drawShadowOf(ctx,Chars.holmes,Rig.at('holmes',t)||hs,{});
        Chars.holmes(ctx,hs,{rim:true,t:t});
        const ws={x:780,y:618,pose:'stand',ph:0,flip:true,s:0.92};
        Chars.watson(ctx,ws,{rim:true});
        const open=clamp((t-2.6)/1.2,0,1);
        const doorLight=0.3+0.5*open;
        ctx.fillStyle=`rgba(150,255,195,${doorLight*0.8})`;
        ctx.fillRect(52,300,98,220*(0.2+0.8*open));
        if(t>2.6){
          Fog.setIntensity(0.5+open*1.6);
          Fog.surge(100);
        }
        if(t>4){
          if(!this._petals) this._petals=[];
          if(this._petals.length<40&&Math.random()<0.5){
            Fx.spawn(this._petals,60+Math.random()*300,380+Math.random()*200,
              {vx:14+Math.random()*22,vy:-4+Math.random()*8,g:2,r:2.2+Math.random()*1.8,
               life:5,col:'rgba(232,224,228,',sway:8});
          }
          Fx.drawPool(ctx,this._petals,1/60);
        }
        if(t>5.2){
          const k=ease(clamp((t-5.2)/1.6,0,1));
          ctx.save(); ctx.textAlign='center';
          ctx.fillStyle=`rgba(220,255,235,${0.9*k})`;
          ctx.font='italic 26px Georgia,"Songti SC","SimSun",serif';
          ctx.fillText('而在雾里，我闻到了茉莉花。',640,240);
          ctx.font='italic 16px Georgia,serif';
          ctx.fillStyle=`rgba(200,235,215,${0.7*k})`;
          ctx.fillText('And in the fog, I smelled jasmine.',640,280);
          ctx.restore();
        }
      },
      enter(){
        AudioSys.sting();
      }
    },
    /* ---- 尾声：Fin ---- */
    {
      fog:0.9, subs:[], auto:0.01,
      draw(ctx,t){
        ctx.fillStyle='#020504'; ctx.fillRect(0,0,1280,720);
      },
      enter(){
        AudioSys.setMood('quiet'); AudioSys.setHeartbeat(0); AudioSys.setDrip(false); AudioSys.setAmb(0.15);
        if(Engine._exporting) setTimeout(()=>Engine.stopExport(),4000);   // 导出录制在致谢卡停留 4 秒后自动收尾
        const cr=Engine.$.credits;
        cr.innerHTML=
          '<div class="fin">— Fin —</div>'+
          '<div class="line">绿血的拯救</div>'+
          '<div class="dim">The Salvation of Green Blood · A side story to Neil Gaiman\'s <i>A Study in Emerald</i></div>'+
          '<div class="line" style="margin-top:18px">原作者</div>'+
          '<div class="dim" style="margin-top:14px">动画改编 · 分镜与代码 · ZCode</div>'+
          '<button id="btnAgain">再 看 一 遍</button>';
        cr.classList.add('show');
        document.getElementById('btnAgain').addEventListener('click',()=>location.reload());
      }
    }
  ]
});
