import { Schema } from 'mongoose';

const reCommentSchema = new Schema(
  {
    // 부모 댓글 참조
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    // 작성자의 ObjectId
    senderId: { type: Schema.Types.ObjectId, ref: 'User', require: true },
    // 대댓글의 내용
    content: { type: String, require: true },
  },
  {
    timestamps: true,
  },
);

export default reCommentSchema;
