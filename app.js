const express = require('express');
const app = express();
const port = '9000';
const morgan = require('morgan');
const randomstring = require('randomstring');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'leetLinkDB';
const collectionName = 'urls';
const domain = 'http://ec2-3-17-28-164.us-east-2.compute.amazonaws.com:9000/';

app.use(morgan('short'));

app.listen(port, () => {
   console.log('leetLink server is running on port', port);
});

// Generate shorter url and put pair in DB
app.get('/api/generate/:url', (req, res) => {
   console.log('Generate new url for: ', req.params.url);
   let newUrl = new urlObj(req.params.url, getRandomId());
   console.log(newUrl);
   saveToDB(newUrl);
   res.send(domain + newUrl.generatedString);
});

// Fetch url from DB
app.get('/:shortUrl', (req, res) => {
   console.log('Fetching url from: ', req.params.shortUrl);
   fetchFromDB(req.params.shortUrl, (answer) => {
      res.send(answer);
   });
});

const getRandomId = () => {
   return randomstring.generate({
      length: 6,
      charset: 'alphanumeric',
   });
}

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

class urlObj {
   constructor(originalUrl, generatedString) {
      this.originalUrl = originalUrl;
      this.generatedString = generatedString;
   }
}