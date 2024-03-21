import * as userService from '../services/userService.js';
import { jsonParser } from '../utils/common.js';

// 특정 유저 조회
export async function getUserById(req, res) {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  if (!user) {
    throw new Error('유저를 찾을 수 없습니다.');
  }

  return res.status(200).json({ user });
}

// 자기 자신 정보 수정
export async function updateUser(req, res) {
  const userId = req.userId;
  const payload = req.body.payload;

  const { nickname } = jsonParser(payload);

  let profileImageSrc;

  // 업로드 성공했을때
  if (req.file) {
    // profileImageSrc = `/images/${req.file.filename}`;
    // multer-s3용 코드
    profileImageSrc = `${req.file.location}`;
  }

  const user = await userService.updateUser({ userId, nickname, profileImageSrc });

  return res.status(200).json({ message: '수정완료', user });
}

// 닉네임 중복 확인
export async function checkNickname(req, res) {
  const { nickname } = req.body;
  // 이메일로 가입된 정보가 있는지 확인한다.
  const user = await userService.getUserByNickname(nickname);

  if (!user) {
    // null 일때 실행됨. 즉 유저가 없다.
    return res.status(200).json({ message: '사용할 수 있는 닉네임 입니다.' });
  }

  return res.status(409).json({ message: '이미 사용중인 닉네임 입니다.' });
}

// 이메일 중복 확인
export async function checkEmail(req, res) {
  const { email } = req.body;
  // 이메일로 가입된 정보가 있는지 확인한다.
  const user = await userService.getUserByEmail(email);

  if (!user) {
    // null 일때 실행됨. 즉 유저가 없다.
    return res.status(200).json({ message: '사용할 수 있는 이메일 입니다.' });
  }

  return res.status(409).json({ message: '이미 사용중인 이메일 입니다.' });
}
