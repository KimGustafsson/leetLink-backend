const express = require('express');
const app = express();
const port = '9000';
const morgan = require('morgan');
const randomstring = require('randomstring');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'leetLinkDB';

MongoClient.connect(dbUrl, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});
app.use(morgan('short'));

// Generate shorter url and put pair in DB
app.get('/api/generate/:url', (req, res) => {
   console.log('Generate new url for: ', req.params.url);
   res.send(getRandomId());
   // put both urls in the DB
   let temp = new urlObj(req.params.url, getRandomId());
   console.log(temp);

   // Send the generated url
});

// Fetch url from DB
app.get('/api/fetch/:shortUrl', (req, res) => {
   console.log('Fetching url from: ', req.params.shortUrl);
   res.send(req.params.shortUrl);
});

app.listen(port, () => {
   console.log('leetLink server is running on port', port);
});

const getRandomId = () => {
   return randomstring.generate({
      length: 6,
      charset: 'alphanumeric',
   });
}

const saveToDB = (db, urlObj, callback) => {
   const collection = db.collection('urls');
   collection.insertOne({
      originalUrl: urlObj.originalUrl,
      generatedString: urlObj.generatedString
   }, (err, result) => {
      assert.equal(err, null);
      console.log('Inserted url to db');
      callback(result);
   });
}

class urlObj {
   constructor(originalUrl, generatedString) {
      this.originalUrl = originalUrl;
      this.generatedString = generatedString;
   }
}