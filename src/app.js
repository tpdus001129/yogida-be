import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import v1Router from './routers/index.js';
import connectDB from './db/mongoose.js';

import postRouter from './routers/v1/postRouter.js';
import bookmarkRouter from './routers/v1/bookmarkRouter.js';

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', v1Router);
app.use('/api/posts', postRouter);
app.use('/api/users/bookmarks', bookmarkRouter);

app.listen(config.host.port, () => {
  console.log(`Server is running on port : ${config.host.port}`);
});
