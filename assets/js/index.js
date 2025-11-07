import { CONFIG } from "./config.js";
import { token } from "./login.js";

document.addEventListener("DOMContentLoaded", () => {
  
  // 🔐 Redirect immediately if no token and not on login page
  if (!token && !window.location.pathname.includes("auth-login-basic.html")) {
    window.location.href = "html/auth-login-basic.html";
    return;
  }

  
  // ✅ Run your other setups
  setupPasswordToggle();
  initializeReferralSection();
  setupCopyButton();
 
});


// 🔐 Toggle Password Visibility
function setupPasswordToggle() {
  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("togglePassword");
  const toggleIcon = document.getElementById("toggleIcon");

  if (toggleButton && passwordInput && toggleIcon) {
    toggleButton.addEventListener("click", () => {
      const isPasswordVisible = passwordInput.type === "text";
      passwordInput.type = isPasswordVisible ? "password" : "text";
      toggleIcon.classList.toggle("bx-hide", isPasswordVisible);
      toggleIcon.classList.toggle("bx-show", !isPasswordVisible);
    });
  }
}

// 📎 Fetch Referral Link
async function getReferralLink(token) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/auth/me/referral-link`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch referral link");

    const data = await response.json();
    return data.referralLink;
  } catch (error) {
    console.error("Referral link error:", error);
  }
}

// 💼 Display Referral Section Info
async function initializeReferralSection() {
  const referralSection = document.getElementById("referral");
  if (!referralSection) return;

  const amountElement = referralSection.querySelector("h4.card-title.mb-3");
  if (!amountElement) return;

  try {
    const referralLink = await getReferralLink(token);
    amountElement.textContent = referralLink || "❌ No referral link";
  } catch (err) {
    amountElement.textContent = "⚠️ Failed to fetch referral link.";
  }
}

// 📋 Copy to Clipboard
function setupCopyButton() {
  const copyBtn = document.getElementById("copyReferralBtn");
  const linkText = document.querySelector("#referral h4.card-title.mb-3");

  if (!copyBtn || !linkText) return;

  copyBtn.addEventListener("click", () => {
    const text = linkText.textContent.trim();

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "✅ Copied!";
        resetText();
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      try {
        const success = document.execCommand("copy");
        copyBtn.textContent = success ? "✅ Copied!" : "❌ Failed";
      } catch {
        copyBtn.textContent = "❌ Failed";
      }
      document.body.removeChild(input);
      resetText();
    }

    function resetText() {
      setTimeout(() => {
        copyBtn.textContent = "📋 Copy";
      }, 2000);
    }
  });

  const yearBadge = document.querySelector(".badge.bg-label-warning");

  function updateDateTime() {
    const now = new Date();
  
    // Format: YEAR 2025 | 05-Nov | 19:45:12
    const year = now.getFullYear();
    const month = now.toLocaleString("default", { month: "short" }); 
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
  
    // 🕒 Display everything
    if (yearBadge) {
      yearBadge.textContent = `YEAR ${year} | ${day}-${month} | ${hours}:${minutes}:${seconds}`;
    }
  }
  
  // 🔁 Update every second
  setInterval(updateDateTime, 1000);
  
  // Run once on page load
  updateDateTime();
}
