import 'dotenv/config';

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
  },
  db: {
    host: validateKey('MONGO_HOST'),
  },
  kakao: {
    auth: {
      restApiKey: validateKey('REST_API_KEY'),
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
