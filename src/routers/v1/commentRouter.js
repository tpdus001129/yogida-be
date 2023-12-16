import express from 'express';
import * as commentController from '../../controllers/commentController.js';
const router = express.Router();

router.get('/posts/:postId/comments', commentController.getAllComment);
router.post('/posts/:postId/comments', commentController.createComment);
router.put('/posts/:postId/comments/:commentId', commentController.updateComment);
router.delete('/posts/:postId/comments/:commentId', commentController.deleteComment);

export default router;
