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
    "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IkFBQUIxMDQyODEiLCJyb2xlcyI6MCwidXNlcnR5cGUiOiJVU0VSIiwidG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMWMyVnlYM1I1Y0dVaU9pSmpiR2xsYm5RaUxDSjBiMnRsYmw5MGVYQmxJam9pZEhKaFpHVmZZV05qWlhOelgzUnZhMlZ1SWl3aVoyMWZhV1FpT2pnc0luTnZkWEpqWlNJNklqTWlMQ0prWlhacFkyVmZhV1FpT2lJelpERTBPREV6WmkxaU9UQXpMVFJrWkRJdE9EUTNOeTB4T1Rjek5EQXlaamcyTXpVaUxDSnJhV1FpT2lKMGNtRmtaVjlyWlhsZmRqRWlMQ0p2Ylc1bGJXRnVZV2RsY21sa0lqbzRMQ0p3Y205a2RXTjBjeUk2ZXlKa1pXMWhkQ0k2ZXlKemRHRjBkWE1pT2lKaFkzUnBkbVVpZlgwc0ltbHpjeUk2SW5SeVlXUmxYMnh2WjJsdVgzTmxjblpwWTJVaUxDSnpkV0lpT2lKQlFVRkNNVEEwTWpneElpd2laWGh3SWpveE56TXlOVFl3T1RBMExDSnVZbVlpT2pFM016STBOelF6TWpRc0ltbGhkQ0k2TVRjek1qUTNORE15TkN3aWFuUnBJam9pTkRNMFpqZGpOamN0WmpFMVl5MDBaV0l5TFRobFpqZ3ROMlJrWXpjNVlqRTVNR1prSWl3aVZHOXJaVzRpT2lJaWZRLkdNNGhtMEpEN3lQcEJfMGExeVBvLWRsd2gweEcyNWVoTUdjTllVWHRVUXg1cXVIakZablhWY3o0SWtQV3FvZ2RhSU1RYnlRaG9VSUUyRWRral9WNXFNRFc5bHJSSnRvaS1zRzkwWGRkZmd4X2M3eXYxY1JrNzZXRzNjMW9PanVzeWhqaFB2N09VRDlRLVljZnQwZGtFNjhoSWVQeC00LWo3U3pwUzJRYTVVYyIsIkFQSS1LRVkiOiJkaURIZEFoYSIsImlhdCI6MTczMjQ3NDUwNCwiZXhwIjoxNzMyNTYwOTA0fQ.vHYYa4pZNUHDJjry3f5K6ZxrDk39B-qCvuUNeLAmLIuVEKybgNvWZugPaBDC_C3my-_ImI7ElLiZT2LlVhqVWg",
  refresh_token:
    "eyJhbGciOiJIUzUxMiJ9.eyJ0b2tlbiI6IlJFRlJFU0gtVE9LRU4iLCJSRUZSRVNILVRPS0VOIjoiZXlKaGJHY2lPaUpTVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SjFjMlZ5WDNSNWNHVWlPaUpqYkdsbGJuUWlMQ0owYjJ0bGJsOTBlWEJsSWpvaWRISmhaR1ZmY21WbWNtVnphRjkwYjJ0bGJpSXNJbWR0WDJsa0lqb3dMQ0p6YjNWeVkyVWlPaUl6SWl3aVpHVjJhV05sWDJsa0lqb2lNMlF4TkRneE0yWXRZamt3TXkwMFpHUXlMVGcwTnpjdE1UazNNelF3TW1ZNE5qTTFJaXdpYTJsa0lqb2lkSEpoWkdWZmEyVjVYM1l4SWl3aWIyMXVaVzFoYm1GblpYSnBaQ0k2TUN3aWFYTnpJam9pYkc5bmFXNWZjMlZ5ZG1salpTSXNJbk4xWWlJNklrRkJRVUl4TURReU9ERWlMQ0psZUhBaU9qRTNNekkyTkRjek1EUXNJbTVpWmlJNk1UY3pNalEzTkRNeU5Dd2lhV0YwSWpveE56TXlORGMwTXpJMExDSnFkR2tpT2lKbVpHUmlPRGt4WWkwMVpUYzJMVFF3TUdVdE9EQmxNaTA0TldOaFlUWXhaVFF4T1dZaUxDSlViMnRsYmlJNklpSjkuRVlVd3VKOFR3RzNCbDhrQnlTYThMMVdoNHlXTkRaanlHWTcyZHRIeTcwQkNEcTFLRHJCZXYtOGhna1NDWDdKX3VMRXV0Q2dXVkM5bF9MVzVQVWt4UFBuOHIyQWZsMDdpUFJiaVRDcEdQakpLbjhLMk9rY3dOeHVUZ2E4Q29WMTdIRlAycHA0aVlQeWhTNnZja09Edk43bXNlbVlvdW5tWXVQeEJHak9OWFdBIiwiaWF0IjoxNzMyNDc0NTA0fQ.6vROgsSkvbwAK8lml0k_84ZBLKZLvWveIe0PaHprBQHrW4XdNbcx7IljSRI4soa2eITFkR_pmnW-8rLWSJ3NZg",
});

