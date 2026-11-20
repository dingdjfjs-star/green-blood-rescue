/* WebAudio 合成音效（零外部素材） */
const AudioSys = {
  ctx:null, master:null, muted:false,
  drone:null, droneGain:null, ambTarget:0.4,
  hbTimer:null, hbBpm:0,
  dripTimer:null,
  noiseBuf:null,

  ensure(){
    if(this.ctx) { if(this.ctx.state==='suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted?0:0.9;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp); comp.connect(this.ctx.destination);
    // 噪声缓冲
    const len = this.ctx.sampleRate*2;
    this.noiseBuf = this.ctx.createBuffer(1,len,this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    this.startDrone();
  },

  setMuted(m){ this.muted=m; if(this.master) this.master.gain.linearRampToValueAtTime(m?0:0.9, this.ctx.currentTime+0.15); },

  /* ---- 底噪：分层情绪音乐引擎（按幕切换情绪垫） ---- */
  /* 情绪预设：osc=[频率,增益]×3（两层失谐锯齿+一层次声部），cutoff=低通，
     pulse=搏动深度，pulseHz=搏动频率，lfo=呼吸滤波速率 */
  MOODS:{
    calm:   {osc:[[55,.22],[55.8,.22],[36.7,.5]],  cutoff:140, pulse:.10, pulseHz:.30, lfo:.06}, // 平静低鸣（一幕）
    mystery:{osc:[[62,.20],[93,.14],[41,.5]],      cutoff:155, pulse:.16, pulseHz:.50, lfo:.08}, // 诡秘（序幕/二幕）
    dread:  {osc:[[49,.26],[51.5,.16],[32,.55]],   cutoff:110, pulse:.26, pulseHz:.35, lfo:.05}, // 恐惧·小二度失谐（三/五幕）
    tension:{osc:[[58,.26],[61.5,.20],[39,.5]],    cutoff:175, pulse:.36, pulseHz:.80, lfo:.10}, // 紧张·渐强（四幕）
    climax: {osc:[[65,.30],[66.2,.22],[36,.55]],   cutoff:215, pulse:.44, pulseHz:1.1, lfo:.13}, // 高潮（六幕）
    quiet:  {osc:[[40,.16],[40.5,.10],[27,.38]],   cutoff:90,  pulse:0,   pulseHz:0,   lfo:.04}, // 静默（尾声）
  },
  _mood:'calm',
  setMood(name){
    this._mood=name;
    if(!this.ctx||!this._osc) return;   // 引擎未启动时先记，startDrone 时应用
    const m=this.MOODS[name]||this.MOODS.calm;
    const t=this.ctx.currentTime;
    this._lp.frequency.linearRampToValueAtTime(m.cutoff, t+2.5);
    this._pulseDepth.gain.linearRampToValueAtTime(m.pulse, t+2.5);
    this._pulseLfo.frequency.linearRampToValueAtTime(m.pulseHz, t+2.5);
    this._osc.forEach((o,i)=>{
      const e=m.osc[Math.min(i,m.osc.length-1)];
      o.frequency.linearRampToValueAtTime(e[0], t+2.5);
      this._og[i].gain.linearRampToValueAtTime(e[1], t+2.5);
    });
  },
  startDrone(){
    const c=this.ctx;
    const g=c.createGain(); g.gain.value=0;
    const pulseGain=c.createGain(); pulseGain.gain.value=1;   // 搏动（AM）
    const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=140; lp.Q.value=0.6;
    const m=this.MOODS[this._mood]||this.MOODS.calm;
    this._osc=[]; this._og=[];
    m.osc.forEach((e,i)=>{
      const o=c.createOscillator(); o.type=i<2?'sawtooth':'sine'; o.frequency.value=e[0];
      const og=c.createGain(); og.gain.value=e[1];
      o.connect(og); og.connect(lp); o.start();
      this._osc.push(o); this._og.push(og);
    });
    // 缓慢呼吸（滤波频率 LFO）
    const lfo=c.createOscillator(); lfo.frequency.value=m.lfo;
    const lg=c.createGain(); lg.gain.value=28;
    lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    // 搏动（振幅 LFO，按情绪可加深）
    const plfo=c.createOscillator(); plfo.frequency.value=m.pulseHz;
    const pd=c.createGain(); pd.gain.value=m.pulse;   // 深度
    plfo.connect(pd); pd.connect(pulseGain.gain); plfo.start();
    this._pulseDepth=pd; this._pulseLfo=plfo; this._lp=lp;
    lp.connect(pulseGain); pulseGain.connect(g); g.connect(this.master);
    this.droneGain=g;
    this.setAmb(this.ambTarget);
  },
  setAmb(v){
    this.ambTarget=v;
    if(this.droneGain) this.droneGain.gain.linearRampToValueAtTime(v*0.16, this.ctx.currentTime+2.5);
  },

  /* ---- 心跳 ---- */
  setHeartbeat(bpm){
    this.hbBpm=bpm||0;
    if(this.hbTimer){ clearInterval(this.hbTimer); this.hbTimer=null; }
    if(bpm && this.ctx){
      const interval = 60000/bpm;
      const beat=()=>{ this.thump(this.ctx.currentTime); this.thump(this.ctx.currentTime+0.16); };
      beat(); this.hbTimer=setInterval(beat, interval);
    }
  },
  thump(t){
    const c=this.ctx;
    const o=c.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(62,t); o.frequency.exponentialRampToValueAtTime(38,t+0.12);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.32,t+0.015); g.gain.exponentialRampToValueAtTime(0.0001,t+0.16);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+0.2);
  },

  /* ---- 敲门：一声，四下由 knock4 调度 ---- */
  knockOne(when, hard){
    const c=this.ctx; const t=when||c.currentTime;
    const o=c.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(95,t); o.frequency.exponentialRampToValueAtTime(42,t+0.14);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(hard?0.85:0.4,t+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+0.3);
    const n=c.createBufferSource(); n.buffer=this.noiseBuf;
    const nf=c.createBiquadFilter(); nf.type='lowpass'; nf.frequency.value=340;
    const ng=c.createGain(); ng.gain.setValueAtTime(hard?0.5:0.22,t);
    ng.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
    n.connect(nf); nf.connect(ng); ng.connect(this.master); n.start(t); n.stop(t+0.12);
  },
  /* 四下，不多不少：一声一停 */
  knock4(onEach,onDone){
    if(!this.ctx){ if(onDone)setTimeout(onDone,3400); return; }
    const t0=this.ctx.currentTime+0.15;
    for(let i=0;i<4;i++){
      const t=t0+i*0.85;
      this.knockOne(t,true);
      setTimeout(()=>{ onEach&&onEach(); }, (t-this.ctx.currentTime)*1000);
    }
    if(onDone) setTimeout(onDone, (t0-this.ctx.currentTime+4*0.85+0.35)*1000);
  },

  /* ---- 滴水 ---- */
  drip(){
    if(!this.ctx) return;
    const c=this.ctx, t=c.currentTime;
    const o=c.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(1250+Math.random()*500,t);
    o.frequency.exponentialRampToValueAtTime(210,t+0.11);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.10,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.14);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+0.16);
  },
  setDrip(on){
    if(this.dripTimer){ clearTimeout(this.dripTimer); this.dripTimer=null; }
    if(on){
      const loop=()=>{ this.drip(); this.dripTimer=setTimeout(loop, 1800+Math.random()*4200); };
      this.dripTimer=setTimeout(loop, 900+Math.random()*1500);
    }
  },

  /* ---- 烧纸嘶声 ---- */
  burn(){
    if(!this.ctx) return;
    const c=this.ctx, t=c.currentTime;
    const n=c.createBufferSource(); n.buffer=this.noiseBuf; n.loop=true;
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=850; bp.Q.value=0.8;
    const g=c.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.16,t+0.25);
    g.gain.exponentialRampToValueAtTime(0.0001,t+1.5);
    n.connect(bp); bp.connect(g); g.connect(this.master); n.start(t); n.stop(t+1.6);
  },

  /* ---- 重音：揭示时刻 ---- */
  sting(){
    if(!this.ctx) return;
    const c=this.ctx, t=c.currentTime;
    const o=c.createOscillator(); o.type='sine';
    o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(30,t+1.4);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.4,t+0.03); g.gain.exponentialRampToValueAtTime(0.0001,t+1.5);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t+1.6);
    const n=c.createBufferSource(); n.buffer=this.noiseBuf;
    const hp=c.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=2400;
    const ng=c.createGain(); ng.gain.setValueAtTime(0.0001,t);
    ng.gain.exponentialRampToValueAtTime(0.05,t+0.05); ng.gain.exponentialRampToValueAtTime(0.0001,t+0.7);
    n.connect(hp); hp.connect(ng); ng.connect(this.master); n.start(t); n.stop(t+0.8);
  },

  /* ---- 贝克街的警告：一缕小提琴（三全音双音）---- */
  violin(){
    if(!this.ctx) return;
    const c=this.ctx, t=c.currentTime;
    [392,554.4].forEach(f=>{
      const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=f;
      const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1100;
      const g=c.createGain();
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.028,t+0.8);
      g.gain.exponentialRampToValueAtTime(0.0001,t+2.6);
      const vib=c.createOscillator(); vib.frequency.value=5.2;
      const vg=c.createGain(); vg.gain.value=2.4;
      vib.connect(vg); vg.connect(o.frequency); vib.start(t); vib.stop(t+2.8);
      o.connect(lp); lp.connect(g); g.connect(this.master); o.start(t); o.stop(t+2.7);
    });
  },

  /* ---- 玻璃/瓷器碎裂般的抽搐声（第五幕） ---- */
  grind(){
    if(!this.ctx) return;
    const c=this.ctx, t=c.currentTime;
    const n=c.createBufferSource(); n.buffer=this.noiseBuf;
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1900; bp.Q.value=3;
    const g=c.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.09,t+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.55);
    n.connect(bp); bp.connect(g); g.connect(this.master); n.start(t); n.stop(t+0.6);
  },

  /* ---- 配音：双引擎。神经网络语音（Edge TTS，经本地 server /tts）+ 本地系统声 ---- */
  voiceOn:true, _voiceDone:true,
  engine:'neural',                 // 'neural' | 'sapi' | 'off'
  neuralId:'zh-CN-XiaoxiaoNeural',
  sapiIdx:0,                       // 本地中文声列表下标
  rateIdx:1,                       // 0 慢 / 1 中 / 2 快
  rates:[{label:'慢',v:0.82,pct:'-12%'},{label:'中',v:0.95,pct:'+0%'},{label:'快',v:1.12,pct:'+15%'}],
  NEURAL:[
    {id:'zh-CN-XiaoxiaoNeural', name:'晓晓 · 温暖女声'},
    {id:'zh-CN-YunxiNeural',    name:'云希 · 阳光男声'},
    {id:'zh-CN-YunyangNeural',  name:'云扬 · 播音男声'},
    {id:'zh-CN-XiaoyiNeural',   name:'晓伊 · 轻快女声'},
    {id:'zh-CN-YunjianNeural',  name:'云健 · 低沉男声'},
    {id:'zh-CN-YunxiaNeural',   name:'云夏 · 少年音'},
  ],
  NEURAL_X:[
    {id:'zh-CN-liaoning-XiaobeiNeural', name:'晓北 · 东北腔'},
    {id:'zh-CN-shaanxi-XiaoniNeural',   name:'晓妮 · 陕西腔'},
    {id:'zh-HK-HiuMaanNeural',          name:'曉曼 · 粤语女'},
    {id:'zh-HK-HiuGaaiNeural',          name:'曉佳 · 粤语女·明快'},
    {id:'zh-HK-WanLungNeural',          name:'雲龍 · 粤语男'},
    {id:'zh-TW-HsiaoChenNeural',        name:'曉臣 · 台湾腔'},
    {id:'zh-TW-HsiaoYuNeural',          name:'曉瑜 · 台湾腔·温柔'},
    {id:'zh-TW-YunJheNeural',           name:'雲哲 · 台湾腔男'},
  ],
  voices(){
    if(!window.speechSynthesis) return [];
    try{ return speechSynthesis.getVoices(); }catch(e){ return []; }
  },
  zhVoices(){
    return this.voices().filter(v=>/^zh/i.test(v.lang)||/中文|Chinese/i.test(v.name));
  },
  vName(v){
    const n=(v&&v.name)||'';
    if(/Huihui/i.test(n)) return '惠惠';
    if(/Kangkang/i.test(n)) return '康康';
    if(/Yaoyao/i.test(n)) return '瑶瑶';
    return (n.split(/[\s-]/)[0]||'本地声').slice(0,4);
  },
  currentName(){
    if(this.engine==='off') return '关';
    if(this.engine==='mine') return '我的声音';
    if(this.engine==='neural'){
      const n=this.NEURAL.find(v=>v.id===this.neuralId)
            ||this.NEURAL_X.find(v=>v.id===this.neuralId);
      return n?n.name.split(' ')[0]:'晓晓';
    }
    const list=this.zhVoices();
    return list.length?this.vName(list[this.sapiIdx%list.length]):'本地';
  },
  ttsUrl(text,voiceId){
    const r=encodeURIComponent(this.rates[this.rateIdx].pct);
    const t=encodeURIComponent(text.slice(0,600));
    return 'http://127.0.0.1:8945/tts?text='+t+'&voice='+encodeURIComponent(voiceId)+'&rate='+r;
  },
  /* 预取下一句（神经引擎）：后台拉取缓存，播放时零延迟 */
  prefetch(text){
    if(this.engine!=='neural'||!text) return;
    try{ fetch(this.ttsUrl(text,this.neuralId),{mode:'cors'}).catch(()=>{}); }catch(e){}
  },
  /* ---- 视频导出：把配音与音效混入一条 MediaStream（供 MediaRecorder 合流） ---- */
  _recDest:null, _voiceSrc:null,
  ensureRecordDest(){
    this.ensure();
    if(!this.ctx) return null;
    if(this._recDest) return this._recDest;
    if(!this._audioEl) this._audioEl=new Audio();   // 占位，后续 speak 复用
    this._recDest=this.ctx.createMediaStreamDestination();
    this.master.connect(this._recDest);             // 音效进流
    try{
      this._voiceSrc=this.ctx.createMediaElementSource(this._audioEl);
      this._voiceSrc.connect(this._recDest);        // 配音进流
      this._voiceSrc.connect(this.master);          // 配音照常出声
    }catch(e){}
    return this._recDest;
  },

  speak(text,onEnd,key){
    this.stopSpeak();
    const noOut=()=>{ this._voiceDone=true; onEnd&&onEnd(); return false; };
    if(this.engine==='off'||!text) return noOut();
    /* 我的录音引擎：key 对应的录音存在则播，不存在静默（字幕照常） */
    if(this.engine==='mine'){
      const blob=(window.VoiceMine&&VoiceMine.takes[key])||null;
      if(!blob) return noOut();
      try{
        const a=this._audioEl||(this._audioEl=new Audio());
        a.src=URL.createObjectURL(blob);
        a.volume=0.95;
        this._voiceDone=false;
        a.onended=()=>{ try{URL.revokeObjectURL(a.src);}catch(e){} this._voiceDone=true; onEnd&&onEnd(); };
        a.onerror=()=>{ this._voiceDone=true; onEnd&&onEnd(); };
        const p=a.play();
        if(p&&p.catch) p.catch(noOut);
        return true;
      }catch(e){ return noOut(); }
    }
    if(this.engine==='neural'){
      try{
        const a=this._audioEl||(this._audioEl=new Audio());
        a.src=this.ttsUrl(text,this.neuralId);
        a.volume=0.92;
        this._voiceDone=false;
        a.onended=()=>{ this._voiceDone=true; onEnd&&onEnd(); };
        a.onerror=()=>{ // 服务器不可达 → 无缝回退本地声
          this._voiceDone=true;
          this._sapiSpeak(text,onEnd);
        };
        const p=a.play();
        if(p&&p.catch) p.catch(()=>{ this._voiceDone=true; this._sapiSpeak(text,onEnd); });
        return true;
      }catch(e){ this._voiceDone=true; this._sapiSpeak(text,onEnd); return true; }
    }
    return this._sapiSpeak(text,onEnd);
  },
  _sapiSpeak(text,onEnd){
    if(!window.speechSynthesis){ this._voiceDone=true; onEnd&&onEnd(); return false; }
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(text);
      const list=this.zhVoices();
      const v=list.length?list[this.sapiIdx%list.length]:null;
      if(v) u.voice=v;
      u.lang=(v&&v.lang)||'zh-CN';
      u.rate=this.rates[this.rateIdx].v; u.pitch=1; u.volume=0.9;
      u.onend=()=>{ this._voiceDone=true; onEnd&&onEnd(); };
      u.onerror=()=>{ this._voiceDone=true; onEnd&&onEnd(); };
      this._voiceDone=false;
      speechSynthesis.speak(u);
      return true;
    }catch(e){ this._voiceDone=true; onEnd&&onEnd(); return false; }
  },
  stopSpeak(){
    if(window.speechSynthesis){ try{ speechSynthesis.cancel(); }catch(e){} }
    if(this._audioEl){ try{ this._audioEl.pause(); }catch(e){} }
    this._voiceDone=true;
  }
};
