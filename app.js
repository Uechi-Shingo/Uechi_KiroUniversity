/* =========================================================
   そらへ — モノと思い出を手放すためのWebアプリ
   ========================================================= */

/* ---------- アプリのバージョン ---------- */
const APP_VERSION = 'v1.2.0';
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
    preview.src = ev.target.result;
    preview.hidden = false;
    hint.hidden = true;
    const img = new Image();
    img.onload = () => { uploadedImage = img; };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
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

/* ---------- 供養アニメーション (p5.js) ---------- */
const ceremony = document.getElementById('ceremony');
const ceremonyMessage = document.getElementById('ceremony-message');
const farewellText = document.getElementById('farewell-text');
const fromLabel = document.getElementById('from-label');
const closeBtn = document.getElementById('close-btn');
const speedSlider = document.getElementById('speed');

let p5Instance = null;
let animSpeed = 1;
speedSlider.addEventListener('input', (e) => { animSpeed = parseFloat(e.target.value); });

// パーティクル：写真の各サンプル点、または思い出の光の粒
class Particle {
  constructor(x, y, r, g, b, cx, cy) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.r = r; this.g = g; this.b = b;
    this.cx = cx; this.cy = cy;
    this.size = 2.6;
    // 上へ、少し広がりながら還る
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 1.2 + Math.random() * 2.4;   // 揺れ（毎秒）
    this.delay = Math.random() * 1.1;               // 発つまでの遅れ（秒）
    this.riseSpeed = 60 + Math.random() * 120;       // 上昇速度（px/秒）
    this.driftX = (Math.random() - 0.5) * 40;        // 横ゆらぎ（px/秒）
    this.life = 1;
    this.fadeDur = 2.2;                              // 消えるまでの時間（秒）
  }

  // elapsed: 開始からの経過秒数 / speed: 速度倍率
  update(elapsed, speed) {
    const t = elapsed * speed;
    if (t < this.delay) { this.life = 1; return; }
    const dt = 1 / 60; // 位置更新の刻み（見た目の一貫性のため固定）
    this.wobble += this.wobbleSpeed * dt;
    this.x = this.homeX + Math.sin(this.wobble) * 14 + this.driftX * (t - this.delay);
    this.y = this.homeY - this.riseSpeed * (t - this.delay);
    // 発ってからの経過で、ゆっくり消えていく
    const traveled = t - this.delay;
    this.life = Math.max(0, 1 - traveled / this.fadeDur);
    this.size = 2.6 + Math.sin(this.wobble) * 1.2;
  }

  draw(pg) {
    if (this.life <= 0) return;
    pg.noStroke();
    // 光の粒として描く
    const a = this.life * 255;
    pg.fill(this.r, this.g, this.b, a);
    pg.circle(this.x, this.y, this.size);
    // ほのかな光暈
    pg.fill(255, 243, 214, a * 0.25);
    pg.circle(this.x, this.y, this.size * 2.4);
  }

  get done() { return this.life <= 0; }
}

let fallbackTimer = null;

