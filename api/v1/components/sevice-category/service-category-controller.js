module.exports = function (express, passport, io) {
  var router = express.Router();
  var ServiceCategoryModel = require('./service-category-model').model;
  var authentication = require('../../shared/authentication/authentication');
  var util = require('../../shared/util');
  var async = require('async');
  var _ = require('lodash');
  require('../../shared/msg');

  router.post('/', authentication.isSignedIn, function (req, res) {
    var serviceCategoryObj = new ServiceCategoryModel(req.body.serviceCategory);
    serviceCategoryObj.save(function (err) { // Save serviceCategory to Mongo
      if (err) {
        util.sendDbError('ServiceCategory', 'save', err, res);
      } else {
        res.status(200).json({serviceCategory: serviceCategoryObj});
      }
    });
  });

  router.get('/', authentication.isSignedIn, function (req, res) {
    ServiceCategoryModel.find({}, function (err, serviceCategories) { // Save serviceCategory to Mongo
      if (err) {
        util.sendDbError('ServiceCategory', 'save', err, res);
      } else {
        res.status(200).json({serviceCategories: serviceCategories});
      }
    });
  });

  return router;
};
