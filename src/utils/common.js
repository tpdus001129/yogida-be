import commonError from '../constants/errorConstant.js';
import CustomError from '../middleware/errorHandler.js';

export function jsonParser(data) {
  try {
    if (!data) {
      throw new CustomError(`data ${commonError.NOT_FOUND_VALUE_ERROR}`, 'Data에 값이 없습니다.', { statusCode: 400 });
    }
    const result = JSON.parse(data);
    return result;
  } catch (error) {
    throw new CustomError(commonError.JSON_SYNTAX_ERROR, '유요한 JSON 형태의 문자열이 아닙니다.', {
      statusCode: 500,
      cause: error,
    });
  }
}
