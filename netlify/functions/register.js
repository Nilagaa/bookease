const {
  users,
  json,
  hashPassword
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const { username, password, fullName } = JSON.parse(event.body || "{}");

    const cleanUsername = String(username || "").trim().toLowerCase();
    const cleanName = String(fullName || "").trim();

    if (!cleanUsername || !password || !cleanName) {
      return json(400, {
        error: "Full name, username, and password are required."
      });
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return json(400, {
        error: "Username must be between 3 and 30 characters."
      });
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      return json(400, {
        error: "Username can only contain letters, numbers, and underscores."
      });
    }

    if (password.length < 8) {
      return json(400, {
        error: "Password must be at least 8 characters."
      });
    }

    const existingUser = await users.get(cleanUsername, {
      type: "json"
    });

    if (existingUser) {
      return json(409, {
        error: "Username is already taken."
      });
    }

    const passwordData = hashPassword(password);

    const user = {
      username: cleanUsername,
      fullName: cleanName,
      role: "customer",
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      createdAt: new Date().toISOString()
    };

    await users.setJSON(cleanUsername, user);

    return json(201, {
      success: true,
      message: "Account created successfully."
    });

  } catch (error) {
    console.error("Register error:", error);

    return json(500, {
      error: "Unable to create account."
    });
  }
};