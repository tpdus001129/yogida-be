import User from '../models/schemas/user.js';

export async function getAllUsers() {
  return await User.find({}).exec();
}

export async function getUserById(_id) {
  try {
    return await User.findOne({ _id }, { password: false }).exec();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getUserBySnsId(snsId) {
  try {
    return await User.findOne({ snsId }, { password: false }).exec();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getUserByNickname(nickname) {
  return await User.findOne({ nickname });
}

export async function getUserByClientId(clientId) {
  try {
    return await User.findOne({ _id: clientId }, { password: false }).exec();
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateUser(_id, { phone, name }) {
  try {
    // 전화번호가 이미 존재하는지 확인
    const existingUser = await User.findOne({ phone });

    if (existingUser && existingUser._id.toString() !== _id) {
      return { status: 400, message: '해당 전화번호가 이미 존재합니다.' };
    }

    const data = await User.updateOne({ _id }, { phone, name }).exec();
    if (!data.acknowledged) {
      return { status: 200, message: '수정 실패' };
    }
    return { status: 200, massage: '수정 성공' };
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteUser(_id) {
  try {
    await User.deleteOne({ _id }).exec();

    return { status: 200, message: '탈퇴 성공' };
  } catch (err) {
    throw new Error(err);
  }
}
