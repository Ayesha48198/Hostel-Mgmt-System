/** Rooms feature module. */

async function loadRooms(availableOnly = false) {
  const tbody = document.getElementById("roomsTableBody");
  tbody.innerHTML = `<tr><td colspan="10">Loading...</td></tr>`;
  try {
    const rooms = await RoomApi.list(availableOnly);
    if (!rooms.length) {
      tbody.innerHTML = `<tr><td colspan="10" class="empty-note">No rooms found.</td></tr>`;
      return;
    }
    tbody.innerHTML = rooms.map(roomRow).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10">Failed to load rooms: ${err.message}</td></tr>`;
  }
}

function roomRow(r) {
  return `
    <tr>
      <td>${r.id}</td>
      <td>${r.room_number}</td>
      <td>${r.room_type}</td>
      <td>${r.floor}</td>
      <td>${r.capacity}</td>
      <td>${r.occupied_count}</td>
      <td>${r.available_slots}</td>
      <td>$${r.fee_per_month}</td>
      <td>${badge(r.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-sm btn-outline" onclick="openEditRoomModal(${r.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="handleDeleteRoom(${r.id})">Delete</button>
      </td>
    </tr>`;
}

function roomFormHtml(r = {}) {
  return `
    <form id="roomForm">
      <div class="form-row">
        <div class="form-group"><label>Room Number</label><input name="room_number" value="${r.room_number || ""}" required ${r.id ? "readonly" : ""}></div>
        <div class="form-group"><label>Room Type</label>
          <select name="room_type">
            ${["single","double","triple","dormitory"].map(t => `<option value="${t}" ${r.room_type===t?"selected":""}>${t}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Floor</label><input type="number" name="floor" min="0" value="${r.floor ?? 1}" required></div>
        <div class="form-group"><label>Capacity</label><input type="number" name="capacity" min="1" value="${r.capacity ?? 1}" required></div>
      </div>
      <div class="form-group"><label>Fee per Month</label><input type="number" step="0.01" name="fee_per_month" value="${r.fee_per_month ?? 0}" required></div>
      <div id="roomFormError" class="form-error"></div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="submit" class="btn btn-primary">${r.id ? "Save Changes" : "Add Room"}</button>
      </div>
    </form>`;
}

function openAddRoomModal() {
  Modal.open("Add Room", roomFormHtml());
  bindRoomForm(null);
}

async function openEditRoomModal(id) {
  const r = await runAction(RoomApi.get(id));
  Modal.open("Edit Room", roomFormHtml(r));
  bindRoomForm(id);
}

function bindRoomForm(id) {
  document.getElementById("roomForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.floor = parseInt(data.floor, 10);
    data.capacity = parseInt(data.capacity, 10);
    data.fee_per_month = parseFloat(data.fee_per_month);
    if (id) delete data.room_number; // read-only on edit
    try {
      if (id) await RoomApi.update(id, data);
      else await RoomApi.create(data);
      Modal.close();
      showToast(id ? "Room updated" : "Room added", "success");
      loadRooms(document.getElementById("availableOnlyToggle").checked);
    } catch (err) {
      document.getElementById("roomFormError").textContent = err.message;
    }
  });
}

async function handleDeleteRoom(id) {
  if (!confirm("Delete this room?")) return;
  await runAction(RoomApi.remove(id), "Room deleted");
  loadRooms(document.getElementById("availableOnlyToggle").checked);
}
