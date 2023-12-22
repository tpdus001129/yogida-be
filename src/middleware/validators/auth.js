import Joi from 'joi';
import CustomError from '../errorHandler.js';
import commonError from '../../constants/errorConstant.js';

export const signup = Joi.object({
  email: Joi.string()
    .email()
    .error(
      (err) =>
        new CustomError(commonError.VALIDATION_ERROR, '올바른 이메일 형식이 아닙니다.', {
          statusCode: 400,
          cause: err,
        }),
    )
    .required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_])'))
    .error(
      (err) =>
        new CustomError(commonError.VALIDATION_ERROR, '비밀번호 형식이 올바르지 않습니다.', {
          statusCode: 400,
          cause: err,
        }),
    ),
  nickname: Joi.string().required(),
  type: Joi.string(),
});

export const authMail = Joi.object({
  email: Joi.string()
    .email()
    .error(
      (err) =>
        new CustomError(commonError.VALIDATION_ERROR, '올바른 이메일 형식이 아닙니다.', {
          statusCode: 400,
          cause: err,
        }),
    )
    .required(),
});

export const checkMail = Joi.object({
  email: Joi.string()
    .email()
    .error(
      (err) =>
        new CustomError(commonError.VALIDATION_ERROR, '올바른 이메일 형식이 아닙니다.', {
          statusCode: 400,
          cause: err,
        }),
    )
    .required(),
  authCode: Joi.string().min(10).required(),
});

export const login = Joi.object({
  email: Joi.string()
    .email()
    .error(
      (err) =>
        new CustomError(commonError.VALIDATION_ERROR, '올바른 이메일 형식이 아닙니다.', {
          statusCode: 400,
          cause: err,
        }),
    )
    .required(),
  password: Joi.string().required(),
});

export const changePassword = Joi.object({
  email: Joi.string()
    .email()
    .error(
      (err) =>
        new CustomError(commonError.VALIDATION_ERROR, '올바른 이메일 형식이 아닙니다.', {
          statusCode: 400,
          cause: err,
        }),
    )
    .required(),
  password: Joi.string().required(),
});
