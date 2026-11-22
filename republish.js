// 匿名重发：仓库转公开 + 更新描述 + 重开 Pages
const { execSync } = require('child_process');
const out = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n' }).toString();
const token = (out.match(/password=(.*)/m) || [])[1] || '';
const H = {
  'Authorization': 'Bearer ' + token.trim(),
  'Accept': 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'green-blood-republish'
};
(async () => {
  // 1. 转公开 + 更新描述（无个人信息）
  let r = await fetch('https://api.github.com/repos/dingdjfjs-star/green-blood-rescue', {
    method: 'PATCH', headers: H,
    body: JSON.stringify({
      private: false,
      description: '小说改编网页动画短片：影子慢半拍+103 句配音+双语字幕，零素材全代码绘制'
    })
  });
  console.log('PATCH public:', r.status, (await r.json().catch(() => ({}))).private);
  // 2. 重开 Pages（私有转公开后 Pages 需重新配置）
  r = await fetch('https://api.github.com/repos/dingdjfjs-star/green-blood-rescue/pages', {
    method: 'POST', headers: H,
    body: JSON.stringify({ build_type: 'legacy', source: { branch: 'main', path: '/' } })
  });
  console.log('POST pages:', r.status, r.status === 409 ? '已开启（非错误）' : '');
})();
