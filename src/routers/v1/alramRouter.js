import express from 'express';
import * as alramController from '../../controllers/alramController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';

const alramRouter = express.Router();

// 자신의 모든 알람 보기
alramRouter.get('/', isAuth, asyncHandler(alramController.getAllAlrams));

// 특정 알람 삭제하기
alramRouter.delete('/delete/:alramId', isAuth, asyncHandler(alramController.deleteAlram));

// 특정 알람 삭제하기
alramRouter.delete('/delete-all', isAuth, asyncHandler(alramController.deleteAllAlrams));

// 특정 알람 읽음 처리 하기
alramRouter.patch('/:alramId', isAuth, asyncHandler(alramController.readAlram));

export default alramRouter;
