import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import Alarm from '../models/schemas/Alarm.js';
import Post from '../models/schemas/Post.js';

// receiverId 로 검색
export async function getAlarmByAlarmId(alarmId) {
  return await Alarm.findOne({ _id: alarmId }).lean();
}

// 특정 유저의 모든 알람 보기.
export async function getAllAlarms(userId) {
  return await Alarm.find({ receiverId: userId })
    .populate({ path: 'senderId', select: '-_id nickname' })
    .catch((err) => {
      throw new CustomError(commonError.DB_ERROR, '알람을 불러오는 중 오류가 생겼습니다.', {
        statusCode: 400,
        cause: err,
      });
    });
}

// 특정 알람 삭제하기
export async function deleteAlarm(userId, alarmId) {
  // 알람이 자신의 알람인지 확인
  const foundAlarm = await getAlarmByAlarmId(alarmId);

  if (!foundAlarm) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '알람이 존재 하지 않습니다.');
  }

  if (!foundAlarm.receiverId.equals(userId)) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '자신의 알람이 아닙니다.');
  }

  return await Alarm.deleteOne({ receiverId: userId }).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '삭제 도중 오류가 생겼습니다.', { statusCode: 500, cause: err });
  });
}

// 모든 알람 삭제하기
export async function deleteAllAlarms(userId) {
  console.log(userId);
  return await Alarm.deleteMany({ receiverId: userId }).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '삭제 도중 오류가 생겼습니다.', { statusCode: 500, cause: err });
  });
}

// 특정 알람 읽음 처리 하기
export async function readAlarm(alarmId) {
  return await Alarm.findOneAndUpdate({ _id: alarmId }, { isRead: true }, { runValidators: true })
    .populate({ path: 'receiverId', select: '-_id nickname' })
    .populate({ path: 'senderId', select: '-_id nickname' })
    .catch((err) => {
      throw new CustomError(commonError.DB_ERROR, '업데이트 도중 오류가 생겼습니다.', { statusCode: 500, cause: err });
    });
}

// 알람 생성하기
export async function createAlarm(postId, senderId, alarmType) {
  // 포스트의 author를 찾아서 receiver 로 설정
  const foundPost = await Post.findOne({ _id: postId }, { authorId: 1 });

  const alarm = new Alarm({
    receiverId: foundPost.authorId,
    senderId,
    alarmType,
    isRead: false,
  });

  return await Alarm.create(alarm).catch((err) => {
    throw new CustomError(commonError.DB_ERROR, '알람을 생성하는 도중 오류가 생겼습니다.', {
      statusCode: 500,
      cause: err,
    });
  });
}
