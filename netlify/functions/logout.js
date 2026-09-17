const {
  sessions,
  json,
  getCookie,
  clearSessionCookie
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, {
      error: "Method not allowed"
    });
  }

  try {
    const token = getCookie(event, "session");

    if (token) {
      await sessions.delete(token);
    }

    return json(
      200,
      {
        success: true
      },
      {
        "Set-Cookie": clearSessionCookie()
      }
    );

  } catch (error) {
    console.error("Logout error:", error);

    return json(500, {
      error: "Unable to log out."
    });
  }
};