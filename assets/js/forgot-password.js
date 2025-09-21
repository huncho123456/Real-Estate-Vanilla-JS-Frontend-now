import { CONFIG } from "./config.js"; 

document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value;
    
  try {
    const response = await fetch(`${CONFIG.API_URL}/auth/request-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      showBootstrapModal("✅ Reset link sent! Check your email.", "Success");
    } else {
      const errorData = await response.json();
      showBootstrapModal(`❌ ${errorData.message || "Failed to send reset link"}`, "Error");
    }
  } catch (error) {
    showBootstrapModal(`❌ Error: ${error.message}`, "Error");
  }
});

// Bootstrap modal helper
function showBootstrapModal(message, title = "Notification") {
  const modalTitle = document.getElementById("responseModalLabel");
  const modalBody = document.getElementById("modalMessage");

  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.innerHTML = message;

  const modal = new bootstrap.Modal(document.getElementById("responseModal"));
  modal.show();
}
