import mongoose from "mongoose";

/**
 * Event schema for MongoDB
 * Defines structure for event data including title, description, date, etc.
 */
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  date: {
    type: Date,
    required: [true, "Date is required"]
  },
  startTime: {
    type: String,
    required: [true, "Start time is required"],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide a valid time format (HH:MM)"]
  },
  endTime: {
    type: String,
    required: [true, "End time is required"],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide a valid time format (HH:MM)"]
  },
  type: {
    type: String,
    required: [true, "Event type is required"],
    enum: {
      values: ["meeting", "workshop", "action", "fundraiser", "social"],
      message: "Type must be one of: meeting, workshop, action, fundraiser, social"
    }
  },
  locationType: {
    type: String,
    required: [true, "Location type is required"],
    enum: {
      values: ["online", "in-person"],
      message: "Location type must be either online or in-person"
    }
  },
  location: {
    type: String,
    required: [true, "Location details are required"],
    trim: true
  },
  organizer: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email address"
    ]
  },
  imageUrl: {
    type: String,
    trim: true
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index on date and type for efficient filtering
EventSchema.index({ date: 1, type: 1 });
// Create index on approval status for efficient filtering
EventSchema.index({ approved: 1 });

// Ensure model is only compiled once
export default mongoose.models.Event || mongoose.model("Event", EventSchema);
