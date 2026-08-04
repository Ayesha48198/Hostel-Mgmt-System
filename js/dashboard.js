/** Dashboard: aggregates data from the other endpoints into summary stats. */

async function loadDashboard() {
  const statsGrid = document.getElementById("statsGrid");
  const recentComplaintsEl = document.getElementById("recentComplaints");
  const recentFeesEl = document.getElementById("recentFees");

  statsGrid.innerHTML = `<div class="stat-card"><div class="label">Loading...</div></div>`;
  try {
    const [students, rooms, fees, complaints] = await Promise.all([
      StudentApi.list(),
      RoomApi.list(),
      FeeApi.list(),
      ComplaintApi.list(),
    ]);

    const pendingFees = fees.filter(f => f.status !== "paid");
    const openComplaints = complaints.filter(c => c.status !== "resolved");
    const availableRooms = rooms.filter(r => r.status === "available");

    statsGrid.innerHTML = `
      ${statCard("Total Students", students.length)}
      ${statCard("Available Rooms", `${availableRooms.length}/${rooms.length}`)}
      ${statCard("Pending Fees", pendingFees.length)}
      ${statCard("Open Complaints", openComplaints.length)}
    `;

    recentComplaintsEl.innerHTML = openComplaints.slice(0, 5).map(c =>
      `<div class="mini-item"><span>#${c.id} ${c.title}</span>${badge(c.status)}</div>`
    ).join("") || `<div class="empty-note">No open complaints 🎉</div>`;

    recentFeesEl.innerHTML = pendingFees.slice(0, 5).map(f =>
      `<div class="mini-item"><span>Student ${f.student_id} — $${f.amount}</span>${badge(f.status)}</div>`
    ).join("") || `<div class="empty-note">No pending fees 🎉</div>`;
  } catch (err) {
    statsGrid.innerHTML = `<div class="stat-card"><div class="label">Failed to load stats</div><div class="value">—</div></div>`;
    showToast(`Dashboard error: ${err.message}`, "error");
  }
}

function statCard(label, value) {
  return `<div class="stat-card"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}
