const {
  bookings,
  json,
  getCurrentUser
} = require("./_shared");

const allowedStatuses = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled"
];

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
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

    const {
      bookingId,
      status
    } = JSON.parse(event.body || "{}");

    if (!bookingId || !allowedStatuses.includes(status)) {
      return json(400, {
        error: "Invalid booking or status."
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

    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    await bookings.setJSON(bookingId, booking);

    return json(200, {
      success: true,
      booking
    });

  } catch (error) {
    console.error("Update booking error:", error);

    return json(500, {
      error: "Unable to update booking."
    });
  }
};