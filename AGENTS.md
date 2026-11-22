# 绿血的拯救 · 网页动画短片（详档）

原作者的小说《绿血的拯救》（尼尔·盖曼《绿字的研究》番外，六章约 1.07 万字）改编的纯前端网页动画短片。序幕 + 六幕 + 尾声，全程约 8 分钟，点击/空格推进，支持章节跳转、自动播放、静音。

## 运行

- **双击 `启动.bat`**：先起本地 TTS 服务器（`run-server.bat` 守护循环包着 `server.py`，Edge 神经语音）再开 `index.html`
- 服务器：`E:\Ana\python.exe server.py` → http://127.0.0.1:8945/（静态文件 + `/tts?text=..&voice=..&rate=..` 接口，mp3 缓存于 `tts_cache/`，CORS 全开支持 file:// 直连）
- 无服务器时页面照常可玩：配音自动回退到本机 speechSynthesis 声源（惠惠/康康/瑶瑶）
- 依赖：`E:\Ana` 已装 `edge-tts`（pip），需联网访问微软语音端点；零图片/音频素材（语音即时合成）
- **历史版本存档**：`E:\zcode\玩\绿血的拯救_v2.4存档\`（v2.5 镜头语言加入前的完整快照，可整目录直接打开回滚）

## 文件结构

```
index.html          页面骨架（canvas + 广告牌/双语字幕/致谢卡 DOM）
css/style.css       报纸广告牌、中英字幕、控制按钮样式
js/audio.js         WebAudio 合成：底噪/心跳/滴水/烧纸/敲门/小提琴/重音 + 配音三引擎调度（神经/本机/我的录音）
js/voicemine.js     用户录音：IndexedDB 持久化 + MediaRecorder + 静音自动停止
js/gfx.js           绘图原语 + Rig(影子历史缓冲="慢半拍"机制) + humanoid 系剪影角色（含发型） + 道具 + 特效 + 绿雾
js/scenes.js        七个场景：地下室/剧院后台/酒馆/卧室/王子房间/街道/门墙（静态层预渲染+动态灯光）
js/scenes2.js       五个新场景：伦敦报纸墙/楼梯间/剧院舞台/伦敦夜景/贝克街 221B
js/engine.js        引擎：幕/节拍状态机、打字机+英文副行、淡入淡出、四下敲门、章节菜单、TTS 调度、rAF 看门狗
js/acts/*.js        序幕 + 第一~六幕 + 尾声（每幕 = 广告牌{b,en,w} + 节拍数组{subs,subsEn,draw,enter,fog,hb,auto}）
原著全文.txt         小说全文（自 docx 提取）
分镜脚本.md          六幕节拍表+视觉规范+验收标准（v1；v2 已扩场景与双语）
```

## 核心机制

- **影子慢半拍**：每个角色每帧把 `{x,y,pose,ph,flip}` 快照推入 `Rig` 历史缓冲，影子副本渲染 `t-lag` 时刻的插值快照。老鼠 lag=1s、路人 0.35s、主角 0.4-0.5s、影子生物 0（它就是快的那半拍）。
- **节拍推进**：点击 → 打字未完先补完 → 下一行 → 下一节拍（0.6s 淡出淡入）→ 下一幕广告牌。无字幕节拍用 `auto:N` 秒自动推进（4-3 处决、6-5 开门）。
- **中英双语**：`subs`（中文）打字机逐字浮现；打完后 `subsEn`（英文）淡入副行。广告牌 `b`+`en` 双语正文。
- **镜头语言**：beat 可带 `cam:[[t,lookX,lookY,zoom],...]` 关键帧，引擎 smoothstep 插值 lookAt+zoom，渲染时 `translate(640,360)/scale(z)/translate(-lx,-ly)`（场景与雾都在镜头空间，vignette 之外）。**约束：lookAt 必须在 [640/z,1280-640/z]×[360/z,720-360/z] 内，越界会露出场景外黑边**。对话镜头保持静机位，动镜头只在 8 个关键镜头（序幕/1-1/1-5/2-0/3-3/4-3/5-3/6-5）。
- **画面精修层（v2.7）**：① 体积光 `Fx.lightCone(ctx,ax,apexY,w0,baseY,w1,color,alpha)`（screen 叠加，7 处接入）；② 接触阴影 humanoid `groundShadow:true`（preset 默认开，影子副本 false）；③ 呼吸/重心微移用 `o.t`（不传 t 则静止）；④ 烟斗烟 `smoke:true`+`t`（无状态飘散圈）；⑤ 情绪色调呼吸 render 按 `AudioSys._mood` 叠 screen 色调；⑥ 粉笔书写 `Fx.chalkStroke/chalkPartial`+笔画数据（4-3 Rache，每字母 grind 刮擦）。
- **资源缓存**：index.html 资源引用带 `?v=26`；改 js/css 后需 bump 版本参数（或用 bump_ver.py），否则浏览器磁盘缓存抱旧文件不放（server 已加 Cache-Control:no-store 双保险）。
- **中文配音（三引擎）**：`配音:XX ▾` 下拉菜单。**我的声音**：`VoiceMine` 录音工作台（"🎙 录我的"按钮），103 句逐句录制（MediaRecorder+静音 1.7s 自动停），IndexedDB `greenblood_v1/takes` 持久化，key=`a{幕}b{拍}s{行}`；未录句静默+字幕照常。**神经引擎**：14 个 Edge 神经声分两组（标准 6 + 方言港台 8）经 `server.py /tts` 播 mp3，预取下一句零延迟。**本机引擎**：speechSynthesis 离线声。任一失败无缝回退。"语速:慢/中/快"两引擎各自映射。录制工作台打开时会静音环境音、关自动播放，关闭后恢复。
- **四下敲门**：`AudioSys.knock4(onEach,onDone)` 一声一停 0.85s，每声触发 `Engine.doShake(3.4)`；序幕一次、贝克街一次（威金斯送信）、第六幕一次（呼应"四下，不多不少"）。
- **发型语言**：humanoid 的 `hair` 参数（剪影头顶形状）：`short` 军式平顶+鬓角（华生）、`messy` 三鼓包乱发（福尔摩斯）、`long` 及肩垂落（王子）、威金斯用 `cap`。头型为椭圆（rx 0.92 / ry 1.08 headR），避免正圆的"鸡蛋感"。
- **后台广播剧模式**：rAF 停摆（pane 切后台）时看门狗自动挂兜底时钟，动画以 ~1fps 继续推进，配音照常——切走可以"听"，切回来无缝接着看。

## 验收状态（2026-11-15）

- [x] 序幕+六幕+尾声全部节拍浏览器实拍验证（截图逐镜头核对）
- [x] 影子慢半拍 ≥3 处（老鼠/威金斯/主角/街道拉长影/影子生物）
- [x] 四下敲门节奏正确（一声一停）
- [x] 结尾留白（门开、雾涌、茉莉花瓣、"哪一句？"不回答）
- [x] file:// 双击可玩（相对路径零依赖）

## 踩坑留痕（修过的 bug）

1. **高 DPI 画面被裁**：`fit()` 只设了 `ctx.setTransform(ss,...)` 没同步 `canvas.width=W*ss` backing store，125% 缩放下右下 20% 全被裁掉。backing store 必须随 ss 放大。
2. **节拍切换黑屏**：`nextBeat` 回调里只 `loadBeat()` 没接 `fadeIn()`，第一幕切第二幕后永久黑屏。
3. **影子双重变换**：`shadowFigure` 自己 translate+scale 后又调 `humanoid`（内部也 translate+scale），坐标被镜像两次，躯干画到画布外只剩锯齿下摆。修法：humanoid 自带变换，外层不要包裹。
4. **TDZ 崩渲染循环**：beat draw 里用了声明前的 const（`hasFace`），rAF 循环直接死亡全屏黑。beat.draw 抛错会杀死整个渲染链，排查用 `Engine.beat.draw(ctx,1)` 手动执行看报错。
5. **影子方向反了**：光在 640，人物在其左侧时影子应投向左，初版 lampDir 写反。
6. **credits 残留**：尾声致谢卡只有 add 没有 remove，跳章时叠在画面上。已在 `loadAct` 统一移除 titleUI/credits。
7. **IAB 后台冻结（重要）**：ZCode 内置浏览器 pane 切到后台时，`document.hidden` 仍报 false 但 **rAF 完全停摆**，动画冻结且配音与画面脱节。解法：自愈看门狗 `setInterval(1s)` 监测 rAF 心跳（`_rafAlive`），停摆 >1.3s 就挂兜底时钟（100ms interval，后台被节流到 ~1s，dt 放宽 0.5s 保真推进），rAF 恢复后 ticker 自拆。**不要相信 visibilityState，只信 rAF 心跳。**
8. **speechSynthesis voices 异步**：voices 列表加载晚于 UI 初始化，按钮标签要挂在 `onvoiceschanged` 上双向刷新（有→"开"，无→"无"）。
9. **IAB 后台反复 discard/恢复**：pane 切后台时页面可能被整页回收重载（DOM/JS 全重置），自动化验证需每步确认页面新鲜度；前台正常使用不受影响。
10. **edge-tts 合成是网络调用**：首次合成一句约 0.5-2s，`tts_cache/` 哈希缓存后零延迟；server 对 502 返回文本，前端 `a.onerror` 自动回退本机声源。
11. **服务器进程管理（重要）**：不要用 ZCode 会话内后台任务（run_in_background）长驻 server.py——会被宿主环境**静默终止**（exit 1、日志无报错）。正解：`start "GreenBloodTTS" /min run-server.bat` 分离出独立最小化窗口，`run-server.bat` 里 `:loop → python → goto loop` 做守护自愈；`启动.bat` 走同一路径。
12. **Windows 客户端断连**：浏览器切后台/重载会掐断进行中的响应，`wfile.write` 抛 `ConnectionAbortedError(10053)`；必须在 `handle_one_request` 和 `do_GET` 层吞掉，否则线程异常刷屏甚至拖垮进程。
13. **部署前敏感信息扫描（血泪）**：作品致谢卡里的作者姓名/学院班级/学号被一并公开上传——部署前必须扫描所有待传文件，姓名/学号/班级/邮箱/路径等一律视为待授权个人信息，未经用户明确点头不出本地；事故处置顺序=转私有→公开面清名→历史强制替换→文件清洗（全过程见 STATUS.md 隐私事故节）

## 扩展指南

- 加一幕：`js/acts/` 新建文件 `Engine.register({id,title,ad,beats:[...]})`，index.html 加 `<script>`，beats 每项 `{subs:[...], draw(ctx,t), enter?, fog?, hb?, auto?, drip?, em?}`。
- 加场景：`scenes.js` 仿 basement 模式（静态层用 `mk(1280,720,fn)` 预渲染缓存 + `draw(ctx,t)` 动态灯光/尘埃），导出 `pts` 锚点供角色站位。
- 新姿势：humanoid 的 switch 里加 case（脚/手坐标以 h 为单位），连续动画用 `'arm'` pose + `armK`（0-2 插值）。
- 想加中文配音：`AudioSys` 加 speechSynthesis 通道即可，字幕文本就在各 act 的 subs 里。
