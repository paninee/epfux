module.exports = function (express) {
  var router = express.Router();
  var passport = require('passport');
  var io = null; //TODO: ScketIO placeholder

  router.use(passport.initialize());
  router.use(passport.session());

  // Controllers
  var userController = require('../components/user/user-controller')(express, passport, io);
  var funeralHomeController = require('../components/funeral-home/funeral-home-controller')(express, passport, io);
  var vendorController = require('../components/vendor/vendor-controller')(express, passport, io);
  var serviceCategoryController = require('../components/sevice-category/service-category-controller')(express, passport, io);
  var bookingController = require('../components/booking/booking-controller')(express, passport, io);
  var invitationController = require('../components/invitation/invitation-controller')(express,passport,io);

  // Routes
  router.use('/users', userController);
  router.use('/funeralhomes', funeralHomeController);
  router.use('/vendors', vendorController);
  router.use('/servicecategories', serviceCategoryController);
  router.use('/bookings', bookingController);
  router.use('/invitations', invitationController);

  router.get('/envvariables', function (req, res) {
    res.status(200).json({
      STRIPE_API_KEY: process.env.STRIPE_API_KEY,
      STRIPE_CONNECT_CLIENT: process.env.STRIPE_CONNECT_CLIENT,
    });
  });

  return router;
};
