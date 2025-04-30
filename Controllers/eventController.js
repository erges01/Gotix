const mongoose = require('mongoose');
const Event = require("../Models/eventModel");
const Order = require("../Models/orderModel");
const { Parser } = require("json2csv"); // Library for CSV conversion



// Create Event (Supports Multiple Dates, Time Slots, Custom URLs, Ticket Types, and Optional Checkout Questions)
exports.createEvent = async (req, res) => {
  try {
    const {
      name = req.body.title,
      description,
      location,
      customURL,
      checkoutQuestions,
    } = req.body;

    const dates = req.body.dates ? JSON.parse(req.body.dates) : [];
    const timeSlots = req.body.timeSlots ? JSON.parse(req.body.timeSlots) : [];
    const ticketTypes = req.body.ticketTypes ? JSON.parse(req.body.ticketTypes) : [];

    if (!name || !description || !dates.length || !location) {
      return res.status(400).json({ message: "All required fields must be filled: name, description, dates, location" });
    }

    if (!Array.isArray(ticketTypes) || ticketTypes.length === 0) {
      return res.status(400).json({ message: "At least one ticket type is required" });
    }

    ticketTypes.forEach((ticket) => {
      if (!ticket.type || ticket.price < 0 || ticket.quantityAvailable < 0) {
        throw new Error("Invalid ticket type format. Ensure type, price ≥ 0, quantityAvailable ≥ 0");
      }
    });

    const newEvent = await Event.create({
      name,
      description,
      location,
      dates,
      timeSlots,
      createdBy: req.user._id,
      customURL,
      ticketTypes,
      checkoutQuestions: Array.isArray(checkoutQuestions) ? checkoutQuestions : [],
    });

    res.status(201).json({
      status: "success",
      data: { event: newEvent },
    });
  }catch (err) {
    console.error("🔥 CREATE EVENT BACKEND ERROR:", err);
    res.status(400).json({
      status: "fail",
      message: err?.message || "Failed to create event",
      error: err,
    });
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

// Get Single Event by ID
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

// Add or Update Checkout Questions for an Event (Optional)
exports.setCheckoutQuestions = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { checkoutQuestions } = req.body;

    // Ensure checkout questions are optional
    if (!Array.isArray(checkoutQuestions)) {
      return res.status(400).json({ message: "Checkout questions should be an array or omitted." });
    }

    // Validate event ownership
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to modify this event" });
    }

    event.checkoutQuestions = checkoutQuestions;
    await event.save();

    res.status(200).json({ status: "success", data: { event } });
  } catch (err) {
    res.status(500).json({ message: "Failed to update checkout questions", error: err.message });
  }
};

// ✅ Update Invite-Only Ticket Password
exports.updateTicketPassword = async (req, res) => {
  try {
    const { eventId, ticketType } = req.params;
    const { newPassword } = req.body;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Ensure only the event creator can modify tickets
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to modify this event" });
    }

    // Find the specific ticket type
    const ticket = event.ticketTypes.find((t) => t.type === ticketType);
    if (!ticket) return res.status(400).json({ message: "Ticket type not found" });

    // ✅ Update ticket password
    ticket.password = newPassword || null; // Remove password if empty
    await event.save();

    res.status(200).json({ status: "success", message: "Ticket password updated successfully", data: { event } });
  } catch (err) {
    res.status(500).json({ message: "Failed to update ticket password", error: err.message });
  }
};

// ✅ Get Event Analytics (Revenue, Ticket Sales Breakdown, Attendee Trends)
exports.getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Fetch all paid orders for this event
    const orders = await Order.find({ eventId, status: "Paid" });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Count total tickets sold
    const totalTicketsSold = orders.reduce((sum, order) => sum + order.quantity, 0);

    // Break down sales by ticket type
    const ticketSales = {};
    event.ticketTypes.forEach(ticket => {
      ticketSales[ticket.type] = { totalSold: 0, revenue: 0 };
    });

    orders.forEach(order => {
      const ticketType = event.ticketTypes.find(ticket => ticket._id.equals(order.ticketId));
      if (ticketType) {
        ticketSales[ticketType.type].totalSold += order.quantity;
        ticketSales[ticketType.type].revenue += order.totalPrice;
      }
    });

    // Group sales data by date (Attendee Trends)
    const salesTrends = {};
    orders.forEach(order => {
      const orderDate = order.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD format
      if (!salesTrends[orderDate]) salesTrends[orderDate] = { ticketsSold: 0, revenue: 0 };
      salesTrends[orderDate].ticketsSold += order.quantity;
      salesTrends[orderDate].revenue += order.totalPrice;
    });

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue,
        totalTicketsSold,
        ticketSales,
        salesTrends,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve event analytics", error: err.message });
  }
};

// ✅ Get Organizer Analytics (Total Revenue, Best-Selling Events, Trends)
exports.getOrganizerAnalytics = async (req, res) => {
  try {
    const organizerId = req.user._id; // Get organizer's ID

    // Find all events created by the organizer
    const events = await Event.find({ createdBy: organizerId });

    if (events.length === 0) {
      return res.status(404).json({ message: "No events found for this organizer" });
    }

    // Fetch all paid orders for the organizer's events
    const eventIds = events.map(event => event._id);
    const orders = await Order.find({ eventId: { $in: eventIds }, status: "Paid" });

    // Calculate total revenue across all events
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Count total tickets sold
    const totalTicketsSold = orders.reduce((sum, order) => sum + order.quantity, 0);

    // Identify the best-selling event
    const eventSales = {};
    events.forEach(event => {
      eventSales[event._id] = { name: event.name, revenue: 0, ticketsSold: 0 };
    });

    orders.forEach(order => {
      if (eventSales[order.eventId]) {
        eventSales[order.eventId].revenue += order.totalPrice;
        eventSales[order.eventId].ticketsSold += order.quantity;
      }
    });

    // Sort events by revenue (best-selling event first)
    const sortedEvents = Object.values(eventSales).sort((a, b) => b.revenue - a.revenue);

    // Group sales data by date (Attendee Trends)
    const salesTrends = {};
    orders.forEach(order => {
      const orderDate = order.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD format
      if (!salesTrends[orderDate]) salesTrends[orderDate] = { ticketsSold: 0, revenue: 0 };
      salesTrends[orderDate].ticketsSold += order.quantity;
      salesTrends[orderDate].revenue += order.totalPrice;
    });

    res.status(200).json({
      status: "success",
      data: {
        totalRevenue,
        totalTicketsSold,
        bestSellingEvents: sortedEvents.slice(0, 5), // Top 5 best-selling events
        salesTrends,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve organizer analytics", error: err.message });
  }
};
