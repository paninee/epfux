module.exports = function (express, passport, io) {
  var router = express.Router();
  var UserModel = require('../user/user-model').model;
  var FuneralHomeModel = require('./funeral-home-model').model;
  var VendorModel = require('../vendor/vendor-model').model;
  var ServiceCategoryModel = require('../sevice-category/service-category-model').model;
  var invitationModel = require('../invitation/invitation-model').model;
  var authentication = require('../../shared/authentication/authentication');
  var util = require('../../shared/util');
  var async = require('async');
  var _ = require('lodash');
  var mongoose = require('mongoose');
  var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  var sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  require('../../shared/msg');

  let WHITELISTED_FIELDS_STAFF = 'coordinate currency name availableServices vehicles address phoneNo unitOfMeasurement owner staffs payout active';

  // List owner and staffs working at this home
  router.get('/users', authentication.isSignedIn, function (req, res) {
    FuneralHomeModel.findById(req.session.home._id).populate('owner staffs').lean().exec((err, home) => {
      if(err) {
        util.sendDbError('Home', 'findById', err, res);
      } else {
        home.owner.role = 'Account owner';
        let users = [home.owner];
        _.each(home.staffs, (staff) => {
          staff.role = 'Staff';
        });
        res.status(200).json({user: users.concat(home.staffs)});
      }
    });
  });

  // List dropdown values as metadata for the frontend
  router.get('/metadata', authentication.isSignedIn, function (req, res) {
    async.parallel({
      serviceCategories: cb => {
        ServiceCategoryModel.find({}, 'name').lean().exec((err, serviceCategories) => {
          if(err){
            cb(err);
          } else {
            cb(null, serviceCategories);
          }
        });
      },
      vendors: cb => {
        VendorModel.find({
          home: req.session.home._id,
          active: true
        }, 'name').lean().exec((err, vendors) => {
          if(err){
            cb(err);
          } else {
            cb(null, vendors);
          }
        });
      }
    }, (err, results) => {
      if(err) {
        util.sendDbError('ServiceCategory | Vendor', 'find', err, res);
      } else {
        res.status(200).json({serviceCategories: results.serviceCategories, vendors: results.vendors});
      }
    });
  });

  router.put('/addstaff', authentication.isHomeOwner, function (req, res) {
    if(req.body.email){
      UserModel.findOne({email: req.body.email}, async (err, user) => {
        if(user) {
          FuneralHomeModel.findByIdAndUpdate(req.session.home._id, {
            $addToSet: {
              staffs: user
            }
          }, (err, home) => {
            if(err && !home) {
              util.sendDbError('Home', 'save', err, res);
            } else {
              req.session.home = home;
              res.status(200).cookie('home', req.session.home).json({home: home,invite:false});
            }
          });
        } else {
          let home = await FuneralHomeModel.findById(req.session.home._id).populate('owner');
          let invitedUser = await invitationModel.find({email: req.body.email});
          if(invitedUser.length <= 0 || !invitedUser){
            let invitations = await invitationUser(req.session.home._id,req.body.email);
          }
          let email = await sendEmailTemplate(home, req.body.email, req.get('host'));
          if (email){
            res.status(200).json({
              invite: true,
              msg: 'Invite sent'
            });
          }
        }
      });
    } else {
      res.status(ERRORS.MissingRequiredData.code).json(ERRORS.MissingRequiredData);
    }
  });

  router.put('/services', authentication.isSignedIn, function (req, res) {
    var service = req.body.service;

    FuneralHomeModel.findByIdAndUpdate(req.session.home._id, {
      $addToSet: {
        availableServices: service
      }
    }, {
      new: true,
      upsert: true,
      select: WHITELISTED_FIELDS_STAFF
    }, (err, home) => {
      if(err && !home) {
        util.sendDbError('Home', 'save', err, res);
      } else {
        req.session.home = home;
        res.status(200).cookie('home', req.session.home).json({home: home});
      }
    });
  });

  router.put('/payout', authentication.isHomeOwner, function (req, res) {
    if(req.body.code) { // Stripe auth code
      async.waterfall([
        cb => {
          FuneralHomeModel.findById(req.session.home._id).populate('owner').exec((err, home) => {
            if(err) {
              return cb(err);
            }
            cb(null, home);
          });
        },
        (home, cb) => {
          stripe.oauth.token({
            code: req.body.code,
            grant_type: 'authorization_code'
          }, (err, acct) => {
            if(err){
              cb(err);
            } else {
              stripe.accounts.retrieve(acct.stripe_user_id, (err, account) => {
                // if(home.payout && home.payout.account) { // Existing account //TODO: This does not work. We have no way to remove Express connect account
                //   stripe.accounts.del(home.payout.account);
                // }
                cb(null, home, account);
              });
            }
          });
        },
        (home, account, cb) => {
          home.payout = {
            account: account.id,
            bank: account.external_accounts.data[0].bank_name,
            currency: account.external_accounts.data[0].currency.toUpperCase(),
            name: account.business_profile ? account.business_profile.name : account.individual ? `${account.individual.first_name} ${account.individual.last_name}` : home.name,
            last4: account.external_accounts.data[0].last4
          };
          home.save(cb);
        }
      ], (err, home) => {
        if(err) {
          res.status(500).json({
            title: 'Failed adding payout',
            msg: 'Cannot add payout. Error ' + err.message
          });
        } else {
          req.session.home = home.toObject({depopulate: true, versionKey: false});
          res.status(200).cookie('home', req.session.home).json({home: home});
        }
      });
    } else {
      res.status(ERRORS.MissingRequiredData.code).json(ERRORS.MissingRequiredData);
    }
  });


  router.delete('/payments', authentication.isHomeOwner, function (req, res) {
    async.waterfall([
      cb => {
        FuneralHomeModel.findById(req.session.home._id).populate('owner').exec((err, home) => {
          if(err) {
            return cb(err);
          }
          cb(null, home);
        });
      },
      (home, cb) => {
        stripe.customers.del(home.payment.customerId, (err, newSource) => {
          if (err) {
            return cb(err);
          }
        });
        cb(null, home);
      },
      (home, cb) => {
        home.payment = undefined;
        home.active = false;
        home.save(cb);
      }
    ], (err, home) => {
      if(err) {
        res.status(500).json({
          title: 'Failed removing payment',
          msg: 'Cannot remove payment. Error ' + err.message
        });
      } else {
        req.session.home = home.toObject({depopulate: true, versionKey: false});
        res.status(200).cookie('home', req.session.home).json({home: home});
      }
    });
  });

  router.put('/payments', authentication.isHomeOwner, function (req, res) {
    if(req.body.token){ // Stripe token
      async.waterfall([
        cb => {
          FuneralHomeModel.findById(req.session.home._id).populate('owner').exec((err, home) => {
            if(err) {
              return cb(err);
            }
            cb(null, home);
          });
        },
        (home, cb) => {
          if(home.payment && home.payment.customerId) { // Existing customer ID in Stripe
            stripe.customers.createSource(home.payment.customerId, {
              source: req.body.token
            }, (err, newSource) => {
              if (err) {
                return cb(err);
              }
              // retrieve card fingerprint form the token
              stripe.tokens.retrieve(req.body.token, (err, token) => {
                if (!err) {
                  // Remove existing source from Stripe customer
                  stripe.customers.deleteSource(home.payment.customerId, home.payment.sourceId, (err, confirmation) => {
                    if (!err) {
                      cb(null, home, home.payment.customerId, newSource.id, token);
                    } else {
                      cb(err);
                    }
                  });
                } else {
                  cb(err);
                }
              });
            });
          } else { // Has no Stripe account before
            stripe.customers.create({
              source: req.body.token,
              email: home.owner.email,
              name: `${home.name}`,
              phone: home.phoneNo,
              address: {
                line1: home.address ? home.address.street : '',
                line2: home.address ? home.address.unitNo : '',
                city: home.address ? home.address.city : '',
                state: home.address ? home.address.province : '',
                postal_code: home.address ? home.address.postalCode : '',
                country: home.address ? home.address.country : ''
              }
            }, (err, customer) => {
              if(err) {
                return cb(err);
              }
              // retrieve card fingerprint form the token
              stripe.tokens.retrieve(req.body.token, (err, token) => {
                if(!err) {
                  stripe.subscriptions.create({
                    customer: customer.id,
                    items: [{plan: process.env.STRIPE_PLAN}],
                    trial_from_plan: true
                  }, (err, subscription) => {
                    if(!err && (subscription.status == 'active' || subscription.status == 'trialing')) {
                      cb(null, home, customer.id, customer.sources.data[0].id, token);
                    } else {
                      cb(err || new Error(subscription.status));
                    }
                  });
                } else {
                  cb(err);
                }
              });
            });
          }
        },
        (home, customerId, newSource, token, cb) => {
          home.payment = {
            customerId: customerId,
            sourceId: newSource,
            last4: token.card.last4,
            type: token.card.brand,
            expiration: `${token.card.exp_month}/${token.card.exp_year}`
          };
          home.active = true;
          home.save(cb);
        }
      ], (err, home) => {
        if(err) {
          res.status(500).json({
            title: 'Failed adding payment',
            msg: 'Cannot add payment. Error ' + err.message
          });
        } else {
          req.session.home = home.toObject({depopulate: true, versionKey: false});
          res.status(200).cookie('home', req.session.home).json({home: home});
        }
      });
    } else {
      res.status(ERRORS.MissingRequiredData.code).json(ERRORS.MissingRequiredData);
    }
  });

  router.put('/', authentication.isHomeOwner, function (req, res) {
    var home = req.body.home;

    FuneralHomeModel.findByIdAndUpdate(home._id, home, {new: true}, (err, home) => {
      if (err) {
        util.sendDbError('FuneralHome', 'findByIdAndUpdate', err, res);
      } else {
        req.session.home = home.toObject({depopulate: true, versionKey: false});
        res.status(200).cookie('home', req.session.home).json({home: home});
      }
    });
  });

  router.get('/me', authentication.isSignedIn, function (req, res) {
    if (!req.session.home) {
      res.status(ERRORS.InvalidPermission.en.code).json(ERRORS.InvalidPermission[req.language]);
    } else {
      FuneralHomeModel.findById(req.session.home._id, WHITELISTED_FIELDS_STAFF).populate('availableServices.vendor availableServices.category').lean().exec((err, home) => {
        if(err) {
          util.sendDbError('FuneralHome', 'findById', err, res);
        } else {
          res.status(200).json({home: home});
        }
      });
    }
  });

  router.get('/services', authentication.isSignedIn, function (req, res) {
    var query = {
    };
    if (req.query.q) {
      query.$or = [{
        'name': new RegExp('.*' + req.query.q + '.*', 'i')
      }];
    }
    FuneralHomeModel.aggregate([{
      $match: {_id: mongoose.Types.ObjectId(req.session.home._id)}
    }, {
      $unwind: '$availableServices'
    }, {
      $project: { // Promote the partner to root, instead of being an array of 1
        _id: 1,
        category: '$availableServices.category',
        price: '$availableServices.price',
        name: '$availableServices.name',
        vendor: '$availableServices.vendor'
      }
    }, {
      $match: query
    }, {
      $lookup: {from: 'servicecategories', localField: 'category', foreignField: '_id', as: 'category'}
    }, {
      $lookup: {from: 'vendors', localField: 'vendor', foreignField: '_id', as: 'vendor'}
    }, {
      $project: {
        _id: 1,
        category: { $arrayElemAt: [ '$category', 0 ] },
        vendor: { $arrayElemAt: [ '$vendor', 0 ] },
        name: 1,
        price: 1
      }
    }]).exec((err, services) => {
      if(err) {
        util.sendDbError('Home', 'aggregate', err, res);
      } else {
        let returnServices = services;
        if (req.query.skip && req.query.limit) {
          let skip = parseInt(req.query.skip);
          returnServices = returnServices.slice(skip, skip+parseInt(req.query.limit));
        }
        res.status(200).json({services: returnServices, total: services.length});
      }
    });
  });

  let sendEmailTemplate = (home,email,host) => {
    return new Promise((resolve,reject) => {
      try {
        let data = {
          home: home.name,
          owner: home.owner.name,
          url: `http://${host}/sign-up?email=${email}&funeralHome=${home.name}`
        };
        const msg = {
          to: email,
          from: `${home.name} (Epilog) <no-reply@epilog.me>`,
          templateId: 'd-19f8294003a74c7a8fc2e6480819882a',
          dynamic_template_data: {
            subject: 'Epilog Invitation',
            data : data
          }
        };
        sgMail.send(msg);
        resolve(true);
      } catch(err){
        reject(err);
      }
    });
  };

  let invitationUser = (id,email) => {
    return new Promise((resolve,reject) => {
      try {
        let newInvitation = new invitationModel({
          funeralHome: id,
          email: email
        });
        let invitations = newInvitation.save();
        resolve(invitations);
      } catch(err){
        reject(err);
      }
    });
  };

  return router;
};
