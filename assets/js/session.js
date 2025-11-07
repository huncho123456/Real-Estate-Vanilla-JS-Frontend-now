function checkSession() {
  const token = localStorage.getItem("jwtToken");
  const loginTime = parseInt(localStorage.getItem("loginTime"), 10);

  if (!token || !loginTime) return;

  const elapsed = Date.now() - loginTime; // how long since login
  console.log("Elapsed (ms):", elapsed);

 // 5 minutes = 5 * 60 * 1000 = 300000 ms
if (elapsed > 5 * 60 * 1000) {

    clearInterval(sessionChecker); // stop checking

    // Ask user if they want to continue
    const continueSession = confirm("⚠️ Your session will expire soon. Do you want to continue?");

    if (continueSession) {
      // ✅ User chose to continue: reset timer
      localStorage.setItem("loginTime", Date.now());
      console.log("✅ Session extended successfully.");
      // Restart checker
      setTimeout(() => (sessionChecker = setInterval(checkSession, 60000)), 1000);
    } else {
      // ❌ User declined: log out
      console.warn("⏳ Session ended by user.");

      const message = "Your session has expired. Please log in again.";

      if (typeof showBootstrapModal === "function") {
        showBootstrapModal(message, "Session Expired");
      } else {
      }

      // Clear data and redirect after 2 seconds
      setTimeout(() => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("loginTime");
        window.location.href = "html/auth-login-basic.html";
      }, 2000);
    }
  }
}

// Run check every 1 minute
let sessionChecker = setInterval(checkSession, 60000);