function startCeremony(mode, image, message) {
  ceremony.hidden = false;
  ceremonyMessage.hidden = true;
  fromLabel.textContent = mode === 'thing' ? '— モノより —' : '— 思い出より —';
  farewellText.textContent = '';

  if (p5Instance) { p5Instance.remove(); p5Instance = null; }
  // 前回のキャンバスが残っていたら消す
  const holder = document.getElementById('canvas-holder');
  if (holder) holder.innerHTML = '';

  // 保険：何があっても数秒後には必ずメッセージを表示する
  if (fallbackTimer) clearTimeout(fallbackTimer);
  fallbackTimer = setTimeout(() => {
    if (ceremonyMessage.hidden) revealMessage(message);
  }, 6500);

  const sketch = (p) => {
    let particles = [];
    let t = 0;
    let messageShown = false;
    let W, H;

    let startMs = 0;

    p.setup = () => {
      W = window.innerWidth || 800;
      H = window.innerHeight || 600;
      const c = p.createCanvas(W, H);
      c.parent('canvas-holder');
      p.pixelDensity(1);
      // 最初のフレームは背景を塗りつぶしておく
      p.background(7, 9, 18);
      buildParticles();
      startMs = p.millis();
    };

    function buildParticles() {
      particles = [];
      const cx = W / 2;
      const cy = H / 2;

      if (mode === 'thing' && image) {
        // 写真をサンプリングして点群に
        const maxDim = Math.min(W, H) * 0.42;
        const ratio = image.width / image.height;
        let dw, dh;
        if (ratio >= 1) { dw = maxDim; dh = maxDim / ratio; }
        else { dh = maxDim; dw = maxDim * ratio; }

        // オフスクリーンに縮小描画してピクセルを読む
        const grid = 4; // 点の間隔（px）
        const sampleW = Math.max(20, Math.floor(dw / grid));
        const sampleH = Math.max(20, Math.floor(dh / grid));
        const pg = p.createGraphics(sampleW, sampleH);
        pg.image(image, 0, 0, sampleW, sampleH);
        pg.loadPixels();

        for (let yy = 0; yy < sampleH; yy++) {
          for (let xx = 0; xx < sampleW; xx++) {
            const idx = (yy * sampleW + xx) * 4;
            const r = pg.pixels[idx];
            const g = pg.pixels[idx + 1];
            const b = pg.pixels[idx + 2];
            const a = pg.pixels[idx + 3];
            if (a < 30) continue;
            // 明るすぎる/暗すぎる背景も含め全部を粒に
            const px = cx - dw / 2 + xx * grid;
            const py = cy - dh / 2 + yy * grid;
            particles.push(new Particle(px, py, r, g, b, cx, cy));
          }
        }
        pg.remove();
      } else {
        // 思い出：文字数に応じた光の粒をふわりと配置
        const count = 320;
        for (let i = 0; i < count; i++) {
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.random() * Math.min(W, H) * 0.22;
          const px = cx + Math.cos(ang) * rad;
          const py = cy + Math.sin(ang) * rad * 0.6;
          // 暖色〜青の光
          const warm = Math.random();
          const r = warm > 0.5 ? 255 : 160;
          const g = warm > 0.5 ? 217 : 196;
          const b = warm > 0.5 ? 160 : 255;
          particles.push(new Particle(px, py, r, g, b, cx, cy));
        }
      }
    }

    p.draw = () => {
      // 開始からの経過秒数
      const elapsed = (p.millis() - startMs) / 1000;

      // 残像を残すために半透明で塗り重ねる
      p.noStroke();
      p.fill(7, 9, 18, 55);
      p.rect(0, 0, W, H);

      p.blendMode(p.ADD);
      let aliveCount = 0;
      for (const part of particles) {
        part.update(elapsed, animSpeed);
        part.draw(p);
        if (!part.done) aliveCount++;
      }
      p.blendMode(p.BLEND);

      // ときどき、上に昇る小さな光の筋
      if (p.frameCount % 8 === 0) {
        p.fill(255, 243, 214, 40);
        p.circle(W / 2 + (Math.random() - 0.5) * 60, H * 0.2 + Math.random() * 40, 3);
      }

      // 粒がおおむね還ったら（または経過4.5秒で）メッセージを表示
      if (!messageShown && (aliveCount < particles.length * 0.1 || elapsed * animSpeed > 4.5)) {
        messageShown = true;
        revealMessage(message);
      }
    };

    p.windowResized = () => {
      W = window.innerWidth || 800;
      H = window.innerHeight || 600;
      p.resizeCanvas(W, H);
    };
  };

  // レイアウトが確定してから p5 を起動（キャンバスが潰れるのを防ぐ）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      p5Instance = new p5(sketch);
    });
  });
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
  if (p5Instance) { p5Instance.remove(); p5Instance = null; }
  resetForms();
});

function resetForms() {
  // モノ
  document.getElementById('thing-form').reset();
  preview.hidden = true; preview.src = '';
  hint.hidden = false;
  uploadedImage = null;
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
