import Joi from 'joi';

export const createComment = Joi.object({
  postId: Joi.string().required(),
  content: Joi.string().required(),
  parentComment: Joi.string(),
});

export const updateComment = Joi.object({
  content: Joi.string().required(),
});
