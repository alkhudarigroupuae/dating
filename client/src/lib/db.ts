import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null, mongod: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = (async () => {
      let uri = MONGODB_URI;

      // Only use Memory Server in Development mode
      if (process.env.NODE_ENV === 'development') {
        const { MongoMemoryServer } = await import('mongodb-memory-server'); // Dynamic import to avoid bundling in prod
        
        try {
            // Attempt to connect to local/provided URI first
            if (uri) {
                await mongoose.connect(uri, { ...opts, serverSelectionTimeoutMS: 2000 });
                return mongoose;
            }
        } catch (error) {
            console.log("Local MongoDB not reachable, falling back to In-Memory DB...");
        }

        // Fallback to Memory Server if no URI or connection failed
        if (!cached.mongod) {
            cached.mongod = await MongoMemoryServer.create();
            uri = cached.mongod.getUri();
            console.log("Started MongoDB Memory Server at:", uri);
        }
      }

      if (!uri) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local (or Vercel Environment Variables)'
        );
      }

      return mongoose.connect(uri, opts);
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
