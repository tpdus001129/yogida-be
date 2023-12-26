import Joi from 'joi';
import CustomError from '../errorHandler.js';
import commonError from '../../constants/errorConstant.js';

export const signup = Joi.object({
  body: Joi.object({
    snsId: Joi.string(),
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
    profileImageUrl: Joi.string(),
    type: Joi.string(),
  }),
  query: Joi.object(),
  params: Joi.object(),
});

export const authMail = Joi.object({
  body: Joi.object({
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
  }),
  query: Joi.object(),
  params: Joi.object(),
});

export const checkMail = Joi.object({
  body: Joi.object({
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
  }),
  query: Joi.object(),
  params: Joi.object(),
});

export const login = Joi.object({
  body: Joi.object({
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
  }),
  query: Joi.object(),
  params: Joi.object(),
});

export const changePassword = Joi.object({
  body: Joi.object({
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
  }),
  query: Joi.object(),
  params: Joi.object(),
});
