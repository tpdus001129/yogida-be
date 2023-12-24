import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as alarmService from '../services/alarmService.js';

// 특정 유저의 모든 알람 보기.
export async function getAllAlarms(req, res) {
  const userId = req.userId;
  const alarms = await alarmService.getAllAlarms(userId);

  return res.status(200).json({ message: '알람 요청 성공', alarms });
}

// 특정 알람 삭제하기
export async function deleteAlarm(req, res) {
  const userId = req.userId;
  const alarmId = req.params.alarmId;

  const foundAlarm = await alarmService.getAlarmByAlarmId(alarmId); //알람 찾기.

  if (!foundAlarm) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '알람이 존재 하지 않습니다.');
  }

  await alarmService.deleteAlarm(userId, alarmId);

  // 결과 반환
  return res.status(200).json({ message: '삭제 성공' });
}

// 알람 전체 삭제하기
export async function deleteAllAlarms(req, res) {
  const userId = req.userId;

  await alarmService.deleteAllAlarams(userId);

  // 결과 반환
  return res.status(200).json({ message: '전체 삭제 성공' });
}

// 특정 알람 읽음 처리 하기.
export async function readAlarm(req, res) {
  const userId = req.userId;
  const alarmId = req.params.alarmId;

  // 알람이 자신이 받은 알람인지 확인
  const foundAlarm = await alarmService.getAlarmByAlarmId(alarmId); //알람 찾기.
  if (!foundAlarm) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '알람이 존재 하지 않습니다.');
  }

  if (!foundAlarm.receiverId.equals(userId)) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '유저의 것이 아닙니다.');
  }

  const alarm = await alarmService.readAlarm(alarmId);

  res.status(200).json({ message: '알람 읽기 성공', alarm });
}
