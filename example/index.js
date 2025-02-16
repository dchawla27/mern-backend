const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');



const { calculateData, healthCheck, loginUser, searchScrip } = require("./api_file");
const validateHeaders = require("./middleware/validateHeaders");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


const PORT = 3001;
const wsUrl = 'wss://smartapisocket.angelone.in/smart-stream';

mongoose.connect('mongodb+srv://root:root@cluster0.hsxcf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
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


let clients = new Set();
let socketInstance = null;
let heartbeatInterval = null;
let api_key = null;
let client_code = null;
let access_token = null;
let feed_token = null;
let refresh_token = null;


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
    
    console.log('📊 Received LTP:', ltp);

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

app.post("/login", async (req, res) => {
  const { clientcode, password, totp } = req.body;
  try {
    const response = await loginUser(clientcode, password, totp);
    res.json(response.status ? 
      { success: true, message: "Login successful", data: response.data } : 
      { success: false, message: response.message || "Login failed", errorCode: response.errorcode || "UNKNOWN_ERROR" }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/healthCheck",validateHeaders, async (req, res) => {
  try {
    api_key = req.api_key
    client_code = req.client_code
    access_token = req.access_token
    feed_token = req.feed_token
    refresh_token = req.refresh_token
    const data = await healthCheck(req.api_key, req.client_code, req.access_token,req.feed_token,req.refresh_token);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch health data" });
  }
});

app.get("/getCandleData",validateHeaders, async (req, res) => {
  try {
    const {symboltoken, exchange} = req.query
    const data = await calculateData(req.api_key, req.client_code, req.access_token,req.feed_token,req.refresh_token, symboltoken, exchange);
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

app.get("/getAllOrders",validateHeaders, async (req, res) => {
  try {
    const allOrders = await Orders.find(); // Retrieve all users
    res.json(allOrders);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/placeOrder',validateHeaders, async (req, res) => {
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

app.post("/searchScrip",validateHeaders, async (req, res) => {
  try {
    api_key = req.api_key
    client_code = req.client_code
    access_token = req.access_token
    feed_token = req.feed_token
    refresh_token = req.refresh_token
    const {symboltoken} = req.body
    const data = await searchScrip(req.api_key, req.client_code, req.access_token,req.feed_token,req.refresh_token,symboltoken);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch health data" });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
