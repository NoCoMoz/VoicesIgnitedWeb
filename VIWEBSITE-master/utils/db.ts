import mongoose from "mongoose";

let cachedDb: mongoose.Connection | null = null;

export const connectToDatabase = async (): Promise<mongoose.Connection> => {
  if (cachedDb) {
    console.log("Using cached database connection");
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in environment variables");
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("Connection URI:", process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//<credentials>@')); // Safe logging of URI
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Successfully connected to MongoDB!");

    cachedDb = mongoose.connection;
    
    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedDb = null;
    });

    console.log("Connection state:", mongoose.connection.readyState);
    return cachedDb;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAllCollections = async () => {
  try {
    const db = await connectToDatabase();

    if (!db.db) {
      throw new Error("Database connection failed: db.db is undefined");
    }

    const collections = await db.db.listCollections().toArray();
    return collections.map((collection) => collection.name);
  } catch (error) {
    console.error("Error getting collections:", error);
    throw new Error("Failed to get collections");
  }
};

export const getCollectionData = async (collectionName: string) => {
  try {
    const db = await connectToDatabase();

    if (!db.db) {
      throw new Error("Database connection failed: db.db is undefined");
    }

    // Use Mongoose's native connection to fetch data
    const collection = db.db.collection(collectionName);
    const data = await collection.find({}).toArray();
    return data;
  } catch (error) {
    console.error("Error fetching collection data:", error);
    throw new Error("Failed to fetch collection data");
  }
};
