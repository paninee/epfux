var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true, trim: true},
  authStrategy: {
      required: true,
      type: String,
      enum: [
        'epilog',
        'facebook',
        'google',
        'line',
        'phonenumber'
      ],
      trim: true
  },
  authKey: {type: String},
  authToken: {type: String},
  name: {type: String, required: true},
  phoneNo: {type: String, unique: true, sparse: true, trim: true},
  profileImg: {
    thumbnail: {type: String},
    full: {type: String}
  },
  active: {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

userSchema.plugin(passportLocalMongoose, {
  saltlen: 64,
  usernameField: 'email',
  lastLoginField: 'lastSignedInAt',
  hashField: 'passHash',
  saltField: 'passSalt',
  usernameLowerCase: true,
  errorMessages: {
    IncorrectPasswordError: 'The password you’ve entered isn’t correct. To reset please contact us at support@epilog.me',
    IncorrectUsernameError: 'The password you’ve entered isn’t correct. To reset please contact us at support@epilog.me'
  },
  passwordValidator: function(password, cb) {
    if(password.length < 8){
      return cb('Password needs to be at least 8 in length');
    }
    return cb(null);
  }
  // findByUsername: function(model, queryParameters) {
  //   // Add additional query parameter - AND condition - active: true
  //   queryParameters.active = true;
  //   return model.findOne(queryParameters);
  // }
});

userSchema.pre('update', function (next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.update({}, query);
  next();
});

userSchema.pre('findOneAndUpdate', function(next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.findOneAndUpdate({}, query);
  next();
});

userSchema.post('save', function(error, space, next) {
  if (error.code === 11000 && error.errmsg.includes('$email')) {
    next(new Error('This email address already has an account with us.'));
  } else {
    next(error);
  }
});

var userModel = mongoose.model('User', userSchema);

exports.model = userModel;
exports.schema = userSchema;
