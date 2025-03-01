const { MONGO_URI, WS_URL, API_KEY, CLIENT_CODE, INTERVAL_MS, TIMEZONE, LOGIN_PIN } = require("../config");

const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');



const { calculateData, healthCheck, loginUser, searchScrip, orderToAngel, getOrderBook, getTredeBook, getHolding } = require("./api_file");
const validateHeaders = require("./middleware/validateHeaders");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


const PORT = 3001;
const wsUrl = WS_URL;

let clients = new Set();
let socketInstance = null;
let heartbeatInterval = null;
let api_key = API_KEY;
let client_code = CLIENT_CODE;
let access_token = null;
let feed_token = null;
let refresh_token = null;
let login_pin = LOGIN_PIN


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Connected to MongoDB')
  let response = await updateSession()
  if(response && response.length == 1){
    access_token = response[0]['jwtToken']
    feed_token = response[0]['feedToken']
    refresh_token = response[0]['refreshToken']
  }
})
.catch(err => console.error('MongoDB connection error:', err));;

const orderSchema = new mongoose.Schema({
  type: String,
  date: String,
  instrument:String,
  price: Number,
  superTrendValue: Number,
  qty: Number,
  orderStatus: String,
  description: String
});

const Orders = mongoose.model('Orders', orderSchema);


const settingsSchema = new mongoose.Schema({
  recordId: Number,
  isLiveOrdresAllowed: Boolean,
  jwtToken: String,
  refreshToken: String,
  feedToken: String
});

const Settings = mongoose.model('Settings', settingsSchema);


// Start WebSocket connection
const startWebSocket = () => {
  if (socketInstance) return socketInstance;

  socketInstance = new WebSocket(wsUrl, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'x-api-key': api_key,
      'x-client-code': client_code,
      'x-feed-token': feed_token,
    }
  });

  socketInstance.on('open', () => {
    console.log('✅ Connected to SmartAPI WebSocket');

    const subscriptionMessage = {
      correlationID: "abcde12345",
      action: 1,
      params: {
        mode: 1,
        tokenList: [{ exchangeType: 1, tokens: ["99926000"] }]
      }
    };

    socketInstance.send(JSON.stringify(subscriptionMessage));

    heartbeatInterval = setInterval(() => {
      if (socketInstance?.readyState === WebSocket.OPEN) {
        socketInstance.send('ping');
      }
    }, 30000);
  });

  socketInstance.on('message', (message) => {
    if (message === 'pong') return;

    const data = new Uint8Array(message);
    const ltpBytes = data.slice(43, 47);
    const ltpValue = ltpBytes.reduce((value, byte, index) => value + byte * Math.pow(256, index), 0);
    const ltp = ltpValue / 100;

    if (ltp === 0) return;
    
    // console.log('📊 Received LTP:', ltp);

    // Broadcast LTP to all connected clients
    clients.forEach((res) => {
      res.write(`data: ${JSON.stringify({ ltp })}\n\n`);
    });
  });

  socketInstance.on('error', (err) => console.error('❌ WebSocket error:', err));
  socketInstance.on('close', () => {
    console.log('WebSocket closed');

    // Clear heartbeat interval to prevent errors
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    socketInstance = null; // Reset instance
  });

  return socketInstance;
};

app.get("/logout", async (req,res) => {
  const mainSetting = await Settings.find({ recordId: 1 });
  if(mainSetting?.length > 0){
    await Settings.findByIdAndUpdate(
      mainSetting[0]._id.toString(),
      { jwtToken: "", refreshToken: "", feedToken: "" },
      { new: true }
    );
    access_token = ""
    feed_token = ""
    refresh_token = ""
    res.json({ success: true, message: "Logout successful" })
  }
}) 

app.post("/login", async (req, res) => {
  const { totp } = req.body;
  try {
    const response = await loginUser(api_key,client_code, login_pin, totp);
    if(response.status){
    const mainSetting = await Settings.find({ recordId: 1 });
    if(mainSetting?.length > 0){
      await Settings.findByIdAndUpdate(
        mainSetting[0]._id.toString(),
        { jwtToken: response.data.jwtToken, refreshToken: response.data.refreshToken, feedToken: response.data.feedToken },
        { new: true }
      );
      access_token = response.data.jwtToken
      feed_token = response.data.feedToken
      refresh_token = response.data.feedToken
      res.json({ success: true, message: "Login successful", data: response.data })
    }
    }else{
      res.json({ success: false, message: response.message || "Login failed", errorCode: response.errorcode || "UNKNOWN_ERROR" })
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/healthCheck", async (req, res) => {
  try {
    const data = await healthCheck(api_key, client_code, access_token,feed_token,refresh_token);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch health data" });
  }
});

app.get("/getCandleData", async (req, res) => {
  try {
    const {symboltoken, exchange} = req.query
    const data = await calculateData(api_key, client_code, access_token,feed_token,refresh_token, symboltoken, exchange);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch candle data" });
  }
});

// Server-Sent Events (SSE) for real-time stock price updates
app.get('/stock-price', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.add(res);

  if (!socketInstance) {
    console.log("Starting WebSocket as first client connected...");
    socketInstance = startWebSocket();
  }

  req.on('close', () => {
    clients.delete(res);

    // If no clients are connected, close the WebSocket connection
    if (clients.size === 0 && socketInstance) {
      console.log("No clients connected. Closing WebSocket...");
      socketInstance.close();
      socketInstance = null;
    }
  });
});

app.get("/getAllOrders", async (req, res) => {
  try {
    const allOrders = await Orders.find(); // Retrieve all users
    res.json(allOrders);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/placeOrder', async (req, res) => {
  try {

    let newOrder = null;
    const { type, date, price,superTrendValue, qty, orderStatus,description   } = req.body;
    const openOrders = await Orders.find({ orderStatus: "open" });
    if(openOrders?.length > 0){
      await Orders.findByIdAndUpdate(
        openOrders[0]._id.toString(),
        { orderStatus: "complete" },
        { new: true }
      );
      newOrder = new Orders({ type, date, price,superTrendValue, qty, orderStatus:'complete',description });
    }else{
      newOrder = new Orders({ type, date, price,superTrendValue, qty, orderStatus, description });
    }
    await newOrder.save();
    res.status(201).send('Data successfully stored');
  } catch (error) {
    res.status(500).send('Error storing data');
  }
});

app.post('/orderToAngel', async (req, res) => {
  try {
   let order =  await orderToAngel(api_key, client_code, access_token,feed_token,refresh_token);
    res.json(order);
    console.log(order)
  } catch (error) {
    res.status(500).send('Error storing data');
  }
});

app.get('/getOrderBook', async (req, res) => {
  try {
    const data = await getOrderBook(api_key, client_code, access_token,feed_token,refresh_token);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error storing data');
  }
});

app.get('/getTredBook', async (req, res) => {
  try {
    const data = await getTredeBook(api_key, client_code, access_token,feed_token,refresh_token);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error storing data');
  }
});

app.get('/getHolding', async (req, res) => {
  try {
    const data = await getHolding(api_key, client_code, access_token,feed_token,refresh_token);
    res.json(data);
  } catch (error) {
    res.status(500).send('Error storing data');
  }
});

app.post("/searchScrip", async (req, res) => {
  try {
   
    const {symboltoken} = req.body
    const data = await searchScrip(api_key, client_code, access_token,feed_token,refresh_token,symboltoken);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch health data" });
  }
});

async function updateSession(){
  try{
    const allSettings = await Settings.find();
    return allSettings;
  }catch(e){
    console.log('error getting the site settings', e)
  }
}
// Start Express Server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
