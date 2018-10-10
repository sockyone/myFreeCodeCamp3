'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require("dns");

var cors = require('cors');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));

// Basic Configuration 
var port = process.env.PORT || 3000;

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);


app.use(cors());

var Schema = mongoose.Schema;

var Shorten = new Schema({
  url : String
});

var ShortenUrl = mongoose.model('ShortenUrl',Shorten);


/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new',function(req,res) {
  var httpReg = new RegExp("http://");
  var httpsReg = new RegExp("https://");
  var url;
  if (httpsReg.test(req.body.url)) url = req.body.url.replace('https://','');
  if (httpReg.test(req.body.url)) url = req.body.url.replace('http://','');
  
  dns.lookup(url,function(err,address,family){
    if (err) res.json({"error":"invalid URL"});
    else {
      var shortenInstance = new ShortenUrl({url:url});
      shortenInstance.save(function(err,data) {
        if (err) console.log('failed in load to database');
        res.json({"original_url":req.body.url,"short_url":data._id});
      });
    }
  });
});

app.get('/api/shorturl/:id',function(req,res){
  ShortenUrl.findById(req.params.id,function(err,data){
    if (err) 
      res.json({"error":"No short url found for given input"});
    else { 
      res.status(301).redirect('http://'+data.url);
    }
  })
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
