var mongoose = require('mongoose');

var vendorSchema = new mongoose.Schema({
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FuneralHome'
  },
  name: {type: String, required: true},
  contactName: {type: String, required: true},
  contactPosition: {type: String},
  address: {
    street: {type: String},
    unitNo: {type: String},
    city: {type: String},
    province: {type: String},
    country: {type: String},
    postalCode: {type: String}
  },
  phoneNo: {type: String, trim: true},
  email: {type: String, trim: true},
  website: {type: String, trim: true},
  active: {type: Boolean, default: true},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

vendorSchema.pre('update', function (next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.update({}, query);
  next();
});

vendorSchema.pre('findOneAndUpdate', function(next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.findOneAndUpdate({}, query);
  next();
});

var vendorModel = mongoose.model('Vendor', vendorSchema);

exports.model = vendorModel;
exports.schema = vendorSchema;
