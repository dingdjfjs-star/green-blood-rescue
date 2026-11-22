/* ============ voicemine.js：录制用户自己的配音（IndexedDB 持久化） ============
   VoiceMine.takes[key] = Blob（key = a{幕}b{节拍}s{行}）
   录制：getUserMedia + MediaRecorder，静音约 1.7s 自动停止保存
*/
const VoiceMine = {
  takes:{},            // key -> Blob
  stream:null, rec:null, chunks:[],
  recording:false, recKey:null, recStart:0,
  ac:null, analyser:null, _mon:null, silentMs:0,

  db(){
    return new Promise((res,rej)=>{
      const r=indexedDB.open('greenblood_v1',1);
      r.onupgradeneeded=()=>{ r.result.createObjectStore('takes'); };
      r.onsuccess=()=>res(r.result);
      r.onerror=()=>rej(r.error);
    });
  },
  async loadAll(){
    try{
      const db=await this.db();
      this.takes=await new Promise((res,rej)=>{
        const tx=db.transaction('takes','readonly');
        const st=tx.objectStore('takes');
        const out={}; const rq=st.openCursor();
        rq.onsuccess=()=>{ const c=rq.result;
          if(c){ out[c.key]=c.value; c.continue(); } else res(out); };
        rq.onerror=()=>rej(rq.error);
      });
    }catch(e){ this.takes={}; }
    return Object.keys(this.takes).length;
  },
  async save(key,blob){
    this.takes[key]=blob;
    try{
      const db=await this.db();
      await new Promise((res,rej)=>{
        const tx=db.transaction('takes','readwrite');
        tx.objectStore('takes').put(blob,key);
        tx.oncomplete=res; tx.onerror=()=>rej(tx.error);
      });
    }catch(e){ /* 内存里仍可用 */ }
  },
  async remove(key){
    delete this.takes[key];
    try{
      const db=await this.db();
      await new Promise((res,rej)=>{
        const tx=db.transaction('takes','readwrite');
        tx.objectStore('takes').delete(key);
        tx.oncomplete=res; tx.onerror=()=>rej(tx.error);
      });
    }catch(e){}
  },

  async start(key,onStop,onErr){
    if(this.recording) return false;
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
      onErr&&onErr('此环境不支持麦克风（需通过 http://127.0.0.1:8945 打开）');
      return false;
    }
    try{
      this.stream=await navigator.mediaDevices.getUserMedia({
        audio:{echoCancellation:true,noiseSuppression:true}
      });
    }catch(e){
      onErr&&onErr('麦克风未授权：请在浏览器弹窗中允许，或检查系统麦克风设置');
      return false;
    }
    this.chunks=[];
    this.rec=new MediaRecorder(this.stream);
    this.rec.ondataavailable=e=>{ if(e.data&&e.data.size) this.chunks.push(e.data); };
    this.rec.onstop=async()=>{
      const blob=new Blob(this.chunks,{type:this.rec.mimeType||'audio/webm'});
      await this.save(this.recKey||key,blob);
      try{ this.stream.getTracks().forEach(t=>t.stop()); }catch(e){}
      try{ if(this.ac) this.ac.close(); }catch(e){}
      clearInterval(this._mon);
      this.recording=false;
      onStop&&onStop(blob);
    };
    // 静音自动停止（连续约 1.7s 无声）
    this.ac=new AudioContext();
    const src=this.ac.createMediaStreamSource(this.stream);
    this.analyser=this.ac.createAnalyser(); this.analyser.fftSize=512;
    src.connect(this.analyser);
    const buf=new Uint8Array(this.analyser.frequencyBinCount);
    this.silentMs=0;
    this._mon=setInterval(()=>{
      this.analyser.getByteTimeDomainData(buf);
      let peak=0;
      for(let i=0;i<buf.length;i++) peak=Math.max(peak,Math.abs(buf[i]-128));
      if(peak<3) this.silentMs+=100; else this.silentMs=0;
      if(this.recording && this.silentMs>1700) this.stop();
    },100);
    this.recording=true; this.recKey=key; this.recStart=performance.now();
    this.rec.start();
    return true;
  },
  stop(){
    if(!this.recording) return;
    clearInterval(this._mon);
    try{ this.rec.stop(); }catch(e){}
  }
};
