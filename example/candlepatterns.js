let {
  SmartAPI,
  WebSocketClient,
  WebSocketV2,
  WSOrderUpdates,
} = require("../lib");
const { api_key, access_token, refresh_token, feed_token } = require("../config/env")
var moment = require("moment"); // require

let smart_api = new SmartAPI({
  api_key,
  access_token,
refresh_token
});


function identifyInsideBars(candles) {
  const insideBars = [];

  for (let i = 1; i < candles.length; i++) {
    const prevCandle = candles[i - 1];
    const currentCandle = candles[i];

    if (
      currentCandle.high < prevCandle.high &&
      currentCandle.low > prevCandle.low
    ) {
      insideBars.push({
        index: i,
        prevCandle,
        currentCandle,
      });
    }
  }

  return insideBars;
}

function identifyTwoCandlesReversal(candles) {
  const reversals = [];

  for (let i = 2; i < candles.length; i++) {
    const candle1 = candles[i - 2];
    const candle2 = candles[i - 1];
    const currentCandle = candles[i];

    // Two consecutive green candles and a reversal
    if (
      candle1.close > candle1.open &&
      candle2.close > candle2.open &&
      currentCandle.close < currentCandle.open
    ) {
      reversals.push({
        index: i,
        direction: "Bearish",
        candles: currentCandle,
      });
    }

    // Two consecutive red candles and a reversal
    if (
      candle1.close < candle1.open &&
      candle2.close < candle2.open &&
      currentCandle.close > currentCandle.open
    ) {
      reversals.push({
        index: i,
        direction: "Bullish",
        candles: currentCandle,
      });
    }
  }

  return reversals;
}

async function getData(startDateTime, endDateTime) {

  try {
    const data = await smart_api.getCandleData({
      exchange: 'NSE',
      symboltoken: '99926000',
      interval: 'FIVE_MINUTE',
      fromdate: `${startDateTime} 09:15`,
      todate: `${startDateTime} 15:30`
    });
   

    if(data?.success == false){
      console.log("error", data)
      return
    }
    
   
    if(data?.data?.length > 0){
      let res = data.data
      const stockData = res.map(([time, open, high, low, close, volume]) => ({
        time, // Convert timestamp to a Date object
        open,
        high,
        low,
        close,
        volume,
      }));
      try{
        // console.log('stockData',stockData)
        // const insideBars = identifyInsideBars(stockData);
        // console.log("Inside Bars:", insideBars);

        const reversals = identifyTwoCandlesReversal(stockData);
        console.log("Two Candle Reversals:", reversals);

        
      }catch(e){
        console.log('error',e)
      }
      // console.log('stockData',stockData)
     

    }
    
  } catch (error) {
   console.log( "Error fetching candle data", error)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const dayone = "2024-12-05";


async function main() {
  let firstDay = moment(dayone); // Initialize as a moment object
  let i = 0;

  // while (i < 20) {
  //   if (
  //     firstDay.format("dddd") !== "Saturday" &&
  //     firstDay.format("dddd") !== "Sunday"
  //   ) {
      let start = firstDay.clone().hour(9).minute(15).format("YYYY-MM-DD HH:mm");
      let end = firstDay.clone().hour(15).minute(30).format("YYYY-MM-DD HH:mm");
      let startDate = firstDay.format("YYYY-MM-DD")
      
      // console.log(start)
      // await getData(startDate, startDate);

      // Increment the counter
      i++;
    // }

    // Move to the next day
    firstDay.add(1, "days");
    await delay(700);
  // }
}

main();
