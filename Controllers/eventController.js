const mongoose = require('mongoose');
const Event = require("../Models/eventModel");
const { Parser } = require("json2csv"); // Library for CSV conversion

// Create Event (Supports Multiple Dates, Time Slots, and Custom URLs)
exports.createEvent = async (req, res) => {
  try {
    const { name, description, dates, location, timeSlots, customURL } = req.body;

    const newEvent = await Event.create({
      name,
      description,
      dates,
      location,
      timeSlots,
      createdBy: req.user._id, // The organizer (from authentication)
      customURL,
    });

    res.status(201).json({
      status: "success",
      data: { event: newEvent },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

// Get All Events by Organizer
exports.getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user._id; // Get organizer ID from logged-in user
    const events = await Event.find({ createdBy: organizerId });

    res.status(200).json({ status: "success", data: { events } });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve organizer's events", error: err.message });
  }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "name email");
    res.status(200).json({ status: "success", data: { events } });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve events", error: err.message });
  }
};
// ✅ Get Single Event by ID
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId).populate("createdBy", "name email");
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ status: "success", data: { event } });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve event", error: err.message });
  }
};

// Get Sales & Revenue Per Event
exports.getEventSales = async (req, res) => {
  try {
    const { eventId } = req.params;
    const orders = await Order.find({ eventId, status: "Paid" });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalTicketsSold = orders.reduce((sum, order) => sum + order.quantity, 0);

    res.status(200).json({
      status: "success",
      data: { totalRevenue, totalTicketsSold, orders },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve sales data", error: err.message });
  }
};


// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const updates = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ status: "success", data: { event: updatedEvent } });
  } catch (err) {
    res.status(500).json({ message: "Failed to update event", error: err.message });
  }
};

// Download Attendee List as CSV
exports.downloadAttendeeList = async (req, res) => {
  try {
    const { eventId } = req.params;
    const orders = await Order.find({ eventId, status: "Paid" }).populate("attendees");

    const attendees = orders.flatMap(order => order.attendees);

    if (attendees.length === 0) {
      return res.status(404).json({ message: "No attendees found for this event." });
    }

    const parser = new Parser({ fields: ["email", "qrCodeUrl"] });
    const csv = parser.parse(attendees);

    res.header("Content-Type", "text/csv");
    res.attachment(`attendees-${eventId}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate CSV", error: err.message });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    await Event.findByIdAndDelete(eventId);
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event", error: err.message });
  }
};
