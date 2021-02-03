var _ = require('lodash');

module.exports.isSignedIn = function(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(ERRORS.InvalidPermission.en.code).json(ERRORS.InvalidPermission.en);
  }
};

module.exports.isHomeOwner = function(req, res, next) {
  // if user is authenticated in the session and has enough permission, carry on
  if (req.isAuthenticated() && (req.session.home.owner == req.user.id)) {
    return next();
  } else {
    res.status(ERRORS.InvalidPermission.en.code).json(ERRORS.InvalidPermission.en);
  }
};

module.exports.isHomeStaff = function(req, res, next) {
  // if user is authenticated in the session and has enough permission, carry on
  if (req.isAuthenticated() && (req.session.home.owner == req.user.id ||_.find(req.session.home.staffs, {_id: req.user.id}))) {
    return next();
  } else {
    res.status(ERRORS.InvalidPermission.en.code).json(ERRORS.InvalidPermission.en);
  }
};
