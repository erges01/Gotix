const mongoose = require('mongoose');
const Event = require("../Models/eventModel");
// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { name, description, date, location } = req.body;

    const newEvent = await Event.create({
      name,
      description,
      date,
      location,
      createdBy: req.user._id, // The organizer (from authentication)
    });

    res.status(201).json({
      status: "success",
      data: { event: newEvent },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
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

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate if eventId is a valid ObjectId
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
