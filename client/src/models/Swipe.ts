import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISwipe extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  type: 'like' | 'nope' | 'superlike';
  createdAt: Date;
}

const SwipeSchema: Schema = new Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'nope', 'superlike'], required: true },
}, { timestamps: true });

SwipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

const Swipe: Model<ISwipe> = mongoose.models.Swipe || mongoose.model<ISwipe>('Swipe', SwipeSchema);
export default Swipe;
