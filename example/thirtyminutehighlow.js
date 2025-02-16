let {
  SmartAPI,
  WebSocketClient,
  WebSocketV2,
  WSOrderUpdates,
} = require("../lib");

var moment = require("moment"); // require

let smart_api = new SmartAPI({
  api_key: "diDHdAha", // PROVIDE YOUR API KEY HERE
  // OPTIONAL : If user has valid access token and refresh token then it can be directly passed to the constructor
  access_token:
  "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IkFBQUIxMDQyODEiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwidG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMWMyVnlYM1I1Y0dVaU9pSmpiR2xsYm5RaUxDSjBiMnRsYmw5MGVYQmxJam9pZEhKaFpHVmZZV05qWlhOelgzUnZhMlZ1SWl3aVoyMWZhV1FpT2pnc0luTnZkWEpqWlNJNklqTWlMQ0prWlhacFkyVmZhV1FpT2lKbE1UTmtOVGswTkMwek56ZzBMVFEwTjJFdFltSTFOeTAzTnpsak1qSmhNV1F4T1dJaUxDSnJhV1FpT2lKMGNtRmtaVjlyWlhsZmRqRWlMQ0p2Ylc1bGJXRnVZV2RsY21sa0lqbzRMQ0p3Y205a2RXTjBjeUk2ZXlKa1pXMWhkQ0k2ZXlKemRHRjBkWE1pT2lKaFkzUnBkbVVpZlgwc0ltbHpjeUk2SW5SeVlXUmxYMnh2WjJsdVgzTmxjblpwWTJVaUxDSnpkV0lpT2lKQlFVRkNNVEEwTWpneElpd2laWGh3SWpveE56TXpOREEyTXpBeUxDSnVZbVlpT2pFM016TXpNVGszTWpJc0ltbGhkQ0k2TVRjek16TXhPVGN5TWl3aWFuUnBJam9pTVdVNU1HTmxaR1V0T0dJMk55MDBNemRrTFdKbU1EWXROVEZrWXpNNU9XTXdNemcxSWl3aVZHOXJaVzRpT2lJaWZRLmxLUU1hZ0o3WllDM2stRWJLTGY2UlAyWDNZWGZ4b0tfLXJEb21fMkNTWWk0TWVBNEVsXzN4X21pVnZqd2pBSGxZSGVKd09sUHNRYVR1VEZPdUhJaGpkNmRBZEk2akhfWFNrT0UwV0lDSmNncmYwNGdyYzMzQmY1bWFvaGpwU0RSQUxMY3BjcVg1elA5MzJNdVBfMWlDRUJyMXlLUnpPSHBTMnFRS2hKSTNhWSIsIkFQSS1LRVkiOiJkaURIZEFoYSIsImlhdCI6MTczMzMxOTkwMiwiZXhwIjoxNzMzNDA2MzAyfQ.1Pq0J0zkpoeGDbsCgO_ZukEHL-1t0zUvZsraFTromp5Q-fzgmuOc0nErQmIoiW8G66odDXj-erA4aHw6l6e8UQ",
refresh_token:
  "eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbiI6IlJFRlJFU0gtVE9LRU4iLCJSRUZSRVNILVRPS0VOIjoiZXlKaGJHY2lPaUpTVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5WDNSNWNHVWlPaUpqYkdsbGJuUWlMQ0owYjJ0bGJsOTBlWEJsSWpvaWRISmhaR1ZmY21WbWNtVnphRjkwYjJ0bGJpSXNJbWR0WDJsa0lqb3dMQ0p6YjNWeVkyVWlPaUl6SWl3aVpHVjJhV05sWDJsa0lqb2laVEV6WkRVNU5EUXRNemM0TkMwME5EZGhMV0ppTlRjdE56YzVZekl5WVRGa01UbGlJaXdpYTJsa0lqb2lkSEpoWkdWZmEyVjVYM1l4SWl3aWIyMXVaVzFoYm1GblpYSnBaQ0k2TUN3aWFYTnpJam9pYkc5bmFXNWZjMlZ5ZG1salpTSXNJbk4xWWlJNklrRkJRVUl4TURReU9ERWlMQ0psZUhBaU9qRTNNek0wT1RJM01ESXNJbTVpWmlJNk1UY3pNek14T1RjeU1pd2lhV0YwSWpveE56TXpNekU1TnpJeUxDSnFkR2tpT2lJeU5HWTROV000TlMwNU1tUTRMVFJpTm1ZdFlXUmpNUzFqTmpaak9EbG1ObVkzTVdVaUxDSlViMnRsYmlJNklpSjkuVVJBRXBUSzBSVm9QbzgtLTBJNHczWDhMQ29rUVlnZ3ByMW5RTmdFRFNfQ3hvN3JFN3pWbDdMTTNUcUdKZWgtMHBkenVNNjI1eGNHTWNKdEZRMzl4Z3lyemVQa0ZoZTJLVk5tQlAyZkp0SkdNTnA4cDJwTjhnWTBBalFJU1hZRGppaHVrQmRCa19iaGhTbC0xZGxLclpuckFETjFWWWItYUhxVWFIanJBeElrIiwiaWF0IjoxNzMzMzE5OTAyfQ.qVGoQbAguXqYAm0ZyKsV43X-ltFC2RiIdm4DLcANyNNm-psAwCkQZExFDwfs4UQxebBLkzzoK5yal2Q2wSOZEw",
});



