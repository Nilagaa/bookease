const {
  users,
  bookings,
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
    const admin = await getCurrentUser(event);

    if (!admin) {
      return json(401, {
        error: "Please log in."
      });
    }

    if (admin.role !== "admin") {
      return json(403, {
        error: "Admin access required."
      });
    }

    const { blobs: bookingBlobs } = await bookings.list();
    const { blobs: userBlobs } = await users.list();

    const allBookings = [];
    const customers = [];

    for (const blob of bookingBlobs) {
      const booking = await bookings.get(blob.key, {
        type: "json"
      });

      if (booking) {
        allBookings.push(booking);
      }
    }

    for (const blob of userBlobs) {
      const user = await users.get(blob.key, {
        type: "json"
      });

      if (user) {
        customers.push({
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          createdAt: user.createdAt
        });
      }
    }

    allBookings.sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    customers.sort((a, b) =>
      a.username.localeCompare(b.username)
    );

    return json(200, {
      bookings: allBookings,
      customers
    });

  } catch (error) {
    console.error("Admin bookings error:", error);

    return json(500, {
      error: "Unable to load admin data."
    });
  }
};