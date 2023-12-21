import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Comment from '../models/schemas/Comment.js';
import Reply from '../models/schemas/Reply.js';

// 1. 마이페이지에서 내가 썼던 댓글 조회
export async function getAllCommentsByUserId(authorId) {
  const comments = await Comment.find({ authorId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
  const replies = await Reply.find({ authorId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  const myComments = [...comments, ...replies];
  return myComments;
}

// 2. 게시물에 있는 댓글 조회
export async function getCommentsByPostId(postId) {
  const comments = await Comment.find({ postId })
    .populate('reply')
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  return comments;
}

// 3. 특정 게시물에 댓글 작성
export async function createComment(authorId, postId, content, parentComment) {
  // 부모 댓글이 있는 경우 => 대댓글 작성
  if (parentComment) {
    const parentCommentId = await Comment.findById(parentComment).catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });
    if (!parentCommentId) {
      throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '해당 댓글을 찾을 수 없습니다.', {
        statusCode: 404,
      });
    }

    const newReply = new Reply({ parentComment: parentCommentId, authorId, postId, content });
    const reply = await newReply.save();
    parentCommentId.reply.push(reply._id);
    await parentCommentId.save();
    return reply;
  }

  // 부모 댓글이 없는 경우 => 첫번째 댓글 생성
  const newComment = new Comment({ authorId, postId, content });
  const comment = await newComment.save().catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  return comment;
}

// 4. 특정 게시물에 작성한 댓글 수정
export async function updateComment(commentId, postId, authorId, content) {
  const foundComment = await Reply.findById(commentId);
  const foundReply = await Reply.findById(commentId);
  if (!foundComment || !foundReply) {
    throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '해당 댓글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const isReply = Boolean(foundReply);
  const comment = isReply ? foundReply : foundComment;
  if (comment.authorId !== authorId) {
    // comment.authorId = 댓글 작성자 ID, authorId = 사용자 ID
    throw new CustomError(commonError.USER_MATCH_ERROR, '댓글을 수정할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

  const updateContent = { $set: { postId, authorId, content, updatedAt: new Date() } };
  const options = { new: true, runValidators: true };
  const updatedComment = await comment.updateOne(updateContent, options).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  if (updatedComment.modifiedCount === 0) {
    throw new CustomError(commonError.POST_MODIFY_ERROR, '댓글 수정을 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return updatedComment;
}

// 5. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(authorId, commentId) {
  const foundComment = await Comment.deleteOne({ _id: commentId, authorId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
  const foundReply = await Reply.deleteOne({ _id: commentId, authorId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  if (foundComment.deletedCount === 0 || foundReply.deletedCount === 0) {
    throw new CustomError(commonError.COMMENT_DELETE_ERROR, '댓글 삭제를 실패하였습니다.', {
      statusCode: 404,
    });
  }

  // 대댓글의 경우 댓글스키마에서 대댓글 _id 제거
  if (foundReply.deletedCount !== 0) {
    const parentComment = await Comment.findById(commentId).catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

    if (parentComment) {
      parentComment.reply.pull(commentId);
      await parentComment.save();
    }
  }
  return { message: '댓글이 삭제되었습니다.' };
}
