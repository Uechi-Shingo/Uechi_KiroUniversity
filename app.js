/* =========================================================
   そらへ — モノと思い出を手放すためのWebアプリ
   ========================================================= */

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
// ユーザーの言葉を受け取り、やさしく応答する。

const thingReplies = [
  (name) => `${name}、そばにいられて幸せでした。\nあなたの毎日の中にいられたこと、\nずっと忘れません。ありがとう。`,
  (name) => `もう充分です。\n${name}のことを大切にしてくれて、\n本当にありがとう。\nどうか身軽になってください。`,
  (name) => `お別れはさみしいけれど、\nあなたと過ごした時間は\nちゃんと私の中に残ります。\nさようなら、そしてありがとう。`,
  (name) => `役目を終えられて、うれしいです。\n${name}のこと、大好きでした。\nこれからも、元気で。`,
];

const memoryReplies = [
  `その思い出は、たしかにあなたの一部でした。\nもう握りしめていなくて大丈夫。\nそっと空へ還します。`,
  `よく抱えてきましたね。\nもう、下ろしていいのです。\nあなたが軽やかになれますように。`,
  `覚えていたことも、忘れていくことも、\nどちらもやさしさです。\nゆっくり手放していきましょう。`,
  `その記憶は消えるのではなく、\n夜空の星のひとつになります。\nいつでも見上げれば、そこにあります。`,
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function buildThingMessage(name) {
  const who = name && name.trim() ? name.trim() : 'わたし';
  return pick(thingReplies)(who);
}

function buildMemoryMessage() {
  return pick(memoryReplies);
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
    this.angle = Math.random() * Math.PI * 2;
    this.driftX = (Math.random() - 0.5) * 0.6;
    this.riseSpeed = 0.4 + Math.random() * 1.2;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.02 + Math.random() * 0.04;
    this.delay = Math.random() * 120; // ばらけて発つ
    this.life = 1;
  }

  update(t, speed) {
    if (t < this.delay) return;
    this.wobble += this.wobbleSpeed * speed;
    this.x += (this.driftX + Math.sin(this.wobble) * 0.4) * speed;
    this.y -= this.riseSpeed * speed;
    // 上に行くほど消えていく
    const progress = (this.homeY - this.y) / (this.homeY + 100);
    this.life = Math.max(0, 1 - progress * 1.1);
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

function startCeremony(mode, image, message) {
  ceremony.hidden = false;
  ceremonyMessage.hidden = true;
  fromLabel.textContent = mode === 'thing' ? '— モノより —' : '— 思い出より —';
  farewellText.textContent = '';

  if (p5Instance) { p5Instance.remove(); p5Instance = null; }

  const sketch = (p) => {
    let particles = [];
    let t = 0;
    let messageShown = false;
    let W, H;

    p.setup = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const c = p.createCanvas(W, H);
      c.parent('canvas-holder');
      p.pixelDensity(1);
      buildParticles();
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
      // 残像を残すために半透明で塗り重ねる
      p.noStroke();
      p.fill(7, 9, 18, 45);
      p.rect(0, 0, W, H);

      p.blendMode(p.ADD);
      let aliveCount = 0;
      for (const part of particles) {
        part.update(t, animSpeed);
        part.draw(p);
        if (!part.done) aliveCount++;
      }
      p.blendMode(p.BLEND);

      // ときどき、上に昇る小さな光の筋
      if (t % 8 === 0) {
        p.fill(255, 243, 214, 40);
        p.circle(W / 2 + (Math.random() - 0.5) * 60, H * 0.2 + Math.random() * 40, 3);
      }

      t += animSpeed;

      // 粒がおおむね還ったらメッセージを表示
      if (!messageShown && (aliveCount < particles.length * 0.12 || t > 520)) {
        messageShown = true;
        revealMessage(message);
      }
    };

    p.windowResized = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      p.resizeCanvas(W, H);
    };
  };

  p5Instance = new p5(sketch);
}

function revealMessage(message) {
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
  const msg = buildThingMessage(name);
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
  const msg = buildMemoryMessage();
  startCeremony('memory', null, msg);
});
