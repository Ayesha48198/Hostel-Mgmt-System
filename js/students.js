/** Students feature module: list/search/render + create/edit/delete/room actions. */

async function loadStudents(query = "") {
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = `<tr><td colspan="9">Loading...</td></tr>`;
  try {
    const students = await StudentApi.list(query);
    if (!students.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-note">No students found.</td></tr>`;
      return;
    }
    tbody.innerHTML = students.map(studentRow).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9">Failed to load students: ${err.message}</td></tr>`;
  }
}

function studentRow(s) {
  return `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td>${s.course} (Yr ${s.year})</td>
      <td>${s.year}</td>
      <td>${s.room_id ?? "—"}</td>
      <td>${badge(s.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" onclick="openEditStudentModal(${s.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="handleDeleteStudent(${s.id})">Delete</button>
      </td>
    </tr>`;
}

function studentFormHtml(s = {}) {
  return `
    <form id="studentForm">
      <div class="form-row">
        <div class="form-group"><label>Full Name</label><input name="name" value="${s.name || ""}" required></div>
        <div class="form-group"><label>Email</label><input type="email" name="email" value="${s.email || ""}" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Phone</label><input name="phone" value="${s.phone || ""}" required></div>
        <div class="form-group"><label>Gender</label>
          <select name="gender">
            <option value="male" ${s.gender === "male" ? "selected" : ""}>Male</option>
            <option value="female" ${s.gender === "female" ? "selected" : ""}>Female</option>
            <option value="other" ${s.gender === "other" ? "selected" : ""}>Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Course</label><input name="course" value="${s.course || ""}" required></div>
        <div class="form-group"><label>Year</label><input type="number" name="year" min="1" max="6" value="${s.year || 1}" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Guardian Name</label><input name="guardian_name" value="${s.guardian_name || ""}" required></div>
        <div class="form-group"><label>Guardian Phone</label><input name="guardian_phone" value="${s.guardian_phone || ""}" required></div>
      </div>
      <div class="form-group"><label>Address</label><textarea name="address" rows="2">${s.address || ""}</textarea></div>
      <div id="studentFormError" class="form-error"></div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="submit" class="btn btn-primary">${s.id ? "Save Changes" : "Add Student"}</button>
      </div>
    </form>`;
}

function openAddStudentModal() {
  Modal.open("Add Student", studentFormHtml());
  bindStudentForm(null);
}

async function openEditStudentModal(id) {
  const s = await runAction(StudentApi.get(id));
  Modal.open("Edit Student", studentFormHtml(s));
  bindStudentForm(id);
}

function bindStudentForm(id) {
  document.getElementById("studentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.year = parseInt(data.year, 10);
    try {
      if (id) await StudentApi.update(id, data);
      else await StudentApi.create(data);
      Modal.close();
      showToast(id ? "Student updated" : "Student added", "success");
      loadStudents(document.getElementById("studentSearch").value);
    } catch (err) {
      document.getElementById("studentFormError").textContent = err.message;
    }
  });
}

async function handleDeleteStudent(id) {
  if (!confirm("Delete this student? This cannot be undone.")) return;
  await runAction(StudentApi.remove(id), "Student deleted");
  loadStudents(document.getElementById("studentSearch").value);
}
