import User from '../models/schemas/User.js';

export async function getAllUsers() {
  return await User.find({}).lean();
}

export async function getUserById(id) {
  try {
    return await User.findOne({ _id: id }, { password: false }).lean();
  } catch (err) {
    throw new Error(err);
  }
}

export async function getUserBySnsId(snsId) {
  try {
    return await User.findOne({ snsId }, { password: false }).lean();
  } catch (err) {
    throw new Error(err);
  }
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
    throw new Error(err);
  }
}

export async function deleteUser(_id) {
  try {
    await User.deleteOne({ _id });

    return { status: 200, message: '탈퇴 성공' };
  } catch (err) {
    throw new Error(err);
  }
}
