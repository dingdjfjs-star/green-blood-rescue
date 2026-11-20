/* ============ engine.js：动画引擎（节拍状态机 / 打字机 / 淡入淡出 / 控制） ============ */
const Engine = {
  W:1280,H:720, cv:null, ctx:null, ss:1,
  acts:[], ai:0, bi:-1, beat:null, beatT:0, lastTs:0,
  subs:[], subI:0, typed:0, typeT:0, typing:false, typeDelays:[],
  fadeA:1, fadeDir:0, fadeCb:null,
  shake:0, autoplay:false,
  visited:{}, state:'boot', // 'boot'|'ad'|'play'|'end'
      $:{},

  register(act){ this.acts.push(act); },

  init(){
    this.cv=document.getElementById('cv');
    this.ctx=this.cv.getContext('2d');
    this.$={
      stage:document.getElementById('stage'),
      label:document.getElementById('actLabel'),
      sub:document.getElementById('subLine'),
      subEn:document.getElementById('subLineEn'),
      ad:document.getElementById('adCard'),
      adHead:document.getElementById('adHead'),
      adBody:document.getElementById('adBody'),
      adBodyEn:document.getElementById('adBodyEn'),
      adWarn:document.getElementById('adWarn'),
      titleUI:document.getElementById('titleUI'),
      credits:document.getElementById('credits'),
      menu:document.getElementById('chapterMenu'),
      studio:document.getElementById('studio'),
      stLine:document.getElementById('stLine'),
      stLineEn:document.getElementById('stLineEn'),
      stStatus:document.getElementById('stStatus'),
      stProg:document.getElementById('stProg'),
      stRec:document.getElementById('stRec'),
    };
    this.fit(); window.addEventListener('resize',()=>this.fit());
    this.bindInput();
    this._tickFallback=null; this._rafAlive=performance.now();
    document.addEventListener('visibilitychange',()=>this._watchdog());
    VoiceMine.loadAll();   // 预载用户录音（IndexedDB），"我的声音"引擎播放时立即可用
    this.loadAct(0);
    requestAnimationFrame(ts=>this.loop(ts));
    /* 自愈看门狗：IAB 后台时 document.hidden 可能为 false 但 rAF 停摆——
       监测 rAF 心跳，停了就挂兜底时钟，恢复就拆掉 */
    this._watch=setInterval(()=>{
      if(this._tickFallback) return;
      if(performance.now()-this._rafAlive>1300) this._onVis();
    },1000);
  },

  /* rAF 心跳停摆时的兜底：低频时钟继续推进（音频与字幕同步），恢复后自动拆除。
     后台 tick 被浏览器节流到约 1s，dt 放宽到 0.5s 保证剧情时间与真实时间同步（广播剧模式） */
  _onVis(){
    if(this._tickFallback) return;
    this._lastWall=performance.now();
    this._tickFallback=setInterval(()=>{
      if(performance.now()-this._rafAlive<1200){  // rAF 恢复了
        clearInterval(this._tickFallback); this._tickFallback=null; return;
      }
      const now=performance.now();
      const dt=Math.min(0.5,(now-this._lastWall)/1000);
      this._lastWall=now; this.lastTs=now;
      this.update(dt); this.render();
    },100);
  },

  fit(){
    const s=Math.min(window.innerWidth/this.W, window.innerHeight/this.H);
    const w=Math.floor(this.W*s), h=Math.floor(this.H*s);
    this.$.stage.style.width=w+'px'; this.$.stage.style.height=h+'px';
    this.cv.style.width=w+'px'; this.cv.style.height=h+'px';
    this.ss=Math.min(window.devicePixelRatio||1,2)*s;
    this.cv.width=Math.round(this.W*this.ss);   // backing store 必须同步放大，否则高 DPI 下画面被裁
    this.cv.height=Math.round(this.H*this.ss);
  },

  bindInput(){
    const adv=()=>this.advance();
    this.cv.addEventListener('click',adv);
    document.getElementById('adCard').addEventListener('click',adv);
    window.addEventListener('keydown',e=>{
      if(e.code==='Space'||e.code==='Enter'||e.code==='ArrowRight'){ e.preventDefault(); adv(); }
    });
    document.getElementById('btnMute').addEventListener('click',e=>{
      e.stopPropagation(); AudioSys.ensure(); AudioSys.setMuted(!AudioSys.muted);
      e.target.textContent='音效 '+(AudioSys.muted?'关':'开');
    });
    document.getElementById('btnAuto').addEventListener('click',e=>{
      e.stopPropagation(); this.autoplay=!this.autoplay;
      e.target.textContent='自动 '+(this.autoplay?'开':'关');
      if(!this.autoplay) AudioSys.stopSpeak();
    });
    /* 配音下拉菜单：神经声源 + 本机声源 + 关 */
    const bv=document.getElementById('btnVoice');
    const vm=document.getElementById('voiceMenu');
    const refreshVoiceBtn=()=>{ bv.textContent='配音:'+AudioSys.currentName(); };
    const buildVoiceMenu=()=>{
      vm.innerHTML='';
      // 若当前选中的声源已被移除，回退到默认标准声线
      if(AudioSys.engine==='neural' && !AudioSys.NEURAL.find(v=>v.id===AudioSys.neuralId)){
        AudioSys.neuralId=AudioSys.NEURAL[0].id;
      }
      const mkHead=t=>{ const d=document.createElement('div'); d.className='vmHead'; d.textContent=t; vm.appendChild(d); };
      const mkItem=(label,fn,dim)=>{
        const b=document.createElement('button');
        b.textContent=label; if(dim) b.className='vmDim';
        if(!dim) b.addEventListener('click',()=>{ fn(); vm.classList.remove('open'); refreshVoiceBtn(); });
        vm.appendChild(b);
      };
      mkHead('我的声音');
      mkItem('🎙 使用我自己的声音（先点“🎙 录我的”录制）'+(AudioSys.engine==='mine'?' ✓':''),()=>{
        AudioSys.engine='mine'; AudioSys.stopSpeak();
        if(!Object.keys(VoiceMine.takes||{}).length){
          Engine.$.sub.textContent='（还没有录音：先点右上角“🎙 录我的”进入工作台录制）';
        }
      });
      mkHead('✦ 神经网络 · 标准声线');
      const mkNeural=n=>{
        const on=AudioSys.engine==='neural'&&AudioSys.neuralId===n.id;
        mkItem(n.name+(on?' ✓':''),()=>{
          AudioSys.engine='neural'; AudioSys.neuralId=n.id;
          AudioSys.ensure(); AudioSys.stopSpeak();
          AudioSys.speak('您好，我是'+n.name.split(' ')[0]+'。');
        });
      };
      AudioSys.NEURAL.forEach(mkNeural);
      mkHead('本机声源 · 离线可用');
      const list=AudioSys.zhVoices();
      if(!list.length) mkItem('（无本地中文声）',null,true);
      list.forEach((v,i)=>{
        const on=AudioSys.engine==='sapi'&&AudioSys.sapiIdx%list.length===i;
        mkItem(AudioSys.vName(v)+(on?' ✓':''),()=>{
          AudioSys.engine='sapi'; AudioSys.sapiIdx=i;
          AudioSys.ensure(); AudioSys.stopSpeak();
          AudioSys.speak('您好，我是'+AudioSys.vName(v)+'。');
        });
      });
      const sep=document.createElement('div'); sep.className='vmHead'; vm.appendChild(sep);
      mkItem('✕ 关闭配音',()=>{ AudioSys.engine='off'; AudioSys.stopSpeak(); });
    };
    bv.addEventListener('click',e=>{
      e.stopPropagation(); AudioSys.ensure();
      buildVoiceMenu(); vm.classList.toggle('open');
    });
    document.addEventListener('click',()=>vm.classList.remove('open'));
    vm.addEventListener('click',e=>e.stopPropagation());
    if(window.speechSynthesis){
      speechSynthesis.onvoiceschanged=()=>refreshVoiceBtn();
    }
    refreshVoiceBtn();
    const br=document.getElementById('btnRate');
    br.addEventListener('click',e=>{
      e.stopPropagation();
      AudioSys.rateIdx=(AudioSys.rateIdx+1)%AudioSys.rates.length;
      br.textContent='语速:'+AudioSys.rates[AudioSys.rateIdx].label;
    });
    /* 录音工作台 */
    const bs=document.getElementById('btnStudio');
    bs.addEventListener('click',e=>{ e.stopPropagation(); AudioSys.ensure(); this.openStudio(); });
    const lines=()=>this.allLines();
    const curKey=()=>{ this._stIdx=clamp(this._stIdx,0,lines().length-1); return lines()[this._stIdx]; };
    document.getElementById('stPrev').addEventListener('click',()=>{ this._stIdx=Math.max(0,this._stIdx-1); this.renderStudio(); });
    document.getElementById('stNext').addEventListener('click',()=>{ this._stIdx=Math.min(lines().length-1,this._stIdx+1); this.renderStudio(); });
    document.getElementById('stRec').addEventListener('click',()=>{
      const cur=curKey();
      if(VoiceMine.recording){ VoiceMine.stop(); return; }
      VoiceMine.start(cur.key,
        ()=>this.renderStudio(),
        msg=>{ this.$.stStatus.textContent='⚠ '+msg; this.$.stStatus.className=''; });
      // 录制中状态需要一拍后才出现
      setTimeout(()=>this.renderStudio(),150);
    });
    document.getElementById('stPlay').addEventListener('click',()=>{
      const cur=curKey();
      const blob=VoiceMine.takes[cur.key];
      if(!blob){ this.$.stStatus.textContent='这一句还没录'; return; }
      AudioSys.stopSpeak();
      const a=new Audio(URL.createObjectURL(blob));
      a.play();
    });
    document.getElementById('stDel').addEventListener('click',()=>{
      const cur=curKey();
      VoiceMine.remove(cur.key).then(()=>this.renderStudio());
    });
    document.getElementById('stJump').addEventListener('click',()=>{
      const all=lines();
      for(let i=0;i<all.length;i++){
        if(!VoiceMine.takes[all[i].key]){ this._stIdx=i; break; }
      }
      this.renderStudio();
    });
    document.getElementById('stClose').addEventListener('click',()=>this.closeStudio());
    const bc=document.getElementById('btnChapters');
    bc.addEventListener('click',e=>{ e.stopPropagation();
      this.buildChapters(); this.$.menu.classList.toggle('open'); });
    document.addEventListener('click',()=>this.$.menu.classList.remove('open'));
    this.$.menu.addEventListener('click',e=>e.stopPropagation());
  },

  buildChapters(){
    this.$.menu.innerHTML='';
    this.acts.forEach((a,i)=>{
      const b=document.createElement('button');
      const unlocked=this.visited[i]||i<=this.ai;
      b.textContent=(unlocked?'':'· ')+a.title;
      if(i===this.ai) b.className='now';
      if(!unlocked){ b.className='locked'; }
      else b.addEventListener('click',()=>{
        this.$.menu.classList.remove('open');
        this.state='play'; this.$.ad.classList.remove('show');
        this.fadeOut(()=>this.loadAct(i));
      });
      this.$.menu.appendChild(b);
    });
  },

  /* ---------- 推进 ---------- */
  advance(){
    AudioSys.ensure();
    if(this.state==='ad'){ this.closeAd(); return; }
    if(this.state!=='play') return;
    if(this.fadeDir) return;
    if(this.typing){
      this.typed=this.subs[this.subI].length; this.typing=false;
      this.paintSub(); this.paintSubEn(); return;
    }
    if(this.subI<this.subs.length-1){
      AudioSys.stopSpeak();
      this.subI++; this.startType(); return;
    }
    this.nextBeat();
  },
  nextBeat(){
    const act=this.acts[this.ai];
    if(this.bi<act.beats.length-1){
      AudioSys.stopSpeak();
      this.fadeOut(()=>{ this.bi++; this.loadBeat(); this.fadeIn(); });
    }else{
      if(this.ai<this.acts.length-1){
        AudioSys.stopSpeak();
        this.fadeOut(()=>this.loadAct(this.ai+1));
      }
    }
  },

  /* ---------- 幕/节拍装载 ---------- */
  loadAct(i){
    this.ai=i;
    const act=this.acts[i];
    this.visited[i]=1;
    this.$.titleUI.classList.remove('show');   // 跳章/换幕时收起片头按钮层
    this.$.credits.classList.remove('show');   // 与尾声致谢卡
    this.$.label.textContent=act.title;
    AudioSys.setMood(act.mood||'calm');   // 分层情绪音乐：按幕切换情绪垫
    Fog.reset(); Fog.setIntensity(act.fog!==undefined?act.fog:0.4);
    AudioSys.setAmb(act.amb!==undefined?act.amb:0.4);
    if(act.ad){
      this.state='ad'; this.fadeA=1; this.fadeDir=0;
      this.showAd(act.ad);
    }else{
      this.state='play'; this.bi=0;
      this.beat=null; this.loadBeat();
      this.fadeIn();
    }
  },
  showAd(ad){
    this.$.adHead.textContent=ad.h||'';
    this.$.adBody.textContent=ad.b||'';
    this.$.adBodyEn.textContent=ad.en||'';
    this.$.adWarn.textContent=ad.w||'';
    this.$.ad.classList.add('show');
    this._adT=0; this._adVoice=false; this._adStart=performance.now();
    if(this.autoplay){
      this._adVoice=AudioSys.speak(ad.b||'');
    }
  },
  closeAd(){
    AudioSys.stopSpeak();
    this.$.ad.classList.remove('show');
    this.state='play'; this.bi=0;
    this.loadBeat(); this.fadeIn();
  },
  loadBeat(){
    const act=this.acts[this.ai];
    const b=act.beats[this.bi];
    this.beat=b; this.beatT=0;
    Rig.map={}; // 每个节拍是独立机位，影子历史重置
    this._camKeys=b.cam||null;   // 镜头关键帧 [t, lookX, lookY, zoom]
    this.cam={lx:640,ly:360,z:1};
    this.subs=b.subs||[];
    this.subsEn=b.subsEn||[];
    this.subI=0;
    Fog.setIntensity(b.fog!==undefined?b.fog:(act.fog!==undefined?act.fog:0.4));
    AudioSys.setDrip(!!b.drip);
    if(b.hb!==undefined) AudioSys.setHeartbeat(b.hb);
    if(b.subs&&b.subs.length) this.startType();
    else { this.$.sub.textContent=''; this.$.subEn.textContent=''; this.$.sub.className=''; }
    if(b.enter) b.enter(this);
  },

  /* ---------- 打字机 ---------- */
  startType(){
    const line=this.subs[this.subI]||'';
    this.typeDelays=[];
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      let d=30;
      if('，、'.includes(ch)) d=150;
      else if('。！？…—'.includes(ch)) d=230;
      this.typeDelays.push(d);
    }
    this.typed=0; this.typeT=0; this.typing=true;
    this.$.subEn.textContent='';
    this._voicePending=false; this._voiceT=0;
    if(line){
      const vkey='a'+this.ai+'b'+this.bi+'s'+this.subI;
      this._voicePending=AudioSys.speak(line,null,vkey);
    }
    const nxt=this.subs[this.subI+1];
    if(nxt) AudioSys.prefetch(nxt);   // 预取下一句，神经声播放零延迟
    this.paintSub();
  },
  paintSub(){
    const line=this.subs[this.subI]||'';
    this.$.sub.textContent=line.slice(0,this.typed);
    const first=line[0]||'';
    this.$.sub.className = (first==='「'||first==='"'||first==='“')?'dialog':'';
    if(this.beat&&this.beat.em) this.$.sub.className='em';
  },
  paintSubEn(){
    this.$.subEn.textContent=this.subsEn[this.subI]||'';
  },
  holdNeed(){ const l=this.subs[this.subI]||''; return 1.0+l.length*0.048; },

  fadeOut(cb){ this.fadeDir=1; this.fadeCb=cb; },
  fadeIn(){ this.fadeDir=-1; },
  doShake(p){ this.shake=Math.max(this.shake,p); },

  /* ---------- 录音工作台 ---------- */
  allLines(){
    const out=[];
    this.acts.forEach((a,ai)=>{
      (a.beats||[]).forEach((b,bi)=>{
        (b.subs||[]).forEach((t,si)=>{
          out.push({key:'a'+ai+'b'+bi+'s'+si, text:t, en:(b.subsEn||[])[si]||''});
        });
      });
    });
    return out;
  },
  async openStudio(){
    this._studio=true;
    this.autoplay=false; document.getElementById('btnAuto').textContent='自动 关';
    AudioSys.stopSpeak(); AudioSys.setMuted(true);   // 录制期间静掉环境音
    this._stIdx=0;
    await VoiceMine.loadAll();
    this.$.studio.classList.add('show');
    this.renderStudio();
  },
  closeStudio(){
    if(VoiceMine.recording) VoiceMine.stop();
    this._studio=false;
    this.$.studio.classList.remove('show');
    AudioSys.setMuted(false);
  },
  renderStudio(){
    if(!this._studio) return;
    const lines=this.allLines();
    const cur=lines[clamp(this._stIdx,0,lines.length-1)];
    const done=Object.keys(VoiceMine.takes).length;
    this.$.stProg.textContent='已录 '+done+' / '+lines.length;
    this.$.stLine.textContent=cur.text;
    this.$.stLineEn.textContent=cur.en;
    const has=!!VoiceMine.takes[cur.key];
    if(VoiceMine.recording){
      this.$.stRec.textContent='■ 停止'; this.$.stRec.classList.add('recording');
      this.$.stStatus.textContent='● 录制中…… 读完保持安静约 2 秒自动保存';
      this.$.stStatus.className='rec';
    }else{
      this.$.stRec.textContent='● 录制'; this.$.stRec.classList.remove('recording');
      this.$.stStatus.textContent=has?'本句已录 ✓（可重录覆盖）':'这一句还没录';
      this.$.stStatus.className='';
    }
  },

  /* ---------- 主循环 ---------- */
  loop(ts){
    const dt=Math.min(0.05,(ts-this.lastTs)/1000||0.016);
    this.lastTs=ts; this._rafAlive=performance.now();
    this.update(dt); this.render();
    requestAnimationFrame(t=>this.loop(t));
  },
  update(dt){
    if(this.state==='play'){
      this.beatT+=dt;
      // 镜头关键帧插值（lookAt + zoom，smoothstep 缓动）
      if(this._camKeys&&this._camKeys.length){
        const K=this._camKeys;
        let a=K[0], b=K[K.length-1];
        if(this.beatT<=a[0]) this.cam={lx:a[1],ly:a[2],z:a[3]};
        else if(this.beatT>=b[0]) this.cam={lx:b[1],ly:b[2],z:b[3]};
        else{
          for(let i=0;i<K.length-1;i++){
            if(this.beatT>=K[i][0]&&this.beatT<=K[i+1][0]){ a=K[i]; b=K[i+1]; break; }
          }
          const k=ease(clamp((this.beatT-a[0])/Math.max(0.001,b[0]-a[0]),0,1));
          this.cam={lx:lerp(a[1],b[1],k), ly:lerp(a[2],b[2],k), z:lerp(a[3],b[3],k)};
        }
      }else this.cam={lx:640,ly:360,z:1};
    }
    Fog.update(dt);
    // 打字
    if(this.typing){
      const line=this.subs[this.subI]||'';
      this.typeT+=dt*1000;
      while(this.typed<line.length && this.typeT>=this.typeDelays[this.typed]){
        this.typeT-=this.typeDelays[this.typed]; this.typed++;
      }
      this.$.sub.textContent=line.slice(0,this.typed);
      if(this.typed>=line.length){ this.typing=false; this.paintSubEn(); }
    }
    // 广告牌自动推进（自动播放模式）
    if(this.state==='ad'&&this.autoplay){
      const voiceOK=!this._adVoice||AudioSys._voiceDone;
      if(voiceOK){
        this._adT+=dt;
        const need=6+(this.acts[this.ai].ad.b||'').length/9;
        if(this._adT>need) this.closeAd();
      }else{
        this._voiceT=(this._voiceT||0)+dt;
        if(this._voiceT>40) AudioSys._voiceDone=true;
      }
    }
    // 自动播放（读完一句再进下一句）
    if(this.state==='play'&&!this.typing&&this.autoplay&&this.subs.length){
      const voiceOK=!this._voicePending||AudioSys._voiceDone;
      if(voiceOK){
        this._autoT=(this._autoT||0)+dt;
        if(this._autoT>this.holdNeed()){ this._autoT=0; this.advance(); }
      }else{
        this._voiceT=(this._voiceT||0)+dt;
        if(this._voiceT>30) AudioSys._voiceDone=true;
      }
    }
    // 无字幕节拍的自动推进（纯视觉段落）
    if(this.state==='play'&&!this.typing&&!this.subs.length&&this.beat&&this.beat.auto){
      if(this.beatT>this.beat.auto) this.nextBeat();
    }
    // 淡入淡出
    if(this.fadeDir){
      this.fadeA+=this.fadeDir*dt/0.6;
      if(this.fadeDir>0&&this.fadeA>=1){ this.fadeA=1; this.fadeDir=0;
        const cb=this.fadeCb; this.fadeCb=null; if(cb)cb(); }
      if(this.fadeDir<0&&this.fadeA<=0){ this.fadeA=0; this.fadeDir=0; }
    }
    this.shake*=Math.pow(0.002,dt);
    if(this.shake<0.05) this.shake=0;
  },
  render(){
    const ctx=this.ctx;
    ctx.setTransform(this.ss,0,0,this.ss,0,0);
    ctx.fillStyle='#000'; ctx.fillRect(0,0,this.W,this.H);
    if(this.state==='play'||this.state==='ad'){
      ctx.save();
      if(this.shake>0){
        ctx.translate((Math.random()*2-1)*this.shake*8,(Math.random()*2-1)*this.shake*8);
      }
      // 镜头变换：lookAt 点映射到屏幕中心 + 缩放（场景与雾都在镜头空间里）
      const c=this.cam||{lx:640,ly:360,z:1};
      if(c.z!==1||c.lx!==640||c.ly!==360){
        ctx.translate(640,360);
        ctx.scale(c.z,c.z);
        ctx.translate(-c.lx,-c.ly);
      }
      if(this.beat&&this.state==='play') this.beat.draw(ctx,this.beatT);
      Fog.draw(ctx);
      ctx.restore();
      vignette(ctx);
      // 情绪色调呼吸：与分层情绪音乐联动（恐惧偏冷、紧张偏琥珀、高潮绿光呼吸）
      const gr=({dread:['95,125,155',0.05,0.16], tension:['175,95,55',0.05,0.5],
                 climax:['55,205,135',0.07,0.32], mystery:['55,150,110',0.03,0.1]})[AudioSys._mood];
      if(gr){
        const a=(gr[1]*(0.55+0.45*Math.sin(performance.now()/1000*TAU*gr[2]))).toFixed(3);
        ctx.save(); ctx.globalCompositeOperation='screen';
        ctx.fillStyle=`rgba(${gr[0]},${a})`;
        ctx.fillRect(0,0,this.W,this.H);
        ctx.restore();
      }
    }
    if(this.fadeA>0){
      ctx.fillStyle=`rgba(0,0,0,${Math.min(1,this.fadeA)})`;
      ctx.fillRect(0,0,this.W,this.H);
    }
  }
};
