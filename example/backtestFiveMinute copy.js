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
  "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IkFBQUIxMDQyODEiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwidG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMWMyVnlYM1I1Y0dVaU9pSmpiR2xsYm5RaUxDSjBiMnRsYmw5MGVYQmxJam9pZEhKaFpHVmZZV05qWlhOelgzUnZhMlZ1SWl3aVoyMWZhV1FpT2pnc0luTnZkWEpqWlNJNklqTWlMQ0prWlhacFkyVmZhV1FpT2lKbE1UTmtOVGswTkMwek56ZzBMVFEwTjJFdFltSTFOeTAzTnpsak1qSmhNV1F4T1dJaUxDSnJhV1FpT2lKMGNtRmtaVjlyWlhsZmRqRWlMQ0p2Ylc1bGJXRnVZV2RsY21sa0lqbzRMQ0p3Y205a2RXTjBjeUk2ZXlKa1pXMWhkQ0k2ZXlKemRHRjBkWE1pT2lKaFkzUnBkbVVpZlgwc0ltbHpjeUk2SW5SeVlXUmxYMnh2WjJsdVgzTmxjblpwWTJVaUxDSnpkV0lpT2lKQlFVRkNNVEEwTWpneElpd2laWGh3SWpveE56TXpNakl5TVRjMUxDSnVZbVlpT2pFM016TXhNelUxT1RVc0ltbGhkQ0k2TVRjek16RXpOVFU1TlN3aWFuUnBJam9pWW1aak5EaGtZelV0WWpFNU1DMDBZbVl6TFdGaVpEY3ROREl5TlRaaE1XVXdOVFkySWl3aVZHOXJaVzRpT2lJaWZRLkNwMVJnM3VVa3lYUEZWdTdnaUpmQXJPclNyc1J6ZHE5bnpTZW11MVkyNURUVGw0VHI2LTVEMDNIQzV3LXZUQ3JYTjVzUkRWT2NoaGdsdEg0NUhoLXdOWFNJc3hYRzBCUFo2YWNxS1JaSUd0bGRQcTkzUE9DS0VRaHExS1pLSU9UeTZsSWFTLVZORnBfN1FTRWp6Ul93NUpjcG5lNWRvRHI3YkR6MDB1MVJGUSIsIkFQSS1LRVkiOiJkaURIZEFoYSIsImlhdCI6MTczMzEzNTc3NSwiZXhwIjoxNzMzMjIyMTc1fQ.mL-dkBOV2LPMGdowY3eQIknhK7ACTgm3Kgvl_mojSJvjTA01XI_PGWjukIMobfiHx50QyLUOPtQkZJ7AYeIN_Q",
refresh_token:
  "eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbiI6IlJFRlJFU0gtVE9LRU4iLCJSRUZSRVNILVRPS0VOIjoiZXlKaGJHY2lPaUpTVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5WDNSNWNHVWlPaUpqYkdsbGJuUWlMQ0owYjJ0bGJsOTBlWEJsSWpvaWRISmhaR1ZmY21WbWNtVnphRjkwYjJ0bGJpSXNJbWR0WDJsa0lqb3dMQ0p6YjNWeVkyVWlPaUl6SWl3aVpHVjJhV05sWDJsa0lqb2laVEV6WkRVNU5EUXRNemM0TkMwME5EZGhMV0ppTlRjdE56YzVZekl5WVRGa01UbGlJaXdpYTJsa0lqb2lkSEpoWkdWZmEyVjVYM1l4SWl3aWIyMXVaVzFoYm1GblpYSnBaQ0k2TUN3aWFYTnpJam9pYkc5bmFXNWZjMlZ5ZG1salpTSXNJbk4xWWlJNklrRkJRVUl4TURReU9ERWlMQ0psZUhBaU9qRTNNek16TURnMU56VXNJbTVpWmlJNk1UY3pNekV6TlRVNU5Td2lhV0YwSWpveE56TXpNVE0xTlRrMUxDSnFkR2tpT2lJMU9HUXhaV1kyWkMweE1XUTVMVFF4TURFdE9HWmpNeTA0WXpBeVpEQTJZemc1TXpRaUxDSlViMnRsYmlJNklpSjkuRTl2Vkh0aFVwLWpRN3p4czE2aHdaaWlkbENmaWdDVG5tbktWc1JYQmNhc1ZqTnRqbi01VWk1ZnVaSWVycmRBY19Cb2xuTDQ0OUhIcnJxLUc5WWt6WHlfUEFIeXdMVFhMZjRHX1hoa05fSUM0bk8wUG9GVFpzQUJFa3hVUl8tZHROSDIybDVfdUV3WExXUUhRNTJUVWZubDBsX0FHU1VIRnYzSjhZclM0TXVzIiwiaWF0IjoxNzMzMTM1Nzc1fQ.Tsn0xrPMIShWd7yj61uXw1fVutUSoiWaS5OykjIQg438LQA4hcfuyqJxZQMeH7DIsCswuuvQrrjwKSe5UtTZ1A",
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
