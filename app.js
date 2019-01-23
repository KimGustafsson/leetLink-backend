const express = require('express');
const port = '9000';
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const randomstring = require('randomstring');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'leetLinkDB';
const collectionName = 'urls';
// const domain = 'http://ec2-3-17-28-164.us-east-2.compute.amazonaws.com:9000/';
const domain = 'http://localhost:9000/';
var bodyParser = require("body-parser");
app.use(morgan('short'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, () => {
   console.log('leetLink server is running on port', port);
});

// Just for the damn favicon request
app.get('/favicon.ico', (req, res) => res.status(204));

// Generate shorter url and put pair in DB
app.post('/api/generate', (req, res) => {
   console.log('Generate new url for: ', req.body.url);
   let newUrl = new urlObj(req.body.url, getRandomId());
   console.log(newUrl);
   saveToDB(newUrl);
   res.send(JSON.stringify({
      generatedUrl: domain + newUrl.generatedString
   }));
});

// Fetch url from DB
app.get('/:shortUrl', (req, res) => {
   console.log('Fetching url from: ', req.params.shortUrl);
   fetchFromDB(req.params.shortUrl, (answer) => {
      answer = hasHttp(answer.originalUrl) ? answer.originalUrl : 'https://' + answer.originalUrl;
      res.redirect(answer);
   });
});

// Check if the url has http or https
const hasHttp = (url) => {
   return url.indexOf("http://") == 0 || url.indexOf("https://") == 0;
}

// Generate a random  six character alphanumeric string
const getRandomId = () => {
   return randomstring.generate({
      length: 6,
      charset: 'alphanumeric',
   });
}

// Fetch url from mongoDB
const fetchFromDB = (url, callback) => {
   MongoClient.connect(dbUrl, (err, client) => {
      const db = client.db(dbName);
      assert.equal(null, err);
      console.log("Connected successfully to server");

      fetchUrl(url, db, (obj) => {
         console.log(obj.originalUrl);
         callback(obj);
      });
   });
}

// Save url to mongoDB
const saveToDB = (urlObj) => {
   MongoClient.connect(dbUrl, (err, client) => {
      const db = client.db(dbName);
      assert.equal(null, err);
      console.log("Connected successfully to server");

      insertUrl(urlObj, db, () => {
         client.close();
      })
   });
}

// Construct the insert query
const insertUrl = (urlObj, db, callback) => {
   const collection = db.collection(collectionName);
   collection.insertOne({
      originalUrl: urlObj.originalUrl,
      generatedString: urlObj.generatedString
   }, (err, result) => {
      assert.equal(err, null);
      console.log('Inserted url to db');
      callback(result);
   });
}

// Construct the fetch query
const fetchUrl = (url, db, callback) => {
   const collection = db.collection(collectionName);
   collection.findOne({
      generatedString: url,
   }, (err, result) => {
      assert.equal(err, null);
      console.log('Fetched url from db');
      callback(result);
   });
}

// A object for the urls (might be just a bit overkill)
class urlObj {
   constructor(originalUrl, generatedString) {
      this.originalUrl = originalUrl;
      this.generatedString = generatedString;
   }
}