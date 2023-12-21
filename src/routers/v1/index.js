import express from 'express';
import userRouter from './userRouter.js';
import postRouter from './postRouter.js';
import bookmarkRouter from './bookmarkRouter.js';
import alramRouter from './alramRouter.js';
import authRouter from './authRouter.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/bookmarks', bookmarkRouter);
router.use('/alrams', alramRouter);

export default router;
