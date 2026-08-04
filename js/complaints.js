/** Complaints feature module. */

async function loadComplaints(status = "") {
  const tbody = document.getElementById("complaintsTableBody");
  tbody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;
  try {
    const complaints = await ComplaintApi.list(status);
    if (!complaints.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-note">No complaints found.</td></tr>`;
      return;
    }
    tbody.innerHTML = complaints.map(complaintRow).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7">Failed to load complaints: ${err.message}</td></tr>`;
  }
}

function complaintRow(c) {
  return `
    <tr>
      <td>${c.id}</td>
      <td>${c.student_id}</td>
      <td>${c.title}</td>
      <td>${c.category}</td>
      <td>${badge(c.priority)}</td>
      <td>${badge(c.status)}</td>
      <td class="actions-cell">
        ${c.status === "open" ? `<button class="btn btn-sm btn-warning" onclick="handleUpdateComplaintStatus(${c.id}, 'in_progress')">Start</button>` : ""}
        ${c.status !== "resolved" ? `<button class="btn btn-sm btn-success" onclick="handleUpdateComplaintStatus(${c.id}, 'resolved')">Resolve</button>` : ""}
        <button class="btn btn-sm btn-danger" onclick="handleDeleteComplaint(${c.id})">Delete</button>
      </td>
    </tr>`;
}

function complaintFormHtml() {
  return `
    <form id="complaintForm">
      <div class="form-group"><label>Student ID</label><input type="number" name="student_id" required></div>
      <div class="form-group"><label>Title</label><input name="title" required></div>
      <div class="form-group"><label>Description</label><textarea name="description" rows="3" required></textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Category</label><input name="category" placeholder="e.g. Electrical" required></div>
        <div class="form-group"><label>Priority</label>
          <select name="priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div id="complaintFormError" class="form-error"></div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Complaint</button>
      </div>
    </form>`;
}

function openAddComplaintModal() {
  Modal.open("New Complaint", complaintFormHtml());
  document.getElementById("complaintForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.student_id = parseInt(data.student_id, 10);
    try {
      await ComplaintApi.create(data);
      Modal.close();
      showToast("Complaint submitted", "success");
      loadComplaints(document.getElementById("complaintStatusFilter").value);
    } catch (err) {
      document.getElementById("complaintFormError").textContent = err.message;
    }
  });
}

async function handleUpdateComplaintStatus(id, status) {
  await runAction(ComplaintApi.updateStatus(id, status), "Complaint status updated");
  loadComplaints(document.getElementById("complaintStatusFilter").value);
}

async function handleDeleteComplaint(id) {
  if (!confirm("Delete this complaint?")) return;
  await runAction(ComplaintApi.remove(id), "Complaint deleted");
  loadComplaints(document.getElementById("complaintStatusFilter").value);
}
