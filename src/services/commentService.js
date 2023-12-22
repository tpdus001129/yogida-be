import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Comment from '../models/schemas/Comment.js';
import Reply from '../models/schemas/Reply.js';

// 1. 마이페이지에서 내가 썼던 댓글 조회
export async function getAllCommentsByUserId(userId) {
  const comments = await Comment.find({ authorId: userId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });
  const replies = await Reply.find({ authorId: userId }).catch((error) => {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
      statusCode: 500,
      cause: error,
    });
  });

  const myComments = [...comments, ...replies];
  myComments.sort((a, b) => a.createdAt - b.createdAt);
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

    const newReply = new Reply({ parentComment: parentCommentId, authorId: userId, postId, content });
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
  const foundReply = await Reply.findById(commentId);

  if (!foundComment && !foundReply) {
    throw new CustomError(commonError.COMMENT_UNKNOWN_ERROR, '해당 댓글을 찾을 수 없습니다.', {
      statusCode: 404,
    });
  }

  const isReply = Boolean(foundReply); // 대댓글인지 확인여부
  const comment = isReply ? Reply : Comment;
  const userIdTest = isReply ? foundReply : foundComment;

  if (!userIdTest.authorId.equals(userId)) {
    // comment.authorId = 댓글 작성자 ID, authorId = 사용자 ID
    throw new CustomError(commonError.USER_MATCH_ERROR, '댓글을 수정할 권한이 없습니다.', {
      statusCode: 403,
    });
  }

  const updatedComment = await comment.updateOne({ _id: commentId }, { content }).catch((error) => {
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

  return await comment.findOne({ _id: commentId });
}

// 5. 특정 게시물에 작성한 댓글 삭제
export async function deleteComment(userId, commentId) {
  const isReply = await Reply.findById(commentId);

  let deletedComment;
  if (isReply) {
    // 대댓글 : Comment스키마의 reply필드에서, Reply스키마에서 자신의 _id 제거
    deletedComment = await Comment.findByIdAndUpdate(
      isReply.parentComment,
      { $pull: { reply: commentId } },
      { new: true },
    );
    await Reply.deleteOne({ _id: commentId, authorId: userId });
  } else {
    deletedComment = await Comment.deleteOne({ _id: commentId, authorId: userId });
  }

  if (deletedComment.deletedCount === 0) {
    throw new CustomError(commonError.COMMENT_DELETE_ERROR, '댓글 삭제를 실패하였습니다.', {
      statusCode: 404,
    });
  }

  return { message: '댓글이 삭제되었습니다.' };
}
