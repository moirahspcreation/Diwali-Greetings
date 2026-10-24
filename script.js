
"use strict";
animate
// =============================================
// DIWALI FESTIVE GLOW — FIREWORKS UPGRADE
// =============================================

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

const celebrateBtn = document.getElementById("celebrateBtn");
const shareBtn = document.getElementById("shareBtn");
const senderInput = document.getElementById("sender");
const signature = document.getElementById("signature");
const statusText = document.getElementById("status");
const toast = document.getElementById("toast");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const COLORS = [
  "#FFE8A3", // Champagne gold
  "#F9D77E", // Diwali gold
  "#FF9C54", // Orange
  "#FF5F8F", // Pink
  "#C49AFF", // Violet
  "#74D7FF", // Sky blue
  "#FFFFFF", // White
  "#FFCB69"  // Warm yellow
];

const MAX_PARTICLES = 1200;

let particles = [];
let rockets = [];
let animationFrame = null;
let lastSparkleTime = 0;
let toastTimer;
let celebrationTimers = [];

// Canvas setup: keep the fireworks sharp on high-DPI screens.
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

// =============================================
// FIREWORK ROCKETS
// =============================================

function launchRocket(x, targetY, options = {}) {
  if (rockets.length >= 14) return;

  rockets.push({
    x,
    y: window.innerHeight + 10,
    startX: x,
    targetY: Math.max(65, targetY),
    vx: random(-1.1, 1.1),
    vy: random(-8.8, -7.1),
    color: options.color || randomColor(),
    size: random(2, 3.2),
    trail: [],
    style: options.style || "normal"
  });

  startAnimation();
}

function explode(x, y, color, style = "normal") {
  const remaining = MAX_PARTICLES - particles.length;
  if (remaining <= 0) return;

  const count = Math.min(
    style === "willow" ? 105 : style === "ring" ? 90 : 115,
    remaining
  );

  const baseSpeed = style === "willow" ? 3.5 : 4.5;

  for (let i = 0; i < count; i++) {
    let angle;
    let speed;

    if (style === "ring") {
      // A neat circular firework pattern.
      angle = (Math.PI * 2 * i) / count;
      speed = random(2.5, 4.5);
    } else {
      angle = random(0, Math.PI * 2);
      speed = random(1.2, baseSpeed + 2.1);
    }

    const chosenColor =
      Math.random() < 0.35 ? color : randomColor();

    particles.push({
      x,
      y,
      oldX: x,
      oldY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: chosenColor,
      alpha: 1,
      radius: random(1.1, 2.8),
      decay: random(0.008, 0.019),
      gravity: style === "willow" ? 0.055 : 0.035,
      drag: style === "willow" ? 0.982 : 0.987,
      trail: style !== "ring"
    });
  }

  // Add extra tiny glitter around the explosion.
  const glitterCount = Math.min(18, MAX_PARTICLES - particles.length);

  for (let i = 0; i < glitterCount; i++) {
    const angle = random(0, Math.PI * 2);
    const speed = random(0.7, 3.8);

    particles.push({
      x,
      y,
      oldX: x,
      oldY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: "#FFF4C8",
      alpha: 1,
      radius: random(0.6, 1.5),
      decay: random(0.025, 0.05),
      gravity: 0.025,
      drag: 0.98,
      trail: false
    });
  }

  startAnimation();
}

// =============================================
// ANIMATION ENGINE
// =============================================

function startAnimation() {
  if (reducedMotion || animationFrame !== null) return;
  animationFrame = requestAnimationFrame(animate);
}

