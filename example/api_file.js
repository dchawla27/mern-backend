const {
  api_key,
  access_token,
  refresh_token,
  feed_token,
  client_code,
} = require("../config/env");
let {
  SmartAPI,
  WebSocketClient,
  WebSocketV2,
  WSOrderUpdates,
} = require("../lib");
const WebSocket = require("ws");
var moment = require("moment"); // require
const wsUrl = "wss://smartapisocket.angelone.in/smart-stream";
const axios = require("axios");
// let smart_api = new SmartAPI({
//   api_key,
//   access_token,
//   refresh_token,
// });

async function healthCheck(api_key, client_code, access_token,feed_token,refresh_token) {
  let smart_api = new SmartAPI({
    api_key,
    access_token,
    refresh_token,
  });
  
  return smart_api.getProfile();
}

async function loginUser(clientcode, password, totp) {
  let smart_api = new SmartAPI({
    api_key: "diDHdAha",
  });
  try {
    let response = await smart_api.generateSession(clientcode, password, totp);
    return response;
  } catch (error) {
    // Returning detailed error information for debugging
    throw error.response ? error.response.data : new Error(error.message);
  }
}

async function getCandleData(api_key, client_code, access_token,feed_token,refresh_token, symboltoken, exchange) {
  try {
    let smart_api = new SmartAPI({
      api_key,
      access_token,
      refresh_token,
    });

    let currentTime = moment();
    let end = currentTime.format("YYYY-MM-DD HH:mm");
    let start = currentTime
      .clone()
      .subtract(10, "day")
      .format("YYYY-MM-DD HH:mm");
      console.log({
        exchange,
        symboltoken,
        interval: "FIVE_MINUTE",
        fromdate: start,
        todate: end,
      })
    const data = await smart_api.getCandleData({
      exchange,
      symboltoken,
      interval: "FIVE_MINUTE",
      fromdate: start,
      todate: end,
    });

    if (!data || data.success === false || !Array.isArray(data.data)) {
      console.error("Error fetching data from API:", data);
      return data;
    }

    const stockData = data.data.map(
      ([time, open, high, low, close, volume]) => ({
        time,
        open,
        high,
        low,
        close,
        volume,
      })
    );

    return stockData;
  } catch (e) {
    console.error("Error occurred in main:", e.message, e.stack);
  }
}

async function calculateData(api_key, client_code, access_token,feed_token,refresh_token, symboltoken, exchange) {
  const data = await getCandleData(api_key, client_code, access_token,feed_token,refresh_token, symboltoken, exchange);
  return data;
}

async function searchScrip(api_key, client_code, access_token, feed_token, refresh_token, symboltoken) {
  let smart_api = new SmartAPI({
    api_key,
    access_token,
    refresh_token,
  });

  try {
    // Searching the scrip
    const data1 = await smart_api.searchScrip({
      exchange: "NFO",
      searchscrip: symboltoken,
    });

    // Return combined data
    return data1
  } catch (error) {
    console.error("Error in searchScrip:", error);
    return null;
  }
}
module.exports = { healthCheck, calculateData, loginUser, searchScrip };
