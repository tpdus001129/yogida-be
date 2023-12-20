import mongoose, { Schema } from 'mongoose';

export const authSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  authCode: {
    type: String,
    required: true,
  },
  expiredTime: {
    type: Date,
    required: true,
  },
});

const Auth = mongoose.model('Auth', authSchema);
export default Auth;
