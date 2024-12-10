import mongoose from 'mongoose';

// Define a clear interface for the cached connection
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare the global type with our interface
declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Initialize the cached connection
const cached: CachedConnection = global.mongoose || {
  conn: null,
  promise: null,
};

// In development, we want to attach the cache to the global object
// This prevents multiple connections during hot reloading
if (process.env.NODE_ENV === 'development') {
  global.mongoose = cached;
}

async function dbConnect(): Promise<typeof mongoose> {
  try {
    // If we have a connection, return it
    if (cached.conn) {
      return cached.conn;
    }

    // If we don't have a promise to connect, create one
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10, // Limit number of connections
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      };

      cached.promise = mongoose
        .connect(MONGODB_URI!, opts)
        .then((mongoose) => {
          console.log('MongoDB connected successfully');
          return mongoose;
        })
        .catch((error) => {
          cached.promise = null; // Reset the promise on error
          throw error;
        });
    }

    // Wait for the connection
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Log the error and rethrow
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Handle connection errors
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Log when we're connected
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

// Log when we're disconnected
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  if (cached.conn) {
    await cached.conn.disconnect();
    console.log('MongoDB disconnected through app termination');
    process.exit(0);
  }
});

export default dbConnect; 