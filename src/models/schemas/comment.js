import { Schema } from 'mongoose';

const commentSchema = new Schema(
  {
    // 해당 게시글의 ObjectId
    postId: { type: Schema.Types.ObjectId, ref: 'Post', require: true },
    // 작성자의 ObjectId
    senderId: { type: String, require: true },
    // 댓글 내용
    content: { type: String, require: true },
    // 대댓글의 아이디
    threads: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ReComment',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default commentSchema;
