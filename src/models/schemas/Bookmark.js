import mongoose, { Schema } from 'mongoose';

const bookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
