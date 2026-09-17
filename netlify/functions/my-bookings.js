const {
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
    const user = await getCurrentUser(event);

    if (!user) {
      return json(401, {
        error: "Please log in first."
      });
    }

    const { blobs } = await bookings.list();

    const userBookings = [];

    for (const blob of blobs) {
      const booking = await bookings.get(blob.key, {
        type: "json"
      });

      if (booking && booking.username === user.username) {
        userBookings.push(booking);
      }
    }

    userBookings.sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return json(200, {
      bookings: userBookings
    });

  } catch (error) {
    console.error("My bookings error:", error);

    return json(500, {
      error: "Unable to load bookings."
    });
  }
};