const {
  users,
  json,
  hashPassword
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, {
      error: "Method not allowed"
    });
  }

  try {
    const {
      setupSecret,
      username,
      password,
      fullName
    } = JSON.parse(event.body || "{}");

    if (!setupSecret || setupSecret !== process.env.ADMIN_SETUP_SECRET) {
      return json(403, {
        error: "Invalid setup secret."
      });
    }

    const cleanUsername = String(username || "")
      .trim()
      .toLowerCase();

    const cleanName = String(fullName || "").trim();

    if (!cleanUsername || !password || !cleanName) {
      return json(400, {
        error: "All fields are required."
      });
    }

    if (password.length < 8) {
      return json(400, {
        error: "Admin password must be at least 8 characters."
      });
    }

    const existing = await users.get(cleanUsername, {
      type: "json"
    });

    if (existing) {
      return json(409, {
        error: "That username already exists."
      });
    }

    const passwordData = hashPassword(password);

    const admin = {
      username: cleanUsername,
      fullName: cleanName,
      role: "admin",
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      createdAt: new Date().toISOString()
    };

    await users.setJSON(cleanUsername, admin);

    return json(201, {
      success: true,
      message: "Admin account created."
    });

  } catch (error) {
    console.error("Setup admin error:", error);

    return json(500, {
      error: "Unable to create admin."
    });
  }
};