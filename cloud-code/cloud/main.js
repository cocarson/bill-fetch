

var Parse = require('parse-cloud-express').Parse;
var Request = require('request');
var _ = require('lodash');

var AlchemyAPI = require('alchemy-api');
// var alchemy = new AlchemyAPI('7b997ab89a5f8b104be5592460d5660589f5a9c9'); // umich email
var alchemy = new AlchemyAPI('2db178a0fd2bbdcbade14808d365a2cc24820757'); // gmail emial


function SunlightBillRequest(queryStr, page, result, response, cb) {
  if (page < 75)  {
    Request(queryStr + '&page=' + String(page), function(error, res, body) {
      if (!error && res.statusCode == 200) {
        result.push(JSON.parse(body));
        SunlightBillRequest(queryStr, page + 1, result, response, cb);
      } else {
        response.error(error);
      }
    });
  } else {
    // response.success('here');
    cb(shortenResultsByDate(result, "2012-01-01"), 0, 0, response, []);
  }
}

function shortenResultsByDate(result, dateStr) {
  endIndex = null
  console.log(result.length);

  for (i = 0; i < result.length; i++) {
    for (j = 0; j < result[i].results.length; j++) {
      if (result[i].results[j].introduced_on <= dateStr && endIndex == null) { 
        endIndex = [i, j];
      } 
    } 
  }
  // Removes all bills after the specified date string
  result = _.slice(result, 0, endIndex[0] + 1)
  result[endIndex[0]].results = _.slice(result[endIndex[0]].results, 0, endIndex[1]);

  return result;
}

function AlchemyRequest(bills, page, id, response, result) {

  if (id < 3) { // bills[page].results.length
    alchemy.concepts(bills[page].results[id].summary, {}, function(err, res) {
      if (err) { 
        response.error(err);
      } else {
        // response.success(res);
        bills[page].results[id].concepts = _.map(res.concepts, function(e) { return e.text; } );
        AlchemyRequest(bills, page, id + 1, response, result);
      }
    });
  } else if (page < 1) { 
    AlchemyRequest(bills, page + 1, id = 0, response, result);
  } else {
    response.success(bills);
  }
}

// Fetch 10 bills from sunlight api
Parse.Cloud.define("getAllBills", function(request, response) {
  console.log("GETTING BILLS");

  var baseUrl = "https://congress.api.sunlightfoundation.com/bills?";
  var apiKey = "apikey=3387a7be60fa48acb1c007aea93ce3b1";
  // Short title, short summary exist, 
  var fields = "&fields=bill_id,summary_short,official_title,short_title,summary,urls,history,actions,sponsor_id,sponsor,related_bill_ids,introduced_on";
  var contraints = "&short_title__exists=true&summary_short__exists=true&per_page=50&history.active=true&history.enacted=false&order=introduced_on";
  var queryStr = baseUrl + apiKey + fields + contraints;

  SunlightBillRequest(queryStr, 1, [], response, AlchemyRequest);
});

Parse.Cloud.define("getTags", function(request, response) {
  var bills = JSON.parse(request.params.bills_str);
  AlchemyRequest(bills, 0, response);
});

Parse.Cloud.beforeSave('TestObject', function(request, response) {
  console.log('Ran beforeSave on objectId: ' + request.object.id);
  response.success();
});

Parse.Cloud.afterSave('TestObject', function(request, response) {
  console.log('Ran afterSave on objectId: ' + request.object.id);
});

Parse.Cloud.beforeDelete('TestObject', function(request, response) {
  console.log('Ran beforeDelete on objectId: ' + request.object.id);
  response.success();
});

Parse.Cloud.afterDelete('TestObject', function(request, response) {
  console.log('Ran afterDelete on objectId: ' + request.object.id);
});

