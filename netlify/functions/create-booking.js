const crypto = require("crypto");

const {
  bookings,
  json,
  getCurrentUser
} = require("./_shared");

const allowedServices = [
  "Basic Consultation",
  "Premium Consultation",
  "Full Service Package"
];

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

    if (user.role !== "customer") {
      return json(403, {
        error: "Only customers can create bookings."
      });
    }

    const {
      service,
      date,
      time,
      notes
    } = JSON.parse(event.body || "{}");

    if (!allowedServices.includes(service)) {
      return json(400, {
        error: "Please select a valid service."
      });
    }

    if (!date || !time) {
      return json(400, {
        error: "Date and time are required."
      });
    }

    const selectedDate = new Date(`${date}T${time}`);

    if (Number.isNaN(selectedDate.getTime())) {
      return json(400, {
        error: "Invalid date or time."
      });
    }

    if (selectedDate.getTime() < Date.now()) {
      return json(400, {
        error: "Please select a future date and time."
      });
    }

    const bookingId = crypto.randomUUID();

    const booking = {
      id: bookingId,
      username: user.username,
      customerName: user.fullName,
      service,
      date,
      time,
      notes: String(notes || "").trim(),
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    await bookings.setJSON(bookingId, booking);

    return json(201, {
      success: true,
      booking
    });

  } catch (error) {
    console.error("Create booking error:", error);

    return json(500, {
      error: "Unable to create booking."
    });
  }
};