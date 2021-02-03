var mongoose = require('mongoose');
const relationshipDeceased = [
  'Mother',
  'Father',
  'Spouse or common-law partner',
  'Wife',
  'Husband',
  'Daughter',
  'Son',
  'Sister',
  'Brother',
  'Aunt',
  'Uncle',
  'Niece',
  'Nephew',
  'Cousin',
  'Grandmother',
  'Grandfather',
  'Granddaughter',
  'Grandson',
  'Stepsister',
  'Stepbrother',
  'Stepfather',
  'Stepmother',
  'Daughter in-law',
  'Son in-law',
  ''
];

const eventsType = [
  'Reception',
  'Service',
  'Burial',
  'Viewing',
  'Visitation',
  ''
];

var bookingSchema = new mongoose.Schema({
  contractNo: {type: String, required: true},
  home: {type: mongoose.Schema.Types.ObjectId, ref: 'FuneralHome', required: true},
  clientName: {type: String, required: true},
  clientFamilyName:{type: String},
  clientAddress: {
    street: {type: String},
    unitNo: {type: String},
    city: {type: String},
    province: {type: String},
    country: {type: String},
    postalCode: {type: String}
  },
  clientEmail: {type: String, trim: true},
  clientPhoneNo: {type: String, trim: true, sparse: true},
  clientRelationshipDeceased: {type: String},
  serviceStart: {type: Date},
  serviceEnd: {type: Date},
  deceasedName: {type: String, required: true},
  deceasedMiddleName: {type: String},
  deceasedFamilyName: {type: String},
  deceasedGender: {
    type: String,
    enum:[
      'Male',
      'Female',
      'Not specified',
      ''
    ]
  },
  deceasedMaritalStatus: {
      type: String,
      enum: [
        'Married',
        'Single',
        'Divorced',
        'Widowed',
        'Separated',
        'Common law',
        ''
      ]
    },
  deceasedPlaceOfBirth: {type: String},
  deceasedPlaceOfDeath: {type: String,},
  deceasedSocialInsureNo: {type: String},
  deceasedAge: {type: String},
  deceasedEducationLevel: {type: String},
  deceasedOccupation: {type: String},
  deceasedImage: {type: String},
  deceasedAddress: {
    street: {type: String},
    unitNo: {type: String},
    city: {type: String},
    province: {type: String},
    country: {type: String},
    postalCode: {type: String}
  },
  dateOfDeath: {type: String},
  serviceLocation: {type: String},
  eulogy: {type: String},
  services: [{
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory'},
    name: {type: String},
    price: {type: Number, default: 0},
    vendor: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor'},
    additionalInfo: [{
      name: {type: String},
      value: {type: mongoose.Mixed},
    }]
  }],
  payment: {
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
  discountAmount: {type: Number, default: 0},
  discountPercentage: {type: Number, default: 0},
  discountReason: {type: String},
  tax: {type: Number, default: 0},
  subTotal: {type: Number, default: 0},
  total: {type: Number, default: 0},
  paidAmount : {type: Number, default: 0},
  invoiceStatus: {type: String, enum: ['inquiry', 'paid', 'waiting payment', 'partially paid', ''], default: 'inquiry'},
  paymentConfirmation: {type: String},
  familyMembers:[{
    firstName: {type: String},
    familyName: {type: String},
    relationshipDeceased:{type: String,enum: relationshipDeceased},
    city:{type:String}
  }],
  funeralEvents:[{
    eventsType: {
      type: String,
      enum: eventsType
    },
    location:{type:String}
  }],
  employeeAssignments: [{
    employee: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    assignment: {type: String}
  }],
  documents: [{type: String}],
  notes: [{
    note: {type: String},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  }],
  preNeed: {type:Boolean},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

bookingSchema.pre('update', function (next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.update({}, query);
  next();
});

bookingSchema.pre('findOneAndUpdate', function(next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.findOneAndUpdate({}, query);
  next();
});

var bookingModel = mongoose.model('Booking', bookingSchema);

exports.model = bookingModel;
exports.schema = bookingSchema;
exports.schema.relationshipDeceased = relationshipDeceased;
exports.schema.eventsType = eventsType;
