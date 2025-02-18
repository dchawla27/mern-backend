let {
  SmartAPI,
  WebSocketClient,
  WebSocketV2,
  WSOrderUpdates,
} = require("../lib");

var moment = require("moment"); // require

let smart_api = new SmartAPI({
  api_key: "", 
  access_token: "",
  refresh_token: "" 
});

let result = [];
let totalTrades = 0;
let tradesWithLoss = 0
let grandTotal = 0;
async function getData(startDateTime, endDateTime) {
 
  let totalCallPoints = 0
  let totalPutPoints = 0
  let tradesWithProfit = 0
  
  let threshold = 0.40
  let totalPointsCount = 0
  try {
    const data = await smart_api.getCandleData({
      exchange: 'NSE',
      symboltoken: '99926000',
      interval: 'THIRTY_MINUTE',
      fromdate: `${startDateTime} 09:15`,
      todate: `${startDateTime} 09:45`
    });
    // const data = await smart_api.getCandleData({
    //   exchange: "NSE",
    //   symboltoken: "99926000",
    //   interval: "ONE_DAY",
    //   fromdate: startDateTime,
    //   todate: endDateTime,
    // });
    // console.log(data)

    if(data?.success == false){
      console.log("error", data)
      return
    }
    // console.log(data)
    if(data?.data?.length > 0){
      let res = data.data
      // console.log(res[0])
      let myHigh = res[0][2];
      let myLow = res[0][3];
      
      const innerData = await smart_api.getCandleData({
        exchange: 'NSE',
        symboltoken: '99926000',
        interval: 'ONE_MINUTE',
        fromdate: `${startDateTime} 09:45`,
        todate: `${startDateTime} 15:30`
      });

      console.log("----------------------------")
      if(res[0][4] > res[0][1]){ // green candle.
        if(innerData?.data?.length > 0){
          let oneMinuteData = innerData.data;
          let points = 0
          let purchage = 0
          let newIndex = 0
          let highOfTheDay = 0
          let noTrade = true
          for(let i = 1; i< oneMinuteData.length; i++){
            if(oneMinuteData[i][1] > myHigh){
              console.log('buy position',oneMinuteData[i][0])
              purchage = oneMinuteData[i][1]
              highOfTheDay = oneMinuteData[i][1]
              newIndex = i
              noTrade = false
              totalTrades++
              break
            }
          }
          
          if(!noTrade){
            for(let i = newIndex+1; i< oneMinuteData.length; i++){
              if(oneMinuteData[i][1] < myLow){
                points = myLow - purchage
                grandTotal = grandTotal - points
                console.log('loss', oneMinuteData[i][0])
                tradesWithLoss++
                // totalPointsCount = totalPointsCount - points
                break
              }else{
                if(oneMinuteData[i][1] > highOfTheDay){
                  highOfTheDay = oneMinuteData[i][1]
                }
                // console.log('buy position',oneMinuteData[i])
                points = highOfTheDay - purchage
              }
            }
            
            console.log('total points', points )
            // totalPointsCount += 50

          }else {
            console.log("No trade for", res[0][0])
          }
          
        }
      }else{
        if(innerData?.data?.length > 0){
          let oneMinuteData = innerData.data;
          let points = 0
          let sell = 0
          let newIndex = 0
          let lowOfTheDay = 0
          let noTrade = true
          for(let i = 1; i< oneMinuteData.length; i++){
            if(myLow > oneMinuteData[i][1]){
              console.log('sell position',oneMinuteData[i][0])
              sell = oneMinuteData[i][1]
              lowOfTheDay = oneMinuteData[i][1]
              newIndex = i
              noTrade = false
              totalTrades++
              break
            }
          }
          
          if(!noTrade){
            for(let i = newIndex+1; i< oneMinuteData.length; i++){
              if(oneMinuteData[i][1] > myHigh){
                points = myHigh - sell
                grandTotal = grandTotal - points
                console.log('loss', oneMinuteData[i][0])
                tradesWithLoss++
                break
              }else{
                if(lowOfTheDay > oneMinuteData[i][1]){
                  lowOfTheDay = oneMinuteData[i][1]
                }
                // console.log('buy position',oneMinuteData[i])
                points = sell - lowOfTheDay
              }
            }
            
            console.log('total points', points )
          }else {
            console.log("No trade for", res[0][0])
          }
        }
      }
      
      // res.forEach((element, ind) => {
      //   if(ind !== 0){
      //     let currentCandle = res[ind]
      //     let lastCandle = res[ind-1];
      //     const lowerBound = lastCandle[1]
      //     const upperBound = lastCandle[4]
      //     if (currentCandle[1] < Math.min(lowerBound, upperBound) || currentCandle[1] > Math.max(lowerBound, upperBound)) {
      //       if(lastCandle[4] > lastCandle[1]){
      //         console.log(currentCandle[0], currentCandle[2] - currentCandle[1])
      //       }else{
      //         console.log(currentCandle[0], currentCandle[1] - currentCandle[3])
      //       }
      //     }
          
      //   }
        
      // });
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
// jul 2024 = 
// Aug 20024 = 277
// Sep 2024 = 73
// Oct 2024 = 487
// Nov 2024 = 347
const dayone = "2024-07-01";
async function main() {
  let firstDay = moment(dayone); // Initialize as a moment object
  let i = 0;

  while (i < 21) {
    if (
      firstDay.format("dddd") !== "Saturday" &&
      firstDay.format("dddd") !== "Sunday"
    ) {
      let start = firstDay.clone().hour(9).minute(15).format("YYYY-MM-DD HH:mm");
      let end = firstDay.clone().hour(15).minute(30).format("YYYY-MM-DD HH:mm");
      let startDate = firstDay.format("YYYY-MM-DD")
      
      // console.log(start)
      await getData(startDate, startDate);

      // Increment the counter
      i++;
    }

    // Move to the next day
    firstDay.add(1, "days");
    await delay(700);
  }

  console.log("totalTrades",totalTrades)
  console.log("tradesWithLoss",tradesWithLoss)
  console.log("grandTotal",((totalTrades - tradesWithLoss) * 100)-grandTotal)

  const qty = 250;
  const brockrage = 45;
  console.log(`Result for ${firstDay.format(
    "YYYY-MM-DD"
  )}`, result);
  const totalPointsGained = result.reduce((sum, item) => sum + item.total, 0);
  const totaltradesDone = result.reduce((sum, item) => sum + item.totalTrades, 0);
  // console.log( `total points gained = ${totalPointsGained}`, `by doing ${totaltradesDone*2} trades` );
  // console.log( `lot size =  ${qty} , total profie/loss using  = ${totalPointsGained*qty.toFixed(2)} Rs by using Rs ${totaltradesDone*2*brockrage} brockrage` );
}

main();
