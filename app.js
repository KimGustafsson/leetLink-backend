const express = require('express');
const app = express();
const port = '9000';
const morgan = require('morgan');
const cryptojs = require('crypto-js');
const base62 = require('base62/lib/ascii');

app.use(morgan('short'));

app.get('/', (req, res) => {
   res.send('Hello from the root!');
});

// Generate shorter url and put pair in DB
app.get('/generate/:url', (req, res) => {
   let encryptedUrl = cryptojs.MD5(req.params.url);
   console.log('Generate new url for: ', req.params.url);
   res.send(encryptedUrl);
});

// Fetch url from DB
app.get('/fetch/:shortUrl', (req, res) => {
   console.log('Fetching url from: ', req.params.shortUrl);
   res.send(req.params.shortUrl);
});

app.listen(port, () => {
   console.log('leetLink server is running on port', port);
});