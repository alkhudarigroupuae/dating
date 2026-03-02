import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  currentChallenge?: string;
  authenticators: {
    credentialID: string;
    credentialPublicKey: string;
    counter: number;
    transports?: string[];
  }[];
  // Push Notification Subscription
  pushSubscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  age: number;
  gender: 'male' | 'female' | 'other';
  interests: string[];
  bio: string;
  photos: string[];
  location: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  currentChallenge: { type: String },
  authenticators: [{
    credentialID: { type: String, required: true },
    credentialPublicKey: { type: String, required: true },
    counter: { type: Number, required: true },
    transports: [{ type: String }],
  }],
  pushSubscription: {
    endpoint: { type: String },
    keys: {
      p256dh: { type: String },
      auth: { type: String },
    },
  },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  interests: [{ type: String }],
  bio: { type: String, maxlength: 500 },
  photos: [{ type: String }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
