import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
  {
    // 해당 게시글의 ObjectId
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    // 작성자의 ObjectId
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 댓글 내용
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
