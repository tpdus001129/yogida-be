import 'dotenv/config';

function isRequired(key, defaultValue = undefined) {
  // process.env의 key값이 존재하지 않으면 defaultValue를 반환한다.
  const value = process.env[key] || defaultValue;

  if (value == null) {
    throw new Error(`Missing required environment variable ${key}`);
  }

  return value;
}

const config = {
  host: {
    port: isRequired('SERVER_PORT'),
  },
  db: {
    host: isRequired('MONGO_HOST'),
  },
  kakao: {
    auth: {
      restApiKey: isRequired('REST_API_KEY'),
      redirectUri: isRequired('REDIRECT_URI'),
    },
  },
  bcrypt: {
    saltRounds: isRequired('SALT_ROUNDS'),
  },
  jwt: {
    secretKey: isRequired('JWT_SECRET_KEY'),
    expiresSec: isRequired('JWT_EXPIRES_SEC'),
  },
};

export default config;
