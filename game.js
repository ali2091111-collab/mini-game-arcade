// Slice Rush — original fruit-slicing game, plain JavaScript, no external assets.
(function () {
  "use strict";

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var scoreEl = document.getElementById("score");
  var timeEl = document.getElementById("time");
  var livesEl = document.getElementById("lives");
  var comboEl = document.getElementById("combo");
  var statusEl = document.getElementById("status");
  var overlay = document.getElementById("overlay");
  var gameOverBox = document.getElementById("gameOver");
  var finalScoreEl = document.getElementById("finalScore");
  var finalNoteEl = document.getElementById("finalNote");
  var pausedNote = document.getElementById("pausedNote");
  var startBtn = document.getElementById("startBtn");
  var playAgainBtn = document.getElementById("playAgainBtn");
  var pauseBtn = document.getElementById("pauseBtn");
  var restartBtn = document.getElementById("restartBtn");
  var soundBtn = document.getElementById("soundBtn");
  var helpBtn = document.getElementById("helpBtn");

  var W = 800, H = 520;
  var state = "idle"; // idle | playing | paused | over
  var score = 0, lives = 3, timeLeft = 60, combo = 0, comboCount = 0, lastSliceAt = 0;
  var fruits = [], particles = [], halves = [], trail = [];
  var spawnTimer = 0, lastTime = 0, rafId = 0;
  var soundOn = true, audioCtx = null;

  var FRUITS = [
    { name: "Apple", color: "#ef4444", dark: "#b91c1c", leaf: true },
    { name: "Orange", color: "#f97316", dark: "#c2410c", leaf: true },
    { name: "Lemon", color: "#eab308", dark: "#a16207", leaf: true },
    { name: "Melon", color: "#22c55e", dark: "#15803d", leaf: true },
    { name: "Plum", color: "#a855f7", dark: "#7e22ce", leaf: true }
  ];

  function setStatus(msg) { statusEl.textContent = msg; }

  function ensureAudio() {
    if (!soundOn) return null;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    } catch (e) { return null; }
  }

  function beep(freq, dur, type, vol) {
    var ac = ensureAudio();
    if (!ac) return;
    try {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.15, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch (e) { /* audio is optional */ }
  }
  function playSlice() { beep(700, 0.12, "triangle", 0.18); beep(1100, 0.08, "sine", 0.10); }
  function playBomb() { beep(120, 0.35, "sawtooth", 0.22); }
  function playClick() { beep(500, 0.06, "sine", 0.10); }

  function updateHud() {
    scoreEl.textContent = String(score);
    timeEl.textContent = Math.max(0, Math.ceil(timeLeft)) + "s";
    livesEl.textContent = "♥".repeat(Math.max(0, lives)) || "—";
    comboEl.textContent = "×" + Math.max(1, comboCount);
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function spawnFruit() {
    var isBomb = Math.random() < 0.18;
    var type = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    fruits.push({
      x: rand(70, W - 70), y: H + 40, r: rand(32, 46),
      vx: rand(-60, 60), vy: -rand(620, 820),
      rot: rand(0, Math.PI * 2), vr: rand(-2, 2),
      bomb: isBomb, type: type, sliced: false
    });
  }

  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      particles.push({ x: x, y: y, vx: rand(-260, 260), vy: rand(-320, 60), life: rand(0.35, 0.7), max: 0.7, color: color, r: rand(3, 8) });
    }
  }

  function drawFruit(f) {
    ctx.save();
    ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    if (f.bomb) {
      ctx.fillStyle = "#1f2937"; ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 4; ctx.beginPath();
      ctx.moveTo(0, -f.r); ctx.quadraticCurveTo(10, -f.r - 16, 18, -f.r - 14); ctx.stroke();
      ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.arc(20, -f.r - 14, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold " + Math.round(f.r * 0.7) + "px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("✹", 0, 2);
    } else {
      ctx.fillStyle = f.type.color; ctx.beginPath(); ctx.arc(0, 0, f.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.arc(-f.r * 0.3, -f.r * 0.35, f.r * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.ellipse(4, -f.r - 2, 10, 5, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#92400e"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -f.r); ctx.lineTo(0, -f.r - 8); ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Soft ground line, drawn in code only.
    ctx.fillStyle = "rgba(15,118,110,0.12)"; ctx.fillRect(0, H - 6, W, 6);

    halves.forEach(function (h) {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.rot);
      ctx.fillStyle = h.color; ctx.beginPath(); ctx.arc(0, 0, h.r, h.side, h.side + Math.PI); ctx.fill();
      ctx.restore();
    });
    fruits.forEach(drawFruit);

    particles.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Blade trail, fading.
    if (trail.length > 1) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (var i = 1; i < trail.length; i++) {
        var a = i / trail.length;
        ctx.strokeStyle = "rgba(249,115,22," + (a * 0.9).toFixed(2) + ")";
        ctx.lineWidth = 2 + a * 5;
        ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
      }
    }
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
    var t = len2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2)) : 0;
    var cx = x1 + t * dx, cy = y1 + t * dy;
    return Math.hypot(px - cx, py - cy);
  }

  function sliceAt(x, y, prev) {
    // Check every fruit against the swipe segment (or the single point).
    for (var i = fruits.length - 1; i >= 0; i--) {
      var f = fruits[i];
      var d = prev ? distToSegment(f.x, f.y, prev.x, prev.y, x, y) : Math.hypot(f.x - x, f.y - y);
      if (d > f.r) continue;
      fruits.splice(i, 1);
      if (f.bomb) {
        lives -= 1; comboCount = 0;
        burst(f.x, f.y, "#f97316", 28); burst(f.x, f.y, "#1f2937", 14);
        playBomb(); setStatus("Boom! A bomb costs one life. Lives left: " + lives + ".");
        if (lives <= 0) { endGame("Out of lives!"); return; }
      } else {
        var now = performance.now();
        comboCount = (now - lastSliceAt < 1500) ? comboCount + 1 : 1;
        lastSliceAt = now;
        var bonus = (comboCount - 1) * 5;
        score += 10 + bonus;
        halves.push({ x: f.x - 8, y: f.y, vx: -140, vy: -120, rot: f.rot, r: f.r, color: f.type.color, side: 0, life: 0.6 });
        halves.push({ x: f.x + 8, y: f.y, vx: 140, vy: -120, rot: f.rot, r: f.r, color: f.type.dark, side: Math.PI, life: 0.6 });
        burst(f.x, f.y, f.type.color, 18);
        playSlice();
        setStatus(comboCount > 1 ? "Combo ×" + comboCount + "! +" + (10 + bonus) + " points." : "Sliced! +10 points.");
      }
      updateHud();
    }
  }

  function step(now) {
    if (state !== "playing") return;
    var dt = Math.min(0.05, (now - lastTime) / 1000 || 0.016);
    lastTime = now;
    timeLeft -= dt;
    if (timeLeft <= 0) { timeLeft = 0; updateHud(); draw(); endGame("Time up!"); return; }

    spawnTimer -= dt;
    if (spawnTimer <= 0) { spawnFruit(); if (Math.random() < 0.3) spawnFruit(); spawnTimer = rand(0.55, 0.9); }

    fruits.forEach(function (f) {
      f.vy += 900 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
    });
    // Missed fruit simply falls away; only bombs cost a life.
    fruits = fruits.filter(function (f) { return f.y < H + 80; });
    particles.forEach(function (p) { p.vy += 500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
    particles = particles.filter(function (p) { return p.life > 0; });
    halves.forEach(function (h) { h.vy += 700 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += 3 * dt; h.life -= dt; });
    halves = halves.filter(function (h) { return h.life > 0; });
    trail = trail.filter(function (t) { return now - t.at < 180; });

    updateHud(); draw();
    rafId = requestAnimationFrame(step);
  }

  function resetGame() {
    score = 0; lives = 3; timeLeft = 60; comboCount = 0; lastSliceAt = 0;
    fruits = []; particles = []; halves = []; trail = []; spawnTimer = 0.2;
    updateHud(); draw();
  }

  function startGame() {
    ensureAudio(); playClick();
    resetGame();
    state = "playing";
    overlay.classList.add("hidden"); gameOverBox.classList.add("hidden"); pausedNote.classList.add("hidden");
    pauseBtn.disabled = false; pauseBtn.textContent = "Pause";
    setStatus("Go! Slice fruit, avoid bombs.");
    lastTime = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
  }

  function pauseGame() {
    if (state === "playing") {
      state = "paused"; cancelAnimationFrame(rafId);
      pauseBtn.textContent = "Resume"; pausedNote.classList.remove("hidden"); setStatus("Paused. Press Resume to continue.");
    } else if (state === "paused") {
      state = "playing"; pauseBtn.textContent = "Pause"; pausedNote.classList.add("hidden"); setStatus("Back to slicing!");
      lastTime = performance.now(); rafId = requestAnimationFrame(step);
    }
  }

  function endGame(reason) {
    state = "over"; cancelAnimationFrame(rafId);
    pauseBtn.disabled = true; pauseBtn.textContent = "Pause"; pausedNote.classList.add("hidden");
    finalScoreEl.textContent = "Score: " + score;
    finalNoteEl.textContent = reason + (score >= 300 ? " Amazing slicing!" : score >= 150 ? " Great run!" : " Try again for a bigger combo!");
    gameOverBox.classList.remove("hidden");
    beep(523, 0.15, "sine", 0.15); setTimeout(function () { beep(659, 0.15, "sine", 0.15); }, 150);
    setTimeout(function () { beep(784, 0.25, "sine", 0.15); }, 300);
    setStatus(reason + " Final score: " + score + ".");
  }

  function showHelp() {
    if (state === "playing") pauseGame();
    overlay.classList.remove("hidden");
    overlay.querySelector("h2").textContent = "How to play";
    startBtn.textContent = state === "paused" ? "Resume game" : "Start game";
  }

  function canvasPos(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * (W / rect.width), y: (clientY - rect.top) * (H / rect.height) };
  }

  var swiping = false, prevPoint = null;
  function onMove(e) {
    if (state !== "playing") return;
    if (e.type === "mousemove" && !swiping) return;
    if (e.cancelable) e.preventDefault();
    var p = canvasPos(e);
    trail.push({ x: p.x, y: p.y, at: performance.now() });
    sliceAt(p.x, p.y, prevPoint);
    prevPoint = p;
  }
  canvas.addEventListener("mousedown", function (e) { swiping = true; prevPoint = canvasPos(e); onMove(e); });
  window.addEventListener("mouseup", function () { swiping = false; prevPoint = null; });
  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("touchstart", function (e) { swiping = true; prevPoint = canvasPos(e); onMove(e); }, { passive: false });
  canvas.addEventListener("touchmove", onMove, { passive: false });
  canvas.addEventListener("touchend", function () { swiping = false; prevPoint = null; }, { passive: true });

  startBtn.addEventListener("click", function () {
    if (state === "paused") { overlay.classList.add("hidden"); pauseGame(); }
    else startGame();
  });
  playAgainBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", function () { ensureAudio(); playClick(); pauseGame(); });
  restartBtn.addEventListener("click", startGame);
  helpBtn.addEventListener("click", function () { ensureAudio(); playClick(); showHelp(); });
  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊 Sound on" : "🔇 Sound off";
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    if (soundOn) { ensureAudio(); playClick(); }
    setStatus(soundOn ? "Sound on." : "Sound off.");
  });
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") { e.preventDefault(); if (state === "playing" || state === "paused") pauseGame(); else startGame(); }
    if (e.code === "KeyR") startGame();
    if (e.code === "KeyM") soundBtn.click();
  });

  // Initial paint: a few still fruits behind the instruction overlay.
  resetGame();
  fruits.push({ x: 180, y: 360, r: 40, vx: 0, vy: 0, rot: 0.4, vr: 0, bomb: false, type: FRUITS[0], sliced: false });
  fruits.push({ x: 400, y: 330, r: 44, vx: 0, vy: 0, rot: -0.3, vr: 0, bomb: false, type: FRUITS[3], sliced: false });
  fruits.push({ x: 620, y: 360, r: 38, vx: 0, vy: 0, rot: 0, vr: 0, bomb: true, type: FRUITS[0], sliced: false });
  draw();
})();
