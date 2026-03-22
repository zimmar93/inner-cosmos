const https = require('https');

const req = https.request('https://backend-ruby-seven-61.vercel.app/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const json = JSON.parse(data);
    const token = json.accessToken || json.access_token;
    if (!token) return console.log('Login fail', data);
    
    const pReq = https.request('https://backend-ruby-seven-61.vercel.app/api/v1/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }, (res2) => {
      let d2 = '';
      res2.on('data', c => d2 += c);
      res2.on('end', () => console.log('CREATE RESPONSE:', res2.statusCode, '\n', d2));
    });
    
    pReq.write(JSON.stringify({ title: 'Test Remote', slug: 'test-remote-' + Date.now(), status: 'draft' }));
    pReq.end();
  });
});

req.write(JSON.stringify({ email: 'zimmar.electronic@gmail.com', password: 'Zimmar@123' }));
req.end();
