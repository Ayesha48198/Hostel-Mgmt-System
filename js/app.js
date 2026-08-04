/** App shell: navigation between pages, initial data loads, and button bindings. */

const PAGE_TITLES = {
  dashboard: "Dashboard",
  students: "Students",
  rooms: "Rooms",
  fees: "Fee Management",
  complaints: "Complaints",
  attendance: "Attendance",
};

const PAGE_LOADERS = {
  dashboard: () => loadDashboard(),
  students: () => loadStudents(document.getElementById("studentSearch").value),
  rooms: () => loadRooms(document.getElementById("availableOnlyToggle").checked),
  fees: () => loadFees(document.getElementById("pendingOnlyToggle").checked),
  complaints: () => loadComplaints(document.getElementById("complaintStatusFilter").value),
  attendance: () => loadAttendance(document.getElementById("attendanceDateFilter").value),
};

function navigateTo(page) {
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.page === page));
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === `page-${page}`));
  document.getElementById("pageTitle").textContent = PAGE_TITLES[page];
  document.getElementById("sidebar").classList.remove("open");
  PAGE_LOADERS[page]();
}

async function checkApiHealth() {
  const el = document.getElementById("apiStatus");
  try {
    const res = await fetch(`${API_ROOT_URL}/health`);
    if (!res.ok) throw new Error("unhealthy");
    el.textContent = "● API connected";
    el.className = "api-status ok";
  } catch (_) {
    el.textContent = "● API unreachable";
    el.className = "api-status err";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Nav
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.page));
  });
  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });

  // Toolbars
  document.getElementById("studentSearch").addEventListener("input", (e) => loadStudents(e.target.value));
  document.getElementById("btnAddStudent").addEventListener("click", openAddStudentModal);

  document.getElementById("availableOnlyToggle").addEventListener("change", (e) => loadRooms(e.target.checked));
  document.getElementById("btnAddRoom").addEventListener("click", openAddRoomModal);

  document.getElementById("pendingOnlyToggle").addEventListener("change", (e) => loadFees(e.target.checked));
  document.getElementById("btnAddFee").addEventListener("click", openAddFeeModal);

  document.getElementById("complaintStatusFilter").addEventListener("change", (e) => loadComplaints(e.target.value));
  document.getElementById("btnAddComplaint").addEventListener("click", openAddComplaintModal);

  document.getElementById("attendanceDateFilter").addEventListener("change", (e) => loadAttendance(e.target.value));
  document.getElementById("btnAddAttendance").addEventListener("click", openAddAttendanceModal);

  // Initial load
  checkApiHealth();
  loadDashboard();
});
