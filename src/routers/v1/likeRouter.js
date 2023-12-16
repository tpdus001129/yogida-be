import express from 'express';
import * as likeController from '../../controllers/likeController.js';
const router = express.Router();

router.get('/posts/:postId/likes', likeController.getAllLike);
router.post('/posts/:postId/likes', likeController.createLike);
router.delete('/posts/:postId/likes', likeController.deleteLike);

export default router;
