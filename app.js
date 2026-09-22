/* =========================================================
   そらへ — モノと思い出を手放すためのWebアプリ
   ========================================================= */

/* ---------- アプリのバージョン ---------- */
const APP_VERSION = 'v1.4.1';
(function showVersion() {
  const badge = document.getElementById('version-badge');
  if (badge) badge.textContent = APP_VERSION;
})();

/* ---------- 起動時：供養オーバーレイを確実に隠す ---------- */
// CSS の display:flex が hidden 属性を上書きするのを防ぐための保険。
(function ensureCeremonyHidden() {
  const c = document.getElementById('ceremony');
  const m = document.getElementById('ceremony-message');
  if (c) c.hidden = true;
  if (m) m.hidden = true;
})();

/* ---------- タブ切り替え ---------- */
const tabs = document.querySelectorAll('.tab');
const panels = {
  thing: document.getElementById('panel-thing'),
  memory: document.getElementById('panel-memory'),
};

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    Object.values(panels).forEach((p) => p.classList.remove('is-active'));
    panels[tab.dataset.tab].classList.add('is-active');
  });
});

/* ---------- 写真アップロード ---------- */
const dropzone = document.getElementById('thing-dropzone');
const fileInput = document.getElementById('thing-photo');
const preview = document.getElementById('thing-preview');
const hint = document.getElementById('thing-hint');
const changeHint = document.getElementById('thing-change-hint');
let uploadedImage = null; // HTMLImageElement

dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = 'var(--accent)';
});
dropzone.addEventListener('dragleave', () => {
  dropzone.style.borderColor = '';
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.style.borderColor = '';
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    const img = new Image();
    img.onload = () => {
      // 画像が正しく読み込めてから初めてプレビューを表示する
      uploadedImage = img;
      preview.src = dataUrl;
      preview.alt = file.name || '選んだ写真';
      preview.hidden = false;
      hint.hidden = true;
      changeHint.hidden = false;
      dropzone.classList.add('has-image');
    };
    img.onerror = () => {
      // 読み込めなかった場合は初期状態のまま
      resetPhotoPreview();
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

function resetPhotoPreview() {
  uploadedImage = null;
  preview.hidden = true;
  preview.removeAttribute('src');
  preview.alt = '';
  hint.hidden = false;
  changeHint.hidden = true;
  dropzone.classList.remove('has-image');
}

/* ---------- お別れメッセージ生成 ---------- */
// 手放す相手（モノ/思い出）から届く、お別れとお礼のメッセージ。
//
// 【現在の実装：モック】
// 生成AIのAPIは連携していません。あらかじめ用意した定型文から
// ユーザーの入力に応じて選び・差し込む「モック」方式です。
// 将来 API 連携する場合は buildThingMessage / buildMemoryMessage を
// 非同期化して差し替えれば、呼び出し側はそのまま使えます。

const thingReplies = [
  (name) => `${name}、そばにいられて幸せでした。\nあなたの毎日の中にいられたこと、\nずっと忘れません。ありがとう。`,
  (name) => `もう充分です。\n${name}のことを大切にしてくれて、\n本当にありがとう。\nどうか身軽になってください。`,
  (name) => `お別れはさみしいけれど、\nあなたと過ごした時間は\nちゃんと私の中に残ります。\nさようなら、そしてありがとう。`,
  (name) => `役目を終えられて、うれしいです。\n${name}のこと、大好きでした。\nこれからも、元気で。`,
  (name) => `${name}、ずっと使ってくれてありがとう。\nくたびれるまで一緒だったね。\nどうか、笑顔で見送って。`,
  (name) => `わたしの役目はここまで。\n${name}と出会えて、しあわせでした。\n新しい毎日を、身軽に歩いてね。`,
];

// メッセージを書いてくれた人には、その気持ちに触れる一言を添える
const thingRepliesWithMessage = [
  (name) => `あなたの言葉、たしかに受け取りました。\n${name}、こちらこそありがとう。\nもう、そっと手放して大丈夫です。`,
  (name) => `そんな風に思ってくれていたなんて。\n${name}として、幸せな時間でした。\nさようなら。どうか、お元気で。`,
];

const memoryReplies = [
  `その思い出は、たしかにあなたの一部でした。\nもう握りしめていなくて大丈夫。\nそっと空へ還します。`,
  `よく抱えてきましたね。\nもう、下ろしていいのです。\nあなたが軽やかになれますように。`,
  `覚えていたことも、忘れていくことも、\nどちらもやさしさです。\nゆっくり手放していきましょう。`,
  `その記憶は消えるのではなく、\n夜空の星のひとつになります。\nいつでも見上げれば、そこにあります。`,
  `ここまで運んでくれて、ありがとう。\nこの思い出は、もうあなたを縛りません。\n風にのって、遠くへ還っていきます。`,
];

// 長い思い出（たくさん書いてくれた人）には、より寄り添う言葉を
const memoryRepliesLong = [
  `たくさんの言葉、ちゃんと受け取りました。\nそれだけ大切だったのですね。\nもう充分です。ゆっくり、手放していきましょう。`,
  `ここまで書けたあなたは、もう大丈夫。\nこの思い出は空へ昇り、\nあなたの心に静かな余白を残します。`,
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// name: モノの名前 / message: ユーザーがモノへ書いた本文
function buildThingMessage(name, message) {
  const who = name && name.trim() ? name.trim() : 'わたし';
  const hasMessage = message && message.trim().length > 0;
  const table = hasMessage ? thingRepliesWithMessage : thingReplies;
  return pick(table)(who);
}

// text: ユーザーが書いた思い出の本文
function buildMemoryMessage(text) {
  const isLong = text && text.trim().length >= 60;
  return isLong ? pick(memoryRepliesLong) : pick(memoryReplies);
}

/* ---------- 供養アニメーション (Canvas 2D) ---------- */
// p5.js のインスタンス初期化が不安定だったため、
// 素の Canvas 2D + requestAnimationFrame で実装し直した堅牢版。
const ceremony = document.getElementById('ceremony');
const ceremonyMessage = document.getElementById('ceremony-message');
const farewellText = document.getElementById('farewell-text');
const fromLabel = document.getElementById('from-label');
const closeBtn = document.getElementById('close-btn');
const speedSlider = document.getElementById('speed');

let animSpeed = 1;
let rafId = null;
speedSlider.addEventListener('input', (e) => { animSpeed = parseFloat(e.target.value); });

// 演出タイミング（秒）※スローでゆったり
const HOLD_TIME = 2.2;    // 最初に写真/光を静止して見せる時間
const RISE_SPAN = 2.5;    // 下から順に発ち始めるまでの広がり

// パーティクル：写真の各サンプル点、または思い出の光の粒
class Particle {
  // yNorm: 画面内の縦位置(0=上,1=下)。下にあるものほど早く発つ。
  constructor(x, y, r, g, b, yNorm) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    // 少しオレンジ寄りに色を補正（暖色の余韻）
    this.r = Math.min(255, r + 40);
    this.g = Math.min(255, g + 8);
    this.b = Math.max(0, b - 30);
    this.baseSize = 2.4 + Math.random() * 1.2;
    this.size = this.baseSize;
    // 下にある粒ほど先に、上の粒ほど後から発つ
    this.delay = HOLD_TIME + (1 - yNorm) * RISE_SPAN + Math.random() * 0.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.8 + Math.random() * 1.6;   // 揺れ（毎秒）ゆっくり
    this.riseSpeed = 34 + Math.random() * 66;       // 上昇速度（px/秒）スロー
    this.driftX = (Math.random() - 0.5) * 26;       // 横ゆらぎ（px/秒）
    this.life = 1;
    this.fadeDur = 3.6;                             // 消えるまでの時間（秒）長め
    // 各粒がまとう暖色の光（オレンジ〜金）
    const t = Math.random();
    this.glowR = 255;
    this.glowG = 150 + Math.floor(t * 80);          // 150〜230
    this.glowB = 60 + Math.floor(t * 60);           // 60〜120
  }

  // t: 開始からの経過秒数（速度倍率込み）
  update(t) {
    if (t < this.delay) { this.life = 1; return; }
    const traveled = t - this.delay;
    this.wobble += this.wobbleSpeed * (1 / 60);
    this.x = this.homeX + Math.sin(this.wobble) * 16 + this.driftX * traveled;
    this.y = this.homeY - this.riseSpeed * traveled;
    this.life = Math.max(0, 1 - traveled / this.fadeDur);
    this.size = this.baseSize + Math.sin(this.wobble) * 1.0;
  }

  // まだ発っていない（写真として静止中）か
  get resting() { return this.life >= 1; }

  draw(ctx) {
    if (this.life <= 0) return;
    const a = this.life;
    if (this.resting) {
      // 静止中は写真の色そのままを不透明で描く（元の写真が見える）
      ctx.fillStyle = `rgb(${this.r},${this.g},${this.b})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.baseSize, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    // 発ったあと：暖色の光暈（加算）＋ 写真の色の芯
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${this.glowR},${this.glowG},${this.glowB},${a * 0.5})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // 芯は写真の色を保つ（白飛びを防ぐ）
    ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${a})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  get done() { return this.life <= 0; }
}

let fallbackTimer = null;

function buildParticles(mode, image, W, H) {
  const particles = [];
  const cx = W / 2;
  const cy = H / 2;

  if (mode === 'thing' && image && image.width > 0) {
    // 写真をサンプリングして点群に
    const maxDim = Math.min(W, H) * 0.5;
    const ratio = image.width / image.height;
    let dw, dh;
    if (ratio >= 1) { dw = maxDim; dh = maxDim / ratio; }
    else { dh = maxDim; dw = maxDim * ratio; }

    // オフスクリーンcanvasに縮小描画してピクセルを読む
    const grid = 4; // 点の間隔（px）
    const sw = Math.max(20, Math.floor(dw / grid));
    const sh = Math.max(20, Math.floor(dh / grid));
    const off = document.createElement('canvas');
    off.width = sw; off.height = sh;
    const octx = off.getContext('2d');
    octx.drawImage(image, 0, 0, sw, sh);
    let data;
    try {
      data = octx.getImageData(0, 0, sw, sh).data;
    } catch (e) {
      data = null; // 万一読めなければ下のフォールバックへ
    }
    if (data) {
      for (let yy = 0; yy < sh; yy++) {
        for (let xx = 0; xx < sw; xx++) {
          const idx = (yy * sw + xx) * 4;
          const alpha = data[idx + 3];
          if (alpha < 30) continue;
          const px = cx - dw / 2 + xx * grid;
          const py = cy - dh / 2 + yy * grid;
          const yNorm = yy / sh; // 0=上, 1=下
          particles.push(new Particle(px, py, data[idx], data[idx + 1], data[idx + 2], yNorm));
        }
      }
    }
  }

  // モノで粒が作れなかった場合、または思い出モード：光の粒をふわりと配置
  if (particles.length === 0) {
    const count = 340;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * Math.min(W, H) * 0.22;
      const px = cx + Math.cos(ang) * rad;
      const py = cy + Math.sin(ang) * rad * 0.6;
      // 暖色（オレンジ〜金）を主体に、ときどき淡い青
      const warm = Math.random();
      const r = warm > 0.25 ? 255 : 150;
      const g = warm > 0.25 ? 180 + Math.floor(Math.random() * 50) : 190;
      const b = warm > 0.25 ? 90 + Math.floor(Math.random() * 50) : 255;
      const yNorm = (py - (cy - Math.min(W, H) * 0.22)) / (Math.min(W, H) * 0.44);
      particles.push(new Particle(px, py, r, g, b, Math.max(0, Math.min(1, yNorm))));
    }
  }
  return particles;
}

function startCeremony(mode, image, message) {
  ceremony.hidden = false;
  ceremonyMessage.hidden = true;
  fromLabel.textContent = mode === 'thing' ? '— モノより —' : '— 思い出より —';
  farewellText.textContent = '';

  // 前回のアニメーションを止める
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

  // キャンバスを用意する
  const holder = document.getElementById('canvas-holder');
  holder.innerHTML = '';
  const canvas = document.createElement('canvas');
  const W = window.innerWidth || 800;
  const H = window.innerHeight || 600;
  canvas.width = W;
  canvas.height = H;
  holder.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // 粒を生成
  const particles = buildParticles(mode, image, W, H);

  // 写真の元画像を静止フェーズで見せるための配置を計算
  let photoRect = null;
  if (mode === 'thing' && image && image.width > 0) {
    const maxDim = Math.min(W, H) * 0.5;
    const ratio = image.width / image.height;
    let dw, dh;
    if (ratio >= 1) { dw = maxDim; dh = maxDim / ratio; }
    else { dh = maxDim; dw = maxDim * ratio; }
    photoRect = { x: W / 2 - dw / 2, y: H / 2 - dh / 2, w: dw, h: dh };
  }

  // 背景を塗る
  ctx.fillStyle = 'rgb(7,9,18)';
  ctx.fillRect(0, 0, W, H);

  let messageShown = false;
  let frame = 0;
  const startMs = performance.now();

  // 保険：何があっても十分な時間が経てば必ずメッセージを表示する
  if (fallbackTimer) clearTimeout(fallbackTimer);
  fallbackTimer = setTimeout(() => {
    if (ceremonyMessage.hidden) revealMessage(message);
  }, 16000);

  function loop() {
    frame++;
    const elapsed = ((performance.now() - startMs) / 1000) * animSpeed;
    const holding = elapsed < HOLD_TIME; // 写真をそのまま見せている段階か

    if (holding) {
      // 静止フェーズ：毎フレーム完全に塗り直す
      ctx.fillStyle = 'rgb(7,9,18)';
      ctx.fillRect(0, 0, W, H);
      // 元の写真をそのまま見せる（最後の1秒でそっと薄れ始める）
      if (photoRect) {
        const fadeStart = HOLD_TIME - 1.0;
        const alpha = elapsed < fadeStart ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / 1.0);
        ctx.globalAlpha = alpha;
        ctx.drawImage(image, photoRect.x, photoRect.y, photoRect.w, photoRect.h);
        ctx.globalAlpha = 1;
      }
    } else {
      // 上昇フェーズ：残像を残して淡く塗り重ねる（線香花火のような尾）
      ctx.fillStyle = 'rgba(7,9,18,0.16)';
      ctx.fillRect(0, 0, W, H);
    }

    let aliveCount = 0;
    for (const part of particles) {
      part.update(elapsed);
      // 静止フェーズでは、写真本体を見せるので粒は描かない
      if (!holding) part.draw(ctx);
      if (!part.done) aliveCount++;
    }

    // 粒がおおむね還ったら（または十分に時間が経ったら）メッセージを表示
    if (!messageShown && !holding && (aliveCount < particles.length * 0.06 || elapsed > 11)) {
      messageShown = true;
      revealMessage(message);
    }

    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);
}

function revealMessage(message) {
  if (!ceremonyMessage.hidden) return; // 二重表示を防ぐ
  if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
  ceremonyMessage.hidden = false;
  // 一文字ずつ、そっと浮かび上がらせる
  farewellText.textContent = '';
  let i = 0;
  const chars = [...message];
  const timer = setInterval(() => {
    if (i >= chars.length) { clearInterval(timer); return; }
    farewellText.textContent += chars[i];
    i++;
  }, 55);
}

closeBtn.addEventListener('click', () => {
  ceremony.hidden = true;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  const holder = document.getElementById('canvas-holder');
  if (holder) holder.innerHTML = '';
  resetForms();
});

function resetForms() {
  // モノ
  document.getElementById('thing-form').reset();
  resetPhotoPreview();
  // 思い出
  document.getElementById('memory-form').reset();
}

/* ---------- フォーム送信 ---------- */
document.getElementById('thing-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!uploadedImage) {
    dropzone.style.borderColor = '#ff8a8a';
    setTimeout(() => { dropzone.style.borderColor = ''; }, 800);
    return;
  }
  const name = document.getElementById('thing-name').value;
  const userMessage = document.getElementById('thing-message').value;
  const msg = buildThingMessage(name, userMessage);
  startCeremony('thing', uploadedImage, msg);
});

document.getElementById('memory-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('memory-text').value.trim();
  if (!text) {
    const ta = document.getElementById('memory-text');
    ta.style.borderColor = '#ff8a8a';
    setTimeout(() => { ta.style.borderColor = ''; }, 800);
    return;
  }
  const msg = buildMemoryMessage(text);
  startCeremony('memory', null, msg);
});
