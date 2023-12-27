import Joi from 'joi';
import commonError from '../../constants/errorConstant.js';
import CustomError from '../errorHandler.js';

export const checkNickname = Joi.object({
  body: Joi.object({
    nickname: Joi.string()
      .required()
      .error((err) => {
        throw new CustomError(commonError.VALIDATION_ERROR, '올바른 형식으로 요청했는지 확인해 주세요.', {
          statusCode: 400,
          cause: err,
        });
      }),
  }),
  query: Joi.object(),
  params: Joi.object(),
});

export const checkEmail = Joi.object({
  body: Joi.object({
    email: Joi.string()
      .required()
      .error((err) => {
        throw new CustomError(commonError.VALIDATION_ERROR, '올바른 형식으로 요청했는지 확인해 주세요.', {
          statusCode: 400,
          cause: err,
        });
      }),
  }),
  query: Joi.object(),
  params: Joi.object(),
});
