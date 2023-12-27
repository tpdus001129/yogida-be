import express from 'express';
import cookieParser from 'cookie-parser';
import config from './config/config.js';
import v1Router from './routers/index.js';
import connectDB from './db/mongoose.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

connectDB();

app.use('/images', express.static('src/images'));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/api', v1Router);

// 오류처리 미들웨어
app.use(errorHandler);

app.listen(config.host.port, () => {
  console.log(`Server is running on port : ${config.host.port}`);
});
