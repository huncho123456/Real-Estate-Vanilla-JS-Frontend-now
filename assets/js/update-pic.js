import { CONFIG } from "./config.js"; 
import { token } from "./login.js";


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

  function replaceDefaultAvatars(user) {
    // ✅ fallback if backend didn't send a pic
    const profilePic = user.profilePicUrl || "../assets/img/avatars/1.png";
  
    // ✅ grab all <img> with that default src
    const defaultAvatars = document.querySelectorAll(`img[src="../assets/img/avatars/1.png"]`);
  
    defaultAvatars.forEach(img => {
      img.src = profilePic;
      console.log("Avatar updated:", img, "→", profilePic);
    });
  }
  
  
const user = await fetchUser(token);
console.log(user)
replaceDefaultAvatars(user)

