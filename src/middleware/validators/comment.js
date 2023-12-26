import Joi from 'joi';

export const createComment = Joi.object({
  body: Joi.object({
    postId: Joi.string().required(),
    content: Joi.string().required(),
    parentComment: Joi.string(),
  }),
  query: Joi.object(),
  params: Joi.object({
    commentId: Joi.string().required(),
  }),
});

export const updateComment = Joi.object({
  body: Joi.object({
    content: Joi.string().required(),
  }),
  query: Joi.object(),
  params: Joi.object({
    commentId: Joi.string().required(),
  }),
});
