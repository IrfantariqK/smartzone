import mongoose, { Model, Document } from 'mongoose';

interface IStore extends Document {
  name: string;
  location: {
    type: string;
    coordinates: number[];
  };
  geofence: {
    radius: number;
    enabled: boolean;
  };
  beacons: Array<{
    uuid: string;
    major: number;
    minor: number;
    zone: string;
    active: boolean;
  }>;
}

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  geofence: {
    radius: { type: Number, required: true },
    enabled: { type: Boolean, default: true }
  },
  beacons: [{
    uuid: { type: String, required: true },
    major: { type: Number, required: true },
    minor: { type: Number, required: true },
    zone: { type: String, required: true },
    active: { type: Boolean, default: true }
  }]
}, { timestamps: true });

StoreSchema.index({ location: '2dsphere' });

let Store: Model<IStore>;

try {
  // Try to get existing model
  Store = mongoose.model<IStore>('Store');
} catch {
  // Model doesn't exist, create new one
  Store = mongoose.model<IStore>('Store', StoreSchema);
}

export { Store }; 