// Dev/Staging config is the base
const base = {
  tokenSignature: process.env.TOKEN_SIGNATURE || 'ssshhh',
};

const local = {};

const prod = {};

const env = process.env.REACT_APP_APP_ENV;

export default {
  ...base,
  ...(env === 'local' ? local : {}),
  ...(env === 'production' ? prod : {}),
};
