import mongoose, { Schema } from 'mongoose';

const alramSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    reciverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    alramType: { type: String, enum: ['like', 'comment'] },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Alram = mongoose.model('Alram', alramSchema);
export default Alram;
