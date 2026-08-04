/** Shared UI helpers: toast notifications and the generic modal dialog. */

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = "toast"; }, 3200);
}

function badge(value) {
  if (!value) return "";
  return `<span class="badge badge-${value}">${value.replace("_", " ")}</span>`;
}

const Modal = {
  open(title, bodyHtml) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    document.getElementById("modalOverlay").classList.add("active");
  },
  close() {
    document.getElementById("modalOverlay").classList.remove("active");
    document.getElementById("modalBody").innerHTML = "";
  },
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modalClose").addEventListener("click", Modal.close);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") Modal.close();
  });
});

/** Runs an async action, shows a toast on success/error, and re-throws so callers can react. */
async function runAction(promise, successMsg) {
  try {
    const result = await promise;
    if (successMsg) showToast(successMsg, "success");
    return result;
  } catch (err) {
    showToast(err.message || "Something went wrong", "error");
    throw err;
  }
}
