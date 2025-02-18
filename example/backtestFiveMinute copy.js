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

async function getData(startDateTime, endDateTime) {
  let totalTrades = 0;
  let totalCallPoints = 0
  let totalPutPoints = 0
  let tradesWithProfit = 0
  let tradesWithLoss = 0
  let threshold = 0.40
  try {
    const data = await smart_api.getCandleData({
      exchange: "NSE",
      symboltoken: "99926000",
      interval: "FIVE_MINUTE",
      fromdate: startDateTime,
      todate: endDateTime,
    });

    if(data?.success == false){
      console.log("error", data)
      return
    }
    // console.log(data)
    if(data.data.length > 0){
      // console.log('data.data',data.data)  
      let res = data.data
      // console.log(res)
      res.forEach((element,ind) => {
        if(ind !== 0){  
          let currentCandle = res[ind]
          let lastCandle = res[ind-1];
          if(lastCandle[4] > lastCandle[1]){
            if(currentCandle[1] > lastCandle[4] && currentCandle[1] > lastCandle[1]){
              let openingDiff = currentCandle[1] - lastCandle[4];
              if(openingDiff >= threshold){
                totalTrades++
                let points = currentCandle[4]-currentCandle[1]
                let thirtyPoints = currentCandle[2]-currentCandle[1]
                // console.log("Green Candle",currentCandle[0], openingDiff.toFixed(2), points.toFixed(2), thirtyPoints.toFixed(2))
                points > 0  ? tradesWithProfit++ : tradesWithLoss++
                totalCallPoints += points
              }
            }
          }else{
            if(lastCandle[4] > currentCandle[1]  && lastCandle[1] > currentCandle[1]){
              let openingDiff = lastCandle[4] - currentCandle[1];
              if(openingDiff >= threshold){
                totalTrades++
                let points =  currentCandle[1] - currentCandle[4]
                let thirtyPoints = currentCandle[3]-currentCandle[1]
                // console.log("Red Candle",currentCandle[0], openingDiff.toFixed(2), points.toFixed(2), thirtyPoints.toFixed(2))
                totalPutPoints += points
                points > 0  ? tradesWithProfit++ : tradesWithLoss++
              }
            }
          }
        }
        
        
      });
      result.push({startDateTime,totalTrades,totalCallPoints,totalPutPoints, total: totalCallPoints+totalPutPoints, tradesWithProfit, tradesWithLoss})
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

// Oct 2024 = 
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
        console.log(start,end)
      await getData(start, end);

      // Increment the counter
      i++;
    }

    // Move to the next day
    firstDay.add(1, "days");
    await delay(700);
  }

  const qty = 250;
  const brockrage = 45;
  console.log(`Result for ${firstDay.format(
    "YYYY-MM-DD"
  )}`, result);
  const totalPointsGained = result.reduce((sum, item) => sum + item.total, 0);
  const totaltradesDone = result.reduce((sum, item) => sum + item.totalTrades, 0);
  console.log( `total points gained = ${totalPointsGained}`, `by doing ${totaltradesDone*2} trades` );
  console.log( `lot size =  ${qty} , total profie/loss using  = ${totalPointsGained*qty.toFixed(2)} Rs by using Rs ${totaltradesDone*2*brockrage} brockrage` );
}

main();
