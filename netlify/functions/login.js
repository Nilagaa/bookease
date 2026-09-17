const {
  users,
  sessions,
  json,
  verifyPassword,
  createSessionToken,
  sessionCookie
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    const cleanUsername = String(username || "")
      .trim()
      .toLowerCase();

    if (!cleanUsername || !password) {
      return json(400, {
        error: "Username and password are required."
      });
    }

    const user = await users.get(cleanUsername, {
      type: "json"
    });

    if (!user) {
      return json(401, {
        error: "Invalid username or password."
      });
    }

    const validPassword = verifyPassword(
      password,
      user.passwordHash,
      user.passwordSalt
    );

    if (!validPassword) {
      return json(401, {
        error: "Invalid username or password."
      });
    }

    const token = createSessionToken();

    await sessions.setJSON(token, {
      userKey: cleanUsername,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    return json(
      200,
      {
        success: true,
        role: user.role,
        username: user.username
      },
      {
        "Set-Cookie": sessionCookie(token)
      }
    );

  } catch (error) {
    console.error("Login error:", error);

    return json(500, {
      error: "Unable to log in."
    });
  }
};