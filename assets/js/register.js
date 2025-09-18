import {CONFIG} from "./config.js";


document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggle();
    autofillReferralCode();
    setupFormSubmission();
  });

async function Token() {
    const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "micheal@mailinator.com",
        password: "password"
      })
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get token: ${response.status} - ${error}`);
    }
  
    const data = await response.json();
    localStorage.setItem("jwtToken", data.token);
    
    
    return data.token;
    
  }

  let token = Token()
  // console.log(token)


// 🧾 Handle Registration Form Submission
function setupFormSubmission() {
  const form = document.getElementById("formAuthentication");
  const btn = document.getElementById("lazyBtn");
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".spinner-border");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 🔵 Show loading state
    btn.disabled = true;
    btnText.textContent = "Loading...";
    spinner.classList.remove("d-none");

    const data = {
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      phoneNumber: document.getElementById("phoneNumber").value.trim(),
      dateOfBirth: document.getElementById("dateOfBirth").value,
      sex: document.getElementById("sex").value,
      maritalStatus: document.getElementById("maritalStatus").value,
      homeAddress: document.getElementById("homeAddress").value.trim(),
      bankName: document.getElementById("bankName").value.trim(),
      accountNumber: document.getElementById("accountNumber").value.trim(),
      accountName: document.getElementById("accountName").value.trim(),
      employmentStatus: document.getElementById("employmentStatus").value,
      referredBy: document.getElementById("referredBy").value.trim(),
    };

    try {
      await registerUser(data);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      // 🔵 Reset button after response
      btn.disabled = false;
      btnText.textContent = "Submit";
      spinner.classList.add("d-none");
    }
  });
}

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

// ✅ Fetch Upline Name
async function fetchName(code) {
  try {
    const jwt = localStorage.getItem("jwtToken") || await getToken();
    const response = await fetch(`${CONFIG.API_URL}/users/upline-name/${code}`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    const display = document.getElementById("uplineNameDisplay");
    if (!response.ok) throw new Error(await response.text() || "Referral code not found");

    const name = await response.text();
    display.textContent = `✅ Upline - ${name}`;
  } catch (error) {
    console.error("Upline fetch failed:", error.message);
    document.getElementById("uplineNameDisplay").textContent = "❌ Invalid referral code.";
  }
}

  // 🌐 Autofill Referral Code and Display Upline
function autofillReferralCode() {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get("ref")?.trim();

  const referredByVisible = document.getElementById("referredByVisible");
  const referredByHidden = document.getElementById("referredBy");

  if (referralCode && referredByVisible && referredByHidden) {
    referredByVisible.value = referralCode;
    referredByHidden.value = referralCode;
    fetchName(referralCode);
  }

  const uplineNameDisplay = document.getElementById("uplineNameDisplay");

  if (uplineNameDisplay && referredByHidden) {
    referredByHidden.addEventListener("blur", () => {
      const code = referredByHidden.value.trim();
      if (code) {
        uplineNameDisplay.textContent = "⏳ Loading...";
        fetchName(code);
      } else {
        uplineNameDisplay.textContent = "";
      }
    });
  }
}

export async function registerUser(data) {
  const jwt = await Token();
  console.log("JWT being sent:", jwt);

  try {
    const response = await fetch(`${CONFIG.API_URL}/auth/registers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(data),
    });

    const text = await response.text();
    console.log("Raw response body:", text);  // Already exists
    
    let result;
    try {
      result = JSON.parse(text);
      console.log("✅ Parsed result object:", result); // <-- ADD THIS
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err.message);
      showBootstrapModal("⚠️ Server returned invalid JSON", "Unexpected Error");
      return;
    }
    
    if (response.ok) {
      // Debug: Check structure before accessing nested data
      if (result && result.user && result.user.email) {
        showBootstrapModal(
          `🎉 Hang tight! We're sending a welcome email to <strong>${result.user.email}</strong>.`,
          "Welcome Aboard!"
        );
      } else {
        console.warn("⚠️ 'user' or 'email' missing from result:", result);
    
        showBootstrapModal(
          `🎉 Registration successful, but email is missing from response.`,
          "Welcome Aboard!"
        );
      }
    
      refreshApp(3000);
    
    } else {
      const errorMessage = result?.message || "An unknown error occurred.";
      console.error("❌ Registration failed:", result);
      showBootstrapModal(`❌ ${errorMessage}`, "Registration Failed");
    }
    
  } catch (error) {
    console.error("❌ Network/Server error:", error);
    showBootstrapModal(`⚠️ ${error.message || "Server error."}`, "Request Failed");
  }

  
}



// ✅ Bootstrap Modal Utility§
function showBootstrapModal(message, title = "Notification") {
    document.getElementById("responseModalLabel").textContent = title;
    document.getElementById("modalMessage").innerHTML = message;
    new bootstrap.Modal(document.getElementById("responseModal")).show();
  }

function refreshApp(delay) {
  setTimeout(() => {
    window.location.href = "pages-misc-error%20copy.html"; 
  }, delay);
}


