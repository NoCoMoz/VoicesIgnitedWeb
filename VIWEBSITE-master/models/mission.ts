import mongoose from "mongoose";

const MissionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  content: { type: String, required: true },
});

const Mission =
  mongoose.models.Mission || mongoose.model("Mission", MissionSchema);

export default Mission;
