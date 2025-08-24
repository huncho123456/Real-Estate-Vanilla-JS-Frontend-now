import { CONFIG } from "./config.js";
import { token } from "./login.js";

document.addEventListener("DOMContentLoaded", async () => {
  const userContainer = document.getElementById("userContainer");

  try {
    // 1. Fetch user account info
    const accountResponse = await fetch(`${CONFIG.API_URL}/users/account`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!accountResponse.ok) throw new Error("Failed to fetch account info");
    const user = await accountResponse.json();
    const CODE = user.user.referralCode;

    // 2. Fetch downlines using the referral code
    const downlineResponse = await fetch(`${CONFIG.API_URL}/users/downlines/level/2/${CODE}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!downlineResponse.ok) throw new Error("Failed to fetch downlines");
    const downlines = await downlineResponse.json();

    if (!downlines.length) {
      userContainer.innerHTML = "<p>No downlines found.</p>";
      return;
    }

    // 3. Helper function to fetch upline name
    async function fetchName(code, jwt) {
      try {
        const response = await fetch(`${CONFIG.API_URL}/users/upline-name/${code}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.text();
        return data;
      } catch (error) {
        console.error("Error fetching name:", error);
        return "Unknown";
      }
    }

    // 4. Fetch all upline names first
    const uplineNames = await Promise.all(
      downlines.map(d => fetchName(d.referredBy, token))
    );

    // 5. Build the table HTML
    const tableHTML = `
      <div class="card">
        <h5 class="card-header">Downlines</h5>
        <div class="table-responsive text-nowrap">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Upline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${downlines.map((d, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${d.firstName} ${d.lastName}</td>
                  <td>${d.email}</td>
                  <td>${d.phoneNumber}</td>
                  <td>${uplineNames[i]}</td>
                  <td>
                    <span class="badge bg-${d.active ? 'success' : 'secondary'}">
                      ${d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    userContainer.innerHTML = tableHTML;

  } catch (error) {
    console.error(error);
    userContainer.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
});
