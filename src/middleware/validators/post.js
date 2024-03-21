import Joi from 'joi';
import CustomError from '../errorHandler.js';
import commonError from '../../constants/errorConstant.js';
import { cityList } from '../../utils/post.js';

export const getPost = Joi.object({
  body: Joi.object(),
  query: Joi.object({
    city: Joi.string().valid(...Array.from(cityList.keys())),
    tag: Joi.string(),
    sort: Joi.string().valid('최신순', '오래된순', '찜많은순'),
  }),
  params: Joi.object(),
});

export const post = Joi.object({
  body: Joi.object({
    title: Joi.string().not().empty().required(),
    destination: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    tag: Joi.array().items(Joi.string()).required(),
    schedules: Joi.array().items(
      Joi.object({
        placeName: Joi.string().required(),
        placeImageSrc: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
        star: Joi.number().required(),
        category: Joi.string().required(),
        day: Joi.number().required(),
        postId: Joi.string(),
        placePosition: Joi.array().items(Joi.number().required(), Joi.number().required()),
      }).required(),
    ),
    distances: Joi.array().items(Joi.array().items(Joi.number())),
    cost: Joi.number().required(),
    peopleCount: Joi.number().required(),
    isPublic: Joi.boolean().required(),
    reviewText: Joi.string(),
  }),
  query: Joi.object(),
  params: Joi.object(),
});

export const postById = Joi.object({
  body: Joi.object(),
  query: Joi.object(),
  params: Joi.object({
    postId: Joi.string()
      .hex()
      .min(24)
      .max(24)
      .required()
      .error(() => {
        throw new CustomError(commonError.VALIDATION_ERROR, 'postId 의 형식을 확인해 주세요');
      }),
  }),
});
