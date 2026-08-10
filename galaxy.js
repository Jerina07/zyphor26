/* =========================================================
   ZYPHOR'26 — galaxy.js
   3D Space / Particle Scene (multi-depth starfield + nebula
   + drifting embers + occasional shooting stars)

   Kept the filename/canvas id so every page's existing
   <canvas id="galaxyCanvas"> and <script src="galaxy.js">
   tag keeps working unchanged — only the engine + palette
   inside changed. Actual fullscreen positioning now lives in
   style.css (#galaxyCanvas), not here.
   ========================================================= */

(function () {
  let canvas, ctx;
  let width, height, dpr;
  let stars = [];
  let embers = [];
  let shootingStars = [];
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let lastShootAt = 0;

  const STAR_LAYERS = [
    { count: 90, speed: 0.05, size: [0.5, 1.1], alpha: [0.25, 0.5] },  // far
    { count: 70, speed: 0.12, size: [0.8, 1.6], alpha: [0.4, 0.7] },   // mid
    { count: 40, speed: 0.22, size: [1.2, 2.2], alpha: [0.55, 0.9] }   // near
  ];
  const NUM_EMBERS = 46;

  // Brand-matched palette only — warm gold / bronze / cream embers,
  // cool-neutral white starlight. No off-brand violet/cyan.
  const EMBER_COLORS = [
    "rgba(212, 168, 67, ",  // gold
    "rgba(181, 139, 98, ",  // bronze
    "rgba(245, 239, 230, "  // cream
  ];

  function initSpaceScene() {
    canvas = document.getElementById("galaxyCanvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "galaxyCanvas";
      document.body.prepend(canvas);
    }
    ctx = canvas.getContext("2d");

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      targetMouseX = (e.clientX - width / 2) * 0.06;
      targetMouseY = (e.clientY - height / 2) * 0.06;
    });

    createStars();
    createEmbers();
    requestAnimationFrame(renderScene);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createStars() {
    stars = [];
    STAR_LAYERS.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          layer: layerIndex,
          speed: layer.speed,
          radius: rand(layer.size[0], layer.size[1]),
          baseAlpha: rand(layer.alpha[0], layer.alpha[1]),
          twinkleOffset: Math.random() * Math.PI * 2,
          twinkleSpeed: rand(0.6, 1.6)
        });
      }
    });
  }

  function createEmbers() {
    embers = [];
    for (let i = 0; i < NUM_EMBERS; i++) {
      embers.push({
        x: (Math.random() - 0.5) * width * 1.4,
        y: (Math.random() - 0.5) * height * 1.4,
        z: Math.random() * 700 + 20,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        vz: rand(0.25, 0.7),
        radius: rand(0.9, 2.6),
        color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
        alpha: rand(0.35, 0.85)
      });
    }
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function maybeSpawnShootingStar(now) {
    if (now - lastShootAt < rand(3500, 7500)) return;
    lastShootAt = now;
    const startX = rand(width * 0.15, width * 0.85);
    const startY = rand(0, height * 0.35);
    const angle = rand(0.35, 0.55) * Math.PI; // roughly diagonal, downward
    const speed = rand(9, 15);
    shootingStars.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: rand(28, 42)
    });
  }

  function renderScene(now) {
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    const cx = width / 2 + mouseX;
    const cy = height / 2 + mouseY;

    // Ambient nebula backglow — warm gold/bronze only, on-brand
    const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.55);
    nebula.addColorStop(0, "rgba(212, 168, 67, 0.07)");
    nebula.addColorStop(0.55, "rgba(181, 139, 98, 0.035)");
    nebula.addColorStop(1, "rgba(15, 12, 4, 0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);

    // ---- parallax starfield (3 depth layers) ----
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const parallax = 1 + s.layer * 0.6;
      const px = s.x + mouseX * parallax * 0.15;
      const py = (s.y + now * 0.008 * s.speed) % height;
      const twinkle = 0.55 + 0.45 * Math.sin(now * 0.001 * s.twinkleSpeed + s.twinkleOffset);

      ctx.beginPath();
      ctx.fillStyle = `rgba(245, 239, 230, ${s.baseAlpha * twinkle})`;
      ctx.arc(px, py, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 3D drifting embers with perspective + faint links ----
    const focalLength = 420;
    for (let i = 0; i < embers.length; i++) {
      const p = embers[i];
      p.z -= p.vz;
      p.x += p.vx;
      p.y += p.vy;

      if (p.z <= 1) p.z = 700;
      if (p.x < -width) p.x = width;
      if (p.x > width) p.x = -width;
      if (p.y < -height) p.y = height;
      if (p.y > height) p.y = -height;

      const scale = focalLength / (focalLength + p.z);
      const x2d = cx + p.x * scale;
      const y2d = cy + p.y * scale;
      const size = Math.max(0.5, p.radius * scale * 1.7);

      ctx.beginPath();
      ctx.fillStyle = `${p.color}${p.alpha * scale})`;
      ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
      ctx.fill();

      if (p.radius > 1.6 && scale > 0.55) {
        ctx.beginPath();
        ctx.fillStyle = `${p.color}${p.alpha * 0.18 * scale})`;
        ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let j = i + 1; j < embers.length; j += 10) {
        const p2 = embers[j];
        const scale2 = focalLength / (focalLength + p2.z);
        const x2 = cx + p2.x * scale2;
        const y2 = cy + p2.y * scale2;
        const dist = Math.hypot(x2d - x2, y2d - y2);
        if (dist < 100) {
          ctx.strokeStyle = `rgba(212, 168, 67, ${(1 - dist / 100) * 0.12 * scale})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x2d, y2d);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // ---- occasional shooting stars ----
    maybeSpawnShootingStar(now);
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;

      const t = s.life / s.maxLife;
      const alpha = Math.sin(t * Math.PI); // fade in then out

      const tailX = s.x - s.vx * 6;
      const tailY = s.y - s.vy * 6;
      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, "rgba(245,239,230,0)");
      grad.addColorStop(1, `rgba(245,239,230,${alpha * 0.9})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = `rgba(212,168,67,${alpha})`;
      ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
      ctx.fill();

      if (s.life >= s.maxLife) shootingStars.splice(i, 1);
    }

    requestAnimationFrame(renderScene);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSpaceScene);
  } else {
    initSpaceScene();
  }
})();
