import Joi from 'joi';

// sample
/* const SAMPLE = Joi.object({
  body: Joi.object(),
  query: Joi.object(),
  params: Joi.object(),
}) */

export const createBookmark = Joi.object({
  body: Joi.object({
    singleScheduleId: Joi.string().required(),
    postId: Joi.string().required(),
  }),
  query: Joi.object(),
  params: Joi.object(),
});

export const deleteBookmarks = Joi.object({
  body: Joi.object({
    singleScheduleIds: Joi.array().items(Joi.string()).required(),
  }),
  query: Joi.object(),
  params: Joi.object(),
});
