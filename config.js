require('dotenv').config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  WS_URL: process.env.WS_URL,
  API_KEY: process.env.API_KEY,
  CLIENT_CODE: process.env.CLIENT_CODE,
  INTERVAL_MS: parseInt(process.env.INTERVAL_MS, 10),
  TIMEZONE: process.env.TIMEZONE,
  LOGIN_PIN:process.env.LOGIN_PIN,
};