import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    // 사용자 아이디 추가
    message: { type: String },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    sender: {
      //populate하기
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model('User', notificationSchema);
export default Notification;
