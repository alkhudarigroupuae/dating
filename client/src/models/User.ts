import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Add password back as optional for hybrid auth
  name: string;
  currentChallenge?: string;
  authenticators: {
    credentialID: string;
    credentialPublicKey: string;
    counter: number;
    transports?: string[];
  }[];
  age: number;
  gender: 'male' | 'female' | 'other';
  interests: string[];
  bio: string;
  photos: string[];
  location: {
    type: string;
    coordinates: number[];
  };
  pushSubscription?: {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
  };
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for WebAuthn users
  name: { type: String, required: true },
  currentChallenge: { type: String },
  authenticators: [{
    credentialID: { type: String, required: true },
    credentialPublicKey: { type: String, required: true },
    counter: { type: Number, required: true },
    transports: [{ type: String }],
  }],
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  interests: [{ type: String }],
  bio: { type: String, maxlength: 500 },
  photos: [{ type: String }],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  pushSubscription: {
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String,
    }
  },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
