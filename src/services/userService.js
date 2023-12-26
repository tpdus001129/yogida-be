import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';
import User from '../models/schemas/User.js';

export async function getAllUsers() {
  return await User.find({}).lean();
}

export async function getUserById(id) {
  try {
    return await User.findOne({ _id: id }, { password: false }).lean();
  } catch (err) {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', { statusCode: 500, cause: err });
  }
}

export async function getUserBySnsId(snsId) {
  try {
    return await User.findOne({ snsId }, { password: false }).lean();
  } catch (err) {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', { statusCode: 500, cause: err });
  }
}

// 자기 자신 정보 수정
export async function updateUser({ userId, nickname, profileImageSrc }) {
  const user = await User.findByIdAndUpdate(
    { _id: userId },
    { nickname, profileImageSrc },
    { new: true, runValidators: true },
  )
    .lean()
    .catch((err) => {
      throw new CustomError(commonError.DB_ERROR, 'Internal server error', {
        statusCode: 500,
        cause: err,
      });
    });

  console.log(user);
  if (!user) {
    throw new CustomError(commonError.USER_UNKNOWN_ERROR, '해당 유저를 찾을 수 없습니다.', { statusCode: 403 });
  }

  return user;
}

export async function getUserByNickname(nickname) {
  return await User.findOne({ nickname }).lean();
}

export async function getUserByEmail(email) {
  return await User.findOne({ email }, { password: false }).lean();
}

export async function getUserByClientId(clientId) {
  try {
    return await User.findOne({ _id: clientId }, { password: false }).lean();
  } catch (err) {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', { statusCode: 500, cause: err });
  }
}

export async function deleteUser(_id) {
  try {
    return await User.deleteOne({ _id });
  } catch (err) {
    throw new CustomError(commonError.DB_ERROR, 'Internal server error', { statusCode: 500, cause: err });
  }
}
