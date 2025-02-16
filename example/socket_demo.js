const { api_key, access_token, refresh_token, feed_token,client_code } = require("../config/env")
const WebSocket = require('ws');

const wsUrl = 'wss://smartapisocket.angelone.in/smart-stream';
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'x-api-key': api_key,
  'x-client-code': client_code,
  'x-feed-token': feed_token,
};


const ws = new WebSocket(wsUrl, { headers });


ws.on('open', function open() {
  console.log('Connected to WebSocket');

  // Send a subscription request
  const subscriptionMessage = {
    correlationID: "abcde12345",
    action: 1,
    params: {
      mode: 1,
      tokenList: [
        {
          exchangeType: 1, // NSE's exchange type
          tokens: ["99926000"] // Token for the symbol
        }
      ]
    }
  };

  ws.send(JSON.stringify(subscriptionMessage));

  // Start sending heartbeat messages every 30 seconds
  setInterval(() => {
    console.log('Sending heartbeat: ping');
    ws.send('ping');
  }, 30000);
});

ws.on('message', function incoming(message) {
  
    if (message === 'pong') {
        console.log('Received heartbeat response: pong');
    } else{
    const data = new Uint8Array(message);
    console.log('data',data)
    const ltpBytes = data.slice(43, 47);
    const ltpValue = ltpBytes.reduce((value, byte, index) => value + byte * Math.pow(256, index), 0);
    const ltp = ltpValue / 100;
    if (ltp === 0) {
        console.log('Ignoring invalid LTP');
        return;
    }
    console.log('Received LTP:', ltp);
    }

 
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('WebSocket connection closed');
});
