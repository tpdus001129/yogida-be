import User from '../models/schemas/user.js';
// import models from '../models/index.js';

export function getUser(id) {
  return { _id: id, email: 'user@test.com', username: 'user' };
}

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
export async function getUserByClientId(clientId) {
  try {
    return await User.findOne({ _id: clientId }, { password: false }).exec();
  } catch (err) {
    throw new Error(err);
  }
}

export async function createUser(user) {
  // 생성하기전 db에 유저가 있는지 확인.
  const userCheck = this.getUserById(user._id);

  // 유저가 있다면 에러 메세지를 준다.
  if (!userCheck) {
    return false;
  }

  return await User.create(user);
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

export async function disableAccountUser() {
  // const session = await mongoose.startSession();
  // session.startTransaction();
  // try {
  //   await User.updateOne({ _id }, { useyn: true }).session();
  //   await models.Order.deleteMany({ userId: _id }).session();
  //   await models.Address.deleteMany({ userId: _id }).session();
  //   await models.Dog.deleteMany({ userId: _id }).session();
  //   await session.commitTransaction();
  // } catch (err) {
  //   await session.abortTransaction();
  //   throw new Error(err);
  // } finally {
  //   session.endSession();
  // }
}
