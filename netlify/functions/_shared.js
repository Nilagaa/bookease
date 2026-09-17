const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

const users = getStore("users");
const bookings = getStore("bookings");
const sessions = getStore("sessions");

function json(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    },
    body: JSON.stringify(data)
  };
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return {
    salt,
    hash
  };
}

function verifyPassword(password, storedHash, salt) {
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

function createSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getCookie(event, name) {
  const cookieHeader =
    event.headers?.cookie ||
    event.headers?.Cookie ||
    "";

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

async function getCurrentUser(event) {
  const token = getCookie(event, "session");

  if (!token) {
    return null;
  }

  const session = await sessions.get(token, { type: "json" });

  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    await sessions.delete(token);
    return null;
  }

  const user = await users.get(session.userKey, { type: "json" });

  if (!user) {
    await sessions.delete(token);
    return null;
  }

  return {
    ...user,
    userKey: session.userKey,
    sessionToken: token
  };
}

function sessionCookie(token) {
  return `session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`;
}

function clearSessionCookie() {
  return "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

module.exports = {
  users,
  bookings,
  sessions,
  json,
  hashPassword,
  verifyPassword,
  createSessionToken,
  getCookie,
  getCurrentUser,
  sessionCookie,
  clearSessionCookie
};