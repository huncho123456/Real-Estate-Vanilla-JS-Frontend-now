import {CONFIG} from "./config.js"; 

export const token = localStorage.getItem("jwtToken");
console.log(token)

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formAuthentication");
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".bx");
  const titleElement = document.querySelector(".card-title");

  // 🔔 Bootstrap modal display
  function showBootstrapModal(message, title = "Notification") {
    const modalLabel = document.getElementById("responseModalLabel");
    const modalMessage = document.getElementById("modalMessage");
    modalLabel.textContent = title;
    modalMessage.innerHTML = message;
    const modal = new bootstrap.Modal(document.getElementById("responseModal"));
    modal.show();
  }

  // 🔐 Toggle password visibility
  if (toggleIcon && passwordInput) {
    toggleIcon.addEventListener("click", function () {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      toggleIcon.classList.toggle("bx-hide");
      toggleIcon.classList.toggle("bx-show");
    });
  }

  // 🚀 Login form submit handler
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Invalid credentials");
        }

        // 💾 Save token
        localStorage.setItem("jwtToken", data.token);

        // ✅ Success feedback
        showBootstrapModal("🎉 Login successful! Redirecting...", "Success");

        // ⏳ Delay redirect
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 2000);

      } catch (error) {
        showBootstrapModal(`❌ Login failed: ${error.message}`, "Error");
      }
    });
  }

  // 🙋 Personalize dashboard greeting

  function capitalize(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
  async function personalizeGreeting() {
    const titleElement = document.querySelector(".card-title");
    const referralSection = document.querySelector("#referralSection .card-title.mb-3 .acc");
  
    if (!titleElement) return;
  
    const token = localStorage.getItem("jwtToken");
    if (!token) return;
  
    try {
      const response = await fetch(`${CONFIG.API_URL}/users/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (!response.ok) throw new Error("Failed to fetch user");
  
      const data = await response.json();
      const user = data.user;
      const referredByCode = user.referredBy;
      const referralCode = user.referralCode;
  
      // Set referral code in the DOM
      if (referralSection) {
        referralSection.textContent = referralCode || "N/A";
      }
  
      // Fetch and show upline name
      getUplineName(referredByCode, token);
  
      // Capitalize user name and set greeting
      const fullName = `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
      titleElement.textContent = `Hi Consultant ${fullName}`;
    } catch (err) {
      console.error("❌ Error fetching user:", err.message);
    }
  }

  // Call it only if on dashboard
  personalizeGreeting();
 

  async function getUplineName(refferalCode, token) {
    const upline = document.querySelector("#uplineSection .card-title.mb-3");
    // console.log(upline)

    if (!upline) return;
  
    token = localStorage.getItem("jwtToken");
    // console.log(token)
    if (!token) return;
  
    try {
      const response = await fetch(`${CONFIG.API_URL}/users/upline-name/${refferalCode}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!response.ok) throw new Error("Failed to fetch upline name");
  
      const data = await response.text();
      // console.log(data)

      if (response.status === 500){
        upline.textContent = "No Upline Found";
        return;
      }

  
      if (upline){
      upline.textContent = capitalize(data);
      }
    } catch (err) {
      console.error("❌ Error fetching user:", err.message);
    }
  }


  
  // Helper function to capitalize first letter
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  


});
