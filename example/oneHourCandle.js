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

let result = [];
let profitPoints = 50
let lossPoints = -25
let earedPoints  = 0
let loosedPoints = 0
let coutDown = 0
async function getData(startDateTime, endDateTime) {

  try {
    const data = await smart_api.getCandleData({
      exchange: 'NSE',
      symboltoken: '99926000',
      interval: 'ONE_HOUR',
      fromdate: startDateTime,
      todate: endDateTime
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
      // console.log('stockData',stockData[0])
      // return
      for(let i=0; i< stockData.length; i++){
        if(i !== 0){
          let curCndle = stockData[i];
          let lastCndle = stockData[i-1];
          if(lastCndle['close'] > lastCndle['open']){
            if(curCndle['open'] > lastCndle['high'] ){
              console.log("Buy",curCndle['time'])
            }
          }else{
            if(curCndle['open'] < lastCndle['low'] ){
              console.log("sell", curCndle['time'])
            }
          }
          
        }
        
      }
      // console.log('end of for loop')
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

const dayone = "2024-10-01";
async function main() {
  let firstDay = moment(dayone); // Initialize as a moment object
  let i = 0;

  while (i < 19) {
    if (
      firstDay.format("dddd") !== "Saturday" &&
      firstDay.format("dddd") !== "Sunday"
    ) {
      let start = firstDay.clone().hour(9).minute(15).format("YYYY-MM-DD HH:mm");
      let end = firstDay.clone().hour(15).minute(30).format("YYYY-MM-DD HH:mm");
      
      // console.log(start)
      await getData(start, end);
      // getData("2024-11-04 09:15","2024-11-04 15:30")

      // Increment the counter
      i++;
    }

    // Move to the next day
    firstDay.add(1, "days");
    // await delay(700);
  }

  // console.log("******************************")
  // console.log("Total Trades", coutDown)
  // console.log("Profit Points", earedPoints)
  // console.log("Loss Points", loosedPoints)
  // console.log("Total Points", earedPoints + loosedPoints)
  // console.log("******************************")

}

main();
