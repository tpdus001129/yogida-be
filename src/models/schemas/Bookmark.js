import mongoose, { Schema } from 'mongoose';

const bookmarkSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    singleScheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'SingleSchedule',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