function animate() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Clear the previous frame. Trails are drawn separately.
  ctx.clearRect(0, 0, width, height);

  // Update and draw rockets.
  for (let i = rockets.length - 1; i >= 0; i--) {
    const rocket = rockets[i];

    rocket.trail.push({ x: rocket.x, y: rocket.y });

    if (rocket.trail.length > 7) {
      rocket.trail.shift();
    }

    rocket.x += rocket.vx;
    rocket.y += rocket.vy;
    rocket.vy += 0.045;

    // Draw a glowing rocket trail.
    for (let j = 0; j < rocket.trail.length; j++) {
      const point = rocket.trail[j];
      const opacity = (j + 1) / rocket.trail.length;

      ctx.save();
      ctx.globalAlpha = opacity * 0.65;
      ctx.fillStyle = rocket.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = rocket.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, rocket.size * opacity, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Explode when the rocket reaches its destination.
    if (rocket.y <= rocket.targetY || rocket.vy >= -0.5) {
      explode(
        rocket.x,
        rocket.y,
        rocket.color,
        rocket.style
      );

      rockets.splice(i, 1);
    }
  }

  // Update and draw the explosion particles.
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.oldX = p.x;
    p.oldY = p.y;

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.alpha -= p.decay;

    if (p.alpha <= 0.02) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.strokeStyle = p.color;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;

    if (p.trail) {
      ctx.lineWidth = Math.max(0.5, p.radius * 0.75);
      ctx.beginPath();
      ctx.moveTo(p.oldX, p.oldY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Continue only while something is moving.
    if (particles.length > 0 || rockets.length > 0) {
    animationFrame = requestAnimationFrame(animate);
  } else {
    animationFrame = null;
    ctx.clearRect(0, 0, width, height);
  }
}

// =============================================
// GRAND DIWALI CELEBRATION
// =============================================

function scheduleBurst(xRatio, yRatio, delay, style = "normal") {
  const timer = setTimeout(() => {
    launchRocket(
      window.innerWidth * xRatio,
      window.innerHeight * yRatio,
      { style }
    );
  }, delay);

  celebrationTimers.push(timer);
}

function launchCelebration() {
  // Prevent the old show from overlapping a new one.
  celebrationTimers.forEach(clearTimeout);
  celebrationTimers = [];

  if (reducedMotion) {
    showToast("🪔 Wishing you a beautiful and Happy Diwali!");
    statusText.textContent = "✨ Light, love and happiness to you!";
    return;
  }

  // First wave: three rockets.
  scheduleBurst(0.18, 0.26, 0, "normal");
  scheduleBurst(0.50, 0.19, 180, "ring");
  scheduleBurst(0.82, 0.28, 350, "normal");

  // Second wave: fireworks across the middle of the sky.
  scheduleBurst(0.32, 0.35, 700, "willow");
  scheduleBurst(0.68, 0.34, 950, "ring");
  scheduleBurst(0.49, 0.30, 1200, "normal");

  // Grand finale: golden willow and colorful bursts.
  scheduleBurst(0.15, 0.22, 1600, "willow");
  scheduleBurst(0.85, 0.23, 1800, "willow");
  scheduleBurst(0.50, 0.14, 2100, "ring");
  scheduleBurst(0.36, 0.25, 2350, "normal");
  scheduleBurst(0.65, 0.24, 2550, "normal");

  statusText.textContent =
    "✦ The sky is sparkling with Diwali magic!";

  showToast("🎆 Let the Diwali celebration begin!");

  if ("vibrate" in navigator) {
    navigator.vibrate?.(70);
  }
}

celebrateBtn.addEventListener("click", launchCelebration);

// =============================================
// CLICK-TO-SPARKLE EFFECT
// =============================================

document.addEventListener("click", event => {
  const control = event.target.closest(
    "button, input, a, label"
  );

  if (control || reducedMotion) return;

  const now = Date.now();

  // Limit background sparkles during rapid clicking.
  if (now - lastSparkleTime < 150) return;
  lastSparkleTime = now;

  explode(event.clientX, event.clientY, randomColor(), "ring");
});

// =============================================
// PERSONALIZED GREETING
// =============================================

function updateSignature() {
  const name = senderInput.value.trim().slice(0, 45);
  signature.textContent = name ? `— ${name}` : "— With love";
}

senderInput.addEventListener("input", updateSignature);

function getGreeting() {
  const name = senderInput.value.trim() || "Your Friend";

  return (
    "🪔✨ HAPPY DIWALI! ✨🪔\n\n" +
    "May your life shine as brightly as a thousand diyas. " +
    "Wishing you happiness, prosperity, peace and beautiful " +
    "new beginnings this Diwali.\n\n" +
    "With love and festive wishes,\n— " + name
  );
}

// =============================================
// SHARE GREETING
// =============================================

async function shareGreeting() {
  const greeting = getGreeting();

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Happy Diwali 🪔",
        text: greeting,
        url: window.location.href
      });

      showToast("✨ Thanks for spreading the Diwali magic!");
    } catch (error) {
      if (error.name !== "AbortError") {
        showToast("Sharing unavailable. Try copying the greeting.");
      }
    }

    return;
  }

  try {
    await navigator.clipboard.writeText(greeting);
    showToast("✨ Greeting copied! Share it with your loved ones.");
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = greeting;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.select();

    try {
      const copied = document.execCommand("copy");

      showToast(
        copied
          ? "✨ Greeting copied! Share it with your loved ones."
          : "Please copy the greeting manually."
      );
    } catch {
      showToast("Clipboard unavailable. Please copy manually.");
    } finally {
      textArea.remove();
    }
  }
}

