const {
  bookings,
  json,
  getCurrentUser
} = require("./_shared");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
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

    const { bookingId } = JSON.parse(event.body || "{}");

    if (!bookingId) {
      return json(400, {
        error: "Booking ID is required."
      });
    }

    const booking = await bookings.get(bookingId, {
      type: "json"
    });

    if (!booking) {
      return json(404, {
        error: "Booking not found."
      });
    }

    if (booking.username !== user.username) {
      return json(403, {
        error: "You cannot cancel this booking."
      });
    }

    if (booking.status !== "Pending") {
      return json(400, {
        error: "Only pending bookings can be cancelled."
      });
    }

    booking.status = "Cancelled";
    booking.updatedAt = new Date().toISOString();

    await bookings.setJSON(bookingId, booking);

    return json(200, {
      success: true,
      booking
    });

  } catch (error) {
    console.error("Cancel booking error:", error);

    return json(500, {
      error: "Unable to cancel booking."
    });
  }
};