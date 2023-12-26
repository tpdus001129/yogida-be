import express from 'express';
import * as alarmController from '../../controllers/alarmController.js';
import asyncHandler from '../../middleware/asyncHandler.js';
import { isAuth } from '../../middleware/isAuth.js';

const alarmRouter = express.Router();

// 자신의 모든 알람 보기
alarmRouter.get('/', isAuth, asyncHandler(alarmController.getAllAlarms));

// 모든 알람 삭제하기
alarmRouter.delete('/all', isAuth, asyncHandler(alarmController.deleteAllAlarms));

// 특정 알람 삭제하기
alarmRouter.delete('/:alarmId', isAuth, asyncHandler(alarmController.deleteAlarm));

// 특정 알람 읽음 처리 하기
alarmRouter.patch('/:alarmId', isAuth, asyncHandler(alarmController.readAlarm));

export default alarmRouter;
