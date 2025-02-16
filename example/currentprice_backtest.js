let {
  SmartAPI,
  WebSocketClient,
  WebSocketV2,
  WSOrderUpdates,
} = require("../lib");
const { api_key, access_token, refresh_token, feed_token,client_code } = require("../config/env")

var moment = require("moment"); // require

let smart_api = new SmartAPI({
  api_key, 
  access_token,
  refresh_token
});

let result = [];

async function getOrders(startDateTime){
  try{
   
    console.log("=========",startDateTime,"===========")
    const data = await smart_api.getCandleData({
      exchange: 'NSE',
      symboltoken: '99926000',
      interval: 'ONE_MINUTE',
      fromdate: `${startDateTime} 09:15`,
      todate: `${startDateTime} 15:30`
    });

    // console.log('data',data)
    if(data.data.length > 0){
      let res = data.data
      console.log('res',res)
      
    }
    
  }catch(e){
    console.log('err',e)
  }
}

getOrders("2024-12-04")

function identifyBullishThreeLineStrike(candles) {
  if (candles.length !== 4) {
    console.log("Provide exactly 4 candles.");
    return;
  }

  const [c1, c2, c3, c4] = candles;

  // Helper function to determine bearish and bullish candles
  const isBearish = (candle) => candle.close < candle.open;
  const isBullish = (candle) => candle.close > candle.open;

  // Check the first three candles are bullish and in an uptrend
  const firstThreeBullish =
    isBullish(c1) &&
    isBullish(c2) &&
    isBullish(c3) &&
    c2.close > c1.close &&
    c3.close > c2.close;

  // Check the fourth candle is bearish and engulfs the range of the first three candles
  const fourthBearishEngulfing =
    isBearish(c4) &&
    c4.open > c3.close &&
    c4.close < c1.open;

  if (firstThreeBullish && fourthBearishEngulfing) {
    const stopLoss = Math.min(c1.low, c2.low, c3.low, c4.low);
    const target = c4.close + 2 * (Math.max(c1.high, c2.high, c3.high, c4.high) - stopLoss);
    console.log(`+++++++++++++Bullish Three Line Strike pattern identified. Buy at ${c4.time}`);
    console.log(`Stop Loss: ${stopLoss}, Target Price: ${target}`);
  }
}

function identifyBearishThreeLineStrike(candles) {
  if (candles.length !== 4) {
    console.log("Provide exactly 4 candles.");
    return;
  }

  const [c1, c2, c3, c4] = candles;

  // Helper function to determine bearish and bullish candles
  const isBearish = (candle) => candle.close < candle.open;
  const isBullish = (candle) => candle.close > candle.open;

  // Check the first three candles are bearish and in a downtrend
  const firstThreeBearish =
    isBearish(c1) &&
    isBearish(c2) &&
    isBearish(c3) &&
    c2.close < c1.close &&
    c3.close < c2.close;

  // Check the fourth candle is bullish and engulfs the range of the first three candles
  const fourthBullishEngulfing =
    isBullish(c4) &&
    c4.open < c3.close &&
    c4.close > c1.open;

  if (firstThreeBearish && fourthBullishEngulfing) {
    const stopLoss = Math.max(c1.high, c2.high, c3.high, c4.high);
    const target = c4.close - 2 * (stopLoss - Math.min(c1.low, c2.low, c3.low, c4.low));
    console.log(`--------Bearish Three Line Strike pattern identified. Sell at ${c4.time}`);
    console.log(`Stop Loss: ${stopLoss}, Target Price: ${target}`);
  }
}



async function getData(startDateTime, endDateTime, currentTimeStamp) {
  // console.log(startDateTime, endDateTime, currentTimeStamp)
  let totalTradesPerDay = 0;
  let totalCallPoints = 0
  let totalPutPoints = 0
  try {
    // return
    const data = await smart_api.getCandleData({
      exchange: "NSE",
      symboltoken: "99926000",
      interval: "ONE_MINUTE",
      fromdate: startDateTime,
      todate: endDateTime,
    });

    // console.log('data',data)
    if(data.data.length > 0){
      
      let res = data.data
      const stockData = res.map(([time, open, high, low, close, volume]) => ({
        time: moment(time).format("HH:mm"), // Convert timestamp to a Date object
        open,
        high,
        low,
        close,
        volume,
      }));
      // console.log('data.data',stockData)  
      identifyBearishThreeLineStrike(stockData);
      identifyBullishThreeLineStrike(stockData);
    }
  } catch (error) {
   console.log('error',error)
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const dayone = "2024-12-11";
const scheduleDataFetch = async () => {
  const startTime = "08:20";
  const endTime = "15:20";

  // Parse start and end times into moment objects with today's date
  const today = moment().format("YYYY-MM-DD");
  const startMoment = moment(`${today} ${startTime}`, "YYYY-MM-DD HH:mm");
  const endMoment = moment(`${today} ${endTime}`, "YYYY-MM-DD HH:mm");

  console.log(`Scheduler start time: ${startMoment.format()}, end time: ${endMoment.format()}`);

  let mainCounter = 0
  const fetchAtScheduledTime = async () => {
    const now = moment();

    if (now.isAfter(endMoment)) {
      console.log("End time reached, stopping scheduler.");
      return;
    }

    if (now.isSameOrAfter(startMoment) && now.isBefore(endMoment)) {
      const currentTimeStamp = now.format("YYYY-MM-DDTHH:mm:ssZ");
      
      mainCounter++
      // Uncomment the following line to fetch data
      let start = moment(dayone).clone().hour(now.hour()).minute(now.minute()-4).format("YYYY-MM-DD HH:mm");
      let end = moment(dayone).clone().hour(now.hour()).minute(now.minute()-1).format("YYYY-MM-DD HH:mm");
      console.log(`Fetching data at >>>>>>>>: ${start} to ${end}`);
      await getData(start, end, currentTimeStamp);
    }

    // Schedule the next execution for the next multiple of 5 minutes
    // const nextScheduledTime = now.clone().add(5 - (now.minute() % 5), 'minutes').startOf('minute');
    const nextScheduledTime = now.clone().add(1, 'minutes').startOf('minute');
    const delay = nextScheduledTime.diff(now);

    // console.log(`Next execution scheduled for: ${nextScheduledTime.format()}`);
    setTimeout(fetchAtScheduledTime, delay);
  };

  // Align to the first execution time
  const now = moment();
  console.log(startMoment.isAfter(now))
  const initialDelay = startMoment.isAfter(now) ? startMoment.diff(now) : 0;
  
  setTimeout(fetchAtScheduledTime, initialDelay);
};

// scheduleDataFetch();

async function checkAllSettings(){
  let start = moment(dayone).clone().hour(9).minute(15).format("YYYY-MM-DD HH:mm");
  let end = moment(dayone).clone().hour(15).minute(30).format("YYYY-MM-DD HH:mm");
  let currentTimeStamp = "2024-11-26T09:25:00+05:30"
  await getData(start, end, currentTimeStamp);

}
// checkAllSettings()





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
