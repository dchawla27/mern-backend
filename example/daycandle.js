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
      interval: 'ONE_MINUTE',
      fromdate: startDateTime,
      todate: endDateTime
    });
    // console.log('data',data?.data[240])
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
      
      let fourHoursArray = stockData.slice(0,241)
// console.log('stockData',stockData.length)
      const highs = fourHoursArray.map(item => item.high);
      const lows = fourHoursArray.map(item => item.low);

      const maxHigh = Math.max(...highs);
      const maxLow = Math.min(...lows);
      const mid = (maxHigh+maxLow) / 2;

      // console.log("maxHigh",maxHigh)
      // console.log("maxLow",maxLow)
      // console.log("mid", mid)
      
      for(let i = 242; i< stockData.length; i++){
        if (stockData[i]['open'] < maxLow || stockData[i]['open'] > maxHigh) {
          let tradeComplete = false
          coutDown++
          let tradePrice = stockData[i]['open']
          // console.log("tradePrice",tradePrice)
          if(tradePrice > maxHigh){
            for(let j = i+1; j< stockData.length; j++){
              const diff = stockData[j]['open'] - tradePrice;
              if(diff > profitPoints){
                console.log("success Trade", moment(stockData[j]['time']).format("YYYY-MM-DD HH:mm"), diff)
                earedPoints += diff
                tradeComplete = true
                break;
              }else if(diff < lossPoints){
                console.log("failed Trade", moment(stockData[j]['time']).format("YYYY-MM-DD HH:mm"), diff)
                loosedPoints += diff
                tradeComplete = true
                break;
              }
            }
            if(!tradeComplete){
              if(tradePrice > stockData[stockData.length-1]['open']){
                console.log("failed Trade at end of the day on ",moment(stockData[0]['time']).format("YYYY-MM-DD HH:mm"), stockData[stockData.length-1]['open'] - tradePrice)
              }else{
                console.log("success Trade at end of the day",moment(stockData[0]['time']).format("YYYY-MM-DD HH:mm"), stockData[stockData.length-1]['open'] - tradePrice)
              }
              // console.log(`unsettled on ${moment(stockData[0]['time']).format("YYYY-MM-DD HH:mm")} Trade price = ${tradePrice} and last candle price was = ${stockData[stockData.length-1]['open']}`) 
            }

          }else{
            for(let j = i+1; j< stockData.length; j++){
              const diff = tradePrice - stockData[j]['open'];
              if(diff > profitPoints){
                console.log("success Trade", moment(stockData[j]['time']).format("YYYY-MM-DD HH:mm"), diff)
                earedPoints += diff
                tradeComplete = true
                break;
              }else if(diff < lossPoints){
                console.log("failed Trade", moment(stockData[j]['time']).format("YYYY-MM-DD HH:mm"), diff)
                loosedPoints += diff
                tradeComplete = true
                break;
              }
            }

            if(!tradeComplete){
              if(tradePrice > stockData[stockData.length-1]['open']){
                console.log("success Trade at end of the day",moment(stockData[0]['time']).format("YYYY-MM-DD HH:mm"), stockData[stockData.length-1]['open'] - tradePrice)
              }else{
                console.log("failed Trade at end of the day",moment(stockData[0]['time']).format("YYYY-MM-DD HH:mm"), stockData[stockData.length-1]['open'] - tradePrice)
              }
              // console.log(`unsettled on ${moment(stockData[0]['time']).format("YYYY-MM-DD HH:mm")} Trade price = ${tradePrice} and last candle price was = ${stockData[stockData.length-1]['open']}`) 
            }
          }
          
          break;
        }
      }
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

const dayone = "2024-09-01";
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
    await delay(700);
  }

  console.log("******************************")
  console.log("Total Trades", coutDown)
  console.log("Profit Points", earedPoints)
  console.log("Loss Points", loosedPoints)
  console.log("Total Points", earedPoints + loosedPoints)
  console.log("******************************")

}

main();
