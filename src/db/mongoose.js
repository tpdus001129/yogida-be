import mongoose from 'mongoose';
import config from '../config/config.js';

export default async function connectDB() {
  mongoose
    .connect(config.db.host)
    .then(() => {
      console.log('DB Connected!');
    })
    .catch((err) => {
      console.error(err);
    });
}
