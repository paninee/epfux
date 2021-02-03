module.exports = function (express, passport, io) {
  var router = express.Router();
  var UserModel = require('./user-model').model;
  var FuneralHomeModel = require('../funeral-home/funeral-home-model').model;
  var InvitationModel = require('../invitation/invitation-model').model;
  var authentication = require('../../shared/authentication/authentication');
  var util = require('../../shared/util');
  var async = require('async');
  var randomString = require('randomstring');
  require('../../shared/msg');
  const aws = require('aws-sdk');
  // var multer = require('multer')
  // var multerS3 = require('multer-s3')

  aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
  });

  const s3 = new aws.S3();

  const fileFilter = (req, file, cb) => {
    cb(null, true);
  };

  // const upload = multer({
  //  fileFilter: fileFilter,
  //  storage: multerS3({
  //   acl: 'public-read',
  //   s3,
  //   bucket: process.env.S3_BUCKET,
  //   key: function(req, file, cb) {
  //     /*I'm using Date.now() to make sure my file has a unique name*/
  //     let identifier = req.body.identifier === 'vendor' ? 'vendor' : 'documents';
  //     let path = `assets/${identifier}/${Date.now()}.${file.originalname}`;
  //     cb(null, path);
  //    }
  //   })
  // });

  // Setup Passport
  passport.use(UserModel.createStrategy());
  passport.serializeUser(UserModel.serializeUser());
  passport.deserializeUser(UserModel.deserializeUser());

  // router.post('/upload', upload.array('image', null), function(req, res, next) {
  //   res.send(req.files);
  // });

  router.post('/signin/epilog', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if(!user){
        return res.status(401).json({
          name: 'SIGN_IN_ERROR',
          title: 'Sign In Failure',
          msg: info.message
        });
      }
      req.logIn(user, err => {
        if(err) {
          return util.sendError(ERRORS.SignUpError, req.language, res);
        }
        next();
      });
    })(req, res, next);
  }, function(req, res) {
    FuneralHomeModel.findOne({
      name: req.body.funeralHome,
      $or: [{
        owner: req.user.id
      }, {
        staffs: req.user.id
      }]
    }, (err, home) => {
      if(home) {
        req.session.home = home;
        req.session.currentUserRole = home.owner == req.user.id ? 'owner' : 'staff';
        res.status(200).cookie('home', req.session.home).cookie('currentUserRole', req.session.currentUserRole).json({user: req.user, home: home});
      } else {
        res.status(400).json({
          title: 'No Funeral Home Found',
          msg: 'There’s no account with this email for this funeral home.'
        });
      }
    });
  });

  router.post('/signup/epilog', function (req, res) {
    var user = req.body.user;

    // Prepare user object
    user.authStrategy = 'epilog';
    user.authKey = randomString.generate({length: 64}); // Generate user activation code

    async.waterfall([
      function(cb){
        UserModel.findOne({email: user.email}, (err, existingUser) => {
          if(err || existingUser) {
            return res.status(400).json({
              name: 'DUPLICATE_USER',
              title: 'User existed',
              msg: 'An account with that funeral home already exists. If you\'re new to Epilog, please use a unique name.'
            });
          }
          cb(null);
        });
      },
      function(cb){// Register account
        // If the user put in a home, create and assign them as an owner of that home
        if(user.funeralHome) {
          FuneralHomeModel.findOne({name: user.funeralHome}, (err, existedHome) => {
            if(existedHome){
              return res.status(400).json({
                name: 'DUPLICATE_HOME',
                title: 'Duplicate Funeral Home Name',
                msg: 'You\'ve entered a funeral home that already exists. If you\'re creating a staff account, please leave the funeral home field empty.'
              });
            } else {
              // Register user
              UserModel.register(user, user.password, function (err, registeredUser) {
                if (err) {
                  return util.sendError(ERRORS.SignUpError, req.language, res);
                } else {
                  let home = new FuneralHomeModel({
                    name: user.funeralHome,
                    owner: registeredUser
                  });
                  home.save(err => {
                    cb(err, registeredUser);
                  });
                  InvitationModel.findOne({email: registeredUser.email},(err, results) => {
                    if (results){
                      let data = results;
                      data.active = false;
                      let invitedUsers = data.save();
                    }
                  });
                }
              });
            }
          });
        } else {
          // Register user
          UserModel.register(user, user.password, function (err, registeredUser) {
            if (err) {
              return util.sendError(ERRORS.SignUpError, req.language, res);
            } else {
              cb(null, registeredUser);
            }
          });
        }
      }
    ], function(err){
      if(err){
        util.sendError(ERRORS.SignUpError, req.language, res);
      } else {
        res.status(200).json({});
      }
    });
  });

  router.delete('/signout', authentication.isSignedIn, function (req, res) {
    req.logout();
    req.session.destroy();
    res.clearCookie('home');
    res.clearCookie('currentUserRole');
    res.status(200).json({});
  });

  router.get('/describe', function (req, res) {
    res.json(UserModel.schema.paths);
  });

  router.get('/me', authentication.isSignedIn, function (req, res) {
    if (!req.user) {
      res.status(ERRORS.InvalidPermission.en.code).json(ERRORS.InvalidPermission[req.language]);
    } else {
      req.session.currentUserRole = req.session.home.owner == req.user.id ? 'owner' : 'staff';
      return res.status(200).cookie('home', req.session.home).cookie('currentUserRole', req.session.currentUserRole).json({user: req.user});
    }
  });

  router.put('/addstaff', async (req,res) => {
    let user = await UserModel.findOne({email:req.body.email})
    FuneralHomeModel.findOneAndUpdate({name:req.body.funeralHome}, {
      $addToSet: {
        staffs: user._id
      }
    }, (err, home) => {
      if(err && !home) {
        util.sendDbError('Home', 'save', err, res);
      } else {
        req.session.home = home;
        res.status(200).cookie('home', req.session.home).json({home: home});
      }
    });
  });

  router.put('/', authentication.isSignedIn, function (req, res) {
    var user = req.body.user;
    if (user._id) {
      delete user._id;
    }

    UserModel.findByIdAndUpdate(req.user._id, user, {new: true}, (err, user) => {
      if (err) {
        util.sendDbError('User', 'findByIdAndUpdate', err, res);
      } else {
        res.status(200).json({user: user});
      }
    });
  });

  router.put('/changepassword', authentication.isSignedIn, (req,res) => {
    
    let authenticate = UserModel.authenticate();
    UserModel.findOne({
      authStrategy : 'epilog',
      authKey:req.body.authKey
    }).exec((err, user) => {
      if(user){
        authenticate(user.email, req.body.currentPassword, (err, result) => {
          if (err || !result) {
            return res.status(401).json({
              name: 'INVALID_PASSWORD',
              title: 'Invalid password',
              msg: 'Invalid password'
            });
          } else {
             user.setPassword(req.body.newPassword, (err, userWithNewPass) => {
              userWithNewPass.save((err, savedUser) => {
                if(err) {
                  return util.sendDbError('User', 'setPassword', err, res);
                }
                return res.status(200).json({status:true,msg:'Password changed'});
              });
            });
          }
        });
      } else {
        return util.sendError(ERRORS.UserNotFoundError, req.language, res);
      }
    });
    
  });

  return router;
};
