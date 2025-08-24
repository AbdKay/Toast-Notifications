// Minimal Toast system (vanilla JS)
// - Supports: success | info | warning | error
// - Auto-dismiss with progress bar
// - Click ✕ to dismiss
// - Queue-friendly: multiple toasts stack

const container = document.querySelector(".toast-container");
const durationInput = document.getElementById("duration");

// Buttons
document.querySelectorAll(".controls .btn").forEach((btn) => {
  if (btn.dataset.type) {
    btn.addEventListener("click", () =>
      showToast({
        type: btn.dataset.type,
        title: toTitle(btn.dataset.type),
        message: sampleMessage(btn.dataset.type),
        duration: readDuration(),
      })
    );
  }
});

document.getElementById("customBtn").addEventListener("click", () => {
  const msg = prompt("Enter your custom message:", "This is a custom toast!");
  if (msg && msg.trim()) {
    showToast({
      type: "info",
      title: "Custom",
      message: msg.trim(),
      duration: readDuration(),
    });
  }
});

function readDuration() {
  const v = parseInt(durationInput.value, 10);
  return Number.isFinite(v) && v >= 500 ? v : 3000;
}

function toTitle(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function sampleMessage(type) {
  const map = {
    success: "Everything worked as expected.",
    info: "Here is some information for you.",
    warning: "Heads up! Something might need attention.",
    error: "Oops! Something went wrong.",
  };
  return map[type] || "Notification message.";
}

function iconFor(type) {
  switch (type) {
    case "success":
      return "fa-solid fa-circle-check";
    case "info":
      return "fa-solid fa-circle-info";
    case "warning":
      return "fa-solid fa-triangle-exclamation";
    case "error":
      return "fa-solid fa-circle-xmark";
    default:
      return "fa-solid fa-bell";
  }
}

/**
 * Create and show a toast
 * @param {Object} options
 * @param {'success'|'info'|'warning'|'error'} options.type
 * @param {string} options.title
 * @param {string} options.message
 * @param {number} options.duration
 */
function showToast({
  type = "info",
  title = "Notice",
  message = "",
  duration = 3000,
} = {}) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  toast.innerHTML = `
    <div class="icon" aria-hidden="true"><i class="${iconFor(type)}"></i></div>
    <div class="content">
      <div class="title">${escapeHtml(title)}</div>
      <div class="message">${escapeHtml(message)}</div>
    </div>
    <button class="close" aria-label="Dismiss notification">
      <i class="fa-solid fa-xmark"></i>
    </button>
    <div class="progress"><span></span></div>
  `;

  // Close button
  toast.querySelector(".close").addEventListener("click", () => dismiss(toast));

  container.appendChild(toast);

  // Animate progress
  const bar = toast.querySelector(".progress > span");
  bar.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], {
    duration,
    easing: "linear",
    fill: "forwards",
  });

  // Auto-dismiss
  const timer = setTimeout(() => dismiss(toast), duration);

  // Pause on hover (optional but nice)
  let remaining = duration;
  let startTime = performance.now();
  let anim = bar.getAnimations()[0];

  toast.addEventListener("mouseenter", () => {
    clearTimeout(timer);
    if (anim) anim.pause();
    remaining -= performance.now() - startTime;
  });

  toast.addEventListener("mouseleave", () => {
    startTime = performance.now();
    if (anim) anim.play();
    setTimeout(() => dismiss(toast), remaining);
  });
}

function dismiss(toastEl) {
  toastEl.style.animation = "slideOut .15s ease-in forwards";
  toastEl.addEventListener("animationend", () => toastEl.remove(), {
    once: true,
  });
}

// Simple escape to prevent HTML injection in messages/titles
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
