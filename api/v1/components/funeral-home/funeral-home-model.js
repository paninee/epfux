var mongoose = require('mongoose');

var funeralHomeSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  address: {
    street: {type: String},
    unitNo: {type: String},
    city: {type: String},
    province: {type: String},
    country: {type: String},
    postalCode: {type: String}
  },
  phoneNo: {type: String},
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  payment: {
    customerId: {type: String},
    sourceId: {type: String},
    last4: {type: String},
    type: {
      type: String,
      enum: [
        'Visa',
        'MasterCard',
        'American Express',
        'Discover',
        'Diners Club',
        'JCB',
        'UnionPay',
        'Unknown'
      ]
    },
    expiration: {type: String}
  },
  payout: {
    account: {type: String},
    bank: {type: String},
    currency: {type: String},
    name: {type: String},
    last4: {type: String}
  },
  taxPercentage: {type: Number, default: 0},
  availableServices: [{
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory'},
    name: {type: String, required: true},
    price: {type: Number, default: 0},
    vendor: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor'},
  }],
  vehicles: [{
    name: {type: String, required: true},
    price: {type: Number, default: 0}
  }],
  unitOfMeasurement: {
    type: String,
    required: true,
    default: 'km',
    enum: [
      'km',
      'mile'
    ]
  },
  contractNoCount: {type: Number, default: 0},
  subscription: {type: String, enum: ['standard'], default: 'standard'},
  currency: {type: String, enum: ['USD', 'CAD'], required: true, trim: true, default: 'USD'},
  active: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

funeralHomeSchema.pre('update', function (next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.update({}, query);
  next();
});

funeralHomeSchema.pre('findOneAndUpdate', function(next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.findOneAndUpdate({}, query);
  next();
});

var funeralHomeModel = mongoose.model('FuneralHome', funeralHomeSchema);

exports.model = funeralHomeModel;
exports.schema = funeralHomeSchema;
