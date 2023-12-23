import mongoose, { Schema } from 'mongoose';

const alarmSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    alarmType: { type: String, enum: ['like', 'comment'] },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Alarm = mongoose.model('Alarm', alarmSchema);
export default Alarm;
