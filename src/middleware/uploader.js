import multer from 'multer';
import CustomError from './errorHandler.js';
import { jsonParser } from '../utils/common.js';
import commonError from '../constants/errorConstant.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/images/');
  },
  filename: function (req, file, cb) {
    // 기본적으로 body 유효성 검사.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = file.mimetype.split('/')[1];
    cb(null, file.fieldname + uniqueSuffix + `.${ext}`);
  },
});

const limits = {
  fieldNameSize: 200, // 필드명 사이즈 최대값 (기본값 100bytes)
  filedSize: 1024 * 1024, // 필드 사이즈 값 설정 (기본값 1MB)
  fields: 5, // 파일 형식이 아닌 필드의 최대 개수 (기본 값 무제한)
  fileSize: 16777216, //multipart 형식 폼에서 최대 파일 사이즈(bytes) "16MB 설정" (기본 값 무제한)
  // files: 10, //multipart 형식 폼에서 파일 필드 최대 개수 (기본 값 무제한)
};

function validator(req, schema) {
  const payload = req.body.payload;

  const parsedPayload = jsonParser(payload);

  const validated = schema.validate({ body: parsedPayload, query: req.query, params: req.params });

  if (validated.error) {
    return { isError: false, errors: validated.error };
  }
  return { isError: true, errors: validated.error };
}

const setupSchema = (schema) => (req, file, cb) => {
  const { isError, errors } = validator(req, schema);

  if (!isError) {
    cb(new CustomError(commonError.VALIDATION_ERROR, '올바른 형식이 아닙니다.', { statusCode: 500, cause: errors }));
  } else {
    cb(null, true);
  }
};

export const profileUploader = (schema) =>
  multer({ storage: storage, limits, fileFilter: setupSchema(schema) }).single('profile');

export const postUploader = (schema) =>
  multer({ storage: storage, limits, fileFilter: setupSchema(schema) }).fields([
    { name: 'image', maxCount: 20 },
    { name: 'payload', maxCount: 1 },
  ]);
