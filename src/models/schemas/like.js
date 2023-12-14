import mongoose, { Schema } from 'mongoose';

const likeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
});

const Like = mongoose.model('Like', likeSchema);
export default Like;
