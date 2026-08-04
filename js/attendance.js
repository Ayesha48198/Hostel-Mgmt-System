/** Attendance feature module. */

async function loadAttendance(date = "") {
  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = `<tr><td colspan="6">Loading...</td></tr>`;
  try {
    const records = await AttendanceApi.list(date);
    if (!records.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-note">No attendance records found.</td></tr>`;
      return;
    }
    tbody.innerHTML = records.map(attendanceRow).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6">Failed to load attendance: ${err.message}</td></tr>`;
  }
}

function attendanceRow(a) {
  return `
    <tr>
      <td>${a.id}</td>
      <td>${a.student_id}</td>
      <td>${a.date}</td>
      <td>${badge(a.status)}</td>
      <td>${a.marked_by}</td>
      <td class="actions-cell">
        <select onchange="handleUpdateAttendanceStatus(${a.id}, this.value)">
          <option value="">Change status...</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>
        <button class="btn btn-sm btn-danger" onclick="handleDeleteAttendance(${a.id})">Delete</button>
      </td>
    </tr>`;
}

function attendanceFormHtml() {
  const today = new Date().toISOString().split("T")[0];
  return `
    <form id="attendanceForm">
      <div class="form-row">
        <div class="form-group"><label>Student ID</label><input type="number" name="student_id" required></div>
        <div class="form-group"><label>Date</label><input type="date" name="date" value="${today}" required></div>
      </div>
      <div class="form-group"><label>Status</label>
        <select name="status">
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>
      </div>
      <div id="attendanceFormError" class="form-error"></div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="submit" class="btn btn-primary">Mark Attendance</button>
      </div>
    </form>`;
}

function openAddAttendanceModal() {
  Modal.open("Mark Attendance", attendanceFormHtml());
  document.getElementById("attendanceForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.student_id = parseInt(data.student_id, 10);
    try {
      await AttendanceApi.create(data);
      Modal.close();
      showToast("Attendance marked", "success");
      loadAttendance(document.getElementById("attendanceDateFilter").value);
    } catch (err) {
      document.getElementById("attendanceFormError").textContent = err.message;
    }
  });
}

async function handleUpdateAttendanceStatus(id, status) {
  if (!status) return;
  await runAction(AttendanceApi.updateStatus(id, status), "Attendance updated");
  loadAttendance(document.getElementById("attendanceDateFilter").value);
}

async function handleDeleteAttendance(id) {
  if (!confirm("Delete this attendance record?")) return;
  await runAction(AttendanceApi.remove(id), "Attendance record deleted");
  loadAttendance(document.getElementById("attendanceDateFilter").value);
}
