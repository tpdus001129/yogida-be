import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  snsId: { type: String, required: false },
  provider: { type: String, enum: ['email', 'kakao'] },
  email: { type: String, required: true },
  password: { type: String },
  nickname: { type: String, required: true },
  profileImageSrc: { type: String, default: 'default' },
});

const User = mongoose.model('User', userSchema);
export default User;
