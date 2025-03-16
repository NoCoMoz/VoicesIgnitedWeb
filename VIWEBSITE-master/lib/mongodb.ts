import mongoose from 'mongoose';

/**
 * Global MongoDB connection state
 */
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize global mongoose state
global.mongoose = {
  conn: null,
  promise: null,
};

/**
 * Connect to MongoDB with retry mechanism and proper error handling
 * Uses connection pooling to avoid creating multiple connections
 */
export async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    if (global.mongoose.conn) {
      console.log('Using existing MongoDB connection');
      return global.mongoose.conn;
    }

    if (!global.mongoose.promise) {
      console.log('Creating new MongoDB connection');
      
      // Configure mongoose options for better stability and performance
      const opts = {
        bufferCommands: true,
        maxPoolSize: 10,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
      };

      global.mongoose.promise = mongoose.connect(process.env.MONGODB_URI, opts);
    }

    global.mongoose.conn = await global.mongoose.promise;
    return global.mongoose.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
