function checkSession() {
  const token = localStorage.getItem("jwtToken");
  const loginTime = parseInt(localStorage.getItem("loginTime"), 10);

  if (token && loginTime) {
    const elapsed = Date.now() - loginTime;
    console.log("Elapsed (ms):", elapsed);

    // Session expiration: 4 minutes = 4 * 60 * 1000 = 240,000 ms
    if (elapsed > 4 * 60 * 1000) {
      const message = "⏳ Session expired. Please log in again.";

      if (typeof showBootstrapModal === "function") {
        showBootstrapModal(message, "Notification");
      } else {
        alert(message); // fallback if modal isn't available
      }

      console.warn("⏳ Session expired!");

      // Clear data and redirect after 2 seconds
      setTimeout(() => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("loginTime");
        window.location.href = "html/auth-login-basic.html";
      }, 2000);

      // Stop further checks
      clearInterval(sessionChecker);
    }
  }
}

// Run check every 1 minute
const sessionChecker = setInterval(checkSession, 60000);
