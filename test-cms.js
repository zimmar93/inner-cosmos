const https = require('http'); // local is http
const req = https.request('http://localhost:3001/api/v1/content', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log(data));
});
req.end();
