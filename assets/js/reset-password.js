import { CONFIG } from "./config.js";

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch(`${CONFIG.API_URL}/auth/reset-password?token=${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Password reset successful! You can now log in.");
            // Optionally redirect to login page
            window.location.href = "../html/auth-login-basic.html";
        } else {
            alert(`Error: ${data.message || "Failed to reset password"}`);
        }
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
});
