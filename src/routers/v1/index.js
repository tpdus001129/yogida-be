import express from 'express';
import userRouter from './userRouter.js';
import postRouter from './postRouter.js';
import bookmarkRouter from './bookmarkRouter.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/bookmarks', bookmarkRouter);

export default router;
