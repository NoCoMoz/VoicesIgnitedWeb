import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../utils/db";
import Pin from "../../models/Pin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const { lat, lng } = req.body;
      // console.log("Received pin data:", { lat, lng }); // Log the request body

      const pin = new Pin({ lat, lng });
      await pin.save();
      // console.log("Pin saved successfully:", pin); // Log the saved pin

      res.status(201).json({ message: "Pin saved!", pin });
    } catch (error) {
      console.error("Error saving pin:", error);
      res.status(500).json({ message: "Failed to save pin" });
    }
  } else if (req.method === "GET") {
    try {
      const pins = await Pin.find({});
      res.status(200).json(pins);
    } catch (error) {
      console.error("Error fetching pins:", error);
      res.status(500).json({ message: "Failed to fetch pins" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { _id } = req.body; 

      if (!_id) {
        return res.status(400).json({ message: "Missing pin ID" });
      }

      // Find and delete the pin by its _id
      const deletedPin = await Pin.findByIdAndDelete(_id);

      if (!deletedPin) {
        return res.status(404).json({ message: "Pin not found" });
      }

      res.status(200).json({ message: "Pin deleted successfully", deletedPin });
    } catch (error) {
      console.error("Error deleting pin:", error);
      res.status(500).json({ message: "Failed to delete pin" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
