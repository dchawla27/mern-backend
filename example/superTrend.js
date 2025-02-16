let {
  SmartAPI,
  WebSocketClient,
  WebSocketV2,
  WSOrderUpdates,
} = require("../lib");

const { api_key, access_token, refresh_token, feed_token } = require("../config/env")
var moment = require("moment"); // require
const { ATR } = require('technicalindicators');



let smart_api = new SmartAPI({
  api_key,
  access_token,
refresh_token
});


let result = [];
let profitPoints = 50
let lossPoints = -25
let earedPoints  = 0
let loosedPoints = 0
let coutDown = 0

const calculateSupertrend = (data, atrPeriod = 20, multiplier = 2) => {
  // Prepare input for ATR calculation
  const inputATR = {
    high: data.map((d) => d.high),
    low: data.map((d) => d.low),
    close: data.map((d) => d.close),
    period: atrPeriod,
  };

  // Calculate ATR
  const atrValues = ATR.calculate(inputATR);

  // Add ATR to data
  const supertrend = [];
  for (let i = 0; i < data.length; i++) {
    if (i < atrPeriod - 1) {
      // Skip rows without enough data
      supertrend.push({ ...data[i], atr: null, upperBand: null, lowerBand: null, supertrend: null, signal: null });
    } else {
      const atr = atrValues[i - atrPeriod + 1];
      const midPrice = (data[i].high + data[i].low) / 2;
      const upperBand = midPrice + multiplier * atr;
      const lowerBand = midPrice - multiplier * atr;

      const prevSupertrend = supertrend[i - 1]?.supertrend || lowerBand;
      const newSupertrend = data[i].close > prevSupertrend ? lowerBand : upperBand;

      supertrend.push({
        ...data[i],
        atr,
        upperBand,
        lowerBand,
        supertrend: newSupertrend,
        signal: data[i].close > newSupertrend ? 'Buy' : 'Sell',
      });
    }
  }

  return supertrend;
};

async function getData(startDateTime, endDateTime) {

  try {
   
    const data = await smart_api.getCandleData({
      exchange: 'NSE',
      symboltoken: '99926000',
      interval: 'FIVE_MINUTE',
      fromdate: '2024-12-31 09:15',
      todate: '2025-01-01 15:30'
    });
    // console.log('data',data)
    // return

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
      const slicedArray = stockData.slice(54, stockData.length-1);

      // console.log('stockData',slicedArray)
      // console.log('stockData',slicedArray.length)
      const result = calculateSupertrend(slicedArray);
      console.log(result);
     
    }
    
    
  } catch (error) {
    result.push({
      date: startDateTime,
      day: moment(startDateTime, "YYYY-MM-DD HH:mm").format("dddd"),
      "Error fetching candle data": error,
      "Points gained till 9:40": 0,
    });
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// 10 24 = Total Points -5.849999999994907
// 11 24 = Total Points 283.8999999999942

const dayone = "2025-01-02";
const dayTow= "2025-01-02";
async function main() {
  let firstDay = moment(dayone); // Initialize as a moment object
  let i = 0;

  // while (i < 19) {
  //   if (
  //     firstDay.format("dddd") !== "Saturday" &&
  //     firstDay.format("dddd") !== "Sunday"
  //   ) {
      let start = moment(dayone).clone().hour(9).minute(15).format("YYYY-MM-DD HH:mm");
      let end = moment(dayTow).clone().hour(15).minute(30).format("YYYY-MM-DD HH:mm");
      
      // console.log(start)
      await getData(start, end);
      // getData("2024-11-04 09:15","2024-11-04 15:30")

      // Increment the counter
      i++;
    // }

    // Move to the next day
    firstDay.add(1, "days");
    // await delay(700);
  // }

  // console.log("******************************")
  // console.log("Total Trades", coutDown)
  // console.log("Profit Points", earedPoints)
  // console.log("Loss Points", loosedPoints)
  // console.log("Total Points", earedPoints + loosedPoints)
  // console.log("******************************")

}

main();
