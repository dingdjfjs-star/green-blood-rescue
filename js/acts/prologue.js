/* ============ 序幕：前情提要 → 片名 → 开始按钮 → 四下敲门 ============ */
Engine.register({
  id:'prologue', title:'序幕', mood:'mystery', fog:0.85, amb:0.25,
  beats:[
    { // P0 前情提要：30 秒讲清《绿字的研究》的世界
      fog:0.55, cam:[[0,640,360,1],[18,640,340,1.06]],
      subs:[
        '1878 年的伦敦——但不是我们的伦敦。旧日支配者七百年前降临人间，如今化身各国王室与领袖，统治着世界。大多数人已经习惯，甚至心怀感激。',
        '在这个伦敦，住在贝克街、用演绎法的"咨询侦探"，其实是莫里亚蒂；从阿富汗归来的军医，其实是莫兰上校。',
        '而真正的福尔摩斯与华生，正藏在圣贾尔斯的贫民窟里——是反抗组织"复旧党"的幽灵。这是他们的一段往事。'
      ],
      subsEn:[
        'London, 1878 — but not our London. The Old Ones came seven hundred years ago, and now rule through crowns and leaders. Most people have grown used to it. Grateful, even.',
        'In this London, the "consulting detective" of Baker Street is Moriarty; the army doctor back from Afghanistan, Colonel Moran.',
        'The real Holmes and Watson hide in the slums of St Giles — ghosts of the Restoration, the resistance that wants the world back.'
      ],
      draw(ctx,t){
        ctx.fillStyle='#020504'; ctx.fillRect(0,0,1280,720);
        const k=ease(t/2.5);
        // 七角星符印（克苏鲁式，缓慢旋转）
        const sx=640, sy=300;
        glow(ctx,sx,sy,260,'rgba(60,200,130,$A)',0.10*k);
        ctx.save(); ctx.translate(sx,sy); ctx.rotate(t*0.04);
        ctx.strokeStyle=`rgba(120,230,170,${0.16*k})`; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(0,0,150,0,TAU); ctx.stroke();
        ctx.beginPath(); ctx.arc(0,0,112,0,TAU); ctx.stroke();
        const pts=[];
        for(let i=0;i<7;i++){ const a=-Math.PI/2+i*TAU/7; pts.push([Math.cos(a)*132,Math.sin(a)*132]); }
        let idx=0; ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
        for(let i=0;i<7;i++){ idx=(idx+3)%7; ctx.lineTo(pts[idx][0],pts[idx][1]); }
        ctx.closePath(); ctx.stroke();
        // 符印上的小光点
        for(let i=0;i<7;i++){
          const a=-Math.PI/2+i*TAU/7+t*0.2;
          ctx.fillStyle=`rgba(150,255,200,${0.3+0.25*Math.sin(t*2+i)})`;
          ctx.beginPath(); ctx.arc(Math.cos(a)*150,Math.sin(a)*150,2.2,0,TAU); ctx.fill();
        }
        ctx.restore();
        // 标签
        ctx.save(); ctx.textAlign='center';
        ctx.fillStyle=`rgba(140,190,160,${0.5*k})`;
        ctx.font='15px Georgia,"Songti SC","SimSun",serif';
        ctx.letterSpacing='6px';
        ctx.fillText('前 情 提 要 · PROLOGUE',640,84);
        ctx.letterSpacing='0px';
        ctx.restore();
      }
    },
    { // P1 片名 + 开始按钮
      fog:0.9, subs:[], cam:[[0,640,380,1],[9,640,340,1.08]],
      draw(ctx,t){
        ctx.fillStyle='#020504'; ctx.fillRect(0,0,1280,720);
        const k=ease(t/2.2);
        const dy=Math.sin(t*0.6)*5;
        ctx.save(); ctx.textAlign='center';
        ctx.fillStyle=`rgba(200,240,215,${0.92*k})`;
        ctx.font='76px Georgia,"Songti SC","SimSun",serif';
        ctx.letterSpacing='10px';
        ctx.fillText('绿 血 的 拯 救',640,330+dy);
        ctx.font='22px Georgia,"Songti SC","SimSun",serif';
        ctx.fillStyle=`rgba(150,200,170,${0.7*k})`;
        ctx.fillText('—— 尼尔·盖曼《绿字的研究》番外 ——',640,398+dy);
        ctx.font='italic 17px Georgia,serif';
        ctx.fillStyle=`rgba(140,185,160,${0.5*k})`;
        ctx.fillText('The Salvation of Green Blood — a side story to A Study in Emerald',640,432+dy);
        ctx.font='19px Georgia,"Songti SC","SimSun",serif';
        ctx.fillStyle=`rgba(130,175,150,${0.55*k})`;
        ctx.letterSpacing='0px';
        ctx.textAlign='left';
        ctx.fillText('原著小说 · 原作者',30,698);
        glow(ctx,640,120+dy,230,'rgba(60,200,130,$A)',0.11*k);
        ctx.restore();
      },
      enter(){
        Engine.$.titleUI.classList.add('show');
        const btn=document.getElementById('btnStart');
        const go=()=>{
          if(Engine.state!=='play') return;
          btn.disabled=true; btn.style.opacity=0.4;
          Engine.$.titleUI.classList.remove('show');
          AudioSys.ensure();
          const t0=AudioSys.ctx.currentTime+0.2;
          AudioSys.knock4(t0);   // 声音走音频时钟调度（后台照响）
          Engine._knockSched={t0:t0,count:4,gap:0.85,i:0,
            onEach:()=>Engine.doShake(3.4), onDone:()=>Engine.advance()};
          btn.removeEventListener('click',go);
        };
        btn.addEventListener('click',go);
      }
    }
  ]
});