let result = [];
let posGoalPoints = 100
let negGoalPoints = -200
let points = 0
let totalTrades = 0;
let tradesWithProfit = 0
let tradesWithLoss = 0
let grandTotal = 0;
let profitPoints = 0
let lossPoints = 0
let waitPoints = 10
async function getData(startDateTime, endDateTime) {
  
 let orderedAtPrice = 0
 let orderedAtCandle = 0
 let tradeComplete = false
  try {
    const data = await smart_api.getCandleData({
      exchange: 'NSE',
      symboltoken: '99926000',
      interval: 'THIRTY_MINUTE',
      fromdate: `${startDateTime} 09:15`,
      todate: `${startDateTime} 09:45`
    });
   

    if(data?.success == false){
      console.log("error", data)
      return
    }
    
    if(data?.data?.length > 0){
      let res = data.data
      // let thirtyMinLow = res[0][3] - waitPoints;
      // let thirtyMinHigh = res[0][2] + waitPoints;
      let thirtyMinLow = res[0][3] ;
      let thirtyMinHigh = res[0][2] ;

      const innerData = await smart_api.getCandleData({
        exchange: 'NSE',
        symboltoken: '99926000',
        interval: 'ONE_MINUTE',
        fromdate: `${startDateTime} 09:45`,
        todate: `${startDateTime} 15:30`
      });

      // console.log('innerData',innerData.data)
      if(innerData?.success == false){
        console.log("error", data)
        return
      }
      console.log("======================================================")
      console.log("30 min Hight", thirtyMinHigh);
      console.log("30 min low", thirtyMinLow);
      if(innerData?.data?.length > 0){
        let oneMinCandles = innerData.data
        for(let i = 1; i < oneMinCandles.length; i++){
            if (oneMinCandles[i][1] < Math.min(thirtyMinLow, thirtyMinHigh) || oneMinCandles[i][1] > Math.max(thirtyMinLow, thirtyMinHigh)) {
              orderedAtPrice = oneMinCandles[i][1]
              orderedAtCandle = i
              totalTrades ++
              if(orderedAtPrice > thirtyMinHigh){
                console.log("breaking 30 min high, buy Future", oneMinCandles[i][0], oneMinCandles[i][1])
              }else{
                console.log("breaking 30 min low, sell Future", oneMinCandles[i][0], oneMinCandles[i][1])
              }
              break
            }
        }
        if(orderedAtCandle !== 0){
          if(orderedAtPrice > thirtyMinHigh){
            for(let i = orderedAtCandle+1; i < oneMinCandles.length; i++){
              const priceDiff = oneMinCandles[i][1] - orderedAtPrice
              if(priceDiff >= posGoalPoints){
                console.log(`sucsess trade profit of ${priceDiff} points at : `, oneMinCandles[i][0], orderedAtPrice, oneMinCandles[i][1])
                // points = priceDiff
                tradesWithProfit++
                tradeComplete = true
                profitPoints += priceDiff
                break
              // }else if(priceDiff <= negGoalPoints){
              }else if( oneMinCandles[i][1] <= thirtyMinLow){
                console.log(`Failure trade loss of ${priceDiff} points at : `, oneMinCandles[i][0], orderedAtPrice, oneMinCandles[i][1])
                // points = priceDiff
                tradesWithLoss++
                lossPoints += priceDiff
                tradeComplete = true
                break
              }else{
                points = oneMinCandles[i][1] - orderedAtPrice;
              }
            }
          }else if(thirtyMinLow > orderedAtPrice){
            for(let i = orderedAtCandle+1; i < oneMinCandles.length; i++){
              const priceDiff = orderedAtPrice - oneMinCandles[i][1] ;
              if(priceDiff >= posGoalPoints){
                console.log(`sucsess trade profit of ${priceDiff} points at : `, oneMinCandles[i][0], orderedAtPrice, oneMinCandles[i][1])
                // points = priceDiff
                tradesWithProfit++
                tradeComplete = true
                profitPoints += priceDiff
                break
              // }else if(priceDiff <= negGoalPoints){
              }else if(oneMinCandles[i][1] >= thirtyMinHigh){
                console.log(`Failure trade loss of ${priceDiff} points at : `, oneMinCandles[i][0], orderedAtPrice, oneMinCandles[i][1])
                // points = priceDiff
                tradesWithLoss++
                lossPoints += priceDiff
                tradeComplete = true
                break
              }else{
                points = orderedAtPrice - oneMinCandles[i][1]
              }
            }
          }else{
            console.log("CONFUSSION !!!!!!")
          }
           !tradeComplete && console.log("points =====",points)
        }else{
          console.log(" no Trade for ",oneMinCandles[0][0])
        }
        console.log("======================================================")

      }
    }
    
  } catch (error) {
   console.log( "Error fetching candle data", error)
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
const dayone = "2023-01-01";
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
      await getData(startDate, startDate);

      // Increment the counter
      i++;
    // }

    // Move to the next day
    firstDay.add(1, "days");
    await delay(700);
  // }

  console.log("total Trades=",totalTrades)
  console.log("trades With Profit=",tradesWithProfit)
  console.log("trades With Loss=",tradesWithLoss)
  console.log("trades With No Loss No Profit=",totalTrades - tradesWithProfit - tradesWithLoss)
  console.log("profit Points",profitPoints)
  console.log("loss Points",lossPoints)
  // console.log("Points with day close",points)
  console.log("grandTotal",(profitPoints + lossPoints) )

  const qty = 250;
  const brockrage = 45;
  // console.log(`Result for ${firstDay.format(
  //   "YYYY-MM-DD"
  // )}`, result);
  const totalPointsGained = result.reduce((sum, item) => sum + item.total, 0);
  const totaltradesDone = result.reduce((sum, item) => sum + item.totalTrades, 0);
  // console.log( `total points gained = ${totalPointsGained}`, `by doing ${totaltradesDone*2} trades` );
  // console.log( `lot size =  ${qty} , total profie/loss using  = ${totalPointsGained*qty.toFixed(2)} Rs by using Rs ${totaltradesDone*2*brockrage} brockrage` );
}

main();
