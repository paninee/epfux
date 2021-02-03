// config variables
// MAILCHIMP_GENERAL_LIST = 'acec4709a6';

// var aws = require('aws-sdk');
// var Email = require('email-templates');
// var nodemailer = require('nodemailer');
// var ua = require('universal-analytics');
// var {google} = require('googleapis');
// var googleAPIToken, jwtClient;
// var mongoose = require('mongoose');
// var http = require('http');
// var CurrencyModel = require('../components/currency/currency-model').model;
// require('./msg');

// -------------------------- [START] Internal --------------------------
// module.exports.buildDbError = function(model, action){
//   return {
//     en: {
//       code: 500,
//       name: 'DATABASE_ERROR',
//       title: 'Database error',
//       msg: model + ' model ' + action + ': ' + err
//     },
//     th: {
//       code: 500,
//       name: 'DATABASE_ERROR',
//       title: 'Database error',
//       msg: model + ' model ' + action + ': ' + err
//     }
//   };
// };
//
module.exports.sendDbError = function(model, action, err, res){
  res.status(500).json({
    name: 'DATABASE_ERROR',
    title: 'Database error',
    msg: model + ' model ' + action + ': ' + err
  });
};

// module.exports.sendMissingFieldError = function(fieldName, res){
//   res.status(ERRORS.MissingRequiredData.en.code).json({
//     name: ERRORS.MissingRequiredData.en.name,
//     title: ERRORS.MissingRequiredData.en.title,
//     msg: fieldName + ERRORS.MissingRequiredData.en.msg
//   });
// };

module.exports.sendError = function(errorObj, language, res){
  let error = errorObj[language || 'en'];
  res.status(error.code).json({
    name: error.name,
    title: error.title,
    msg: error.msg
  });
};
//
// module.exports.deleteEmpty = function (val) {
//   if(val == null){
//     return undefined;
//   }
//   return val;
// };
//
// module.exports.to2Decimals = function(number) {
//   if(number == null || number == undefined){
//     return undefined;
//   }
//   return Math.round(number * 100) / 100;
// };
//
// /*
//  Factory to create GA visitor object. Please use this method to get a GA object instead of just get it directly.
//  This method keeps GA tracking ID dynamic, and decide whether there's a user session.
//   */
// module.exports.getGAVisitor = function(req){
//   if(req.isAuthenticated()) {
//     return ua(process.env.GA_TRACKING_ID, req.user._id, {strictCidFormat: false});
//   } else {
//     return ua(process.env.GA_TRACKING_ID);
//   }
// };
//
// module.exports.getGoogleJWTClient = function(cbFn){
//   if(googleAPIToken) {
//     return cbFn(null, jwtClient);
//   } else {
//     jwtClient = new google.auth.JWT(G_API_SERVICE_ACCOUNT.client_email, null, G_API_SERVICE_ACCOUNT.private_key, ['https://www.googleapis.com/auth/analytics.readonly'], null);
//     jwtClient.authorize(function (err, token) {
//       if (err) {
//         return cbFn(err, null);
//       }
//       googleAPIToken = token;
//       return cbFn(null, jwtClient);
//     });
//   }
// };
//
// module.exports.generateFriendlyID = function(text){
//   var trimText = text.trim().toLowerCase().replace(/[&\/\\#+()$~%'":*?<>{}\s]/gi, '-');
//   if (!trimText) {
//     return trimText;
//   }
//   return `${trimText}-${Date.now()}`;
// };
// // -------------------------- [END] Internal --------------------------
//
// // -------------------------- [START] AWS --------------------------
module.exports.uploadToS3 = function(fileName, body, contentType, cbFn){
  var s3obj = new aws.S3();
  s3obj.upload({
    ACL: 'public-read',
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    ContentType: contentType,
    Body: body
  }).send(function(err, data){
    if (err) {
      res.status(ERRORS.S3UploadError.en.code).json(ERRORS.S3UploadError.en);
      cbFn(err);
    } else {
      cbFn(null, data);
    }
  });
};
// // -------------------------- [END] AWS --------------------------
//
//
// // -------------------------- [START] Elasticsearch --------------------------
// module.exports.bulkIndexing =  function (indexData, networkName, callback){
//   let https = require('https');
//   let url = require('url');
//   let options = url.parse(process.env.ES_CONNECTION);
//
//   options.path = '/_bulk';
//   options.pathname = '/_bulk';
//   options.method = 'POST';
//   options.headers = {
//     'Content-Type': 'application/x-ndjson'
//   };
//
//   let bonsaiRequest = https.request(options, function(bonsaiResponse){
//
//     let dataString='';
//     bonsaiResponse.on('data', function(data){
//       if(data){
//         // generate data string from stream
//         dataString+=data.toString();
//       }
//     });
//
//     bonsaiResponse.on('end', function(data){
//       console.log(`Bulk indexing ended for ${networkName}...`);
//       return callback();
//     });
//
//     bonsaiResponse.on('error', function(e){
//       console.log(`Bulk indexing ended with Error for ${networkName}...`);
//       console.dir(e);
//       return callback()
//     })
//
//   });
//
//   bonsaiRequest.write(indexData);
//   bonsaiRequest.end();
// };
// // -------------------------- [END] Elasticsearch --------------------------
//
//
// // -------------------------- [START] Currency --------------------------
// // module.exports.getLatestCurrencyRates = function(base, callback){
// //   let urlString =  `http://api.fixer.io/latest?base=${base}`;
// //   let url = require('url');
// //
// //
// //   let options = url.parse(urlString);
// //   let responseBody = '';
// //   http.request(options, function (res) {
// //     res.on('data', function (data) {
// //       responseBody += data.toString();
// //     });
// //     res.on('error', function (e) {
// //       console.dir(e);
// //     });
// //     res.on('end', function (data) {
// //       if (responseBody){
// //         let responseJson = undefined;
// //         try {
// //           responseJson =  JSON.parse(responseBody);
// //         } catch (ex){
// //           console.log(ex);
// //           return callback(undefined);
// //         }
// //         return callback(responseJson.rates);
// //       } else{
// //         return callback(undefined);
// //       }
// //     })
// //   }).end();
// // };
// //
// // module.exports.convertCurrency = function(from, to, amount, callback){
// //   let ratesJson = undefined;
// //   this.getLatestCurrencyRates(from, function(rates){
// //     ratesJson = rates;
// //     if (!ratesJson){
// //       return  callback(undefined);
// //     }
// //
// //     let destinationRate = ratesJson[to];
// //     let returnAmount = amount*destinationRate;
// //     callback(returnAmount);
// //   });
// // };
// //
// // module.exports.convertCurrency = function(from, to, amount, callback){
// //
// //   CurrencyModel.findOne({baseCurrency: from, toCurrency: to}, function(err, rate){
// //     if (err || !rate){
// //       return callback('');
// //     }
// //     return callback(amount * rate.amount);
// //   })
// // };
// // -------------------------- [END] Currency --------------------------
//
//
// // -------------------------- [START] Email --------------------------
// -------------------------- [END] Email --------------------------

