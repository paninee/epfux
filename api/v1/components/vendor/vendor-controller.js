module.exports = function (express, passport, io) {
  var router = express.Router();
  var UserModel = require('../user/user-model').model;
  var VendorModel = require('./vendor-model').model;
  var authentication = require('../../shared/authentication/authentication');
  var util = require('../../shared/util');
  var async = require('async');
  var request = require('request');
  var parse = require('csv-parse');
  var _ = require('lodash');
  require('../../shared/msg');

  router.post('/', authentication.isSignedIn, function (req, res) {
    var vendorObj = new VendorModel(req.body.vendor);
    vendorObj.home = req.session.home._id;
    vendorObj.save(function (err) { // Save vendor to Mongo and create index in Elastic
      if (err) {
        util.sendDbError('Vendor', 'save', err, res);
      } else {
        res.status(200).json({vendor: vendorObj});
      }
    });
  });

  router.post('/import/csv', authentication.isSignedIn, function (req, res) {
    var vendors = [];
    var parser = parse({delimiter: ',', from: 2});
    request(req.body.sourceUrl).pipe(parser).on('data', function (line) {
      var vendorObj = new VendorModel({
        home: req.session.home._id,
        address: {}
      });

      if(line[0]) {
        vendorObj.contactName = line[0];
      }
      if(line[1]) {
        vendorObj.contactPosition = line[1];
      }
      if(line[2]) {
        vendorObj.email = line[2];
      }
      if(line[3]) {
        vendorObj.phoneNo = line[3];
      }
      if(line[4]) {
        vendorObj.name = line[4];
      }
      if(line[5]){
        vendorObj.address.street = line[5];
      }
      if(line[6]){
        vendorObj.address.unitNo = line[6];
      }
      if(line[7]){
        vendorObj.address.city = line[7];
      }
      if(line[8]){
        vendorObj.address.province = line[8];
      }
      if(line[9]){
        vendorObj.address.country = line[9];
      }
      if(line[10]){
        vendorObj.address.postalCode = line[10];
      }
      vendors.push(vendorObj);
    }).on('end', function() {
      VendorModel.insertMany(vendors, function (err, vendors) { // Save vendor to Mongo and create index in Elastic
        if (err) {
          util.sendDbError('Vendor', 'insertMany', err, res);
        } else {
          res.status(200).json({total: vendors.length});
        }
      });
    });
  });

  router.get('/', authentication.isSignedIn, function (req, res) {
    var query = {
      active: true,
      home: req.session.home._id
    };
    var options = {
    };
    if (req.query.q) {
      query.$or = [{
        name: new RegExp('.*' + req.query.q + '.*', 'i')
      }, {
        contactName: new RegExp('.*' + req.query.q + '.*', 'i')
      }];
    }
    if (req.query.skip) {
      options.skip = parseInt(req.query.skip);
    }
    if (req.query.limit) {
      options.limit = parseInt(req.query.limit);
    }
    VendorModel.find(query, null, options)
      .exec((err, vendors) => {
        if (err) {
          util.sendDbError('Vendor', 'find', err, res);
        } else {
          VendorModel.count(query, (err, count) => {
            if (err) {
              util.sendDbError('Vendor', 'count', err, res);
            } else {
              res.status(200).json({vendors: vendors, total: count});
            }
          });
        }
      });
  });

  router.get('/:vendorId', authentication.isSignedIn, function (req, res) {
    var vendorId = req.params.vendorId;

    VendorModel.findById(vendorId).exec(function (err, vendor) { // Save vendor to Mongo and create index in Elastic
      if (err) {
        util.sendDbError('Vendor', 'findOneAndUpdate', err, res);
      } else {
        res.status(200).json({vendor: vendor});
      }
    });
  });

  router.delete('/:vendorId', authentication.isSignedIn, function (req, res) {
    var vendorId = req.params.vendorId;

    VendorModel.findOneAndUpdate({
      _id: vendorId
    }, {active: false}, {
      new: true
    }).exec(function (err, vendor) { // Save vendor to Mongo and create index in Elastic
      if (err) {
        util.sendDbError('Vendor', 'findOneAndUpdate', err, res);
      } else {
        res.status(200).json({});
      }
    });
  });

  return router;
};
