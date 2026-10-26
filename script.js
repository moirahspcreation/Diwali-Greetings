"use strict";

// =============================================
// DIWALI FESTIVE GLOW — FIREWORKS UPGRADE
// =============================================

const canvas = document.getElementById("fireworks");
const ctx = canvas ? canvas.getContext("2d") : null;

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
  "#FFE8A3", "#F9D77E", "#FF9C54", "#FF5F8F",
  "#C49AFF", "#74D7FF", "#FFFFFF", "#FFCB69"
];

const MAX_PARTICLES = 1200;

let particles = [];
let rockets = [];
let animationFrame = null;
let lastSparkleTime = 0;
let toastTimer;
let celebrationTimers = [];

let currentRecipient = "";
let currentSender = "";

function resizeCanvas() {
  if (!canvas || !ctx) return;

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
  if (!canvas || !ctx || rockets.length >= 14) return;

  rockets.push({
    x,
    y: window.innerHeight + 10,
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
  if (!canvas || !ctx) return;

  const remaining = MAX_PARTICLES - particles.length;
  if (remaining <= 0) return;

  const count = Math.min(
    style === "willow" ? 105 :
    style === "ring" ? 90 : 115,
    remaining
  );

  const baseSpeed = style === "willow" ? 3.5 : 4.5;

  for (let i = 0; i < count; i++) {
    let angle;
    let speed;

    if (style === "ring") {
      angle = (Math.PI * 2 * i) / count;
      speed = random(2.5, 4.5);
    } else {
      angle = random(0, Math.PI * 2);
      speed = random(1.2, baseSpeed + 2.1);
    }

    particles.push({
      x, y, oldX: x, oldY: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: Math.random() < 0.35 ? color : randomColor(),
      alpha: 1,
      radius: random(1.1, 2.8),
      decay: random(0.008, 0.019),
      gravity: style === "willow" ? 0.055 : 0.035,
      drag: style === "willow" ? 0.982 : 0.987,
      trail: style !== "ring"
    });
  }

  const glitterCount = Math.min(18, MAX_PARTICLES - particles.length);

  for (let i = 0; i < glitterCount; i++) {
    const angle = random(0, Math.PI * 2);
    const speed = random(0.7, 3.8);

    particles.push({
      x, y, oldX: x, oldY: y,
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
  if (!ctx || reducedMotion || animationFrame !== null) return;
  animationFrame = requestAnimationFrame(animate);
}

function animate() {
  if (!ctx) {
    animationFrame = null;
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.clearRect(0, 0, width, height);

  for (let i = rockets.length - 1; i >= 0; i--) {
    const rocket = rockets[i];

    rocket.trail.push({ x: rocket.x, y: rocket.y });
    if (rocket.trail.length > 7) rocket.trail.shift();

    rocket.x += rocket.vx;
    rocket.y += rocket.vy;
    rocket.vy += 0.045;

    for (let j = 0; j < rocket.trail.length; j++) {
      const point = rocket.trail[j];
      const opacity = (j + 1) / rocket.trail.length;

      ctx.save();
      ctx.globalAlpha = opacity * 0.65;
      ctx.fillStyle = rocket.color;
      ctx.shadowBlur = 12;
      ctx.shadowColor = rocket.color;
      ctx.beginPath();
      ctx.arc(
        point.x, point.y,
        rocket.size * opacity, 0, Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    if (rocket.y <= rocket.targetY || rocket.vy >= -0.5) {
      explode(rocket.x, rocket.y, rocket.color, rocket.style);
      rockets.splice(i, 1);
    }
  }

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
  celebrationTimers.forEach(clearTimeout);
  celebrationTimers = [];

  if (reducedMotion) {
    showToast("🪔 Wishing you a beautiful and Happy Diwali!");
    if (statusText) {
      statusText.textContent = "✨ Light, love and happiness to you!";
    }
    return;
  }

  scheduleBurst(0.18, 0.26, 0, "normal");
  scheduleBurst(0.50, 0.19, 180, "ring");
  scheduleBurst(0.82, 0.28, 350, "normal");
  scheduleBurst(0.32, 0.35, 700, "willow");
  scheduleBurst(0.68, 0.34, 950, "ring");
  scheduleBurst(0.49, 0.30, 1200, "normal");
  scheduleBurst(0.15, 0.22, 1600, "willow");
  scheduleBurst(0.85, 0.23, 1800, "willow");
  scheduleBurst(0.50, 0.14, 2100, "ring");
  scheduleBurst(0.36, 0.25, 2350, "normal");
  scheduleBurst(0.65, 0.24, 2550, "normal");

  if (statusText) {
    statusText.textContent = "✦ The sky is sparkling with Diwali magic!";
  }

  showToast("🎆 Let the Diwali celebration begin!");

  if ("vibrate" in navigator) {
    navigator.vibrate?.(70);
  }
}

if (celebrateBtn) {
  celebrateBtn.addEventListener("click", launchCelebration);
}

// =============================================
// CLICK-TO-SPARKLE EFFECT
// =============================================

document.addEventListener("click", event => {
  const target = event.target;

  const control = target && target.closest
    ? target.closest("button, input, a, label")
    : null;

  if (control || reducedMotion) return;

  const now = Date.now();
  if (now - lastSparkleTime < 150) return;

  lastSparkleTime = now;
  explode(event.clientX, event.clientY, randomColor(), "ring");
});

// =============================================
// SIGNATURE AND GREETING TEXT
// =============================================

function updateSignature() {
  if (!senderInput || !signature) return;

  const name = senderInput.value.trim().slice(0, 45);
  signature.textContent = name ? `— ${name}` : "— With love";
}

if (senderInput) {
  senderInput.addEventListener("input", () => {
    currentSender = senderInput.value.trim().slice(0, 45);
    updateSignature();
  });
}

function getGreeting() {
  const name = senderInput && senderInput.value.trim()
    ? senderInput.value.trim()
    : "Your Friend";

  return (
    "🪔✨ HAPPY DIWALI! ✨🪔\n\n" +
    "May your life shine as brightly as a thousand diyas. " +
    "Wishing you happiness, prosperity, peace and beautiful " +
    "new beginnings this Diwali.\n\n" +
    "With love and festive wishes,\n— " + name
  );
}

// =============================================
// PERSONALIZED URL
// =============================================

function makePersonalizedURL(recipient, sender) {
  const url = new URL(window.location.href);

  url.search = "";
  url.searchParams.set("to", recipient);
  url.searchParams.set("from", sender);
  url.hash = "";

  return url.href;
}

// =============================================
// SHARE GREETING
// =============================================

async function shareGreeting() {
  const recipient = currentRecipient.trim();

  const sender = (
    currentSender ||
    (senderInput ? senderInput.value.trim() : "") ||
    "Your Friend"
  ).trim();

  let finalURL;

  if (recipient) {
    finalURL = makePersonalizedURL(recipient, sender);
  } else {
    const url = new URL(window.location.href);

    url.searchParams.delete("to");
    url.searchParams.set("from", sender);

    finalURL = url.href;
  }

  const greeting = recipient
    ? `🪔 Happy Diwali, ${recipient}!\n\n` +
      "May your life shine with happiness, prosperity and peace.\n\n" +
      `With love,\n— ${sender}`
    : getGreeting();

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Happy Diwali 🪔",
        text: greeting,
        url: finalURL
      });

      showToast("✨ Your personalized greeting is ready to share!");
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(finalURL);
      showToast("✨ Personalized link copied! Share it with your loved ones.");
    } else {
      showToast("Please copy the link from your browser address bar.");
    }
  } catch (error) {
    if (error && error.name !== "AbortError") {
      showToast("Sharing failed. Please try again.");
    }
  }
}

if (shareBtn) {
  shareBtn.addEventListener("click", shareGreeting);
}

// =============================================
// TOAST NOTIFICATION
// =============================================

function showToast(message) {
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// =============================================
// PERSONAL GREETING POPUP
// =============================================

const greetingModal = document.getElementById("greetingModal");
const openGreetingBtn = document.getElementById("openGreetingBtn");
const closeGreetingBtn = document.getElementById("closeGreetingBtn");
const modalBackdrop = document.getElementById("modalBackdrop");
const greetingForm = document.getElementById("greetingForm");

const recipientInput = document.getElementById("recipientInput");
const popupSenderInput = document.getElementById("senderInput");

function openGreetingPopup() {
  if (!greetingModal || !recipientInput || !popupSenderInput) return;

  greetingModal.classList.add("is-open");
  greetingModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  recipientInput.value = "";
  popupSenderInput.value = currentRecipient || currentSender || "";

  window.setTimeout(() => recipientInput.focus(), 200);
}

function closeGreetingPopup() {
  if (!greetingModal) return;

  greetingModal.classList.remove("is-open");
  greetingModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

if (openGreetingBtn) {
  openGreetingBtn.addEventListener("click", openGreetingPopup);
}

if (closeGreetingBtn) {
  closeGreetingBtn.addEventListener("click", closeGreetingPopup);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeGreetingPopup);
}

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    greetingModal &&
    greetingModal.classList.contains("is-open")
  ) {
    closeGreetingPopup();
  }
});

// =============================================
// UPDATE PERSONALIZED GREETING
// =============================================

function updatePersonalizedGreeting(recipient, sender) {
  const safeRecipient = String(recipient || "").trim().slice(0, 40);
  const safeSender =
    String(sender || "Your Friend").trim().slice(0, 40) || "Your Friend";

  if (!safeRecipient) return;

  currentRecipient = safeRecipient;
  currentSender = safeSender;

  const recipientGreeting = document.getElementById("recipientGreeting");

  if (recipientGreeting) {
    recipientGreeting.textContent = `Dear ${safeRecipient}, 🪔`;
    recipientGreeting.hidden = false;
  }

  if (senderInput) {
    senderInput.value = safeSender;
  }

  updateSignature();

  if (signature) {
    signature.textContent = `With love, ${safeSender} 💖`;
  }
}

// =============================================
// CREATE AND UPDATE GREETING LINK
// =============================================

if (greetingForm) {
  greetingForm.addEventListener("submit", event => {
    event.preventDefault();

    const recipient = recipientInput
      ? recipientInput.value.trim().slice(0, 40)
      : "";

    const senderName = popupSenderInput
      ? popupSenderInput.value.trim().slice(0, 40)
      : "";

    if (!recipient || !senderName) {
      showToast("Please enter both names.");
      return;
    }

    updatePersonalizedGreeting(recipient, senderName);

    const personalizedURL = makePersonalizedURL(recipient, senderName);

    window.history.replaceState({}, "", personalizedURL);

    closeGreetingPopup();
    showToast(`✨ Greeting ready for ${recipient}!`);

    document.querySelector(".greeting-card")
      ?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center"
      });
  });
}

