import mongoose, { Schema } from 'mongoose';

const replySchema = new Schema(
  {
    // 부모 댓글 참조
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    // 작성자의 ObjectId
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // 대댓글의 내용
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Reply = mongoose.model('Reply', replySchema);
export default Reply;
