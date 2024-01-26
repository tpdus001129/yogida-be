import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Comment from '../models/schemas/Comment.js';
import Reply from '../models/schemas/Reply.js';

// 1. 마이페이지에서 내가 썼던 댓글 조회
export async function getAllCommentsByUserId(userId) {
  const [comments, replies] = await Promise.all([
    Comment.find({ authorId: userId })
      .populate({
        path: 'postId',
        model: 'Post',
        select: 'schedules.placeImageSrc',
      })
      .catch((error) => {
        throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
          statusCode: 500,
          cause: error,
        });
      }),
    Reply.find({ authorId: userId })
      .populate({
        path: 'postId',
        model: 'Post',
        select: 'schedules.placeImageSrc',
      })
      .catch((error) => {
        throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
          statusCode: 500,
          cause: error,
        });
      }),
  ]).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'promise 실행 중 에러가 발생하였습니다.', {
      statusCode: 500,
      cause: error,
    });
  });

  const myComments = [...comments, ...replies];
  myComments.sort((a, b) => b.createdAt - a.createdAt);
  return myComments;
}

// 2. 게시물에 있는 댓글 조회
export async function getCommentsByPostId(postId) {
  const comments = await Comment.find({ postId })
    .populate({
      path: 'authorId',
      model: 'User',
      select: 'nickname profileImageSrc',
    })
    .populate({
      path: 'reply',
      populate: {
        path: 'authorId',
        model: 'User',
        select: 'nickname profileImageSrc',
      },
    })
    .catch((error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    });

  comments.sort((a, b) => b.createdAt - a.createdAt);
  return comments;
}

// 3. 특정 게시물에 댓글 작성
export async function createComment(userId, postId, content, parentComment) {
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

    const newReply = new Reply({ parentComment: parentCommentId._id, authorId: userId, postId, content });
    const reply = await newReply.save();
    parentCommentId.reply.push(reply._id);
    await parentCommentId.save();
    return reply;
  }

  // 부모 댓글이 없는 경우 => 첫번째 댓글 생성
  const newComment = new Comment({ authorId: userId, postId, content });
  const comment = await newComment.save().catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  return comment;
}

// 4. 특정 게시물에 작성한 댓글 수정
export async function updateComment(commentId, userId, content) {
  const foundComment = await Comment.findById(commentId);
  if (!foundComment) {
    throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '해당 댓글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!foundComment.authorId.equals(userId)) {
    // foundComment.authorId = 댓글 작성자 ID, authorId = 사용자 ID
    throw new CustomError(commonError.USER_MATCH_ERROR, '댓글을 수정할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true, runValidators: true },
  ).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  if (!updatedComment) {
    throw new CustomError(commonError.POST_MODIFY_ERROR, '댓글 수정을 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return updatedComment;
}

// 5. 특정 게시물에 작성한 대댓글 수정
export async function updateReply(commentId, userId, content) {
  const foundReply = await Reply.findById(commentId);
  if (!foundReply) {
    throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '해당 대댓글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  if (!foundReply.authorId.equals(userId)) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '대댓글을 수정할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

  const updatedReply = await Reply.findByIdAndUpdate(commentId, { content }, { new: true, runValidators: true }).catch(
    (error) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: error,
      });
    },
  );

  if (!updatedReply) {
    throw new CustomError(commonError.POST_MODIFY_ERROR, '대댓글 수정을 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return updatedReply;
}

// 6. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(userId, commentId) {
  const isComment = await Comment.findById(commentId);
  if (!isComment) {
    throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '댓글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const deletedComment = await Comment.deleteOne({ _id: commentId, authorId: userId });
  if (deletedComment.deletedCount === 0) {
    throw new CustomError(commonError.COMMENT_DELETE_ERROR, '댓글 삭제를 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return deletedComment;
}

// 7. 특정 게시물에 작성한 대댓글 삭제
export async function deleteReply(userId, commentId) {
  const isReply = await Reply.findById(commentId);
  if (!isReply) {
    throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '대댓글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  await Comment.findByIdAndUpdate(isReply.parentComment, { $pull: { reply: commentId } }, { new: true });
  const deletedReply = await Reply.deleteOne({ _id: commentId, authorId: userId });
  if (deletedReply.deletedCount === 0) {
    throw new CustomError(commonError.COMMENT_DELETE_ERROR, '대댓글 삭제를 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return deletedReply;
}
