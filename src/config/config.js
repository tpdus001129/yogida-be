import dotenv from 'dotenv';
// 만약 process.env.NODE_ENV 를 판별해 환경에 따라 다른 env 파일을 사용한다.
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

function validateKey(key, defaultValue = undefined) {
  // process.env의 key값이 존재하지 않으면 defaultValue를 반환한다.
  const value = process.env[key] || defaultValue;

  if (value == null) {
    throw new Error(`Missing required environment variable ${key}`);
  }

  return value;
}

const config = {
  host: {
    port: validateKey('SERVER_PORT'),
    clientUri: validateKey('CLIENT_URI'),
  },
  db: {
    host: validateKey('MONGO_HOST'),
  },
  kakao: {
    auth: {
      restApiKey: validateKey('REST_API_KEY'),
      appAdminKey: validateKey('APP_ADMIN_KEY'),
      redirectUri: validateKey('REDIRECT_URI'),
    },
  },
  bcrypt: {
    saltRounds: validateKey('SALT_ROUNDS'),
  },
  jwt: {
    secretKey: validateKey('JWT_SECRET_KEY'),
    expiresSec: validateKey('JWT_EXPIRES_SEC'),
  },
};

export default config;
