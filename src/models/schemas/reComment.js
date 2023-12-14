import { Schema } from 'mongoose';

const reCommentSchema = new Schema(
  {
    // 부모 댓글 참조
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    // 대댓글을 쓴 사용자의 Object ? String ?
    writerId: { type: String, require: true },
    // 대댓글의 내용
    content: { type: String, require: true },
  },
  {
    timestamps: true,
  },
);

export default reCommentSchema;
