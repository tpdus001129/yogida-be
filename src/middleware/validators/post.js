import Joi from 'joi';
import CustomError from '../errorHandler.js';
import commonError from '../../constants/errorConstant.js';

export const post = Joi.object({
  body: Joi.object({
    title: Joi.string().required(),
    destination: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    tag: Joi.array().items(Joi.string().required()).required(),
    schedules: Joi.array()
      .items(
        Joi.array().items(
          Joi.object({
            placeName: Joi.string().required(),
            placeImageSrc: Joi.string().required(),
            star: Joi.number().required(),
            category: Joi.string().required(),
            placePosition: Joi.array().items(Joi.number().required(), Joi.number().required()),
          }).required(),
        ),
      )
      .required(),
    distances: Joi.array().items(Joi.array().items(Joi.number().required()).required()).required(),
    cost: Joi.number().required(),
    peopleCount: Joi.number().required(),
    isPublic: Joi.boolean().required(),
    reviewText: Joi.string().required(),
  }),
  query: Joi.object(),
  params: Joi.object({
    postId: Joi.string().trim().empty(),
  }),
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
