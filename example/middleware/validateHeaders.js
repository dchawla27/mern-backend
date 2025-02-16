// middleware/validateHeaders.js
function validateHeaders(req, res, next) {
    const api_key = req.headers['api_key'];
    const client_code = req.headers['client_code'];
    const access_token = req.headers['access_token'];
    const feed_token = req.headers['feed_token'];
    const refresh_token = req.headers['refresh_token'];
    
  
    // Check if required headers are missing
    if (!api_key || !access_token || !refresh_token || !feed_token || !client_code) {
      return res.status(400).json({ error: "Missing required headers" });
    }
  
    // Attach the headers to request object for further use
    req.api_key = api_key;
    req.access_token = access_token;
    req.refresh_token = refresh_token;
    req.client_code = client_code;
    req.feed_token = feed_token;
  
    // Proceed to the next middleware or route handler
    next();
  }
  
  module.exports = validateHeaders;
  