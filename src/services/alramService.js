import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Alram from '../models/schemas/AlarmSchema.js';
import Post from '../models/schemas/Post.js';

// reciverId 로 검색
export async function getAlramByAlramId(alramId) {
  return await Alram.findOne({ _id: alramId }).lean();
}

// 특정 유저의 모든 알람 보기.
export async function getAllAlrams(userId) {
  return await Alram.find({ reciverId: userId })
    .populate({ path: 'senderId', select: '-_id nickname' })
    .catch((err) => {
      throw new CustomError(commonError.DB_ERROR, '알람을 불러오는 중 오류가 생겼습니다.', {
        statusCode: 400,
        cause: err,
      });
    });
}

// 특정 알람 삭제하기
export async function deleteAlram(userId, alramId) {
  // 알람이 자신의 알람인지 확인
  const foundAlram = await getAlramByAlramId(alramId);

  if (!foundAlram) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '알람이 존재 하지 않습니다.');
  }

  if (!foundAlram.reciverId.equals(userId)) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '자신의 알람이 아닙니다.');
  }

  return await Alram.deleteOne({ reciverId: userId }).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '삭제 도중 오류가 생겼습니다.', { statusCode: 400, cause: err });
  });
}

// 모든 알람 삭제하기
export async function deleteAllAlarams(userId) {
  return await Alram.deleteMany({ reciverId: userId }).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '삭제 도중 오류가 생겼습니다.', { statusCode: 400, cause: err });
  });
}

// 특정 알람 읽음 처리 하기
export async function readAlram(alramId) {
  return await Alram.findOneAndUpdate({ _id: alramId }, { isRead: true }, { runValidators: true })
    .populate({ path: 'reciverId', select: '-_id nickname' })
    .populate({ path: 'senderId', select: '-_id nickname' })
    .catch((err) => {
      throw new CustomError(commonError.DB_ERROR, '업데이트 도중 오류가 생겼습니다.', { statusCode: 400, cause: err });
    });
}

// 알람 생성하기
export async function createAlram(postId, senderId, alramType) {
  // 포스트의 author를 찾아서 revicer 로 설정
  const reciverId = await Post.findOne({ _id: postId }, { authorId: 1 });
  console.log(reciverId);

  const alram = new Alram({
    reciverId,
    senderId,
    alramType,
    isRead: false,
  });

  return await Alram.create(alram).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '알람을 생성하는 도중 오류가 생겼습니다.', {
      statusCode: 400,
      cause: err,
    });
  });
}
