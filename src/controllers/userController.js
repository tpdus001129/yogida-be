import * as userService from '../services/userService.js';

// export async function getUser(req, res) {
// }

export async function getUserById(req, res) {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);

  if (!user) {
    throw new Error('유저를 찾을 수 없습니다.');
  }

  return res.status(200).json({ user });
}

export async function checkNickname(req, res) {
  const { nickname } = req.params;
  const user = await userService.getUserByNickname(nickname);

  if (!user) {
    return res.status(404).json({ msg: '사용할 수 있는 닉네임 입니다.' });
  }

  return res.status(200).json({ msg: '이미 사용중인 닉네임 입니다.' });
}
