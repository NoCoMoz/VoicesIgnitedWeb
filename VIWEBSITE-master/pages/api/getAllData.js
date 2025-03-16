import { getAllCollections } from "../../utils/db";

// export default async function handler(req, res) {
//   if (req.method === "GET") {
//     const client = new MongoClient(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     try {
//       await client.connect();

//       // Choose a name for your database
//       const database = client.db("VI-Website");

//       // Choose a name for your collection
//       const collection = database.collection("mission");
//       const allData = await collection.find({}).toArray();

//       res.status(200).json(allData);
//     } catch (error) {
//       res.status(500).json({ message: "Something went wrong!" });
//     } finally {
//       await client.close();
//     }
//   } else {
//     res.status(405).json({ message: "Method not allowed!" });
//   }
// }

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Get all collections from the database
      const collections = await getAllCollections();

      // Return the list of collection names
      res.status(200).json({ collections });
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed!" });
  }
}
