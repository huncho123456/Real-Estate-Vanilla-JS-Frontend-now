import { CONFIG } from "./config.js";
import { token } from "./login.js";

document.addEventListener("DOMContentLoaded", async () => {
  const userContainer = document.getElementById("userContainer");
  const numberElement = document.querySelector(".number strong");

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
    const downlineResponse = await fetch(`${CONFIG.API_URL}/users/downlines/${CODE}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!downlineResponse.ok) throw new Error("Failed to fetch downlines");
    const downlines = await downlineResponse.json();

    const numberOfDownlines = downlines.length;
    console.log("Total downlines:", numberOfDownlines);

    if (numberElement) {
      numberElement.textContent = numberOfDownlines;
    }

    if (!downlines.length) {
      userContainer.innerHTML = "<p>No downlines found.</p>";
      return;
    }

    // 3. Create Bootstrap table
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

const numberOfDownlines = downlines.length;
console.log("Total downlines:", numberOfDownlines);