let result = [];

async function getData(startDateTime, endDateTime) {
  try {
    const data = await smart_api.getCandleData({
      exchange: "NSE",
      symboltoken: "99926000",
      interval: "FIVE_MINUTE",
      fromdate: startDateTime,
      todate: endDateTime,
    });

    if (data.data && data.data[0] && data.data[0].length > 0) {
      let res = data.data;
      let candle_9_15 = res[0];
      let candle_9_20 = res[1];
      let candle_9_25 = res[2];
      let candle_9_30 = res[3];
      let candle_9_35 = res[4];
      let candle_9_40 = res[5];

      if (
        candle_9_20[4] > candle_9_15[4] &&
        candle_9_20[4] > candle_9_15[1] &&
        candle_9_20[4] - candle_9_15[4] > 27
      ) {
        // second candle close is higher then first candle close and first candle open
        if (
          candle_9_25[4] > candle_9_20[4] &&
          candle_9_25[4] > candle_9_20[1]
        ) {
          // Market moving upward
          result.push({
            date: startDateTime,
            "First candle close": candle_9_15[4],
            "Second candle close": candle_9_20[4],
            "Third candle close": candle_9_25[4],
            "Market moving upward": true,
            "Points gained till 9:40": candle_9_40[4] - candle_9_30[1],
          });
        } else {
          result.push({
            date: startDateTime,
            day: moment(startDateTime, "YYYY-MM-DD HH:mm").format("dddd"),
            "Side ways market": true,
            "Points gained till 9:40": 0,
          });
        }
      } else if (
        candle_9_20[4] < candle_9_15[4] &&
        candle_9_20[4] < candle_9_15[1] &&
        candle_9_15[4] - candle_9_20[4] > 27
      ) {
        // second candle close is lower then first candle close and first candle open
        if (
          candle_9_25[4] < candle_9_20[4] &&
          candle_9_25[4] < candle_9_20[1]
        ) {
          // Market moving downward
          result.push({
            date: startDateTime,
            "First candle close": candle_9_15[4],
            "Second candle close": candle_9_20[4],
            "Third candle close": candle_9_25[4],
            "Market moving downwards": false,
            "Points gained till 9:40": candle_9_30[1] - candle_9_40[4],
          });
        } else {
          result.push({
            date: startDateTime,
            day: moment(startDateTime, "YYYY-MM-DD HH:mm").format("dddd"),
            "Side ways market": true,
            "Points gained till 9:40": 0,
          });
        }
      } else {
        result.push({
          date: startDateTime,
          day: moment(startDateTime, "YYYY-MM-DD HH:mm").format("dddd"),
          "Side ways market": true,
          "Points gained till 9:40": 0,
        });
      }
    } else {
      result.push({
        date: startDateTime,
        day: moment(startDateTime, "YYYY-MM-DD HH:mm").format("dddd"),
        "No data found": data,
        "Points gained till 9:40": 0,
      });
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

const dayone = "2024-11-17";
async function main() {
  let firstDay = moment(dayone); // Initialize as a moment object
  let i = 0;

  // while (i < 21) {
    // if (
    //   firstDay.format("dddd") !== "Saturday" &&
    //   firstDay.format("dddd") !== "Sunday"
    // ) {
      let start = firstDay
        .clone()
        .hour(9)
        .minute(15)
        .format("YYYY-MM-DD HH:mm");
      let end = firstDay.clone().hour(9).minute(45).format("YYYY-MM-DD HH:mm");
console.log(start,end)
      await getData(start, end);

      // Increment the counter
      i++;
    // }

    // Move to the next day
    firstDay.add(1, "days");
    // await delay(500);
  // }

  console.log("Result:", result);
  const totalPointsGained = result.reduce((sum, item) => {
    const points = item["Points gained till 9:40"];
    return sum + (typeof points === "number" ? points : 0);
  }, 0);
  console.log(
    `total points gained between ${dayone} and ${firstDay.format(
      "YYYY-MM-DD"
    )} = `,
    totalPointsGained
  );
}

// main();

// smart_api.getCandleData({
// 	"exchange": "NSE",
// 	"symboltoken": "99926000",
// 	"interval": "FIVE_MINUTE",
// 	"fromdate": "2024-11-18 09:15",
// 	"todate": "2024-11-19 09:45"
// }).then((data)=>{
// 	if(data.data && data.data[0] && data.data[0].length > 0){
// 		let res = data.data
// 		let candle_9_15 = res[0];
// 		let candle_9_20 = res[1];
// 		let candle_9_25 = res[2];
// 		let candle_9_30 = res[3];
// 		let candle_9_35 = res[4];
// 		let candle_9_40 = res[5];
// 		console.log('First candle close:',candle_9_15[4]);
// 		console.log('second candle close:',candle_9_20[4]);
// 		console.log('Third candle close:',candle_9_25[4]);
// 		console.log('---------------------------')

// 		if(candle_9_20[4] > candle_9_15[4] && candle_9_25[4] > candle_9_20[4]){ // market moving upward
// 			// if(){
// 				console.log('market moving upward')
// 				console.log('points gained till 9:40', candle_9_40[4] - candle_9_30[1])
// 			// }

// 		}else if(candle_9_20[4] < candle_9_15[4] && candle_9_25[4] < candle_9_20[4]){
// 			// if(){
// 				console.log('market moving downward')
// 				console.log('points gained till 9:40', candle_9_30[1] - candle_9_40[4] )
// 			// }

// 		}else{ // market moving downward
// 			console.log('No Action needed!')

// 		}
// 	}
// 	else{
// 		console.log('error',data)
// 	}

// 	// console.log("Open",data?.data[0][1])
// 	// console.log("High",data?.data[0][2])
// 	// console.log("Low",data?.data[0][3])
// 	// console.log("Close",data?.data[0][4])
// })

// // If user does not have valid access token and refresh token then use generateSession method

// }
// smart_api
// 	.generateSession('CLIENT_CODE', 'PASSWORD', 'TOTP')
// 	.then((data) => {
// 		console.log(data);
// 		return smart_api.getProfile();

// 		// 	// User Methods
// 		// 	// return smart_api.logout()

// 		// 	// return smart_api.getRMS();

// 		// 	// Order Methods
// 		// 	// return smart_api.placeOrder({
// 		// 	//     "variety": "NORMAL",
// 		// 	//     "tradingsymbol": "SBIN-EQ",
// 		// 	//     "symboltoken": "3045",
// 		// 	//     "transactiontype": "BUY",
// 		// 	//     "exchange": "NSE",
// 		// 	//     "ordertype": "LIMIT",
// 		// 	//     "producttype": "INTRADAY",
// 		// 	//     "duration": "DAY",
// 		// 	//     "price": "19500",
// 		// 	//     "squareoff": "0",
// 		// 	//     "stoploss": "0",
// 		// 	//     "quantity": "1"
// 		// 	// })

// 		// 	// return smart_api.modifyOrder({
// 		// 	//     "orderid": "201130000006424",
// 		// 	//     "variety": "NORMAL",
// 		// 	//     "tradingsymbol": "SBIN-EQ",
// 		// 	//     "symboltoken": "3045",
// 		// 	//     "transactiontype": "BUY",
// 		// 	//     "exchange": "NSE",
// 		// 	//     "ordertype": "LIMIT",
// 		// 	//     "producttype": "INTRADAY",
// 		// 	//     "duration": "DAY",
// 		// 	//     "price": "19500",
// 		// 	//     "squareoff": "0",
// 		// 	//     "stoploss": "0",
// 		// 	//     "quantity": "1"
// 		// 	// });

// 		// 	// return smart_api.cancelOrder({
// 		// 	//     "variety": "NORMAL",
// 		// 	//     "orderid": "201130000006424"
// 		// 	// });

// 		// 	// return smart_api.getOrderBook();

// smart_api.getOrderBook().then((data)=>{
// 	console.log(data);
// })

// 		// 	// return smart_api.getTradeBook();

// 		// 	// Portfolio Methods
// 		// 	// return smart_api.getHolding();

// 		// 	// return smart_api.getPosition();

// 		// 	// return smart_api.convertPosition({
// 		// 	//     "exchange": "NSE",
// 		// 	//     "oldproducttype": "DELIVERY",
// 		// 	//     "newproducttype": "MARGIN",
// 		// 	//     "tradingsymbol": "SBIN-EQ",
// 		// 	//     "transactiontype": "BUY",
// 		// 	//     "quantity": 1,
// 		// 	//     "type": "DAY"
// 		// 	// });

// 		// 	// GTT Methods
// 		// 	// return smart_api.createRule({
// 		// 	//    "tradingsymbol" : "SBIN-EQ",
// 		// 	//    "symboltoken" : "3045",
// 		// 	//    "exchange" : "NSE",
// 		// 	//    "producttype" : "MARGIN",
// 		// 	//    "transactiontype" : "BUY",
// 		// 	//    "price" : 100000,
// 		// 	//    "qty" : 10,
// 		// 	//    "disclosedqty": 10,
// 		// 	//    "triggerprice" : 200000,
// 		// 	//    "timeperiod" : 365
// 		// 	// })
// 		// 	// return smart_api.modifyRule({
// 		// 	//             "id" : 1000014,
// 		// 	//             "symboltoken" : "3045",
// 		// 	//             "exchange" : "NSE",
// 		// 	//             "qty" : 10

// 		// 	// })
// 		// 	// return smart_api.cancelRule({
// 		// 	//      "id" : 1000014,
// 		// 	//      "symboltoken" : "3045",
// 		// 	//      "exchange" : "NSE"
// 		// 	// })
// 		// 	// return smart_api.ruleDetails({
// 		// 	//     "id" : 25
// 		// 	// })
// 		// 	// return smart_api.ruleList({
// 		// 	//      "status" : ["NEW","CANCELLED"],
// 		// 	//      "page" : 1,
// 		// 	//      "count" : 10
// 		// 	// })

// 		// 	// Historical Methods

// Market Data Methods
// smart_api.marketData({
// 			"mode": "FULL",
// 			"exchangeTokens": {
// 				"NSE": [
// 					"3045"
// 				]
// 			}
// 		}).then((data) => {
// 			console.log(JSON.stringify(data, null, 2));
// 	        //  console.log(JSON.stringify(data))
// 		});

// search Scrip Methods
// smart_api.searchScrip({
// 			"exchange": "BSE",
// 			"searchscrip":"Titan"
// 		}).then((data)=>{
// 			console.log(data);
// 		})

// get all holding method
// smart_api.getAllHolding().then((data)=>{
// 	console.log(data);
// })

// get individual order details
// smart_api.indOrderDetails("GuiOrderID").then((data) => {
//   console.log(data);
// });

// // margin api Method
// smart_api
// .marginApi({
//   positions: [
//     {
//       exchange: "NFO",
//       qty: 1500,
//       price: 0,
//       productType: "CARRYFORWARD",
//       token: "154388",
//       tradeType: "SELL",
//     }
//   ],
// })
// .then((data) => {
//   console.log(data);
// });

//brokerage calculator
// return smart_api.estimateCharges({
// 	"orders": [
// 		{
// 			"product_type": "DELIVERY",
// 			"transaction_type": "BUY",
// 			"quantity": "10",
// 			"price": "800",
// 			"exchange": "NSE",
// 			"symbol_name": "745AS33",
// 			"token": "17117"
// 		}, {
// 			"product_type": "DELIVERY",
// 			"transaction_type": "BUY",
// 			"quantity": "10",
// 			"price": "800",
// 			"exchange": "BSE",
// 			"symbol_name": "PIICL151223",
// 			"token": "726131"
// 		}
// 	]
// }).then(data=>{
// 	console.log(data)
// });

//verifydis
// return smart_api.verifyDis({
// 	"isin":"INE528G01035",
// 	"quantity":"1"
// }).then(data => {
// 	console.log(data)
// });

// return smart_api.generateTPIN({
// 	"dpId":"33200",
// 	"ReqId":"2351614738654050",
// 	"boid":"1203320018563571",
// 	"pan":"JZTPS2255C"
// }).then(data => {
// 	console.log(data)
// });
//getTransactionStatus
// return smart_api.getTranStatus({
// 	"ReqId":"2351614738654050"
// }).then(data => {
// 	console.log(data)
// });

// return smart_api.optionGreek({
// 	"name":"TCS", // Here Name represents the Underlying stock
// 	"expirydate":"25JAN2024"
// }).then(data => {
// 	console.log(data)
// });

// return smart_api.gainersLosers({
// 	"datatype":"PercOIGainers", // Type of Data you want(PercOILosers/PercOIGainers/PercPriceGainers/PercPriceLosers)
// 	"expirytype":"NEAR" // Expiry Type (NEAR/NEXT/FAR)
// }).then(data => {
// 	console.log(data)
// });

// return smart_api.putCallRatio().then(data => {
// 	console.log(data)
// });

// return smart_api.oIBuildup({
// 	"expirytype":"NEAR",
// 	"datatype":"Long Built Up"
// }).then(data => {
// 	console.log(data)
// });

// })
// .then((data) => {
// 	console.log('PROFILE::', data);
// })
// .catch((ex) => {
// 	console.log('EX::', ex);
// });

// // // smart_api.generateToken("YOUR_REFRESH_TOKEN")
// // //     .then((data) => {
// // //         console.log(data)
// // //     });

// smart_api.setSessionExpiryHook(customSessionHook);

// function customSessionHook() {
//     // USER CAN GENERATE NEW JWT HERE
//     console.log("User loggedout");
// }

// ########################### Socket Sample Code Starts Here ###########################
// Old Websocket

// let web_socket = new WebSocket({
//     client_code: "CLIENT_CODE",
//     feed_token: "FEED_TOKEN"
// });

// web_socket.connect()
//     .then(() => {
//         web_socket.runScript("SCRIPT", "TASK") // SCRIPT: nse_cm|2885, mcx_fo|222900  TASK: mw|sfi|dp

//         setTimeout(function () {
//             web_socket.close()
//         }, 3000)
//     })

// web_socket.on('tick', receiveTick)

// function receiveTick(data) {
//     console.log("receiveTick:::::", data)
// }

// ########################### Socket Sample Code Ends Here ###########################

// ########################### Socket Sample Code Starts Here ###########################
// New websocket

// let web_socket = new WebSocketClient({
//     clientcode: "CLIENT_CODE",
//     jwttoken: 'JWT_TOKEN',
//     apikey: "API_KEY",
//     feedtype: "FEED_TYPE",
// });

// web_socket.connect()
//     .then(() => {
//         web_socket.fetchData("subscribe", "order_feed");  // ACTION_TYPE: subscribe | unsubscribe FEED_TYPE: order_feed

//         setTimeout(function () {
//             web_socket.close()
//         }, 60000)
//     });

// web_socket.on('tick', receiveTick);

// function receiveTick(data) {
//     console.log("receiveTick:::::", data);
// }

// ########################### Socket V2 Sample Code Start Here ###########################
// let web_socket = new WebSocketV2({
// 	jwttoken: 'JWT_TOKEN',
// 	apikey: 'API_KEY',
// 	clientcode: 'Client_code',
// 	feedtype: 'FEED_TYPE',
// });

// //For handling custom error
// web_socket.customError();

// // handle reconnection
// web_socket.reconnection(reconnectType, delayTime, multiplier);

// web_socket.connect().then(() => {
// 	let json_req = {
// 		correlationID: "abcde12345",
// 		action: 1,
// 		mode: 2,
// 		exchangeType: 1,
// 		tokens: ["1594"],
// 	};

// 	web_socket.fetchData(json_req);

// 	web_socket.on("tick", receiveTick);

// 	function receiveTick(data) {
// 		console.log("receiveTick:::::", data);
// 	}

// 	// setTimeout(() => {
// 	// 	web_socket.close();
// 	// }, 2000);

// }).catch((err) => {
// 	console.log('Custom error :', err.message);
// });
// ########################### Socket V2 Sample Code End Here ###########################

// ########################### Socket Client updates Sample Code Start Here ###########################
// let ws_clientupdate = new WSOrderUpdates({
//   jwttoken: 'JWT_TOKEN',
// 	 apikey: 'API_KEY',
// 	 clientcode: 'Client_code',
// 	 feedtype: 'FEED_TYPE',
// });

// ws_clientupdate.connect().then(() => {

// 	ws_clientupdate.on("tick", receiveTick);

// 	function receiveTick(data) {
// 		console.log("receiveTick:::::", data);
// 	}

// 	// setTimeout(() => {
// 	// 	ws_clientupdate.close();
// 	// }, 10000);

// })
// ########################### Socket Client updates Sample Code End Here ###########################
