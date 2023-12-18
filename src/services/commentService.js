import Comment from '../models/schemas/Comment.js';
import Reply from '../models/schemas/Reply.js';

// 1. 게시물에 있는 댓글 조회
export async function getComments(postId) {
  try {
    const comments = await Comment.find({ postId }).populate('reply');
    return comments;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 조회를 실패했습니다.');
  }
}

// 2. 특정 게시물에 댓글 작성
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

// 3. 특정 게시물에 작성한 댓글 수정
export async function updateComment(authorId, commentId, content) {
  try {
    const foundComment = await Comment.findById(commentId);
    // foundComment(댓글)이 없으면 대댓글을 찾아서 수정
    if (!foundComment) {
      const foundReply = await Reply.findById(commentId);
      if (!foundReply) {
        throw new Error('댓글을 찾을 수 없습니다.');
      }
      if (foundReply.authorId !== authorId) {
        throw new Error('댓글 수정 권한이 없습니다.');
      }
      const updatedReply = await Reply.findByIdAndUpdate(
        commentId,
        { $set: { content: content, updatedAt: new Date() } },
        { new: true, runValidators: true },
      );
      return updatedReply;
    }

    // 댓글 수정
    if (foundComment.authorId !== authorId) {
      throw new Error('댓글 수정 권한이 없습니다.');
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: { content: content, updatedAt: new Date() } },
      { new: true, runValidators: true },
    );
    return updatedComment;
  } catch (error) {
    console.error(error);
    throw new Error('댓글 수정을 실패했습니다.');
  }
}

// 4. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(authorId, commentId) {
  try {
    const deletedComment = (await Comment.findByIdAndDelete(commentId)) || (await Reply.findByIdAndDelete(commentId));

    if (deletedComment) {
      if (deletedComment.authorId !== authorId) {
        throw new Error('댓글 삭제 권한이 없습니다.');
      }
      // 대댓글의 경우 댓글스키마에서 대댓글 _id 제거
      if (deletedComment instanceof Reply) {
        const parentComment = await Comment.findById(deletedComment.parentComment);
        if (parentComment) {
          parentComment.reply.pull(deletedComment._id);
          await parentComment.save();
        }
      }
      return { message: '댓글이 삭제되었습니다.' };
    } else {
      throw new Error('댓글을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error(error);
    throw new Error('댓글 삭제를 실패했습니다.');
  }
}
