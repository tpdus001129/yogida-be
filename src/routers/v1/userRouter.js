import express from 'express';
import * as userController from '../../controllers/userController.js';
import asyncHandler from '../../middleware/asyncHandler.js';

const router = express.Router();

// 유저 조회
router.get('/:userId', asyncHandler(userController.getUser));

export default router;
