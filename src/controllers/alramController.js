import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import * as alramService from '../services/alramService.js';

// 특정 유저의 모든 알람 보기.
export async function getAllAlrams(req, res) {
  const userId = req.userId;
  const alrams = await alramService.getAllAlrams(userId);

  return res.status(200).json({ message: '알람 요청 성공', alrams });
}

// 특정 알람 삭제하기
export async function deleteAlram(req, res) {
  const userId = req.userId;
  const alramId = req.params.alramId;

  const foundAlram = await alramService.getAlramByAlramId(alramId); //알람 찾기.

  if (!foundAlram) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '알람이 존재 하지 않습니다.');
  }

  await alramService.deleteAlram(userId, alramId);

  // 결과 반환
  return res.status(200).json({ message: '삭제 성공' });
}

// 알람 전체 삭제하기
export async function deleteAllAlrams(req, res) {
  const userId = req.userId;

  await alramService.deleteAllAlarams(userId);

  // 결과 반환
  return res.status(200).json({ message: '전체 삭제 성공' });
}

// 특정 알람 읽음 처리 하기.
export async function readAlram(req, res) {
  const userId = req.userId;
  const alramId = req.params.alramId;

  // 알람이 자신이 받은 알람인지 확인
  const foundAlram = await alramService.getAlramByAlramId(alramId); //알람 찾기.
  if (!foundAlram) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '알람이 존재 하지 않습니다.');
  }

  if (!foundAlram.reciverId.equals(userId)) {
    throw new CustomError(commonError.USER_MATCH_ERROR, '유저의 것이 아닙니다.');
  }

  const alram = await alramService.readAlram(alramId);

  res.status(200).json({ message: '알람 읽기 성공', alram });
}
