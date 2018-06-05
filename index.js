var express = require('express')
var http = require('http');
var url = require('url');
const request = require('request');
var bodyParser = require('body-parser');

var app = express();
//app.use(express.json());
//app.use(express.urlencoded());
//app.use(bodyParser.xml());

app.use (function(req, res, next) {
  var data='';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { 
     data += chunk;
  });

  req.on('end', function() {
      req.body = data;
      next();
  });
});

function getOptions(req, res){
  var headerUri = req.headers['x-proxy-uri'];
  if(!headerUri){
    res.status(500).send('No x-proxy-uri header found');
    return;
  }
  var uri = url.parse(headerUri);
  var headers = JSON.stringify(req.headers);
  var headers = req.headers;
  headers['host'] = uri.host;
  var options = {
    url: headerUri,
    headers: headers
  };
  return options;
}

function call(options, res, req, method){
  if(method == 'get'){
    request(options, function(error, response){
      if (error) { 
        res.status(500).send(error);
        return;
      }
      res.set(response.headers);
      res.send(response.body);
    });
  }else if(method == 'post'){
    if(req.headers['content-type'].match(/xml/gi)){
      options.body = req.body
      options.json = false;
    }else if(req.headers['content-type'].match(/json/gi)){
      options.body = req.body;
      options.json = true;
    }else if(req.headers['content-type'].match(/form/gi)){
      options.body = req.body
      options.json = false;
    }else{
      res.status(500).send('no content-type specified');
    return;
    }
    console.log(req.body);
    request.post(options, function(error, response){
      if (error) { 
        res.status(500).send(error);
        return;
      }
      res.set(response.headers);
      res.send(response.body);
    });
  }else if(method == 'put'){
    if(req.headers['content-type'].match(/xml/gi)){
      options.body = req.body
      options.json = false;
    }else if(req.headers['content-type'].match(/json/gi)){
      options.body = req.body;
      options.json = true;
    }else if(req.headers['content-type'].match(/form/gi)){
      options.body = req.body
      options.json = false;
    }else{
      res.status(500).send('no content-type specified');
    return;
    }
    console.log(req.body);
    request.put(options, function(error, response){
      if (error) { 
        res.status(500).send(error);
        return;
      }
      res.set(response.headers);
      res.send(response.body);
    });
  }else{
        res.status(500).send('error');
  }
  return;
}

app.get('/', function (req, res) {
  var options = getOptions(req,res);
  if(!options){
    return;
  }
  call(options, res, req, 'get');
});

app.post('/', function (req, res) {
  var options = getOptions(req,res);
  if(!options){
    return;
  }
  call(options, res, req, 'post');
});

app.put('/', function (req, res) {
  var options = getOptions(req,res);
  if(!options){
    return;
  }
  call(options, res, req, 'put');
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log('We are live on ' + port);
});
