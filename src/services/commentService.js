import Comment from '../models/schemas/comment.js';
import Reply from '../models/schemas/reply.js';

// 1. 게시물에 있는 댓글 조회
export async function getAllComment(postId) {
  try {
    const comments = await Comment.find({ postId }).populate('reply').exec();
    return comments;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 조회를 실패했습니다.');
  }
}

// 2. 특정 게시물에 댓글 작성
export async function createComment(authorId, postId, content, parentComment = null) {
  try {
    // 부모 댓글이 있는 경우 => 대댓글 작성
    if (parentComment) {
      const parentComment = await Comment.findById(parentComment);
      if (!parentComment) {
        throw new Error('첫번째 댓글을 찾을 수 없습니다.');
      }
      const newReply = new Reply({ parentComment: parentComment, authorId, content });
      const reply = await newReply.save();

      parentComment.reply.push(reply._id);
      await parentComment.save();
      return reply;
    }

    // 부모 댓글이 없는 경우 => 첫번째 댓글 생성
    const newComment = new Comment({ authorId, postId, content });
    const comment = await newComment.save();
    return comment;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 작성을 실패했습니다.');
  }
}

// 3. 특정 게시물에 작성한 댓글 수정
export async function updateComment(commentId, content) {
  try {
    const findComment = await Comment.findById(commentId);
    // findComment(댓글)이 없으면 대댓글을 찾아서 수정
    if (!findComment) {
      const findReply = await Reply.findById(commentId);
      if (!findReply) {
        throw new Error('댓글을 찾을 수 없습니다.');
      }
      const updateReply = await Reply.findByIdAndUpdate(
        commentId,
        { $set: { content: content, updatedAt: new Date() } },
        { new: true },
      );
      return updateReply;
    }

    // 댓글 수정
    const updateComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { content: content, updatedAt: new Date() } },
      { new: true },
    );
    return updateComment;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 수정을 실패했습니다.');
  }
}

// 4. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(commentId) {
  try {
    const findComment = await Comment.findById(commentId);
    // 댓글 삭제
    if (findComment) {
      await findComment.remove();
      return { message: '댓글이 삭제되었습니다.' };
    }

    // 대댓글 삭제
    const findReply = await Reply.findById(commentId);
    if (findReply) {
      await findReply.remove();
      // 댓글스키마에서 대댓글 _id 제거
      const parentComment = await Comment.findById(findReply.parentComment);
      if (parentComment) {
        parentComment.reply.pull(findReply._id);
        await parentComment.save();
      }
      return { message: '댓글이 삭제되었습니다.' };
    }
  } catch (error) {
    console.error(error);
    throw new Error('댓글 삭제를 실패했습니다.');
  }
}
