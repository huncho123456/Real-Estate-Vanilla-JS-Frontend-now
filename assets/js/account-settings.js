import { CONFIG } from "./config.js"; 
import { token } from "./login.js";

console.log("Token:", token);

// 👉 Elements
const uploadInput = document.getElementById("upload");
const uploadedAvatar = document.getElementById("uploadedAvatar");
const resetButton = document.querySelector(".account-image-reset");
const saveButton = document.querySelector("#formAccountSettings button[type='submit']");
const navAvatar = document.querySelector(".avatar img");

// 👉 Form fields
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phoneNumber");
const accountNameInput = document.getElementById("accountName");
const accountNumberInput = document.getElementById("accountNumber");
const referralCodeInput = document.getElementById("referralCode");
const roleInput = document.getElementById("role");
const activeInput = document.getElementById("active");

// 👉 Fetch user account info
async function fetchUser(token) {
  try {
    const response = await fetch(`${CONFIG.API_URL}/users/account`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Failed to connect to user account:", error);
    showBootstrapModal(`❌ Failed to connect: ${error.message}`, "Error");
    return null;
  }
}

function showBootstrapModal(message, title = "Notification") {
    // Set modal title & body
    const modalTitle = document.getElementById("responseModalLabel");
    const modalBody = document.getElementById("modalMessage");
  
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = message;
  
    // Initialize & show modal
    const modal = new bootstrap.Modal(document.getElementById("responseModal"));
    modal.show();
  }

  function updateNavbarUser(user) {
    const navAvatar = document.querySelector(".avatar img"); // navbar profile picture
    const navName = document.querySelector(".flex-grow-1 h6"); // name
    const navRole = document.querySelector(".flex-grow-1 small"); // role text
  
    if (navAvatar && user.profilePictureUrl) {
      navAvatar.src = user.profilePictureUrl;
    }
  
    if (navName) {
      navName.textContent = `${user.firstName} ${user.lastName}`;
    }
  
    if (navRole) {
      navRole.textContent = user.role || "User";
    }
  }
  

// 👉 Populate form + avatars
function populateForm(user) {
  firstNameInput.value = user.firstName || "";
  lastNameInput.value = user.lastName || "";
  emailInput.value = user.email || "";
  phoneInput.value = user.phoneNumber || "";
  accountNameInput.value = user.accountName || "";
  accountNumberInput.value = user.accountNumber || "";
  referralCodeInput.value = user.referralCode || "";
  roleInput.value = user.role || "";
  activeInput.value = user.active ? "Active" : "Inactive";

  // ✅ Handle profile picture (existing or fallback)
  const profilePic = user.profilePicUrl || "../assets/img/avatars/1.png";
  uploadedAvatar.src = profilePic;
  if (navAvatar) navAvatar.src = profilePic;
}

// 👉 Collect updated form data
function getFormData() {
  return {
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    email: emailInput.value,
    phoneNumber: phoneInput.value,
    accountName: accountNameInput.value,
    accountNumber: accountNumberInput.value,
    referralCode: referralCodeInput.value,
    role: roleInput.value,
    active: activeInput.value === "Active"
  };
}

// 👉 Self-invoking async block
(async () => {
  let user = await fetchUser(token);
  if (!user) return;

  populateForm(user);
  updateNavbarUser(user);

  // ✅ Save changes with PUT request
  saveButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const updatedUser = getFormData();
    console.log("Sending update:", updatedUser);

    try {
      const response = await fetch(`${CONFIG.API_URL}/users/update`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
      });

      if (!response.ok) throw new Error(`Update failed: ${response.status}`);

      const result = await response.json();
      console.log("Update success:", result);

      // ✅ Refresh form + avatars with latest user data
      user = await fetchUser(token);
      if (user) populateForm(user);

      showBootstrapModal("✅ Profile updated successfully!", "Success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showBootstrapModal(`❌ Update failed: ${error.message}`, "Error");
    }
  });

  // ✅ Upload Profile Picture
  let currentProfilePic = user.profilePicUrl || "../assets/img/avatars/1.png";

  // ✅ Upload Profile Picture
  uploadInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    // ✅ File size check (max 800KB)
    if (file.size > 800 * 1024) {
      showBootstrapModal("❌ File is too large! Max size is 800KB.", "Error");
      uploadInput.value = ""; // reset input field
  
      // ✅ Reset preview back to saved user picture or fallback
      uploadedAvatar.src = currentProfilePic;
  
      return;
    }
  

    // ✅ Local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedAvatar.src = e.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
        
        const response = await fetch(`${CONFIG.API_URL}/users/${user.id}/profile-picture`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      // ✅ Refresh from backend to get final Cloudinary URL
      user = await fetchUser(token);
      if (user) populateForm(user);

      showBootstrapModal("✅ Profile picture uploaded successfully!", "Success");
    } catch (error) {
        const myerror = "All fields are required";
      console.error("Error uploading file:", error);
      showBootstrapModal(`❌ Upload failed: ${myerror}`, "Error");
    }
  });

  // ✅ Reset/Delete Profile Picture
  resetButton.addEventListener("click", async () => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/users/${user.id}/profile-picture`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Delete failed");

      uploadedAvatar.src = "../assets/img/avatars/1.png"; 
      if (navAvatar) navAvatar.src = "../assets/img/avatars/1.png";

    //   showBootstrapModal("✅ Profile picture deleted successfully!", "Success");
    } catch (error) {
      console.error("Error deleting file:", error);
      showBootstrapModal(`❌ Delete failed: ${error.message}`, "Error");
    }
  });
})();
