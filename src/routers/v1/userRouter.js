import express from 'express';
import * as userController from '../../controllers/userController.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

const router = express.Router();

router.get('/:userId', asyncHandler(userController.getUser));

export default router;