shareBtn.addEventListener("click", shareGreeting);

// =============================================
// TOAST NOTIFICATION
// =============================================

function showToast(message) {
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// Initialize.
updateSignature();


/* ===== LIVE DIWALI COUNTDOWN ===== */

// 8 November 2026, at midnight in India (IST)
const diwaliDate = new Date("2026-11-08T00:00:00+05:30").getTime();

function updateCountdown() {
  const now = Date.now();
  const remaining = diwaliDate - now;

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const note = document.querySelector(".countdown-note");

  if (remaining <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    note.textContent = "🪔 Happy Diwali! May your home be full of happiness.";
    return;
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
const countdownTimer = setInterval(updateCountdown, 1000);


/* ===== PERSONAL GREETING POPUP ===== */

const greetingModal = document.getElementById("greetingModal");
const openGreetingBtn = document.getElementById("openGreetingBtn");
const closeGreetingBtn = document.getElementById("closeGreetingBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const greetingForm = document.getElementById("greetingForm");

function openGreetingPopup() {
  greetingModal.classList.add("is-open");
  greetingModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    document.getElementById("recipientInput").focus();
  }, 200);
}

function closeGreetingPopup() {
  greetingModal.classList.remove("is-open");
  greetingModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openGreetingBtn.addEventListener("click", openGreetingPopup);
closeGreetingBtn.addEventListener("click", closeGreetingPopup);
modalBackdrop.addEventListener("click", closeGreetingPopup);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && greetingModal.classList.contains("is-open")) {
    closeGreetingPopup();
  }
});

greetingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const recipient = document.getElementById("recipientInput").value.trim();
  const senderName = document.getElementById("senderInput").value.trim();

  if (!recipient || !senderName) {
    return;
  }

  // Show the recipient's name on the greeting card
  const recipientGreeting = document.getElementById("recipientGreeting");

  if (recipientGreeting) {
    recipientGreeting.textContent = `Dear ${recipient},`;
    recipientGreeting.hidden = false;
  }

  // Update the existing sender field and signature, if present
  const existingSender = document.getElementById("sender");

  if (existingSender) {
    existingSender.value = senderName;
    existingSender.dispatchEvent(new Event("input", { bubbles: true }));
    existingSender.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const signature = document.getElementById("signature");

  if (signature) {
    signature.textContent = `With love, ${senderName} 💖`;
  }

  closeGreetingPopup();

  if (typeof showToast === "function") {
    showToast(`✨ Greeting ready for ${recipient}!`);
  }

  // Bring the greeting card into view
  const greetingCard = document.querySelector(".greeting-card");

  if (greetingCard) {
    greetingCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});



/* ===== GRAND DIWALI WELCOME SHOW ===== */

window.addEventListener("load", () => {
  // Give the page a moment to load before the show begins
  window.setTimeout(() => {
    if (typeof launchCelebration === "function") {
      launchCelebration();
    }
  }, 700);
}, { once: true });
