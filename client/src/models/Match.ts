import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
  users: [mongoose.Types.ObjectId, mongoose.Types.ObjectId];
  status: 'pending' | 'matched' | 'rejected';
  createdAt: Date;
}

const MatchSchema: Schema = new Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'matched', 'rejected'], default: 'pending' },
}, { timestamps: true });

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
export default Match;
