import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true },
  profileImageSrc: { type: String },
});

const User = mongoose.model('User', userSchema);
export default User;
