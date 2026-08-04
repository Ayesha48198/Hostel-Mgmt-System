/** Fees feature module. */

async function loadFees(pendingOnly = false) {
  const tbody = document.getElementById("feesTableBody");
  tbody.innerHTML = `<tr><td colspan="9">Loading...</td></tr>`;
  try {
    const fees = await FeeApi.list(pendingOnly);
    if (!fees.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-note">No fee records found.</td></tr>`;
      return;
    }
    tbody.innerHTML = fees.map(feeRow).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9">Failed to load fees: ${err.message}</td></tr>`;
  }
}

function feeRow(f) {
  return `
    <tr>
      <td>${f.id}</td>
      <td>${f.student_id}</td>
      <td>$${f.amount}</td>
      <td>${f.month}/${f.year}</td>
      <td>${f.due_date}</td>
      <td>${badge(f.status)}</td>
      <td>${f.paid_date || "—"}</td>
      <td>${f.payment_method || "—"}</td>
      <td class="actions-cell">
        ${f.status !== "paid" ? `<button class="btn btn-sm btn-success" onclick="openPayFeeModal(${f.id})">Mark Paid</button>` : ""}
        <button class="btn btn-sm btn-danger" onclick="handleDeleteFee(${f.id})">Delete</button>
      </td>
    </tr>`;
}

function feeFormHtml() {
  return `
    <form id="feeForm">
      <div class="form-group"><label>Student ID</label><input type="number" name="student_id" required></div>
      <div class="form-row">
        <div class="form-group"><label>Amount</label><input type="number" step="0.01" name="amount" required></div>
        <div class="form-group"><label>Due Date</label><input type="date" name="due_date" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Month</label><input type="number" name="month" min="1" max="12" required></div>
        <div class="form-group"><label>Year</label><input type="number" name="year" min="2000" required value="${new Date().getFullYear()}"></div>
      </div>
      <div id="feeFormError" class="form-error"></div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Fee Record</button>
      </div>
    </form>`;
}

function openAddFeeModal() {
  Modal.open("Add Fee Record", feeFormHtml());
  document.getElementById("feeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    data.student_id = parseInt(data.student_id, 10);
    data.amount = parseFloat(data.amount);
    data.month = parseInt(data.month, 10);
    data.year = parseInt(data.year, 10);
    try {
      await FeeApi.create(data);
      Modal.close();
      showToast("Fee record added", "success");
      loadFees(document.getElementById("pendingOnlyToggle").checked);
    } catch (err) {
      document.getElementById("feeFormError").textContent = err.message;
    }
  });
}

function openPayFeeModal(feeId) {
  Modal.open("Record Payment", `
    <form id="payForm">
      <div class="form-group"><label>Payment Method</label>
        <select name="payment_method">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="online">Online</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>
      <div id="payFormError" class="form-error"></div>
      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="Modal.close()">Cancel</button>
        <button type="submit" class="btn btn-primary">Confirm Payment</button>
      </div>
    </form>`);
  document.getElementById("payForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    try {
      await FeeApi.pay(feeId, data);
      Modal.close();
      showToast("Payment recorded", "success");
      loadFees(document.getElementById("pendingOnlyToggle").checked);
    } catch (err) {
      document.getElementById("payFormError").textContent = err.message;
    }
  });
}

async function handleDeleteFee(id) {
  if (!confirm("Delete this fee record?")) return;
  await runAction(FeeApi.remove(id), "Fee record deleted");
  loadFees(document.getElementById("pendingOnlyToggle").checked);
}