// =============================================
// LOAD NAMES FROM SHARED LINK
// =============================================

function loadPersonalizedGreeting() {
  const params = new URLSearchParams(window.location.search);

  const recipient = (params.get("to") || "").trim().slice(0, 40);
  const sender =
    (params.get("from") || "Your Friend").trim().slice(0, 40) ||
    "Your Friend";

  if (recipient) {
    updatePersonalizedGreeting(recipient, sender);

    // The next greeting can be created for a new person.
    // The current greeting keeps its original sender.
    if (popupSenderInput) {
      popupSenderInput.value = recipient;
    }
  } else if (senderInput && params.get("from")) {
    currentSender = sender;
    senderInput.value = sender;
    updateSignature();
  }
}

loadPersonalizedGreeting();
updateSignature();

// =============================================
// LIVE DIWALI COUNTDOWN
// =============================================

// 8 November 2026, midnight in India (IST)
const diwaliDate = new Date("2026-11-08T00:00:00+05:30").getTime();

function updateCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const note = document.querySelector(".countdown-note");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !note) return;

  const remaining = diwaliDate - Date.now();

  if (remaining <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    note.textContent =
      "🪔 Happy Diwali! May your home be full of happiness.";
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
window.setInterval(updateCountdown, 1000);

// =============================================
// GRAND DIWALI WELCOME SHOW
// =============================================

window.addEventListener("load", () => {
  window.setTimeout(() => {
    launchCelebration();
  }, 700);
}, { once: true });