async function api(path, options = {}) {
  const response = await fetch("/api" + path, {
    credentials: "same-origin",

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },

    ...options
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}


function showMessage(element, message, type = "error") {
  element.textContent = message;

  element.className =
    "message " +
    (type === "success"
      ? "message-success"
      : "message-error");
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function statusClass(status) {
  return "status-" +
    String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");
}


function formatDate(date) {
  if (!date) return "";

  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}