const {
  json,
  getCurrentUser
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, {
      error: "Method not allowed"
    });
  }

  try {
    const user = await getCurrentUser(event);

    if (!user) {
      return json(401, {
        authenticated: false
      });
    }

    return json(200, {
      authenticated: true,
      user: {
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Me error:", error);

    return json(500, {
      error: "Unable to check session."
    });
  }
};