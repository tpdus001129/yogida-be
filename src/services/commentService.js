import Comment from '../models/schemas/Comment.js';
import Reply from '../models/schemas/Reply.js';

// 1. 마이페이지에서 내가 썼던 댓글 조회
export async function getAllCommentsByUserId(authorId) {
  try {
    const comments = await Comment.find({ authorId });
    const replies = await Reply.find({ authorId });
    const myComments = [...comments, ...replies];
    return myComments;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 조회를 실패했습니다.');
  }
}

// 2. 게시물에 있는 댓글 조회
export async function getCommentsByPostId(postId) {
  try {
    const comments = await Comment.find({ postId }).populate('reply');
    return comments;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 조회를 실패했습니다.');
  }
}

// 3. 특정 게시물에 댓글 작성
export async function createComment(authorId, postId, content, parentCommentId = null) {
  try {
    // 부모 댓글이 있는 경우 => 대댓글 작성
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        throw new Error('첫번째 댓글을 찾을 수 없습니다.');
      }
      const newReply = new Reply({ parentComment, authorId, content });
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

// 4. 특정 게시물에 작성한 댓글 수정
export async function updateComment(authorId, commentId, content) {
  try {
    const foundComment = await Comment.findById(commentId);
    const foundReply = await Reply.findById(commentId);
    if (!foundComment || !foundReply) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    const isReply = Boolean(foundReply);
    const comment = isReply ? foundReply : foundComment;
    if (comment.authorId !== authorId) {
      // comment.authorId = 댓글 작성자 ID, authorId = 사용자 ID
      throw new Error('댓글 수정 권한이 없습니다.');
    }

    const updateContent = { $set: { content, updatedAt: new Date() } };
    const options = { new: true, runValidators: true };
    const updatedComment = await comment.updateOne(updateContent, options);
    return updatedComment;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 수정을 실패했습니다.');
  }
}

// 5. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(authorId, commentId) {
  try {
    const foundComment = await Comment.deleteOne({ _id: commentId, authorId });
    const foundReply = await Reply.deleteOne({ _id: commentId, authorId });
    if (foundComment.deletedCount === 0 || foundReply.deletedCount === 0) {
      throw new Error('댓글을 찾을 수 없거나 삭제 권한이 없습니다.');
    }

    // 대댓글의 경우 댓글스키마에서 대댓글 _id 제거
    if (foundReply.deletedCount !== 0) {
      const parentComment = await Comment.findById(commentId);
      if (parentComment) {
        parentComment.reply.pull(commentId);
        await parentComment.save();
      }
    }
    return { message: '댓글이 삭제되었습니다.' };
  } catch (error) {
    console.error(error);
    throw new Error('댓글 삭제를 실패했습니다.');
  }
}
