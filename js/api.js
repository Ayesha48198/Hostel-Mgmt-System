/**
 * Thin API client — single place that knows the backend base URL and
 * how to talk HTTP. Every feature module (students.js, rooms.js, ...)
 * goes through this instead of calling fetch() directly.
 */
const API_ROOT_URL = "http://localhost:8000";
const API_BASE_URL = `${API_ROOT_URL}/api/v1`;

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(path, options = {}) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (res.status === 204) return null;

    let body = null;
    try { body = await res.json(); } catch (_) { /* no body */ }

    if (!res.ok) {
      const message = (body && body.detail) ? body.detail : `Request failed (${res.status})`;
      throw new Error(message);
    }
    return body;
  }

  get(path) { return this.request(path, { method: "GET" }); }
  post(path, data) { return this.request(path, { method: "POST", body: JSON.stringify(data) }); }
  put(path, data) { return this.request(path, { method: "PUT", body: JSON.stringify(data) }); }
  patch(path, data) { return this.request(path, { method: "PATCH", body: JSON.stringify(data) }); }
  delete(path) { return this.request(path, { method: "DELETE" }); }
}

const api = new ApiClient(API_BASE_URL);

// Namespaced endpoint helpers per resource (keeps feature modules clean)
const StudentApi = {
  list: (q) => api.get(q ? `/students?q=${encodeURIComponent(q)}` : "/students"),
  get: (id) => api.get(`/students/${id}`),
  create: (data) => api.post("/students", data),
  update: (id, data) => api.put(`/students/${id}`, data),
  remove: (id) => api.delete(`/students/${id}`),
  allocateRoom: (studentId, roomId) => api.post(`/students/${studentId}/allocate-room/${roomId}`),
  vacateRoom: (studentId) => api.post(`/students/${studentId}/vacate-room`),
};

const RoomApi = {
  list: (availableOnly) => api.get(`/rooms${availableOnly ? "?available_only=true" : ""}`),
  get: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post("/rooms", data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  remove: (id) => api.delete(`/rooms/${id}`),
};

const FeeApi = {
  list: (pendingOnly) => api.get(`/fees${pendingOnly ? "?pending_only=true" : ""}`),
  create: (data) => api.post("/fees", data),
  pay: (id, data) => api.post(`/fees/${id}/pay`, data),
  remove: (id) => api.delete(`/fees/${id}`),
};

const ComplaintApi = {
  list: (status) => api.get(`/complaints${status ? `?status=${status}` : ""}`),
  create: (data) => api.post("/complaints", data),
  updateStatus: (id, status) => api.patch(`/complaints/${id}/status`, { status }),
  remove: (id) => api.delete(`/complaints/${id}`),
};

const AttendanceApi = {
  list: (date) => api.get(`/attendance${date ? `?date_=${date}` : ""}`),
  create: (data) => api.post("/attendance", data),
  updateStatus: (id, status) => api.patch(`/attendance/${id}`, { status }),
  remove: (id) => api.delete(`/attendance/${id}`),
};
