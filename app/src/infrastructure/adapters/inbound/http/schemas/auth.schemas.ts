export const registerSchema = {
  body: {
    type: 'object',
    required: ['method'],
    properties: {
      method: { type: 'string', enum: ['EMAIL', 'MOBILE'] },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8 },
      phoneNumber: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const loginSchema = {
  body: {
    type: 'object',
    required: ['password'],
    properties: {
      email: { type: 'string', format: 'email' },
      phoneNumber: { type: 'string' },
      password: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
      },
    },
  },
};

export const refreshSchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
  },
};

export const logoutSchema = {
  body: {
    type: 'object',
    required: ['accessToken'],
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
    },
  },
};

export const verifyOtpSchema = {
  body: {
    type: 'object',
    required: ['phoneNumber', 'otp'],
    properties: {
      phoneNumber: { type: 'string' },
      otp: { type: 'string' },
    },
  },
};
